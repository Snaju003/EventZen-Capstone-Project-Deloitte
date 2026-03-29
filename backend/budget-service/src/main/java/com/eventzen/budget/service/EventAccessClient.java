package com.eventzen.budget.service;

import com.eventzen.budget.model.EventAccessSnapshot;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;

@Component
public class EventAccessClient {

    private static final String SUPPORTED_CONTRACT_VERSION = "v1";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String internalServiceSecret;
    private final String internalCallerName;

    @Value("${event-service.base-url:http://localhost:8080}")
    private String eventServiceBaseUrl;

    public EventAccessClient(
            ObjectMapper objectMapper,
            @Value("${internal-service.secret:}") String internalServiceSecret,
            @Value("${internal-caller.name:budget-service}") String internalCallerName
    ) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.internalServiceSecret = internalServiceSecret == null ? "" : internalServiceSecret.trim();
        this.internalCallerName = internalCallerName == null || internalCallerName.isBlank()
                ? "budget-service"
                : internalCallerName.trim();
    }

    public Optional<EventAccessSnapshot> getEventAccessSnapshot(String eventId) {
        if (eventId == null || eventId.isBlank()) {
            return Optional.empty();
        }

        String encodedEventId = URLEncoder.encode(eventId, StandardCharsets.UTF_8);
        String normalizedBaseUrl = normalizeBaseUrl(eventServiceBaseUrl);
        String endpoint = normalizedBaseUrl + "/events/internal/v1/events/" + encodedEventId + "/access";

        URI uri = URI.create(endpoint);
        String method = "GET";
        String path = uri.getRawPath();
        if (uri.getRawQuery() != null && !uri.getRawQuery().isBlank()) {
            path = path + "?" + uri.getRawQuery();
        }

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(8))
                .GET();

        addInternalSecurityHeaders(requestBuilder, method, path);
        HttpRequest request = requestBuilder.build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 404) {
                return Optional.empty();
            }

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Unable to fetch event access snapshot. HTTP " + response.statusCode());
            }

            EventAccessSnapshot snapshot = objectMapper.readValue(response.body(), EventAccessSnapshot.class);
            if (snapshot.getContractVersion() == null || !SUPPORTED_CONTRACT_VERSION.equalsIgnoreCase(snapshot.getContractVersion())) {
                throw new IllegalStateException("Unsupported event access contract version: " + snapshot.getContractVersion());
            }

            return Optional.of(snapshot);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to fetch event access snapshot", exception);
        }
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "http://localhost:8080";
        }

        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    private void addInternalSecurityHeaders(HttpRequest.Builder requestBuilder, String method, String path) {
        if (internalServiceSecret.isBlank()) {
            return;
        }

        String timestamp = Long.toString(System.currentTimeMillis());
        String signature = createSignature(internalServiceSecret, timestamp, method, path, internalCallerName);

        requestBuilder.header("X-Internal-Secret", internalServiceSecret);
        requestBuilder.header("X-Internal-Timestamp", timestamp);
        requestBuilder.header("X-Internal-Service", internalCallerName);
        requestBuilder.header("X-Internal-Signature", signature);
    }

    private String createSignature(String secret, String timestamp, String method, String path, String service) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal((timestamp + "." + method + "." + path + "." + service).getBytes(StandardCharsets.UTF_8));
            return toHex(digest);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign internal request", exception);
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte current : bytes) {
            builder.append(String.format("%02x", current));
        }
        return builder.toString();
    }
}

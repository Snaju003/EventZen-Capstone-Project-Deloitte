package com.eventzen.eventservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class BookingServiceClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String bookingServiceBaseUrl;
    private final String internalServiceSecret;
    private final String internalCallerName;

    public BookingServiceClient(
            ObjectMapper objectMapper,
            @Value("${booking-service.url:http://booking-service:5000}") String bookingServiceBaseUrl,
            @Value("${internal-service.secret:}") String internalServiceSecret,
            @Value("${internal-caller.name:event-service}") String internalCallerName
    ) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.bookingServiceBaseUrl = trimTrailingSlash(bookingServiceBaseUrl);
        this.internalServiceSecret = internalServiceSecret == null ? "" : internalServiceSecret.trim();
        this.internalCallerName = internalCallerName == null || internalCallerName.isBlank()
                ? "event-service"
                : internalCallerName.trim();
    }

    public int getConfirmedSeatCount(String eventId) {
        String url = bookingServiceBaseUrl + "/bookings/event/" + eventId + "/count";

        URI uri = URI.create(url);
        String method = "GET";
        String path = uri.getRawPath();
        if (uri.getRawQuery() != null && !uri.getRawQuery().isBlank()) {
            path = path + "?" + uri.getRawQuery();
        }

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(uri)
                .header("X-User-Id", "event-service")
                .GET();

        addInternalSecurityHeaders(requestBuilder, method, path);
        HttpRequest request = requestBuilder.build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("booking-service responded with status " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            return root.path("confirmedSeats").asInt(0);
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }

            log.warn("Failed to fetch confirmed seats from booking-service for event {}", eventId, exception);
            throw new IllegalStateException("Unable to verify existing bookings for this event");
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://booking-service:5000";
        }

        if (value.endsWith("/")) {
            return value.substring(0, value.length() - 1);
        }

        return value;
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

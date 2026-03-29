package com.eventzen.budget.service;

import com.eventzen.budget.model.EventAccessSnapshot;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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

    @Value("${event-service.base-url:http://localhost:8080}")
    private String eventServiceBaseUrl;

    public EventAccessClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public Optional<EventAccessSnapshot> getEventAccessSnapshot(String eventId) {
        if (eventId == null || eventId.isBlank()) {
            return Optional.empty();
        }

        String encodedEventId = URLEncoder.encode(eventId, StandardCharsets.UTF_8);
        String normalizedBaseUrl = normalizeBaseUrl(eventServiceBaseUrl);
        String endpoint = normalizedBaseUrl + "/events/internal/v1/events/" + encodedEventId + "/access";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(8))
                .GET()
                .build();

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
}

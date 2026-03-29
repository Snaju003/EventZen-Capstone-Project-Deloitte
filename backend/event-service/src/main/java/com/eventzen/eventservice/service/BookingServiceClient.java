package com.eventzen.eventservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
@Slf4j
public class BookingServiceClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String bookingServiceBaseUrl;

    public BookingServiceClient(
            ObjectMapper objectMapper,
            @Value("${booking-service.url:http://booking-service:5000}") String bookingServiceBaseUrl
    ) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
        this.bookingServiceBaseUrl = trimTrailingSlash(bookingServiceBaseUrl);
    }

    public int getConfirmedSeatCount(String eventId) {
        String url = bookingServiceBaseUrl + "/bookings/event/" + eventId + "/count";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("X-User-Id", "event-service")
                .GET()
                .build();

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
}

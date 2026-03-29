package com.eventzen.eventservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GroqService {

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    private static final String EVENT_SYSTEM_PROMPT = """
            You are an expert event copywriter for EventZen, a premium event management platform.
            Given an event title, generate a compelling, professional event description.

            Rules:
            - Write a single paragraph (total 50-60 words).
            - Start with a hook that captures attention and conveys the event's purpose.
            - Include what attendees can expect: key activities, networking opportunities, and takeaways.
            - End with an encouraging call-to-action sentence.
            - Use a warm, professional, and inviting tone.
            - Do NOT use markdown formatting, bullet points, or headings.
            - Do NOT include placeholder names, dates, or venue details.
            - Output ONLY the description text, nothing else.
            """;

    private static final String VENUE_SYSTEM_PROMPT = """
            You are an expert venue copywriter for EventZen, a premium event management platform.
            Given a venue name, generate a compelling, professional venue description.

            Rules:
            - Write a single paragraph (total 50-60 words).
            - Highlight the venue's atmosphere, unique features, and suitability for events.
            - Mention the type of events the venue is ideal for (conferences, weddings, concerts, etc.).
            - Use a warm, professional, and inviting tone.
            - Do NOT use markdown formatting, bullet points, or headings.
            - Do NOT include placeholder capacity numbers, addresses, or pricing.
            - Output ONLY the description text, nothing else.
            """;

    @Value("${groq.api-key}")
    private String apiKey;

    @Value("${groq.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateDescription(String eventTitle) {
        return callGroq(EVENT_SYSTEM_PROMPT, "Event title: " + eventTitle);
    }

    public String generateVenueDescription(String venueName) {
        return callGroq(VENUE_SYSTEM_PROMPT, "Venue name: " + venueName);
    }

    private String callGroq(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)),
                "temperature", 0.7,
                "max_tokens", 512);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    GROQ_API_URL,
                    HttpMethod.POST,
                    entity,
                    Map.class);

            Map body = response.getBody();
            if (body == null) {
                throw new RuntimeException("Empty response from Groq API");
            }

            List<Map> choices = (List<Map>) body.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No choices returned from Groq API");
            }

            Map message = (Map) choices.get(0).get("message");
            return ((String) message.get("content")).trim();

        } catch (Exception e) {
            log.error("Failed to generate description via Groq: {}", e.getMessage(), e);
            throw new RuntimeException("AI description generation failed: " + e.getMessage());
        }
    }
}


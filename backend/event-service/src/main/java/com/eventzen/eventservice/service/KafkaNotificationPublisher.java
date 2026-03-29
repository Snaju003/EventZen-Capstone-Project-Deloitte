package com.eventzen.eventservice.service;

import com.eventzen.eventservice.model.NotificationEventMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaNotificationPublisher {

    private final KafkaTemplate<String, NotificationEventMessage> kafkaTemplate;

    public void publish(String eventType, Map<String, Object> payload) {
        NotificationEventMessage message = NotificationEventMessage.builder()
                .eventType(eventType)
                .timestamp(Instant.now())
                .payload(payload)
                .build();

        try {
            kafkaTemplate.send(eventType, message);
        } catch (Exception exception) {
            log.warn("Kafka unavailable for event-service. Skipping notification {}", eventType, exception);
        }
    }
}

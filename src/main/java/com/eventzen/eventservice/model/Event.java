package com.eventzen.eventservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String id;

    @Indexed
    private String venueId;

    private String createdBy;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double ticketPrice;
    private Integer maxAttendees;
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Indexed
    private String status; // draft | rejected | published | cancelled

    private String approvedBy;
    private LocalDateTime approvedAt;
    private String approvedVendorId;
    private String approvedVendorUserId;

    private String rejectedBy;
    private LocalDateTime rejectedAt;
    private String rejectionReason;

    // Embedded documents
    private Budget budget;

    @Builder.Default
    private List<EventVendor> vendors = new ArrayList<>();

    @Transient
    private Venue venue;
}

package com.eventzen.eventservice.repository;

import com.eventzen.eventservice.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findByStatus(String status);

    List<Event> findByVenueId(String venueId);

    List<Event> findByCreatedBy(String createdBy);

    @Query(
            value = "{ 'venueId': ?0, 'status': 'published', 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }",
            exists = true
    )
    boolean existsPublishedVenueScheduleConflict(String venueId, LocalDateTime proposedStart, LocalDateTime proposedEnd);

    @Query(
            value = "{ 'venueId': ?0, 'status': 'published', 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 }, '_id': { $ne: ?3 } }",
            exists = true
    )
    boolean existsPublishedVenueScheduleConflictExcludingEvent(
            String venueId,
            LocalDateTime proposedStart,
            LocalDateTime proposedEnd,
            String excludedEventId
    );

    @Query(
            value = "{ 'createdBy': ?0, 'venueId': ?1, 'status': { $ne: 'cancelled' }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }",
            exists = true
    )
    boolean existsVendorVenueScheduleConflict(
            String createdBy,
            String venueId,
            LocalDateTime proposedStart,
            LocalDateTime proposedEnd
    );

    @Query(
            value = "{ 'createdBy': ?0, 'venueId': ?1, 'status': { $ne: 'cancelled' }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 }, '_id': { $ne: ?4 } }",
            exists = true
    )
    boolean existsVendorVenueScheduleConflictExcludingEvent(
            String createdBy,
            String venueId,
            LocalDateTime proposedStart,
            LocalDateTime proposedEnd,
            String excludedEventId
    );
}

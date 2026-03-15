package com.eventzen.eventservice.repository;

import com.eventzen.eventservice.model.Venue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueRepository extends MongoRepository<Venue, String> {
}

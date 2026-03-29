package com.eventzen.eventservice.repository;

import com.eventzen.eventservice.model.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends MongoRepository<Vendor, String> {

    List<Vendor> findByServiceType(String serviceType);

    Optional<Vendor> findByUserId(String userId);
}

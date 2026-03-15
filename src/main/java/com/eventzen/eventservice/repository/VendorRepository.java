package com.eventzen.eventservice.repository;

import com.eventzen.eventservice.model.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorRepository extends MongoRepository<Vendor, String> {

    List<Vendor> findByServiceType(String serviceType);
}

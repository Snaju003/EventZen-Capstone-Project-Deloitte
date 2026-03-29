package com.eventzen.eventservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.eventzen.eventservice.repository")
public class MongoConfig {
    // MongoDB connection is configured via application.yml (MONGO_URI env variable)
    // Add custom converters or auditing beans here if needed
}

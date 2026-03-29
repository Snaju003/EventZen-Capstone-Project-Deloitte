package com.eventzen.budget.repository;

import com.eventzen.budget.model.EventBudget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventBudgetRepository extends MongoRepository<EventBudget, String> {
}

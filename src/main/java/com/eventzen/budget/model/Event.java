package com.eventzen.budget.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("EVENTS")
public class Event {

    @Id
    private String id;

    private Budget budget;

    public Event() {
    }

    public Event(String id, Budget budget) {
        this.id = id;
        this.budget = budget;
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Budget getBudget() {
        return budget;
    }

    public void setBudget(Budget budget) {
        this.budget = budget;
    }

    public static final class Builder {
        private String id;
        private Budget budget;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder budget(Budget budget) {
            this.budget = budget;
            return this;
        }

        public Event build() {
            return new Event(id, budget);
        }
    }
}

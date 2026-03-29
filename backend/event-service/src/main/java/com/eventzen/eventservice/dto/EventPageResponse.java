package com.eventzen.eventservice.dto;

import com.eventzen.eventservice.model.Event;

import java.util.ArrayList;
import java.util.List;

public class EventPageResponse {

    private List<Event> items = new ArrayList<>();
    private int page;
    private int size;
    private long total;
    private int totalPages;
    private boolean hasNext;

    public EventPageResponse() {
    }

    public EventPageResponse(List<Event> items, int page, int size, long total, int totalPages, boolean hasNext) {
        this.items = items != null ? items : new ArrayList<>();
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = totalPages;
        this.hasNext = hasNext;
    }

    public List<Event> getItems() {
        return items;
    }

    public void setItems(List<Event> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }
}

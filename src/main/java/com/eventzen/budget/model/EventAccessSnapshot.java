package com.eventzen.budget.model;

public class EventAccessSnapshot {

    private String contractVersion;
    private String eventId;
    private String createdBy;
    private String approvedVendorUserId;

    public EventAccessSnapshot() {
    }

    public String getContractVersion() {
        return contractVersion;
    }

    public void setContractVersion(String contractVersion) {
        this.contractVersion = contractVersion;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getApprovedVendorUserId() {
        return approvedVendorUserId;
    }

    public void setApprovedVendorUserId(String approvedVendorUserId) {
        this.approvedVendorUserId = approvedVendorUserId;
    }
}

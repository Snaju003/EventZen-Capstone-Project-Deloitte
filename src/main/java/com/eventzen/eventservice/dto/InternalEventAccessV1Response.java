package com.eventzen.eventservice.dto;

public class InternalEventAccessV1Response {

    private String contractVersion;
    private String eventId;
    private String createdBy;
    private String approvedVendorUserId;

    public InternalEventAccessV1Response() {
    }

    public InternalEventAccessV1Response(String contractVersion, String eventId, String createdBy, String approvedVendorUserId) {
        this.contractVersion = contractVersion;
        this.eventId = eventId;
        this.createdBy = createdBy;
        this.approvedVendorUserId = approvedVendorUserId;
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

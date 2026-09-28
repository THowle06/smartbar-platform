package com.tylerhowle.smartbar_backend.dto;

import java.time.Instant;

public record AppointmentResponse(
        String id,
        String bookingId,
        String studentName,
        String studentId,
        String type,
        String status,
        Instant time,
        String deviceSummary,
        String storageLocation,
        boolean canCollect) {
}

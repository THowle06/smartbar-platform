package com.tylerhowle.smartbar_backend.dto;

public record RepairIntakeRequest(
        String psuSn,
        String visualInspection,
        String faultDescription,
        Long version) {
}

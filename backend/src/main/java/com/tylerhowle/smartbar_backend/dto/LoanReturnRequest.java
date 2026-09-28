package com.tylerhowle.smartbar_backend.dto;

import java.util.List;

public record LoanReturnRequest(
        boolean screenOk,
        boolean deviceTurnsOn,
        boolean casingIntact,
        List<String> missingItems,
        Long version) {
}

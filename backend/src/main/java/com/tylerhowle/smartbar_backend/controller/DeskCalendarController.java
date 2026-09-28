package com.tylerhowle.smartbar_backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tylerhowle.smartbar_backend.domain.RepairTicket;
import com.tylerhowle.smartbar_backend.dto.AppointmentResponse;
import com.tylerhowle.smartbar_backend.dto.RepairIntakeRequest;
import com.tylerhowle.smartbar_backend.service.DeskService;

import tools.jackson.databind.cfg.DateTimeFeature;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/desk")
public class DeskCalendarController {
    private final DeskService deskService;

    public DeskCalendarController(DeskService deskService) {
        this.deskService = deskService;
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(deskService.getAppointmentsForDate(queryDate));
    }

    @PostMapping("/repairs/{id}/intake")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<RepairTicket> intakeDevice(
            @PathVariable UUID id,
            @RequestBody RepairIntakeRequest request) {
        return ResponseEntity.ok(deskService.processIntake(id, request));
    }

    @PostMapping("/repairs/{id}/collect")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<RepairTicket> collectDevice(@PathVariable UUID id) {
        return ResponseEntity.ok(deskService.completeCollection(id));
    }
}

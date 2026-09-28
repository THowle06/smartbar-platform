package com.tylerhowle.smartbar_backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.tylerhowle.smartbar_backend.domain.Loan;
import com.tylerhowle.smartbar_backend.dto.LoanCheckoutRequest;
import com.tylerhowle.smartbar_backend.dto.LoanExtensionRequest;
import com.tylerhowle.smartbar_backend.dto.LoanReturnRequest;
import com.tylerhowle.smartbar_backend.service.LoanService;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<Loan>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Loan> checkoutLoan(@PathVariable UUID id, @RequestBody LoanCheckoutRequest req) {
        return ResponseEntity.ok(loanService.checkoutLoan(id, req));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Loan> returnLoan(@PathVariable UUID id, @RequestBody LoanReturnRequest req) {
        return ResponseEntity.ok(loanService.returnLoan(id, req));
    }

    @PostMapping("/{id}/extend")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Loan> extendLoan(@PathVariable UUID id, @RequestBody LoanExtensionRequest req) {
        return ResponseEntity.ok(loanService.extendLoan(id, req));
    }
}

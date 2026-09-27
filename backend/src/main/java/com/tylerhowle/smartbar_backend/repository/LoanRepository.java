package com.tylerhowle.smartbar_backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tylerhowle.smartbar_backend.domain.Loan;
import com.tylerhowle.smartbar_backend.domain.LoanStatus;

public interface LoanRepository extends JpaRepository<Loan, UUID> {
    List<Loan> findByStatus(LoanStatus status);
}

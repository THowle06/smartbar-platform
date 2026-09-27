package com.tylerhowle.smartbar_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tylerhowle.smartbar_backend.domain.RepairStatus;
import com.tylerhowle.smartbar_backend.domain.RepairTicket;

public interface RepairTicketRepository extends JpaRepository<RepairTicket, UUID> {
    Optional<RepairTicket> findByBookingId(String bookingId);

    List<RepairTicket> findByStatus(RepairStatus status);
}

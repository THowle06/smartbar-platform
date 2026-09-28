package com.tylerhowle.smartbar_backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tylerhowle.smartbar_backend.domain.LoanStatus;
import com.tylerhowle.smartbar_backend.domain.PaymentStatus;
import com.tylerhowle.smartbar_backend.domain.RepairStatus;
import com.tylerhowle.smartbar_backend.domain.RepairTicket;
import com.tylerhowle.smartbar_backend.dto.AppointmentResponse;
import com.tylerhowle.smartbar_backend.dto.RepairIntakeRequest;
import com.tylerhowle.smartbar_backend.repository.LoanRepository;
import com.tylerhowle.smartbar_backend.repository.RepairTicketRepository;

@Service
public class DeskService {
    private final RepairTicketRepository repairRepository;
    private final LoanRepository loanRepository;

    public DeskService(RepairTicketRepository repairRepository, LoanRepository loanRepository) {
        this.repairRepository = repairRepository;
        this.loanRepository = loanRepository;
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsForDate(LocalDate date) {
        List<AppointmentResponse> list = new ArrayList<>();

        repairRepository.findAll().forEach(repair -> {
            if (repair.getAppointmentTime() != null) {
                LocalDate apptDate = repair.getAppointmentTime().atZone(ZoneId.systemDefault()).toLocalDate();
                if (apptDate.isEqual(date)) {
                    boolean isDrop = repair.getStatus() == RepairStatus.NEW_PENDING;
                    boolean canCollect = repair.getPaymentStatus() == PaymentStatus.PAID
                            || repair.getPaymentStatus() == PaymentStatus.FREE;

                    list.add(new AppointmentResponse(
                            repair.getId().toString(),
                            repair.getBookingId(),
                            repair.getStudent().getFullName(),
                            repair.getStudent().getStudentId(),
                            isDrop ? "DROP_REPAIR" : "COLLECT_REPAIR",
                            repair.getStatus().name(),
                            repair.getAppointmentTime(),
                            repair.getDeviceMake() + " " + repair.getDeviceModel(),
                            canCollect ? repair.getStorageLocation() : "LOCKED (PAYMENT REQUIRED)",
                            canCollect));
                }
            }
        });

        loanRepository.findByStatus(LoanStatus.PENDING_COLLECTION).forEach(loan -> {
            list.add(new AppointmentResponse(
                    loan.getId().toString(),
                    loan.getAsset() != null ? loan.getAsset().getAssetTag() : "UNASSIGNED",
                    loan.getStudent().getFullName(),
                    loan.getStudent().getStudentId(),
                    "LOAN_COLLECTION",
                    loan.getStatus().name(),
                    loan.getLoanDate() != null ? loan.getLoanDate() : Instant.now(),
                    loan.getAsset() != null ? loan.getAsset().getModel() : "Pending Device Assignment",
                    loan.getAsset() != null ? loan.getAsset().getStorageLocation() : "N/A",
                    true));
        });

        return list;
    }

    @Transactional
    public RepairTicket processIntake(UUID id, RepairIntakeRequest req) {
        RepairTicket repair = repairRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Repair ticket not found"));

        repair.setPsuSn(req.psuSn());
        repair.setVisualInspection(req.visualInspection());
        if (req.faultDescription() != null && !req.faultDescription().isBlank()) {
            repair.setFaultDescription(req.faultDescription());
        }
        repair.setStatus(RepairStatus.ARRIVED);

        return repairRepository.save(repair);
    }

    @Transactional
    public RepairTicket completeCollection(UUID id) {
        RepairTicket repair = repairRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Repair ticket not found"));

        if (repair.getPaymentStatus() == PaymentStatus.PENDING) {
            throw new IllegalStateException("Device cannot be released until repair payment is completed.");
        }

        repair.setStatus(RepairStatus.ARCHIVED);
        return repairRepository.save(repair);
    }
}

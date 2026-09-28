package com.tylerhowle.smartbar_backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tylerhowle.smartbar_backend.domain.AssetStatus;
import com.tylerhowle.smartbar_backend.domain.Loan;
import com.tylerhowle.smartbar_backend.domain.LoanAsset;
import com.tylerhowle.smartbar_backend.domain.LoanStatus;
import com.tylerhowle.smartbar_backend.dto.LoanCheckoutRequest;
import com.tylerhowle.smartbar_backend.dto.LoanExtensionRequest;
import com.tylerhowle.smartbar_backend.dto.LoanReturnRequest;
import com.tylerhowle.smartbar_backend.repository.LoanAssetRepository;
import com.tylerhowle.smartbar_backend.repository.LoanRepository;

@Service
public class LoanService {
    private final LoanRepository loanRepository;
    private final LoanAssetRepository assetRepository;

    public LoanService(LoanRepository loanRepository, LoanAssetRepository assetRepository) {
        this.loanRepository = loanRepository;
        this.assetRepository = assetRepository;
    }

    @Transactional(readOnly = true)
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    @Transactional
    public Loan checkoutLoan(UUID loanId, LoanCheckoutRequest req) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalArgumentException("Loan record not found"));

        if (loan.getStatus() != LoanStatus.PENDING_COLLECTION) {
            throw new IllegalStateException("Loan is not in a collectable state");
        }

        Instant coolingOffCutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        boolean inCoolingOff = loanRepository.findAll().stream()
                .filter(l -> l.getStudent().getId().equals(loan.getStudent().getId()))
                .filter(l -> l.getStatus() == LoanStatus.RETURNED && l.getActualReturnDate() != null)
                .anyMatch(l -> l.getActualReturnDate().isAfter(coolingOffCutoff));

        if (inCoolingOff) {
            throw new IllegalStateException("Student is within the mandatory 7-day cooling-off period");
        }

        LoanAsset asset = assetRepository.findByAssetTag(req.assetTag())
                .orElseThrow(() -> new IllegalArgumentException("Asset tag not found in fleet"));

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new IllegalStateException("Asset is currently " + asset.getStatus() + " and cannot be loaned");
        }

        loan.setAsset(asset);
        loan.setLoanDate(Instant.now());
        loan.setDueDate(Instant.now().plus(30, ChronoUnit.DAYS));
        loan.setStatus(LoanStatus.ACTIVE);

        asset.setStatus(AssetStatus.LOANED);
        assetRepository.save(asset);

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan returnLoan(UUID loanId, LoanReturnRequest req) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalArgumentException("Loan record not found"));

        if (loan.getStatus() != LoanStatus.ACTIVE && loan.getStatus() != LoanStatus.OVERDUE) {
            throw new IllegalStateException("Only active or overdue loans can be returned");
        }

        loan.setActualReturnDate(Instant.now());
        loan.setStatus(LoanStatus.RETURNED);

        String conditionLog = String.format("Screen OK: %s | Powers On: %s | Casing OK: %s | Missing %s",
                req.screenOk(), req.deviceTurnsOn(), req.casingIntact(),
                req.missingItems() != null ? String.join(", ", req.missingItems()) : "None");

        loan.setReturnCondition(conditionLog);

        LoanAsset asset = loan.getAsset();
        if (asset != null) {
            if (!req.screenOk() || !req.casingIntact() || !req.deviceTurnsOn()) {
                asset.setStatus(AssetStatus.DAMAGED);
            } else {
                asset.setStatus(AssetStatus.NEEDS_WIPE);
            }
            assetRepository.save(asset);
        }

        return loanRepository.save(loan);
    }

    @Transactional
    public Loan extendLoan(UUID loanId, LoanExtensionRequest req) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new IllegalArgumentException("Loan record not found"));

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new IllegalStateException("Only active loans can be extended");
        }

        if (loan.getExtensionDays() + req.additionalDays() > 120) {
            throw new IllegalArgumentException("Total cumulative extension cannot exceed 120 days");
        }

        loan.setExtensionDays(loan.getExtensionDays() + req.additionalDays());
        loan.setDueDate(loan.getDueDate().plus(req.additionalDays(), ChronoUnit.DAYS));

        return loanRepository.save(loan);
    }
}

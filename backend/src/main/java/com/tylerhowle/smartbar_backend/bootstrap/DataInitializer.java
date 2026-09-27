package com.tylerhowle.smartbar_backend.bootstrap;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.tylerhowle.smartbar_backend.domain.Loan;
import com.tylerhowle.smartbar_backend.domain.LoanAsset;
import com.tylerhowle.smartbar_backend.domain.LoanStatus;
import com.tylerhowle.smartbar_backend.domain.PaymentStatus;
import com.tylerhowle.smartbar_backend.domain.RepairStatus;
import com.tylerhowle.smartbar_backend.domain.RepairTicket;
import com.tylerhowle.smartbar_backend.domain.Role;
import com.tylerhowle.smartbar_backend.domain.User;
import com.tylerhowle.smartbar_backend.repository.LoanAssetRepository;
import com.tylerhowle.smartbar_backend.repository.LoanRepository;
import com.tylerhowle.smartbar_backend.repository.RepairTicketRepository;
import com.tylerhowle.smartbar_backend.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final LoanAssetRepository loanAssetRepository;
    private final LoanRepository loanRepository;
    private final RepairTicketRepository repairTicketRepository;

    public DataInitializer(UserRepository userRepository, LoanAssetRepository loanAssetRepository,
            LoanRepository loanRepository, RepairTicketRepository repairTicketRepository) {
        this.userRepository = userRepository;
        this.loanAssetRepository = loanAssetRepository;
        this.loanRepository = loanRepository;
        this.repairTicketRepository = repairTicketRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        User student1 = userRepository.save(new User("20240901", "o.orji@uni.ac.uk", "Oliver Orji", Role.STUDENT));
        User student2 = userRepository.save(new User("20240902", "z.huang@uni.ac.uk", "Zihang Huang", Role.STUDENT));
        User student3 = userRepository
                .save(new User("20240903", "r.dodsworth@uni.ac.uk", "Regan Dodsworth", Role.STUDENT));
        userRepository.save(new User(null, "receptionist@uni.ac.uk", "Zoe Yates", Role.RECEPTIONIST));
        userRepository.save(new User(null, "technician@uni.ac.uk", "Zoedberg Gates", Role.TECHNICIAN));

        LoanAsset laptop1 = loanAssetRepository.save(new LoanAsset("X13-083", "ThinkPad X13", "Big Tambour"));
        LoanAsset laptop2 = loanAssetRepository.save(new LoanAsset("X13-275", "ThinkPad X13", "Big Tambour"));
        LoanAsset laptop3 = loanAssetRepository.save(new LoanAsset("H430-100", "HP ProBook", "Overflow"));

        Loan activeLoan = new Loan(student3, laptop3, Instant.now().minus(10, ChronoUnit.DAYS),
                Instant.now().plus(20, ChronoUnit.DAYS));
        activeLoan.setStatus(LoanStatus.ACTIVE);
        loanRepository.save(activeLoan);

        Loan pendingLoan = new Loan();
        pendingLoan.setStudent(student1);
        pendingLoan.setAsset(laptop1);
        pendingLoan.setStatus(LoanStatus.PENDING_COLLECTION);
        loanRepository.save(pendingLoan);

        RepairTicket repair1 = new RepairTicket();
        repair1.setBookingId("202409003");
        repair1.setStudent(student1);
        repair1.setDeviceMake("HP");
        repair1.setDeviceModel("HP Spectre x360");
        repair1.setDeviceSn("5CD1234XYZ");
        repair1.setPsuSn("WAA12345");
        repair1.setFaultDescription("Fan malfunctioned, shuts down after boot warning!");
        repair1.setStatus(RepairStatus.NEW_PENDING);
        repair1.setPaymentStatus(PaymentStatus.FREE);
        repair1.setAppointmentTime(Instant.now());
        repairTicketRepository.save(repair1);

        RepairTicket repair2 = new RepairTicket();
        repair2.setBookingId("202409014");
        repair2.setStudent(student2);
        repair2.setDeviceMake("Acer");
        repair2.setDeviceModel("Aspire 5");
        repair2.setDeviceSn("NXA12345");
        repair2.setFaultDescription("LED screen damaged with vertical white lines");
        repair2.setStatus(RepairStatus.IN_REPAIR);
        repair2.setQuoteAmount(new BigDecimal("65.00"));
        repair2.setPaymentStatus(PaymentStatus.PENDING);
        repair2.setAppointmentTime(Instant.now().plus(1, ChronoUnit.HOURS));
        repairTicketRepository.save(repair2);

        System.out.println(">>> Demo data successfully seeded for Smart Bar platform.");
    }
}

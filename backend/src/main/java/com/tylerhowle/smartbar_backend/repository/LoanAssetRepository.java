package com.tylerhowle.smartbar_backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tylerhowle.smartbar_backend.domain.LoanAsset;

public interface LoanAssetRepository extends JpaRepository<LoanAsset, UUID> {
    Optional<LoanAsset> findByAssetTag(String assetTag);
}

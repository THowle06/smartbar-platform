package com.tylerhowle.smartbar_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tylerhowle.smartbar_backend.domain.Role;
import com.tylerhowle.smartbar_backend.domain.User;
import com.tylerhowle.smartbar_backend.repository.UserRepository;
import com.tylerhowle.smartbar_backend.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    /**
     * Simulated Institutional SSO without requiring actual Azure AD tenant
     * configurations.
     * Allows frontend to login immediately by role.
     */
    @PostMapping("/mock-sso")
    public ResponseEntity<?> mockLogin(@RequestParam Role role) {
        User user = userRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No seeded user found for role: " + role));

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole(),
                "name", user.getFullName(),
                "email", user.getEmail(),
                "studentId", user.getStudentId() != null ? user.getStudentId() : ""));
    }
}

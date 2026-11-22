package com.placementgpt.controller;

import com.placementgpt.dto.JwtResponse;
import com.placementgpt.dto.LoginRequest;
import com.placementgpt.dto.SignupRequest;
import com.placementgpt.dto.TokenRefreshRequest;
import com.placementgpt.dto.TokenRefreshResponse;
import com.placementgpt.model.Profile;
import com.placementgpt.model.RefreshToken;
import com.placementgpt.model.User;
import com.placementgpt.repository.ProfileRepository;
import com.placementgpt.repository.UserRepository;
import com.placementgpt.security.JwtUtils;
import com.placementgpt.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.debug("Attempting authentication for user: {}", loginRequest.getEmail());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            org.springframework.security.core.userdetails.User userDetails =
                    (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

            Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                List<String> roles = userDetails.getAuthorities().stream()
                        .map(item -> item.getAuthority())
                        .collect(Collectors.toList());

                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

                logger.info("User {} logged in successfully", user.getEmail());
                return ResponseEntity.ok(new JwtResponse(jwt, refreshToken.getToken(), user.getId(), user.getEmail(), roles, true));
            } else {
                logger.error("User not found in DB after authentication: {}", userDetails.getUsername());
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "User record missing"));
            }
        } catch (Exception e) {
            logger.warn("Authentication failed for {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Invalid credentials."));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        logger.info("Registration request for email: {}", signUpRequest.getEmail());
        try {
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                logger.warn("Email already in use: {}", signUpRequest.getEmail());
                return ResponseEntity.badRequest().body(Map.of("error", "Bad Request", "message", "Email is already in use!"));
            }

            // Create new user account
            Set<String> roles = new HashSet<>();
            roles.add("ROLE_USER");

            User user = User.builder()
                    .email(signUpRequest.getEmail())
                    .password(encoder.encode(signUpRequest.getPassword()))
                    .roles(roles)
                    .build();

            User savedUser = userRepository.save(user);

            // Create initial profile
            Profile profile = Profile.builder()
                    .user(savedUser)
                    .fullName(signUpRequest.getFullName())
                    .build();

            profileRepository.save(profile);

            // Generate token
            org.springframework.security.core.userdetails.User principal = new org.springframework.security.core.userdetails.User(
                    savedUser.getEmail(),
                    savedUser.getPassword(),
                    roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()));

            Authentication dummyAuth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            String jwt = jwtUtils.generateJwtToken(dummyAuth);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

            List<String> rolesList = new ArrayList<>(roles);

            logger.info("User registered and logged in: {}", savedUser.getEmail());
            return ResponseEntity.ok(new JwtResponse(jwt, refreshToken.getToken(), savedUser.getId(), savedUser.getEmail(), rolesList, true));
        } catch (Exception e) {
            logger.error("FATAL ERROR during registration for {}: {}", signUpRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error", "message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getEmail());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseGet(() -> ResponseEntity.status(403)
                        .body((TokenRefreshResponse) null));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                refreshTokenService.deleteByUserId(user.getId());
            });
            SecurityContextHolder.clearContext();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Not authenticated"));
        }
        Optional<User> userOpt = userRepository.findByEmail(auth.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Not Found", "message", "User not found"));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "roles", user.getRoles()
        ));
    }
}

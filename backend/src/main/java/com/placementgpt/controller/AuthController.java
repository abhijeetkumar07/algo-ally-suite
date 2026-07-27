package com.placementgpt.controller;

import com.placementgpt.dto.JwtResponse;
import com.placementgpt.dto.LoginRequest;
import com.placementgpt.dto.SignupRequest;
import com.placementgpt.model.Profile;
import com.placementgpt.model.User;
import com.placementgpt.repository.ProfileRepository;
import com.placementgpt.repository.UserRepository;
import com.placementgpt.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
        private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        ProfileRepository profileRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                try {
                        logger.debug("Attempting authentication for user: {}", loginRequest.getEmail());
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),
                                                        loginRequest.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        String jwt = jwtUtils.generateJwtToken(authentication);

                        org.springframework.security.core.userdetails.User userDetails = (org.springframework.security.core.userdetails.User) authentication
                                        .getPrincipal();

                        Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
                        if (userOpt.isPresent()) {
                                User user = userOpt.get();
                                List<String> roles = userDetails.getAuthorities().stream()
                                                .map(item -> item.getAuthority())
                                                .collect(Collectors.toList());
                                logger.info("User {} logged in successfully", user.getEmail());
                                return ResponseEntity
                                                .ok(new JwtResponse(jwt, user.getId(), user.getEmail(), roles, true));
                        } else {
                                logger.error("User not found in DB after authentication: {}",
                                                userDetails.getUsername());
                                return ResponseEntity.status(401).body("Error: User record missing");
                        }
                } catch (Exception e) {
                        logger.warn("Authentication failed for {}: {}", loginRequest.getEmail(), e.getMessage());
                        return ResponseEntity.status(401)
                                        .body("Error: Authentication failed. Please check your credentials.");
                }
        }

        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
                logger.info("Registration request for email: {}", signUpRequest.getEmail());
                try {
                        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                                logger.warn("Email already in use: {}", signUpRequest.getEmail());
                                return ResponseEntity.badRequest().body("Error: Email is already in use!");
                        }

                        // Create new user's account
                        Set<String> roles = new HashSet<>();
                        roles.add("ROLE_USER");

                        User user = User.builder()
                                        .email(signUpRequest.getEmail())
                                        .password(encoder.encode(signUpRequest.getPassword()))
                                        .roles(roles)
                                        .build();

                        logger.debug("Saving user record...");
                        User savedUser = userRepository.save(user);

                        // Create initial profile
                        Profile profile = Profile.builder()
                                        .user(savedUser)
                                        .fullName(signUpRequest.getFullName())
                                        .build();

                        logger.debug("Saving profile record...");
                        profileRepository.save(profile);

                        // Manually generate token to avoid re-auth trip which might hit
                        // race/transaction issues
                        logger.debug("Generating token for new user...");

                        // Create UserDetails for token generation
                        org.springframework.security.core.userdetails.User principal = new org.springframework.security.core.userdetails.User(
                                        savedUser.getEmail(),
                                        savedUser.getPassword(),
                                        roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()));

                        Authentication dummyAuth = new UsernamePasswordAuthenticationToken(principal, null,
                                        principal.getAuthorities());
                        String jwt = jwtUtils.generateJwtToken(dummyAuth);

                        List<String> rolesList = roles.stream().collect(Collectors.toList());

                        logger.info("User registered and logged in: {}", savedUser.getEmail());
                        return ResponseEntity.ok(
                                        new JwtResponse(jwt, savedUser.getId(), savedUser.getEmail(), rolesList, true));
                } catch (Exception e) {
                        logger.error("FATAL ERROR during registration for {}: {}. Stacktrace: ",
                                        signUpRequest.getEmail(), e.getMessage(), e);
                        return ResponseEntity.status(500)
                                        .body("Error: Registration failed due to internal error: " + e.getMessage());
                }
        }
}

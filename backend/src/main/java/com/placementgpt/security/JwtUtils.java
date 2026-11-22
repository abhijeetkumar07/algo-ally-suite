package com.placementgpt.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${placementgpt.app.jwtSecret:algoally_pro_jwt_secure_persistent_secret_key_2026_super_secret_for_dev_only_must_be_256_bits_long_or_more}")
    private String jwtSecret;

    @Value("${placementgpt.app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        byte[] keyBytes;
        try {
            // Check if key is hex or base64 or raw string
            keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            if (keyBytes.length < 32) {
                // Pad to at least 256 bits (32 bytes)
                byte[] padded = new byte[32];
                System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
                keyBytes = padded;
            }
            this.key = Keys.hmacShaKeyFor(keyBytes);
            logger.info("JWT Signing key successfully initialized with persistent configuration.");
        } catch (Exception e) {
            logger.error("Failed to initialize JWT key from secret, using secure fallback: {}", e.getMessage());
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateTokenFromUsername(userPrincipal.getUsername());
    }

    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}

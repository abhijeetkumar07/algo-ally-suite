package com.placementgpt;

import com.placementgpt.dto.LoginRequest;
import com.placementgpt.dto.SignupRequest;
import com.placementgpt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testSignupAndLoginFlow() {
        String testEmail = "testuser_" + System.currentTimeMillis() + "@algoally.com";
        String testPassword = "SecurePassword123!";

        // 1. Signup
        SignupRequest signup = new SignupRequest();
        signup.setEmail(testEmail);
        signup.setPassword(testPassword);
        signup.setFullName("Test Candidate");

        ResponseEntity<Map> signupResp = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/auth/signup",
                signup,
                Map.class
        );
        assertEquals(HttpStatus.OK, signupResp.getStatusCode());
        assertNotNull(signupResp.getBody().get("token"));
        assertNotNull(signupResp.getBody().get("refreshToken"));

        // 2. Login
        LoginRequest login = new LoginRequest();
        login.setEmail(testEmail);
        login.setPassword(testPassword);

        ResponseEntity<Map> loginResp = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/auth/login",
                login,
                Map.class
        );
        assertEquals(HttpStatus.OK, loginResp.getStatusCode());
        assertNotNull(loginResp.getBody().get("token"));

        // 3. Unauthorized access check on protected endpoint
        ResponseEntity<Map> unauthResp = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/profiles/me",
                Map.class
        );
        assertEquals(HttpStatus.UNAUTHORIZED, unauthResp.getStatusCode());
    }
}

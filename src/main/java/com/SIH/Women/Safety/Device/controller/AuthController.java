package com.SIH.Women.Safety.Device.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.SIH.Women.Safety.Device.Repository.UserRepository;
import com.SIH.Women.Safety.Device.model.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        
        // Check if email already exists
        if (user.getEmail() != null && userRepository.findByEmail(user.getEmail()).isPresent()) {
            response.put("message", "Email is already registered!");
            return ResponseEntity.badRequest().body(response);
        }

        // Generate a 6-digit unique numeric ID if not present
        if (user.getUniqueNumericId() == null || user.getUniqueNumericId().isEmpty()) {
            String randomId = String.valueOf((int)(Math.random() * 900000) + 100000);
            user.setUniqueNumericId(randomId);
        }

        // Set default profile flags if null
        user.setVerified(true); // Direct true for smooth hackathon demo, or false if OTP is needed
        if (user.getDefaultRiskLevel() == null) {
            user.setDefaultRiskLevel("GREEN");
        }

        // Save user to MongoDB
        userRepository.save(user);
        
        response.put("message", "Account created successfully!");
        response.put("uniqueNumericId", user.getUniqueNumericId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Map<String, Object> response = new HashMap<>();

        // Support login via Email or Username
        Optional<User> userOpt = Optional.empty();
        
        if (loginRequest.getEmail() != null) {
            userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsername(loginRequest.getEmail());
            }
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Match password
            if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
                response.put("message", "Login successful!");
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                response.put("uniqueNumericId", user.getUniqueNumericId());
                return ResponseEntity.ok(response);
            }
        }

        response.put("message", "Invalid email/username or password!");
        return ResponseEntity.badRequest().body(response);
    }
}
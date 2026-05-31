package com.example.staff_control.controller;

import com.example.staff_control.dto.AuthRequestDTO;
import com.example.staff_control.dto.AuthResponseDTO;
import com.example.staff_control.dto.EmployeeDTO;
import com.example.staff_control.entity.Employee;
import com.example.staff_control.security.UserDetailsImpl;
import com.example.staff_control.service.EmployeeService;
import com.example.staff_control.util.JwtUtils;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequestDTO request) {
        logger.info("Попытка входа: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String token = jwtUtils.generateToken(userDetails.getUsername(),
                userDetails.getAuthorities().iterator().next().toString());

        logger.info("Успешный вход: {}", request.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", userDetails.getUsername());
        response.put("role", userDetails.getAuthorities().iterator().next().toString().replace("ROLE_", ""));
        response.put("id", userDetails.getId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody EmployeeDTO employeeDTO) {
        logger.info("Регистрация нового пользователя: {} с ролью {}", employeeDTO.getEmail(), employeeDTO.getRole());

        try {
            Employee employee = employeeService.registerEmployee(employeeDTO);
            logger.info("Успешная регистрация: {} с ролью {}", employee.getEmail(), employee.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Регистрация успешна");
            response.put("id", employee.getId());
            response.put("email", employee.getEmail());
            response.put("role", employee.getRole());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Ошибка регистрации: {}", e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("status", "Server is working!", "timestamp", System.currentTimeMillis()));
    }
}
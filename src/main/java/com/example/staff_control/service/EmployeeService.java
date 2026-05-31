package com.example.staff_control.service;

import com.example.staff_control.dto.EmployeeDTO;
import com.example.staff_control.dto.PayrollResponseDTO;
import com.example.staff_control.entity.Employee;
import com.example.staff_control.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeService {
    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Employee registerEmployee(EmployeeDTO employeeDTO) {
        // Проверка на существующий email
        if (employeeRepository.existsByEmail(employeeDTO.getEmail())) {
            String errorMsg = "Пользователь с email '" + employeeDTO.getEmail() + "' уже существует. Пожалуйста, используйте другой email.";
            logger.warn(errorMsg);
            throw new RuntimeException(errorMsg);
        }

        Employee employee = new Employee();
        employee.setFullName(employeeDTO.getFullName());
        employee.setEmail(employeeDTO.getEmail());
        employee.setPasswordHash(passwordEncoder.encode(employeeDTO.getPassword()));
        employee.setBaseRate(employeeDTO.getBaseRate() != null ? employeeDTO.getBaseRate() : 1000.0);
        employee.setQualification(employeeDTO.getQualification());

        // ВАЖНО: Сохраняем роль из DTO, если она передана
        String role = employeeDTO.getRole();
        if (role == null || role.isEmpty()) {
            role = "EMPLOYEE";
        }
        employee.setRole(role);

        employee.setCreatedAt(LocalDateTime.now());

        Employee saved = employeeRepository.save(employee);
        logger.info("Зарегистрирован новый сотрудник: {} с ролью {}", saved.getEmail(), saved.getRole());

        return saved;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Сотрудник с ID " + id + " не найден"));
    }

    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Сотрудник с ID " + id + " не найден");
        }
        employeeRepository.deleteById(id);
        logger.warn("Удален сотрудник с ID: {}", id);
    }

    public PayrollResponseDTO calculatePayroll(Long employeeId) {
        Employee employee = getEmployeeById(employeeId);
        Double totalPayment = employeeRepository.calculatePayroll(employeeId);
        Double utilization = employeeRepository.getUtilization(employeeId);

        if (totalPayment == null) totalPayment = 0.0;
        if (utilization == null) utilization = 0.0;

        logger.info("Рассчитана зарплата для {}: {} руб.", employee.getFullName(), totalPayment);

        return new PayrollResponseDTO(
                employeeId,
                employee.getFullName(),
                totalPayment,
                utilization
        );
    }
}
package com.example.staff_control.controller;

import com.example.staff_control.dto.AssignmentDTO;
import com.example.staff_control.entity.Assignment;
import com.example.staff_control.service.AssignmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {
    private static final Logger logger = LoggerFactory.getLogger(AssignmentController.class);

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('HR')")
    public ResponseEntity<?> assignEmployee(
            @Valid @RequestBody AssignmentDTO dto,
            @RequestParam(required = false) boolean force) {

        logger.info("Назначение сотрудника {} на проект {} с ролью {}, force={}",
                dto.getEmployeeId(), dto.getProjectId(), dto.getRoleId(), force);

        try {
            if (force) {
                assignmentService.assignEmployeeForce(dto);
                Map<String, String> response = new HashMap<>();
                response.put("message", "✅ Сотрудник принудительно назначен на проект (бюджет превышен)");
                return ResponseEntity.ok(response);
            } else {
                assignmentService.assignEmployee(dto);
                Map<String, String> response = new HashMap<>();
                response.put("message", "✅ Сотрудник назначен на проект");
                return ResponseEntity.ok(response);
            }
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("type", "budget_warning");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('HR') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<Assignment>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByEmployee(employeeId));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('HR') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<Assignment>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByProject(projectId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('HR')")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        logger.info("DELETE запрос на удаление назначения с ID: {}", id);
        try {
            assignmentService.deleteAssignment(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Сотрудник удалён из проекта");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Ошибка удаления: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/payroll/close")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> closePayroll() {
        assignmentService.closePayrollPeriod();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Отчетный период закрыт");
        return ResponseEntity.ok(response);
    }
}
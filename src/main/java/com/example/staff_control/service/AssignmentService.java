package com.example.staff_control.service;

import com.example.staff_control.dto.AssignmentDTO;
import com.example.staff_control.entity.Assignment;
import com.example.staff_control.entity.Employee;
import com.example.staff_control.entity.Project;
import com.example.staff_control.entity.ProjectRole;
import com.example.staff_control.repository.AssignmentRepository;
import com.example.staff_control.repository.EmployeeRepository;
import com.example.staff_control.repository.ProjectRepository;
import com.example.staff_control.repository.ProjectRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AssignmentService {
    private static final Logger logger = LoggerFactory.getLogger(AssignmentService.class);

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectRoleRepository projectRoleRepository;

    @Transactional
    public void assignEmployee(AssignmentDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Проект не найден"));
        ProjectRole role = projectRoleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new RuntimeException("Роль не найдена"));

        // Рассчитываем стоимость назначения
        double hours = dto.getHoursWorked() != null ? dto.getHoursWorked() : 0;
        double cost = employee.getBaseRate() * hours * role.getCoefficient();

        // Получаем текущий остаток бюджета
        Double remainingBudget = projectRepository.getRemainingBudget(project.getId());
        if (remainingBudget == null) remainingBudget = project.getBudget();

        logger.info("Проверка бюджета: проект={}, бюджет={}, стоимость назначения={}, остаток={}",
                project.getName(), project.getBudget(), cost, remainingBudget);

        // Проверка на превышение бюджета
        if (remainingBudget - cost < 0) {
            double overrun = Math.abs(remainingBudget - cost);
            String errorMessage = String.format(
                    "⚠️ ПРЕДУПРЕЖДЕНИЕ: Назначение превысит бюджет проекта на %.2f ₽!\n" +
                            "Текущий остаток: %.2f ₽\n" +
                            "Стоимость назначения: %.2f ₽\n\n" +
                            "Если вы хотите продолжить, передайте параметр force=true",
                    overrun, remainingBudget, cost
            );
            throw new RuntimeException(errorMessage);
        }

        // Если бюджет позволяет - назначаем
        assignmentRepository.assignEmployeeToProject(
                dto.getEmployeeId(),
                dto.getProjectId(),
                dto.getRoleId(),
                dto.getHoursWorked() != null ? dto.getHoursWorked() : 0
        );

        logger.info("Сотрудник {} назначен на проект {} в роли {}. Стоимость: {} ₽",
                employee.getFullName(), project.getName(), role.getName(), cost);
    }

    // Метод для принудительного назначения (игнорирует бюджет)
    @Transactional
    public void assignEmployeeForce(AssignmentDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Сотрудник не найден"));
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Проект не найден"));
        ProjectRole role = projectRoleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new RuntimeException("Роль не найдена"));

        // Рассчитываем стоимость для логирования
        double hours = dto.getHoursWorked() != null ? dto.getHoursWorked() : 0;
        double cost = employee.getBaseRate() * hours * role.getCoefficient();

        Double remainingBudget = projectRepository.getRemainingBudget(project.getId());
        if (remainingBudget == null) remainingBudget = project.getBudget();

        // Логируем предупреждение о превышении бюджета, но назначаем
        if (remainingBudget - cost < 0) {
            double overrun = Math.abs(remainingBudget - cost);
            logger.warn("ПРИНУДИТЕЛЬНОЕ назначение с превышением бюджета на {} ₽ для проекта {}", overrun, project.getName());
        }

        assignmentRepository.assignEmployeeToProject(
                dto.getEmployeeId(),
                dto.getProjectId(),
                dto.getRoleId(),
                dto.getHoursWorked() != null ? dto.getHoursWorked() : 0
        );

        logger.info("ПРИНУДИТЕЛЬНО: Сотрудник {} назначен на проект {} в роли {}",
                employee.getFullName(), project.getName(), role.getName());
    }

    public List<Assignment> getAssignmentsByEmployee(Long employeeId) {
        return assignmentRepository.findByEmployeeId(employeeId);
    }

    public List<Assignment> getAssignmentsByProject(Long projectId) {
        return assignmentRepository.findByProjectId(projectId);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new RuntimeException("Назначение не найдено");
        }
        assignmentRepository.deleteById(id);
        logger.info("Удалено назначение с ID: {}", id);
    }

    public void closePayrollPeriod() {
        logger.info("Закрыт отчетный период, зарплаты рассчитаны");
    }
}
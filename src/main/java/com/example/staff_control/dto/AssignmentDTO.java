package com.example.staff_control.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Data
public class AssignmentDTO {
    private Long id;

    @NotNull(message = "ID сотрудника обязателен")
    private Long employeeId;

    @NotNull(message = "ID проекта обязателен")
    private Long projectId;

    @NotNull(message = "ID роли обязателен")
    private Long roleId;

    @PositiveOrZero(message = "Часы не могут быть отрицательными")
    private Integer hoursWorked;

    private String status;
}
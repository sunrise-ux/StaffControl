package com.example.staff_control.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

@Data
public class ProjectDTO {
    private Long id;

    @NotBlank(message = "Название проекта обязательно")
    private String name;

    private String description;

    @Positive(message = "Бюджет должен быть положительным")
    private Double budget;

    private String priority; // HIGH, MEDIUM, LOW
    private String status; // ACTIVE, COMPLETED, ON_HOLD
    private LocalDate startDate;
    private LocalDate endDate;
}
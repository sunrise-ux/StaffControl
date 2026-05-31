package com.example.staff_control.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class EmployeeDTO {
    private Long id;

    @NotBlank(message = "ФИО обязательно")
    private String fullName;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный email")
    private String email;

    @NotBlank(message = "Пароль обязателен")
    private String password;

    private Double baseRate;
    private String qualification;
    private String role;
}
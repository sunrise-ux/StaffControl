package com.example.staff_control.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PayrollResponseDTO {
    private Long employeeId;
    private String employeeName;
    private Double totalPayment;
    private Double utilizationPercent;
}
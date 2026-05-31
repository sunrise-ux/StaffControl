package com.example.staff_control.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    @JsonIgnore
    private String passwordHash;

    @Column(name = "base_rate")
    private Double baseRate;

    private String qualification;

    @Column(nullable = false)
    private String role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "employee")
    @JsonIgnore
    private List<Assignment> assignments;

    // Конструкторы
    public Employee() {}

    // Геттеры
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Double getBaseRate() { return baseRate; }
    public String getQualification() { return qualification; }
    public String getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Assignment> getAssignments() { return assignments; }

    // Сеттеры
    public void setId(Long id) { this.id = id; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setBaseRate(Double baseRate) { this.baseRate = baseRate; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public void setRole(String role) { this.role = role; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setAssignments(List<Assignment> assignments) { this.assignments = assignments; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (baseRate == null) baseRate = 1000.0;
        if (role == null) role = "EMPLOYEE";
    }
}
package com.example.staff_control.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "assignment")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"assignments", "passwordHash"})
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties("assignments")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnoreProperties("assignments")
    private ProjectRole role;

    @Column(name = "hours_worked")
    private Integer hoursWorked;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    private String status;

    public Assignment() {}

    public Long getId() { return id; }
    public Employee getEmployee() { return employee; }
    public Project getProject() { return project; }
    public ProjectRole getRole() { return role; }
    public Integer getHoursWorked() { return hoursWorked; }
    public LocalDate getAssignedDate() { return assignedDate; }
    public String getStatus() { return status; }

    public void setId(Long id) { this.id = id; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public void setProject(Project project) { this.project = project; }
    public void setRole(ProjectRole role) { this.role = role; }
    public void setHoursWorked(Integer hoursWorked) { this.hoursWorked = hoursWorked; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }
    public void setStatus(String status) { this.status = status; }

    @PrePersist
    protected void onCreate() {
        if (hoursWorked == null) hoursWorked = 0;
        if (status == null) status = "ACTIVE";
        if (assignedDate == null) assignedDate = LocalDate.now();
    }
}
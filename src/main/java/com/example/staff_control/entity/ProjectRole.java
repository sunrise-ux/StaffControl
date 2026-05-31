package com.example.staff_control.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "project_role")
public class ProjectRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private Double coefficient;
    private String description;

    @OneToMany(mappedBy = "role")
    @JsonIgnore
    private List<Assignment> assignments;

    // Конструкторы
    public ProjectRole() {}

    // Геттеры
    public Long getId() { return id; }
    public String getName() { return name; }
    public Double getCoefficient() { return coefficient; }
    public String getDescription() { return description; }
    public List<Assignment> getAssignments() { return assignments; }

    // Сеттеры
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCoefficient(Double coefficient) { this.coefficient = coefficient; }
    public void setDescription(String description) { this.description = description; }
    public void setAssignments(List<Assignment> assignments) { this.assignments = assignments; }

    @PrePersist
    protected void onCreate() {
        if (coefficient == null) coefficient = 1.0;
    }
}
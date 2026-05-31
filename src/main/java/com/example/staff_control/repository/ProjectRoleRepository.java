package com.example.staff_control.repository;

import com.example.staff_control.entity.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectRoleRepository extends JpaRepository<ProjectRole, Long> {
    Optional<ProjectRole> findByName(String name);
}
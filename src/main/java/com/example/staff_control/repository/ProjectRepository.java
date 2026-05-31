package com.example.staff_control.repository;

import com.example.staff_control.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(String status);

    @Query(value = "SELECT * FROM get_project_actual_budget(:projectId)", nativeQuery = true)
    Double getRemainingBudget(@Param("projectId") Long projectId);
}
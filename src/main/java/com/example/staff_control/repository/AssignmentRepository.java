package com.example.staff_control.repository;

import com.example.staff_control.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByEmployeeId(Long employeeId);
    List<Assignment> findByProjectId(Long projectId);

    @Modifying
    @Transactional
    @Query(value = "CALL assign_employee_to_project(:employeeId, :projectId, :roleId, :hours)", nativeQuery = true)
    void assignEmployeeToProject(
            @Param("employeeId") Long employeeId,
            @Param("projectId") Long projectId,
            @Param("roleId") Long roleId,
            @Param("hours") Integer hours
    );
}
package com.example.staff_control.repository;

import com.example.staff_control.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(value = "SELECT * FROM calculate_employee_payroll(:employeeId)", nativeQuery = true)
    Double calculatePayroll(@Param("employeeId") Long employeeId);

    @Query(value = "SELECT * FROM get_employee_utilization(:employeeId)", nativeQuery = true)
    Double getUtilization(@Param("employeeId") Long employeeId);
}
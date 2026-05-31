package com.example.staff_control.controller;

import com.example.staff_control.entity.ProjectRole;
import com.example.staff_control.repository.ProjectRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/project-roles")
public class ProjectRoleController {

    @Autowired
    private ProjectRoleRepository projectRoleRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<ProjectRole>> getAllRoles() {
        return ResponseEntity.ok(projectRoleRepository.findAll());
    }
}
package com.example.staff_control.service;

import com.example.staff_control.dto.ProjectDTO;
import com.example.staff_control.entity.Project;
import com.example.staff_control.repository.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {
    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    @Autowired
    private ProjectRepository projectRepository;

    public Project createProject(ProjectDTO projectDTO) {
        Project project = new Project();
        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());
        project.setBudget(projectDTO.getBudget());
        project.setPriority(projectDTO.getPriority());
        project.setStatus(projectDTO.getStatus() != null ? projectDTO.getStatus() : "ACTIVE");
        project.setStartDate(projectDTO.getStartDate());
        project.setEndDate(projectDTO.getEndDate());
        project.setCreatedAt(LocalDateTime.now());

        Project saved = projectRepository.save(project);
        logger.info("Создан новый проект: {}", saved.getName());

        return saved;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Проект не найден"));
    }

    public Project updateProject(Long id, ProjectDTO projectDTO) {
        Project project = getProjectById(id);
        project.setName(projectDTO.getName());
        project.setDescription(projectDTO.getDescription());
        project.setBudget(projectDTO.getBudget());
        project.setPriority(projectDTO.getPriority());
        project.setStatus(projectDTO.getStatus());
        project.setStartDate(projectDTO.getStartDate());
        project.setEndDate(projectDTO.getEndDate());

        Project updated = projectRepository.save(project);
        logger.info("Обновлен проект: {}", updated.getName());

        return updated;
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
        logger.warn("Удален проект с ID: {}", id);
    }

    public Double getRemainingBudget(Long projectId) {
        Double remaining = projectRepository.getRemainingBudget(projectId);
        return remaining != null ? remaining : 0.0;
    }
}
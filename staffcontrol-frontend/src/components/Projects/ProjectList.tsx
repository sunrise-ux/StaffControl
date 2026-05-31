import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/api';
import { Project } from '../../types';
import ProjectForm from './ProjectForm';
import axios from 'axios';
import './Projects.css';

interface Assignment {
  id: number;
  employeeId: number;
  projectId: number;
  roleId: number;
  hoursWorked: number;
  status: string;
  employee?: { id: number; fullName: string; email: string };
  role?: { id: number; name: string; coefficient: number };
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState<Project | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);

  const userRole = localStorage.getItem('userRole')?.replace('ROLE_', '') || '';
  const canManage = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'HR';
  const canDelete = userRole === 'ADMIN';
  const canViewTeam = true; // Команду проекта видят ВСЕ
  const canViewBudget = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'HR';
  const canRemoveFromProject = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'HR';

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка загрузки проектов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот проект?')) return;
    try {
      await projectService.delete(id);
      await loadProjects();
      alert('Проект удален');
    } catch (err: any) {
      alert(err.response?.data || 'Ошибка удаления');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProject(null);
    loadProjects();
  };

  const handleViewBudget = async (project: Project) => {
    if (!canViewBudget) {
      alert('⛔ У вас нет прав для просмотра бюджета проекта');
      return;
    }
    
    setSelectedProject(project);
    setBudgetLoading(true);
    setRemainingBudget(null);
    try {
      const budget = await projectService.getRemainingBudget(project.id);
      setRemainingBudget(budget);
    } catch (err) {
      alert('Ошибка загрузки бюджета');
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleViewTeam = async (project: Project) => {
    setSelectedProjectForTeam(project);
    setTeamLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/assignments/project/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Получены назначения:', response.data);
      setAssignments(response.data);
    } catch (err: any) {
      console.error('Ошибка загрузки команды:', err);
      if (err.response?.status === 403) {
        alert('⛔ Нет прав для просмотра команды проекта');
      } else {
        alert('Ошибка загрузки команды проекта');
      }
    } finally {
      setTeamLoading(false);
    }
  };

  const handleRemoveFromProject = async (assignmentId: number, employeeName: string) => {
    if (!window.confirm(`Убрать ${employeeName} из проекта?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Сотрудник удалён из проекта');
      
      if (selectedProjectForTeam) {
        handleViewTeam(selectedProjectForTeam);
      }
      loadProjects();
    } catch (err: any) {
      console.error('Ошибка удаления:', err);
      alert(`Ошибка удаления: ${err.response?.data?.message || err.message}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'COMPLETED': return 'status-completed';
      case 'ON_HOLD': return 'status-hold';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Активный';
      case 'COMPLETED': return 'Завершен';
      case 'ON_HOLD': return 'Приостановлен';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Высокий';
      case 'MEDIUM': return 'Средний';
      case 'LOW': return 'Низкий';
      default: return priority;
    }
  };

  if (loading) return <div className="loading">Загрузка проектов...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="project-list-container">
      <div className="project-header">
        <h1>📁 Управление проектами</h1>
        {canManage && (
          <button className="btn-add" onClick={handleAdd}>
            + Создать проект
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="no-results">
          <p>Нет проектов. {canManage ? 'Создайте первый!' : 'Проектов пока нет.'}</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <div className="project-badges">
                  <span className={`priority-badge ${getPriorityColor(project.priority)}`}>
                    {getPriorityText(project.priority)}
                  </span>
                  <span className={`status-badge ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
              </div>
              
              <div className="project-card-body">
                <p className="project-description">
                  {project.description || 'Нет описания'}
                </p>
                <div className="project-details">
                  <div className="detail-item">
                    <strong>💰 Бюджет:</strong> {project.budget?.toLocaleString()} ₽
                  </div>
                  <div className="detail-item">
                    <strong>📅 Даты:</strong> {project.startDate || '—'} → {project.endDate || '—'}
                  </div>
                </div>
              </div>
              
              <div className="project-card-actions">
                {canViewBudget && (
                  <button className="btn-budget" onClick={() => handleViewBudget(project)}>
                    📊 Остаток бюджета
                  </button>
                )}
                <button className="btn-team" onClick={() => handleViewTeam(project)}>
                  👥 Команда проекта
                </button>
                {canManage && (
                  <button className="btn-edit" onClick={() => handleEdit(project)}>
                    ✏️ Редактировать
                  </button>
                )}
                {canDelete && (
                  <button className="btn-delete" onClick={() => handleDelete(project.id)}>
                    🗑️ Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm project={editingProject} onClose={handleFormClose} />
      )}

      {/* Модальное окно с бюджетом */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📊 Бюджет проекта</h2>
            <p><strong>📁 Проект:</strong> {selectedProject.name}</p>
            <p><strong>💰 Общий бюджет:</strong> {selectedProject.budget?.toLocaleString()} ₽</p>
            {budgetLoading ? (
              <p>⏳ Загрузка...</p>
            ) : (
              <p className={remainingBudget && remainingBudget < 0 ? 'budget-negative' : 'budget-positive'}>
                <strong>💵 Остаток бюджета:</strong> {remainingBudget?.toLocaleString()} ₽
              </p>
            )}
            <button onClick={() => setSelectedProject(null)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Модальное окно с командой проекта */}
      {selectedProjectForTeam && (
        <div className="modal-overlay" onClick={() => setSelectedProjectForTeam(null)}>
          <div className="modal-content team-modal" onClick={(e) => e.stopPropagation()}>
            <h2>👥 Команда проекта: {selectedProjectForTeam.name}</h2>
            {teamLoading ? (
              <p>⏳ Загрузка...</p>
            ) : assignments.length === 0 ? (
              <p>Нет назначенных сотрудников</p>
            ) : (
              <div className="assignments-list">
                {assignments.map((ass) => (
                  <div key={ass.id} className="assignment-item">
                    <div className="assignment-info">
                      <strong>{ass.employee?.fullName || 'Неизвестно'}</strong>
                      <span>Роль: {ass.role?.name || 'Не указана'}</span>
                      <span>Часов: {ass.hoursWorked}</span>
                    </div>
                    {canRemoveFromProject && (
                      <button onClick={() => handleRemoveFromProject(ass.id, ass.employee?.fullName || 'сотрудника')}>
                        🗑️ Убрать
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setSelectedProjectForTeam(null)}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
import React, { useState, useEffect } from 'react';
import { employeeService, projectService } from '../../services/api';
import axios from 'axios';
import './Assignments.css';

interface Employee {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  budget?: number;
}

interface ProjectRole {
  id: number;
  name: string;
  coefficient: number;
}

interface AssignmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onClose, onSuccess }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [hours, setHours] = useState<number>(40);

  useEffect(() => {
    loadData();
    loadRoles();
  }, []);

  const loadData = async () => {
    try {
      const [employeesData, projectsData] = await Promise.all([
        employeeService.getAll(),
        projectService.getAll()
      ]);
      setEmployees(employeesData);
      setProjects(projectsData.filter(p => p.status === 'ACTIVE'));
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Ошибка загрузки списков');
    }
  };

  const loadRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/project-roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data);
    } catch (err) {
      console.error('Ошибка загрузки ролей:', err);
      setRoles([
        { id: 1, name: 'Developer', coefficient: 1.2 },
        { id: 2, name: 'QA Engineer', coefficient: 1.1 },
        { id: 3, name: 'Project Manager', coefficient: 1.5 },
        { id: 4, name: 'DevOps', coefficient: 1.4 },
        { id: 5, name: 'Business Analyst', coefficient: 1.3 }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId || !selectedProjectId || !selectedRoleId) {
      setError('Заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Функция для отправки запроса с параметром force
    const sendRequest = async (force: boolean): Promise<void> => {
      const token = localStorage.getItem('token');
      const url = force 
        ? 'http://localhost:8080/api/assignments?force=true'
        : 'http://localhost:8080/api/assignments';
      
      await axios.post(
        url,
        {
          employeeId: selectedEmployeeId,
          projectId: selectedProjectId,
          roleId: selectedRoleId,
          hoursWorked: hours,
          status: 'ACTIVE'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    };
    
    try {
      // Пробуем назначить без force
      await sendRequest(false);
      alert('✅ Сотрудник успешно назначен на проект!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Ошибка назначения:', err);
      const responseData = err.response?.data;
      
      // Проверяем, является ли ошибка предупреждением о бюджете
      if (responseData?.type === 'budget_warning' || 
          (responseData?.message && responseData.message.includes('превысит бюджет'))) {
        
        const userConfirmed = window.confirm(
          responseData.message + '\n\n⚠️ Назначить в любом случае? (бюджет будет превышен)'
        );
        
        if (userConfirmed) {
          try {
            // Повторная попытка с force=true
            await sendRequest(true);
            alert('⚠️ Сотрудник назначен ПРИНУДИТЕЛЬНО (бюджет превышен)');
            onSuccess();
            onClose();
          } catch (forceErr: any) {
            setError(forceErr.response?.data?.message || 'Ошибка при принудительном назначении');
          }
        } else {
          setError('Назначение отменено пользователем');
        }
      } else {
        setError(responseData?.message || 'Ошибка назначения');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Администратор';
      case 'HR': return 'HR-менеджер';
      case 'MANAGER': return 'Руководитель';
      default: return role;
    }
  };

  // Получение выбранного проекта для отображения бюджета
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content assignment-modal" onClick={(e) => e.stopPropagation()}>
        <h2>👥 Назначение сотрудника на проект</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Сотрудник</label>
            <select 
              value={selectedEmployeeId} 
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              required
            >
              <option value={0}>-- Выберите сотрудника --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.email}) - {getRoleName(emp.role)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>📁 Проект</label>
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              required
            >
              <option value={0}>-- Выберите проект --</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>
                  {proj.name} ({proj.status === 'ACTIVE' ? 'Активен' : 'Завершён'})
                </option>
              ))}
            </select>
          </div>

          {/* Отображение бюджета выбранного проекта */}
          {selectedProject && selectedProject.budget !== undefined && (
            <div className="budget-info" style={{
              padding: '8px 12px',
              backgroundColor: '#e8f4fd',
              borderRadius: '5px',
              marginBottom: '15px',
              fontSize: '13px'
            }}>
              💰 Бюджет проекта: <strong>{selectedProject.budget.toLocaleString()} ₽</strong>
            </div>
          )}

          <div className="form-group">
            <label>💼 Роль на проекте</label>
            <select 
              value={selectedRoleId} 
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
              required
            >
              <option value={0}>-- Выберите роль --</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} (коэффициент: {role.coefficient})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>⏰ Часов в месяц</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              min={0}
              max={200}
              required
            />
            <small>Максимум 200 часов в месяц (при превышении сработает триггер)</small>
          </div>

          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              ❌ {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Назначение...' : '✅ Назначить'}
            </button>
          </div>
        </form>

        <div className="assignment-info">
          <h4>ℹ️ Информация</h4>
          <ul>
            <li>Зарплата рассчитывается по формуле: <strong>Ставка × Часы × Коэффициент роли</strong></li>
            <li>При превышении бюджета проекта появится предупреждение</li>
            <li>Вы сможете подтвердить назначение даже при превышении бюджета</li>
            <li>При превышении 200 часов в месяц триггер БД заблокирует назначение</li>
            <li>Все изменения логируются в таблице <code>assignment_log</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;
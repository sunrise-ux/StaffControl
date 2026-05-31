import React, { useEffect, useState } from 'react';
import { employeeService, projectService } from '../../services/api';
import { Employee, Project } from '../../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  let userRole = localStorage.getItem('userRole') || '';
  const userEmail = localStorage.getItem('userEmail') || '';
  
  const cleanRole = userRole.replace('ROLE_', '');
  const canViewEmployees = cleanRole === 'ADMIN' || cleanRole === 'HR' || cleanRole === 'MANAGER';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const projectsData = await projectService.getAll();
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      
      if (canViewEmployees) {
        try {
          const employeesData = await employeeService.getAll();
          setEmployees(Array.isArray(employeesData) ? employeesData : []);
        } catch (err) {
          console.error('Ошибка загрузки сотрудников:', err);
          setEmployees([]);
        }
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setProjects([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    const clean = role.replace('ROLE_', '');
    switch (clean) {
      case 'ADMIN': return 'Администратор';
      case 'HR': return 'HR-менеджер';
      case 'MANAGER': return 'Руководитель';
      case 'EMPLOYEE': return 'Сотрудник';
      default: return clean;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const activeProjects = Array.isArray(projects) 
    ? projects.filter(p => p.status === 'ACTIVE').length 
    : 0;
  const totalBudget = Array.isArray(projects)
    ? projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    : 0;

  if (loading) {
    return <div className="dashboard-loading">Загрузка данных...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{getGreeting()}, {getRoleName(userRole)}!</h1>
        <p className="dashboard-email">{userEmail}</p>
      </div>

      <div className="dashboard-stats">
        {canViewEmployees && (
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{totalEmployees}</h3>
              <p>Сотрудников</p>
            </div>
          </div>
        )}
        
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <h3>{totalProjects}</h3>
            <p>Всего проектов</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{activeProjects}</h3>
            <p>Активных проектов</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{totalBudget.toLocaleString()} ₽</h3>
            <p>Общий бюджет</p>
          </div>
        </div>
      </div>

      {canViewEmployees && employees.length > 0 && (
        <div className="dashboard-section">
          <h2>📋 Последние сотрудники</h2>
          <div className="recent-list">
            {employees.slice(0, 5).map(emp => (
              <div key={emp.id} className="recent-item">
                <div className="recent-avatar">👤</div>
                <div className="recent-info">
                  <div className="recent-name">{emp.fullName}</div>
                  <div className="recent-email">{emp.email}</div>
                </div>
                <div className="recent-role">{getRoleName(emp.role)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h2>🚀 Активные проекты</h2>
        <div className="recent-list">
          {Array.isArray(projects) && projects.filter(p => p.status === 'ACTIVE').length > 0 ? (
            projects.filter(p => p.status === 'ACTIVE').slice(0, 5).map(project => (
              <div key={project.id} className="recent-item">
                <div className="recent-avatar">📊</div>
                <div className="recent-info">
                  <div className="recent-name">{project.name}</div>
                  <div className="recent-description">{project.description || 'Нет описания'}</div>
                </div>
                <div className="recent-budget">{project.budget?.toLocaleString()} ₽</div>
              </div>
            ))
          ) : (
            <div className="empty-message">Нет активных проектов.</div>
          )}
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>⚡ Быстрые действия</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/my-assignments'}>
            📋 Мои проекты и загрузка
          </button>
          {canViewEmployees && (
            <button className="action-btn" onClick={() => window.location.href = '/employees'}>
              👥 Управление сотрудниками
            </button>
          )}
          <button className="action-btn" onClick={() => window.location.href = '/projects'}>
            📁 Управление проектами
          </button>
        </div>
      </div>

      <div className="dashboard-tips">
        <h3>💡 Что вы можете делать как {getRoleName(userRole)}:</h3>
        <ul>
          {cleanRole === 'ADMIN' && (
            <>
              <li>👑 Полный доступ ко всем функциям системы</li>
              <li>✅ Управлять всеми сотрудниками (создание, просмотр, редактирование, удаление)</li>
              <li>✅ Управлять всеми проектами (создание, редактирование, удаление)</li>
              <li>✅ Назначать любые роли сотрудникам</li>
              <li>✅ Просматривать бюджет всех проектов</li>
              <li>✅ Рассчитывать зарплаты любым сотрудникам</li>
              <li>✅ Назначать и убирать сотрудников с проектов</li>
            </>
          )}
          {cleanRole === 'HR' && (
            <>
              <li>👥 Управление персоналом:</li>
              <li>✅ Просматривать всех сотрудников компании</li>
              <li>✅ Рассчитывать зарплаты сотрудникам</li>
              <li>✅ Просматривать детальную информацию о сотрудниках</li>
              <li>📁 Работа с проектами:</li>
              <li>✅ Просматривать все проекты</li>
              <li>✅ Создавать новые проекты</li>
              <li>✅ Редактировать существующие проекты</li>
              <li>✅ Просматривать бюджет проектов</li>
              <li>✅ Назначать сотрудников на проекты</li>
              <li>❌ Не может удалять сотрудников и проекты</li>
            </>
          )}
          {cleanRole === 'MANAGER' && (
            <>
              <li>📁 Управление проектами:</li>
              <li>✅ Создавать новые проекты</li>
              <li>✅ Редактировать проекты (название, бюджет, сроки)</li>
              <li>✅ Просматривать бюджет проектов</li>
              <li>✅ Отслеживать остаток бюджета</li>
              <li>👥 Управление командой:</li>
              <li>✅ Просматривать список сотрудников</li>
              <li>✅ Назначать сотрудников на проекты</li>
              <li>✅ Убирать сотрудников с проектов</li>
              <li>✅ Рассчитывать зарплаты сотрудникам</li>
              <li>❌ Не может удалять сотрудников и проекты</li>
            </>
          )}
          {cleanRole === 'EMPLOYEE' && (
            <>
              <li>👁️ Просмотр информации:</li>
              <li>✅ Просматривать все проекты компании</li>
              <li>✅ Видеть команду проекта</li>
              <li>✅ Следить за своим участием в проектах</li>
              <li>❌ Не может создавать или редактировать проекты</li>
              <li>❌ Не может просматривать бюджет проектов</li>
              <li>❌ Не может управлять другими сотрудниками</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
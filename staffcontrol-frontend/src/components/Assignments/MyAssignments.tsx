import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { authService } from '../../services/api';
import './MyAssignments.css';

interface Assignment {
  id: number;
  employeeId: number;
  projectId: number;
  roleId: number;
  hoursWorked: number;
  status: string;
  project?: {
    id: number;
    name: string;
    description: string;
    budget: number;
    status: string;
  };
  role?: {
    id: number;
    name: string;
    coefficient: number;
  };
}

interface Employee {
  id: number;
  fullName: string;
  email: string;
  baseRate: number;
  qualification: string;
  role: string;
}

const MyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole')?.replace('ROLE_', '') || '';
  const userId = authService.getUserId();

  useEffect(() => {
    if (!userId) {
      setError('ID пользователя не найден. Пожалуйста, выйдите и войдите заново.');
      setLoading(false);
      return;
    }
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Получаем данные сотрудника по ID
      const employeeResponse = await axios.get(`http://localhost:8080/api/employees/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentEmployee(employeeResponse.data);
      
      // Получаем назначения сотрудника
      const assignmentsResponse = await axios.get(`http://localhost:8080/api/assignments/employee/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(assignmentsResponse.data);
      setError('');
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      if (err.response?.status === 403) {
        setError('Нет прав для просмотра. Обратитесь к администратору.');
      } else if (err.response?.status === 404) {
        setError('Сотрудник не найден.');
      } else {
        setError('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const calculatePayment = (assignment: Assignment) => {
    if (!currentEmployee || !assignment.role) return 0;
    return currentEmployee.baseRate * assignment.hoursWorked * assignment.role.coefficient;
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

  if (loading) return <div className="loading">Загрузка ваших проектов...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-assignments-container">
      <div className="my-assignments-header">
        <h1>📋 Мои проекты и загрузка</h1>
        <div className="employee-info-card">
          <h3>{currentEmployee?.fullName}</h3>
          <p><strong>Email:</strong> {currentEmployee?.email}</p>
          <p><strong>Роль в системе:</strong> {getRoleName(userRole)}</p>
          <p><strong>Квалификация:</strong> {currentEmployee?.qualification || 'Не указана'}</p>
          <p><strong>Базовая ставка:</strong> {currentEmployee?.baseRate?.toLocaleString()} ₽/час</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="no-assignments">
          <p>Вы пока не назначены ни на один проект.</p>
          <p>Обратитесь к руководителю или HR для назначения.</p>
        </div>
      ) : (
        <>
          <div className="assignments-grid">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-card-header">
                  <h3>📁 {assignment.project?.name || 'Проект'}</h3>
                  <span className="status-badge status-active">Активен</span>
                </div>
                <div className="assignment-card-body">
                  <p className="project-description">
                    {assignment.project?.description || 'Нет описания'}
                  </p>
                  <div className="assignment-details">
                    <div className="detail-row">
                      <span className="detail-label">💼 Роль:</span>
                      <span className="detail-value">{assignment.role?.name || 'Не указана'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📊 Коэффициент:</span>
                      <span className="detail-value">{assignment.role?.coefficient || 1.0}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">⏰ Часов в месяц:</span>
                      <span className="detail-value">{assignment.hoursWorked} ч</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">💰 Зарплата за месяц:</span>
                      <span className="detail-value payment">
                        {calculatePayment(assignment).toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="total-summary">
            <h3>📊 Итого за месяц:</h3>
            <div className="total-stats">
              <div className="total-stat">
                <span>Всего часов:</span>
                <strong>{assignments.reduce((sum, a) => sum + a.hoursWorked, 0)} ч</strong>
              </div>
              <div className="total-stat">
                <span>Общая зарплата:</span>
                <strong className="total-payment">
                  {assignments.reduce((sum, a) => sum + calculatePayment(a), 0).toLocaleString()} ₽
                </strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAssignments;
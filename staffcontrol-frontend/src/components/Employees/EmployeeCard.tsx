import React, { useState } from 'react';
import { Employee, PayrollResponse, Assignment } from '../../types';
import { employeeService } from '../../services/api';
import './Employees.css';

interface EmployeeCardProps {
  employee: Employee;
  onDelete: (id: number) => void;
  onUpdate: () => void;
  canManage: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  onDelete, 
  onUpdate,
  canManage 
}) => {
  const [showPayroll, setShowPayroll] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [payroll, setPayroll] = useState<PayrollResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const handleCalculatePayroll = async () => {
    setLoading(true);
    try {
      const result = await employeeService.calculatePayroll(employee.id);
      setPayroll(result);
      setShowPayroll(true);
    } catch (err) {
      alert('Ошибка расчета зарплаты');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async () => {
    setShowDetails(true);
    // Здесь можно загрузить назначения сотрудника
    // const data = await assignmentService.getByEmployee(employee.id);
    // setAssignments(data);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Администратор';
      case 'HR': return 'HR-менеджер';
      case 'MANAGER': return 'Руководитель';
      case 'EMPLOYEE': return 'Сотрудник';
      default: return role;
    }
  };

  return (
    <>
      <div className="employee-card">
        <div className="employee-card-header">
          <div>
            <h3>{employee.fullName}</h3>
            <span className="employee-email">{employee.email}</span>
          </div>
          <span className={`role-badge role-${employee.role.toLowerCase()}`}>
            {getRoleName(employee.role)}
          </span>
        </div>
        
        <div className="employee-card-body">
          <div className="employee-info-row">
            <div className="info-item">
              <label>Базовая ставка:</label>
              <span>{employee.baseRate} руб/час</span>
            </div>
            <div className="info-item">
              <label>Квалификация:</label>
              <span>{employee.qualification || 'Не указана'}</span>
            </div>
          </div>
          <div className="employee-info-row">
            <div className="info-item">
              <label>Дата регистрации:</label>
              <span>{new Date(employee.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="employee-card-actions">
          <button 
            className="btn-details"
            onClick={handleViewDetails}
          >
            Подробнее
          </button>
          <button 
            className="btn-payroll"
            onClick={handleCalculatePayroll}
            disabled={loading}
          >
            {loading ? 'Расчет...' : 'Расчет зарплаты'}
          </button>
          {canManage && (
            <button 
              className="btn-delete"
              onClick={() => onDelete(employee.id)}
            >
              Удалить
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно расчета зарплаты */}
      {showPayroll && payroll && (
        <div className="modal-overlay" onClick={() => setShowPayroll(false)}>
          <div className="modal-content payroll-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Расчет заработной платы</h2>
            <div className="payroll-details">
              <div className="payroll-row">
                <span>Сотрудник:</span>
                <strong>{payroll.employeeName}</strong>
              </div>
              <div className="payroll-row">
                <span>Итого выплата:</span>
                <strong className="payroll-amount">
                  {payroll.totalPayment.toLocaleString()} руб.
                </strong>
              </div>
              <div className="payroll-row">
                <span>Загрузка в проектах:</span>
                <div className="utilization-bar">
                  <div 
                    className="utilization-fill"
                    style={{ width: `${Math.min(payroll.utilizationPercent, 100)}%` }}
                  />
                  <span>{payroll.utilizationPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowPayroll(false)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Модальное окно с деталями сотрудника */}
      {showDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Детальная информация</h2>
            <div className="employee-details">
              <div className="detail-section">
                <h3>Личная информация</h3>
                <p><strong>ФИО:</strong> {employee.fullName}</p>
                <p><strong>Email:</strong> {employee.email}</p>
                <p><strong>Роль:</strong> {getRoleName(employee.role)}</p>
                <p><strong>Квалификация:</strong> {employee.qualification || '—'}</p>
              </div>
              <div className="detail-section">
                <h3>Финансовая информация</h3>
                <p><strong>Базовая ставка:</strong> {employee.baseRate} руб/час</p>
                <p><strong>Примерный доход за месяц (160ч):</strong> 
                  {(employee.baseRate * 160).toLocaleString()} руб.
                </p>
              </div>
              <div className="detail-section">
                <h3>Текущие проекты</h3>
                {assignments.length > 0 ? (
                  <ul>
                    {assignments.map(ass => (
                      <li key={ass.id}>
                        Проект #{ass.projectId} - {ass.hoursWorked} часов
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Нет активных назначений</p>
                )}
              </div>
            </div>
            <button onClick={() => setShowDetails(false)}>Закрыть</button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeCard;
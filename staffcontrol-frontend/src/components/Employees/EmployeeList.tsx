import React, { useEffect, useState } from 'react';
import { employeeService } from '../../services/api';
import { Employee, PayrollResponse } from '../../types';
import AssignmentForm from '../Assignments/AssignmentForm';
import './Employees.css';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [payroll, setPayroll] = useState<PayrollResponse | null>(null);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedEmployeeForAssignment, setSelectedEmployeeForAssignment] = useState<Employee | null>(null);

  const userRole = localStorage.getItem('userRole')?.replace('ROLE_', '') || '';
  const canDelete = userRole === 'ADMIN';

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка загрузки сотрудников');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayroll = async (employee: Employee) => {
    try {
      const result = await employeeService.calculatePayroll(employee.id);
      setPayroll(result);
      setSelectedEmployee(employee);
      setShowPayrollModal(true);
    } catch (err) {
      alert('Ошибка расчета зарплаты');
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      try {
        await employeeService.delete(id);
        await loadEmployees();
        alert('Сотрудник удален');
      } catch (err) {
        alert('Ошибка удаления');
      }
    }
  };

  const handleAssignToProject = (employee: Employee) => {
    setSelectedEmployeeForAssignment(employee);
    setShowAssignmentForm(true);
  };

  const getRoleName = (role: string) => {
    const clean = role?.replace('ROLE_', '') || '';
    switch (clean) {
      case 'ADMIN': return 'Администратор';
      case 'HR': return 'HR-менеджер';
      case 'MANAGER': return 'Руководитель';
      case 'EMPLOYEE': return 'Сотрудник';
      default: return clean;
    }
  };

  // Безопасная фильтрация с проверкой на массив
  const filteredEmployees = Array.isArray(employees) 
    ? employees.filter(emp => {
        const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !roleFilter || (emp.role?.replace('ROLE_', '') === roleFilter);
        return matchesSearch && matchesRole;
      })
    : [];

  if (loading) return <div className="loading">Загрузка сотрудников...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="employee-list-container">
      <div className="employee-header">
        <h1>👥 Управление сотрудниками</h1>
        <div className="employee-filters">
          <input
            type="text"
            placeholder="🔍 Поиск по имени или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Все роли</option>
            <option value="ADMIN">Администраторы</option>
            <option value="HR">HR-менеджеры</option>
            <option value="MANAGER">Руководители</option>
            <option value="EMPLOYEE">Сотрудники</option>
          </select>
        </div>
      </div>

      <div className="employee-grid">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="employee-card">
            <div className="employee-card-header">
              <div>
                <h3>{employee.fullName}</h3>
                <span className="employee-email">{employee.email}</span>
              </div>
              <span className={`role-badge role-${employee.role?.replace('ROLE_', '').toLowerCase()}`}>
                {getRoleName(employee.role)}
              </span>
            </div>
            
            <div className="employee-card-body">
              <div className="employee-info-row">
                <div className="info-item">
                  <label>💰 Ставка:</label>
                  <span>{employee.baseRate?.toLocaleString()} ₽/час</span>
                </div>
                <div className="info-item">
                  <label>📚 Квалификация:</label>
                  <span>{employee.qualification || 'Не указана'}</span>
                </div>
              </div>
              <div className="employee-info-row">
                <div className="info-item">
                  <label>📅 Дата регистрации:</label>
                  <span>{new Date(employee.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="employee-card-actions">
              <button className="btn-details" onClick={() => handleViewDetails(employee)}>
                📋 Подробнее
              </button>
              <button className="btn-payroll" onClick={() => handleCalculatePayroll(employee)}>
                💰 Расчет зарплаты
              </button>
              <button className="btn-assign" onClick={() => handleAssignToProject(employee)}>
                📋 Назначить на проект
              </button>
              {canDelete && (
                <button className="btn-delete" onClick={() => handleDelete(employee.id)}>
                  🗑️ Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="no-results">
          <p>Сотрудники не найдены</p>
        </div>
      )}

      {/* Модальное окно расчета зарплаты */}
      {showPayrollModal && selectedEmployee && payroll && (
        <div className="modal-overlay" onClick={() => setShowPayrollModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💰 Расчет заработной платы</h2>
            <div className="payroll-details">
              <div className="payroll-row">
                <span>👤 Сотрудник:</span>
                <strong>{selectedEmployee.fullName}</strong>
              </div>
              <div className="payroll-row">
                <span>💵 Итого выплата:</span>
                <strong className="payroll-amount">{payroll.totalPayment.toLocaleString()} ₽</strong>
              </div>
              <div className="payroll-row">
                <span>📊 Загрузка:</span>
                <div className="utilization-bar">
                  <div className="utilization-fill" style={{ width: `${Math.min(payroll.utilizationPercent, 100)}%` }} />
                  <span>{payroll.utilizationPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowPayrollModal(false)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Модальное окно деталей сотрудника */}
      {showDetailsModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📋 Детальная информация</h2>
            <div className="employee-details">
              <div className="detail-section">
                <h3>Личная информация</h3>
                <p><strong>ФИО:</strong> {selectedEmployee.fullName}</p>
                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                <p><strong>Роль:</strong> {getRoleName(selectedEmployee.role)}</p>
                <p><strong>Квалификация:</strong> {selectedEmployee.qualification || '—'}</p>
              </div>
              <div className="detail-section">
                <h3>Финансовая информация</h3>
                <p><strong>Базовая ставка:</strong> {selectedEmployee.baseRate?.toLocaleString()} ₽/час</p>
                <p><strong>Примерный доход за месяц (160ч):</strong> 
                  {((selectedEmployee.baseRate || 0) * 160).toLocaleString()} ₽
                </p>
              </div>
            </div>
            <button onClick={() => setShowDetailsModal(false)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* Форма назначения на проект */}
      {showAssignmentForm && selectedEmployeeForAssignment && (
        <AssignmentForm
          onClose={() => {
            setShowAssignmentForm(false);
            setSelectedEmployeeForAssignment(null);
          }}
          onSuccess={() => {
            loadEmployees();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeList;
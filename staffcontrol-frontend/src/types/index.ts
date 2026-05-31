// Тип для сотрудника
export interface Employee {
  id: number;
  fullName: string;
  email: string;
  baseRate: number;
  qualification: string;
  role: string;
  createdAt: string;
}

// Тип для проекта
export interface Project {
  id: number;
  name: string;
  description: string;
  budget: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  startDate: string;
  endDate: string;
  createdAt: string;
}

// Тип для роли на проекте
export interface ProjectRole {
  id: number;
  name: string;
  coefficient: number;
  description: string;
}

// Тип для назначения
export interface Assignment {
  id: number;
  employeeId: number;
  projectId: number;
  roleId: number;
  hoursWorked: number;
  status: string;
  assignedDate: string;
}

// Тип для ответа авторизации
export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

// Тип для запроса авторизации
export interface AuthRequest {
  email: string;
  password: string;
}

// Тип для расчета зарплаты
export interface PayrollResponse {
  employeeId: number;
  employeeName: string;
  totalPayment: number;
  utilizationPercent: number;
}
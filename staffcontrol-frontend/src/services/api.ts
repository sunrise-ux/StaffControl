import axios from 'axios';
import { AuthRequest, AuthResponse, Employee, Project, PayrollResponse, Assignment } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Перехватчик для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response:`, response.status);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status);
    return Promise.reject(error);
  }
);

// ============ АВТОРИЗАЦИЯ ============
export const authService = {
  login: async (credentials: AuthRequest): Promise<any> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
  },
  
  saveToken: (token: string, email: string, role: string, id: number) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', String(id));
    console.log(`[Auth] Сохранено: ${email}, роль: ${role}, id: ${id}`);
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  getUserRole: (): string | null => {
    return localStorage.getItem('userRole');
  },
  
  getUserId: (): number | null => {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  }
};

// ============ СОТРУДНИКИ ============
export const employeeService = {
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get('/employees');
    return response.data;
  },
  
  getById: async (id: number): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
  
  calculatePayroll: async (id: number): Promise<PayrollResponse> => {
    const response = await api.get(`/employees/${id}/payroll`);
    return response.data;
  }
};

// ============ ПРОЕКТЫ ============
export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  getById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  
  update: async (id: number, project: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  
  getRemainingBudget: async (id: number): Promise<number> => {
    const response = await api.get(`/projects/${id}/budget`);
    return response.data;
  }
};

// ============ НАЗНАЧЕНИЯ ============
export const assignmentService = {
  getByEmployee: async (employeeId: number): Promise<Assignment[]> => {
    const response = await api.get(`/assignments/employee/${employeeId}`);
    return response.data;
  },
  
  getByProject: async (projectId: number): Promise<Assignment[]> => {
    const response = await api.get(`/assignments/project/${projectId}`);
    return response.data;
  },
  
  assign: async (data: any) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  }
};

export default api;
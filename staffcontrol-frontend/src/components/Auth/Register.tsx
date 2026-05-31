import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Auth.css';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [baseRate, setBaseRate] = useState('1000');
  const [role, setRole] = useState('EMPLOYEE');  // ДОБАВЛЕНО поле для роли
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qualification, setQualification] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Отправка данных:', { fullName, email, password, baseRate, role });
      
      const response = await authService.register({
        fullName,
        email,
        password,
        baseRate: parseFloat(baseRate),
        role: role,
        qualification: qualification
      });
      
      console.log('Ответ сервера:', response);
      alert('Регистрация успешна! Теперь войдите в систему.');
      navigate('/login');
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
      
      let errorMessage = 'Ошибка регистрации';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 403) {
          errorMessage = '❌ Доступ запрещен. Проверьте, запущен ли бэкенд на порту 8080.';
        } else if (status === 400) {
          errorMessage = data.message || '❌ Неверные данные. Проверьте email и пароль.';
        } else if (data && data.message && data.message.includes('зарегистрирован')) {
          errorMessage = '❌ Пользователь с таким email уже существует. Используйте другой email.';
        } else if (data && data.message) {
          errorMessage = `❌ ${data.message}`;
        } else {
          errorMessage = `❌ Ошибка сервера (${status})`;
        }
      } else if (err.request) {
        errorMessage = '❌ Сервер не отвечает. Проверьте, запущен ли бэкенд.';
      } else {
        errorMessage = `❌ ${err.message || 'Произошла неизвестная ошибка'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Регистрация в StaffControl</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ФИО</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Иванов Иван Иванович"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Минимум 6 символов"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Базовая ставка (руб/час)</label>
            <input
              type="number"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              required
              min="500"
              step="100"
            />
          </div>
          
          <div className="form-group">
            <label>Квалификация (должность)</label>
            <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Например: Java Developer, Project Manager"
            />
            </div>

          {/* НОВОЕ ПОЛЕ - ВЫБОР РОЛИ */}
          <div className="form-group">
            <label>Роль в системе</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="EMPLOYEE">Сотрудник</option>
              <option value="HR">HR-менеджер</option>
              <option value="MANAGER">Руководитель</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '5px',
              marginBottom: '15px',
              border: '1px solid #fcc',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-footer">
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
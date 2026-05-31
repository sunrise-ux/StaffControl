import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      console.log('Ответ сервера:', response);
      
      // Сохраняем данные
      authService.saveToken(
        response.token, 
        response.email, 
        response.role, 
        response.id
      );
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      
      let errorMessage = 'Ошибка входа';
      
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          errorMessage = '❌ Неверный email или пароль';
        } else if (status === 403) {
          errorMessage = '❌ Доступ запрещен. Проверьте, запущен ли бэкенд.';
        } else if (err.response.data?.message) {
          errorMessage = `❌ ${err.response.data.message}`;
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
        <h2>Вход в StaffControl</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@staffcontrol.com"
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••"
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="auth-footer">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
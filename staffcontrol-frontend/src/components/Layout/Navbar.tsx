import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  let userRole = localStorage.getItem('userRole') || '';
  const userEmail = localStorage.getItem('userEmail') || '';
  
  // Очищаем роль от префикса ROLE_
  const cleanRole = userRole.replace('ROLE_', '');
  
  // Всегда показываем пункты меню в зависимости от роли
  const showEmployees = cleanRole === 'ADMIN' || cleanRole === 'HR' || cleanRole === 'MANAGER';
  const showProjects = true;

  const getRoleDisplay = () => {
    switch (cleanRole) {
      case 'ADMIN': return 'Администратор';
      case 'HR': return 'HR-менеджер';
      case 'MANAGER': return 'Руководитель';
      case 'EMPLOYEE': return 'Сотрудник';
      default: return userRole;
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        StaffControl
      </Link>
      
      <ul className="navbar-menu">
        <li><Link to="/dashboard">Дашборд</Link></li>
        {showEmployees && (
          <li><Link to="/employees">Сотрудники</Link></li>
        )}
        {showProjects && (
          <li><Link to="/projects">Проекты</Link></li>
        )}
      </ul>
      
      <div className="navbar-user">
        <span>{userEmail} ({getRoleDisplay()})</span>
        <button onClick={handleLogout} className="logout-btn">
          Выйти
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
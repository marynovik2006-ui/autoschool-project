import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Users, Car, Calendar, Home, User, BookOpen } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  // Функция для отрисовки ссылок в зависимости от роли
  const renderMenu = () => {
    if (user.role === 'ADMIN') {
      return (
        <>
          <Link to="/admin" style={linkStyle}><Home size={20} style={iconStyle} /> Главная</Link>
          <Link to="/admin/users" style={linkStyle}><Users size={20} style={iconStyle} /> Пользователи</Link>
          <Link to="/admin/cars" style={linkStyle}><Car size={20} style={iconStyle} /> Автопарк</Link>
          <Link to="/admin/sessions" style={linkStyle}><Calendar size={20} style={iconStyle} /> Расписание</Link>
        </>
      );
    }
    if (user.role === 'STUDENT') {
      return (
        <>
          <Link to="/student" style={linkStyle}><Calendar size={20} style={iconStyle} /> Расписание</Link>
          <Link to="/student/bookings" style={linkStyle}><BookOpen size={20} style={iconStyle} /> Мои билеты</Link>
          <Link to="/student/profile" style={linkStyle}><User size={20} style={iconStyle} /> Мой профиль</Link>
        </>
      );
    }
            if (user.role === 'INSTRUCTOR') {
      return (
        <>
          <Link to="/instructor" style={linkStyle}><Calendar size={20} style={iconStyle} /> Мои занятия</Link>
          <Link to="/instructor/students" style={linkStyle}><Users size={20} style={iconStyle} /> Мои ученики</Link> {/* <-- НОВАЯ ССЫЛКА */}
          <Link to="/instructor/car" style={linkStyle}><Car size={20} style={iconStyle} /> Мой автомобиль</Link>
          <Link to="/instructor/profile" style={linkStyle}><User size={20} style={iconStyle} /> Мой профиль</Link>
        </>
      );
    }
    return null;
  };

  return (
     <div className="app-container" style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      
      {/* Боковое меню */}
            <div className="sidebar" style={{ 
        width: '260px', backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', 
        display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)', zIndex: 10
      }}>
        <div style={{ padding: '25px 20px', fontSize: '22px', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
          🎀 Автошкола
        </div>
        
                <div className="sidebar-links" style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {renderMenu()}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '15px' }}>
            <ThemeToggle />
          </div>
          <p style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Вы: <b style={{ color: 'var(--text-color)' }}>{user.username}</b><br/>
            <span style={{ fontSize: '12px', color: 'var(--primary-color)' }}>{user.role}</span>
          </p>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} /> Выйти
          </button>
        </div>
      </div>

      {/* Рабочая область */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ backgroundColor: 'var(--card-bg)', padding: '20px 30px', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{title}</h2>
        </header>
                <main className="main-content" style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Выносим стили для ссылок, чтобы не дублировать код
const linkStyle = { display: 'flex', alignItems: 'center', padding: '12px 20px', color: 'var(--sidebar-text)', textDecoration: 'none', fontWeight: '500' };
const iconStyle = { marginRight: '12px', color: 'var(--primary-color)' };
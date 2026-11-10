import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Users, Car, Calendar, Home } from 'lucide-react';
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

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      
      {/* Боковое меню */}
      <div style={{ 
        width: '260px', 
        backgroundColor: 'var(--sidebar-bg)', 
        color: 'var(--sidebar-text)', 
        display: 'flex', 
        flexDirection: 'column',
        borderRight: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)',
        zIndex: 10
      }}>
        <div style={{ padding: '25px 20px', fontSize: '22px', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
          🎀 Автошкола
        </div>
        
        <div style={{ flex: 1, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', color: 'var(--sidebar-text)', textDecoration: 'none', fontWeight: '500' }}>
            <Home size={20} style={{ marginRight: '12px', color: 'var(--primary-color)' }} /> Главная
          </Link>
          <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', color: 'var(--sidebar-text)', textDecoration: 'none', fontWeight: '500' }}>
            <Users size={20} style={{ marginRight: '12px', color: 'var(--primary-color)' }} /> Пользователи
          </Link>
          <Link to="/admin/cars" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', color: 'var(--sidebar-text)', textDecoration: 'none', fontWeight: '500' }}>
            <Car size={20} style={{ marginRight: '12px', color: 'var(--primary-color)' }} /> Автопарк
          </Link>
          <Link to="/admin/sessions" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', color: 'var(--sidebar-text)', textDecoration: 'none', fontWeight: '500' }}>
            <Calendar size={20} style={{ marginRight: '12px', color: 'var(--primary-color)' }} /> Расписание
          </Link>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '15px' }}>
            <ThemeToggle />
          </div>
          <p style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Вы: <b style={{ color: 'var(--text-color)' }}>{user.username}</b><br/>
            <span style={{ fontSize: '12px', color: 'var(--primary-color)' }}>{user.role}</span>
          </p>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} /> Выйти
          </button>
        </div>
      </div>

      {/* Рабочая область */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ backgroundColor: 'var(--card-bg)', padding: '20px 30px', borderBottom: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{title}</h2>
        </header>
        <main style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
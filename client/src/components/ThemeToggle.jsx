import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // При загрузке проверяем, какая тема была сохранена
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Запоминаем выбор
  };

  return (
    <button 
      onClick={toggleTheme} 
      style={{ 
        background: 'transparent', 
        border: 'none', 
        cursor: 'pointer', 
        color: 'var(--primary-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '16px',
        padding: '10px'
      }}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
      {isDark ? 'Светлая тема' : 'Темная тема'}
    </button>
  );
}
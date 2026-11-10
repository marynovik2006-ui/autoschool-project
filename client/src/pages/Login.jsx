import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Хук для перехода между страницами

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      
      const user = response.data.user;
      
      // Сохраняем данные пользователя в localStorage (чтобы не потерять при обновлении страницы)
      localStorage.setItem('user', JSON.stringify(user));

      // Перенаправляем в зависимости от роли
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'INSTRUCTOR') navigate('/instructor');
      else if (user.role === 'STUDENT') navigate('/student');

    } catch (error) {
      setMessage(error.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Вход в систему</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Логин:</label><br/>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Пароль:</label><br/>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Войти
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: 'red' }}>{message}</p>}
    </div>
  );
}
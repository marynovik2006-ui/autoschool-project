import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  
  
    // Достаем данные пользователя из localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // Берем ID курсанта из профиля (или 0, если его нет)
  const studentId = user?.student_id || 0; 

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleBook = async (sessionId) => {
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        session_id: sessionId,
        student_id: studentId
      });
      setMessage({ text: 'Вы успешно записаны на занятие!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000); // Убираем сообщение через 3 сек
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Ошибка записи', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Красиво форматируем дату
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { 
      day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <Layout title="Личный кабинет курсанта">
      
      {/* Всплывающее сообщение об успехе или ошибке */}
      {message.text && (
        <div style={{ 
          padding: '15px', marginBottom: '20px', borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          fontWeight: 'bold', border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <h2 style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Calendar size={28} /> Доступные занятия
      </h2>

      {loading ? (
        <p>Загрузка расписания...</p>
      ) : sessions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Пока нет доступных занятий.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {sessions.map((session) => (
            <div key={session.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-color)' }}>{session.instructor_name}</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', margin: '5px 0' }}>
                  <Clock size={16} /> {formatDate(session.start_time)}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '5px 0' }}>
                  🚗 {session.car_brand} ({session.car_plate})
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '5px 0' }}>
                  ⏱ Длительность: {session.duration_min} мин.
                </p>
              </div>
              
              <button 
                onClick={() => handleBook(session.id)}
                className="btn-primary" 
                style={{ marginTop: '15px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle size={18} /> Записаться
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
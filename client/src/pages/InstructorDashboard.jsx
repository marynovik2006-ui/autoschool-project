import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Clock, Car, ChevronRight } from 'lucide-react';

export default function InstructorDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Берем ID инструктора из памяти
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const instructorId = user?.instructor_id;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        if (instructorId) {
          const response = await axios.get(`http://localhost:5000/api/instructor/${instructorId}/sessions`);
          setSessions(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [instructorId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="Мои занятия">
      <h2 style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Calendar size={28} /> Расписание моих занятий
      </h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>У вас пока нет назначенных занятий.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {sessions.map((session) => (
            <div key={session.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-color)' }}>{formatDate(session.start_time)}</h3>
                <p style={{ margin: '5px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} /> Длительность: {session.duration_min} мин.
                </p>
                <p style={{ margin: '5px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={16} /> {session.car_brand} ({session.car_plate})
                </p>
              </div>
              
              {/* Кнопка перехода на страницу занятия */}
              <button 
                onClick={() => navigate(`/instructor/session/${session.id}`)}
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Подробнее <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
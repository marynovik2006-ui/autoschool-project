import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Clock, Car, ChevronRight, AlertCircle } from 'lucide-react'; // Добавили AlertCircle

export default function InstructorDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояния для фильтров
  const [activeTab, setActiveTab] = useState('UPCOMING'); // UPCOMING (предстоящие) или PAST (прошедшие)
  const [filterGrade, setFilterGrade] = useState('ALL'); // ALL, UNGRADED (неоцененные), GRADED (оцененные)

  const navigate = useNavigate();
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

  // Фильтрация занятий
  const now = new Date();
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    const isUpcoming = sessionDate >= now;
    
    // 1. Фильтр по вкладке (Предстоящие / Прошедшие)
    if (activeTab === 'UPCOMING' && !isUpcoming) return false;
    if (activeTab === 'PAST' && isUpcoming) return false;

    // 2. Фильтр по статусу оценок (только для прошедших)
    if (activeTab === 'PAST') {
      if (filterGrade === 'UNGRADED' && session.ungraded_count === 0) return false;
      if (filterGrade === 'GRADED' && session.ungraded_count > 0) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.start_time).getTime();
    const dateB = new Date(b.start_time).getTime();
    return activeTab === 'UPCOMING' ? dateA - dateB : dateB - dateA;
  });

  return (
    <Layout title="Мои занятия">
      
      {/* Панель вкладок и фильтров */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        
        {/* Вкладки (Предстоящие / Прошедшие) */}
        <div style={{ display: 'flex', backgroundColor: 'var(--card-bg)', borderRadius: '8px', padding: '5px', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('UPCOMING')}
            style={{ 
              padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: activeTab === 'UPCOMING' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'UPCOMING' ? 'white' : 'var(--text-color)'
            }}
          >
            Предстоящие
          </button>
          <button 
            onClick={() => setActiveTab('PAST')}
            style={{ 
              padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
              backgroundColor: activeTab === 'PAST' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'PAST' ? 'white' : 'var(--text-color)'
            }}
          >
            Прошедшие
          </button>
        </div>

        {/* Выпадающий список для фильтрации оценок (только для прошедших) */}
        {activeTab === 'PAST' && (
          <select 
            value={filterGrade} 
            onChange={(e) => setFilterGrade(e.target.value)}
            style={{ width: '220px', padding: '10px' }}
          >
            <option value="ALL">Все прошедшие</option>
            <option value="UNGRADED">Требуют оценки</option>
            <option value="GRADED">Оцененные</option>
          </select>
        )}
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : filteredSessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
            {activeTab === 'UPCOMING' ? 'У вас пока нет предстоящих занятий.' : 'Нет прошедших занятий за выбранный период.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredSessions.map((session) => {
            const isPast = new Date(session.start_time) < now;

            return (
              <div key={session.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isPast ? 0.8 : 1 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{formatDate(session.start_time)}</h3>
                    
                    {/* Бейджик "Ожидается/Прошло" */}
                    {!isPast && (
                      <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>Ожидается</span>
                    )}
                    {isPast && (
                      <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>Прошло</span>
                    )}

                    {/* Бейджик "Требует оценки" */}
                    {session.ungraded_count > 0 && (
                      <span style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> Не оценено: {session.ungraded_count}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '5px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> Длительность: {session.duration_min} мин.
                  </p>
                  <p style={{ margin: '5px 0', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Car size={16} /> {session.car_brand} ({session.car_plate})
                  </p>
                </div>
                
                <button 
                  onClick={() => navigate(`/instructor/session/${session.id}`)}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isPast ? 'Проверить оценки' : 'Подробнее'} <ChevronRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
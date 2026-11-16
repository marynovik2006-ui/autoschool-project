import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { BookOpen, XCircle, Lock } from 'lucide-react';

export default function StudentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const studentId = 1; // Пока жестко, потом исправим

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/bookings/student/${studentId}`);
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Проверяет, можно ли отменить запись (осталось ли > 2 часов)
  const canCancel = (startTime) => {
    const now = new Date();
    const sessionDate = new Date(startTime);
    const diffHours = (sessionDate - now) / (1000 * 60 * 60);
    return diffHours > 2; 
  };

  // Проверяет, прошло ли уже занятие
  const isPast = (startTime) => {
    const now = new Date();
    const sessionDate = new Date(startTime);
    return sessionDate < now;
  };

  const handleCancel = async (bookingId) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`);
      setMessage({ text: 'Запись успешно отменена', type: 'success' });
      fetchBookings(); 
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Ошибка отмены', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="Мои билеты">
      
      {message.text && (
        <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', fontWeight: 'bold' }}>
          {message.text}
        </div>
      )}

      <h2 style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <BookOpen size={28} /> Мои записи на занятия
      </h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>У вас пока нет записей на занятия.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {bookings.map((booking) => {
            // Определяем, как показывать статус
            let statusText = 'Активна';
            let statusColor = 'var(--primary-color)';

            if (booking.status === 'CANCELLED') {
              statusText = 'Отменена';
              statusColor = '#e74c3c';
            } else if (booking.status === 'COMPLETED' || isPast(booking.start_time)) {
              statusText = 'Завершена';
              statusColor = '#27ae60';
            }

            return (
              <div key={booking.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: booking.status === 'CANCELLED' ? 0.6 : 1 }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-color)' }}>Инструктор: {booking.instructor_name}</h3>
                  <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>📅 {formatDate(booking.start_time)}</p>
                  <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>🚗 {booking.car_brand}</p>
                  <p style={{ margin: '5px 0', fontWeight: 'bold', color: statusColor }}>
                    Статус: {statusText}
                  </p>
                </div>
                
                {/* Показываем кнопку или плашку ТОЛЬКО если занятие активно и еще не прошло */}
                {booking.status === 'ACTIVE' && !isPast(booking.start_time) && (
                  canCancel(booking.start_time) ? (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      <XCircle size={18} /> Отменить
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', color: 'var(--text-muted)', border: '2px solid var(--border-color)', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
                      <Lock size={18} /> Отмена недоступна
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
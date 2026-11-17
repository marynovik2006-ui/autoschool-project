import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Calendar, Plus, Clock, Car } from 'lucide-react';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояние для формы
  const [formData, setFormData] = useState({
    start_time: '',
    duration_min: 90,
    instructor_id: '',
    car_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Получаем все занятия
      const sessionsResponse = await axios.get('http://localhost:5000/api/sessions');
      setSessions(sessionsResponse.data);

      // Получаем инструкторов
      const usersResponse = await axios.get('http://localhost:5000/api/admin/users');
      const insts = usersResponse.data.filter(u => u.role === 'INSTRUCTOR');
      setInstructors(insts);

      // Получаем машины
      const carsResponse = await axios.get('http://localhost:5000/api/admin/cars');
      setCars(carsResponse.data);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      // Форматируем дату для MySQL (YYYY-MM-DD HH:MM:SS)
      const formattedDate = formData.start_time.replace('T', ' ') + ':00';
      
      await axios.post('http://localhost:5000/api/sessions', {
        ...formData,
        start_time: formattedDate
      });
      
      setFormData({ start_time: '', duration_min: 90, instructor_id: '', car_id: '' }); // Очищаем форму
      fetchData(); // Обновляем список
      alert('Занятие успешно создано!');
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при создании занятия');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout title="Управление расписанием">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Форма добавления занятия */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Создать занятие
          </h3>
          <form onSubmit={handleAddSession} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Дата и время</label>
              <input 
                type="datetime-local" 
                required 
                value={formData.start_time} 
                onChange={(e) => setFormData({...formData, start_time: e.target.value})} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Длительность (мин)</label>
              <input 
                type="number" 
                required 
                value={formData.duration_min} 
                onChange={(e) => setFormData({...formData, duration_min: e.target.value})} 
              />
            </div>

                        <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Инструктор</label>
              <select 
                required
                value={formData.instructor_id} 
                onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
              >
                <option value="">Выберите инструктора</option>
                {instructors.map(inst => (
                  // ВАЖНО: value должен быть числовым ID инструктора!
                  <option key={inst.id} value={inst.instructor_id || inst.id}>
                    {inst.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Автомобиль</label>
              <select 
                value={formData.car_id} 
                onChange={(e) => setFormData({...formData, car_id: e.target.value})}
              >
                <option value="">Без автомобиля (теория)</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>{car.brand} ({car.plate_number})</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Создать занятие</button>
          </form>
        </div>

        {/* Список всех занятий */}
        <div className="card">
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} /> Общее расписание
          </h3>
          
          {loading ? (
            <p>Загрузка...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Занятий пока нет.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto', paddingRight: '5px' }}>
              {sessions.map((session) => (
                <div key={session.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', backgroundColor: 'var(--bg-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-color)' }}>{formatDate(session.start_time)}</h4>
                      <p style={{ margin: '3px 0', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {session.duration_min} мин. | Инструктор: <b>{session.instructor_name}</b>
                      </p>
                      <p style={{ margin: '3px 0', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Car size={14} /> {session.car_brand || 'Без машины'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
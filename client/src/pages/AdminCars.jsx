import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Car, Plus, Upload } from 'lucide-react';

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояние для формы добавления
  const [formData, setFormData] = useState({
    brand: '',
    plate_number: '',
    transmission: 'MT',
    instructor_id: ''
  });

  // Загрузка машин и списка инструкторов для выпадающего списка
  const fetchData = async () => {
    try {
      setLoading(true);
      // Получаем машины (пока мы не делали отдельный API, можно сделать простой запрос к базе, 
      // либо вытащить из пользователей, но лучше сделаем быстрый API. 
      // Пока для простоты мы просто сделаем запрос к сессиям, чтобы проверить, но лучше создать API /api/admin/cars)
      
      // ВНИМАНИЕ: Нам нужно создать API для получения машин, если его нет.
      // Если ты еще не делала GET /api/admin/cars, то сделай это на бэкенде.
      const carsResponse = await axios.get('http://localhost:5000/api/admin/cars');
      setCars(carsResponse.data);

      // Получаем всех пользователей, фильтруем только инструкторов
      const usersResponse = await axios.get('http://localhost:5000/api/admin/users');
      const insts = usersResponse.data.filter(u => u.role === 'INSTRUCTOR');
      setInstructors(insts);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/cars', formData);
      setFormData({ brand: '', plate_number: '', transmission: 'MT', instructor_id: '' }); // Очищаем форму
      fetchData(); // Обновляем список
      alert('Машина успешно добавлена!');
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при добавлении машины');
    }
  };

  const handlePhotoUpload = async (carId, file) => {
  if (!file) return;
  const formData = new FormData();
  formData.append('photo', file);

  try {
    await axios.post(`http://localhost:5000/api/upload/cars/${carId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    fetchData(); // Обновляем список, чтобы увидеть новую картинку
  } catch (error) {
    alert('Ошибка при загрузке фото');
  }
};

  return (
    <Layout title="Управление автопарком">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Форма добавления */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Добавить автомобиль
          </h3>
          <form onSubmit={handleAddCar} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Марка и модель</label>
              <input type="text" required placeholder="Например: Lada Vesta" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Госномер</label>
              <input type="text" required placeholder="Например: 1234 AB-7" value={formData.plate_number} onChange={(e) => setFormData({...formData, plate_number: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Коробка передач</label>
              <select value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})}>
                <option value="MT">Механика (MT)</option>
                <option value="AT">Автомат (AT)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Закрепить за инструктором</label>
              <select value={formData.instructor_id} onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}>
                <option value="">Без инструктора</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.username}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Добавить машину</button>
          </form>
        </div>

        {/* Список машин */}
        <div className="card">
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={20} /> Список автопарка
          </h3>
          {loading ? (
            <p>Загрузка...</p>
          ) : cars.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Машин пока нет. Добавьте первую!</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Фото</th>
                  <th style={{ padding: '12px' }}>Марка</th>
                  <th style={{ padding: '12px' }}>Госномер</th>
                  <th style={{ padding: '12px' }}>КПП</th>
                  <th style={{ padding: '12px' }}>Инструктор</th>
                  <th style={{ padding: '12px' }}>Статус</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Действие</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                                   <tr key={car.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {/* Колонка с фото */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ width: '60px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--border-color)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {car.photo_url ? (
                          <img src={`http://localhost:5000${car.photo_url}`} alt="Car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Car size={20} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>
                    </td>
                    
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{car.brand}</td>
                    <td style={{ padding: '12px' }}>{car.plate_number}</td>
                    <td style={{ padding: '12px' }}>{car.transmission}</td>
                    <td style={{ padding: '12px' }}>{car.instructor_name || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                        backgroundColor: car.status === 'AVAILABLE' ? '#d4edda' : '#f8d7da',
                        color: car.status === 'AVAILABLE' ? '#155724' : '#721c24'
                      }}>
                        {car.status === 'AVAILABLE' ? 'Доступен' : 'В ремонте'}
                      </span>
                    </td>
                    
                    {/* Кнопка загрузки фото */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <label style={{ cursor: 'pointer', color: 'var(--primary-color)' }} title="Загрузить фото">
                        <Upload size={20} />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handlePhotoUpload(car.id, e.target.files[0])} />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Car, Upload } from 'lucide-react';

export default function InstructorCar() {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const instructorId = user?.instructor_id;

  // Функция загрузки данных о машине
  const fetchCar = async () => {
    try {
      setLoading(true);
      if (instructorId) {
        const response = await axios.get(`http://localhost:5000/api/instructor/${instructorId}/car`);
        if (response.data.length > 0) {
          setCar(response.data[0]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCar();
  }, [instructorId]);

  // Функция загрузки фото для машины
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !car) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      // Мы используем тот же маршрут, что и в админке
      await axios.post(`http://localhost:5000/api/upload/cars/${car.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchCar(); // Обновляем данные, чтобы картинка сразу появилась
    } catch (error) {
      alert('Ошибка при загрузке фото');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="Мой автомобиль">
      <div style={{ maxWidth: '700px' }}>
        
        {loading ? (
          <p>Загрузка...</p>
        ) : !car ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <Car size={48} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
            <h3 style={{ margin: 0, color: 'var(--text-color)' }}>Автомобиль не назначен</h3>
            <p style={{ color: 'var(--text-muted)' }}>Обратитесь к администратору для закрепления учебного автомобиля.</p>
          </div>
        ) : (
          <div className="card">
            <h2 style={{ marginTop: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Car size={28} /> Информация об автомобиле
            </h2>
            
            {/* Блок с фото машины */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              {car.photo_url ? (
                <div style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img 
                    src={`http://localhost:5000${car.photo_url}`} 
                    alt="Автомобиль" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              ) : (
                <div style={{ width: '100%', height: '300px', borderRadius: '12px', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Фото автомобиля отсутствует</p>
                </div>
              )}

              {/* Кнопка загрузки фото (доступна только если машина привязана к этому инструктору) */}
              <label style={{ 
                position: 'absolute', bottom: '15px', right: '15px', 
                backgroundColor: 'var(--primary-color)', color: 'white', 
                padding: '10px 15px', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                <Upload size={18} /> {uploading ? 'Загрузка...' : 'Обновить фото'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gap: '15px', fontSize: '18px' }}>
              <p style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <b>Марка и модель:</b> {car.brand}
              </p>
              <p style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <b>Госномер:</b> {car.plate_number}
              </p>
              <p style={{ margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <b>Коробка передач:</b> {car.transmission === 'MT' ? 'Механика' : 'Автомат'}
              </p>
              <p style={{ margin: 0, paddingBottom: '10px' }}>
                <b>Статус:</b>{' '}
                <span style={{ 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold',
                  backgroundColor: car.status === 'AVAILABLE' ? '#d4edda' : '#f8d7da',
                  color: car.status === 'AVAILABLE' ? '#155724' : '#721c24'
                }}>
                  {car.status === 'AVAILABLE' ? 'Исправен (доступен)' : 'В ремонте'}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
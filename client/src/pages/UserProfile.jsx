import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { ArrowLeft, Upload } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Загружаем данные конкретного пользователя
  const fetchUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users`);
      // Находим нужного пользователя в списке (так как у нас нет отдельного API для одного юзера)
      const foundUser = response.data.find(u => u.id === parseInt(id));
      setUser(foundUser);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      await axios.post(`http://localhost:5000/api/upload/${id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchUser(); // Обновляем данные, чтобы показать новую картинку
    } catch (error) {
      alert('Ошибка при загрузке');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <Layout title="Загрузка..."><p>Загрузка...</p></Layout>;

  // Формируем полный URL для картинки (если она есть)
  const avatarUrl = user.avatar_url ? `http://localhost:5000${user.avatar_url}` : null;

  return (
    <Layout title={`Профиль: ${user.username}`}>
      <button onClick={() => navigate('/admin/users')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
        <ArrowLeft size={20} /> Назад к списку
      </button>

      <div className="card" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Аватарка */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Нет фото</span>
            )}
          </div>
          
          <label className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', fontSize: '14px' }}>
            <Upload size={16} /> {uploading ? 'Загрузка...' : 'Загрузить фото'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Данные */}
        <div style={{ flex: 1, display: 'grid', gap: '10px' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{user.username}</h2>
          <p><b>Роль:</b> {user.role}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Телефон:</b> {user.phone || '—'}</p>
          
          {user.role === 'STUDENT' && (
            <>
              <p><b>Группа:</b> {user.group_name || '—'}</p>
              <p><b>Договор:</b> {user.contract_number || '—'}</p>
            </>
          )}
          
          {user.role === 'INSTRUCTOR' && (
            <>
              <p><b>Категории:</b> {user.categories || '—'}</p>
              <p><b>Стаж:</b> {user.experience_years || 0} лет</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
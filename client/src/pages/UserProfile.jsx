import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { ArrowLeft, Upload, User as UserIcon, Edit, Save, X } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams(); // ID из URL (если админ смотрит чужой профиль)
  const navigate = useNavigate();
  
  // Данные текущего авторизованного пользователя
  const currentUserString = localStorage.getItem('user');
  const currentUser = currentUserString ? JSON.parse(currentUserString) : null;

  // Если id нет в URL, значит пользователь смотрит СВОЙ профиль
  const targetUserId = id || (currentUser ? currentUser.id : null);

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ email: '', phone: '', newPassword: '' });

  const fetchUser = async () => {
    try {
      // Получаем список всех пользователей (в идеале нужен API /users/:id, но для простоты используем существующий)
      const response = await axios.get(`http://localhost:5000/api/admin/users`);
      const foundUser = response.data.find(u => u.id === parseInt(targetUserId));
      setUser(foundUser);
      setEditData({ email: foundUser.email, phone: foundUser.phone || '', newPassword: '' });
      
      // Проверяем, смотрит ли пользователь свой профиль
      if (currentUser && currentUser.id === parseInt(targetUserId)) {
        setIsOwnProfile(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (targetUserId) fetchUser();
  }, [targetUserId]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      await axios.post(`http://localhost:5000/api/upload/${targetUserId}/avatar`, formData, {
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

  const avatarUrl = user.avatar_url ? `http://localhost:5000${user.avatar_url}` : null;

  // Определяем, куда вести кнопку "Назад"
  const handleBack = () => {
    if (currentUser.role === 'ADMIN') navigate('/admin/users');
    else if (currentUser.role === 'STUDENT') navigate('/student');
    else navigate('/instructor');
  };

  // Может ли текущий пользователь менять аватарку?
  // 1. Если это его собственный профиль
  // 2. И он НЕ администратор
  const canEditAvatar = isOwnProfile && user.role !== 'ADMIN';

    const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/profile/${targetUserId}`, editData);
      
      // Обновляем данные в localStorage (чтобы везде был новый email)
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      fetchUser(); // Перезагружаем профиль
      alert('Данные успешно сохранены!');
    } catch (error) {
      alert('Ошибка при сохранении');
    }
  };

  return (
    <Layout title={`Профиль: ${user.username}`}>
      <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
        <ArrowLeft size={20} /> Назад
      </button>

      <div className="card" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Аватарка */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', border: '4px solid var(--card-bg)', boxShadow: 'var(--shadow)' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserIcon size={60} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
          
          {/* Показываем кнопку загрузки только если это свой профиль и не админ */}
          {canEditAvatar && (
            <label className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', fontSize: '14px' }}>
              <Upload size={16} /> {uploading ? 'Загрузка...' : 'Загрузить фото'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* Данные */}
        <div style={{ flex: 1, display: 'grid', gap: '10px' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{user.username}</h2>
          <p><b>Роль:</b> {user.role === 'STUDENT' ? 'Курсант' : user.role === 'INSTRUCTOR' ? 'Инструктор' : 'Администратор'}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Телефон:</b> {user.phone || '—'}</p>

                    {/* Блок редактирования (только для своего профиля и не для админа) */}
          {canEditAvatar && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px' }}>
                  <Edit size={16} /> Редактировать профиль
                </button>
              ) : (
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Email</label>
                    <input type="email" required value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Телефон</label>
                    <input type="text" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Новый пароль (оставьте пустым, если не хотите менять)</label>
                    <input type="password" value={editData.newPassword} onChange={(e) => setEditData({...editData, newPassword: e.target.value})} placeholder="••••••••" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Save size={16} /> Сохранить
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 15px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <X size={16} /> Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          {user.role === 'STUDENT' && (
            <>
              <p><b>Группа:</b> {user.group_name || '—'}</p>
              <p><b>Договор:</b> {user.contract_number || '—'}</p>
              <p><b>Отъезжено часов:</b> {user.hours_driven || 0} / {user.hours_total || 56}</p>
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
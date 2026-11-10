import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { UserX, UserCheck, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
    const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL'); // ALL, STUDENT, INSTRUCTOR, ADMIN
  const [searchQuery, setSearchQuery] = useState('');
  
  
  // Состояние для формы
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'STUDENT',
    // Поля для курсанта
    group_name: '',
    contract_number: '',
    // Поля для инструктора
    categories: '',
    experience_years: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {
        is_blocked: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      alert('Ошибка при изменении статуса');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/create-user', formData);
      setIsModalOpen(false); // Закрываем окно
      setFormData({ username: '', password: '', email: '', phone: '', role: 'STUDENT', group_name: '', contract_number: '', categories: '', experience_years: '' }); // Очищаем форму
      fetchUsers(); // Обновляем список
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при создании пользователя');
    }
  };

    // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <Layout title="Управление пользователями">
      {/* Кнопка добавления */}
            {/* Панель фильтров и кнопка добавления */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Поиск по логину или email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '250px' }}
          />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ width: '180px' }}>
            <option value="ALL">Все роли</option>
            <option value="STUDENT">Курсанты</option>
            <option value="INSTRUCTOR">Инструкторы</option>
            <option value="ADMIN">Администраторы</option>
          </select>
        </div>
        
        <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} /> Добавить пользователя
        </button>
      </div>

      {/* Таблица */}
      <div className="card" style={{ overflowX: 'auto' }}>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Логин</th>
                <th style={{ padding: '12px' }}>Роль</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Статус</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{user.id}</td>
                  <td style={{ padding: '12px' }}>
  <span 
    onClick={() => navigate(`/admin/users/${user.id}`)} 
    style={{ fontWeight: 'bold', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
  >
    {user.username}
  </span>
</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                      backgroundColor: user.role === 'ADMIN' ? '#ffeaa7' : user.role === 'INSTRUCTOR' ? '#74b9ff' : '#a29bfe',
                      color: '#2d3436'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    {user.is_blocked ? <span style={{ color: '#e74c3c' }}>Заблокирован</span> : <span style={{ color: '#27ae60' }}>Активен</span>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => toggleBlock(user.id, user.is_blocked)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: user.is_blocked ? '#27ae60' : '#e74c3c' }}>
                      {user.is_blocked ? <UserCheck size={20} /> : <UserX size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
            
            <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Новый пользователь</h2>
            
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Роль</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="STUDENT">Курсант</option>
                  <option value="INSTRUCTOR">Инструктор</option>
                  <option value="ADMIN">Администратор</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Логин</label>
                <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Пароль</label>
                <input type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Телефон</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>

              {/* Динамические поля в зависимости от роли */}
              {formData.role === 'STUDENT' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Группа</label>
                    <input type="text" value={formData.group_name} onChange={(e) => setFormData({...formData, group_name: e.target.value})} placeholder="Например: Группа B-12" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Номер договора</label>
                    <input type="text" value={formData.contract_number} onChange={(e) => setFormData({...formData, contract_number: e.target.value})} placeholder="Например: 2026-00123" />
                  </div>
                </>
              )}

              {formData.role === 'INSTRUCTOR' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Категории</label>
                    <input type="text" value={formData.categories} onChange={(e) => setFormData({...formData, categories: e.target.value})} placeholder="Например: B, C" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Стаж (лет)</label>
                    <input type="number" value={formData.experience_years} onChange={(e) => setFormData({...formData, experience_years: e.target.value})} placeholder="Например: 5" />
                  </div>
                </>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                Создать пользователя
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
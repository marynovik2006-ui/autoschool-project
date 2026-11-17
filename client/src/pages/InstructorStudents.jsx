import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Users, User as UserIcon, Phone, BookOpen } from 'lucide-react';

export default function InstructorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const instructorId = user?.instructor_id;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        if (instructorId) {
          const response = await axios.get(`http://localhost:5000/api/instructor/${instructorId}/students`);
          setStudents(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [instructorId]);

  return (
    <Layout title="Мои ученики">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} /> Список курсантов
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Здесь отображаются все курсанты, которые записывались к вам на занятия.</p>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>У вас пока нет записавшихся учеников.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {students.map((student) => (
            <div key={student.id} className="card" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              
              {/* Аватарка */}
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--border-color)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                {student.avatar_url ? (
                  <img src={`http://localhost:5000${student.avatar_url}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={30} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              {/* Информация */}
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-color)' }}>{student.username}</h3>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BookOpen size={14} /> Группа: {student.group_name || '—'}
                </p>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={14} /> {student.phone || '—'}
                </p>
                <div style={{ backgroundColor: 'var(--bg-color)', padding: '5px 10px', borderRadius: '8px', display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  Часы: {student.hours_driven} / {student.hours_total}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
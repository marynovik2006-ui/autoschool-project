import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { ArrowLeft, CheckCircle, User, Star } from 'lucide-react';

export default function InstructorSession() {
  const { id } = useParams(); // ID занятия
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояние для формы оценки
  const [gradingId, setGradingId] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '5', comment: '' });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/instructor/sessions/${id}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [id]);

  const handleGradeSubmit = async (e, bookingId) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/instructor/grades', {
        booking_id: bookingId,
        grade: parseInt(gradeData.grade),
        comment: gradeData.comment
      });
      setGradingId(null); // Закрываем форму
      setGradeData({ grade: '5', comment: '' }); // Очищаем
      fetchStudents(); // Обновляем список
      alert('Оценка выставлена!');
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при выставлении оценки');
    }
  };

  return (
    <Layout title="Управление занятием">
      <button onClick={() => navigate('/instructor')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>
        <ArrowLeft size={20} /> Назад к расписанию
      </button>

      <div className="card">
        <h2 style={{ marginTop: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={24} /> Записавшиеся курсанты
        </h2>

        {loading ? (
          <p>Загрузка...</p>
        ) : students.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>На это занятие пока никто не записался.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {students.map((student) => (
              <div key={student.booking_id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{student.student_name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Группа: {student.group_name || '—'}</p>
                  </div>
                  
                  {/* Если оценка уже есть, показываем её */}
                  {student.grade ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ backgroundColor: '#27ae60', color: 'white', padding: '5px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                        Оценка: {student.grade}
                      </span>
                      {student.comment && <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{student.comment}</p>}
                    </div>
                  ) : (
                    /* Если оценки нет, предлагаем выставить */
                    <button 
                      onClick={() => setGradingId(student.booking_id)} 
                      className="btn-primary" 
                      style={{ padding: '8px 15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Star size={16} /> Оценить
                    </button>
                  )}
                </div>

                {/* Форма выставления оценки */}
                {gradingId === student.booking_id && (
                  <form onSubmit={(e) => handleGradeSubmit(e, student.booking_id)} style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Оценка</label>
                      <select value={gradeData.grade} onChange={(e) => setGradeData({...gradeData, grade: e.target.value})} style={{ width: '80px' }}>
                        <option value="5">5</option>
                        <option value="4">4</option>
                        <option value="3">3</option>
                        <option value="2">2</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Комментарий</label>
                      <input type="text" value={gradeData.comment} onChange={(e) => setGradeData({...gradeData, comment: e.target.value})} placeholder="Хорошо отработал..." />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle size={16} /> Сохранить
                      </button>
                      <button type="button" onClick={() => setGradingId(null)} style={{ padding: '8px 15px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
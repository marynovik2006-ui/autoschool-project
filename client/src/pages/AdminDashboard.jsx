import Layout from '../components/Layout';

export default function AdminDashboard() {
  return (
    <Layout title="Главная панель администратора">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        <div className="card">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Всего пользователей</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>12</p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Учебных машин</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>5</p>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Занятий на неделе</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>24</p>
        </div>

      </div>
    </Layout>
  );
}
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';       
import AdminCars from './pages/AdminCars';  
import UserProfile from './pages/UserProfile';     
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentBookings from './pages/StudentBookings';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Маршруты администратора */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<UserProfile />} />
        <Route path="/admin/cars" element={<AdminCars />} />
        <Route path="/admin/users/:id" element={<UserProfile />} />
        
        {/* Маршруты инструктора и курсанта (пока заглушки) */}
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/bookings" element={<StudentBookings />} />
        <Route path="/student/profile" element={<UserProfile />} />
        <Route path="/instructor/profile" element={<UserProfile />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
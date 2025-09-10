import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import DashboardStats from '../components/DashboardStats';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login page immediately if not authenticated
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <DashboardLayout 
      title="" 
      subtitle=""
      showContentWrapper={false}
    >
      <DashboardStats />
    </DashboardLayout>
  );
};

export default HomePage;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

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
      <div style={{ padding: '2rem', marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        {/* Empty dashboard content */}
      </div>
    </DashboardLayout>
  );
};

export default HomePage;

import DashboardLayout from '../components/DashboardLayout';
import DashboardStats from '../components/DashboardStats';

const HomePage = () => {
  // ProtectedRoute handles authentication, so we can just render the dashboard
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
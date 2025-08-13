import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const Main = styled.main`
  flex: 1;
  padding: ${props => props.$isDashboard ? '0' : '2rem 3rem'};
  width: 100%;
  
  @media (max-width: 768px) {
    padding: ${props => props.$isDashboard ? '0' : '1.5rem 2rem'};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.$isDashboard ? '0' : '1rem 1.5rem'};
  }
`;

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin/');

  // For login page, render without any layout
  if (isLogin) {
    return <Outlet />;
  }

  // For dashboard and admin pages, render without header/footer
  if (isDashboard || isAdminPage) {
    return <Outlet />;
  }

  // For public pages, render with header and footer
  return (
    <LayoutContainer>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout; 
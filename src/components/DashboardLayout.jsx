import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  position: relative;
`;

const Navbar = styled.nav`
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const NavbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;


const NavbarNavigation = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #0066cc;
    background-color: #f0f8ff;
  }
  
  &.active {
    color: #0066cc;
    background-color: #f0f8ff;
  }
`;

const NavbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  min-width: 40px;
  min-height: 40px;
  
  &:hover {
    background-color: #f0f0f0;
    color: #0066cc;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NavbarProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NavbarUserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #0066cc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
`;

const NavbarUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavbarUserName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #333;
`;

const NavbarUserRole = styled.div`
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NavbarLogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #dc3545;
    background-color: #f8d7da;
  }
`;

// Mobile Sidebar Overlay
const MobileOverlay = styled.div`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1500;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

// Mobile Sidebar
const MobileSidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1600;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

// Sidebar Header
const SidebarHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
`;

// Sidebar Navigation
const SidebarNav = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const SidebarNavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #333;
  text-decoration: none;
  padding: 1rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background-color: #f0f8ff;
    color: #0066cc;
  }
  
  &.active {
    background-color: #e3f2fd;
    color: #0066cc;
    border-right: 3px solid #0066cc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

// Sidebar Footer
const SidebarFooter = styled.div`
  padding: 1rem 2rem;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f9fa;
`;

const SidebarUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SidebarLogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #c82333;
  }
`;

const MainContent = styled.main`
  min-height: calc(100vh - 64px);
  background-color: #f8f9fa;
`;

const PageHeader = styled.div`
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const PageSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 0;
`;

const ContentWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardLayout = ({ children, title, subtitle, showContentWrapper = true }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/admin/posts', label: 'Manage Posts' },
    { path: '/admin/posts/new', label: 'Create Post' },
    { path: '/admin/comments', label: 'Comments' },
    { path: '/blog', label: 'View Blog' }
  ];

  const getUserInitials = () => {
    if (!currentUser) return 'U';
    const firstName = currentUser.first_name || '';
    const lastName = currentUser.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return currentUser.username ? currentUser.username[0].toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    return currentUser.username || 'User';
  };

  const getUserRole = () => {
    if (!currentUser) return 'User';
    return currentUser.is_staff ? 'Administrator' : 'User';
  };

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Store scroll position when sidebar opens
  const [scrollPosition, setScrollPosition] = React.useState(0);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    console.log('Mobile menu toggled:', newState);
    setIsMobileMenuOpen(newState);
    
    // Prevent/allow background scrolling with position fixed approach
    if (newState) {
      // Store current scroll position
      const currentScrollY = window.scrollY;
      setScrollPosition(currentScrollY);
      
      // Apply styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${currentScrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollPosition);
    }
  };

  // Close mobile menu and restore scrolling
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    
    // Restore scrolling
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    // Restore scroll position
    window.scrollTo(0, scrollPosition);
  };

  // Cleanup effect to restore scrolling when component unmounts
  React.useEffect(() => {
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <DashboardContainer>
      <Navbar>
        <NavbarLeft>
          <NavbarNavigation>
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={isActiveRoute(item.path) ? 'active' : ''}
              >
                {item.label}
              </NavLink>
            ))}
          </NavbarNavigation>
        </NavbarLeft>

        <NavbarRight>
          <MobileMenuButton onClick={toggleMobileMenu}>
            <MenuIcon />
          </MobileMenuButton>
          <NavbarProfile>
            <NavbarUserAvatar>
              {getUserInitials()}
            </NavbarUserAvatar>
            <NavbarUserInfo>
              <NavbarUserName>{getUserDisplayName()}</NavbarUserName>
              <NavbarUserRole>{getUserRole()}</NavbarUserRole>
            </NavbarUserInfo>
          </NavbarProfile>
          <NavbarLogoutButton onClick={handleLogout}>
            <LogoutIcon />
          </NavbarLogoutButton>
        </NavbarRight>
      </Navbar>

      {/* Mobile Sidebar Overlay */}
      <MobileOverlay 
        $isOpen={isMobileMenuOpen} 
        onClick={closeMobileMenu} 
      />
      
      {/* Mobile Sidebar */}
      <MobileSidebar $isOpen={isMobileMenuOpen}>
        <SidebarHeader>
          <SidebarTitle>Navigation</SidebarTitle>
        </SidebarHeader>
        
        <SidebarNav>
          {navigationItems.map((item) => (
            <SidebarNavLink
              key={item.path}
              to={item.path}
              className={isActiveRoute(item.path) ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              {item.label}
            </SidebarNavLink>
          ))}
        </SidebarNav>
        
        <SidebarFooter>
          <SidebarUserInfo>
            <NavbarUserAvatar>
              {getUserInitials()}
            </NavbarUserAvatar>
            <div>
              <NavbarUserName>{getUserDisplayName()}</NavbarUserName>
              <NavbarUserRole>{getUserRole()}</NavbarUserRole>
            </div>
          </SidebarUserInfo>
          <SidebarLogoutButton onClick={handleLogout}>
            <LogoutIcon />
            Logout
          </SidebarLogoutButton>
        </SidebarFooter>
      </MobileSidebar>

      <MainContent>
        {title && (
          <PageHeader>
            <PageTitle>{title}</PageTitle>
            {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
          </PageHeader>
        )}

        {showContentWrapper ? (
          <ContentWrapper>
            {children}
          </ContentWrapper>
        ) : (
          children
        )}
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardLayout;
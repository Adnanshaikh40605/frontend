import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Navbar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 64px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 1003;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const NavbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HamburgerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: #4a5568;
  
  &:hover {
    background-color: #f7fafc;
  }
  
  svg {
    font-size: 1.5rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

const LogoSvg = styled.svg`
  height: 40px;
  width: auto;
  max-width: 200px;
`;

const NavbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavbarProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const NavbarUserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #c53030;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

const NavbarUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavbarUserName = styled.span`
  color: #2d3748;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NavbarUserRole = styled.span`
  color: #718096;
  font-size: 0.75rem;
  line-height: 1.2;
`;

const NavbarLogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: #4a5568;
  
  &:hover {
    background-color: #f7fafc;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const Drawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background-color: #c53030;
  color: white;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease;
  z-index: 1002;
  display: flex;
  flex-direction: column;
  box-shadow: ${props => props.$isOpen ? '2px 0 8px rgba(0, 0, 0, 0.15)' : 'none'};
  overflow-y: auto;
`;

const DrawerHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
`;

const DrawerTitle = styled.h2`
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const DrawerNav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`;

const NavItems = styled.div`
  flex: 1;
`;

const NavItem = styled(Link)`
  display: block;
  padding: 1rem 1.5rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-top: 64px;
  margin-left: ${props => props.$isDrawerOpen ? '280px' : '0'};
  padding: 2rem;
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

const ContentWrapper = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const PageSubtitle = styled.p`
  color: #718096;
  font-size: 1rem;
  margin: 0;
`;

const DashboardLayout = ({ children, title, subtitle, showContentWrapper = true }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Close drawer on mobile when route changes
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      closeDrawer();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!currentUser) return 'A';
    
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    
    if (currentUser.username) {
      return currentUser.username[0].toUpperCase();
    }
    
    return 'A';
  };

  const getUserDisplayName = () => {
    if (!currentUser) return 'Admin User';
    
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    
    if (currentUser.username) {
      return currentUser.username;
    }
    
    return 'Admin User';
  };

  const getUserRole = () => {
    if (!currentUser) return 'Administrator';
    
    if (currentUser.is_staff) {
      return 'Administrator';
    }
    
    return 'User';
  };

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <DashboardContainer>
      <Navbar>
        <NavbarLeft>
          <HamburgerButton onClick={toggleDrawer}>
            <MenuIcon />
          </HamburgerButton>
          <LogoContainer>
            <LogoSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1708.94 1331.29">
              <defs>
                <style>
                  {`.cls-1 { fill: none; stroke-width: 5px; }
                   .cls-1, .cls-2 { stroke: #be123c; stroke-miterlimit: 10; }
                   .cls-3 { stroke-width: 0px; }
                   .cls-3, .cls-2 { fill: #be123c; }
                   .cls-2 { stroke-width: 7px; }`}
                </style>
              </defs>
              <g>
                <path className="cls-3" d="m394.37,138.82s106.04-4.95,164.93,74.2c0,0-76.13-18.8-94.46-.92,0,0,100.57,118.25,50.67,224.76,0,0-34.19-89.74-87.8-125.67,0,0,20.01,130.37-63.66,184.21,0,0,18.62-149.93-75.69-216.88l106.01-139.7Z"/>
                <path className="cls-3" d="m395.12,139.39S371.53,35.68,279.67,0c0,0,38.44,68.47,26.14,90.95,0,0-140.62-65.48-229.71,11.18,0,0,95.44,9.02,144.34,51.17,0,0-130.73,15.54-160.14,110.72,0,0,139.21-58.07,228.81,15.08l106.01-139.7Z"/>
              </g>
              <path className="cls-2" d="m1547.97,72.83c-401.58,1.23,0,534.4,0,534.4,0,0,354.29-535.48,0-534.4Zm-10.78,249.09c-42.54,0-77.03-34.49-77.03-77.03s34.49-77.03,77.03-77.03,77.03,34.49,77.03,77.03-34.49,77.03-77.03,77.03Z"/>
              <rect className="cls-3" y="1281.71" width="1615.84" height="49.59"/>
              <path className="cls-3" d="m314.86,257.11c-10.62,19.36-20.36,39.35-29.77,59.35-137.81,301.11-204.96,644.27-143.03,972.62,0,0-15.72,2.99-15.72,2.99-63.07-342.69,11.18-700.68,162.07-1011.17,5.09-10.08,10.18-19.96,15.7-29.87,0,0,10.74,6.07,10.74,6.07h0Z"/>
              <rect className="cls-3" x="1113.13" y="1218.44" width="413.79" height="71.81"/>
              <polygon className="cls-3" points="1366.19 103.6 952.4 213.03 952.4 178.84 1366.19 69.4 1366.19 103.6"/>
              <path className="cls-3" d="m1363.17,120.7l-359.48,92.33v1005.41h502.7v-611.46c-46.62-65.14-251-365.71-143.23-486.28Zm-308.18,147.22l153.89-30.95v126.36l-153.89,30.95v-126.36Zm0,177.83l153.89-30.95v126.36l-153.89,30.95v-126.36Zm0,198.35l153.89-30.95v126.36l-153.89,30.95v-126.36Zm0,201.77l153.89-30.95v126.36l-153.89,30.95v-126.36Zm160.73,307.44l-153.89,30.95v-126.36l153.89-30.95v126.36Zm229.12,51.47l-153.89-30.95v-126.36l153.89,30.95v126.36Zm0-232.54l-153.89-30.95v-126.36l153.89,30.95v126.36Zm0-215.44l-153.89-30.95v-126.36l153.89,30.95v126.36Zm0-184.67l-153.89-30.95v-126.36l76.88,15.46,46.23,66.62,30.78,64.68v10.55Z"/>
              <path className="cls-1" d="m1355.93,383.63s114.56,218.9,129.95,223.35"/>
              <polygon className="cls-3" points="984.81 779.78 846.39 640.5 701.19 779.78 215.52 787.55 486.91 531.12 984.81 530.68 984.81 779.78"/>
              <rect className="cls-3" x="210.32" y="1215.93" width="909.12" height="74.33"/>
              <rect className="cls-3" x="781.42" y="903.82" width="126.53" height="314.62"/>
              <rect className="cls-3" x="863.49" y="1143.21" width="44.46" height="3.42"/>
              <circle className="cls-3" cx="846.39" cy="794.39" r="54.72"/>
              <path className="cls-3" d="m275.29,814.91v413.79h413.79v-413.79h-413.79Zm198.18,335.14h-121.59v-218.86h121.59v218.86Zm142.44,0h-121.59v-218.86h121.59v218.86Z"/>
            </LogoSvg>
          </LogoContainer>
        </NavbarLeft>
        
        <NavbarRight>
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
      
      <Overlay $isOpen={isDrawerOpen} onClick={closeDrawer} />
      
      <Drawer $isOpen={isDrawerOpen}>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        
        <DrawerNav>
          <NavItems>
            <NavItem 
              to="/" 
              className={isActiveRoute('/') ? 'active' : ''} 
              onClick={handleNavClick}
            >
              Dashboard
            </NavItem>
            <NavItem 
              to="/admin/posts" 
              className={isActiveRoute('/admin/posts') ? 'active' : ''} 
              onClick={handleNavClick}
            >
              Manage Post
            </NavItem>
            <NavItem 
              to="/admin/posts/new" 
              className={location.pathname === '/admin/posts/new' ? 'active' : ''} 
              onClick={handleNavClick}
            >
              Create Post
            </NavItem>
            <NavItem 
              to="/admin/comments" 
              className={isActiveRoute('/admin/comments') ? 'active' : ''} 
              onClick={handleNavClick}
            >
              Comments
            </NavItem>
            <NavItem 
              to="/blog" 
              className={isActiveRoute('/blog') ? 'active' : ''} 
              onClick={handleNavClick}
            >
              View Blog
            </NavItem>
          </NavItems>
        </DrawerNav>
      </Drawer>

      <MainContent $isDrawerOpen={isDrawerOpen}>
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
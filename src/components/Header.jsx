import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';

const HeaderContainer = styled.header`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 3rem;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 0.75rem 2rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  
  &:hover {
    color: #0066cc;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #f1f1f1;
    z-index: 200;
  }
`;

const NavLink = styled(Link)`
  color: #555;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s, border-bottom 0.2s;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  
  &:hover {
    color: #0066cc;
  }
  
  &.active {
    color: #0066cc;
    border-bottom: 2px solid #0066cc;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 0;
    width: 100%;
    border-bottom: 1px solid #f1f1f1;
    
    &.active {
      border-bottom: 1px solid #f1f1f1;
      color: #0066cc;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const NavLinkGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
    width: 100%;
  }
`;

const Divider = styled.div`
  width: 1px;
  background-color: #e0e0e0;
  margin: 0 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    margin: 0.5rem 0;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const DiagnosticButton = styled(Link)`
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 1rem;
  
  &:hover {
    background-color: #f5c6cb;
  }
  
  @media (max-width: 768px) {
    margin: 0.5rem 0;
    width: 100%;
    text-align: center;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.5rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.5rem 0;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #0066cc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #333;
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: #005DBB;
  border: none;
  padding: 0.4rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 1.4rem;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    border-radius: 4px;
    justify-content: center;
    
    &:hover {
      background-color: rgba(220, 53, 69, 0.1);
    }
  }
`;

const LoginButton = styled(Link)`
  background-color: #0066cc;
  color: white;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: #004c99;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 0.5rem;
  }
`;

const DemoLink = styled(NavLink)`
  color: #0066cc;
  font-weight: 500;
  
  &:hover {
    color: #004c99;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // Force re-render when auth state changes
  const [authState, setAuthState] = useState(!!currentUser);
  
  useEffect(() => {
    setAuthState(!!currentUser);
  }, [currentUser]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return '?';
    
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    
    if (currentUser.username) {
      return currentUser.username[0].toUpperCase();
    }
    
    return '?';
  };
  
  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">Blog CMS</Logo>
        
        <MobileMenuButton onClick={toggleMenu}>
          {isMenuOpen ? 'Close' : 'Menu'}
        </MobileMenuButton>
        
        <NavLinks $isOpen={isMenuOpen}>
          <NavLink 
            to="/blog" 
            className={location.pathname.startsWith('/blog') ? 'active' : ''}
            onClick={closeMenu}
          >
            View Blog
          </NavLink>
          
          <Divider />
          
          {currentUser && (
            <NavLinkGroup>
              <NavLink to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink 
                to="/admin/posts" 
                className={location.pathname.startsWith('/admin/posts') ? 'active' : ''}
                onClick={closeMenu}
              >
                Manage Post
              </NavLink>
              <NavLink 
                to="/admin/posts/new" 
                className={location.pathname === '/admin/posts/new' ? 'active' : ''}
                onClick={closeMenu}
              >
                Create Post
              </NavLink>
              <NavLink 
                to="/admin/comments" 
                className={location.pathname === '/admin/comments' ? 'active' : ''}
                onClick={closeMenu}
              >
                Comments
              </NavLink>
            </NavLinkGroup>
          )}
          
          <Divider />
          
          <UserSection>
            {currentUser ? (
              <>
                <UserInfo>
                  <UserAvatar>{getUserInitials()}</UserAvatar>
                  <UserName>
                    {currentUser.first_name && currentUser.last_name
                      ? `${currentUser.first_name} ${currentUser.last_name}`
                      : currentUser.username}
                  </UserName>
                </UserInfo>
                <LogoutButton 
                  onClick={handleLogout} 
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogoutIcon />
                </LogoutButton>
              </>
            ) : (
              <LoginButton to="/login" onClick={closeMenu}>Login</LoginButton>
            )}
          </UserSection>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header; 
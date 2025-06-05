import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.js';

const HeaderContainer = styled.header`
  padding: 1rem 0;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  font-family: 'Lexend', sans-serif;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: box-shadow 0.3s ease;
  box-shadow: ${props => props.$scrolled ? '0 4px 10px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  
  img {
    height: 40px;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const LogoText = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 1.4rem;
  margin-left: 0.5rem;
  font-family: 'Lexend', sans-serif;
  letter-spacing: -0.02em;
  
  span {
    color: #ffcc00;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;
  font-family: 'Lexend', sans-serif;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.2px;
  transition: all 0.2s;
  padding: 0.5rem 0;
  position: relative;
  font-family: 'Lexend', sans-serif;
  
  &:hover, &.active {
    color: #0066cc;
  }
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #0066cc;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const DownloadButton = styled(Link)`
  background-color: #ffcc00;
  color: #333;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  text-transform: uppercase;
  transition: all 0.3s;
  font-family: 'Lexend', sans-serif;
  letter-spacing: 0.1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #ffd633;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    margin: 0.5rem 0;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border-radius: 20px;
  border: 1px solid #eee;
  font-family: 'Lexend', sans-serif;
  width: 200px;
  transition: all 0.3s;
  background-color: #f9f9f9;
  
  &:focus {
    width: 250px;
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
    background-color: white;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    
    &:focus {
      width: 100%;
    }
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1rem;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BlogHeader = ({ activePage = '' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <HeaderContainer $scrolled={scrolled}>
      <HeaderContent>
        <Logo to="/">
          <img 
            src={logoImage} 
            alt="" 
          />
          <LogoText>Driver<span>on</span>Hire</LogoText>
        </Logo>
        
        <MobileMenuButton onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
        
        <RightSection>
          <SearchContainer>
            <form onSubmit={handleSearch}>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput 
                type="text"
                placeholder="Search blog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </SearchContainer>
          
          <Nav $isOpen={isMenuOpen}>
            <NavLink to="/" className={activePage === 'home' ? 'active' : ''}>
              Home
            </NavLink>
            <NavLink to="/blog" className={activePage === 'blog' ? 'active' : ''}>
              Blog
            </NavLink>
            
          </Nav>
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default BlogHeader; 
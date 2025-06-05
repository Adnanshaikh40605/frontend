import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logoWhiteImage from '../assets/logo-white.js';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';

const FooterContainer = styled.footer`
  background-color: #000;
  color: #fff;
  padding: 3rem 0 1.5rem;
  width: 100%;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
`;

const FooterLogo = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const FooterLogoImage = styled.img`
  height: 50px;
`;

const FooterLogoText = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: #fff;
  letter-spacing: -0.02em;
  margin-left: 0.5rem;
  
  span {
    color: #ffcc00;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  a {
    color: #fff;
    font-size: 1.5rem;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
`;

const Divider = styled.hr`
  width: 100%;
  border: none;
  height: 1px;
  background-color: #333;
  margin: 1rem 0;
`;

const Copyright = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: #ccc;
  padding-top: 1rem;
`;

const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: #ffcc00;
  color: #000;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
`;

const BlogFooter = () => {
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <FooterContainer>
      <FooterContent>
        <TopSection>
          <LogoSection>
            <FooterLogo to="/">
              <FooterLogoImage src={logoWhiteImage} alt="Logo" />
              <FooterLogoText>Driver<span>on</span>Hire</FooterLogoText>
            </FooterLogo>
          </LogoSection>
          
          <SocialLinks>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <YouTubeIcon />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <TwitterIcon />
            </a>
          </SocialLinks>
        </TopSection>
        
        <Divider />
        
        <Copyright>
          © {currentYear} All Rights Reserved By | Obey Jobs Private Limited
        </Copyright>
      </FooterContent>
      
      <ScrollToTopButton onClick={scrollToTop} aria-label="Scroll to top">
        ↑
      </ScrollToTopButton>
    </FooterContainer>
  );
};

export default BlogFooter; 
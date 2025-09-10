import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
  
  @media (max-width: 480px) {
    font-size: 4rem;
  }
`;

const ErrorMessage = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ErrorDescription = styled.p`
  font-size: 1.1rem;
  margin: 1rem 0 2rem 0;
  max-width: 500px;
  line-height: 1.6;
  opacity: 0.9;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const StyledButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const HomeButton = styled(StyledButton)`
  background-color: rgba(255, 255, 255, 0.9);
  color: #667eea;
  font-weight: 600;
  
  &:hover {
    background-color: white;
    color: #5a67d8;
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorMessage>Page Not Found</ErrorMessage>
      <ErrorDescription>
        The page you're looking for doesn't exist or has been moved. 
        Don't worry, even the best explorers sometimes take a wrong turn.
      </ErrorDescription>
      
      <ButtonGroup>
        <HomeButton as={Link} to="/">
          Go Home
        </HomeButton>
        <StyledButton onClick={handleGoBack}>
          Go Back
        </StyledButton>
        <StyledButton as={Link} to="/blog">
          View Blog
        </StyledButton>
      </ButtonGroup>
    </NotFoundContainer>
  );
};

export default NotFoundPage;

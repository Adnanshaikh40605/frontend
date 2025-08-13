import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  text-align: center;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  box-shadow: 0 8px 16px rgba(255, 107, 107, 0.3);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #0066cc, #004499);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #0056b3, #003d7a);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
    }
  ` : `
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e1e5e9;
    
    &:hover {
      background: #e9ecef;
      color: #495057;
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const CountdownText = styled.div`
  color: #999;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const SessionExpiredModal = ({ 
  isVisible, 
  onLoginRedirect, 
  onDismiss,
  autoRedirectSeconds = 10,
  title = "Session Expired",
  message = "Your session has expired for security reasons. Please log in again to continue.",
  showCountdown = true
}) => {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLoginRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, autoRedirectSeconds]);

  const handleLoginRedirect = () => {
    if (onLoginRedirect) {
      onLoginRedirect();
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <IconContainer>
          ⏰
        </IconContainer>
        
        <Title>{title}</Title>
        
        <Message>{message}</Message>
        
        <ButtonContainer>
          <Button $primary onClick={handleLoginRedirect}>
            Go to Login
          </Button>
          {onDismiss && (
            <Button onClick={handleDismiss}>
              Dismiss
            </Button>
          )}
        </ButtonContainer>
        
        {showCountdown && countdown > 0 && (
          <CountdownText>
            Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
          </CountdownText>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default SessionExpiredModal;
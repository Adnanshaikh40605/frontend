import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const IconContainer = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #ffa726, #ff9800);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 167, 38, 0.3);
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const TimeLeft = styled.div`
  background: #fff3e0;
  border: 1px solid #ffcc02;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #e65100;
  font-weight: 500;
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
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #0066cc, #004499);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #0056b3, #003d7a);
      transform: translateY(-1px);
    }
  ` : `
    background: #f8f9fa;
    color: #666;
    border: 1px solid #e1e5e9;
    
    &:hover {
      background: #e9ecef;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const SessionWarningModal = ({ 
  isVisible, 
  timeLeft, 
  onExtendSession, 
  onDismiss,
  onLogout,
  title = "Session Expiring Soon",
  message = "Your session will expire soon. Would you like to extend it?"
}) => {
  const [isExtending, setIsExtending] = useState(false);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      if (onExtendSession) {
        await onExtendSession();
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <IconContainer>
          ⚠️
        </IconContainer>
        
        <Title>{title}</Title>
        
        <Message>{message}</Message>
        
        {timeLeft && (
          <TimeLeft>
            Session expires in: <strong>{formatTime(timeLeft)}</strong>
          </TimeLeft>
        )}
        
        <ButtonContainer>
          <Button 
            $primary 
            onClick={handleExtendSession}
            disabled={isExtending}
          >
            {isExtending ? 'Extending...' : 'Extend Session'}
          </Button>
          
          {onDismiss && (
            <Button onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          
          {onLogout && (
            <Button onClick={onLogout}>
              Logout
            </Button>
          )}
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SessionWarningModal;
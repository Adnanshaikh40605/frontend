import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getSessionHealth, formatTimeRemaining } from '../utils/jwtUtils';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.$isExpiring) {
      return `
        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
        color: #856404;
        border: 1px solid #ffeaa7;
        animation: pulse 2s infinite;
      `;
    } else if (props.$isAuthenticated) {
      return `
        background: linear-gradient(135deg, #d1edff, #a8dadc);
        color: #0c5460;
        border: 1px solid #a8dadc;
      `;
    } else {
      return `
        background: linear-gradient(135deg, #f8d7da, #f5c6cb);
        color: #721c24;
        border: 1px solid #f5c6cb;
      `;
    }
  }}
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${props => {
    if (props.$isExpiring) {
      return `
        background: #ffc107;
        box-shadow: 0 0 6px rgba(255, 193, 7, 0.6);
      `;
    } else if (props.$isAuthenticated) {
      return `
        background: #28a745;
        box-shadow: 0 0 6px rgba(40, 167, 69, 0.6);
      `;
    } else {
      return `
        background: #dc3545;
        box-shadow: 0 0 6px rgba(220, 53, 69, 0.6);
      `;
    }
  }}
`;

const StatusText = styled.span`
  font-size: 0.8rem;
`;

const TimeLeft = styled.span`
  font-weight: 600;
  margin-left: 0.25rem;
`;

const formatTime = (seconds) => {
  if (!seconds || seconds <= 0) return '';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const SessionStatusIndicator = ({
  showTimeLeft = true,
  compact = false,
  className = ''
}) => {
  const { isAuthenticated } = useAuth();
  const sessionHealth = getSessionHealth();

  const isExpiring = sessionHealth.status === 'warning';
  const isHealthy = sessionHealth.status === 'healthy';

  return (
    <StatusContainer
      $isAuthenticated={isAuthenticated}
      $isExpiring={isExpiring}
      className={className}
      title={sessionHealth.message}
    >
      <StatusDot $isAuthenticated={isHealthy} $isExpiring={isExpiring} />

      {!compact && (
        <StatusText>
          {sessionHealth.status === 'warning' ? 'Expiring Soon' :
            sessionHealth.status === 'healthy' ? 'Active' :
              sessionHealth.status === 'expired' ? 'Expired' : 'Not Logged In'}
          {showTimeLeft && isExpiring && sessionHealth.timeLeft > 0 && (
            <TimeLeft>({formatTimeRemaining(sessionHealth.timeLeft)})</TimeLeft>
          )}
        </StatusText>
      )}
    </StatusContainer>
  );
};

export default SessionStatusIndicator;
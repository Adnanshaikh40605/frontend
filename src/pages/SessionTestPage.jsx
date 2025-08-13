import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import SessionStatusIndicator from '../components/SessionStatusIndicator';
import { isTokenExpired, parseJwt } from '../utils/authUtils';
import { getTokenInfo, getSessionHealth, debugTokens, JWT_CONFIG } from '../utils/jwtUtils';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const TestSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
  word-break: break-all;
`;

const Button = styled.button`
  background: ${props => props.$variant === 'danger' ? '#dc3545' : '#0066cc'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? '#c82333' : '#0056b3'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const LogContainer = styled.div`
  background: #1e1e1e;
  color: #f8f8f2;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 1rem;
`;

const LogEntry = styled.div`
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Timestamp = styled.span`
  color: #6272a4;
  margin-right: 0.5rem;
`;

const LogLevel = styled.span`
  color: ${props => {
    switch (props.$level) {
      case 'error': return '#ff5555';
      case 'warning': return '#f1fa8c';
      case 'info': return '#8be9fd';
      default: return '#f8f8f2';
    }
  }};
  font-weight: 600;
  margin-right: 0.5rem;
`;

const SessionTestPage = () => {
  const { 
    isAuthenticated, 
    currentUser, 
    sessionTimeLeft, 
    isSessionExpiring,
    logout 
  } = useAuth();
  
  const [tokenInfo, setTokenInfo] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (level, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), { timestamp, level, message }]);
  };

  useEffect(() => {
    const updateTokenInfo = () => {
      const jwtInfo = getTokenInfo();
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (jwtInfo.hasAccessToken) {
        setTokenInfo({
          accessToken: accessToken ? accessToken.substring(0, 50) + '...' : 'None',
          refreshToken: refreshToken ? refreshToken.substring(0, 50) + '...' : 'None',
          isAccessExpired: jwtInfo.accessTokenExpired,
          isRefreshExpired: jwtInfo.refreshTokenExpired,
          accessExpiry: jwtInfo.accessTokenExpiry ? jwtInfo.accessTokenExpiry.toLocaleString() : 'Unknown',
          refreshExpiry: jwtInfo.refreshTokenExpiry ? jwtInfo.refreshTokenExpiry.toLocaleString() : 'None',
          timeUntilAccessExpiry: jwtInfo.timeUntilAccessExpiry,
          timeUntilRefreshExpiry: jwtInfo.timeUntilRefreshExpiry,
          shouldRefresh: jwtInfo.shouldRefresh,
          shouldWarn: jwtInfo.shouldWarn
        });
      } else {
        setTokenInfo(null);
      }
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isSessionExpiring) {
      addLog('warning', `Session expiring in ${sessionTimeLeft} seconds`);
    }
  }, [isSessionExpiring, sessionTimeLeft]);

  const simulateExpiredToken = () => {
    // Set an expired token to test the expiration flow
    const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjAwMDAwMDAwLCJpYXQiOjE2MDAwMDAwMDAsImp0aSI6InRlc3QiLCJ1c2VyX2lkIjoxfQ.test';
    localStorage.setItem('accessToken', expiredToken);
    addLog('info', 'Set expired access token for testing');
  };

  const simulateNetworkRequest = async () => {
    try {
      addLog('info', 'Making authenticated API request...');
      const response = await fetch('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        addLog('info', 'API request successful');
      } else {
        addLog('error', `API request failed: ${response.status}`);
      }
    } catch (error) {
      addLog('error', `Network error: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <TestContainer>
      <h1>Session Expiration Test Page</h1>
      <p>This page helps test and monitor session expiration functionality.</p>

      <StatusBar>
        <div>
          <strong>Current Status:</strong>
        </div>
        <SessionStatusIndicator showTimeLeft={true} />
      </StatusBar>

      <TestSection>
        <SectionTitle>Authentication Status</SectionTitle>
        <InfoGrid>
          <InfoCard>
            <InfoLabel>Authenticated</InfoLabel>
            <InfoValue>{isAuthenticated ? 'Yes' : 'No'}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Current User</InfoLabel>
            <InfoValue>{currentUser?.username || 'None'}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Session Expiring</InfoLabel>
            <InfoValue>{isSessionExpiring ? 'Yes' : 'No'}</InfoValue>
          </InfoCard>
          <InfoCard>
            <InfoLabel>Time Until Expiry</InfoLabel>
            <InfoValue>{formatTime(sessionTimeLeft)}</InfoValue>
          </InfoCard>
        </InfoGrid>
      </TestSection>

      {tokenInfo && (
        <TestSection>
          <SectionTitle>Token Information</SectionTitle>
          <InfoGrid>
            <InfoCard>
              <InfoLabel>Access Token</InfoLabel>
              <InfoValue style={{ fontSize: '0.75rem' }}>{tokenInfo.accessToken}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Refresh Token</InfoLabel>
              <InfoValue style={{ fontSize: '0.75rem' }}>{tokenInfo.refreshToken}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Access Token Expired</InfoLabel>
              <InfoValue>{tokenInfo.isAccessExpired ? 'Yes' : 'No'}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Refresh Token Expired</InfoLabel>
              <InfoValue>{tokenInfo.isRefreshExpired ? 'Yes' : 'No'}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Access Token Expiry</InfoLabel>
              <InfoValue style={{ fontSize: '0.75rem' }}>{tokenInfo.accessExpiry}</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Refresh Token Expiry</InfoLabel>
              <InfoValue style={{ fontSize: '0.75rem' }}>{tokenInfo.refreshExpiry}</InfoValue>
            </InfoCard>
          </InfoGrid>
        </TestSection>
      )}

      <TestSection>
        <SectionTitle>Test Actions</SectionTitle>
        <div>
          <Button onClick={simulateExpiredToken}>
            Simulate Expired Token
          </Button>
          <Button onClick={simulateNetworkRequest}>
            Test API Request
          </Button>
          <Button $variant="danger" onClick={logout}>
            Logout
          </Button>
          <Button onClick={clearLogs}>
            Clear Logs
          </Button>
        </div>
      </TestSection>

      <TestSection>
        <SectionTitle>Activity Log</SectionTitle>
        <LogContainer>
          {logs.length === 0 ? (
            <div style={{ color: '#6272a4', fontStyle: 'italic' }}>
              No activity logged yet. Perform some actions to see logs here.
            </div>
          ) : (
            logs.map((log, index) => (
              <LogEntry key={index}>
                <Timestamp>{log.timestamp}</Timestamp>
                <LogLevel $level={log.level}>[{log.level.toUpperCase()}]</LogLevel>
                {log.message}
              </LogEntry>
            ))
          )}
        </LogContainer>
      </TestSection>

      <TestSection>
        <SectionTitle>How to Test</SectionTitle>
        <div style={{ lineHeight: '1.6' }}>
          <ol>
            <li><strong>Normal Flow:</strong> Log in and wait for the session warning (5 minutes before expiry)</li>
            <li><strong>Expired Token:</strong> Click "Simulate Expired Token" to test immediate expiration</li>
            <li><strong>API Requests:</strong> Click "Test API Request" to see how expired tokens are handled</li>
            <li><strong>Multiple Tabs:</strong> Open this page in multiple tabs to test cross-tab session sync</li>
            <li><strong>Network Issues:</strong> Disconnect internet and try API requests to test error handling</li>
          </ol>
          
          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Expected Behavior:</h4>
          <ul>
            <li>Session warning modal appears 5 minutes before expiration</li>
            <li>Session expired modal appears when token expires</li>
            <li>Automatic redirect to login page after 10 seconds</li>
            <li>Status indicator updates in real-time</li>
            <li>Cross-tab synchronization works properly</li>
          </ul>
        </div>
      </TestSection>
    </TestContainer>
  );
};

export default SessionTestPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--bg);
  padding: var(--spacing-4);
`;

const LoginCard = styled.div`
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 400px;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-8);
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--spacing-2);
  font-family: var(--font-family-primary);
`;

const Subtitle = styled.p`
  color: var(--text-muted);
  margin: 0;
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: var(--spacing-2);
  color: var(--text);
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: var(--spacing-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  min-height: 44px;
  background-color: var(--bg);
  color: var(--text);
  transition: var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  
  &:hover {
    color: var(--text);
    background-color: var(--surface);
  }
  
  &:focus {
    // outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
`;

const SubmitButton = styled.button`
  padding: var(--spacing-3);
  background-color: var(--primary);
  color: var(--primary-contrast);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  min-height: 44px;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-size: 1rem;
  
  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:focus {
    // outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  
  &:disabled {
    background-color: var(--text-muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Alert = styled.div`
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  background-color: ${props => props.$variant === 'warning' ? 'var(--warning-bg)' : 'var(--danger-bg)'};
  color: ${props => props.$variant === 'warning' ? 'var(--warning)' : 'var(--danger)'};
  border: 1px solid ${props => props.$variant === 'warning' ? 'var(--warning)' : 'var(--danger)'};
  font-size: 0.875rem;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');
  const { login, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  
  
  // Check for session expiration message
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionExpired = urlParams.get('sessionExpired');
    const stateMessage = location.state?.message;
    
    if (sessionExpired === 'true') {
      setSessionMessage('Your session has expired. Please log in again.');
    } else if (stateMessage) {
      setSessionMessage(stateMessage);
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Redirect to the page the user was trying to access, or to dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate, location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        // Login successful - redirect will happen via the useEffect
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <Logo>LOGO</Logo>
          <Subtitle>Blog CMS Admin Login</Subtitle>
        </LoginHeader>
        
        {sessionMessage && (
          <Alert $variant="warning">
            ⚠️ {sessionMessage}
          </Alert>
        )}
        
        {error && (
          <Alert $variant="danger">
            ❌ {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Username</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={isSubmitting}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Password</Label>
            <PasswordContainer>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isSubmitting}
                required
              />
              <PasswordToggle 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '🙈' : '👁️'}
              </PasswordToggle>
            </PasswordContainer>
          </FormGroup>
          
          <SubmitButton 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Logging in...
              </>
            ) : 'Login'}
          </SubmitButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #c53030 0%, #a02626 100%);
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #c53030;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #718096;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #c53030;
    box-shadow: 0 0 0 3px rgba(197, 48, 48, 0.1);
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #4a5568;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem;
  background-color: #c53030;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background-color: #a02626;
  }
  
  &:disabled {
    background-color: #718096;
    cursor: not-allowed;
  }
`;

const Alert = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  background-color: ${props => props.$variant === 'warning' ? '#fed7d7' : '#feb2b2'};
  color: ${props => props.$variant === 'warning' ? '#744210' : '#742a2a'};
  border: 1px solid ${props => props.$variant === 'warning' ? '#fbb6ce' : '#fc8181'};
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
      // Redirect to the page the user was trying to access, or to home
      const from = location.state?.from?.pathname || '/';
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
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Header className="bg-primary text-white text-center">
          <h4 className="mb-0">Login</h4>
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={isSubmitting}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isSubmitting}
                required
              />
            </Form.Group>
            
            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
                className="py-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Logging in...</span>
                  </>
                ) : 'Login'}
              </Button>
            </div>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center text-muted">
          <small>Secure login with JWT authentication</small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default LoginPage; 
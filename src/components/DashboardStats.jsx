import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { dashboardAPI } from '../api/apiService';

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
`;

const WelcomeSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem 0;
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.025em;
  text-align: center;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
  text-align: center;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => {
    switch(props.$color) {
      case 'blue': return '#e0f2fe';
      case 'green': return '#e8f5e8';
      case 'orange': return '#fff3e0';
      case 'red': return '#ffebee';
      case 'purple': return '#f3e5f5';
      case 'yellow': return '#fffde7';
      default: return '#f8fafc';
    }
  }};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid ${props => {
    switch(props.$color) {
      case 'blue': return '#b3e5fc';
      case 'green': return '#c8e6c9';
      case 'orange': return '#ffcc02';
      case 'red': return '#ffcdd2';
      case 'purple': return '#e1bee7';
      case 'yellow': return '#fff59d';
      default: return '#e2e8f0';
    }
  }};
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const StatContent = styled.div`
  text-align: center;
  position: relative;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => {
    switch(props.$color) {
      case 'blue': return '#0277bd';
      case 'green': return '#2e7d32';
      case 'orange': return '#f57c00';
      case 'red': return '#c62828';
      case 'purple': return '#7b1fa2';
      case 'yellow': return '#f9a825';
      default: return '#374151';
    }
  }};
  line-height: 1;
  margin-bottom: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${props => {
    switch(props.$color) {
      case 'blue': return '#01579b';
      case 'green': return '#1b5e20';
      case 'orange': return '#e65100';
      case 'red': return '#b71c1c';
      case 'purple': return '#4a148c';
      case 'yellow': return '#f57f17';
      default: return '#1f2937';
    }
  }};
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
`;

const StatDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => {
    switch(props.$color) {
      case 'blue': return '#0277bd';
      case 'green': return '#2e7d32';
      case 'orange': return '#f57c00';
      case 'red': return '#c62828';
      case 'purple': return '#7b1fa2';
      case 'yellow': return '#f9a825';
      default: return '#6b7280';
    }
  }};
  font-weight: 400;
  opacity: 0.8;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 1rem;
  color: #c53030;
  text-align: center;
  margin: 2rem 0;
`;

const QuickActions = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
`;

const QuickActionsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button`
  background: #ffffff;
  color: #374151;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }
`;

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    // Navigate to different pages based on action
    switch (action) {
      case 'create':
        window.location.href = '/admin/posts/new';
        break;
      case 'manage':
        window.location.href = '/admin/posts';
        break;
      case 'comments':
        window.location.href = '/admin/comments';
        break;
      case 'blog':
        window.location.href = '/blog';
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorContainer>
          {error}
          <button 
            onClick={fetchStats}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </ErrorContainer>
      </DashboardContainer>
    );
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.total_posts || 0,
      color: 'blue',
      description: 'All blog posts'
    },
    {
      title: 'Published Posts',
      value: stats?.published_posts || 0,
      color: 'green',
      description: 'Live on your blog'
    },
    {
      title: 'Draft Posts',
      value: stats?.draft_posts || 0,
      color: 'orange',
      description: 'Work in progress'
    },
    {
      title: 'Total Comments',
      value: stats?.total_comments || 0,
      color: 'purple',
      description: 'All comments received'
    },
    {
      title: 'Pending Comments',
      value: stats?.pending_comments || 0,
      color: 'red',
      description: 'Awaiting approval'
    },
    {
      title: 'Categories',
      value: stats?.total_categories || 0,
      color: 'yellow',
      description: 'Content categories'
    }
  ];

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome to Your Dashboard</WelcomeTitle>
      </WelcomeSection>

      <StatsGrid>
        {statCards.map((card, index) => (
          <StatCard key={index} $color={card.color}>
            <StatContent>
              <StatValue $color={card.color}>{card.value}</StatValue>
              <StatLabel $color={card.color}>{card.title}</StatLabel>
              <StatDescription $color={card.color}>{card.description}</StatDescription>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <QuickActions>
        <QuickActionsTitle>Quick Actions</QuickActionsTitle>
        <ActionButtons>
          <ActionButton onClick={() => handleQuickAction('create')}>
            ✏️ Create New Post
          </ActionButton>
          <ActionButton onClick={() => handleQuickAction('manage')}>
            📋 Manage Posts
          </ActionButton>
          <ActionButton onClick={() => handleQuickAction('comments')}>
            💬 Moderate Comments
          </ActionButton>
          <ActionButton onClick={() => handleQuickAction('blog')}>
            👁️ View Blog
          </ActionButton>
        </ActionButtons>
      </QuickActions>
    </DashboardContainer>
  );
};

export default DashboardStats;

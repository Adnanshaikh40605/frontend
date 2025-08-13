import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import DashboardLayout from '../components/DashboardLayout';



const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-top: 3px solid #c53030;
  position: relative;
`;

const StatValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const ManagementSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ManagementCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-top: 3px solid #c53030;
`;

const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: #fed7d7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const CardButton = styled(Button)`
  background-color: #4a5568;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    background-color: #2d3748;
    color: white;
  }
`;

const RecentSection = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const BlogCard = styled.div`
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 1rem;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
`;

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 9,
    published: 9,
    comments: 0,
    pending: 0
  });

  // Mock data for demonstration - in real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setStats({
      totalPosts: 9,
      published: 9,
      comments: 0,
      pending: 0
    });
  }, []);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h1>Please log in to access the dashboard</h1>
          <Button as={Link} to="/login">Login</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Dashboard Overview" 
      subtitle="Quick access to your blog's performance metrics and management tools"
      showContentWrapper={false}
    >

        <StatsContainer>
          <StatCard>
            <StatValue>{stats.totalPosts}</StatValue>
            <StatLabel>Total Posts</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.published}</StatValue>
            <StatLabel>Published</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.comments}</StatValue>
            <StatLabel>Comments</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatCard>
        </StatsContainer>

        <ManagementSection>
          <ManagementCard>
            <CardIcon>📝</CardIcon>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Create, edit, and manage all your blog posts. Control publication status and organize your content effectively.
            </CardDescription>
            <CardButton as={Link} to="/admin/posts">
              Manage Posts
            </CardButton>
          </ManagementCard>

          <ManagementCard>
            <CardIcon>💬</CardIcon>
            <CardTitle>Comment Moderation</CardTitle>
            <CardDescription>
              Approve or reject comments, respond to readers, and manage the conversation around your content.
            </CardDescription>
            <CardButton as={Link} to="/admin/comments">
              Moderate Comments
            </CardButton>
          </ManagementCard>

          <ManagementCard>
            <CardIcon>📊</CardIcon>
            <CardTitle>Analytics & Insights</CardTitle>
            <CardDescription>
              Track post performance, audience engagement, and reader demographics to optimize your content strategy.
            </CardDescription>
            <CardButton as={Link} to="/blog">
              View Analytics
            </CardButton>
          </ManagementCard>
        </ManagementSection>

        <RecentSection>
          <SectionTitle>Recent Blogs</SectionTitle>
          <BlogGrid>
            <BlogCard>Blog Post Preview 1</BlogCard>
            <BlogCard>Blog Post Preview 2</BlogCard>
            <BlogCard>Blog Post Preview 3</BlogCard>
          </BlogGrid>
        </RecentSection>
    </DashboardLayout>
  );
};

export default HomePage; 
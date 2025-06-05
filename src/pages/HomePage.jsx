import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import BlogPostCard from '../components/BlogPostCard';
import Button from '../components/Button';
import { useBlog } from '../context/BlogContext';

const HomeContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #0066cc 0%, #004c99 100%);
  color: white;
  padding: 5rem 2rem;
  border-radius: 12px;
  margin: 2rem 0 4rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(45deg);
  }
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
    margin: 1.5rem 0 3rem;
  }
  
  @media (max-width: 480px) {
    padding: 3rem 1rem;
    margin: 1rem 0 2rem;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #ffffff, #e6f2ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  max-width: 800px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  width: 100%;
  max-width: 500px;
  justify-content: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    max-width: 280px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  color: #333;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 4px;
    background-color: #0066cc;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const SectionDescription = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  max-width: 800px;
`;

const PostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
  width: 100%;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Message = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 3rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-bottom: 1.5rem;
    color: #adb5bd;
    font-size: 2.5rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
  
  @media (max-width: 576px) {
    padding: 2rem 1rem;
  }
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  color: #0066cc;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 102, 204, 0.1);
    transform: translateX(5px);
  }
  
  svg {
    transition: transform 0.2s;
  }
  
  &:hover svg {
    transform: translateX(3px);
  }
`;

const SectionContainer = styled.section`
  margin-bottom: 5rem;
  
  &:last-child {
    margin-bottom: 2rem;
  }
`;

const DashboardSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const DashboardCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0066cc, #4da6ff);
    border-radius: 4px 4px 0 0;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: rgba(0, 102, 204, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #0066cc;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const CardDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #0066cc;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
`;

const HomePage = () => {
  const { fetchPosts, loading, error } = useBlog();
  const [recentPosts, setRecentPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalComments: 0,
    pendingComments: 0
  });
  
  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        // Only fetch recent published posts limited to 3
        const data = await fetchPosts('published');
        
        // Only update state if data is valid (handle server errors)
        if (data && Array.isArray(data)) {
          setRecentPosts(data.slice(0, 3)); // Only show 3 most recent posts
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalPosts: data.length,
            publishedPosts: data.filter(post => post.published).length
          }));
        } else {
          console.warn('Received invalid data format from API');
          setRecentPosts([]);
        }
      } catch (err) {
        console.error('Error loading blog posts:', err);
        // Ensure we have empty posts array on error
        setRecentPosts([]);
      }
    };
    
    loadRecentPosts();
  }, [fetchPosts]);
  
  return (
    <HomeContainer>
      <Hero>
        <Title>Welcome to Blog CMS</Title>
        <Subtitle>
          Manage your blog content, view analytics, and engage with your audience all in one place
        </Subtitle>
        <ButtonContainer>
          <Button $variant="accent" as={Link} to="/posts/new" $fullWidth size="large">
            Create New Post
          </Button>
          <Button $variant="accent" as={Link} to="/blog" $fullWidth size="large">
            View Public Blog
          </Button>
        </ButtonContainer>
      </Hero>
      
      <SectionContainer>
        <SectionTitle>Dashboard Overview</SectionTitle>
        <SectionDescription>
          Quick access to your blog's performance metrics and management tools
        </SectionDescription>
        
        <StatsContainer>
          <StatCard>
            <StatValue>{stats.totalPosts}</StatValue>
            <StatLabel>Total Posts</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.publishedPosts}</StatValue>
            <StatLabel>Published</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalComments || '0'}</StatValue>
            <StatLabel>Comments</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pendingComments || '0'}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatCard>
        </StatsContainer>
        
        <DashboardSection>
          <DashboardCard>
            <CardIcon>📝</CardIcon>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Create, edit, and manage all your blog posts. Control publication status and organize your content effectively.
            </CardDescription>
            <Button $variant="primary" as={Link} to="/posts">
              Manage Posts
            </Button>
          </DashboardCard>
          
          <DashboardCard>
            <CardIcon>💬</CardIcon>
            <CardTitle>Comment Moderation</CardTitle>
            <CardDescription>
              Approve or reject comments, respond to readers, and manage the conversation around your content.
            </CardDescription>
            <Button $variant="primary" as={Link} to="/comments">
              Moderate Comments
            </Button>
          </DashboardCard>
          
          <DashboardCard>
            <CardIcon>📊</CardIcon>
            <CardTitle>Analytics & Insights</CardTitle>
            <CardDescription>
              Track post performance, audience engagement, and reader demographics to optimize your content strategy.
            </CardDescription>
            <Button $variant="primary" as={Link} to="/analytics">
              View Analytics
            </Button>
          </DashboardCard>
        </DashboardSection>
      </SectionContainer>
      
      <SectionContainer>
        <SectionTitle>Recent Blog Posts</SectionTitle>
        <SectionDescription>
          Your latest published articles ready for readers
        </SectionDescription>
        
        {loading ? (
          <Message>Loading recent posts...</Message>
        ) : error ? (
          <Message>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>Error loading posts. Please try again later.</p>
            <Button $variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Message>
        ) : recentPosts.length > 0 ? (
          <>
            <PostGrid>
              {recentPosts.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </PostGrid>
            <ViewAllLink to="/posts">
              View All Posts
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </ViewAllLink>
          </>
        ) : (
          <Message>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>No posts found. Start creating content for your blog!</p>
            <Button $variant="primary" as={Link} to="/posts/new">
              Create First Post
            </Button>
          </Message>
        )}
      </SectionContainer>
    </HomeContainer>
  );
};

export default HomePage; 
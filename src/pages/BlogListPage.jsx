import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { postAPI } from '../api/apiService';
import DashboardLayout from '../components/DashboardLayout';
import SEO from '../components/SEO';
import Image from '../components/Image';
import placeholderImage from '../assets/placeholder-image.js';



const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 0;
  padding: 0 1rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }
  
  @media (min-width: 1400px) {
    gap: 2rem;
    padding: 0;
  }
`;

const BlogPost = styled.article`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const FeaturedImageContainer = styled.div`
  width: 100%;
  height: 180px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const FeaturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${BlogPost}:hover & {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${BlogPost}:hover & {
    opacity: 1;
  }
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
`;

const ReadTimeBadge = styled.span`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
`;

const NoImagePlaceholder = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  
  svg {
    width: 48px;
    height: 48px;
    opacity: 0.6;
  }
`;

const PostContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.85rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const PostDate = styled.span`
  display: flex;
  align-items: center;
  color: #666;
  font-weight: 500;
  
  &::before {
    content: '📅';
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  color: #666;
  font-weight: 500;
  
  &::before {
    content: '👤';
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
`;

const PostTitle = styled.h2`
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 0.75rem;
  font-weight: 700;
  line-height: 1.3;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: #667eea;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const PostExcerpt = styled.p`
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReadMoreButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  align-self: flex-start;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.3);
  
  &::after {
    content: '→';
    margin-left: 0.4rem;
    transition: transform 0.2s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    
    &::after {
      transform: translateX(3px);
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: var(--spacing-16);
  color: var(--text-light);
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: var(--spacing-16);
  color: var(--danger);
  font-size: 1.1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  gap: 0.5rem;
  background: #ffffff;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    gap: 0.25rem;
  }
`;

const PageButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: ${props => props.$active ? '#667eea' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#4a5568'};
  border: 2px solid ${props => props.$active ? '#667eea' : 'transparent'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? '#5a67d8' : '#f7fafc'};
    border-color: ${props => props.$active ? '#5a67d8' : '#e2e8f0'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    background-color: transparent;
    border-color: transparent;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    min-width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
`;

// Add fade-in animation for smooth transitions
const FadeIn = styled.div`
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Add a loading overlay component
const LoadingOverlay = styled.div`
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Initialize cache for blog posts list
const postsCache = {
  data: null
};

const BlogListPage = () => {
  const location = useLocation();
  const [posts, setPosts] = useState(() => postsCache.data || []);
  const [loading, setLoading] = useState(!postsCache.data);
  const [visibleLoading, setVisibleLoading] = useState(!postsCache.data);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const initialLoad = useRef(!postsCache.data);
  const isMounted = useRef(true);
  const mainContentRef = useRef(null);
  
  // Check if this is a category page
  const isCategoryPage = location.pathname.startsWith('/blog/category/');
  const category = isCategoryPage ? decodeURIComponent(location.pathname.split('/blog/category/')[1]) : null;
  
  // Generate appropriate page title and description
  const pageTitle = category 
    ? `${category} Articles - Blog CMS`
    : 'Blog - Latest Articles and Insights';
  const pageDescription = category 
    ? `Read our latest articles about ${category.toLowerCase()} and stay updated with the newest trends and insights.`
    : 'Explore our blog for the latest articles, insights, and updates from our team.';

  // Define fetchPosts inside the component
  const fetchPosts = async () => {
    if (postsCache.data && initialLoad.current) {
      // Use cache for first load to prevent flickering
      setPosts(postsCache.data);
      setLoading(false);
      setVisibleLoading(false);
      initialLoad.current = false;
      
      // Still update in the background
      try {
        const data = await postAPI.getAll();
        if (isMounted.current) {
          // Ensure we're getting an array from the API response
          const postsArray = Array.isArray(data.results) ? data.results : 
                            (Array.isArray(data) ? data : []);
          postsCache.data = postsArray;
          setPosts(postsArray);
        }
      } catch (err) {
        console.error('Error updating cached blog posts:', err);
      }
      
      return;
    }
    
    try {
      setLoading(true);
      // Small delay before showing the loading overlay
      const loadingTimer = setTimeout(() => {
        if (isMounted.current && loading) {
          setVisibleLoading(true);
        }
      }, 200);
      
      const data = await postAPI.getAll();
      console.log('Fetched blog posts:', data);
      
      clearTimeout(loadingTimer);
      
      if (isMounted.current) {
        // Ensure we're getting an array from the API response
        const postsArray = Array.isArray(data.results) ? data.results : 
                          (Array.isArray(data) ? data : []);
        postsCache.data = postsArray;
        setPosts(postsArray);
        
        // Add a small delay before hiding loading states for smoother transition
        setTimeout(() => {
          if (isMounted.current) {
            setLoading(false);
            setVisibleLoading(false);
          }
        }, 300);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      if (isMounted.current) {
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
        setVisibleLoading(false);
      }
    }
  };

  // Handle page change for pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // In a real implementation, you would fetch posts for the new page
    // For now, we're just updating the page number
    window.scrollTo(0, 0);
  };

  // Scroll to top on navigation
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show the loading overlay
  useEffect(() => {
    if (loading && !visibleLoading && initialLoad.current) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setVisibleLoading(true);
        }
      }, 200);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading, visibleLoading]);

  useEffect(() => {
    isMounted.current = true;
    fetchPosts();
    
    return () => {
      isMounted.current = false;
    };
  }, []); // Only fetch once on mount

  useEffect(() => {
    if (!loading && posts.length === 0 && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [posts.length, currentPage, loading]);

  // Define totalPages
  const totalPages = Math.ceil(posts.length / 10);

  const renderContent = () => {
    if (loading && !posts.length) {
      return <LoadingMessage>Loading blog posts...</LoadingMessage>;
    }

    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
      <FadeIn>
        <BlogGrid>
          {posts.map(post => (
            <BlogPost key={post.id}>
              <FeaturedImageContainer>
                {(post.featured_image_url || post.featured_image) ? (
                  <FeaturedImage 
                    src={post.featured_image_url || post.featured_image} 
                    alt={post.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                ) : (
                  <NoImagePlaceholder>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </NoImagePlaceholder>
                )}
                <ImageOverlay />
                <CategoryBadge>
                  {post.category?.name || 'Blog'}
                </CategoryBadge>
                <ReadTimeBadge>
                  {post.read_time || '5 min read'}
                </ReadTimeBadge>
              </FeaturedImageContainer>
              <PostContent>
                <PostTitle>
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </PostTitle>
                <PostExcerpt>
                  {post.excerpt || 'Click to read more about our professional driving services and insights.'}
                </PostExcerpt>
                <PostMeta>
                  <PostDate>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </PostDate>
                  <AuthorInfo>
                    {post.author?.name || 'Admin'}
                  </AuthorInfo>
                </PostMeta>
                <ReadMoreButton to={`/blog/${post.slug}`}>
                  Read Article
                </ReadMoreButton>
              </PostContent>
            </BlogPost>
          ))}
        </BlogGrid>
      </FadeIn>
    );
  };

  return (
    <DashboardLayout 
      // title="Public Blog" 
      
      showContentWrapper={false}
    >
      {/* SEO Meta Tags */}
      <SEO 
        title={pageTitle}
        description={pageDescription}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        type="website"
      />
      
      <LoadingOverlay $isVisible={visibleLoading}>
        <Spinner />
      </LoadingOverlay>
      
      <div style={{ padding: '0.5rem 2rem', marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        {renderContent()}
        
        <Pagination>
          <PageButton 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton 
              key={page} 
              $active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PageButton>
          ))}
          
          <PageButton 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      </div>
    </DashboardLayout>
  );
};

export default BlogListPage;
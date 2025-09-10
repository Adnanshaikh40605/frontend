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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }
  
  @media (min-width: 1200px) {
    gap: 2rem;
    padding: 0;
  }
`;

const BlogPost = styled.article`
  background: var(--bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  height: 100%;
  display: flex;
  flex-direction: column;
  border-top: 3px solid var(--primary);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
`;

const FeaturedImageContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background-color: var(--surface-light);
`;

const FeaturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--text-light);
  font-size: 0.85rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const PostDate = styled.span`
  color: var(--text-light);
`;

const ReadTime = styled.span`
  color: var(--text-light);
  &:before {
    content: "•";
    margin: 0 var(--spacing-2);
  }
`;

const PostTitle = styled.h2`
  font-size: 1.4rem;
  color: var(--text);
  margin-bottom: var(--spacing-3);
  font-weight: 600;
  line-height: 1.3;

  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: var(--primary);
    }
  }
`;

const PostExcerpt = styled.p`
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: var(--spacing-6);
  flex-grow: 1;
`;

const ReadMoreButton = styled(Link)`
  display: inline-block;
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--primary);
  color: var(--text-inverse);
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.9rem;
  transition: var(--transition-smooth);
  align-self: flex-start;

  &:hover {
    background-color: var(--primary-hover);
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
  margin-top: var(--spacing-12);
  gap: var(--spacing-2);
  background: var(--surface);
  padding: var(--spacing-8);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
`;

const PageButton = styled.button`
  padding: var(--spacing-3) var(--spacing-4);
  background-color: ${props => props.$active ? 'var(--primary)' : 'var(--surface)'};
  color: ${props => props.$active ? 'var(--text-inverse)' : 'var(--text)'};
  border: 1px solid ${props => props.$active ? 'var(--primary)' : 'var(--border-color)'};
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-smooth);
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? 'var(--primary-dark)' : 'var(--surface-light)'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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
                {(post.featured_image_url || post.featured_image) && (
                  <FeaturedImage 
                    src={post.featured_image_url || post.featured_image} 
                    alt={post.title}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                )}
              </FeaturedImageContainer>
              <PostContent>
                <PostTitle>
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </PostTitle>
                <PostExcerpt>
                  {post.excerpt || 'Click to read more about our professional driving services and insights.'}
                </PostExcerpt>
                <PostMeta>
                  <PostDate>{new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</PostDate>
                  <ReadTime>{post.read_time || '5 min read'}</ReadTime>
                </PostMeta>
                <ReadMoreButton to={`/blog/${post.slug}`}>
                  Read More
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
      title="Public Blog" 
      
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
      
      <div style={{ padding: '2rem', marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
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
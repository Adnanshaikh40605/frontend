import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { postAPI } from '../api/apiService';
import DashboardLayout from '../components/DashboardLayout';
import SEO from '../components/SEO';
import Image from '../components/Image';
import placeholderImage from '../assets/placeholder-image.js';

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BlogTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
`;

const BlogSubtitle = styled.p`
  font-size: 1.1rem;
  color: #718096;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const SearchContainer = styled.div`
  max-width: 550px;
  margin: 2rem auto;
  position: relative;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #c53030;
    box-shadow: 0 0 0 3px rgba(197, 48, 48, 0.1);
  }
`;

const SearchTypeSelector = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  gap: 1rem;
`;

const SearchTypeButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: ${props => props.$active ? '#c53030' : '#718096'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  border-bottom: 2px solid ${props => props.$active ? '#c53030' : 'transparent'};
  
  &:hover {
    color: #c53030;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const SearchButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  padding: 13px 1rem;
  background-color: #c53030;
  color: white;
  border: none;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: #0055aa;
  }
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const BlogPost = styled.article`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-top: 3px solid #c53030;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const FeaturedImageContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background-color: #f3f3f3;
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
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #718096;
  font-size: 0.85rem;
`;

const PostDate = styled.span`
  color: #718096;
`;

const ReadTime = styled.span`
  color: #718096;
  &:before {
    content: "•";
    margin: 0 0.5rem;
  }
`;

const PostTitle = styled.h2`
  font-size: 1.4rem;
  color: #2d3748;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.3;

  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #c53030;
    }
  }
`;

const PostExcerpt = styled.p`
  color: #4a5568;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
`;

const ReadMoreButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #c53030;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover {
    background-color: #ffd633;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: #666;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: #dc3545;
  font-size: 1.1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  gap: 0.5rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PageButton = styled.button`
  padding: 0.75rem 1rem;
  background-color: ${props => props.$active ? '#c53030' : 'white'};
  color: ${props => props.$active ? 'white' : '#2d3748'};
  border: 1px solid ${props => props.$active ? '#c53030' : '#e2e8f0'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? '#a02626' : '#f7fafc'};
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
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
  border: 3px solid rgba(255, 204, 0, 0.3);
  border-radius: 50%;
  border-top-color: #ffcc00;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const initialLoad = useRef(!postsCache.data);
  const isMounted = useRef(true);
  const mainContentRef = useRef(null);
  const [searchType, setSearchType] = useState('title'); // 'title' or 'slug'
  
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
        // Add search parameters if present
        const params = {};
        if (searchQuery && searchType === 'title') {
          params.title = searchQuery;
        } else if (searchQuery && searchType === 'slug') {
          params.slug = searchQuery;
        }
        
        const data = await postAPI.getAll(params);
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
      
      // Add search parameters if present
      const params = {};
      if (searchQuery && searchType === 'title') {
        params.title = searchQuery;
      } else if (searchQuery && searchType === 'slug') {
        params.slug = searchQuery;
      }
      
      const data = await postAPI.getAll(params);
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
  }, [searchType]); // Only re-fetch when searchType changes, search button handles searchQuery changes

  useEffect(() => {
    if (!loading && posts.length === 0 && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [posts.length, currentPage, loading]);

  // Define totalPages
  const totalPages = Math.ceil(posts.length / 10);

  // Make sure posts is an array before filtering
  const filteredPosts = Array.isArray(posts) ? posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const renderContent = () => {
    if (loading && !posts.length) {
      return <LoadingMessage>Loading blog posts...</LoadingMessage>;
    }

    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    return (
      <FadeIn>
        <Header>
          <BlogTitle>{category ? `${category} Articles` : 'Our Blog'}</BlogTitle>
          <BlogSubtitle>
            {category
              ? `Explore our latest articles about ${category.toLowerCase()}`
              : 'Insights, news, and expert perspectives from our team to help you stay informed.'}
          </BlogSubtitle>
        </Header>
        
        <SearchContainer>
          <SearchInput 
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchTypeSelector>
            <SearchTypeButton 
              $active={searchType === 'title'}
              onClick={() => setSearchType('title')}
            >
              Title
            </SearchTypeButton>
            <SearchTypeButton 
              $active={searchType === 'slug'}
              onClick={() => setSearchType('slug')}
            >
              Slug
            </SearchTypeButton>
          </SearchTypeSelector>
          <SearchIcon aria-hidden="true"></SearchIcon>
          <SearchButton onClick={fetchPosts}>Search</SearchButton>
        </SearchContainer>

        <BlogGrid>
          {filteredPosts.map(post => (
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
      subtitle="Browse and read all published blog posts"
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
    </DashboardLayout>
  );
};

export default BlogListPage; 
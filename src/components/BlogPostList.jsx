import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import BlogPostCard from './BlogPostCard';
import SkeletonLoader from './SkeletonLoader';
import { postAPI } from '../api/apiService';

const PostsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  background-color: #fff8f8;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
  color: #dc3545;
`;

const LoadMoreButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  margin: 1rem auto;
  display: block;
  
  &:hover {
    background-color: #0055aa;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const LoaderContainer = styled.div`
  text-align: center;
  padding: 1rem;
`;

const BlogPostList = ({ 
  limit = 6, 
  loadMoreIncrement = 3, 
  showLoadMore = true,
  title = "Latest Posts",
  posts: initialPosts = [],
  maxPosts = null
}) => {
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [visiblePostCount, setVisiblePostCount] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Update useEffect to include visiblePostCount dependency
  useEffect(() => {
    if (initialPosts?.length > 0) {
      // Apply maxPosts limit if provided
      const effectivePosts = maxPosts ? initialPosts.slice(0, maxPosts) : initialPosts;
      const postsToShow = effectivePosts.slice(0, visiblePostCount);
      setVisiblePosts(postsToShow);
      setHasMore(effectivePosts.length > visiblePostCount);
    } else {
      setVisiblePosts([]);
      setHasMore(false);
    }
  }, [initialPosts, visiblePostCount, maxPosts]);

  // Fetch posts when component mounts or filter changes
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setError(null);
        
        // Use the postAPI service to fetch posts
        const response = await postAPI.getAll();
        
        // Handle the response
        if (response) {
          // Handle paginated response
          if (response.results && Array.isArray(response.results)) {
            setVisiblePosts(response.results);
            setHasMore(!!response.next);
          } else {
            // Handle direct array response
            setVisiblePosts(response);
            setHasMore(response.length > visiblePostCount);
          }
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      }
    };
    
    fetchPosts();
  }, [visiblePostCount]);

  // Handle load more click
  const handleLoadMore = () => {
    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisiblePostCount(prev => prev + loadMoreIncrement);
      setLoadingMore(false);
      
      // Check if we have more posts to show
      setHasMore(visiblePosts.length > visiblePostCount + loadMoreIncrement);
    }, 500);
  };

  // Show skeleton loader during initial load
  if (visiblePosts.length === 0) {
    return (
      <div>
        <h2>{title}</h2>
        <PostsContainer>
          <SkeletonLoader variant="card" count={limit} />
        </PostsContainer>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <div>
      <h2>{title}</h2>
      
      {visiblePosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <>
          <PostsContainer>
            {visiblePosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </PostsContainer>
          
          {showLoadMore && hasMore && (
            loadingMore ? (
              <LoaderContainer>
                <SkeletonLoader variant="text" width="120px" height="40px" />
              </LoaderContainer>
            ) : (
              <LoadMoreButton onClick={handleLoadMore}>
                Load More
              </LoadMoreButton>
            )
          )}
        </>
      )}
    </div>
  );
};

BlogPostList.propTypes = {
  limit: PropTypes.number,
  loadMoreIncrement: PropTypes.number,
  showLoadMore: PropTypes.bool,
  title: PropTypes.string,
  posts: PropTypes.array,
  maxPosts: PropTypes.number
};

export default BlogPostList; 
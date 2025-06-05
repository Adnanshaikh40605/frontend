import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useBlog } from '../context/BlogContext';
import CommentForm from '../components/CommentForm';
import Comment from '../components/Comment';
import { formatDate } from '../utils/dateUtils';
import { sanitizeBlogContent } from '../utils/sanitize';
import { generateTableOfContents, renderTocHtml, makeHeadingsClickable } from '../utils/tocGenerator';
import BlogHeader from '../components/BlogHeader';
import BlogFooter from '../components/BlogFooter';
import placeholderImage from '../assets/placeholder-image.js';
import { postAPI, mediaAPI } from '../api';
import usePostComments from '../hooks/usePostComments';

// Cache for blog posts to avoid refetching
const postCache = new Map();

// Function to clear cache for a specific slug
export const clearPostCache = (slug) => {
  if (slug) {
    postCache.delete(slug);
  }
};

// Function to clear the entire post cache
export const clearAllPostCache = () => {
  postCache.clear();
};

const PageContainer = styled.div`
  font-family: 'Lexend', sans-serif;
  background-color: #fff;
`;

const MainContent = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Breadcrumb = styled.div`
  display: flex;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PostHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PostTitle = styled.h1`
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.3;
  font-weight: 600;
  font-family: 'Lexend', sans-serif;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 2rem;
`;

const PostDate = styled.span`
  color: #666;
`;

const ReadTime = styled.span`
  color: #666;
  &:before {
    content: "•";
    margin: 0 0.5rem;
  }
`;

const FeaturedImageContainer = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: 2rem;
  background-color: #f3f3f3;
  border-radius: 8px;
  overflow: hidden;
  
  &::before {
    content: "";
    display: block;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
  }
`;

const FeaturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const PostContent = styled.div`
  font-size: 1.05rem;
  line-height: 1.8;
  color: #444;
  font-family: 'Lexend', sans-serif;
  letter-spacing: -0.01em;
  
  h2 {
    font-size: 1.6rem;
    margin: 2rem 0 1rem;
    color: #333;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  h3 {
    font-size: 1.4rem;
    margin: 1.8rem 0 0.8rem;
    color: #333;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  blockquote {
    border-left: 4px solid #ffcc00;
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #555;
  }

  /* CKEditor 5 specific styles */
  figure {
    margin: 2rem 0;
    text-align: center;
    
    &.image {
      img {
        margin: 0 auto;
      }
    }
    
    figcaption {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
  }
  
  figure.table {
    overflow-x: auto;
    width: 100%;
    margin: 2rem 0;
    
    table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        border: 1px solid #e0e0e0;
        padding: 0.5rem;
      }
      
      th {
        background-color: #f5f5f5;
        font-weight: 600;
      }
      
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    }
    
    figcaption {
      font-style: italic;
      margin-top: 0.5rem;
      text-align: center;
      font-size: 0.9rem;
      color: #666;
    }
  }
  
  pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1.5rem 0;
    
    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9rem;
    }
  }
  
  code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
  }
  
  .table-of-contents {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
    margin: 2rem 0;
    
    ol, ul {
      margin-bottom: 0;
    }
  }
  
  iframe {
    max-width: 100%;
    margin: 1.5rem 0;
    border: none;
    border-radius: 8px;
  }
  
  .article-navigation-section {
    margin: 3rem 0 2rem;
    border-top: 1px solid #eaeaea;
    padding-top: 2rem;
  }
  
  .toc-description {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
    margin-top: 1rem;
    font-style: italic;
  }
`;

const ShareSection = styled.div`
  margin: 3rem 0;
  padding: 1.5rem;
  background: #f8f8f8;
  border-radius: 8px;
  text-align: center;
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #333;
  }
`;

const ShareButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ShareButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
  
  &.twitter {
    background-color: #1DA1F2;
    color: white;
  }
  
  &.facebook {
    background-color: #4267B2;
    color: white;
  }
  
  &.linkedin {
    background-color: #0077B5;
    color: white;
  }
`;

const RelatedPostsSection = styled.div`
  margin-top: 3rem;
  
  h2 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }
`;

const RelatedPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const RelatedPostCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const RelatedPostImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const RelatedPostContent = styled.div`
  padding: 1rem;
`;

const RelatedPostTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  
  a {
    color: #333;
    text-decoration: none;
    
    &:hover {
      color: #0066cc;
    }
  }
`;

const RelatedPostMeta = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const Message = styled.p`
  text-align: center;
  color: #666;
  padding: 2rem;
  background-color: #f8f9f9;
  border-radius: 8px;
  margin: 2rem 0;
`;

const PageSubtitle = styled.p`
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const CtaSection = styled.div`
  margin: 3rem 0;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CtaButton = styled.a`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #ffcc00;
  color: #333;
  font-weight: 600;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #ffd633;
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

const CommentsSection = styled.div`
  margin-top: 3rem;
  border-top: 1px solid #eaeaea;
  padding-top: 2rem;
`;

const CommentsHeader = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const CommentsList = styled.div`
  margin-bottom: 2rem;
`;

const LoadMoreButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin: 1rem auto;
  display: block;
  
  &:hover {
    background-color: #e5e5e5;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// New styled component for TOC
const TableOfContents = styled.div`
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #0066cc;
  font-family: 'Lexend', sans-serif;
  
  h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
    color: #333;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }
  
  .toc-list {
    padding-left: 1.5rem;
    margin-bottom: 0;
  }
  
  .toc-item {
    margin-bottom: 0.5rem;
    letter-spacing: -0.01em;
  }
  
  .toc-level-2 {
    margin-left: 1rem;
  }
  
  .toc-level-3 {
    margin-left: 2rem;
  }
  
  .toc-link {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const contentRef = useRef(null);
  const tocRef = useRef(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [showToc, setShowToc] = useState(false);
  const [tocItems, setTocItems] = useState([]);
  const { blogSettings } = useBlog();
  const { comments, loading: commentsLoading, fetchComments, submitComment } = usePostComments(post?.id, false);
  
  // Debug loading state
  useEffect(() => {
    console.log(`Loading state changed: ${loading}`);
  }, [loading]);
  
  // Generate table of contents from content
  const generateTableOfContentsFromContent = (content) => {
    if (!content) return [];
    
    try {
      // Create a temporary div to parse the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Find all headings (h1, h2, h3, h4, h5, h6)
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // If no headings, don't show TOC
      if (headings.length < 3) {
        setShowToc(false);
        return [];
      }
      
      // Generate TOC items
      const items = Array.from(headings).map((heading, index) => {
        // Add ID to heading if it doesn't have one
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }
        
        return {
          id: heading.id,
          text: heading.textContent,
          level: parseInt(heading.tagName.substring(1)),
        };
      });
      
      // Show TOC if we have enough items
      setShowToc(items.length >= 3);
      
      return items;
    } catch (error) {
      console.error('Error generating table of contents:', error);
      setShowToc(false);
      return [];
    }
  };
  
  // Load post data
  useEffect(() => {
    let isMounted = true;
    
    const loadPost = async () => {
      try {
        console.log(`Starting to load post with slug: ${slug}`);
        setLoading(true);
        setError(null);
        
        // Check if we should force refresh from location state
        const forceRefresh = location.state?.forceRefresh === true;
        if (forceRefresh) {
          console.log('Force refresh requested, clearing cache for this post');
          postCache.delete(slug);
          // Reset the state to avoid future forced refreshes
          window.history.replaceState({}, document.title);
        }
        
        // Check if we have the post in cache
        const cachedPost = postCache.get(slug);
        
        if (cachedPost && !forceRefresh) {
          console.log(`Found cached post: ${cachedPost.title}`);
          setPost(cachedPost);
          setTocItems(generateTableOfContentsFromContent(cachedPost.content));
          if (isMounted) {
            await fetchComments(cachedPost.id);
            getRelatedPosts(cachedPost);
            trackPostView(cachedPost.id);
            console.log('Setting loading to false (cached post)');
            setLoading(false);
          }
        } else {
          // Fetch post data
          console.log(`Fetching post with slug: ${slug}${forceRefresh ? ' (forced refresh)' : ''}`);
          try {
            const postData = await postAPI.getBySlug(slug);
            console.log('Post data received:', postData);
            
            if (!isMounted) {
              console.log('Component unmounted, aborting update');
              return;
            }
            
            if (postData) {
              // Cache the post
              postCache.set(slug, postData);
              setPost(postData);
              setTocItems(generateTableOfContentsFromContent(postData.content));
              
              if (isMounted) {
                await fetchComments(postData.id);
                getRelatedPosts(postData);
                trackPostView(postData.id);
              }
            } else {
              console.log('Post data not found');
              if (isMounted) {
                setError('Post not found');
                navigate('/blog', { replace: true });
              }
            }
          } catch (error) {
            console.error('Error fetching post:', error);
            if (isMounted) {
              setError('Post not found');
              navigate('/blog', { replace: true });
            }
          }
          
          if (isMounted) {
            console.log('Setting loading to false (fetched post)');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading post:', error);
        if (isMounted) {
          setError('Failed to load post');
          console.log('Setting loading to false (error case)');
          setLoading(false);
        }
      }
    };
    
    loadPost();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log('Effect cleanup - component unmounting');
      isMounted = false;
    };
  }, [slug, navigate, fetchComments, location.state]);

  // Placeholder for related posts function
  const getRelatedPosts = async (currentPost) => {
    try {
      // In a real implementation, you'd fetch related posts based on tags, category, etc.
      // For now, we'll return empty array or mock data
      if (currentPost && currentPost.id) {
        // This is just a placeholder - you would implement real logic here
        console.log(`Finding related posts for: ${currentPost.title}`);
      }
      return []; 
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  };
  
  // Placeholder for tracking views
  const trackPostView = async (postId) => {
    try {
      // Implement view tracking logic
      if (postId) {
        // This is just a placeholder - you would implement real tracking here
        console.log(`Tracking view for post ID: ${postId}`);
      }
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  };

  // Wrap handleKeyDown in useCallback
  const handleKeyDown = useCallback((e) => {
    // Navigation keyboard shortcuts
    if (e.altKey) {
      switch(e.key) {
        case 'ArrowLeft':
          navigate('/blog');
          break;
        default:
          break;
      }
    }
  }, [navigate]);

  // Now use it in useEffect
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Add back the share functions that were previously removed
  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = post?.title || 'Check out this post';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = post?.title || 'Check out this post';
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`, '_blank');
  };

  const renderContent = () => {
    if (loading && !post) {
      return <Message>Loading post...</Message>;
    }

    if (error || !post) {
      return (
        <>
          <Message>Failed to load this post. Please try again later.</Message>
          <Link to="/blog">← Back to Blog</Link>
        </>
      );
    }

    return (
      <FadeIn>
        <Breadcrumb>
          <Link to="/">Home</Link> / <Link to="/blog">Blog</Link> / <span>{post.title}</span>
        </Breadcrumb>
        
        <PostHeader>
          <PostTitle>{post.title}</PostTitle>
          <PostMeta>
            <PostDate>{formatDate(post.created_at)}</PostDate>
            <ReadTime>{post.read_time || '5 min read'}</ReadTime>
          </PostMeta>
        </PostHeader>
        
        {post.featured_image && (
          <FeaturedImageContainer>
            <FeaturedImage 
              src={post.featured_image_url || post.featured_image} 
              alt={post.title}
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.src = placeholderImage;
              }}
            />
          </FeaturedImageContainer>
        )}
        
        <PostContent 
          ref={contentRef}
          className="ck-content"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogContent(post.content) }} 
        />
        
        {/* Display Table of Contents if there are headings */}
        {showToc && (
          <div className="article-navigation-section">
            <TableOfContents 
              dangerouslySetInnerHTML={{ __html: renderTocHtml(tocItems, {
                listType: 'ol',
                maxDepth: 3,
                title: 'Article Navigation',
                className: 'end-of-article-toc'
              }) }} 
            />
            <p className="toc-description">Use this navigation to revisit sections of the article or quickly jump to topics of interest.</p>
          </div>
        )}
        
        <ShareSection>
          <h3>Share this post</h3>
          <ShareButtons>
            <ShareButton className="twitter" onClick={shareOnTwitter}>
              Twitter
            </ShareButton>
            <ShareButton className="facebook" onClick={shareOnFacebook}>
              Facebook
            </ShareButton>
            <ShareButton className="linkedin" onClick={shareOnLinkedIn}>
              LinkedIn
            </ShareButton>
            <ShareButton className="whatsapp" onClick={shareOnWhatsApp}>
              WhatsApp
            </ShareButton>
          </ShareButtons>
        </ShareSection>
        
        {relatedPosts.length > 0 && (
          <RelatedPostsSection>
            <h2>You might also like</h2>
            <RelatedPostsGrid>
              {relatedPosts.map(relatedPost => (
                <RelatedPostCard key={relatedPost.id}>
                  {relatedPost.featured_image && (
                    <RelatedPostImage 
                      src={mediaAPI.getImageUrl(relatedPost.featured_image)} 
                      alt={relatedPost.title}
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  )}
                  <RelatedPostContent>
                    <RelatedPostTitle>
                      <Link to={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                    </RelatedPostTitle>
                    <RelatedPostMeta>
                      {formatDate(relatedPost.created_at)} • {relatedPost.read_time || '5 min read'}
                    </RelatedPostMeta>
                  </RelatedPostContent>
                </RelatedPostCard>
              ))}
            </RelatedPostsGrid>
          </RelatedPostsSection>
        )}
        
        {/* Comment section - Updated to use our custom hook */}
        <CommentsSection>
          <CommentsHeader>Comments</CommentsHeader>
          
          <CommentForm 
            postId={post?.id}
            onCommentSubmitted={submitComment} 
          />
          
          {commentsLoading && comments.length === 0 ? (
            <Message>Loading comments...</Message>
          ) : comments.length > 0 ? (
            <CommentsList>
              {comments.map(comment => (
                <Comment 
                  key={comment.id} 
                  comment={comment} 
                  showActionButtons={false}
                />
              ))}
            </CommentsList>
          ) : (
            <Message>No comments yet. Be the first to comment!</Message>
          )}
        </CommentsSection>
      </FadeIn>
    );
  };

  return (
    <PageContainer>
      <LoadingOverlay $isVisible={loading}>
        <Spinner />
      </LoadingOverlay>
      <BlogHeader activePage="blog" />
      <MainContent>
        {renderContent()}
      </MainContent>
      <BlogFooter />
    </PageContainer>
  );
};

export default BlogPostPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';
import SEO from '../components/SEO';
import { postAPI, commentAPI } from '../api';
import { formatDate } from '../utils/dateUtils';
import placeholderImage from '../assets/placeholder-image.js';
import { useBlog } from '../context/hooks/useBlog';

const Container = styled.div`
  width: 100%;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 1rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderContainer = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const PostInfo = styled.div`
  display: flex;
  gap: 1rem;
  color: #6c757d;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background-color: ${props => props.$published ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$published ? '#155724' : '#721c24'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const FeaturedImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Content = styled.div`
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1.125rem;
  color: #333;
  
  h1, h2, h3, h4, h5, h6 {
    color: #222;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.25rem;
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1rem 0;
  }
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 2rem;
  }
  
  blockquote {
    border-left: 4px solid #e9ecef;
    padding-left: 1rem;
    font-style: italic;
    color: #6c757d;
    margin: 1.5rem 0;
  }
`;

const AdditionalImages = styled.div`
  margin-bottom: 2rem;
`;

const ImagesTitle = styled.h3`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const AdditionalImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CommentsSection = styled.div`
  margin-top: 3rem;
`;

const CommentsTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
`;

const CommentsList = styled.div`
  margin-bottom: 2rem;
`;

const Message = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 2rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1004;
`;

const ModalContent = styled.div`
  max-width: 90%;
  max-height: 90%;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  margin-left: auto;
  
  &:hover {
    text-decoration: underline;
  }
  
  svg {
    margin-right: 0.25rem;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ShareContainer = styled.div`
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
  
  &.whatsapp {
    background-color: #25D366;
    color: white;
  }
`;

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPost, loading, error } = useBlog();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Get the current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Extract a plain text excerpt from the post content for meta description and sharing
  const getPlainTextExcerpt = (content, maxLength = 160) => {
    if (!content) return '';
    // Remove HTML tags
    const plainText = content.replace(/<[^>]+>/g, ' ');
    // Truncate to max length
    if (plainText.length <= maxLength) return plainText;
    // Find the last space before maxLength
    const excerpt = plainText.substring(0, maxLength);
    const lastSpaceIndex = excerpt.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return excerpt.substring(0, lastSpaceIndex) + '...';
    }
    return excerpt + '...';
  };
  
  // Wrap fetchComments in useCallback
  const fetchComments = useCallback(async (postId) => {
    if (!postId) return;
    
    try {
      setCommentsLoading(true);
      // Call the API to fetch comments
      const response = await fetch(`/api/comments/?post=${postId}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setComments(data);
      } else if (data.results && Array.isArray(data.results)) {
        setComments(data.results);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, []);
  
  // Fetch post on mount
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);
  
  // Fetch comments when post changes
  useEffect(() => {
    if (post?.id) {
      fetchComments(post.id);
    }
  }, [post?.id, fetchComments, comments.length]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await postAPI.delete(id);
        navigate('/posts');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };
  
  const handlePublishToggle = async () => {
    try {
      await postAPI.update(id, {
        published: !post.published
      });
      setPost({
        ...post,
        published: !post.published
      });
    } catch (err) {
      console.error('Error updating post publish status:', err);
      alert('Failed to update post status. Please try again.');
    }
  };
  
  const handleCommentSubmitted = async (commentData) => {
    try {
      // Create the comment
      await commentAPI.create(commentData);
      // Refresh comments list
      await fetchComments(id);
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment. Please try again.');
    }
  };
  
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };
  
  const closeImageModal = () => {
    setSelectedImage(null);
  };
  
  // Handle refresh button click with feedback
  const handleRefreshComments = async () => {
    try {
      // First check if there are any approved comments in the database
      const approvedCheck = await commentAPI.checkApproved(id);
      console.log('Debug - Approved comments check before refresh:', approvedCheck);
      
      // Fetch the comments
      await fetchComments(id);
      
      // Show a message if there are approved comments in the database but none showing in the UI
      if (approvedCheck.counts.approved > 0 && comments.length === 0) {
        console.warn('Warning after refresh: There are approved comments in the database, but none were loaded in the UI');
        alert(`There are ${approvedCheck.counts.approved} approved comments in the database that couldn't be loaded. Please try again or contact support if the issue persists.`);
      }
    } catch (err) {
      console.error('Error refreshing comments:', err);
    }
  };
  
  // Add these share functions
  const shareOnTwitter = () => {
    const url = currentUrl;
    const text = post?.title || 'Check out this post';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = currentUrl;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = currentUrl;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };
  
  const shareOnWhatsApp = () => {
    const url = currentUrl;
    const text = post?.title || 'Check out this post';
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`, '_blank');
  };
  
  const handleShare = (platform) => {
    if (platform === 'twitter') shareOnTwitter();
    else if (platform === 'facebook') shareOnFacebook();
    else if (platform === 'linkedin') shareOnLinkedIn();
    else if (platform === 'whatsapp') shareOnWhatsApp();
  };
  
  if (loading) {
    return <Message>Loading post...</Message>;
  }
  
  if (error || !post) {
    return <Message>{error || 'Post not found'}</Message>;
  }
  
  const formattedDate = formatDate(post.created_at);
  const plainTextExcerpt = getPlainTextExcerpt(post.content);
  
  // Add a share section that uses the handleShare function
  const ShareSection = () => (
    <ShareContainer>
      <h3>Share this post:</h3>
      <ShareButtons>
        <ShareButton onClick={() => handleShare('twitter')}>Twitter</ShareButton>
        <ShareButton onClick={() => handleShare('facebook')}>Facebook</ShareButton>
        <ShareButton onClick={() => handleShare('linkedin')}>LinkedIn</ShareButton>
        <ShareButton onClick={() => handleShare('whatsapp')}>WhatsApp</ShareButton>
      </ShareButtons>
    </ShareContainer>
  );
  
  return (
    <Container>
      {/* SEO Meta Tags */}
      <SEO 
        title={post.title}
        description={plainTextExcerpt}
        image={post.featured_image_url || post.featured_image}
        url={currentUrl}
        published={post.created_at}
        modified={post.updated_at}
      />
      
      <BackLink to="/blog">← Back to Blog</BackLink>
      
      <HeaderContainer>
        <Title>{post.title}</Title>
        <PostInfo>
          <span>Published {formattedDate}</span>
          <StatusBadge $published={post.published}>
            {post.published ? 'Published' : 'Draft'}
          </StatusBadge>
        </PostInfo>
        
        <ButtonGroup>
          <Button onClick={() => navigate(`/posts/${id}/edit`)}>Edit</Button>
          <Button $variant="danger" onClick={handleDelete}>Delete</Button>
          <Button 
            $variant={post.published ? "warning" : "success"}
            onClick={handlePublishToggle}
          >
            {post.published ? 'Unpublish' : 'Publish'}
          </Button>
        </ButtonGroup>
      </HeaderContainer>
      
      {(post.featured_image_url || post.featured_image) && (
        <FeaturedImage 
          src={post.featured_image_url || post.featured_image} 
          alt={post.title}
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
        />
      )}
      
      <Content dangerouslySetInnerHTML={{ __html: post.content }} />
      
      <ShareSection />
      
      {post.images && post.images.length > 0 && (
        <AdditionalImages>
          <ImagesTitle>Additional Images</ImagesTitle>
          <ImageGrid>
            {post.images.map((image, index) => (
              <AdditionalImage 
                key={index}
                src={image.image}
                alt={`Additional image ${index + 1}`}
                onClick={() => openImageModal(image.image)}
                onError={(e) => {
                  e.target.src = placeholderImage;
                }}
              />
            ))}
          </ImageGrid>
        </AdditionalImages>
      )}
      
      <CommentsSection>
        <CommentHeader>
          <CommentsTitle>Comments</CommentsTitle>
          <RefreshButton onClick={handleRefreshComments} disabled={commentsLoading}>
            {commentsLoading ? 'Loading...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                  <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Refresh Comments
              </>
            )}
          </RefreshButton>
        </CommentHeader>
        
        <CommentsList>
          {commentsLoading ? (
            <Message>Loading comments...</Message>
          ) : comments.length === 0 ? (
            <Message>No comments yet. Be the first to comment!</Message>
          ) : (
            <>
              {comments.map(comment => (
                <Comment 
                  key={comment.id} 
                  comment={comment}
                  onApprove={() => {}}
                  onReject={() => {}}
                  showActionButtons={false}
                />
              ))}
            </>
          )}
        </CommentsList>
        
        <CommentForm 
          postId={id}
          onCommentSubmitted={handleCommentSubmitted}
        />
      </CommentsSection>
      
      {selectedImage && (
        <Modal onClick={closeImageModal}>
          <CloseButton onClick={closeImageModal}>✕</CloseButton>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalImage src={selectedImage} alt="Full size image" />
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PostDetailPage;
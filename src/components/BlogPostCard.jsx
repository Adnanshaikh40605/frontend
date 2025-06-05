import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatDate } from '../utils/dateUtils';
import { mediaAPI } from '../api';

const Card = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #0066cc, #4da6ff);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
`;

const ImageContainer = styled.div`
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  position: relative;
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CategoryTag = styled.span`
  display: inline-block;
  background-color: rgba(0, 102, 204, 0.1);
  color: #0066cc;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Title = styled.h3`
  font-size: 1.35rem;
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #333;
  line-height: 1.4;
  font-weight: 600;
  font-family: 'Lexend', sans-serif;
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Excerpt = styled.div`
  color: #666;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 1rem;
  line-height: 1.6;
  
  p {
    margin-top: 0;
  }
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #888;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
`;

const Date = styled.span`
  display: flex;
  align-items: center;
  
  &::before {
    content: '📅';
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
`;

const ReadMore = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  
  &::after {
    content: '→';
    margin-left: 0.5rem;
    transition: transform 0.2s;
  }
  
  &:hover {
    color: #004c99;
    
    &::after {
      transform: translateX(3px);
    }
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  transition: transform 0.5s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
  opacity: 0.7;
  transition: opacity 0.3s ease;
  
  ${Card}:hover & {
    opacity: 0.9;
  }
`;

const ReadTime = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const AuthorAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #666;
  font-size: 0.8rem;
`;

const AuthorName = styled.span`
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
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
  color: #666;
`;

const BlogPostCard = ({ post }) => {
  // Protect against undefined post object
  if (!post) {
    return null;
  }
  
  const imageUrl = post.featured_image 
    ? mediaAPI.getImageUrl(post.featured_image)
    : null;
  
  // Create a clean excerpt from the post content
  const createExcerpt = (content, maxLength = 150) => {
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
  
  const excerpt = post.content ? createExcerpt(post.content) : '';
  const formattedDate = formatDate(post.created_at);
  
  // Get author initial for avatar
  const getAuthorInitial = () => {
    if (post.author && post.author.name) {
      return post.author.name.charAt(0).toUpperCase();
    }
    return 'A';
  };
  
  // Get category (if available)
  const getCategory = () => {
    if (post.category) {
      return post.category;
    }
    return 'Blog';
  };
  
  // Get read time
  const getReadTime = () => {
    if (post.read_time) {
      return post.read_time;
    }
    // Calculate approximate read time based on content length
    if (post.content) {
      const words = post.content.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
      const readTimeMinutes = Math.ceil(words / 200); // Assuming 200 words per minute
      return `${readTimeMinutes} min read`;
    }
    return '5 min read';
  };
  
  return (
    <Card>
      <ReadTime>{getReadTime()}</ReadTime>
      
      {imageUrl ? (
        <ImageContainer>
          <PostImage
            src={imageUrl}
            alt={post.title}
            loading="lazy"
          />
          <ImageOverlay />
        </ImageContainer>
      ) : (
        <ImageContainer>
          <NoImagePlaceholder>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </NoImagePlaceholder>
        </ImageContainer>
      )}
      
      <CardContent>
        <CategoryTag>{getCategory()}</CategoryTag>
        
        <Title>{post.title}</Title>
        
        <AuthorInfo>
          <AuthorAvatar>{getAuthorInitial()}</AuthorAvatar>
          <AuthorName>{post.author?.name || 'Admin'}</AuthorName>
        </AuthorInfo>
        
        {excerpt && <Excerpt>{excerpt}</Excerpt>}
        
        <Meta>
          <Date>{formattedDate}</Date>
          <ReadMore to={post.slug ? `/blog/${post.slug}` : `/posts/${post.id}`}>
            Read Article
          </ReadMore>
        </Meta>
      </CardContent>
    </Card>
  );
};

BlogPostCard.propTypes = {
  post: PropTypes.object.isRequired,
};

export default BlogPostCard; 
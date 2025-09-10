import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { postAPI, mediaAPI } from '../api/apiService';
import DashboardLayout from '../components/DashboardLayout';
import SEO from '../components/SEO';
import Image from '../components/Image';

const BlogContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-family: 'Lexend', sans-serif;
`;

const BlogHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const BlogTitle = styled.h1`
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 1rem;
  line-height: 1.3;
  font-weight: 600;
`;

const BlogContent = styled.div`
  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 2rem 0;
  }

  p {
    color: #444;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  h2, h3, h4, h5, h6 {
    color: #333;
    margin: 2rem 0 1rem;
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      color: #444;
      line-height: 1.6;
    }
  }

  blockquote {
    border-left: 4px solid #0066cc;
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #666;
  }

  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ShareSection = styled.div`
  margin: 3rem 0;
  padding: 1.5rem;
  background: #f8f8f8;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1.2rem;
    color: #333;
    font-weight: 600;
  }
`;

const ShareButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-wrap: wrap;
  }
`;

const ShareButton = styled.button`
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  min-width: 120px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
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

  svg {
    width: 18px;
    height: 18px;
  }
`;

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Get SEO title and description with fallbacks
  const getSEOTitle = () => {
    return post?.meta_title || post?.title || 'Blog Post';
  };

  const getSEODescription = () => {
    return post?.meta_description || post?.excerpt || getPlainTextExcerpt(post?.content);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postAPI.getById(id);
        setPost(response);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait while we load the blog post">
        <BlogContainer>
          <LoadingMessage>Loading blog post...</LoadingMessage>
        </BlogContainer>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error" subtitle="There was an issue loading the blog post">
        <BlogContainer>
          <ErrorMessage>{error}</ErrorMessage>
        </BlogContainer>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout title="Not Found" subtitle="The requested blog post could not be found">
        <BlogContainer>
          <ErrorMessage>Blog post not found</ErrorMessage>
        </BlogContainer>
      </DashboardLayout>
    );
  }
  
  const plainTextExcerpt = getPlainTextExcerpt(post.content);
  const imageUrl = post.featured_image_url || (post.featured_image ? mediaAPI.getImageUrl(post.featured_image) : null);
  
  // Add share functions
  const shareOnTwitter = () => {
    const url = currentUrl;
    const text = post?.title || 'Check out this blog post';
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
    const text = post?.title || 'Check out this blog post';
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <DashboardLayout 
      title="Blog Post" 
      subtitle="Read the full blog post content"
      showContentWrapper={false}
    >
      <div style={{ padding: '2rem', marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
        <BlogContainer>
      {/* SEO Meta Tags */}
      <SEO 
        title={getSEOTitle()}
        description={getSEODescription()}
        image={post.featured_image_url || post.featured_image}
        url={currentUrl}
        published={post.created_at}
        modified={post.updated_at}
        type="article"
      />
      
      <BackLink to="/blog">← Back to Blog</BackLink>
      
      <BlogHeader>
        <PostMeta>
          <PostDate>{new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</PostDate>
          <ReadTime>{post.read_time || '5 min read'}</ReadTime>
        </PostMeta>
        <BlogTitle>{post.title}</BlogTitle>
      </BlogHeader>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={post.title}
          aspectRatio="16/9"
          borderRadius="8px"
        />
      )}

      <BlogContent dangerouslySetInnerHTML={{ __html: post.content }} />
      
      {/* Replace SocialShare with improved share section */}
      <ShareSection>
        <h3>Share this article</h3>
        <ShareButtons>
          <ShareButton className="twitter" onClick={shareOnTwitter}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Twitter
          </ShareButton>
          <ShareButton className="facebook" onClick={shareOnFacebook}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </ShareButton>
          <ShareButton className="linkedin" onClick={shareOnLinkedIn}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </ShareButton>
          <ShareButton className="whatsapp" onClick={shareOnWhatsApp}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </ShareButton>
        </ShareButtons>
      </ShareSection>
      </BlogContainer>
      </div>
    </DashboardLayout>
  );
};

export default BlogPage; 

1234
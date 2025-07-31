import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import RichTextEditor from '../components/RichTextEditor';
import Button from '../components/Button';
import CategoryModal from '../components/CategoryModal';
import { postAPI, categoriesAPI } from '../api/apiService';
import slugify from '../utils/slugify';
import { clearPostCache } from '../pages/BlogPostPage';
import CloseIcon from '@mui/icons-material/Close';

const Container = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    text-decoration: underline;
    color: #004c99;
  }
`;

const Title = styled.h1`
  font-size: 2.25rem;
  color: #333;
  margin-bottom: 2.5rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 2rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.9rem;
  border: 1px solid #dce0e5;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &[type="file"] {
    padding: 0.7rem;
    background-color: #f8f9fa;
    cursor: pointer;
    border: 1px dashed #dce0e5;
    
    &:hover {
      background-color: #f1f3f5;
    }
  }
  
  &[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const ImagePreviewContainer = styled.div`
  margin-top: 1.25rem;
`;

const ImagePreview = styled.div`
  width: 100%;
  max-width: 300px;
  background-color: #f8f9fa;
  border: 1px solid #dce0e5;
  border-radius: 6px;
  padding: 0.5rem;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PreviewImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  border-radius: 4px;
`;

const PreviewImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 4px;
  display: block;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s;
  padding: 0;
  
  svg {
    font-size: 16px;
  }
  
  &:hover {
    background-color: #c82333;
  }
`;

const AdditionalImagesContainer = styled.div`
  margin-top: 1.25rem;
`;

const AdditionalImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
`;

const ImageContainer = styled.div`
  position: relative;
`;

const ErrorContainer = styled.div`
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  margin-bottom: 1.5rem;
`;

const SuccessContainer = styled.div`
  padding: 1rem;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  margin-bottom: 1.5rem;
`;

const SuccessMessage = styled.p`
  color: #155724;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
`;

const ErrorMessage = styled.p`
  color: #721c24;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-top: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const StyledButton = styled(Button)`
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 6px;
  transition: transform 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ImageUploadLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .upload-hint {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #0d6efd;
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px #0d6efd;
  }
  
  input:checked + .slider:before {
    transform: translateX(22px);
  }
`;

const PublishOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionDivider = styled.hr`
  border: 0;
  height: 1px;
  background-color: #e9ecef;
  margin: 0;
`;

const SlugInputGroup = styled.div`
  position: relative;
`;

const SlugValidationMessage = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: ${props => props.$isValid ? '#28a745' : '#dc3545'};
  display: flex;
  align-items: center;
`;

const SlugInputWithValidation = styled(Input)`
  padding-right: ${props => props.$showValidation ? '150px' : '0.9rem'};
  border-color: ${props => {
    if (!props.$touched) return '#dce0e5';
    return props.$isValid ? '#28a745' : '#dc3545';
  }};
  
  &:focus {
    border-color: ${props => {
      if (!props.$touched) return '#80bdff';
      return props.$isValid ? '#28a745' : '#dc3545';
    }};
    box-shadow: 0 0 0 2px ${props => {
      if (!props.$touched) return 'rgba(0, 123, 255, 0.25)';
      return props.$isValid ? 'rgba(40, 167, 69, 0.25)' : 'rgba(220, 53, 69, 0.25)';
    }};
  }
`;

// Category Selection Styles
const CategorySelectionContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
`;

const CategorySelect = styled.select`
  flex: 1;
  padding: 0.9rem;
  border: 1px solid #dce0e5;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const AddCategoryButton = styled.button`
  padding: 0.9rem 1.2rem;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0056b3, #004085);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CategoryHelpText = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
  font-style: italic;
`;

const SmallSpinner = styled.span`
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PostFormPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: true,
    featured: false,
    category: null,
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugValidation, setSlugValidation] = useState({
    isChecking: false,
    isValid: true,
    message: ''
  });
  const [postIdentifier, setPostIdentifier] = useState(slug || id);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  useEffect(() => {
    // If slug or id is provided, fetch the post data for editing
    if (slug || id) {
      setIsEdit(true);
      fetchPost();
    }
    
    // Always fetch categories
    fetchCategories();
  }, [slug, id]);
  
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoriesAPI.getAll();
      
      if (response && response.results) {
        setCategories(response.results);
      } else if (response && Array.isArray(response)) {
        setCategories(response);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set some default categories as fallback
      setCategories([
        { id: 1, name: 'Technology', slug: 'technology' },
        { id: 2, name: 'Web Development', slug: 'web-development' },
        { id: 3, name: 'Programming', slug: 'programming' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      let data;
      
      // Try to get the post using the available identifier
      if (slug) {
        // Use getBySlug if slug is available (preferred)
        data = await postAPI.getBySlug(slug);
        setPostIdentifier(data.slug);
      } else if (id) {
        // Fallback to getById if only ID is available
        data = await postAPI.getById(id);
        setPostIdentifier(data.slug);
        
        // Update the URL to use the slug instead of ID
        navigate(`/admin/posts/${data.slug}/edit`, { replace: true });
      }
      
      if (data) {
        setPost({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          published: data.published || true,
          featured: data.featured || false,
          category: data.category ? data.category.id : null,
        });
        
        if (data.featured_image) {
          setFeaturedImagePreview(data.featured_image);
        }
        
        if (data.images && data.images.length > 0) {
          const previews = data.images.map(img => img.image);
          setAdditionalImagePreviews(previews);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to fetch post data');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPost(prev => ({ ...prev, [name]: checked }));
    } else {
      setPost(prev => ({ ...prev, [name]: value }));
    }
    
    // Auto-generate slug from title if slug hasn't been manually edited
    if (name === 'title' && !slugEdited) {
      const generatedSlug = slugify(value, {
        lower: true,        // Convert to lowercase
        strict: true,       // Strip special characters
        remove: /[*+~.()'"!:@]/g, // Remove specific characters
        trim: true          // Trim leading/trailing spaces
      });
      
      // Truncate slug to fit database constraints (max 250 characters)
      const truncatedSlug = generatedSlug.substring(0, 250);
      
      setPost(prev => ({ ...prev, slug: truncatedSlug }));
    }
  };
  
  const checkSlugUniqueness = async (slug) => {
    if (!slug) return;
    
    try {
      setSlugValidation(prev => ({ ...prev, isChecking: true }));
      
      // Make API call to check if slug exists
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/posts/${slug}/`);
      
      if (response.status === 404) {
        // Slug doesn't exist, it's valid
        setSlugValidation({
          isChecking: false,
          isValid: true,
          message: 'Slug is available'
        });
      } else if (response.ok) {
        // Slug exists, check if it's the current post
        const data = await response.json();
        
        if (isEdit && data.id === parseInt(slug)) {
          // It's the current post, so slug is valid
          setSlugValidation({
            isChecking: false,
            isValid: true,
            message: 'Current slug'
          });
        } else {
          // Slug exists for another post
          setSlugValidation({
            isChecking: false,
            isValid: false,
            message: 'This slug is already taken'
          });
        }
      }
    } catch (error) {
      console.error('Error checking slug uniqueness:', error);
      // Assume valid in case of error to not block submission
      setSlugValidation({
        isChecking: false,
        isValid: true,
        message: ''
      });
    }
  };
  
  const handleSlugChange = (e) => {
    setSlugEdited(true);
    handleChange(e);
    
    // Debounce slug check
    const slug = e.target.value;
    if (slug) {
      // Clear any previous timeout
      if (window.slugCheckTimeout) {
        clearTimeout(window.slugCheckTimeout);
      }
      
      // Set a new timeout
      window.slugCheckTimeout = setTimeout(() => {
        checkSlugUniqueness(slug);
      }, 500); // Wait 500ms after typing stops
    }
  };
  
  // Add the onImageUpload handler function
  const handleImageUpload = async (file) => {
    try {
      // Create a temporary URL for the image
      const objectUrl = URL.createObjectURL(file);
      
      // In a real implementation, you would upload the file to your server
      // and return the URL of the uploaded image
      // For now, we'll just return the temporary URL
      return objectUrl;
      
      // Example of a real implementation:
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  // Process content to ensure Lexend font is applied
  const processContent = (content) => {
    // Create temporary container to process HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Apply Lexend font to all text elements
    const textElements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, td, th');
    textElements.forEach(el => {
      if (!el.style.fontFamily || !el.style.fontFamily.includes('Lexend')) {
        el.style.fontFamily = '"Lexend", sans-serif';
      }
    });
    
    return tempDiv.innerHTML;
  };
  
  // Handle editor content change with font processing
  const handleEditorChange = (content) => {
    const processedContent = processContent(content);
    setPost(prev => ({ ...prev, content: processedContent }));
    
    // Clear any success message that might be showing
    // This prevents "Post updated successfully" from showing when only editing content
    if (success) {
      setSuccess('');
    }
  };
  
  const handleFeaturedImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFeaturedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setFeaturedImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview('');
    
    // If we're editing, also clear the image from the post object
    if (isEdit) {
      setPost(prev => ({ ...prev, featured_image: null }));
    }
  };
  
  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAdditionalImages(prev => [...prev, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAdditionalImagePreviews(prev => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryCreated = async (categoryData) => {
    try {
      setLoadingCategories(true);
      
      // Create the category via API
      const newCategory = await categoriesAPI.create(categoryData);
      
      // Add the new category to the list
      setCategories(prev => [...prev, newCategory]);
      
      // Automatically select the new category
      setPost(prev => ({
        ...prev,
        category: newCategory.id
      }));
      
      // Show success message
      setSuccess(`Category "${newCategory.name}" created successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error creating category:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already exists')) {
        throw new Error('A category with this name already exists');
      } else if (error.message && error.message.includes('authentication')) {
        throw new Error('Authentication required. Please log in again.');
      } else {
        throw new Error('Failed to create category. Please try again.');
      }
    } finally {
      setLoadingCategories(false);
    }
  };
  
  const validate = () => {
    let isValid = true;
    let errorMessage = '';
    
    if (!post.title.trim()) {
      errorMessage = 'Title is required';
      isValid = false;
    } else if (!post.slug.trim()) {
      errorMessage = 'Slug is required';
      isValid = false;
    } else if (!slugValidation.isValid) {
      errorMessage = 'Please use a unique slug';
      isValid = false;
    } else if (!post.content.trim()) {
      errorMessage = 'Content is required';
      isValid = false;
    }
    
    if (!isValid) {
      setError(errorMessage);
      // Scroll to the top to show the error
      window.scrollTo(0, 0);
    } else {
      setError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create data object for submission
      const postData = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        published: post.published,
        featured: post.featured,
        category: post.category // Explicitly include category field
      };
      
      // Add featured image if present
      if (featuredImage) {
        postData.featured_image = featuredImage;
      }
      
      // Add additional images if present
      additionalImages.forEach((image, index) => {
        postData[`additional_images[${index}]`] = image;
      });
      
      console.log('Submitting post data:', postData);
      
      let result;
      let retryCount = 0;
      const maxRetries = 3;
      
      if (isEdit && postIdentifier) {
        // For update operations, implement retry logic
        while (retryCount < maxRetries) {
          try {
            result = await postAPI.update(postIdentifier, postData);
            setSuccess('Post updated successfully!');
            
            // Clear the post cache to ensure fresh data is loaded next time
            clearPostCache(postIdentifier);
            
            // Navigate after a short delay to show the success message
            setTimeout(() => {
              navigate('/admin/posts');
            }, 1500);
            
            // Break out of retry loop on success
            break;
          } catch (updateError) {
            retryCount++;
            console.error(`Update attempt ${retryCount} failed:`, updateError);
            
            if (retryCount >= maxRetries) {
              // Extract specific error messages if available
              if (updateError.response && updateError.response.detail) {
                throw new Error(`Update failed: ${updateError.response.detail}`);
              } else if (updateError.message.includes('401') || updateError.message.includes('Authentication')) {
                throw new Error('Your session has expired. Please log in again.');
              } else {
                throw new Error(`Failed to update post: ${updateError.message}`);
              }
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      } else {
        try {
          result = await postAPI.create(postData);
          setSuccess('Post created successfully!');
          
          // Navigate after a short delay to show the success message
          setTimeout(() => {
            navigate('/admin/posts');
          }, 1500);
        } catch (createError) {
          console.error('Error creating post:', createError);
          
          // Handle specific error cases
          if (createError.response && createError.response.slug) {
            throw new Error(`A post with this slug already exists. Please choose a different slug.`);
          } else if (createError.message.includes('400')) {
            throw new Error('Missing or invalid data. Please check all required fields.');
          } else if (createError.message.includes('401') || createError.message.includes('Authentication')) {
            throw new Error('Your session has expired. Please log in again.');
          } else {
            throw createError;
          }
        }
      }
    } catch (err) {
      console.error('Error saving post:', err);
      
      // Extract error details if available
      let errorMessage = 'Failed to save post. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Scroll to the top to show the error
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <p>Loading post data...</p>;
  }
  
  return (
    <Container>
      <BackLink to="/admin/posts">
        ← Back to Posts
      </BackLink>
      
      <Title>{isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}</Title>
      
      <Form onSubmit={handleSubmit}>
        {error && (
          <ErrorContainer>
            <ErrorMessage>{error}</ErrorMessage>
          </ErrorContainer>
        )}
        
        {success && (
          <SuccessContainer>
            <SuccessMessage>{success}</SuccessMessage>
          </SuccessContainer>
        )}
        
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            placeholder="Enter post title"
            maxLength={200}
          />
          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem', textAlign: 'right' }}>
            {post.title.length}/200 characters
          </div>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="slug">Slug</Label>
          <SlugInputGroup>
            <SlugInputWithValidation
              type="text"
              id="slug"
              name="slug"
              value={post.slug}
              onChange={handleSlugChange}
              placeholder="Enter post slug"
              maxLength={250}
              $touched={slugEdited}
              $isValid={slugValidation.isValid}
              $showValidation={slugEdited}
            />
            <SlugValidationMessage $isValid={slugValidation.isValid}>
              {slugValidation.message}
            </SlugValidationMessage>
          </SlugInputGroup>
          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem', textAlign: 'right' }}>
            {post.slug.length}/250 characters
          </div>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="category">Category</Label>
          <CategorySelectionContainer>
            <CategorySelect
              id="category"
              name="category"
              value={post.category || ''}
              onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value || null }))}
              disabled={categoriesLoading || loadingCategories}
            >
              <option value="">Select a category (optional)</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </CategorySelect>
            <AddCategoryButton
              type="button"
              onClick={() => setShowCategoryModal(true)}
              disabled={loadingCategories}
              title="Create a new category"
            >
              {loadingCategories ? (
                <SmallSpinner />
              ) : (
                <>+ Add New</>  
              )}
            </AddCategoryButton>
          </CategorySelectionContainer>
          <CategoryHelpText>
            Can't find the right category? Create a new one!
          </CategoryHelpText>
          {categoriesLoading && (
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
              Loading categories...
            </div>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="excerpt">Excerpt (Optional)</Label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={post.excerpt}
            onChange={handleChange}
            placeholder="Enter a brief description of your post (max 300 characters). If left blank, it will be auto-generated from content."
            maxLength={300}
            rows={3}
            style={{
              padding: '0.9rem',
              border: '1px solid #dce0e5',
              borderRadius: '6px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#80bdff';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dce0e5';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem', textAlign: 'right' }}>
            {post.excerpt.length}/300 characters
          </div>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Content</Label>
          <RichTextEditor
            value={post.content}
            onChange={handleEditorChange}
            onImageUpload={handleImageUpload}
            placeholder="Write your blog post content here..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="featured_image">Featured Image</Label>
          <Input
            type="file"
            id="featured_image"
            name="featured_image"
            onChange={handleFeaturedImageChange}
            accept="image/*"
          />
          
          {featuredImagePreview && (
            <ImagePreviewContainer>
              <ImagePreview>
                <PreviewImageContainer>
                  <PreviewImage 
                    src={featuredImagePreview} 
                    alt="Featured preview" 
                  />
                </PreviewImageContainer>
                <RemoveButton onClick={handleRemoveFeaturedImage}>
                  <CloseIcon />
                </RemoveButton>
              </ImagePreview>
            </ImagePreviewContainer>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="additional_images">Additional Images</Label>
          <Input
            type="file"
            id="additional_images"
            name="additional_images"
            onChange={handleAdditionalImagesChange}
            accept="image/*"
            multiple
          />
          
          {additionalImagePreviews && additionalImagePreviews.length > 0 && (
            <AdditionalImagesContainer>
              <Label>Preview</Label>
              <AdditionalImagesGrid>
                {additionalImagePreviews.map((image, index) => (
                  <ImageContainer key={index}>
                    <ImagePreview>
                      <PreviewImageContainer>
                        <PreviewImage 
                          src={image} 
                          alt={`Preview ${index + 1}`}
                        />
                      </PreviewImageContainer>
                      <RemoveButton onClick={() => handleRemoveAdditionalImage(index)}>
                        <CloseIcon />
                      </RemoveButton>
                    </ImagePreview>
                  </ImageContainer>
                ))}
              </AdditionalImagesGrid>
            </AdditionalImagesContainer>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label>Publishing Options</Label>
          <PublishOption>
            <ToggleSwitch>
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={post.published}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </ToggleSwitch>
            <Label htmlFor="published" style={{ marginBottom: 0 }}>
              {post.published ? 'Published' : 'Draft'}
            </Label>
          </PublishOption>
          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
            {post.published 
              ? 'The post will be visible to all visitors immediately after saving.' 
              : 'The post will be saved as a draft and won\'t be visible to visitors.'}
          </div>
        </FormGroup>
        
        <ButtonContainer>
          <StyledButton 
            type="submit" 
            disabled={loading}
            color="primary"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Post' : 'Create Post')}
          </StyledButton>
          
          <StyledButton 
            type="button" 
            onClick={() => navigate('/admin/posts')}
            color="secondary"
          >
            Cancel
          </StyledButton>
        </ButtonContainer>
      </Form>
      
      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
        existingCategories={categories}
      />
    </Container>
  );
};

export default PostFormPage;
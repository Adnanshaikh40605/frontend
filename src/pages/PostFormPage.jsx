import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import QuillEditor from '../components/QuillEditor';
import Button from '../components/Button';
import DashboardLayout from '../components/DashboardLayout';
import CategoryModal from '../components/CategoryModal';
import { postAPI, categoriesAPI } from '../api/apiService';
import slugify from '../utils/slugify';
import { clearPostCache } from '../pages/BlogPostPage';
import CloseIcon from '@mui/icons-material/Close';

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: var(--primary);
  text-decoration: none;
  margin-bottom: var(--spacing-6);
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    text-decoration: underline;
    color: var(--primary-dark);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  
  @media (max-width: 768px) {
    gap: var(--spacing-6);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: var(--spacing-3);
  color: var(--text);
  font-size: 1rem;
`;

const Input = styled.input`
  padding: var(--spacing-4);
  border: var(--border);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: var(--transition-smooth);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
  
  &[type="file"] {
    display: none;
  }
  
  &[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const FileUploadContainer = styled.div`
  position: relative;
  width: 100%;
`;

const FileUploadArea = styled.div`
  border: 2px dashed ${props => props.$isDragOver ? '#667eea' : '#d1d5db'};
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  background-color: ${props => props.$isDragOver ? '#f8faff' : '#f9fafb'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #667eea;
    background-color: #f8faff;
    transform: translateY(-1px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s ease;
  
  ${FileUploadArea}:hover & {
    transform: scale(1.05);
  }
`;

const UploadText = styled.div`
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FileInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(102, 126, 234, 0.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const FileName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '📁';
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  
  &::before {
    content: '💾';
    margin-right: 0.5rem;
    font-size: 0.8rem;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  
  &:hover {
    background-color: var(--surface-light);
  }
`;

const ImagePreviewContainer = styled.div`
  margin-top: var(--spacing-5);
`;

const ImagePreview = styled.div`
  width: 100%;
  max-width: 300px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  padding: 0.5rem;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

const PreviewImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  border-radius: var(--radius-sm);
`;

const PreviewImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: var(--radius-sm);
  display: block;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #6b7280;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 0;
  backdrop-filter: blur(10px);
  
  svg {
    font-size: 18px;
  }
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;



const ErrorContainer = styled.div`
  padding: var(--spacing-4);
  background-color: var(--danger-light);
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-6);
`;

const SuccessContainer = styled.div`
  padding: var(--spacing-4);
  background-color: var(--success-light);
  border: 1px solid var(--success-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-6);
`;

const SuccessMessage = styled.p`
  color: var(--success-dark);
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
`;

const ErrorMessage = styled.p`
  color: var(--danger-dark);
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: var(--spacing-5);
  margin-top: var(--spacing-4);
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const StyledButton = styled(Button)`
  padding: var(--spacing-3) var(--spacing-6);
  font-weight: 600;
  font-size: 1rem;
  border-radius: var(--radius-md);
  transition: var(--transition-smooth);
  
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
  gap: var(--spacing-2);
  
  .upload-hint {
    font-size: 0.875rem;
    color: var(--text-light);
    margin-top: var(--spacing-1);
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: black;
    transition: all var(--transition-base);
    border-radius: 28px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    top: 3px;
    background-color: white;
    transition: all var(--transition-base);
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
  }
  
  input:checked + .slider {
    background-color: skyblue;
  }
  
  input:focus + .slider {
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 3px var(--focus-ring);
  }
  
  input:checked + .slider:before {
    transform: translateX(24px);
  }
  
  &:hover .slider {
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
  }
`;

const PublishOption = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  
  &:hover {
    border-color: var(--border-dark);
    box-shadow: var(--shadow-sm);
  }
`;

const PublishOptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const PublishOptionTitle = styled.div`
  font-weight: 600;
  color: var(--text);
  font-size: 1rem;
`;

const PublishOptionDescription = styled.div`
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
`;

const SectionDivider = styled.hr`
  border: 0;
  height: 1px;
  background-color: var(--border-color);
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
  color: ${props => props.$isValid ? 'var(--success)' : 'var(--danger)'};
  display: flex;
  align-items: center;
`;

const SlugInputWithValidation = styled(Input)`
  padding-right: ${props => props.$showValidation ? '150px' : 'var(--spacing-4)'};
  border-color: ${props => {
    if (!props.$touched) return 'var(--border-color)';
    return props.$isValid ? 'var(--success)' : 'var(--danger)';
  }};
  
  &:focus {
    border-color: ${props => {
    if (!props.$touched) return 'var(--primary)';
    return props.$isValid ? 'var(--success)' : 'var(--danger)';
  }};
    box-shadow: 0 0 0 2px ${props => {
    if (!props.$touched) return 'var(--primary-light)';
    return props.$isValid ? 'var(--success-light)' : 'var(--danger-light)';
  }};
  }
`;

// Category Selection Styles
const CategorySelectionContainer = styled.div`
  display: flex;
  gap: var(--spacing-3);
  align-items: stretch;
`;

const CategorySelect = styled.select`
  flex: 1;
  padding: var(--spacing-4);
  border: 1px solid #dce0e5;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--surface);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #adb5bd;
  }

  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &:disabled {
    background-color: var(--surface-light);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const AddCategoryButton = styled.button`
  padding: var(--spacing-4) var(--spacing-5);
  background: var(--primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;

  &:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: var(--text-light);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CategoryHelpText = styled.div`
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: var(--spacing-2);
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

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--spacing-4);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-2);
`;

const EditorSection = styled.div`
  margin: var(--spacing-8) 0;
`;

const PostFormPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    published: true,
    featured: false,
    category: null,
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

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
        console.log('PostFormPage: Fetched post data:', data);
        console.log('PostFormPage: Post content:', data.content);
        console.log('PostFormPage: Post content type:', typeof data.content);
        console.log('PostFormPage: Post content length:', data.content?.length);
        console.log('PostFormPage: Post content preview:', data.content?.substring(0, 200));

        setPost({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          published: data.published || true,
          featured: data.featured || false,
          category: data.category ? data.category.id : null,
        });

        if (data.featured_image) {
          setFeaturedImagePreview(data.featured_image);
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

  // Process content - now handles plain text instead of HTML
  const processContent = (content) => {
    // With plain text editor, we don't need to process HTML
    // Just return the content as-is since it's already plain text
    return content || '';
  };

  // Handle editor content change
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
      processFile(file);
    }
  };

  const processFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setFeaturedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFeaturedImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = () => {
    document.getElementById('featured_image').click();
  };

  const handleRemoveFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview('');

    // If we're editing, also clear the image from the post object
    if (isEdit) {
      setPost(prev => ({ ...prev, featured_image: null }));
    }
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
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        published: post.published,
        featured: post.featured,
        category: post.category // Explicitly include category field
      };

      // Add featured image if present
      if (featuredImage) {
        postData.featured_image = featuredImage;
      }



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
    <DashboardLayout
      title={isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
      subtitle={isEdit ? 'Update your blog post content and settings' : 'Create a new blog post with rich content'}
    >
      <BackLink to="/admin/posts">
        ← Back to Posts
      </BackLink>

      <Form onSubmit={handleSubmit}>
        <Sidebar>
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

          <SectionTitle>Post Details</SectionTitle>

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
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              type="text"
              id="meta_title"
              name="meta_title"
              value={post.meta_title}
              onChange={handleChange}
              placeholder="Enter meta title for SEO"
              maxLength={60}
            />
            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem', textAlign: 'right' }}>
              {post.meta_title.length}/60 characters
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Recommended: 50-60 characters for optimal SEO
            </div>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="meta_description">Meta Description</Label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={post.meta_description}
              onChange={handleChange}
              placeholder="Enter meta description for SEO"
              maxLength={160}
              rows={3}
              style={{
                padding: '0.9rem',
                border: '1px solid #dce0e5',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                width: '100%'
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
              {post.meta_description.length}/160 characters
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Recommended: 150-160 characters for optimal SEO
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
              placeholder="Brief description..."
              maxLength={300}
              rows={3}
              style={{
                padding: '0.9rem',
                border: '1px solid #dce0e5',
                borderRadius: '6px',
                fontSize: '0.9rem',
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
              {post.excerpt.length}/300
            </div>
          </FormGroup>
        </Sidebar>

        <EditorSection>
          <SectionTitle>Content</SectionTitle>
          <QuillEditor
            value={post.content}
            onChange={handleEditorChange}
            placeholder="Write your blog post content here..."
          />

          <FormGroup style={{ marginTop: 'var(--spacing-6)' }}>
            <Label htmlFor="featured_image">Featured Image</Label>
            <FileUploadContainer>
              <Input
                type="file"
                id="featured_image"
                name="featured_image"
                onChange={handleFeaturedImageChange}
                accept="image/*"
              />
              
              {!featuredImagePreview ? (
                <FileUploadArea
                  $isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileSelect}
                >
                  <UploadIcon>
                    📷
                  </UploadIcon>
                  <UploadText>Upload Featured Image</UploadText>
                  <UploadSubtext>
                    Drag and drop an image here, or click to browse
                  </UploadSubtext>
                  <UploadButton type="button">
                    Choose File
                  </UploadButton>
                </FileUploadArea>
              ) : (
                <div>
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
                  {featuredImage && (
                    <FileInfo>
                      <FileName>{featuredImage.name}</FileName>
                      <FileSize>{(featuredImage.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                    </FileInfo>
                  )}
                </div>
              )}
            </FileUploadContainer>
          </FormGroup>
        </EditorSection>



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
            <PublishOptionContent>
              <PublishOptionTitle>
                {post.published ? 'Published' : 'Draft'}
              </PublishOptionTitle>
              <PublishOptionDescription>
                {post.published
                  ? 'The post will be visible to all visitors immediately after saving.'
                  : 'The post will be saved as a draft and won\'t be visible to visitors.'}
              </PublishOptionDescription>
            </PublishOptionContent>
          </PublishOption>
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
    </DashboardLayout>
  );
};

export default PostFormPage;
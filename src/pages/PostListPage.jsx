import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { postAPI } from '../api/apiService';
import { mediaAPI } from '../api/apiService';
import Button from '../components/Button';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Responsive container with proper padding for different screen sizes
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

// Header with improved responsive behavior
const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: #333;
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

// Action buttons container in the header
const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

// Create new button with consistent styling
const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  background-color: white;
  color: #28a745;
  border: 1px solid #28a745;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 0.5rem;
    font-size: 20px;
    color: #28a745;
  }
  
  &:hover {
    background-color: #28a745;
    color: white;
    transform: translateY(-2px);
    
    svg {
      color: white;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Tab container with horizontal scroll for mobile
const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#007bff' : 'transparent'};
  color: ${props => props.$active ? '#007bff' : '#6c757d'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    color: #0069d9;
  }
`;

// Responsive table with horizontal scroll on mobile
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Ensures table doesn't get too squished */
`;

const Thead = styled.thead`
  background-color: #f8f9fa;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  color: #495057;
  font-weight: 600;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
  }
`;

const Td = styled.td`
  padding: 1rem;
  vertical-align: middle;
`;

// Tooltip component for action buttons
const Tooltip = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 10;
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

// Consistent action button styling with visual feedback
const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background-color: transparent;
  
  &:hover {
    background-color: #f1f3f5;
    transform: translateY(-2px);
    
    ${Tooltip} {
      opacity: 1;
      visibility: visible;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:last-child {
    margin-right: 0;
  }
  
  svg {
    font-size: 20px;
    color: ${props => {
      switch (props.$variant) {
        case 'primary': return '#007bff';
        case 'success': return '#28a745';
        case 'danger': return '#dc3545';
        default: return '#6c757d';
      }
    }};
  }
`;

// Action buttons container
const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
`;

// Improved message component for loading, errors, and empty states
const Message = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${props => props.$error ? '#dc3545' : '#6c757d'};
  background-color: ${props => props.$error ? '#f8d7da' : '#f8f9fa'};
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
`;

// Loading spinner component
const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #007bff;
  width: 40px;
  height: 40px;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Post title with position indicator
const PostTitle = styled.div`
  font-weight: 500;
`;

const PostPosition = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #28a745;
    margin-right: 0.5rem;
  }
`;

// URL display with monospace font and better contrast
const PostUrl = styled.div`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 0.25rem 0.5rem;
  background-color: #f1f3f5;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #495057;
  border: 1px solid #e9ecef;
  word-break: break-all;
`;

// Pagination component
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.375rem 0.75rem;
  border: 1px solid ${props => props.$active ? '#007bff' : '#dee2e6'};
  background-color: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#212529'};
  border-radius: 4px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.65 : 1};
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? '#0069d9' : '#f8f9fa'};
  }
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #0069d9;
  }
`;

// Add a styled component for the status indicator
const StatusIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props => props.$published ? '#e6f7ee' : '#f8f9fa'};
  color: ${props => props.$published ? '#28a745' : '#6c757d'};
  border: 1px solid ${props => props.$published ? '#c3e6cb' : '#dee2e6'};
  
  &:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.5rem;
    background-color: ${props => props.$published ? '#28a745' : '#6c757d'};
  }
`;

const PostListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch posts with proper error handling, pagination, and retries
  const fetchPosts = useCallback(async (page = 1, retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all posts, regardless of published status
      const params = { 
        page: page,
        limit: 10 // Items per page
      };
      
      const data = await postAPI.getAll(params);
      
      // Handle pagination data
      if (data.count !== undefined) {
        // Calculate totalPages directly without storing totalPosts
        const total = Math.ceil(data.count / 10);
        setTotalPages(total > 0 ? total : 1);
      }
      
      setPosts(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      
      // If we haven't retried too many times, try again
      if (retryCount < 2) {
        console.log(`Retrying fetch (attempt ${retryCount + 1})...`);
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return fetchPosts(page, retryCount + 1);
      }
      
      setError('Failed to load content. Please try again later.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load posts when component mounts or page changes
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, fetchPosts]);
  
  // Handle pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Handle delete with confirmation, optimistic UI update, and improved error handling
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        // Check if we have an access token before attempting delete
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('You need to be logged in to delete posts. Please log in and try again.');
          navigate('/login', { state: { from: location } });
          return;
        }
        
        // Optimistic UI update
        setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
        
        // Store the post being deleted in case we need to restore it
        const deletedPost = posts.find(post => post.id === id);
        
        try {
          // Perform the actual delete
          const success = await postAPI.delete(id);
          
          if (!success) {
            throw new Error('Delete operation failed or was rejected by the server');
          }
          
          // If we deleted the last item on the page, go to previous page
          if (posts.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          } else {
            // Refresh the current page to ensure data is in sync
            fetchPosts(currentPage);
          }
        } catch (apiError) {
          console.error('API Error deleting post:', apiError);
          
          // Revert the optimistic update by restoring the deleted post
          setPosts(prevPosts => {
            // Check if the post is already restored (in case of duplicate calls)
            if (prevPosts.some(p => p.id === id)) {
              return prevPosts;
            }
            return [...prevPosts, deletedPost].sort((a, b) => a.position - b.position);
          });
          
          // Handle authentication errors
          if (apiError.message.includes('401') || apiError.message.includes('Authentication required')) {
            alert('Your session has expired. Please log in again.');
            navigate('/login', { state: { from: location } });
            return;
          }
          
          // Show specific error message based on the error
          if (apiError.message.includes('405')) {
            alert('You do not have permission to delete this post. Please contact an administrator.');
          } else {
            alert(`Failed to delete post: ${apiError.message}`);
          }
        }
      } catch (err) {
        console.error('Error in delete handler:', err);
        alert('An unexpected error occurred. Please try again.');
        // Revert any changes and refresh
        fetchPosts(currentPage);
      }
    }
  };
  
  // View post in a new tab
  const handleView = (slug) => {
    window.open(`/blog/${slug}`, '_blank');
  };
  
  // Navigate to edit page
  const handleEdit = (slug) => {
    navigate(`/admin/posts/${slug}/edit`);
  };
  
  // Navigate to create page
  const handleCreate = () => {
    navigate('/admin/posts/new');
  };
  
  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageButtons = [];
    
    // Always show first page
    pageButtons.push(
      <PageButton 
        key="first"
        onClick={() => handlePageChange(1)}
        $active={currentPage === 1}
      >
        1
      </PageButton>
    );
    
    // Show ellipsis if needed
    if (currentPage > 3) {
      pageButtons.push(<span key="ellipsis1">...</span>);
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're always shown
      pageButtons.push(
        <PageButton 
          key={i}
          onClick={() => handlePageChange(i)}
          $active={currentPage === i}
        >
          {i}
        </PageButton>
      );
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pageButtons.push(<span key="ellipsis2">...</span>);
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageButtons.push(
        <PageButton 
          key="last"
          onClick={() => handlePageChange(totalPages)}
          $active={currentPage === totalPages}
        >
          {totalPages}
        </PageButton>
      );
    }
    
    return (
      <Pagination>
        <PageButton 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </PageButton>
        
        {pageButtons}
        
        <PageButton 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </PageButton>
      </Pagination>
    );
  };
  
  return (
    <Container>
      <Header>
        <Title>Content</Title>
        <HeaderActions>
          <CreateButton onClick={handleCreate}>
            <AddIcon /> New Page
          </CreateButton>
        </HeaderActions>
      </Header>
      
      <TabsContainer>
        <Tab $active={true}>Pages</Tab>
      </TabsContainer>
      
      {loading ? (
        <Message>
          <Spinner />
          Loading content...
        </Message>
      ) : error ? (
        <Message $error={true}>
          {error}
          <RetryButton onClick={() => fetchPosts(currentPage)}>
            Try Again
          </RetryButton>
        </Message>
      ) : posts.length === 0 ? (
        <Message>
          No content found. Create your first page by clicking the "New Page" button.
        </Message>
      ) : (
        <>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>URL</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <tbody>
                {posts.map(post => (
                  <Tr key={post.id}>
                    <Td>
                      <PostTitle>{post.title}</PostTitle>
                      <PostPosition>POSITION: {post.position}</PostPosition>
                    </Td>
                    <Td>
                      <PostUrl>/{post.slug}</PostUrl>
                    </Td>
                    <Td>
                      <StatusIndicator $published={post.published}>
                        {post.published ? 'Published' : 'Draft'}
                      </StatusIndicator>
                    </Td>
                    <Td>
                      <ActionButtonsContainer>
                        <ActionButton 
                          $variant="primary" 
                          onClick={() => handleView(post.slug)}
                          aria-label={`View ${post.title}`}
                        >
                          <PreviewIcon />
                          <Tooltip>View</Tooltip>
                        </ActionButton>
                        <ActionButton 
                          $variant="success" 
                          onClick={() => handleEdit(post.slug)}
                          aria-label={`Edit ${post.title}`}
                        >
                          <EditIcon />
                          <Tooltip>Edit</Tooltip>
                        </ActionButton>
                        <ActionButton 
                          $variant="danger" 
                          onClick={() => handleDelete(post.id)}
                          aria-label={`Delete ${post.title}`}
                        >
                          <DeleteIcon />
                          <Tooltip>Delete</Tooltip>
                        </ActionButton>
                      </ActionButtonsContainer>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
          
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

export default PostListPage; 
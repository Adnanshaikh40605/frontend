import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { postAPI } from '../api/apiService';
import { mediaAPI } from '../api/apiService';
import Button from '../components/Button';
import DashboardLayout from '../components/DashboardLayout';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

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

// Action buttons container in the header
const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

// Create new button with dashboard theme styling
const CreateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
  
  svg {
    margin-right: var(--spacing-2);
    font-size: 20px;
  }
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Tab container with horizontal scroll for mobile
const TabsContainer = styled.div`
  display: flex;
  border-bottom: var(--border);
  margin-bottom: var(--spacing-6);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--surface-light);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--text-light);
    border-radius: var(--radius-sm);
  }
`;

const Tab = styled.button`
  padding: var(--spacing-3) var(--spacing-5);
  background-color: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-light)'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  cursor: pointer;
  transition: var(--transition-smooth);
  white-space: nowrap;
  
  &:hover {
    color: var(--primary-hover);
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
    background: var(--surface-light);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--text-light);
    border-radius: var(--radius-sm);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Ensures table doesn't get too squished */
`;

const Thead = styled.thead`
  background-color: var(--surface-light);
`;

const Th = styled.th`
  padding: var(--spacing-4);
  text-align: left;
  border-bottom: 2px solid var(--border-dark);
  color: var(--text-muted);
  font-weight: 600;
  
  &:nth-child(1) {
    width: 40%;
    min-width: 200px;
  }
  
  &:nth-child(2) {
    width: 25%;
    min-width: 150px;
  }
  
  &:nth-child(3) {
    width: 15%;
    min-width: 100px;
  }
  
  &:nth-child(4) {
    width: 20%;
    min-width: 120px;
  }
`;

const Tr = styled.tr`
  &:hover {
    background-color: var(--surface-light);
  }
  
  &:not(:last-child) {
    border-bottom: var(--border-light);
  }
`;

const Td = styled.td`
  padding: var(--spacing-4);
  vertical-align: middle;
  
  &:nth-child(1) {
    width: 40%;
    min-width: 200px;
  }
  
  &:nth-child(2) {
    width: 25%;
    min-width: 150px;
  }
  
  &:nth-child(3) {
    width: 15%;
    min-width: 100px;
  }
  
  &:nth-child(4) {
    width: 20%;
    min-width: 120px;
  }
`;

// Tooltip component for action buttons
const Tooltip = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--text);
  color: var(--text-inverse);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: var(--transition-smooth);
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
    border-color: var(--text) transparent transparent transparent;
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
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background-color: transparent;
  
  &:hover {
    background-color: var(--surface);
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
        case 'primary': return 'var(--accent)';
        case 'success': return 'var(--success)';
        case 'danger': return 'var(--danger)';
        default: return 'var(--text-light)';
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
  padding: var(--spacing-8);
  text-align: center;
  color: ${props => props.$error ? 'var(--danger)' : 'var(--text-light)'};
  background-color: ${props => props.$error ? 'var(--danger-light)' : 'var(--surface-light)'};
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-4);
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
  border-top: 4px solid var(--accent);
  width: 40px;
  height: 40px;
  margin-bottom: var(--spacing-4);
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



// URL display with monospace font and better contrast
const PostUrl = styled.div`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--surface-light);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--text-muted);
  border: var(--border-light);
  word-break: break-all;
`;

// Pagination component
const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-8);
  flex-wrap: wrap;
  gap: var(--spacing-2);
`;

const PageButton = styled.button`
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  background-color: ${props => props.$active ? 'var(--primary)' : 'var(--bg)'};
  color: ${props => props.$active ? 'var(--text-inverse)' : 'var(--text)'};
  border-radius: var(--radius-md);
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.65 : 1};
  transition: var(--transition-smooth);
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? 'var(--primary-hover)' : 'var(--surface)'};
  }
`;

const RetryButton = styled.button`
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-4);
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

// Add a styled component for the status indicator
const StatusIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => props.$published ? 'var(--success-light)' : 'var(--danger-light)'};
  color: ${props => props.$published ? 'var(--success)' : 'var(--danger)'};
  border: 1px solid ${props => props.$published ? 'var(--success-border)' : 'var(--danger-border)'};
  
  &:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: var(--spacing-2);
    background-color: ${props => props.$published ? 'var(--success)' : 'var(--danger)'};
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
    <DashboardLayout 
      title="Content Management" 
      subtitle="Create, edit, and manage all your blog posts"
    >
      <Header>
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
                        </ActionButton>
                        <ActionButton 
                          $variant="success" 
                          onClick={() => handleEdit(post.slug)}
                          aria-label={`Edit ${post.title}`}
                        >
                          <EditIcon />
                        </ActionButton>
                        <ActionButton 
                          $variant="danger" 
                          onClick={() => handleDelete(post.id)}
                          aria-label={`Delete ${post.title}`}
                        >
                          <DeleteIcon />
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
    </DashboardLayout>
  );
};

export default PostListPage;
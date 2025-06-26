import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Comment from '../components/Comment';
import { commentAPI } from '../api/apiService';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  width: 100%;
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
  position: relative;
  
  &:hover {
    color: #0069d9;
    background-color: #f8f9fa;
  }
  
  &:focus {
    outline: none;
  }
`;

const TabCounter = styled.span`
  background-color: ${props => props.$active ? '#007bff' : '#6c757d'};
  color: white;
  border-radius: 10px;
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
  margin-left: 0.5rem;
`;

const CommentsList = styled.div`
  margin-bottom: 2rem;
`;

const Message = styled.p`
  text-align: center;
  color: #6c757d;
  padding: 2rem;
`;

const BulkActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SelectAllContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
`;

const SelectAllCheckbox = styled.input`
  margin-right: 0.5rem;
`;

const BulkActionSelect = styled.select`
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
  background-color: white;
  min-width: 150px;
`;

const ApplyButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0069d9;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const DebugInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
  font-family: monospace;
  font-size: 0.8rem;
  overflow-x: auto;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
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
  
  &:hover {
    background-color: ${props => props.$active ? '#0069d9' : '#f8f9fa'};
  }
`;

const CommentContainer = styled.div`
  position: relative;
`;

const CheckboxContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
`;

const CommentCheckbox = styled.input`
  transform: scale(1.2);
  cursor: pointer;
`;

const ResultsCounter = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

// Tab types
const TABS = {
  ALL: 'all',
  PENDING: 'pending',
  APPROVED: 'approved',
  TRASH: 'trash'
};

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.PENDING);
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    trash: 0
  });
  
  // Selected comments for bulk actions
  const [selectedComments, setSelectedComments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage] = useState(10);
  
  // For development: debug info
  const isDevelopment = import.meta.env.DEV;
  const [showDebug, setShowDebug] = useState(false);
  const [debug, setDebug] = useState({});
  
  // Define fetchCounts function
  const fetchCounts = useCallback(async () => {
    try {
      console.log('Fetching comment counts');
      const data = await commentAPI.getCounts();
      setCounts({
        all: data.all || 0,
        pending: data.pending || 0,
        approved: data.approved || 0,
        trash: data.trash || 0
      });
    } catch (err) {
      console.error('Error fetching comment counts:', err);
    }
  }, []);
  
  // Debounced fetchCounts to avoid multiple API calls
  const debouncedFetchCounts = useCallback(() => {
    if (window.fetchCountsTimeout) {
      clearTimeout(window.fetchCountsTimeout);
    }
    window.fetchCountsTimeout = setTimeout(() => {
      fetchCounts();
    }, 300);
  }, [fetchCounts]);
  
  // Fetch comment counts only once on component mount
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);
  
  // Fetch comments based on active tab
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedComments([]);
        setSelectAll(false);
        
        console.log('CommentsPage - Fetching comments for tab:', activeTab);
        
        // Prepare query parameters
        const params = {
          page: currentPage,
          limit: resultsPerPage
        };
        
        // Add filter based on active tab
        if (activeTab === TABS.PENDING) {
          params.approved = false;
          params.is_trash = false;
        } else if (activeTab === TABS.APPROVED) {
          params.approved = true;
          params.is_trash = false;
        } else if (activeTab === TABS.TRASH) {
          params.is_trash = true;
        } else {
          // ALL tab, exclude trash
          params.is_trash = false;
        }
        
        // Use the API service to fetch comments
        const responseData = await commentAPI.getFilteredComments(params);
        console.log('CommentsPage - Comments response:', responseData);
        setDebug(responseData);
        
        // Handle pagination data
        if (responseData.count !== undefined) {
          const total = Math.ceil(responseData.count / resultsPerPage);
          setTotalPages(total > 0 ? total : 1);
        }
        
        // Handle comments data
        if (responseData.results && Array.isArray(responseData.results)) {
          setComments(responseData.results);
        } else if (Array.isArray(responseData)) {
          setComments(responseData);
        } else {
          setComments([]);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again later.');
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [activeTab, currentPage, resultsPerPage]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination when changing tabs
  };
  
  // Handle approve comment
  const handleApproveComment = async (comment) => {
    try {
      // Extract ID if we received a comment object
      const commentId = comment?.id || comment;
      
      if (!commentId) {
        console.error('Invalid comment ID:', comment);
        alert('Error: Invalid comment ID');
        return;
      }
      
      await commentAPI.approve(commentId);
      
      // Remove comment from current list if we're looking at pending comments
      if (activeTab === TABS.PENDING) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        // Update the comment status in the list
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, approved: true } : c
        ));
      }
      
      // Use debounced fetch counts
      debouncedFetchCounts();
    } catch (err) {
      console.error('Error approving comment:', err);
      alert('Failed to approve comment. Please try again.');
    }
  };
  
  // Handle reject/unapprove comment
  const handleRejectComment = async (comment) => {
    try {
      // Extract ID if we received a comment object
      const commentId = comment?.id || comment;
      
      if (!commentId) {
        console.error('Invalid comment ID:', comment);
        alert('Error: Invalid comment ID');
        return;
      }
      
      await commentAPI.reject(commentId);
      
      // Update the current list based on active tab
      if (activeTab === TABS.APPROVED) {
        setComments(comments.filter(c => c.id !== commentId));
      } else if (activeTab === TABS.ALL) {
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, approved: false } : c
        ));
      } else if (activeTab === TABS.PENDING) {
        // Nothing needed here since it stays pending
      }
      
      // Use debounced fetch counts
      debouncedFetchCounts();
    } catch (err) {
      console.error('Error unapproving comment:', err);
      alert('Failed to unapprove comment. Please try again.');
    }
  };
  
  // Handle trash comment
  const handleTrashComment = async (comment) => {
    try {
      // Extract ID if we received a comment object
      const commentId = comment?.id || comment;
      
      if (!commentId) {
        console.error('Invalid comment ID:', comment);
        alert('Error: Invalid comment ID');
        return;
      }
      
      await commentAPI.trashComment(commentId);
      
      // Remove from current view since it's now in trash
      setComments(comments.filter(c => c.id !== commentId));
      
      // Use debounced fetch counts
      debouncedFetchCounts();
    } catch (err) {
      console.error('Error trashing comment:', err);
      alert('Failed to trash comment. Please try again.');
    }
  };
  
  // Handle restore from trash
  const handleRestoreComment = async (comment) => {
    try {
      // Extract ID if we received a comment object
      const commentId = comment?.id || comment;
      
      if (!commentId) {
        console.error('Invalid comment ID:', comment);
        alert('Error: Invalid comment ID');
        return;
      }
      
      await commentAPI.restoreComment(commentId);
      
      // Remove from trash view
      if (activeTab === TABS.TRASH) {
        setComments(comments.filter(c => c.id !== commentId));
      }
      
      // Use debounced fetch counts
      debouncedFetchCounts();
    } catch (err) {
      console.error('Error restoring comment:', err);
      alert('Failed to restore comment. Please try again.');
    }
  };
  
  // Handle delete permanently
  const handleDeleteComment = async (comment) => {
    try {
      // Extract ID if we received a comment object
      const commentId = comment?.id || comment;
      
      if (!commentId) {
        console.error('Invalid comment ID:', comment);
        alert('Error: Invalid comment ID');
        return;
      }
      
      if (window.confirm('Are you sure you want to permanently delete this comment?')) {
        await commentAPI.deleteComment(commentId);
        
        // Remove from any view
        setComments(comments.filter(c => c.id !== commentId));
        
        // Use debounced fetch counts
        debouncedFetchCounts();
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };
  
  // Handle reply to comment 
  const handleReplyComment = async (comment, replyContent) => {
    try {
      // Check if this is a response from AdminReplyForm with API call already made
      if (comment && comment.status === 'Reply added successfully' && comment.comment) {
        // API call was already made by AdminReplyForm, just update the UI
        const updatedComment = comment.comment;
        setComments(prevComments => 
          prevComments.map(c => 
            c.id === updatedComment.parent 
              ? { ...c, admin_reply: updatedComment.content }
              : c
          )
        );
        return;
      }
      
      // If we get here, we need to make the API call ourselves
      // Extract ID if we received a comment object
      const commentId = comment?.id || comment;
      
      if (!commentId) {
        console.error('Invalid comment ID:', comment);
        alert('Error: Invalid comment ID');
        return;
      }
      
      const replyData = {
        content: replyContent, // Required field
        admin_reply: true // Boolean flag to indicate this is an admin reply
      };
      
      const response = await commentAPI.replyToComment(commentId, replyData);
      
      // Update comment in list
      if (response && response.comment) {
        setComments(prevComments => 
          prevComments.map(c => 
            c.id === commentId 
              ? { ...c, admin_reply: replyContent }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error replying to comment:', err);
      alert('Failed to submit reply. Please try again.');
    }
  };
  
  // Handle select all checkbox
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      // Select all comment IDs
      const allIds = comments.map(comment => comment.id);
      setSelectedComments(allIds);
    } else {
      // Deselect all
      setSelectedComments([]);
    }
  };
  
  // Handle individual comment selection
  const handleCommentSelect = (commentId, checked) => {
    if (checked) {
      setSelectedComments([...selectedComments, commentId]);
    } else {
      setSelectedComments(selectedComments.filter(id => id !== commentId));
    }
  };
  
  // Apply bulk action
  const handleApplyBulkAction = async () => {
    if (!bulkAction || selectedComments.length === 0) return;
    
    try {
      switch (bulkAction) {
        case 'approve':
          if (window.confirm(`Are you sure you want to approve ${selectedComments.length} selected comments?`)) {
            await commentAPI.bulkApprove(selectedComments);
            if (activeTab === TABS.PENDING) {
              // Remove approved comments from pending list
              setComments(comments.filter(comment => !selectedComments.includes(comment.id)));
            } else {
              // Update status in current list
              setComments(comments.map(comment => 
                selectedComments.includes(comment.id) ? { ...comment, approved: true } : comment
              ));
            }
          }
          break;
          
        case 'unapprove':
          if (window.confirm(`Are you sure you want to unapprove ${selectedComments.length} selected comments?`)) {
            await commentAPI.bulkReject(selectedComments);
            if (activeTab === TABS.APPROVED) {
              // Remove unapproved comments from approved list
              setComments(comments.filter(comment => !selectedComments.includes(comment.id)));
            } else {
              // Update status in current list
              setComments(comments.map(comment => 
                selectedComments.includes(comment.id) ? { ...comment, approved: false } : comment
              ));
            }
          }
          break;
          
        case 'trash':
          if (window.confirm(`Are you sure you want to move ${selectedComments.length} selected comments to trash?`)) {
            // We don't have a bulk trash API yet, so do it one by one
            for (const commentId of selectedComments) {
              await commentAPI.trashComment(commentId);
            }
            // Remove trashed comments from current view
            setComments(comments.filter(comment => !selectedComments.includes(comment.id)));
          }
          break;
          
        case 'restore':
          if (window.confirm(`Are you sure you want to restore ${selectedComments.length} selected comments?`)) {
            // We don't have a bulk restore API yet, so do it one by one
            for (const commentId of selectedComments) {
              await commentAPI.restoreComment(commentId);
            }
            // Remove restored comments from trash view
            if (activeTab === TABS.TRASH) {
              setComments(comments.filter(comment => !selectedComments.includes(comment.id)));
            }
          }
          break;
          
        case 'delete':
          if (window.confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedComments.length} selected comments? This cannot be undone.`)) {
            // We don't have a bulk delete API yet, so do it one by one
            for (const commentId of selectedComments) {
              await commentAPI.deleteComment(commentId);
            }
            // Remove deleted comments from any view
            setComments(comments.filter(comment => !selectedComments.includes(comment.id)));
          }
          break;
          
        default:
          alert('Invalid action selected');
          return;
      }
      
      // Reset selection and action
      setSelectedComments([]);
      setSelectAll(false);
      setBulkAction('');
      
      // Use debounced fetch counts
      debouncedFetchCounts();
      
    } catch (err) {
      console.error('Error applying bulk action:', err);
      alert(`Failed to apply bulk action: ${err.message}`);
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>Comments Management</Title>
        
        {isDevelopment && (
          <button 
            onClick={() => setShowDebug(!showDebug)}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: showDebug ? '#ff9900' : 'transparent',
              color: showDebug ? 'white' : '#ff9900',
              border: '1px solid #ff9900',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Debug
          </button>
        )}
      </Header>
      
      <TabsContainer>
        <Tab 
          $active={activeTab === TABS.ALL}
          onClick={() => handleTabChange(TABS.ALL)}
        >
          All <TabCounter $active={activeTab === TABS.ALL}>{counts.all}</TabCounter>
        </Tab>
        <Tab 
          $active={activeTab === TABS.PENDING}
          onClick={() => handleTabChange(TABS.PENDING)}
        >
          Pending <TabCounter $active={activeTab === TABS.PENDING}>{counts.pending}</TabCounter>
        </Tab>
        <Tab 
          $active={activeTab === TABS.APPROVED}
          onClick={() => handleTabChange(TABS.APPROVED)}
        >
          Approved <TabCounter $active={activeTab === TABS.APPROVED}>{counts.approved}</TabCounter>
        </Tab>
        <Tab 
          $active={activeTab === TABS.TRASH}
          onClick={() => handleTabChange(TABS.TRASH)}
        >
          Trash <TabCounter $active={activeTab === TABS.TRASH}>{counts.trash}</TabCounter>
        </Tab>
      </TabsContainer>
      
      {comments.length > 0 && (
        <BulkActionsContainer>
          <SelectAllContainer>
            <SelectAllCheckbox 
              type="checkbox" 
              checked={selectAll}
              onChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all">Select All</label>
          </SelectAllContainer>
          
          <BulkActionSelect 
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Bulk Actions</option>
            {activeTab !== TABS.APPROVED && <option value="approve">Approve</option>}
            {activeTab !== TABS.PENDING && <option value="unapprove">Unapprove</option>}
            {activeTab !== TABS.TRASH && <option value="trash">Move to Trash</option>}
            {activeTab === TABS.TRASH && <option value="restore">Restore</option>}
            {activeTab === TABS.TRASH && <option value="delete">Delete Permanently</option>}
          </BulkActionSelect>
          
          <ApplyButton 
            onClick={handleApplyBulkAction}
            disabled={!bulkAction || selectedComments.length === 0}
          >
            Apply
          </ApplyButton>
          
          <ResultsCounter>
            {selectedComments.length} of {comments.length} selected
          </ResultsCounter>
        </BulkActionsContainer>
      )}
      
      {loading ? (
        <Message>Loading comments...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : comments.length === 0 ? (
        <Message>
          {activeTab === TABS.PENDING ? 'No pending comments found.' : 
           activeTab === TABS.APPROVED ? 'No approved comments found.' : 
           activeTab === TABS.TRASH ? 'No comments in trash.' : 
           'No comments found.'}
        </Message>
      ) : (
        <CommentsList>
          {comments.map(comment => (
            <CommentContainer key={comment.id}>
              <CheckboxContainer>
                <CommentCheckbox 
                  type="checkbox"
                  checked={selectedComments.includes(comment.id)}
                  onChange={(e) => handleCommentSelect(comment.id, e.target.checked)}
                />
              </CheckboxContainer>
              <Comment 
                comment={comment}
                onApprove={handleApproveComment}
                onReject={handleRejectComment}
                onReply={handleReplyComment}
                onTrash={handleTrashComment}
                onRestore={handleRestoreComment}
                onDelete={handleDeleteComment}
                showActionButtons={true}
                showPostInfo={true}
              />
            </CommentContainer>
          ))}
        </CommentsList>
      )}
      
      {totalPages > 1 && (
        <PaginationContainer>
          <PageButton 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
            $disabled={currentPage === 1}
          >
            &laquo; First
          </PageButton>
          <PageButton 
            onClick={() => setCurrentPage(currentPage => Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1}
            $disabled={currentPage === 1}
          >
            &lsaquo; Prev
          </PageButton>
          
          {/* Show page numbers with ellipsis for large sets */}
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            // Only show current page, first, last, and pages around current
            if (
              pageNum === 1 || 
              pageNum === totalPages || 
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <PageButton 
                  key={pageNum} 
                  onClick={() => setCurrentPage(pageNum)} 
                  $active={currentPage === pageNum}
                >
                  {pageNum}
                </PageButton>
              );
            } else if (
              (pageNum === 2 && currentPage > 3) || 
              (pageNum === totalPages - 1 && currentPage < totalPages - 2)
            ) {
              // Show ellipsis
              return <span key={pageNum}>...</span>;
            } else {
              return null;
            }
          })}
          
          <PageButton 
            onClick={() => setCurrentPage(currentPage => Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages}
            $disabled={currentPage === totalPages}
          >
            Next &rsaquo;
          </PageButton>
          <PageButton 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
            $disabled={currentPage === totalPages}
          >
            Last &raquo;
          </PageButton>
        </PaginationContainer>
      )}
      
      {showDebug && (
        <DebugInfo>
          <h4>Debug Info:</h4>
          <pre>{JSON.stringify(debug, null, 2)}</pre>
        </DebugInfo>
      )}
    </Container>
  );
};

export default CommentsPage;
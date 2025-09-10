import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from './Button';

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  color: inherit;
  background-color: #ffffff;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  color: inherit;
  background-color: #ffffff;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  background-color: #e8f5e9;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-weight: 500;
`;

const KeyboardHintContainer = styled.div`
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #6c757d;
`;

const KeyboardShortcut = styled.kbd`
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.2);
  padding: 0.2rem 0.4rem;
  margin: 0 0.2rem;
  font-size: 0.8rem;
  color: black;
`;

const ReplyInfo = styled.div`
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReplyingTo = styled.span`
  font-weight: 500;
  color: #495057;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    color: #495057;
    text-decoration: underline;
  }
`;

const FormContainer = styled.div`
  margin: 1.5rem 0;
  
  &.inline-reply {
    margin: 0.5rem 0;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
    
    ${FormGroup} {
      margin-bottom: 0.75rem;
    }
    
    ${Input}, ${Textarea} {
      padding: 0.5rem;
      font-size: 0.95rem;
    }
    
    ${Textarea} {
      min-height: 80px;
    }
    
    ${KeyboardHintContainer} {
      margin-top: 0.5rem;
      font-size: 0.75rem;
    }
  }
`;

const NestingIndicator = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #007bff;
`;

const CommentForm = ({ 
  postId, 
  onCommentSubmitted, 
  showForm = true, 
  replyTo = null,
  onCancelReply = null,
  isInline = false
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef(null);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Submit on Ctrl+Enter
      if (event.ctrlKey && event.key === 'Enter' && showForm) {
        const form = textareaRef.current?.form;
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);
  
  // Focus the textarea when replying to a comment
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!content.trim()) {
      setError('Please enter a comment.');
      return;
    }
    
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setError(null);
    
    // Prepare comment data
    const commentData = {
      post: postId,
      author_name: name,
      author_email: email,
      content: content,
      // Add parent_id if replying to a comment
      parent: replyTo ? replyTo.id : null
    };
    
    // Call the callback if provided
    if (onCommentSubmitted) {
      try {
        setIsSubmitting(true);
        const result = await onCommentSubmitted(commentData);
        // Reset form
        setName('');
        setEmail('');
        setContent('');
        setSuccess(true);
        
        // Reset reply state if we were replying
        if (replyTo && onCancelReply) {
          onCancelReply();
        }
        
        setTimeout(() => setSuccess(false), 3000);
        return result;
      } catch (err) {
        console.error('Error submitting comment:', err);
        setError('Failed to submit comment. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  if (!showForm) {
    return null;
  }
  
  return (
    <FormContainer className={isInline ? 'inline-reply' : ''}>
      {!isInline && <h3>Leave a Comment</h3>}
      
      {replyTo && (
        <NestingIndicator>
          Replying to {replyTo.author_name || 'Anonymous'}
        </NestingIndicator>
      )}
      
      {success && (
        <SuccessMessage>
          {replyTo ? 'Your reply has been submitted and is awaiting approval.' : 'Your comment has been submitted and is awaiting approval.'}
        </SuccessMessage>
      )}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Name</Label>
          <Input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Your name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Your email (will not be published)"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="content">Comment</Label>
          <Textarea 
            id="content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder={replyTo ? "Write your reply here..." : "Write your comment here..."}
            required
            ref={textareaRef}
          />
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          variant="primary"
        >
          {isSubmitting ? 'Submitting...' : (replyTo ? 'Submit Reply' : 'Submit Comment')}
        </Button>
        
        {replyTo && onCancelReply && (
          <Button 
            type="button" 
            onClick={onCancelReply}
            variant="text"
            style={{ marginLeft: '0.5rem' }}
          >
            Cancel
          </Button>
        )}
        
        <KeyboardHintContainer>
          Press <KeyboardShortcut>Ctrl</KeyboardShortcut> + <KeyboardShortcut>Enter</KeyboardShortcut> to submit
        </KeyboardHintContainer>
      </form>
    </FormContainer>
  );
};

CommentForm.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  onCommentSubmitted: PropTypes.func.isRequired,
  showForm: PropTypes.bool,
  replyTo: PropTypes.object,
  onCancelReply: PropTypes.func,
  isInline: PropTypes.bool
};

export default CommentForm; 
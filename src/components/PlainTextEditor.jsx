import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Styled components for the plain text editor
const EditorContainer = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  transition: border-color 0.2s ease;
  
  &:focus-within {
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  ${props => props.readOnly && `
    background: #f8f9fa;
    border-color: #e9ecef;
  `}
`;

const EditorInner = styled.div`
  display: flex;
  flex-direction: column;
  min-height: ${props => props.$minHeight || '200px'};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: ${props => props.$minHeight || '200px'};
  padding: 16px;
  border: none;
  outline: none;
  resize: vertical;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: transparent;
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
  
  /* Mobile-friendly */
  @media (max-width: 768px) {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 12px;
  }
`;

const Placeholder = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  color: #9ca3af;
  pointer-events: none;
  font-size: 14px;
  line-height: 1.6;
  z-index: 1;
  
  @media (max-width: 768px) {
    top: 12px;
    left: 12px;
    font-size: 16px;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #6b7280;
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
  }
`;

const WordCount = styled.span`
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  padding: 0 16px 8px;
`;

// Utility functions for text processing
const getWordCount = (text) => {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
};

const getCharCount = (text) => {
  return text ? text.length : 0;
};

// Convert content to plain text (simple fallback)
const convertToPlainText = (content) => {
  if (!content) return '';
  
  // If it's already plain text, return as is
  if (typeof content === 'string' && !content.includes('<') && !content.includes('{')) {
    return content;
  }
  
  // Simple HTML tag removal
  if (content.includes('<')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  // Fallback: return as string
  return String(content);
};

const PlainTextEditor = ({
  value = '',
  onChange,
  onImageUpload, // Kept for API compatibility but not used
  placeholder = 'Write your content here...',
  autoFocus = false,
  readOnly = false,
  className = '',
  style = {},
  maxLength,
  showToolbar = false, // Not used in plain text editor
  showWordCount = true,
  showDebugView = false, // Not used in plain text editor
  enableImages = false, // Not used in plain text editor
  enableTables = false, // Not used in plain text editor
  enableHashtags = false, // Not used in plain text editor
  enableMentions = false, // Not used in plain text editor
  enableEmojis = false, // Not used in plain text editor
  enableMarkdown = false, // Not used in plain text editor
  enableCodeHighlight = false, // Not used in plain text editor
  enableCollaboration = false, // Not used in plain text editor
  enableDevTools = false, // Not used in plain text editor
  mode = 'plain', // Always plain for this component
  onError,
  minHeight = '200px',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  
  // Convert initial value to plain text
  useEffect(() => {
    const plainText = convertToPlainText(value);
    setInternalValue(plainText);
  }, [value]);
  
  // Auto-focus handling
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    
    // Validate max length
    if (maxLength && newValue.length > maxLength) {
      setError(`Content exceeds maximum length of ${maxLength} characters`);
      return;
    }
    
    setError(null);
    setInternalValue(newValue);
    
    // Call onChange with content and stats
    if (onChange) {
      // Provide stats object for compatibility
      const stats = {
        wordCount: getWordCount(newValue),
        charCount: getCharCount(newValue),
        isEmpty: newValue.trim() === ''
      };
      onChange(newValue, stats);
    }
  }, [onChange, maxLength]);
  
  const handleKeyDown = useCallback((event) => {
    // Handle common keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          // Trigger save (this would be handled by parent component)
          break;
        case 'z':
          // Let browser handle undo
          break;
        case 'y':
          // Let browser handle redo
          break;
        default:
          break;
      }
    }
  }, []);
  
  const handlePaste = useCallback((event) => {
    // Handle paste events - strip formatting and paste as plain text
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    
    if (maxLength && (internalValue.length + text.length) > maxLength) {
      setError(`Pasting would exceed maximum length of ${maxLength} characters`);
      return;
    }
    
    setError(null);
    
    // Insert text at cursor position
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = internalValue.substring(0, start) + text + internalValue.substring(end);
    
    setInternalValue(newValue);
    
    // Call onChange
    if (onChange) {
      const stats = {
        wordCount: getWordCount(newValue),
        charCount: getCharCount(newValue),
        isEmpty: newValue.trim() === ''
      };
      onChange(newValue, stats);
    }
    
    // Set cursor position after pasted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  }, [internalValue, onChange, maxLength]);
  
  const wordCount = getWordCount(internalValue);
  const charCount = getCharCount(internalValue);
  const isEmpty = internalValue.trim() === '';
  
  return (
    <EditorContainer 
      className={className} 
      style={style}
      readOnly={readOnly}
    >
      <EditorInner $minHeight={minHeight}>
        <div style={{ position: 'relative', flex: 1 }}>
          <TextArea
            ref={textareaRef}
            value={internalValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={readOnly}
            $minHeight={minHeight}
            maxLength={maxLength}
            aria-label={placeholder}
            aria-describedby={error ? 'error-message' : undefined}
            {...props}
          />
          
          {isEmpty && !internalValue && (
            <Placeholder>{placeholder}</Placeholder>
          )}
        </div>
        
        {error && (
          <ErrorMessage id="error-message">
            {error}
          </ErrorMessage>
        )}
        
        {showWordCount && (
          <StatusBar>
            <WordCount>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </WordCount>
            <span>
              {charCount} {charCount === 1 ? 'character' : 'characters'}
              {maxLength && ` / ${maxLength} max`}
            </span>
          </StatusBar>
        )}
      </EditorInner>
    </EditorContainer>
  );
};

PlainTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onImageUpload: PropTypes.func, // Kept for compatibility
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  maxLength: PropTypes.number,
  showToolbar: PropTypes.bool, // Kept for compatibility
  showWordCount: PropTypes.bool,
  showDebugView: PropTypes.bool, // Kept for compatibility
  enableImages: PropTypes.bool, // Kept for compatibility
  enableTables: PropTypes.bool, // Kept for compatibility
  enableHashtags: PropTypes.bool, // Kept for compatibility
  enableMentions: PropTypes.bool, // Kept for compatibility
  enableEmojis: PropTypes.bool, // Kept for compatibility
  enableMarkdown: PropTypes.bool, // Kept for compatibility
  enableCodeHighlight: PropTypes.bool, // Kept for compatibility
  enableCollaboration: PropTypes.bool, // Kept for compatibility
  enableDevTools: PropTypes.bool, // Kept for compatibility
  mode: PropTypes.oneOf(['rich', 'markdown', 'plain']),
  onError: PropTypes.func,
  minHeight: PropTypes.string,
};

export default PlainTextEditor;

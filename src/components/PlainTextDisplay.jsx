import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Styled components for displaying plain text content
const DisplayContainer = styled.div`
  line-height: 1.6;
  color: #333;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  /* Preserve formatting for plain text */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  
  /* Mobile-friendly */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const EmptyState = styled.div`
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 2rem;
`;

/**
 * PlainTextDisplay component for showing read-only plain text content
 * Displays plain text content with proper formatting
 */
const PlainTextDisplay = ({
  content = '',
  className = '',
  style = {},
  showEmptyState = true,
  emptyStateText = 'No content available',
  ...props
}) => {
  // Content is already plain text
  const plainText = content || '';
  
  // Show empty state if no content
  if (!plainText || plainText.trim() === '') {
    if (showEmptyState) {
      return (
        <EmptyState className={className} style={style} {...props}>
          {emptyStateText}
        </EmptyState>
      );
    }
    return null;
  }
  
  return (
    <DisplayContainer 
      className={className} 
      style={style}
      {...props}
    >
      {plainText}
    </DisplayContainer>
  );
};

PlainTextDisplay.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  showEmptyState: PropTypes.bool,
  emptyStateText: PropTypes.string,
};

export default PlainTextDisplay;

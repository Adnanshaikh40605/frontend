import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

// Common button styles
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
  text-decoration: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Primary button
export const PrimaryButton = styled.button`
  ${baseButtonStyles}
  background-color: var(--primary);
  color: var(--text-inverse);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }
`;

// Secondary button
export const SecondaryButton = styled.button`
  ${baseButtonStyles}
  background-color: var(--text-light);
  color: var(--text-inverse);
  
  &:hover:not(:disabled) {
    background-color: var(--text-muted);
  }
`;

// Outline button
export const OutlineButton = styled.button`
  ${baseButtonStyles}
  background-color: transparent;
  color: var(--primary);
  border: var(--border);
  
  &:hover:not(:disabled) {
    background-color: var(--primary);
    color: var(--text-inverse);
  }
`;

// Danger button
export const DangerButton = styled.button`
  ${baseButtonStyles}
  background-color: var(--danger);
  color: var(--text-inverse);
  
  &:hover:not(:disabled) {
    background-color: var(--danger-dark);
  }
`;

// Success button
export const SuccessButton = styled.button`
  ${baseButtonStyles}
  background-color: var(--success);
  color: var(--text-inverse);
  
  &:hover:not(:disabled) {
    background-color: var(--success-dark);
  }
`;

// Link button
export const LinkButton = styled(Link)`
  ${baseButtonStyles}
  background-color: var(--primary);
  color: var(--text-inverse);
  
  &:hover {
    background-color: var(--primary-dark);
    color: var(--text-inverse);
    text-decoration: none;
  }
`;

// Button container
export const ButtonContainer = styled.div`
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  
  ${props => props.$justify && css`
    justify-content: ${props.$justify};
  `}
  
  ${props => props.$wrap && css`
    flex-wrap: wrap;
  `}
`;

// Page button for pagination
export const PageButton = styled.button`
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid ${props => props.$active ? 'var(--primary)' : 'var(--border-color)'};
  background-color: ${props => props.$active ? 'var(--primary)' : 'var(--surface)'};
  color: ${props => props.$active ? 'var(--text-inverse)' : 'var(--primary)'};
  cursor: pointer;
  transition: var(--transition-smooth);
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? 'var(--primary-dark)' : 'var(--surface-light)'};
    border-color: ${props => props.$active ? 'var(--primary-dark)' : 'var(--border-dark)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Close button
export const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-5);
  right: var(--spacing-5);
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
  
  &:hover {
    color: var(--text-muted);
  }
`;

// Share button
export const ShareButton = styled.button`
  padding: var(--spacing-3) var(--spacing-5);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-smooth);
  margin: 0 var(--spacing-1);
  
  ${props => props.$variant === 'facebook' && css`
    background-color: #3b5998;
    color: var(--text-inverse);
    
    &:hover {
      background-color: #2d4373;
    }
  `}
  
  ${props => props.$variant === 'twitter' && css`
    background-color: #1da1f2;
    color: var(--text-inverse);
    
    &:hover {
      background-color: #0d8bd9;
    }
  `}
  
  ${props => props.$variant === 'linkedin' && css`
    background-color: #0077b5;
    color: var(--text-inverse);
    
    &:hover {
      background-color: #005885;
    }
  `}
  
  ${props => props.$variant === 'copy' && css`
    background-color: var(--text-light);
    color: var(--text-inverse);
    
    &:hover {
      background-color: var(--text-muted);
    }
  `}
`;

// Load more button
export const LoadMoreButton = styled.button`
  background-color: var(--surface-light);
  border: var(--border);
  color: var(--text);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-smooth);
  
  &:hover:not(:disabled) {
    background-color: var(--border-color);
    border-color: var(--border-dark);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Action button
export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background: none;
  border: var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-light);
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition-smooth);
  
  &:hover:not(:disabled) {
    background-color: var(--surface-light);
    border-color: var(--border-dark);
    color: var(--text-muted);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Mobile menu button
export const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--spacing-2);
  
  @media (max-width: 768px) {
    display: block;
  }
  
  &:hover {
    color: var(--primary);
  }
`;

// Search button
export const SearchButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  background: none;
  border: none;
  padding: 0 var(--spacing-4);
  color: var(--text-light);
  cursor: pointer;
  
  &:hover {
    color: var(--text-muted);
  }
`;

// Common container styles
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
  width: 100%;
`;

export const Card = styled.div`
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-4);
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  gap: ${props => props.$gap || 'var(--spacing-4)'};
  
  ${props => props.$wrap && css`
    flex-wrap: wrap;
  `}
  
  ${props => props.$direction && css`
    flex-direction: ${props.$direction};
  `}
`;
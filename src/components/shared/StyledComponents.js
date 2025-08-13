import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

// Common button styles
const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Primary button
export const PrimaryButton = styled.button`
  ${baseButtonStyles}
  background-color: #007bff;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

// Secondary button
export const SecondaryButton = styled.button`
  ${baseButtonStyles}
  background-color: #6c757d;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #545b62;
  }
`;

// Outline button
export const OutlineButton = styled.button`
  ${baseButtonStyles}
  background-color: transparent;
  color: #007bff;
  border: 1px solid #007bff;
  
  &:hover:not(:disabled) {
    background-color: #007bff;
    color: white;
  }
`;

// Danger button
export const DangerButton = styled.button`
  ${baseButtonStyles}
  background-color: #dc3545;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #c82333;
  }
`;

// Success button
export const SuccessButton = styled.button`
  ${baseButtonStyles}
  background-color: #28a745;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #218838;
  }
`;

// Link button
export const LinkButton = styled(Link)`
  ${baseButtonStyles}
  background-color: #007bff;
  color: white;
  
  &:hover {
    background-color: #0056b3;
    color: white;
    text-decoration: none;
  }
`;

// Button container
export const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
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
  padding: 0.375rem 0.75rem;
  border: 1px solid ${props => props.$active ? '#007bff' : '#dee2e6'};
  background-color: ${props => props.$active ? '#007bff' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#007bff'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? '#0056b3' : '#e9ecef'};
    border-color: ${props => props.$active ? '#0056b3' : '#adb5bd'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Close button
export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  
  &:hover {
    color: #495057;
  }
`;

// Share button
export const ShareButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin: 0 0.25rem;
  
  ${props => props.$variant === 'facebook' && css`
    background-color: #3b5998;
    color: white;
    
    &:hover {
      background-color: #2d4373;
    }
  `}
  
  ${props => props.$variant === 'twitter' && css`
    background-color: #1da1f2;
    color: white;
    
    &:hover {
      background-color: #0d8bd9;
    }
  `}
  
  ${props => props.$variant === 'linkedin' && css`
    background-color: #0077b5;
    color: white;
    
    &:hover {
      background-color: #005885;
    }
  `}
  
  ${props => props.$variant === 'copy' && css`
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #545b62;
    }
  `}
`;

// Load more button
export const LoadMoreButton = styled.button`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #e9ecef;
    border-color: #adb5bd;
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
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #6c757d;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #adb5bd;
    color: #495057;
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
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    display: block;
  }
  
  &:hover {
    color: #007bff;
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
  padding: 0 1rem;
  color: #6c757d;
  cursor: pointer;
  
  &:hover {
    color: #495057;
  }
`;

// Common container styles
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
`;

export const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  gap: ${props => props.$gap || '1rem'};
  
  ${props => props.$wrap && css`
    flex-wrap: wrap;
  `}
  
  ${props => props.$direction && css`
    flex-direction: ${props.$direction};
  `}
`;
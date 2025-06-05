import styled, { css } from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props => {
    if (props.size === 'small') return '0.5rem 1rem';
    if (props.size === 'large') return '0.9rem 2rem';
    return '0.7rem 1.5rem';
  }};
  font-size: ${props => {
    if (props.size === 'small') return '0.9rem';
    if (props.size === 'large') return '1.2rem';
    return '1rem';
  }};
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Lexend', sans-serif;
  letter-spacing: 0.01em;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    pointer-events: none;
  }
  
  /* Ripple effect */
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.3) 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.4s, opacity 0.8s;
  }
  
  &:active::after {
    transform: scale(0, 0);
    opacity: 0.3;
    transition: 0s;
  }
  
  ${props => props.$variant === 'primary' || !props.$variant && css`
    background-color: #0066cc;
    color: white;
    border: none;
    font-weight: 700;
    
    &:hover, &:focus {
      background-color: #004c99;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      background-color: #99c2ff;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: #6c757d;
    color: white;
    
    &:hover, &:focus {
      background-color: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    &:disabled {
      background-color: #b6babe;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'danger' && css`
    background-color: #dc3545;
    color: white;
    
    &:hover, &:focus {
      background-color: #bd2130;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }
    
    &:disabled {
      background-color: #f1aeb5;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'success' && css`
    background-color: #28a745;
    color: white;
    
    &:hover, &:focus {
      background-color: #218838;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
    }
    
    &:disabled {
      background-color: #a3cfbb;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'outline' && css`
    background-color: ${props => props.$heroButton ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
    color: ${props => props.$heroButton ? 'white' : '#0066cc'};
    border-color: ${props => props.$heroButton ? 'white' : '#0066cc'};
    font-weight: 600;
    
    &:hover, &:focus {
      background-color: ${props => props.$heroButton ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 102, 204, 0.08)'};
      transform: translateY(-2px);
      box-shadow: ${props => props.$heroButton 
        ? '0 4px 8px rgba(0, 0, 0, 0.2)' 
        : '0 4px 8px rgba(0, 102, 204, 0.15)'};
    }
    
    &:disabled {
      color: ${props => props.$heroButton ? 'rgba(255, 255, 255, 0.5)' : '#99c2ff'};
      border-color: ${props => props.$heroButton ? 'rgba(255, 255, 255, 0.5)' : '#99c2ff'};
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'ghost' && css`
    background-color: transparent;
    color: #0066cc;
    border-color: transparent;
    box-shadow: none;
    
    &:hover, &:focus {
      background-color: rgba(0, 102, 204, 0.08);
    }
    
    &:disabled {
      color: #99c2ff;
    }
  `}
  
  ${props => props.$variant === 'accent' && css`
    background-color: #ffcc00;
    color: #333;
    border: none;
    font-weight: 700;
    
    &:hover, &:focus {
      background-color: #e6b800;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      background-color: #ffe680;
      box-shadow: none;
    }
  `}
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.$rounded && css`
    border-radius: 50px;
  `}
  
  ${props => props.$elevated && css`
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
  `}
`;

export default Button; 
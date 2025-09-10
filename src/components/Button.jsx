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
    background-color: var(--primary);
    color: var(--primary-contrast);
    border: none;
    font-weight: 700;
    
    &:hover, &:focus {
      background-color: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      background-color: var(--text-light);
      opacity: 0.6;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'secondary' && css`
    background-color: var(--text-muted);
    color: var(--primary-contrast);
    
    &:hover, &:focus {
      background-color: var(--text);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    &:disabled {
      background-color: var(--text-light);
      opacity: 0.6;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'danger' && css`
    background-color: var(--danger);
    color: var(--primary-contrast);
    
    &:hover, &:focus {
      background-color: var(--danger);
      filter: brightness(0.9);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }
    
    &:disabled {
      background-color: var(--danger-light);
      opacity: 0.6;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'success' && css`
    background-color: var(--success);
    color: var(--primary-contrast);
    
    &:hover, &:focus {
      background-color: var(--success);
      filter: brightness(0.9);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
    }
    
    &:disabled {
      background-color: var(--success-light);
      opacity: 0.6;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'outline' && css`
    background-color: ${props => props.$heroButton ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
    color: ${props => props.$heroButton ? 'var(--primary-contrast)' : 'var(--primary)'};
    border-color: ${props => props.$heroButton ? 'var(--primary-contrast)' : 'var(--primary)'};
    font-weight: 600;
    
    &:hover, &:focus {
      background-color: ${props => props.$heroButton ? 'rgba(255, 255, 255, 0.25)' : 'var(--primary)'};
      color: ${props => props.$heroButton ? 'var(--primary-contrast)' : 'var(--primary-contrast)'};
      transform: translateY(-2px);
      box-shadow: ${props => props.$heroButton 
        ? '0 4px 8px rgba(0, 0, 0, 0.2)' 
        : 'var(--shadow-md)'};
    }
    
    &:disabled {
      color: var(--text-light);
      border-color: var(--text-light);
      opacity: 0.6;
      box-shadow: none;
    }
  `}
  
  ${props => props.$variant === 'ghost' && css`
    background-color: transparent;
    color: var(--primary);
    border-color: transparent;
    box-shadow: none;
    
    &:hover, &:focus {
      background-color: var(--surface);
    }
    
    &:disabled {
      color: var(--text-light);
      opacity: 0.6;
    }
  `}
  
  ${props => props.$variant === 'accent' && css`
    background-color: var(--accent);
    color: var(--accent-contrast);
    border: none;
    font-weight: 700;
    
    &:hover, &:focus {
      background-color: var(--accent);
      filter: brightness(0.9);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:disabled {
      background-color: var(--accent-light);
      opacity: 0.6;
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
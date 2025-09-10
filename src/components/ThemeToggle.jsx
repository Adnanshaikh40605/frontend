import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ToggleButton = styled.button`
  position: relative;
  width: 60px;
  height: 30px;
  border: none;
  border-radius: 15px;
  background: var(--border);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  padding: 3px;
  
  &:hover {
    background: var(--border-dark);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-ring);
  }
`;

const ToggleSlider = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transform: ${props => props.$isDark ? 'translateX(30px)' : 'translateX(0)'};
  
  ${ToggleButton}:hover & {
    box-shadow: var(--shadow-md);
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'scale(1)' : 'scale(0.8)'};
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: var(--bg);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  margin-bottom: 5px;
  z-index: 1000;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--text);
  }
  
  ${TooltipWrapper}:hover & {
    opacity: 1;
    visibility: visible;
  }
`;

const ThemeToggle = ({ className, showTooltip = true }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  const component = (
    <ToggleButton
      onClick={handleToggle}
      className={className}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <ToggleSlider $isDark={isDark}>
        <IconWrapper $visible={!isDark}>
          ☀️
        </IconWrapper>
        <IconWrapper $visible={isDark}>
          🌙
        </IconWrapper>
      </ToggleSlider>
    </ToggleButton>
  );

  if (showTooltip) {
    return (
      <TooltipWrapper>
        {component}
        <Tooltip>
          Switch to {isDark ? 'light' : 'dark'} mode
        </Tooltip>
      </TooltipWrapper>
    );
  }

  return component;
};

export default ThemeToggle;
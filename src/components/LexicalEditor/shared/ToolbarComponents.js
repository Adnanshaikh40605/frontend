import styled from 'styled-components';

// Shared toolbar components to reduce duplication across plugins

export const ToolbarContainer = styled.div`
  display: flex;
  background: #fff;
  padding: 8px 12px;
  border-bottom: 1px solid #e1e5e9;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:not(:last-child)::after {
    content: '';
    width: 1px;
    height: 24px;
    background: #e1e5e9;
    margin: 0 8px;
  }
`;

export const ToolbarButton = styled.button.attrs({ type: 'button' })`
  background: ${props => props.$active ? '#e3f2fd' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#2196f3' : 'transparent'};
  border-radius: 4px;
  color: ${props => props.$active ? '#1976d2' : '#333'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  font-size: 14px;
  min-width: 32px;
  height: 32px;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: ${props => props.$active ? '#e3f2fd' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ToolbarSelect = styled.select`
  background: transparent;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-size: 14px;
  height: 32px;
  padding: 0 8px;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

export const ToolbarDivider = styled.div`
  width: 1px;
  height: 24px;
  background: #e1e5e9;
  margin: 0 4px;
`;

export const Divider = styled.div`
  height: 1px;
  background: #e1e5e9;
  margin: 4px 0;
`;

export const ColorPicker = styled.input`
  width: 32px;
  height: 32px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  padding: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownContent = styled.div`
  display: ${props => props.$visible ? 'block' : 'none'};
  position: absolute;
  background-color: white;
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1000;
  border-radius: 4px;
  border: 1px solid #e1e5e9;
  top: 100%;
  left: 0;
  margin-top: 4px;
`;

export const DropdownItem = styled.button.attrs({ type: 'button' })`
  background: none;
  border: none;
  padding: 8px 12px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export const FontSizeContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: white;
`;

export const FontSizeInput = styled.input`
  background: transparent;
  border: none;
  color: #333;
  font-size: 14px;
  height: 30px;
  padding: 0 4px;
  width: 40px;
  text-align: center;

  &:focus {
    outline: none;
  }
`;

export const FontSizeButton = styled.button.attrs({ type: 'button' })`
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 15px;
  font-size: 12px;
  font-weight: bold;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Common block type mappings
export const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

// Common font family options
export const fontFamilyOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Palatino', label: 'Palatino' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Bookman', label: 'Bookman' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Arial Black', label: 'Arial Black' },
];
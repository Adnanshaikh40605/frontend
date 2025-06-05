import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const EditorContainer = styled.div`
  margin-bottom: 1.5rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #dce0e5;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  gap: 0.5rem;
  overflow-x: auto;
`;

const ToolbarGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ToolButton = styled.button`
  width: 36px;
  height: 36px;
  background-color: ${props => props.$active ? '#e9ecef' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#ced4da' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  color: #495057;
  
  &:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background-color: #dce0e5;
  margin: 0 0.25rem;
  align-self: center;
`;

const EditorContent = styled.div`
  min-height: ${props => props.$height || '400px'};
  padding: 1rem;
  border: 1px solid #dce0e5;
  border-top: none;
  border-bottom-left-radius: ${props => props.$fullscreen ? '0' : '6px'};
  border-bottom-right-radius: ${props => props.$fullscreen ? '0' : '6px'};
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  background-color: white;
  overflow-y: auto;
  font-family: 'Lexend', sans-serif;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  & p {
    margin-bottom: 1rem;
  }
  
  & h1, & h2, & h3, & h4 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    font-family: 'Lexend', sans-serif;
    letter-spacing: -0.02em;
  }
  
  & ul, & ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  & blockquote {
    border-left: 3px solid #dce0e5;
    padding-left: 1rem;
    margin-left: 0;
    color: #6c757d;
  }
  
  & img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 4px;
  }
  
  & pre {
    background-color: #f8f9fa;
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', monospace;
    margin-bottom: 1rem;
  }
  
  & code {
    font-family: 'Consolas', 'Monaco', monospace;
    background-color: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.875em;
  }
  
  & .resizable-image {
    position: relative;
    display: inline-block;
    
    &:hover .resize-handle {
      display: block;
    }
  }
  
  & .resize-handle {
    display: none;
    position: absolute;
    width: 10px;
    height: 10px;
    background: #80bdff;
    border: 1px solid white;
    border-radius: 50%;
    
    &.nw {
      top: -5px;
      left: -5px;
      cursor: nwse-resize;
    }
    
    &.ne {
      top: -5px;
      right: -5px;
      cursor: nesw-resize;
    }
    
    &.sw {
      bottom: -5px;
      left: -5px;
      cursor: nesw-resize;
    }
    
    &.se {
      bottom: -5px;
      right: -5px;
      cursor: nwse-resize;
    }
  }
`;

const Select = styled.select`
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 4px;
  border: 1px solid #dce0e5;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ColorPicker = styled.input`
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #dce0e5;
  border-radius: 4px;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dce0e5;
  border-top: none;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  font-size: 0.875rem;
  color: #6c757d;
`;

const FindReplaceContainer = styled.div`
  display: ${props => props.$visible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dce0e5;
  border-top: none;
`;

const FindReplaceRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FindReplaceInput = styled.input`
  padding: 0.375rem 0.75rem;
  border: 1px solid #dce0e5;
  border-radius: 4px;
  flex-grow: 1;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const FindReplaceButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dce0e5;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #e9ecef;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const FullscreenContainer = styled.div`
  position: ${props => props.$fullscreen ? 'fixed' : 'relative'};
  top: ${props => props.$fullscreen ? '0' : 'auto'};
  left: ${props => props.$fullscreen ? '0' : 'auto'};
  right: ${props => props.$fullscreen ? '0' : 'auto'};
  bottom: ${props => props.$fullscreen ? '0' : 'auto'};
  z-index: ${props => props.$fullscreen ? '1050' : 'auto'};
  background-color: ${props => props.$fullscreen ? 'white' : 'transparent'};
  display: flex;
  flex-direction: column;
  height: ${props => props.$fullscreen ? '100vh' : 'auto'};
`;

const RichTextEditor = ({ 
  value = '', 
  onChange,
  placeholder = 'Start writing...',
  onImageUpload
}) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const [findReplaceVisible, setFindReplaceVisible] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Update useEffect to include value dependency
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      
      // Set placeholder attribute
      if (placeholder) {
        editorRef.current.setAttribute('placeholder', placeholder);
      }
      
      updateWordCount();
    }
  }, [editorRef, value, placeholder]);
  
  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && value !== undefined && !isEditorFocused) {
      // Only update if not currently editing (to prevent cursor jumping)
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
        updateWordCount();
      }
    }
  }, [value, isEditorFocused]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editorRef.current || !document.activeElement.contains(editorRef.current)) return;
      
      // Prevent default browser behavior for these shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            execCommand('underline');
            break;
          case 'k':
            if (e.shiftKey) {
              e.preventDefault();
              const url = prompt('Enter URL:');
              if (url) execCommand('createLink', url);
            }
            break;
          default:
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Handle fullscreen mode
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);
  
  // Handle drag and drop for images
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!e.dataTransfer.files || !e.dataTransfer.files[0] || !onImageUpload) return;
      
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;
      
      const imageUrl = await onImageUpload(file);
      if (imageUrl) {
        insertImage(imageUrl);
      }
    };
    
    editor.addEventListener('dragover', handleDragOver);
    editor.addEventListener('drop', handleDrop);
    
    return () => {
      editor.removeEventListener('dragover', handleDragOver);
      editor.removeEventListener('drop', handleDrop);
    };
  }, [onImageUpload]);
  
  // Execute command on the content
  const execCommand = (command, commandValue = null) => {
    document.execCommand(command, false, commandValue);
    
    // After executing command, update onChange
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
      updateWordCount();
    }
    
    // Refocus on editor
    editorRef.current.focus();
  };
  
  // Format buttons
  const formatOptions = [
    { command: 'formatBlock', value: '<h1>', label: 'H1', icon: 'H1' },
    { command: 'formatBlock', value: '<h2>', label: 'H2', icon: 'H2' },
    { command: 'formatBlock', value: '<h3>', label: 'H3', icon: 'H3' },
    { command: 'formatBlock', value: '<h4>', label: 'H4', icon: 'H4' },
    { command: 'formatBlock', value: '<h5>', label: 'H5', icon: 'H5' },
    { command: 'formatBlock', value: '<h6>', label: 'H6', icon: 'H6' },
    { command: 'formatBlock', value: '<p>', label: 'P', icon: 'P' },
  ];
  
  // Style buttons
  const styleOptions = [
    { command: 'bold', label: 'Bold', icon: 'B' },
    { command: 'italic', label: 'Italic', icon: 'I' },
    { command: 'underline', label: 'Underline', icon: 'U' },
    { command: 'superscript', label: 'Superscript', icon: 'x²' },
    { command: 'subscript', label: 'Subscript', icon: 'x₂' },
  ];
  
  // List buttons
  const listOptions = [
    { command: 'insertUnorderedList', label: 'Bullet List', icon: '•' },
    { command: 'insertOrderedList', label: 'Numbered List', icon: '1.' },
  ];
  
  // Other buttons
  const otherOptions = [
    { command: 'createLink', label: 'Link', icon: '🔗', prompt: true, promptText: 'Enter URL:' },
    { command: 'formatBlock', value: '<blockquote>', label: 'Quote', icon: '"' },
    { command: 'formatBlock', value: '<pre>', label: 'Code Block', icon: '</>' },
    { command: 'insertHTML', value: '<code></code>', label: 'Inline Code', icon: '`' },
  ];
  
  // History buttons
  const historyOptions = [
    { command: 'undo', label: 'Undo', icon: '↩' },
    { command: 'redo', label: 'Redo', icon: '↪' },
  ];
  
  // Fix the handleChange function to use the value properly
  const handleChange = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
      updateWordCount();
    }
  };
  
  // Handle image upload with proper onImageUpload check
  const handleImageUpload = async () => {
    if (!onImageUpload) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (!e.target.files || !e.target.files[0]) return;
      
      const file = e.target.files[0];
      const imageUrl = await onImageUpload(file);
      
      if (imageUrl) {
        insertImage(imageUrl);
      }
    };
    input.click();
  };
  
  // Insert image with resize handles
  const insertImage = (url) => {
    const img = `
      <div class="resizable-image" contenteditable="false">
        <img src="${url}" alt="Uploaded image" style="width: 100%; height: auto;">
        <div class="resize-handle nw"></div>
        <div class="resize-handle ne"></div>
        <div class="resize-handle sw"></div>
        <div class="resize-handle se"></div>
      </div>
    `;
    execCommand('insertHTML', img);
    
    // Setup resize functionality after insertion
    setTimeout(() => {
      setupImageResizing();
    }, 100);
  };
  
  // Setup image resizing functionality
  const setupImageResizing = useCallback(() => {
    if (!editorRef.current) return;
    
    const images = editorRef.current.querySelectorAll('.resizable-image');
    
    images.forEach(container => {
      const img = container.querySelector('img');
      const handles = container.querySelectorAll('.resize-handle');
      
      handles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          setSelectedImage(img);
          
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = img.clientWidth;
          const startHeight = img.clientHeight;
          const handleClass = handle.className.split(' ')[1]; // nw, ne, sw, se
          
          const resize = (moveEvent) => {
            moveEvent.preventDefault();
            
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            
            let newWidth, newHeight;
            
            switch (handleClass) {
              case 'nw':
                newWidth = startWidth - deltaX;
                newHeight = startHeight - deltaY;
                break;
              case 'ne':
                newWidth = startWidth + deltaX;
                newHeight = startHeight - deltaY;
                break;
              case 'sw':
                newWidth = startWidth - deltaX;
                newHeight = startHeight + deltaY;
                break;
              case 'se':
                newWidth = startWidth + deltaX;
                newHeight = startHeight + deltaY;
                break;
              default:
                return;
            }
            
            // Maintain aspect ratio
            const aspectRatio = startWidth / startHeight;
            newHeight = newWidth / aspectRatio;
            
            // Apply new dimensions
            img.style.width = `${Math.max(50, newWidth)}px`;
            img.style.height = 'auto';
            
            // Update editor content
            handleChange();
          };
          
          const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            setSelectedImage(null);
          };
          
          document.addEventListener('mousemove', resize);
          document.addEventListener('mouseup', stopResize);
        });
      });
    });
  }, [handleChange]);
  
  // Check if a command is active
  const isCommandActive = (command) => {
    return document.queryCommandState(command);
  };
  
  // Update word count
  const updateWordCount = () => {
    if (!editorRef.current) return;
    
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    
    setWordCount({ words, characters });
  };
  
  // Handle paste to clean formatting
  const handlePaste = (e) => {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain');
    
    // Insert at current position
    document.execCommand('insertText', false, text);
    
    // Update content
    handleChange();
  };
  
  // Find text in editor
  const handleFind = () => {
    if (!findText.trim() || !editorRef.current) return;
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    // Start from beginning if no selection
    if (!selection.rangeCount) {
      range.setStart(editorRef.current, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Use browser's find functionality
    window.find(findText, false, false, true, false, true, false);
  };
  
  // Replace current selection with replace text
  const handleReplace = () => {
    const selection = window.getSelection();
    if (!selection.toString() || selection.toString() !== findText) {
      handleFind();
      return;
    }
    
    document.execCommand('insertText', false, replaceText);
    handleChange();
    handleFind();
  };
  
  // Replace all occurrences
  const handleReplaceAll = () => {
    if (!findText.trim() || !editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, replaceText);
    
    editorRef.current.innerHTML = newContent;
    handleChange();
  };
  
  return (
    <FullscreenContainer $fullscreen={isFullscreen}>
      <EditorContainer>
        <Toolbar>
          <ToolbarGroup>
            <Select 
              onChange={(e) => execCommand('formatBlock', e.target.value)}
              value={document.queryCommandValue('formatBlock') || '<p>'}
            >
              <option value="<p>">Paragraph</option>
              <option value="<h1>">Heading 1</option>
              <option value="<h2>">Heading 2</option>
              <option value="<h3>">Heading 3</option>
              <option value="<h4>">Heading 4</option>
              <option value="<h5>">Heading 5</option>
              <option value="<h6>">Heading 6</option>
              <option value="<pre>">Code Block</option>
            </Select>
            
            <Select
              onChange={(e) => {
                if (e.target.value) {
                  execCommand('fontSize', e.target.value);
                }
              }}
            >
              <option value="">Font Size</option>
              <option value="1">Small</option>
              <option value="2">Medium</option>
              <option value="3">Normal</option>
              <option value="4">Large</option>
              <option value="5">X-Large</option>
              <option value="6">XX-Large</option>
              <option value="7">XXX-Large</option>
            </Select>
            
            <Select
              onChange={(e) => {
                if (e.target.value) {
                  execCommand('fontName', e.target.value);
                }
              }}
            >
              <option value="">Font Family</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Lexend', sans-serif">Lexend</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
            </Select>
          </ToolbarGroup>
          
          <Divider />
          
          <ToolbarGroup>
            {styleOptions.map((option, index) => (
              <ToolButton
                key={index}
                title={option.label}
                onClick={() => execCommand(option.command)}
                $active={isCommandActive(option.command)}
              >
                {option.icon}
              </ToolButton>
            ))}
            
            <ColorPicker
              type="color"
              title="Text Color"
              onChange={(e) => execCommand('foreColor', e.target.value)}
            />
            
            <ColorPicker
              type="color"
              title="Background Color"
              onChange={(e) => execCommand('hiliteColor', e.target.value)}
            />
          </ToolbarGroup>
          
          <Divider />
          
          <ToolbarGroup>
            {listOptions.map((option, index) => (
              <ToolButton
                key={index}
                title={option.label}
                onClick={() => execCommand(option.command)}
                $active={isCommandActive(option.command)}
              >
                {option.icon}
              </ToolButton>
            ))}
          </ToolbarGroup>
          
          <Divider />
          
          <ToolbarGroup>
            {otherOptions.map((option, index) => (
              <ToolButton
                key={index}
                title={option.label}
                onClick={() => {
                  if (option.command === 'insertHTML' && option.value === '<code></code>') {
                    const selection = window.getSelection().toString();
                    execCommand('insertHTML', `<code>${selection || ''}</code>`);
                  } else if (option.prompt) {
                    const url = prompt(option.promptText);
                    if (url) {
                      execCommand(option.command, url);
                    }
                  } else {
                    execCommand(option.command, option.value);
                  }
                }}
                $active={
                  option.command === 'formatBlock' 
                    ? document.queryCommandValue('formatBlock') === option.value 
                    : isCommandActive(option.command)
                }
              >
                {option.icon}
              </ToolButton>
            ))}
            
            <ToolButton
              title="Insert Image"
              onClick={handleImageUpload}
            >
              🖼️
            </ToolButton>
          </ToolbarGroup>
          
          <Divider />
          
          <ToolbarGroup>
            {historyOptions.map((option, index) => (
              <ToolButton
                key={index}
                title={option.label}
                onClick={() => execCommand(option.command)}
              >
                {option.icon}
              </ToolButton>
            ))}
          </ToolbarGroup>
          
          <Divider />
          
          <ToolbarGroup>
            <ToolButton
              title="Find & Replace"
              onClick={() => setFindReplaceVisible(!findReplaceVisible)}
              $active={findReplaceVisible}
            >
              🔍
            </ToolButton>
            
            <ToolButton
              title="Fullscreen"
              onClick={() => setIsFullscreen(!isFullscreen)}
              $active={isFullscreen}
            >
              {isFullscreen ? '⊙' : '⛶'}
            </ToolButton>
          </ToolbarGroup>
        </Toolbar>
        
        <FindReplaceContainer $visible={findReplaceVisible}>
          <FindReplaceRow>
            <FindReplaceInput
              type="text"
              placeholder="Find text..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
            <FindReplaceButton onClick={handleFind}>Find</FindReplaceButton>
          </FindReplaceRow>
          
          <FindReplaceRow>
            <FindReplaceInput
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
            <FindReplaceButton onClick={handleReplace}>Replace</FindReplaceButton>
            <FindReplaceButton onClick={handleReplaceAll}>Replace All</FindReplaceButton>
          </FindReplaceRow>
        </FindReplaceContainer>
        
        <EditorContent
          ref={editorRef}
          contentEditable
          $height={isFullscreen ? 'calc(100vh - 150px)' : '400px'}
          $fullscreen={isFullscreen}
          onInput={handleChange}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: value || '<p><br></p>' }}
        />
        
        <StatusBar>
          <div>
            {wordCount.words} words, {wordCount.characters} characters
          </div>
          <div>
            {isFullscreen ? 'Press ESC to exit fullscreen' : ''}
          </div>
        </StatusBar>
      </EditorContainer>
    </FullscreenContainer>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  onImageUpload: PropTypes.func.isRequired
};

export default RichTextEditor; 
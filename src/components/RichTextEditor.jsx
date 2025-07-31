import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const EditorContainer = styled.div`
  --editor-font-family: "Lexend", sans-serif;
  --code-font-family: monospace;
  --editor-text-color: #333;
  --editor-background: #fff;
  --toolbar-background: #f8f9fa;
  --border-color: #dce0e5;
  --accent-color: #0066cc;
  --code-background: #f5f5f5;
  
  margin-bottom: 1.5rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  
  &.rich-text-editor-root {
    color: var(--editor-text-color);
    background-color: var(--editor-background);
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  background-color: var(--toolbar-background);
  border: 1px solid var(--border-color);
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
  background-color: ${props => props.$active ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'var(--border-color)' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  color: var(--editor-text-color);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: var(--border-color);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.25);
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
  border: 1px solid var(--border-color);
  border-top: none;
  border-bottom-left-radius: ${props => props.$fullscreen ? '0' : '6px'};
  border-bottom-right-radius: ${props => props.$fullscreen ? '0' : '6px'};
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--editor-text-color);
  background-color: var(--editor-background);
  overflow-y: auto;
  transition: all 0.3s ease;
  
  /* Use CSS variables for font styling */
  --editor-font-family: 'Lexend', sans-serif;
  --code-font-family: 'Consolas', 'Monaco', monospace;
  
  /* Apply font family at container level */
  font-family: var(--editor-font-family);
  
  /* Apply Lexend font to all content by default */
  &.lexend-content * {
    font-family: var(--editor-font-family);
  }
  
  /* Preserve code font */
  &.lexend-content code, &.lexend-content pre {
    font-family: var(--code-font-family);
  }
  
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
    letter-spacing: -0.02em;
  }
  
  & ul, & ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  & blockquote {
    border-left: 3px solid var(--border-color);
    padding-left: 1rem;
    margin-left: 0;
    color: var(--editor-text-color);
    opacity: 0.8;
  }
  
  & img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 4px;
  }
  
  & pre {
    background-color: var(--code-background);
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    font-family: var(--code-font-family);
    margin-bottom: 1rem;
  }
  
  & code {
    font-family: var(--code-font-family);
    background-color: var(--code-background);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.875em;
  }
  
  /* Image placeholder styling */
  & .image-placeholder {
    padding: 1rem;
    background-color: var(--toolbar-background);
    border: 1px dashed var(--border-color);
    border-radius: 4px;
    text-align: center;
    margin: 1rem 0;
    color: var(--editor-text-color);
  }
  
  & .resizable-image {
    position: relative;
    display: inline-block;
    
    &:hover .resize-handle {
      display: block;
    }
  }
  
  & img.selected {
    outline: 2px solid var(--accent-color);
  }
  
  & .resize-handle {
    display: none;
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--accent-color);
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
  border: 1px solid var(--border-color);
  background-color: var(--editor-background);
  cursor: pointer;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.25);
  }
`;

const ColorPicker = styled.input`
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border-color);
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
  background-color: var(--toolbar-background);
  border: 1px solid var(--border-color);
  border-top: none;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  font-size: 0.875rem;
  color: var(--editor-text-color);
`;

const FindReplaceContainer = styled.div`
  display: ${props => props.$visible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--toolbar-background);
  border: 1px solid var(--border-color);
  border-top: none;
`;

const FindReplaceRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FindReplaceInput = styled.input`
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  flex-grow: 1;
  
  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.25);
  }
`;

const FindReplaceButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: var(--toolbar-background);
  border: 1px solid var(--border-color);
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
  onImageUpload,
  fontFamily = '"Lexend", sans-serif',
  codeFontFamily = 'monospace',
  theme = {
    textColor: '#333',
    backgroundColor: '#fff',
    toolbarBackground: '#f8f9fa',
    borderColor: '#dce0e5',
    accentColor: '#0066cc',
    codeBackground: '#f5f5f5'
  }
}) => {
  const editorRef = useRef(null);
  const prevContentRef = useRef('');
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
  const [findReplaceVisible, setFindReplaceVisible] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Set CSS variables for theming
  useEffect(() => {
    if (editorRef.current) {
      const root = editorRef.current.closest('.rich-text-editor-root');
      if (root) {
        root.style.setProperty('--editor-font-family', fontFamily);
        root.style.setProperty('--code-font-family', codeFontFamily);
        root.style.setProperty('--editor-text-color', theme.textColor);
        root.style.setProperty('--editor-background', theme.backgroundColor);
        root.style.setProperty('--toolbar-background', theme.toolbarBackground);
        root.style.setProperty('--border-color', theme.borderColor);
        root.style.setProperty('--accent-color', theme.accentColor);
        root.style.setProperty('--code-background', theme.codeBackground);
      }
    }
  }, [fontFamily, codeFontFamily, theme, editorRef]);
  
  // Update useEffect to include value dependency
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
      
      // Apply Lexend font to all elements
      applyLexendFont();
      
      // Set placeholder attribute
      if (placeholder) {
        editorRef.current.setAttribute('placeholder', placeholder);
      }
      
      updateWordCount();
    }
  }, [editorRef, value, placeholder]);
  
  // Function to apply Lexend font to all elements in the editor
  const applyLexendFont = () => {
    if (!editorRef.current) return;
    
    // Add a class to the editor content that will inherit the font family
    editorRef.current.classList.add('lexend-content');
    
    // Remove any inline font-family styles that might override our CSS
    const elements = editorRef.current.querySelectorAll('*');
    elements.forEach(el => {
      if (el.style.fontFamily && !el.tagName.match(/^(CODE|PRE)$/i)) {
        el.style.removeProperty('font-family');
      }
    });
  };
  
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
      
      if (!e.dataTransfer.files || !e.dataTransfer.files[0]) return;
      if (!onImageUpload) {
        alert('Image upload is not configured');
        return;
      }
      
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed.');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image is too large. Maximum size is 5MB.');
        return;
      }
      
      try {
        // Show loading placeholder
        insertImage(null, 'Uploading...', true);
        
        const imageUrl = await onImageUpload(file);
        
        // Remove loading placeholder
        const placeholder = editorRef.current.querySelector('.image-placeholder[data-loading="true"]');
        if (placeholder) {
          placeholder.remove();
        }
        
        if (imageUrl) {
          // Get file name for alt text
          const fileName = file.name.split('.')[0] || 'Uploaded image';
          insertImage(imageUrl, fileName);
        } else {
          alert('Failed to upload image. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        
        // Remove loading placeholder
        const placeholder = editorRef.current.querySelector('.image-placeholder[data-loading="true"]');
        if (placeholder) {
          placeholder.remove();
        }
        
        // Show user-friendly error message
        alert(`Failed to upload image: ${error.message || 'Unknown error'}. Please try again.`);
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
    // Store the content before executing the command
    const contentBefore = editorRef.current ? editorRef.current.innerHTML : '';
    
    document.execCommand(command, false, commandValue);
    
    // Get content after executing the command
    const contentAfter = editorRef.current ? editorRef.current.innerHTML : '';
    
    // Only call onChange if the content actually changed
    if (editorRef.current && onChange && contentBefore !== contentAfter) {
      onChange(contentAfter);
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
  
  // Handle content changes with optimization to prevent unnecessary updates
  const handleChange = () => {
    if (editorRef.current && onChange) {
      const currentContent = editorRef.current.innerHTML;
      
      // Only call onChange if we have a previous content to compare with
      // and the content has actually changed
      if (typeof prevContentRef.current === 'string' && prevContentRef.current !== currentContent) {
        onChange(currentContent);
        updateWordCount();
      }
      
      // Update the previous content reference
      prevContentRef.current = currentContent;
    }
  };
  
  // Handle image upload with proper onImageUpload check and improved error handling
  const handleImageUpload = async () => {
    if (!onImageUpload) {
      alert('Image upload is not configured');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (!e.target.files || !e.target.files[0]) return;
      
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image is too large. Maximum size is 5MB.');
        return;
      }
      
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Only image files are allowed.');
        return;
      }
      
      try {
        // Show loading placeholder
        insertImage(null, 'Uploading...', true);
        
        const imageUrl = await onImageUpload(file);
        
        // Remove loading placeholder
        const placeholder = editorRef.current.querySelector('.image-placeholder[data-loading="true"]');
        if (placeholder) {
          placeholder.remove();
        }
        
        if (imageUrl) {
          // Get file name for alt text
          const fileName = file.name.split('.')[0] || 'Uploaded image';
          insertImage(imageUrl, fileName);
        } else {
          alert('Failed to upload image. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        
        // Remove loading placeholder
        const placeholder = editorRef.current.querySelector('.image-placeholder[data-loading="true"]');
        if (placeholder) {
          placeholder.remove();
        }
        
        // Show user-friendly error message
        alert(`Failed to upload image: ${error.message || 'Unknown error'}. Please try again.`);
      }
    };
    input.click();
  };
  
  // Insert image with resize handles or placeholder
  const insertImage = (url, alt = 'Uploaded image', isPlaceholder = false) => {
    if (isPlaceholder) {
      // Insert a placeholder while image is uploading
      const placeholder = `<div class="image-placeholder" data-loading="true">Uploading image...</div>`;
      execCommand('insertHTML', placeholder);
      return;
    }
    
    if (!url) return;
    
    // Insert actual image with resize handles
    const img = `
      <div class="resizable-image" contenteditable="false">
        <img src="${url}" alt="${alt}" style="width: 100%; height: auto;">
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
    
    try {
      // Create temporary container to process HTML
      const tempDiv = document.createElement('div');
      
      // Check if HTML content is available in the clipboard
      const htmlContent = e.clipboardData.getData('text/html');
      const plainText = e.clipboardData.getData('text/plain');
      
      if (htmlContent) {
        // Use HTML content which preserves images and basic formatting
        tempDiv.innerHTML = htmlContent;
        
        // Add our content class to inherit font styling
        tempDiv.classList.add('lexend-content');
        
        // Remove unwanted styles but keep basic formatting
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(el => {
          // Keep only essential styles
          const style = el.style;
          const fontWeight = style.fontWeight;
          const fontStyle = style.fontStyle;
          const textDecoration = style.textDecoration;
          const color = style.color;
          const backgroundColor = style.backgroundColor;
          
          // Clear all styles
          el.removeAttribute('style');
          
          // Re-apply only essential styles
          if (fontWeight) el.style.fontWeight = fontWeight;
          if (fontStyle) el.style.fontStyle = fontStyle;
          if (textDecoration) el.style.textDecoration = textDecoration;
          if (color) el.style.color = color;
          if (backgroundColor) el.style.backgroundColor = backgroundColor;
          
          // Remove class attributes that might contain unwanted styles
          if (el.className && !el.className.includes('lexend-content')) {
            el.removeAttribute('class');
          }
          
          // Remove any font-family styles (except for code elements)
          if (!el.tagName.match(/^(CODE|PRE)$/i)) {
            el.style.removeProperty('font-family');
          }
        });
        
        // Insert the processed HTML
        document.execCommand('insertHTML', false, tempDiv.innerHTML);
      } else {
        // Fallback to plain text if HTML is not available
        document.execCommand('insertText', false, plainText);
      }
      
      // Update content
      handleChange();
    } catch (error) {
      console.error('Error handling paste:', error);
      
      // Fallback to inserting plain text if there's an error
      try {
        const plainText = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, plainText);
        handleChange();
      } catch (fallbackError) {
        console.error('Error in paste fallback:', fallbackError);
        alert('Failed to paste content. Please try again.');
      }
    }
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
      <EditorContainer className="rich-text-editor-root">
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
  onImageUpload: PropTypes.func.isRequired,
  fontFamily: PropTypes.string,
  codeFontFamily: PropTypes.string,
  theme: PropTypes.shape({
    textColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    toolbarBackground: PropTypes.string,
    borderColor: PropTypes.string,
    accentColor: PropTypes.string,
    codeBackground: PropTypes.string
  })
};

export default RichTextEditor;
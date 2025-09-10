import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styled from 'styled-components';
import { ENDPOINTS } from '../api/apiEndpoints';

// Suppress the findDOMNode warning from react-quill
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
    return;
  }
  originalWarn.apply(console, args);
};

const EditorContainer = styled.div`
  /* Ensure the container allows positioning */
  position: relative;
  overflow: visible;
  
  .ql-editor {
    min-height: 300px;
    font-size: 16px;
    line-height: 1.6;
    font-family: var(--font-family-primary);
    background-color: var(--bg) !important;
    color: var(--text) !important;
    padding: var(--spacing-4) !important;
  }
  
  .ql-toolbar {
    position: sticky;
    top: 0;
    z-index: 1001;
    background-color: var(--bg) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease-in-out;
    margin: 0 !important;
    padding: var(--spacing-2) !important;
  }
  
  /* Fixed toolbar when in editor section */
  .ql-toolbar.toolbar-fixed {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 1001 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
    border-radius: 0 !important;
    backdrop-filter: blur(15px) !important;
  }
  
  /* Enhanced shadow when toolbar is hovered */
  .ql-toolbar:hover,
  .ql-toolbar:focus-within {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
  
  .ql-container {
    border: 1px solid var(--border) !important;
    border-top: none !important;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    background-color: var(--bg) !important;
  }
  
  .ql-editor.ql-blank::before {
    color: var(--text-muted);
    font-style: italic;
  }
  
  .ql-editor:focus {
    outline: none;
  }
  
  .ql-container.ql-snow {
    border-radius: 0 0 var(--radius-md) var(--radius-md);
  }
  
  .ql-toolbar.ql-snow {
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }
  
  /* Custom button styles */
  .ql-toolbar .ql-formats {
    margin-right: 15px;
  }
  
  /* Enhanced header dropdown styling */
  .ql-toolbar .ql-header {
    min-width: 120px;
  }
  
  .ql-toolbar .ql-header .ql-picker-label {
    font-weight: 600;
    color: var(--text);
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s ease;
  }
  
  .ql-toolbar .ql-header .ql-picker-label:hover {
    background-color: var(--surface-light);
    color: var(--primary);
  }
  
  .ql-toolbar .ql-header .ql-picker-options {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border-color);
    background-color: var(--bg);
    padding: 4px 0;
  }
  
  .ql-toolbar .ql-header .ql-picker-item {
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.2s ease;
    border-radius: 4px;
    margin: 2px 8px;
  }
  
  .ql-toolbar .ql-header .ql-picker-item:hover {
    background-color: var(--primary-light);
    color: var(--primary-dark);
  }
  
  .ql-toolbar .ql-header .ql-picker-item.ql-selected {
    background-color: var(--primary);
    color: white;
  }
  
  /* Header dropdown item styling with visual hierarchy */
  .ql-toolbar .ql-header .ql-picker-item[data-value="1"] {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1a202c;
  }
  
  .ql-toolbar .ql-header .ql-picker-item[data-value="2"] {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
  }
  
  .ql-toolbar .ql-header .ql-picker-item[data-value="3"] {
    font-size: 1.125rem;
    font-weight: 600;
    color: #4a5568;
  }
  
  .ql-toolbar .ql-header .ql-picker-item[data-value="4"] {
    font-size: 1rem;
    font-weight: 600;
    color: #4a5568;
  }
  
  .ql-toolbar .ql-header .ql-picker-item[data-value="5"] {
    font-size: 0.9rem;
    font-weight: 600;
    color: #718096;
  }
  
  .ql-toolbar .ql-header .ql-picker-item[data-value="6"] {
    font-size: 0.8rem;
    font-weight: 600;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  /* Toolbar button styling */
  .ql-toolbar button {
    padding: 5px !important;
    margin: 2px !important;
    border-radius: var(--radius-sm) !important;
    border: 1px solid transparent !important;
    background-color: transparent !important;
    color: var(--text) !important;
    transition: all var(--transition-fast) !important;
    width: 28px !important;
    height: 28px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .ql-toolbar button:hover {
    background-color: var(--surface-light) !important;
    border-color: var(--border) !important;
  }
  
  .ql-toolbar button.ql-active {
    background-color: var(--primary) !important;
    color: var(--text-inverse) !important;
    border-color: var(--primary) !important;
  }
  
  /* Dropdown styling */
  .ql-toolbar .ql-picker {
    color: var(--text) !important;
  }
  
  .ql-toolbar .ql-picker-label {
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-sm) !important;
    padding: 4px 8px !important;
    background-color: var(--bg) !important;
    color: var(--text) !important;
    transition: all var(--transition-fast) !important;
  }
  
  .ql-toolbar .ql-picker-label:hover {
    background-color: var(--surface-light) !important;
    border-color: var(--border-dark) !important;
  }
  
  .ql-toolbar .ql-picker-options {
    background-color: var(--bg) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-md) !important;
    box-shadow: var(--shadow-lg) !important;
    padding: var(--spacing-2) !important;
  }
  
  .ql-toolbar .ql-picker-item {
    color: var(--text) !important;
    // padding: var(--spacing-2) var(--spacing-3) !important;
    border-radius: var(--radius-sm) !important;
    transition: all var(--transition-fast) !important;
  }
  
  .ql-toolbar .ql-picker-item:hover {
    background-color: var(--surface-light) !important;
  }
  
  .ql-toolbar .ql-picker-item.ql-selected {
    // background-color: var(--primary) !important;
    color: var(--text-inverse) !important;
  }
  
  /* Color picker styling */
  .ql-toolbar .ql-color .ql-picker-label,
  .ql-toolbar .ql-background .ql-picker-label {
    width: 28px !important;
    height: 28px !important;
  }
  
  /* SVG icon styling */
  .ql-toolbar button svg,
  .ql-toolbar .ql-picker-label svg {
    fill: currentColor !important;
    stroke: currentColor !important;
  }
  
  /* Stroke styling for icons */
  .ql-toolbar .ql-stroke {
    stroke: var(--text) !important;
    fill: none !important;
  }
  
  .ql-toolbar button:hover .ql-stroke {
    stroke: var(--text) !important;
  }
  
  .ql-toolbar button.ql-active .ql-stroke {
    stroke: var(--text-inverse) !important;
  }
  
  /* Fill styling for icons */
  .ql-toolbar .ql-fill {
    fill: var(--text) !important;
    stroke: none !important;
  }
  
  .ql-toolbar button:hover .ql-fill {
    fill: var(--text) !important;
  }
  
  .ql-toolbar button.ql-active .ql-fill {
    fill: var(--text-inverse) !important;
  }
  
  /* Even styling for specific icons */
  .ql-toolbar .ql-even {
    fill-rule: evenodd !important;
    fill: var(--text) !important;
  }
  
  .ql-toolbar button:hover .ql-even {
    fill: var(--text) !important;
  }
  
  .ql-toolbar button.ql-active .ql-even {
    fill: var(--text-inverse) !important;
  }
  
  /* Style for blockquotes */
  .ql-editor blockquote {
    border-left: 4px solid var(--primary);
    padding-left: 16px;
    margin: 16px 0;
    font-style: italic;
    background-color: var(--surface-light);
    padding: 12px 16px;
    border-radius: 4px;
  }
  
  /* Style for code blocks */
  .ql-editor pre {
    background-color: var(--surface);
    padding: 12px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    overflow-x: auto;
  }
  
  /* Style for inline code */
  .ql-editor code {
    background-color: var(--surface-light);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: var(--font-family-mono);
  }
  
  /* Image styles */
  .ql-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
  }
  
  /* Link styles */
  .ql-editor a {
    color: var(--primary);
    text-decoration: underline;
  }
  
  .ql-editor a:hover {
    color: var(--primary-dark);
  }
  
  /* Heading styles */
  .ql-editor h1 {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin: 1.5rem 0 1rem 0;
    color: #1a202c;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .ql-editor h2 {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 1.25rem 0 0.75rem 0;
    color: #2d3748;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .ql-editor h3 {
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 1rem 0 0.5rem 0;
    color: #4a5568;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .ql-editor h4 {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 0.875rem 0 0.5rem 0;
    color: #4a5568;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .ql-editor h5 {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.5;
    margin: 0.75rem 0 0.375rem 0;
    color: #718096;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .ql-editor h6 {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
    margin: 0.625rem 0 0.25rem 0;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  /* Heading hover effects */
  .ql-editor h1:hover,
  .ql-editor h2:hover,
  .ql-editor h3:hover,
  .ql-editor h4:hover,
  .ql-editor h5:hover,
  .ql-editor h6:hover {
    color: var(--primary);
    transition: color 0.2s ease;
  }
`;

const QuillEditor = ({
  value,
  onChange,
  placeholder = "Write your blog post content here...",
  readOnly = false
}) => {
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);
  const [isToolbarFixed, setIsToolbarFixed] = useState(false);

  // Smart toolbar positioning - only fixed when in editor section
  useEffect(() => {
    let isPasting = false;
    let isToolbarAction = false;
    let pasteTimeout;
    let toolbarActionTimeout;
    let savedScrollPosition = 0;
    let savedToolbarState = false;

    const handleScroll = () => {
      // Completely ignore scroll during paste operations or toolbar actions
      if (isPasting || isToolbarAction || !quillRef.current || !editorContainerRef.current) return;

      try {
        const editorContainer = editorContainerRef.current;
        const toolbar = editorContainer.querySelector('.ql-toolbar');

        if (!toolbar) return;

        const containerRect = editorContainer.getBoundingClientRect();
        const toolbarHeight = toolbar.offsetHeight || 50;

        // Check if editor is in viewport and toolbar should be fixed
        const isEditorInView = containerRect.top <= 0 && containerRect.bottom > toolbarHeight;

        if (isEditorInView && !isToolbarFixed) {
          toolbar.classList.add('toolbar-fixed');
          setIsToolbarFixed(true);
        } else if (!isEditorInView && isToolbarFixed) {
          toolbar.classList.remove('toolbar-fixed');
          setIsToolbarFixed(false);
        }
      } catch (error) {
        console.error('Error in toolbar positioning:', error);
      }
    };

    // Handle paste operations with complete scroll prevention
    const handlePasteStart = () => {
      isPasting = true;
      clearTimeout(pasteTimeout);

      // Save current state
      savedScrollPosition = window.scrollY;
      savedToolbarState = isToolbarFixed;

      // Prevent any scroll handling for a longer period
      pasteTimeout = setTimeout(() => {
        isPasting = false;

        // Force restore scroll position if it changed
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - savedScrollPosition) > 10) {
          window.scrollTo({
            top: savedScrollPosition,
            behavior: 'instant'
          });
        }

        // Restore toolbar state if needed
        if (savedToolbarState !== isToolbarFixed) {
          const toolbar = editorContainerRef.current?.querySelector('.ql-toolbar');
          if (toolbar) {
            if (savedToolbarState) {
              toolbar.classList.add('toolbar-fixed');
              setIsToolbarFixed(true);
            } else {
              toolbar.classList.remove('toolbar-fixed');
              setIsToolbarFixed(false);
            }
          }
        }
      }, 2000); // Extended to 2 seconds
    };

    // Handle toolbar actions with complete scroll prevention
    const handleToolbarActionStart = () => {
      isToolbarAction = true;
      clearTimeout(toolbarActionTimeout);

      // Save current state
      savedScrollPosition = window.scrollY;
      savedToolbarState = isToolbarFixed;

      // Prevent any scroll handling during toolbar actions
      toolbarActionTimeout = setTimeout(() => {
        isToolbarAction = false;

        // Force restore scroll position if it changed
        const currentScroll = window.scrollY;
        if (Math.abs(currentScroll - savedScrollPosition) > 5) {
          window.scrollTo({
            top: savedScrollPosition,
            behavior: 'instant'
          });
        }

        // Restore toolbar state if needed
        if (savedToolbarState !== isToolbarFixed) {
          const toolbar = editorContainerRef.current?.querySelector('.ql-toolbar');
          if (toolbar) {
            if (savedToolbarState) {
              toolbar.classList.add('toolbar-fixed');
              setIsToolbarFixed(true);
            } else {
              toolbar.classList.remove('toolbar-fixed');
              setIsToolbarFixed(false);
            }
          }
        }
      }, 300);
    };

    // Handle keyboard events
    const handleKeyDown = (event) => {
      // Detect paste operations
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'v')) {
        handlePasteStart();
      }
    };

    // Scroll handler that completely ignores events during paste or toolbar actions
    let ticking = false;
    const throttledScroll = (event) => {
      // Completely block scroll handling during paste or toolbar actions
      if (isPasting || isToolbarAction) {
        // Restore scroll position immediately if it changed during paste or toolbar action
        if (Math.abs(window.scrollY - savedScrollPosition) > 5) {
          window.scrollTo({
            top: savedScrollPosition,
            behavior: 'instant'
          });
        }
        return;
      }

      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add event listeners
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    // Listen for paste events on the editor
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (editor && editor.root) {
        editor.root.addEventListener('paste', handlePasteStart, { capture: true });
      }
    }

    // Listen for toolbar actions
    if (quillRef.current && editorContainerRef.current) {
      const toolbar = editorContainerRef.current.querySelector('.ql-toolbar');
      if (toolbar) {
        // Listen for clicks on toolbar buttons and dropdowns
        const handleToolbarClick = (event) => {
          // Check if the click is on a toolbar button or dropdown
          if (event.target.closest('.ql-toolbar button') || 
              event.target.closest('.ql-toolbar .ql-picker') ||
              event.target.closest('.ql-toolbar .ql-picker-label') ||
              event.target.closest('.ql-toolbar .ql-picker-options')) {
            handleToolbarActionStart();
          }
        };

        // Listen for focus events on toolbar elements (for keyboard navigation)
        const handleToolbarFocus = (event) => {
          if (event.target.closest('.ql-toolbar')) {
            handleToolbarActionStart();
          }
        };

        toolbar.addEventListener('click', handleToolbarClick, { capture: true });
        toolbar.addEventListener('focusin', handleToolbarFocus, { capture: true });
        toolbar.addEventListener('mousedown', handleToolbarClick, { capture: true });

        // Store references for cleanup
        window._toolbarClickHandler = handleToolbarClick;
        window._toolbarFocusHandler = handleToolbarFocus;
      }
    }

    // Initial check
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      clearTimeout(pasteTimeout);
      clearTimeout(toolbarActionTimeout);

      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        if (editor && editor.root) {
          editor.root.removeEventListener('paste', handlePasteStart, { capture: true });
        }
      }

      // Clean up toolbar event listeners
      if (editorContainerRef.current) {
        const toolbar = editorContainerRef.current.querySelector('.ql-toolbar');
        if (toolbar && window._toolbarClickHandler && window._toolbarFocusHandler) {
          toolbar.removeEventListener('click', window._toolbarClickHandler, { capture: true });
          toolbar.removeEventListener('focusin', window._toolbarFocusHandler, { capture: true });
          toolbar.removeEventListener('mousedown', window._toolbarClickHandler, { capture: true });
          delete window._toolbarClickHandler;
          delete window._toolbarFocusHandler;
        }
      }
    };
  }, [isToolbarFixed]);

  // Custom image handler for uploading images
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);

        // Upload to your Django backend
        const response = await fetch(ENDPOINTS.QUILL_UPLOAD, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();

          // Insert the image at cursor position
          quill.insertEmbed(range.index, 'image', data.url);

          // Move cursor after the image
          quill.setSelection(range.index + 1);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    };
  };

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      // Clean up pasted content
      matchVisual: false,
    }
  }), []);

  // Quill formats configuration
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'align',
    'clean'
  ];

  return (
    <EditorContainer ref={editorContainerRef}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </EditorContainer>
  );
};

export default QuillEditor;
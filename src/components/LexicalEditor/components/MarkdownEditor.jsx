import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

const MarkdownContainer = styled.div`
  position: relative;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  color: #333;
  text-align: left;
  min-height: 400px;
  
  &:focus-within {
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const MarkdownTextarea = styled.textarea`
  width: 100%;
  min-height: 400px;
  border: none;
  outline: none;
  padding: 15px 20px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: transparent;
  resize: vertical;
  
  &::placeholder {
    color: #999;
    font-style: italic;
  }
  
  /* Markdown syntax highlighting with CSS */
  &:focus {
    outline: none;
  }
`;

const MarkdownToolbar = styled.div`
  display: flex;
  background: #f8f9fa;
  padding: 8px 12px;
  border-bottom: 1px solid #e1e5e9;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const ToolbarButton = styled.button.attrs({ type: 'button' })`
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  font-size: 12px;
  min-width: 32px;
  height: 32px;
  transition: all 0.2s;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;

  &:hover {
    background: #f5f5f5;
    border-color: #bbb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  right: 0;
  bottom: 0;
  background: #fff;
  border-left: 1px solid #e1e5e9;
  padding: 15px 20px;
  overflow-y: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 1.5em 0 0.5em 0;
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 { font-size: 2.5em; }
  h2 { font-size: 2em; }
  h3 { font-size: 1.5em; }
  h4 { font-size: 1.25em; }
  h5 { font-size: 1.125em; }
  h6 { font-size: 1em; }
  
  p {
    margin: 0.75em 0;
    line-height: 1.6;
  }
  
  blockquote {
    border-left: 4px solid #0066cc;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: #666;
  }
  
  code {
    background: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }
  
  pre {
    background: #f8f8f8;
    border: 1px solid #e1e5e9;
    border-radius: 4px;
    padding: 1em;
    overflow-x: auto;
    margin: 1em 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  ul, ol {
    padding-left: 1.5em;
    margin: 0.75em 0;
  }
  
  li {
    margin: 0.25em 0;
  }
  
  a {
    color: #0066cc;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
`;

const SplitView = styled.div`
  position: relative;
  height: 100%;
  
  ${MarkdownTextarea} {
    width: ${props => props.$showPreview ? '50%' : '100%'};
  }
`;

const ToggleButton = styled(ToolbarButton)`
  background: ${props => props.$active ? '#0066cc' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#333'};
  border-color: ${props => props.$active ? '#0066cc' : '#ddd'};
`;

// Simple markdown to HTML converter (basic implementation)
const markdownToHtml = (markdown) => {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
  
  // Strikethrough
  html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');
  
  // Code
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img alt="$1" src="$2" />');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\+ (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
  
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  
  // Line breaks
  html = html.replace(/\n\n/gim, '</p><p>');
  html = html.replace(/\n/gim, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/gim, '');
  html = html.replace(/<p>(<h[1-6]>)/gim, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<blockquote>)/gim, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<ul>)/gim, '$1');
  html = html.replace(/(<\/ul>)<\/p>/gim, '$1');
  
  return html;
};

const MarkdownEditor = ({
  value = '',
  onChange,
  placeholder = 'Write your markdown here...',
  showToolbar = true,
  showPreview = false,
  readOnly = false,
  className = '',
  style = {}
}) => {
  const [content, setContent] = useState(value);
  const [showPreviewPane, setShowPreviewPane] = useState(showPreview);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  }, [onChange]);

  const insertMarkdown = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + (selectedText || placeholder) + after;
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + (selectedText || placeholder).length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [content, onChange]);

  const toolbarActions = [
    { label: 'H1', action: () => insertMarkdown('# ', '', 'Heading 1') },
    { label: 'H2', action: () => insertMarkdown('## ', '', 'Heading 2') },
    { label: 'H3', action: () => insertMarkdown('### ', '', 'Heading 3') },
    { label: 'B', action: () => insertMarkdown('**', '**', 'bold text') },
    { label: 'I', action: () => insertMarkdown('*', '*', 'italic text') },
    { label: '~~', action: () => insertMarkdown('~~', '~~', 'strikethrough') },
    { label: '`', action: () => insertMarkdown('`', '`', 'code') },
    { label: '```', action: () => insertMarkdown('```\\n', '\\n```', 'code block') },
    { label: '>', action: () => insertMarkdown('> ', '', 'blockquote') },
    { label: '-', action: () => insertMarkdown('- ', '', 'list item') },
    { label: '1.', action: () => insertMarkdown('1. ', '', 'numbered item') },
    { label: '[]', action: () => insertMarkdown('[', '](url)', 'link text') },
    { label: '![]', action: () => insertMarkdown('![', '](image-url)', 'alt text') },
  ];

  return (
    <MarkdownContainer className={className} style={style}>
      {showToolbar && !readOnly && (
        <MarkdownToolbar>
          {toolbarActions.map((action, index) => (
            <ToolbarButton
              key={index}
              onClick={action.action}
              title={`Insert ${action.label}`}
            >
              {action.label}
            </ToolbarButton>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <ToggleButton
              $active={showPreviewPane}
              onClick={() => setShowPreviewPane(!showPreviewPane)}
              title="Toggle Preview"
            >
              👁️ Preview
            </ToggleButton>
          </div>
        </MarkdownToolbar>
      )}
      
      <SplitView $showPreview={showPreviewPane}>
        <MarkdownTextarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
        />
        
        {showPreviewPane && (
          <PreviewContainer
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(content)
            }}
          />
        )}
      </SplitView>
    </MarkdownContainer>
  );
};

export default MarkdownEditor;
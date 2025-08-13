import React, { useState, useCallback, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';

// Node imports - All available nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { HashtagNode } from '@lexical/hashtag';
import { MarkNode } from '@lexical/mark';
// Note: OverflowNode may not be available in current version

// Utility imports
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

// Plugin imports
import ProfessionalToolbarPlugin from './plugins/ProfessionalToolbarPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import DragDropPastePlugin from './plugins/DragDropPastePlugin';
import MentionsPlugin from './plugins/MentionsPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import { ImageNode } from './nodes/ImageNode';
import { MentionNode } from './nodes/MentionNode';
import { EmojiNode } from './nodes/EmojiNode';
import { HorizontalRuleNode } from './nodes/HorizontalRuleNode';
import HorizontalRulePlugin from './plugins/HorizontalRulePlugin';
import ImagePlugin from './plugins/ImagePlugin';

// Additional plugins for comprehensive functionality
import ClipboardPlugin from './plugins/ClipboardPlugin';
import MarkdownPlugin from './plugins/MarkdownPlugin';
import FilePlugin from './plugins/FilePlugin';
import OverflowPlugin from './plugins/OverflowPlugin';
import YjsPlugin from './plugins/YjsPlugin';
import DevToolsPlugin from './plugins/DevToolsPlugin';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import MarkdownEditor from './components/MarkdownEditor';

// Professional styled components
const EditorContainer = styled.div`
  position: relative;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #2d3748;
  text-align: left;
  min-height: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus-within {
    border-color: #0066cc;
    box-shadow: 0 4px 20px rgba(0, 102, 204, 0.15), 0 0 0 3px rgba(0, 102, 204, 0.1);
    transform: translateY(-2px);
  }
  
  &:hover {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  }
`;

const EditorInner = styled.div`
  background: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const EditorInput = styled(ContentEditable)`
  min-height: 450px;
  resize: none;
  font-size: 16px;
  caret-color: #0066cc;
  position: relative;
  tab-size: 2;
  outline: 0;
  padding: 24px 32px;
  flex: 1;
  line-height: 1.7;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2d3748;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  
  &:focus {
    outline: none;
    background: #ffffff;
  }
  
  /* Professional typography styles */
  h1, h2, h3, h4, h5, h6 {
    margin: 2em 0 0.8em 0;
    font-weight: 700;
    line-height: 1.25;
    color: #1a202c;
    letter-spacing: -0.025em;
  }
  
  h1 { 
    font-size: 2.75em; 
    background: linear-gradient(135deg, #0066cc, #004499);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  h2 { 
    font-size: 2.25em; 
    color: #2d3748;
  }
  h3 { 
    font-size: 1.875em; 
    color: #2d3748;
  }
  h4 { 
    font-size: 1.5em; 
    color: #4a5568;
  }
  h5 { 
    font-size: 1.25em; 
    color: #4a5568;
  }
  h6 { 
    font-size: 1.125em; 
    color: #718096;
    font-weight: 600;
  }
  
  p {
    margin: 1.2em 0;
    line-height: 1.8;
    color: #2d3748;
  }
  
  blockquote {
    border-left: 4px solid #0066cc;
    background: linear-gradient(135deg, #f7fafc, #edf2f7);
    padding: 1.5em 2em;
    margin: 2em 0;
    font-style: italic;
    color: #4a5568;
    border-radius: 0 8px 8px 0;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1);
    position: relative;
    
    &::before {
      content: '"';
      font-size: 4em;
      color: #0066cc;
      position: absolute;
      top: -10px;
      left: 10px;
      opacity: 0.3;
      font-family: Georgia, serif;
    }
  }
  
  code {
    background: linear-gradient(135deg, #f7fafc, #edf2f7);
    color: #e53e3e;
    padding: 0.3em 0.6em;
    border-radius: 6px;
    font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
    font-weight: 500;
    border: 1px solid #e2e8f0;
  }
  
  pre {
    background: linear-gradient(135deg, #1a202c, #2d3748);
    color: #f7fafc;
    border-radius: 12px;
    padding: 1.5em 2em;
    overflow-x: auto;
    margin: 2em 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid #4a5568;
    
    code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
      font-size: 0.95em;
    }
  }
  
  ul, ol {
    padding-left: 2em;
    margin: 1.5em 0;
    
    li {
      margin: 0.8em 0;
      line-height: 1.7;
      color: #2d3748;
      
      &::marker {
        color: #0066cc;
        font-weight: 600;
      }
    }
  }
  
  ul {
    li {
      position: relative;
      
      &::before {
        content: '•';
        color: #0066cc;
        font-weight: bold;
        position: absolute;
        left: -1.2em;
        font-size: 1.2em;
      }
    }
  }
  
  a {
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      color: #004499;
      border-bottom-color: #0066cc;
      background: linear-gradient(135deg, rgba(0, 102, 204, 0.05), rgba(0, 68, 153, 0.05));
      padding: 0.1em 0.3em;
      border-radius: 4px;
    }
  }
  
  .editor-hashtag {
    color: #1da1f2;
    font-weight: 600;
    background: linear-gradient(135deg, rgba(29, 161, 242, 0.1), rgba(29, 161, 242, 0.05));
    padding: 0.2em 0.4em;
    border-radius: 6px;
    border: 1px solid rgba(29, 161, 242, 0.2);
  }
  
  .editor-mention {
    color: #0066cc;
    background: linear-gradient(135deg, #e6f2ff, #cce7ff);
    padding: 0.2em 0.6em;
    border-radius: 6px;
    font-weight: 600;
    border: 1px solid rgba(0, 102, 204, 0.2);
    box-shadow: 0 2px 4px rgba(0, 102, 204, 0.1);
  }
  
  .editor-emoji {
    font-size: 1.3em;
    margin: 0 0.1em;
    display: inline-block;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.2);
    }
  }
  
  .editor-mark {
    background: linear-gradient(135deg, #fef5e7, #fed7aa);
    color: #c05621;
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-weight: 500;
    border: 1px solid #f6ad55;
  }
  
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    margin: 2em 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    
    th, td {
      padding: 1em 1.5em;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      
      &:last-child {
        border-right: none;
      }
    }
    
    th {
      background: linear-gradient(135deg, #0066cc, #004499);
      color: #ffffff;
      font-weight: 600;
      font-size: 0.95em;
      letter-spacing: 0.025em;
      text-transform: uppercase;
      
      &:first-child {
        border-top-left-radius: 12px;
      }
      
      &:last-child {
        border-top-right-radius: 12px;
      }
    }
    
    tbody tr {
      transition: all 0.2s;
      
      &:hover {
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
      }
      
      &:nth-child(even) {
        background: rgba(0, 102, 204, 0.02);
      }
      
      &:last-child td {
        border-bottom: none;
        
        &:first-child {
          border-bottom-left-radius: 12px;
        }
        
        &:last-child {
          border-bottom-right-radius: 12px;
        }
      }
    }
  }
  
  /* Horizontal rule styling */
  hr {
    border: none;
    height: 3px;
    background: linear-gradient(135deg, #0066cc, #004499);
    margin: 3em 0;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
  }
  
  /* Selection styling */
  ::selection {
    background: rgba(0, 102, 204, 0.2);
    color: #1a202c;
  }
  
  /* Focus styles for better accessibility */
  *:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
`;

const Placeholder = styled.div`
  color: #a0aec0;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 24px;
  left: 32px;
  font-size: 16px;
  user-select: none;
  display: inline-block;
  pointer-events: none;
  font-style: italic;
  font-weight: 400;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-top: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  font-size: 13px;
  color: #718096;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  font-weight: 500;
`;

const WordCount = styled.div`
  display: flex;
  gap: 16px;
`;

const CharacterCount = styled.span`
  color: ${props => props.$overLimit ? '#dc3545' : '#666'};
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 8px;
`;

const ModeButton = styled.button.attrs({ type: 'button' })`
  background: ${props => props.$active ? 'linear-gradient(135deg, #0066cc, #004499)' : 'transparent'};
  color: ${props => props.$active ? '#ffffff' : '#718096'};
  border: 1px solid ${props => props.$active ? '#0066cc' : '#e2e8f0'};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #0056b3, #003d7a)' : 'rgba(0, 102, 204, 0.08)'};
    border-color: ${props => props.$active ? '#0056b3' : '#0066cc'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
  }
`;

const DebugPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000;
  color: #0f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  z-index: 1000;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
  }
`;

// Comprehensive theme with all node styles
const comprehensiveTheme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
    h6: 'editor-heading-h6',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
    checklist: 'editor-checklist',
  },
  image: 'editor-image',
  link: 'editor-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    overflowed: 'editor-text-overflowed',
    hashtag: 'editor-text-hashtag',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    underlineStrikethrough: 'editor-text-underlineStrikethrough',
    code: 'editor-text-code',
    highlight: 'editor-text-highlight',
    subscript: 'editor-text-subscript',
    superscript: 'editor-text-superscript',
  },
  code: 'editor-code',
  codeHighlight: {
    atrule: 'editor-tokenAttr',
    attr: 'editor-tokenAttr',
    boolean: 'editor-tokenProperty',
    builtin: 'editor-tokenSelector',
    cdata: 'editor-tokenComment',
    char: 'editor-tokenSelector',
    class: 'editor-tokenFunction',
    'class-name': 'editor-tokenFunction',
    comment: 'editor-tokenComment',
    constant: 'editor-tokenProperty',
    deleted: 'editor-tokenProperty',
    doctype: 'editor-tokenComment',
    entity: 'editor-tokenOperator',
    function: 'editor-tokenFunction',
    important: 'editor-tokenVariable',
    inserted: 'editor-tokenSelector',
    keyword: 'editor-tokenAttr',
    namespace: 'editor-tokenVariable',
    number: 'editor-tokenProperty',
    operator: 'editor-tokenOperator',
    prolog: 'editor-tokenComment',
    property: 'editor-tokenProperty',
    punctuation: 'editor-tokenPunctuation',
    regex: 'editor-tokenVariable',
    selector: 'editor-tokenSelector',
    string: 'editor-tokenSelector',
    symbol: 'editor-tokenProperty',
    tag: 'editor-tokenProperty',
    url: 'editor-tokenOperator',
    variable: 'editor-tokenVariable',
  },
  table: 'editor-table',
  tableCell: 'editor-tableCell',
  tableCellHeader: 'editor-tableCellHeader',
  hashtag: 'editor-hashtag',
  mention: 'editor-mention',
  emoji: 'editor-emoji',
  mark: 'editor-mark',
  overflow: 'editor-overflow',
};

// Import markdown transformers
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  CODE,
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  LINK,
  INLINE_CODE,
} from '@lexical/markdown';

// Comprehensive markdown transformers
const MARKDOWN_TRANSFORMERS = [
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  CODE,
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  LINK,
  INLINE_CODE,
];

// Main Comprehensive Rich Text Editor Component
const ComprehensiveRichTextEditor = ({
  initialValue = '',
  onChange,
  onImageUpload,
  placeholder = 'Start writing...',
  autoFocus = false,
  readOnly = false,
  className = '',
  style = {},
  maxLength,
  showToolbar = true,
  showWordCount = true,
  showDebugView = false,
  enableMarkdown = true,
  enableImages = true,
  enableTables = true,
  enableCodeHighlight = true,
  enableHashtags = true,
  enableMentions = true,
  enableEmojis = true,
  enableCollaboration = false,
  enableDevTools = false,
  mode = 'rich', // 'rich', 'markdown', 'plain'
  onError
}) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [debugViewVisible, setDebugViewVisible] = useState(showDebugView);
  const [editorState, setEditorState] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [markdownContent, setMarkdownContent] = useState('');
  const editorStateRef = useRef(null);

  const onRef = useCallback((floatingAnchorElem) => {
    if (floatingAnchorElem !== null) {
      setFloatingAnchorElem(floatingAnchorElem);
    }
  }, []);

  // Handle editor changes
  const handleChange = useCallback((editorState, editor) => {
    editorStateRef.current = editorState;
    setEditorState(editorState);

    editorState.read(() => {
      const root = $getRoot();
      let content = '';

      // Generate content based on current mode
      if (currentMode === 'markdown') {
        // For now, return plain text - full markdown export requires additional setup
        content = root.getTextContent();
      } else if (currentMode === 'plain') {
        content = root.getTextContent();
      } else {
        content = $generateHtmlFromNodes(editor, null);
      }

      const textContent = root.getTextContent();

      // Update word and character counts
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(textContent.length);

      // Call onChange callback
      if (onChange) {
        onChange(content, {
          textContent,
          wordCount: words.length,
          charCount: textContent.length,
          isEmpty: root.isEmpty(),
          editorState: editorState,
          mode: currentMode
        });
      }
    });
  }, [onChange, currentMode]);

  // Handle errors
  const handleError = useCallback((error) => {
    console.error('Comprehensive Lexical Editor Error:', error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Initialize editor with content based on mode
  const initializeEditor = useCallback(() => {
    // Editor initialization is handled by the initialConfig
    // This function is kept for potential future use
  }, []);

  // Handle markdown content changes
  const handleMarkdownChange = useCallback((content) => {
    setMarkdownContent(content);
    if (onChange) {
      onChange(content, {
        textContent: content,
        wordCount: content.trim().split(/\s+/).filter(word => word.length > 0).length,
        charCount: content.length,
        isEmpty: !content.trim(),
        mode: 'markdown'
      });
    }
  }, [onChange]);

  // Handle mode changes
  const handleModeChange = useCallback((newMode) => {
    if (newMode === 'markdown' && currentMode !== 'markdown') {
      // Convert current content to markdown when switching to markdown mode
      if (editorStateRef.current) {
        editorStateRef.current.read(() => {
          const root = $getRoot();
          const textContent = root.getTextContent();
          setMarkdownContent(textContent);
        });
      }
    }
    setCurrentMode(newMode);
  }, [currentMode]);

  // Editor configuration with all nodes
  const initialConfig = {
    namespace: 'ComprehensiveRichTextEditor',
    theme: comprehensiveTheme,
    onError: handleError,
    editorState: initialValue ? undefined : null,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      HashtagNode,
      MarkNode,
      HorizontalRuleNode,
      ...(enableImages ? [ImageNode] : []),
      ...(enableMentions ? [MentionNode] : []),
      ...(enableEmojis ? [EmojiNode] : []),
    ],
    editable: !readOnly,
  };

  // Render markdown editor when in markdown mode
  if (currentMode === 'markdown') {
    return (
      <div className={className} style={style}>
        <MarkdownEditor
          value={markdownContent}
          onChange={handleMarkdownChange}
          placeholder={placeholder}
          showToolbar={showToolbar}
          showPreview={true}
          readOnly={readOnly}
        />

        {(showWordCount || showDebugView) && (
          <StatusBar>
            <div>
              {showWordCount && (
                <WordCount>
                  <span>{markdownContent.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
                  <CharacterCount $overLimit={maxLength && markdownContent.length > maxLength}>
                    {markdownContent.length} characters
                    {maxLength && ` / ${maxLength}`}
                  </CharacterCount>
                </WordCount>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ModeToggle>
                <ModeButton
                  type="button"
                  $active={currentMode === 'rich'}
                  onClick={() => handleModeChange('rich')}
                >
                  Rich
                </ModeButton>
                <ModeButton
                  type="button"
                  $active={currentMode === 'markdown'}
                  onClick={() => handleModeChange('markdown')}
                >
                  Markdown
                </ModeButton>
                <ModeButton
                  type="button"
                  $active={currentMode === 'plain'}
                  onClick={() => handleModeChange('plain')}
                >
                  Plain
                </ModeButton>
              </ModeToggle>
            </div>
          </StatusBar>
        )}
      </div>
    );
  }

  return (
    <EditorContainer className={className} style={style}>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorInner>
          {showToolbar && !readOnly && (
            <ProfessionalToolbarPlugin
              setIsLinkEditMode={setIsLinkEditMode}
              enableImages={enableImages}
              enableTables={enableTables}
              enableHashtags={enableHashtags}
              enableMentions={enableMentions}
              enableEmojis={enableEmojis}
              onImageUpload={onImageUpload}
            />
          )}

          <div className="editor-container" ref={onRef} style={{ position: 'relative', flex: 1 }}>
            {currentMode === 'plain' ? (
              <PlainTextPlugin
                contentEditable={<EditorInput />}
                placeholder={<Placeholder>{placeholder}</Placeholder>}
                ErrorBoundary={LexicalErrorBoundary}
              />
            ) : (
              <RichTextPlugin
                contentEditable={<EditorInput />}
                placeholder={<Placeholder>{placeholder}</Placeholder>}
                ErrorBoundary={LexicalErrorBoundary}
              />
            )}

            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />

            {currentMode !== 'plain' && (
              <>
                <ListPlugin />
                <LinkPlugin />
                <CheckListPlugin />

                {enableTables && <TablePlugin />}
                {enableCodeHighlight && <CodeHighlightPlugin />}
                {enableHashtags && <HashtagPlugin />}
                {enableMentions && <MentionsPlugin />}
                {enableEmojis && <EmojiPickerPlugin />}
                {enableMarkdown && <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />}

                <TabIndentationPlugin />
                <AutoLinkPlugin />
                <DragDropPastePlugin />
                <HorizontalRulePlugin />
                {enableImages && <ImagePlugin onImageUpload={onImageUpload} />}
                <ClipboardPlugin />
                <MarkdownPlugin />
                <FilePlugin />
                <OverflowPlugin />

                {enableCollaboration && <YjsPlugin />}
                {enableDevTools && <DevToolsPlugin />}
              </>
            )}

            {autoFocus && <AutoFocusPlugin />}

            {floatingAnchorElem && !readOnly && currentMode !== 'plain' && (
              <>
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                />
              </>
            )}

            {debugViewVisible && (
              <DebugPanel>
                <pre>
                  {editorState ? JSON.stringify(editorState.toJSON(), null, 2) : 'No editor state'}
                </pre>
              </DebugPanel>
            )}
          </div>

          {(showWordCount || showDebugView) && (
            <StatusBar>
              <div>
                {showWordCount && (
                  <WordCount>
                    <span>{wordCount} words</span>
                    <CharacterCount $overLimit={maxLength && charCount > maxLength}>
                      {charCount} characters
                      {maxLength && ` / ${maxLength}`}
                    </CharacterCount>
                  </WordCount>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ModeToggle>
                  <ModeButton
                    type="button"
                    $active={currentMode === 'rich'}
                    onClick={() => handleModeChange('rich')}
                  >
                    Rich
                  </ModeButton>
                  <ModeButton
                    type="button"
                    $active={currentMode === 'markdown'}
                    onClick={() => handleModeChange('markdown')}
                  >
                    Markdown
                  </ModeButton>
                  <ModeButton
                    type="button"
                    $active={currentMode === 'plain'}
                    onClick={() => handleModeChange('plain')}
                  >
                    Plain
                  </ModeButton>
                </ModeToggle>

                {showDebugView && (
                  <button
                    type="button"
                    onClick={() => setDebugViewVisible(!debugViewVisible)}
                    style={{
                      background: debugViewVisible ? '#333' : 'transparent',
                      color: debugViewVisible ? '#fff' : '#666',
                      border: '1px solid #ddd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    {debugViewVisible ? 'Hide Debug' : 'Show Debug'}
                  </button>
                )}
              </div>
            </StatusBar>
          )}
        </EditorInner>
      </LexicalComposer>
    </EditorContainer>
  );
};

ComprehensiveRichTextEditor.propTypes = {
  initialValue: PropTypes.string,
  onChange: PropTypes.func,
  onImageUpload: PropTypes.func,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  maxLength: PropTypes.number,
  showToolbar: PropTypes.bool,
  showWordCount: PropTypes.bool,
  showDebugView: PropTypes.bool,
  enableMarkdown: PropTypes.bool,
  enableImages: PropTypes.bool,
  enableTables: PropTypes.bool,
  enableCodeHighlight: PropTypes.bool,
  enableHashtags: PropTypes.bool,
  enableMentions: PropTypes.bool,
  enableEmojis: PropTypes.bool,
  enableCollaboration: PropTypes.bool,
  enableDevTools: PropTypes.bool,
  mode: PropTypes.oneOf(['rich', 'markdown', 'plain']),
  onError: PropTypes.func,
};

export default ComprehensiveRichTextEditor;
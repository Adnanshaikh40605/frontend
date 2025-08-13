import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';

// Node imports
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { HashtagNode } from '@lexical/hashtag';
import { MarkNode } from '@lexical/mark';

// Utility imports
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, $createParagraphNode, $createTextNode } from 'lexical';

// Plugin imports
import AdvancedToolbarPlugin from './plugins/AdvancedToolbarPlugin';
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

import styled from 'styled-components';
import PropTypes from 'prop-types';

// Styled components for the advanced editor
const EditorContainer = styled.div`
  position: relative;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
  text-align: left;
  min-height: 400px;
  
  &:focus-within {
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const EditorInner = styled.div`
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const EditorInput = styled(ContentEditable)`
  min-height: 400px;
  resize: none;
  font-size: 15px;
  caret-color: rgb(5, 5, 5);
  position: relative;
  tab-size: 1;
  outline: 0;
  padding: 15px 20px;
  caret-color: #444;
  flex: 1;
  
  &:focus {
    outline: none;
  }
`;

const Placeholder = styled.div`
  color: #999;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 15px;
  left: 20px;
  font-size: 15px;
  user-select: none;
  display: inline-block;
  pointer-events: none;
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  border-top: 1px solid #e1e5e9;
  background: #f8f9fa;
  font-size: 12px;
  color: #666;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

const WordCount = styled.div`
  display: flex;
  gap: 16px;
`;

const CharacterCount = styled.span`
  color: ${props => props.$overLimit ? '#dc3545' : '#666'};
`;

const DebugPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000;
  color: #0f0;
  font-family: 'Courier New', monospace;
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

const DebugToggle = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #333;
  color: #fff;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  z-index: 1001;
  
  &:hover {
    background: #555;
  }
`;

// Advanced editor theme with comprehensive styling
const advancedTheme = {
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
};

// Error boundary component
function LexicalErrorBoundaryComponent({ onError }) {
  return (
    <div style={{ color: '#cc0000', padding: '10px', background: '#ffe6e6', borderRadius: '4px', margin: '10px 0' }}>
      <h3>Something went wrong with the editor</h3>
      <p>Please refresh the page or contact support if the problem persists.</p>
    </div>
  );
}

// Main Advanced Lexical Editor Component
const AdvancedLexicalEditor = ({
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
  onError,
  ...props
}) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [debugViewVisible, setDebugViewVisible] = useState(showDebugView);
  const [editorState, setEditorState] = useState(null);
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
      const htmlString = $generateHtmlFromNodes(editor, null);
      const textContent = root.getTextContent();
      
      // Update word and character counts
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(textContent.length);
      
      // Call onChange callback with HTML content
      if (onChange) {
        onChange(htmlString, {
          textContent,
          wordCount: words.length,
          charCount: textContent.length,
          isEmpty: root.isEmpty(),
          editorState: editorState
        });
      }
    });
  }, [onChange]);

  // Handle errors
  const handleError = useCallback((error) => {
    console.error('Advanced Lexical Editor Error:', error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Initialize editor with HTML content
  const initializeEditor = useCallback((editor) => {
    if (initialValue && typeof initialValue === 'string') {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialValue, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        if (nodes.length > 0) {
          root.append(...nodes);
        }
      });
    }
  }, [initialValue]);

  // Editor configuration with all advanced nodes
  const initialConfig = {
    namespace: 'AdvancedLexicalEditor',
    theme: advancedTheme,
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

  return (
    <EditorContainer className={className} style={style}>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorInner>
          {showToolbar && !readOnly && (
            <AdvancedToolbarPlugin 
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
            <RichTextPlugin
              contentEditable={<EditorInput />}
              placeholder={<Placeholder>{placeholder}</Placeholder>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            
            <OnChangePlugin onChange={handleChange} />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <CheckListPlugin />
            
            {enableTables && <TablePlugin />}
            {enableCodeHighlight && <CodeHighlightPlugin />}
            {enableHashtags && <HashtagPlugin />}
            {enableMentions && <MentionsPlugin />}
            {enableEmojis && <EmojiPickerPlugin />}
            
            <TabIndentationPlugin />
            <AutoLinkPlugin />
            <DragDropPastePlugin />
            <HorizontalRulePlugin />
            
            {autoFocus && <AutoFocusPlugin />}
            
            {floatingAnchorElem && !readOnly && (
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
              {showWordCount && (
                <WordCount>
                  <span>{wordCount} words</span>
                  <CharacterCount $overLimit={maxLength && charCount > maxLength}>
                    {charCount} characters
                    {maxLength && ` / ${maxLength}`}
                  </CharacterCount>
                </WordCount>
              )}
              
              {showDebugView && (
                <DebugToggle
                  type="button"
                  onClick={() => setDebugViewVisible(!debugViewVisible)}
                >
                  {debugViewVisible ? 'Hide Debug' : 'Show Debug'}
                </DebugToggle>
              )}
            </StatusBar>
          )}
        </EditorInner>
      </LexicalComposer>
    </EditorContainer>
  );
};

AdvancedLexicalEditor.propTypes = {
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
  onError: PropTypes.func,
};

export default AdvancedLexicalEditor;
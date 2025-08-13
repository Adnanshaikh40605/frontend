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

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, $createParagraphNode, $createTextNode } from 'lexical';

import ToolbarPlugin from './plugins/ToolbarPlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import { ImageNode } from './nodes/ImageNode';

import styled from 'styled-components';
import PropTypes from 'prop-types';

// Styled components for the editor
const EditorContainer = styled.div`
  position: relative;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
  text-align: left;
  
  &:focus-within {
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
`;

const EditorInner = styled.div`
  background: #fff;
  position: relative;
`;

const EditorInput = styled(ContentEditable)`
  min-height: 300px;
  resize: none;
  font-size: 15px;
  caret-color: rgb(5, 5, 5);
  position: relative;
  tab-size: 1;
  outline: 0;
  padding: 15px 20px;
  caret-color: #444;
  
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

const ErrorBoundaryWrapper = styled.div`
  color: #cc0000;
  padding: 10px;
  background: #ffe6e6;
  border-radius: 4px;
  margin: 10px 0;
`;

// Editor theme configuration
const theme = {
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
};

// Error boundary component
function LexicalErrorBoundaryComponent({ onError }) {
  return (
    <ErrorBoundaryWrapper>
      <h3>Something went wrong with the editor</h3>
      <p>Please refresh the page or contact support if the problem persists.</p>
    </ErrorBoundaryWrapper>
  );
}

// Main Lexical Editor Component
const LexicalEditor = ({
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
  enableMarkdown = true,
  enableImages = true,
  enableTables = true,
  enableCodeHighlight = true,
  onError,
  ...props
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const editorStateRef = useRef(null);

  // Handle editor changes
  const handleChange = useCallback((editorState, editor) => {
    editorStateRef.current = editorState;
    
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
          isEmpty: root.isEmpty()
        });
      }
    });
  }, [onChange]);

  // Handle errors
  const handleError = useCallback((error) => {
    console.error('Lexical Editor Error:', error);
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

  // Editor configuration
  const initialConfig = {
    namespace: 'LexicalEditor',
    theme,
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
      ...(enableImages ? [ImageNode] : []),
    ],
    editable: !readOnly,
  };

  return (
    <EditorContainer className={className} style={style}>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorInner>
          {showToolbar && !readOnly && (
            <ToolbarPlugin 
              enableImages={enableImages}
              enableTables={enableTables}
              onImageUpload={onImageUpload}
            />
          )}
          
          <div className="editor-container">
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
            
            <TabIndentationPlugin />
            <AutoLinkPlugin />
          </div>
          
          {showWordCount && (
            <div style={{
              padding: '8px 20px',
              borderTop: '1px solid #e1e5e9',
              fontSize: '12px',
              color: '#666',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                {wordCount} words, {charCount} characters
              </span>
              {maxLength && (
                <span style={{ color: charCount > maxLength ? '#cc0000' : '#666' }}>
                  {charCount}/{maxLength}
                </span>
              )}
            </div>
          )}
        </EditorInner>
      </LexicalComposer>
    </EditorContainer>
  );
};

LexicalEditor.propTypes = {
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
  enableMarkdown: PropTypes.bool,
  enableImages: PropTypes.bool,
  enableTables: PropTypes.bool,
  enableCodeHighlight: PropTypes.bool,
  onError: PropTypes.func,
};

export default LexicalEditor;
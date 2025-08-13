import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { $createMentionNode } from '../nodes/MentionNode';

const MentionMenu = styled.div`
  position: absolute;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  min-width: 200px;
`;

const MentionItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover,
  &.selected {
    background-color: #f0f2f5;
  }
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(45deg, #1877f2, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 500;
  font-size: 14px;
`;

const UserHandle = styled.span`
  color: #65676b;
  font-size: 12px;
`;

// Mock users data - in a real app, this would come from an API
const MOCK_USERS = [
  { id: 1, name: 'John Doe', handle: 'johndoe', avatar: 'JD' },
  { id: 2, name: 'Jane Smith', handle: 'janesmith', avatar: 'JS' },
  { id: 3, name: 'Bob Johnson', handle: 'bobjohnson', avatar: 'BJ' },
  { id: 4, name: 'Alice Brown', handle: 'alicebrown', avatar: 'AB' },
  { id: 5, name: 'Charlie Wilson', handle: 'charliewilson', avatar: 'CW' },
  { id: 6, name: 'Diana Davis', handle: 'dianadavis', avatar: 'DD' },
  { id: 7, name: 'Eva Martinez', handle: 'evamartinez', avatar: 'EM' },
  { id: 8, name: 'Frank Miller', handle: 'frankmiller', avatar: 'FM' },
];

function MentionTypeahead({ onSelectOption, onClose, options, selectedIndex }) {
  return (
    <MentionMenu>
      {options.map((option, index) => (
        <MentionItem
          key={option.id}
          className={index === selectedIndex ? 'selected' : ''}
          onClick={() => onSelectOption(option)}
        >
          <Avatar>{option.avatar}</Avatar>
          <UserInfo>
            <UserName>{option.name}</UserName>
            <UserHandle>@{option.handle}</UserHandle>
          </UserInfo>
        </MentionItem>
      ))}
    </MentionMenu>
  );
}

export default function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionMenuPosition, setMentionMenuPosition] = useState(null);

  const checkForMentionMatch = useCallback((text) => {
    const mentionMatch = text.match(/@(\w*)$/);
    return mentionMatch ? mentionMatch[1] : null;
  }, []);

  const updateMentionResults = useCallback((query) => {
    if (query === null) {
      setResults([]);
      return;
    }

    const filteredResults = MOCK_USERS.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.handle.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    setResults(filteredResults);
    setSelectedIndex(0);
  }, []);

  const selectMentionOption = useCallback((selectedOption) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();
      const anchorOffset = anchor.offset;

      // Find the @ symbol position
      const textContent = anchorNode.getTextContent();
      const mentionStart = textContent.lastIndexOf('@', anchorOffset - 1);

      if (mentionStart !== -1) {
        // Remove the @ and query text
        const mentionNode = $createMentionNode(selectedOption.handle);
        
        // Replace the text from @ to current position with the mention node
        selection.setTextNodeRange(anchorNode, mentionStart, anchorNode, anchorOffset);
        selection.insertNodes([mentionNode]);
        
        // Add a space after the mention
        selection.insertText(' ');
      }
    });

    setQueryString(null);
    setMentionMenuPosition(null);
  }, [editor]);

  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          setQueryString(null);
          setMentionMenuPosition(null);
          return;
        }

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        const anchorOffset = anchor.offset;

        // Check if we're in a text node
        if (anchorNode.getType() !== 'text') {
          setQueryString(null);
          setMentionMenuPosition(null);
          return;
        }

        const textContent = anchorNode.getTextContent();
        const textUpToCursor = textContent.slice(0, anchorOffset);
        const match = checkForMentionMatch(textUpToCursor);

        if (match !== null) {
          setQueryString(match);
          
          // Calculate position for the mention menu
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setMentionMenuPosition({
              top: rect.bottom + window.scrollY + 5,
              left: rect.left + window.scrollX,
            });
          }
        } else {
          setQueryString(null);
          setMentionMenuPosition(null);
        }
      });
    });

    return updateListener;
  }, [editor, checkForMentionMatch]);

  useEffect(() => {
    updateMentionResults(queryString);
  }, [queryString, updateMentionResults]);

  useEffect(() => {
    if (queryString === null) {
      return;
    }

    const handleKeyDown = (event) => {
      if (results.length === 0) {
        return false;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          return true;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          return true;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          selectMentionOption(results[selectedIndex]);
          return true;
        case 'Escape':
          event.preventDefault();
          setQueryString(null);
          setMentionMenuPosition(null);
          return true;
        default:
          return false;
      }
    };

    const removeKeyDownListener = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      () => handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} }),
      COMMAND_PRIORITY_LOW,
    );

    const removeKeyUpListener = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      () => handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} }),
      COMMAND_PRIORITY_LOW,
    );

    const removeEnterListener = editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => handleKeyDown({ key: 'Enter', preventDefault: () => {} }),
      COMMAND_PRIORITY_LOW,
    );

    const removeTabListener = editor.registerCommand(
      KEY_TAB_COMMAND,
      () => handleKeyDown({ key: 'Tab', preventDefault: () => {} }),
      COMMAND_PRIORITY_LOW,
    );

    const removeEscapeListener = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => handleKeyDown({ key: 'Escape', preventDefault: () => {} }),
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeKeyDownListener();
      removeKeyUpListener();
      removeEnterListener();
      removeTabListener();
      removeEscapeListener();
    };
  }, [editor, results, selectedIndex, selectMentionOption, queryString]);

  if (queryString === null || mentionMenuPosition === null || results.length === 0) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: mentionMenuPosition.top,
        left: mentionMenuPosition.left,
      }}
    >
      <MentionTypeahead
        options={results}
        selectedIndex={selectedIndex}
        onSelectOption={selectMentionOption}
        onClose={() => {
          setQueryString(null);
          setMentionMenuPosition(null);
        }}
      />
    </div>,
    document.body,
  );
}
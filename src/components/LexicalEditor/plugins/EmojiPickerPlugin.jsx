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
import { $createEmojiNode } from '../nodes/EmojiNode';

const EmojiMenu = styled.div`
  position: absolute;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  min-width: 250px;
  padding: 8px;
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
`;

const EmojiItem = styled.div`
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  text-align: center;
  font-size: 20px;
  transition: background-color 0.1s;
  
  &:hover,
  &.selected {
    background-color: #f0f2f5;
  }
`;

const EmojiSearch = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #1877f2;
  }
`;

// Common emojis with their names
const EMOJI_LIST = [
  { emoji: '😀', name: 'grinning face' },
  { emoji: '😃', name: 'grinning face with big eyes' },
  { emoji: '😄', name: 'grinning face with smiling eyes' },
  { emoji: '😁', name: 'beaming face with smiling eyes' },
  { emoji: '😆', name: 'grinning squinting face' },
  { emoji: '😅', name: 'grinning face with sweat' },
  { emoji: '🤣', name: 'rolling on the floor laughing' },
  { emoji: '😂', name: 'face with tears of joy' },
  { emoji: '🙂', name: 'slightly smiling face' },
  { emoji: '🙃', name: 'upside down face' },
  { emoji: '😉', name: 'winking face' },
  { emoji: '😊', name: 'smiling face with smiling eyes' },
  { emoji: '😇', name: 'smiling face with halo' },
  { emoji: '🥰', name: 'smiling face with hearts' },
  { emoji: '😍', name: 'smiling face with heart eyes' },
  { emoji: '🤩', name: 'star struck' },
  { emoji: '😘', name: 'face blowing a kiss' },
  { emoji: '😗', name: 'kissing face' },
  { emoji: '😚', name: 'kissing face with closed eyes' },
  { emoji: '😙', name: 'kissing face with smiling eyes' },
  { emoji: '😋', name: 'face savoring food' },
  { emoji: '😛', name: 'face with tongue' },
  { emoji: '😜', name: 'winking face with tongue' },
  { emoji: '🤪', name: 'zany face' },
  { emoji: '😝', name: 'squinting face with tongue' },
  { emoji: '🤑', name: 'money mouth face' },
  { emoji: '🤗', name: 'hugging face' },
  { emoji: '🤭', name: 'face with hand over mouth' },
  { emoji: '🤫', name: 'shushing face' },
  { emoji: '🤔', name: 'thinking face' },
  { emoji: '🤐', name: 'zipper mouth face' },
  { emoji: '🤨', name: 'face with raised eyebrow' },
  { emoji: '😐', name: 'neutral face' },
  { emoji: '😑', name: 'expressionless face' },
  { emoji: '😶', name: 'face without mouth' },
  { emoji: '😏', name: 'smirking face' },
  { emoji: '😒', name: 'unamused face' },
  { emoji: '🙄', name: 'face with rolling eyes' },
  { emoji: '😬', name: 'grimacing face' },
  { emoji: '🤥', name: 'lying face' },
  { emoji: '😔', name: 'pensive face' },
  { emoji: '😪', name: 'sleepy face' },
  { emoji: '🤤', name: 'drooling face' },
  { emoji: '😴', name: 'sleeping face' },
  { emoji: '😷', name: 'face with medical mask' },
  { emoji: '🤒', name: 'face with thermometer' },
  { emoji: '🤕', name: 'face with head bandage' },
  { emoji: '🤢', name: 'nauseated face' },
  { emoji: '🤮', name: 'face vomiting' },
  { emoji: '🤧', name: 'sneezing face' },
  { emoji: '🥵', name: 'hot face' },
  { emoji: '🥶', name: 'cold face' },
  { emoji: '🥴', name: 'woozy face' },
  { emoji: '😵', name: 'dizzy face' },
  { emoji: '🤯', name: 'exploding head' },
  { emoji: '🤠', name: 'cowboy hat face' },
  { emoji: '🥳', name: 'partying face' },
  { emoji: '😎', name: 'smiling face with sunglasses' },
  { emoji: '🤓', name: 'nerd face' },
  { emoji: '🧐', name: 'face with monocle' },
  { emoji: '😕', name: 'confused face' },
  { emoji: '😟', name: 'worried face' },
  { emoji: '🙁', name: 'slightly frowning face' },
  { emoji: '☹️', name: 'frowning face' },
  { emoji: '😮', name: 'face with open mouth' },
  { emoji: '😯', name: 'hushed face' },
  { emoji: '😲', name: 'astonished face' },
  { emoji: '😳', name: 'flushed face' },
  { emoji: '🥺', name: 'pleading face' },
  { emoji: '😦', name: 'frowning face with open mouth' },
  { emoji: '😧', name: 'anguished face' },
  { emoji: '😨', name: 'fearful face' },
  { emoji: '😰', name: 'anxious face with sweat' },
  { emoji: '😥', name: 'sad but relieved face' },
  { emoji: '😢', name: 'crying face' },
  { emoji: '😭', name: 'loudly crying face' },
  { emoji: '😱', name: 'face screaming in fear' },
  { emoji: '😖', name: 'confounded face' },
  { emoji: '😣', name: 'persevering face' },
  { emoji: '😞', name: 'disappointed face' },
  { emoji: '😓', name: 'downcast face with sweat' },
  { emoji: '😩', name: 'weary face' },
  { emoji: '😫', name: 'tired face' },
  { emoji: '🥱', name: 'yawning face' },
  { emoji: '😤', name: 'face with steam from nose' },
  { emoji: '😡', name: 'pouting face' },
  { emoji: '😠', name: 'angry face' },
  { emoji: '🤬', name: 'face with symbols on mouth' },
  { emoji: '😈', name: 'smiling face with horns' },
  { emoji: '👿', name: 'angry face with horns' },
  { emoji: '💀', name: 'skull' },
  { emoji: '☠️', name: 'skull and crossbones' },
  { emoji: '💩', name: 'pile of poo' },
  { emoji: '🤡', name: 'clown face' },
  { emoji: '👹', name: 'ogre' },
  { emoji: '👺', name: 'goblin' },
  { emoji: '👻', name: 'ghost' },
  { emoji: '👽', name: 'alien' },
  { emoji: '👾', name: 'alien monster' },
  { emoji: '🤖', name: 'robot' },
  { emoji: '😺', name: 'grinning cat' },
  { emoji: '😸', name: 'grinning cat with smiling eyes' },
  { emoji: '😹', name: 'cat with tears of joy' },
  { emoji: '😻', name: 'smiling cat with heart eyes' },
  { emoji: '😼', name: 'cat with wry smile' },
  { emoji: '😽', name: 'kissing cat' },
  { emoji: '🙀', name: 'weary cat' },
  { emoji: '😿', name: 'crying cat' },
  { emoji: '😾', name: 'pouting cat' },
  { emoji: '❤️', name: 'red heart' },
  { emoji: '🧡', name: 'orange heart' },
  { emoji: '💛', name: 'yellow heart' },
  { emoji: '💚', name: 'green heart' },
  { emoji: '💙', name: 'blue heart' },
  { emoji: '💜', name: 'purple heart' },
  { emoji: '🖤', name: 'black heart' },
  { emoji: '🤍', name: 'white heart' },
  { emoji: '🤎', name: 'brown heart' },
  { emoji: '💔', name: 'broken heart' },
  { emoji: '❣️', name: 'heart exclamation' },
  { emoji: '💕', name: 'two hearts' },
  { emoji: '💞', name: 'revolving hearts' },
  { emoji: '💓', name: 'beating heart' },
  { emoji: '💗', name: 'growing heart' },
  { emoji: '💖', name: 'sparkling heart' },
  { emoji: '💘', name: 'heart with arrow' },
  { emoji: '💝', name: 'heart with ribbon' },
  { emoji: '💟', name: 'heart decoration' },
  { emoji: '👍', name: 'thumbs up' },
  { emoji: '👎', name: 'thumbs down' },
  { emoji: '👌', name: 'OK hand' },
  { emoji: '✌️', name: 'victory hand' },
  { emoji: '🤞', name: 'crossed fingers' },
  { emoji: '🤟', name: 'love you gesture' },
  { emoji: '🤘', name: 'sign of the horns' },
  { emoji: '🤙', name: 'call me hand' },
  { emoji: '👈', name: 'backhand index pointing left' },
  { emoji: '👉', name: 'backhand index pointing right' },
  { emoji: '👆', name: 'backhand index pointing up' },
  { emoji: '👇', name: 'backhand index pointing down' },
  { emoji: '☝️', name: 'index pointing up' },
  { emoji: '✋', name: 'raised hand' },
  { emoji: '🤚', name: 'raised back of hand' },
  { emoji: '🖐️', name: 'hand with fingers splayed' },
  { emoji: '🖖', name: 'vulcan salute' },
  { emoji: '👋', name: 'waving hand' },
  { emoji: '🤏', name: 'pinching hand' },
  { emoji: '💪', name: 'flexed biceps' },
  { emoji: '🦾', name: 'mechanical arm' },
  { emoji: '🦿', name: 'mechanical leg' },
  { emoji: '🦵', name: 'leg' },
  { emoji: '🦶', name: 'foot' },
  { emoji: '👂', name: 'ear' },
  { emoji: '🦻', name: 'ear with hearing aid' },
  { emoji: '👃', name: 'nose' },
  { emoji: '🧠', name: 'brain' },
  { emoji: '🦷', name: 'tooth' },
  { emoji: '🦴', name: 'bone' },
  { emoji: '👀', name: 'eyes' },
  { emoji: '👁️', name: 'eye' },
  { emoji: '👅', name: 'tongue' },
  { emoji: '👄', name: 'mouth' },
];

function EmojiPicker({ onSelectEmoji, onClose, searchQuery, selectedIndex }) {
  const filteredEmojis = EMOJI_LIST.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <EmojiMenu>
      <EmojiSearch
        type="text"
        placeholder="Search emojis..."
        value={searchQuery}
        onChange={() => {}} // Handled by parent
        autoFocus
      />
      <EmojiGrid>
        {filteredEmojis.slice(0, 30).map((item, index) => (
          <EmojiItem
            key={`${item.emoji}-${index}`}
            className={index === selectedIndex ? 'selected' : ''}
            onClick={() => onSelectEmoji(item)}
            title={item.name}
          >
            {item.emoji}
          </EmojiItem>
        ))}
      </EmojiGrid>
    </EmojiMenu>
  );
}

export default function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emojiMenuPosition, setEmojiMenuPosition] = useState(null);

  const checkForEmojiMatch = useCallback((text) => {
    const emojiMatch = text.match(/:(\w*)$/);
    return emojiMatch ? emojiMatch[1] : null;
  }, []);

  const selectEmojiOption = useCallback((selectedEmoji) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      const anchor = selection.anchor;
      const anchorNode = anchor.getNode();
      const anchorOffset = anchor.offset;

      // Find the : symbol position
      const textContent = anchorNode.getTextContent();
      const emojiStart = textContent.lastIndexOf(':', anchorOffset - 1);

      if (emojiStart !== -1) {
        // Create emoji node
        const emojiNode = $createEmojiNode(selectedEmoji.emoji, selectedEmoji.name);
        
        // Replace the text from : to current position with the emoji node
        selection.setTextNodeRange(anchorNode, emojiStart, anchorNode, anchorOffset);
        selection.insertNodes([emojiNode]);
        
        // Add a space after the emoji
        selection.insertText(' ');
      }
    });

    setQueryString(null);
    setEmojiMenuPosition(null);
    setSearchQuery('');
  }, [editor]);

  useEffect(() => {
    const updateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          setQueryString(null);
          setEmojiMenuPosition(null);
          return;
        }

        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        const anchorOffset = anchor.offset;

        // Check if we're in a text node
        if (anchorNode.getType() !== 'text') {
          setQueryString(null);
          setEmojiMenuPosition(null);
          return;
        }

        const textContent = anchorNode.getTextContent();
        const textUpToCursor = textContent.slice(0, anchorOffset);
        const match = checkForEmojiMatch(textUpToCursor);

        if (match !== null) {
          setQueryString(match);
          setSearchQuery(match);
          
          // Calculate position for the emoji menu
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setEmojiMenuPosition({
              top: rect.bottom + window.scrollY + 5,
              left: rect.left + window.scrollX,
            });
          }
        } else {
          setQueryString(null);
          setEmojiMenuPosition(null);
          setSearchQuery('');
        }
      });
    });

    return updateListener;
  }, [editor, checkForEmojiMatch]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (queryString === null) {
      return;
    }

    const filteredEmojis = EMOJI_LIST.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleKeyDown = (event) => {
      if (filteredEmojis.length === 0) {
        return false;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.min(filteredEmojis.length, 30));
          return true;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + Math.min(filteredEmojis.length, 30)) % Math.min(filteredEmojis.length, 30));
          return true;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          if (filteredEmojis[selectedIndex]) {
            selectEmojiOption(filteredEmojis[selectedIndex]);
          }
          return true;
        case 'Escape':
          event.preventDefault();
          setQueryString(null);
          setEmojiMenuPosition(null);
          setSearchQuery('');
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
  }, [editor, searchQuery, selectedIndex, selectEmojiOption, queryString]);

  if (queryString === null || emojiMenuPosition === null) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: emojiMenuPosition.top,
        left: emojiMenuPosition.left,
      }}
    >
      <EmojiPicker
        searchQuery={searchQuery}
        selectedIndex={selectedIndex}
        onSelectEmoji={selectEmojiOption}
        onClose={() => {
          setQueryString(null);
          setEmojiMenuPosition(null);
          setSearchQuery('');
        }}
      />
    </div>,
    document.body,
  );
}
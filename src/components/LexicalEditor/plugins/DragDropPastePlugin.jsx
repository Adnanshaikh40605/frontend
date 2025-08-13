import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $insertNodes,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
} from 'lexical';
import { useEffect } from 'react';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { $createImageNode } from '../nodes/ImageNode';

const ACCEPTABLE_IMAGE_TYPES = [
  'image/',
  'image/heic',
  'image/heif',
  'image/gif',
  'image/webp',
];

export default function DragDropPastePlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // Simple drag and drop implementation
    const handleDrop = (event) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      
      files.forEach((file) => {
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = () => {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertRawText(reader.result);
              }
            });
          };
          reader.readAsText(file);
        } else if (ACCEPTABLE_IMAGE_TYPES.some(type => file.type.startsWith(type))) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              editor.update(() => {
                const imageNode = $createImageNode({
                  altText: file.name,
                  height: 'inherit',
                  maxWidth: 500,
                  src: reader.result,
                  width: 'inherit',
                });
                $insertNodes([imageNode]);
              });
            }
          };
          reader.readAsDataURL(file);
        }
      });
    };

    const handleDragOver = (event) => {
      event.preventDefault();
    };

    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener('drop', handleDrop);
      rootElement.addEventListener('dragover', handleDragOver);
      
      return () => {
        rootElement.removeEventListener('drop', handleDrop);
        rootElement.removeEventListener('dragover', handleDragOver);
      };
    }
  }, [editor]);
  
  return null;
}
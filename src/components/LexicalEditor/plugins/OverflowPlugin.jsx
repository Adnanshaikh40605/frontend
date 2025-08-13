import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// Note: Using text node for overflow handling as OverflowNode may not be available
import { $getSelection, $isRangeSelection } from 'lexical';
import { mergeRegister } from '@lexical/utils';

export default function OverflowPlugin({ maxLength = null }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!maxLength) return;

    return mergeRegister(
      editor.registerNodeTransform('text', (textNode) => {
        const textContent = textNode.getTextContent();
        
        if (textContent.length > maxLength) {
          const overflowText = textContent.slice(maxLength);
          const normalText = textContent.slice(0, maxLength);
          
          // Replace the text node with normal text + overflow node
          textNode.setTextContent(normalText);
          
          // Create a text node for overflow content
          const overflowTextNode = textNode.createTextNode(overflowText);
          textNode.insertAfter(overflowTextNode);
        }
      }),
      
      editor.registerCommand(
        'HANDLE_OVERFLOW',
        (payload) => {
          const { maxLength: newMaxLength } = payload;
          
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              // Handle overflow logic here
              console.log('Handling overflow with max length:', newMaxLength);
            }
          });
          
          return true;
        },
        1
      )
    );
  }, [editor, maxLength]);

  return null;
}
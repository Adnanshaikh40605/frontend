import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, $createParagraphNode, $createTextNode } from 'lexical';
import { mergeRegister } from '@lexical/utils';

export default function ClipboardPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // Handle paste events
      editor.registerCommand(
        'PASTE_COMMAND',
        (event) => {
          const clipboardData = event.clipboardData;
          
          if (clipboardData) {
            const htmlData = clipboardData.getData('text/html');
            const textData = clipboardData.getData('text/plain');
            
            if (htmlData) {
              event.preventDefault();
              editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(htmlData, 'text/html');
                const nodes = $generateNodesFromDOM(editor, dom);
                $insertNodes(nodes);
              });
              return true;
            }
          }
          
          return false;
        },
        1 // Priority
      ),
      
      // Handle copy events
      editor.registerCommand(
        'COPY_COMMAND',
        (event) => {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            editor.getEditorState().read(() => {
              const htmlString = $generateHtmlFromNodes(editor, null);
              const textString = $getRoot().getTextContent();
              
              if (event.clipboardData) {
                event.clipboardData.setData('text/html', htmlString);
                event.clipboardData.setData('text/plain', textString);
                event.preventDefault();
              }
            });
          }
          return false;
        },
        1
      )
    );
  }, [editor]);

  return null;
}
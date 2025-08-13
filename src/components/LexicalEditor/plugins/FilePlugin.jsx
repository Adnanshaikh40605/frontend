import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $createTextNode, $createParagraphNode } from 'lexical';
import { mergeRegister } from '@lexical/utils';

export default function FilePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // Handle file drop
      editor.registerCommand(
        'DROP_FILE',
        (files) => {
          if (files && files.length > 0) {
            Array.from(files).forEach((file) => {
              if (file.type.startsWith('text/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const content = e.target.result;
                  editor.update(() => {
                    if (file.type === 'text/html') {
                      const parser = new DOMParser();
                      const dom = parser.parseFromString(content, 'text/html');
                      const nodes = $generateNodesFromDOM(editor, dom);
                      const root = $getRoot();
                      root.append(...nodes);
                    } else {
                      // Handle plain text files
                      const textNode = $createTextNode(content);
                      const paragraphNode = $createParagraphNode();
                      paragraphNode.append(textNode);
                      const root = $getRoot();
                      root.append(paragraphNode);
                    }
                  });
                };
                reader.readAsText(file);
              } else if (file.type.startsWith('image/')) {
                // Handle image files - placeholder for image node creation
                console.log('Image file dropped:', file.name);
                // In a real implementation, you would create an ImageNode here
              }
            });
            return true;
          }
          return false;
        },
        1
      ),
      
      // Handle file export
      editor.registerCommand(
        'EXPORT_FILE',
        ({ format = 'html', filename = 'document' }) => {
          editor.getEditorState().read(() => {
            let content = '';
            let mimeType = 'text/plain';
            let extension = 'txt';
            
            if (format === 'html') {
              content = $generateHtmlFromNodes(editor, null);
              mimeType = 'text/html';
              extension = 'html';
            } else if (format === 'text') {
              content = $getRoot().getTextContent();
              mimeType = 'text/plain';
              extension = 'txt';
            }
            
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          });
          return true;
        },
        1
      )
    );
  }, [editor]);

  return null;
}
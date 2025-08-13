import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createTextNode, $createParagraphNode } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { mergeRegister } from '@lexical/utils';

// Markdown transformers
const MARKDOWN_TRANSFORMERS = [
  {
    type: 'element',
    regExp: /^(#{1,6})\s(.*)$/,
    replace: (parentNode, children, match) => {
      const tag = `h${match[1].length}`;
      return $createHeadingNode(tag).append(...children);
    },
  },
  {
    type: 'text-format',
    format: ['bold'],
    tag: '**',
  },
  {
    type: 'text-format',
    format: ['italic'],
    tag: '*',
  },
  {
    type: 'text-format',
    format: ['code'],
    tag: '`',
  },
  {
    type: 'text-format',
    format: ['strikethrough'],
    tag: '~~',
  },
];

export default function MarkdownPlugin({ transformers = MARKDOWN_TRANSFORMERS }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      // Register markdown import command
      editor.registerCommand(
        'IMPORT_MARKDOWN',
        (markdownString) => {
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            // Basic markdown parsing - for full support, use @lexical/markdown transformers
            const lines = markdownString.split('\n');
            lines.forEach(line => {
              if (line.startsWith('# ')) {
                const heading = $createHeadingNode('h1');
                heading.append($createTextNode(line.substring(2)));
                root.append(heading);
              } else if (line.startsWith('## ')) {
                const heading = $createHeadingNode('h2');
                heading.append($createTextNode(line.substring(3)));
                root.append(heading);
              } else {
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(line));
                root.append(paragraph);
              }
            });
          });
          return true;
        },
        1
      ),
      
      // Register markdown export command
      editor.registerCommand(
        'EXPORT_MARKDOWN',
        () => {
          let markdownString = '';
          editor.getEditorState().read(() => {
            // Basic markdown export - for full support, use @lexical/markdown transformers
            markdownString = $getRoot().getTextContent();
          });
          return markdownString;
        },
        1
      )
    );
  }, [editor, transformers]);

  return null;
}
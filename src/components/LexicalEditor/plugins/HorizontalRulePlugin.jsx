import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { useEffect } from 'react';
import { $createHorizontalRuleNode } from '../nodes/HorizontalRuleNode';

export const INSERT_HORIZONTAL_RULE_COMMAND = 'INSERT_HORIZONTAL_RULE_COMMAND';

export default function HorizontalRulePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_HORIZONTAL_RULE_COMMAND,
      () => {
        const horizontalRuleNode = $createHorizontalRuleNode();
        $insertNodes([horizontalRuleNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// Note: DevTools core functions may not be available in current version

export default function DevToolsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (import.meta.env.DEV) {
      // Simple command logging without external dependencies
      const unregister = () => {}; // Placeholder

      // Add editor state change logger
      const removeUpdateListener = editor.registerUpdateListener(({ editorState, prevEditorState }) => {
        console.group('%c[Lexical Update]', 'color: #28a745; font-weight: bold;');
        console.log('Previous State:', prevEditorState?.toJSON());
        console.log('New State:', editorState.toJSON());
        console.groupEnd();
      });

      return () => {
        unregister();
        removeUpdateListener();
      };
    }
  }, [editor]);

  // Add global debug functions in development
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      window.lexicalEditor = editor;
      window.getLexicalState = () => editor.getEditorState().toJSON();
      window.setLexicalState = (state) => {
        const editorState = editor.parseEditorState(state);
        editor.setEditorState(editorState);
      };
      
      console.log('%c[Lexical DevTools] Editor available as window.lexicalEditor', 'color: #ff6b35; font-weight: bold;');
      console.log('%c[Lexical DevTools] Use window.getLexicalState() to get current state', 'color: #ff6b35;');
      console.log('%c[Lexical DevTools] Use window.setLexicalState(state) to set state', 'color: #ff6b35;');
    }
  }, [editor]);

  return null;
}
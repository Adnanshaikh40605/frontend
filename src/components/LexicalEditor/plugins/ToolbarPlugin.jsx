import React, { useCallback, useEffect, useState } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from 'lexical';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import {
  $setBlocksType,
} from '@lexical/selection';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $createCodeNode } from '@lexical/code';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { getSelectedNode } from '../utils/getSelectedNode';
import {
  ToolbarContainer,
  ToolbarButton,
  ToolbarSelect,
  ToolbarDivider,
  blockTypeToBlockName
} from '../shared/ToolbarComponents';

function Divider() {
  return <ToolbarDivider />;
}



export default function ToolbarPlugin({ 
  setIsLinkEditMode, 
  enableTables = true
}) {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState('paragraph');

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && parent.getKey() === 'root';
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $findMatchingParent(anchorNode, $isListNode);
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type);
          }
        }
      }
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      activeEditor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor]);

  const insertLink = useCallback(() => {
    if (setIsLinkEditMode) {
      setIsLinkEditMode(true);
    }
    activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
  }, [activeEditor, setIsLinkEditMode]);

  return (
    <ToolbarContainer>
      <ToolbarButton
        disabled={!canUndo || !isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        ↶
      </ToolbarButton>
      <ToolbarButton
        disabled={!canRedo || !isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
      >
        ↷
      </ToolbarButton>
      <Divider />
      
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <ToolbarSelect
            value={blockType}
            onChange={(e) => {
              const newBlockType = e.target.value;
              if (newBlockType === 'paragraph') {
                formatParagraph();
              } else if (newBlockType === 'h1') {
                formatHeading('h1');
              } else if (newBlockType === 'h2') {
                formatHeading('h2');
              } else if (newBlockType === 'h3') {
                formatHeading('h3');
              } else if (newBlockType === 'bullet') {
                formatBulletList();
              } else if (newBlockType === 'number') {
                formatNumberedList();
              } else if (newBlockType === 'quote') {
                formatQuote();
              } else if (newBlockType === 'code') {
                formatCode();
              }
            }}
          >
            <option value="paragraph">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
            <option value="bullet">Bullet List</option>
            <option value="number">Numbered List</option>
            <option value="quote">Quote</option>
            <option value="code">Code Block</option>
          </ToolbarSelect>
          <Divider />
        </>
      )}
      
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        $active={isBold}
        title="Bold (Ctrl+B)"
        aria-label="Format text as bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        $active={isItalic}
        title="Italic (Ctrl+I)"
        aria-label="Format text as italics"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        $active={isUnderline}
        title="Underline (Ctrl+U)"
        aria-label="Format text to underlined"
      >
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        $active={isStrikethrough}
        title="Strikethrough"
        aria-label="Format text with a strikethrough"
      >
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
        }}
        $active={isCode}
        title="Insert code block"
        aria-label="Insert code block"
      >
        {'</>'}
      </ToolbarButton>
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          insertLink();
        }}
        aria-label="Insert link"
        title="Insert link"
      >
        🔗
      </ToolbarButton>
      
      <Divider />
      
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        title="Left Align"
        aria-label="Left Align"
      >
        ⬅
      </ToolbarButton>
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        title="Center Align"
        aria-label="Center Align"
      >
        ↔
      </ToolbarButton>
      <ToolbarButton
        disabled={!isEditable}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        title="Right Align"
        aria-label="Right Align"
      >
        ➡
      </ToolbarButton>
      
      {enableTables && (
        <>
          <Divider />
          <ToolbarButton
            disabled={!isEditable}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
                columns: '3',
                rows: '3',
                includeHeaders: true,
              });
            }}
            title="Insert Table"
            aria-label="Insert Table"
          >
            📊
          </ToolbarButton>
        </>
      )}
    </ToolbarContainer>
  );

  function formatParagraph() {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }

  function formatHeading(headingSize) {
    if (blockType !== headingSize) {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  }

  function formatBulletList() {
    if (blockType !== 'bullet') {
      activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  }

  function formatNumberedList() {
    if (blockType !== 'number') {
      activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  }

  function formatQuote() {
    if (blockType !== 'quote') {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  }

  function formatCode() {
    if (blockType !== 'code') {
      activeEditor.update(() => {
        let selection = $getSelection();

        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  }
}
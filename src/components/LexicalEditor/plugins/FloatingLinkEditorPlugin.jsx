import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    KEY_ESCAPE_COMMAND,
    SELECTION_CHANGE_COMMAND,
    $isLineBreakNode,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSelectedNode } from '../utils/getSelectedNode';
import { setFloatingElemPositionForLinkEditor } from '../utils/setFloatingElemPositionForLinkEditor';
import { sanitizeUrl } from '../utils/url';
import styled from 'styled-components';

const LinkEditorContainer = styled.div`
  position: absolute;
  z-index: 100;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  max-width: 300px;
  width: 100%;
  opacity: 0;
  background-color: #fff;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  transition: opacity 0.5s;
  will-change: transform;

  &.link-editor-active {
    opacity: 1;
  }
`;

const LinkInput = styled.input`
  display: block;
  width: calc(100% - 24px);
  box-sizing: border-box;
  margin: 8px 12px;
  padding: 8px 12px;
  border-radius: 15px;
  background-color: #eee;
  font-size: 15px;
  color: rgb(5, 5, 5);
  border: 0;
  outline: 0;
  position: relative;
  font-family: inherit;
`;

const LinkEditButton = styled.button.attrs({ type: 'button' })`
  background-color: #eee;
  border: 0;
  cursor: pointer;
  height: 20px;
  width: 20px;
  border-radius: 10px;
  margin: 8px;
  display: inline-block;
  position: relative;

  &:hover {
    background-color: #ddd;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background-image: url("data:image/svg+xml,%3csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z'/%3e%3cpath d='M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z'/%3e%3c/svg%3e");
    background-size: 10px;
    background-repeat: no-repeat;
    background-position: center;
  }
`;

const LinkPreview = styled.div`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LinkUrl = styled.a`
  color: rgb(33, 111, 219);
  text-decoration: none;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  margin-right: 30px;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: underline;
  }
`;

function FloatingLinkEditor({
    editor,
    isLink,
    setIsLink,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
}) {
    const editorRef = useRef(null);
    const inputRef = useRef(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [editedLinkUrl, setEditedLinkUrl] = useState('https://');
    const [lastSelection, setLastSelection] = useState(null);

    const $updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkParent = $findMatchingParent(node, $isLinkNode);

            if (linkParent) {
                setLinkUrl(linkParent.getURL());
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl('');
            }
            if (linkParent || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) {
            return;
        }

        const rootElement = editor.getRootElement();

        if (
            selection !== null &&
            nativeSelection !== null &&
            !nativeSelection.isCollapsed &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            const domRect =
                nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
            if (domRect) {
                domRect.y += 40;
                setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
            }
            setLastSelection(selection);
        } else if (!activeElement || activeElement.className !== 'link-input') {
            if (rootElement !== null) {
                setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
            }
            setLastSelection(null);
            setIsLinkEditMode(false);
            setLinkUrl('');
        }

        return true;
    }, [anchorElem, editor, setIsLink, setIsLinkEditMode]);

    useEffect(() => {
        const scrollerElem = anchorElem;

        const update = () => {
            editor.getEditorState().read(() => {
                $updateLinkEditor();
            });
        };

        window.addEventListener('resize', update);

        if (scrollerElem) {
            scrollerElem.addEventListener('scroll', update);
        }

        return () => {
            window.removeEventListener('resize', update);

            if (scrollerElem) {
                scrollerElem.removeEventListener('scroll', update);
            }
        };
    }, [anchorElem, editor, $updateLinkEditor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateLinkEditor();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateLinkEditor();
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    if (isLink) {
                        setIsLink(false);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [editor, $updateLinkEditor, isLink, setIsLink]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            $updateLinkEditor();
        });
    }, [editor, $updateLinkEditor]);

    useEffect(() => {
        if (isLinkEditMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLinkEditMode, isLink]);

    const monitorInputInteraction = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleLinkSubmission();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsLinkEditMode(false);
        }
    };

    const handleLinkSubmission = () => {
        if (lastSelection !== null) {
            if (linkUrl !== '') {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const node = getSelectedNode(selection);
                        const linkParent = $findMatchingParent(node, $isLinkNode);
                        if (linkParent) {
                            setLinkUrl(linkParent.getURL());
                        } else if ($isLinkNode(node)) {
                            setLinkUrl(node.getURL());
                        }
                    }
                });
            }
            setEditedLinkUrl('https://');
            setIsLinkEditMode(false);
        }
    };

    const handleLinkEdit = () => {
        setEditedLinkUrl(linkUrl);
        setIsLinkEditMode(true);
    };

    return (
        <LinkEditorContainer
            ref={editorRef}
            className={isLink ? 'link-editor-active' : ''}
        >
            {!isLink ? null : isLinkEditMode ? (
                <LinkInput
                    ref={inputRef}
                    className="link-input"
                    value={editedLinkUrl}
                    onChange={(event) => {
                        setEditedLinkUrl(event.target.value);
                    }}
                    onKeyDown={monitorInputInteraction}
                />
            ) : (
                <LinkPreview>
                    <LinkUrl href={sanitizeUrl(linkUrl)} target="_blank" rel="noopener noreferrer">
                        {linkUrl}
                    </LinkUrl>
                    <LinkEditButton
                        role="button"
                        tabIndex={0}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleLinkEdit}
                    />
                </LinkPreview>
            )}
        </LinkEditorContainer>
    );
}

function useFloatingLinkEditorToolbar(
    editor,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
) {
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isLink, setIsLink] = useState(false);

    useEffect(() => {
        function $updateToolbar() {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const focusNode = getSelectedNode(selection);
                const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
                const focusAutoLinkNode = $findMatchingParent(
                    focusNode,
                    $isAutoLinkNode,
                );
                if (!(focusLinkNode || focusAutoLinkNode)) {
                    setIsLink(false);
                    return;
                }
                const badNode = selection
                    .getNodes()
                    .filter((node) => !$isLineBreakNode(node))
                    .find((node) => {
                        const linkNode = $findMatchingParent(node, $isLinkNode);
                        const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
                        return (
                            (focusLinkNode && !linkNode) ||
                            (linkNode && !focusLinkNode) ||
                            (focusAutoLinkNode && !autoLinkNode) ||
                            (autoLinkNode && !focusAutoLinkNode) ||
                            (autoLinkNode && linkNode)
                        );
                    });
                if (!badNode) {
                    setIsLink(true);
                } else {
                    setIsLink(false);
                }
            }
        }
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    $updateToolbar();
                    setActiveEditor(newEditor);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
        );
    }, [editor]);

    return (
        <FloatingLinkEditor
            editor={activeEditor}
            isLink={isLink}
            anchorElem={anchorElem}
            setIsLink={setIsLink}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
        />
    );
}

export default function FloatingLinkEditorPlugin({
    anchorElem = document.body,
    isLinkEditMode,
    setIsLinkEditMode,
}) {
    const [editor] = useLexicalComposerContext();
    return useFloatingLinkEditorToolbar(
        editor,
        anchorElem,
        isLinkEditMode,
        setIsLinkEditMode,
    );
}
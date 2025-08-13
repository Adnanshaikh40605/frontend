import React, { useCallback, useEffect, useState, useRef } from 'react';
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
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import {
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    INSERT_CHECK_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
} from '@lexical/rich-text';
import {
    $setBlocksType,
    $getSelectionStyleValueForProperty,
    $patchStyleText,
} from '@lexical/selection';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { $createCodeNode } from '@lexical/code';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_HORIZONTAL_RULE_COMMAND } from './HorizontalRulePlugin';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import styled from 'styled-components';

// Professional styled components
const ToolbarContainer = styled.div`
  display: flex;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 12px 16px;
  border-bottom: 1px solid #e1e5e9;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:not(:last-child)::after {
    content: '';
    width: 1px;
    height: 24px;
    background: linear-gradient(to bottom, transparent, #e1e5e9, transparent);
    margin: 0 12px;
  }
`;

const ToolbarButton = styled.button.attrs({ type: 'button' })`
  background: ${props => props.$active ? 'linear-gradient(135deg, #0066cc, #004499)' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#0066cc' : 'transparent'};
  border-radius: 6px;
  color: ${props => props.$active ? '#fff' : '#4a5568'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  font-size: 14px;
  min-width: 36px;
  height: 36px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? 'linear-gradient(135deg, #0056b3, #003d7a)' : 'rgba(0, 102, 204, 0.08)'};
    border-color: ${props => props.$active ? '#0056b3' : 'rgba(0, 102, 204, 0.2)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;

const ToolbarSelect = styled.select`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  color: #4a5568;
  cursor: pointer;
  font-size: 14px;
  height: 36px;
  padding: 0 12px;
  min-width: 140px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }

  &:hover {
    border-color: #0066cc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const ColorPicker = styled.input`
  width: 36px;
  height: 36px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: #0066cc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  &::-webkit-color-swatch-wrapper {
    padding: 4px;
    border-radius: 4px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: ${props => props.$visible ? 'block' : 'none'};
  position: absolute;
  background: #ffffff;
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  top: calc(100% + 8px);
  left: 0;
  padding: 8px;
`;

const DropdownItem = styled.button.attrs({ type: 'button' })`
  background: none;
  border: none;
  padding: 12px 16px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #4a5568;
  font-weight: 500;
  
  &:hover {
    background: linear-gradient(135deg, #f7fafc, #edf2f7);
    color: #2d3748;
    transform: translateX(2px);
  }
  
  .icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
    border-radius: 4px;
    font-size: 12px;
  }
  
  .label {
    flex: 1;
  }
  
  .shortcut {
    font-size: 12px;
    color: #a0aec0;
    font-weight: 400;
  }
`;

const FontSizeContainer = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  overflow: hidden;
`;

const FontSizeInput = styled.input`
  background: transparent;
  border: none;
  color: #4a5568;
  font-size: 14px;
  height: 34px;
  padding: 0 8px;
  width: 50px;
  text-align: center;
  font-weight: 500;

  &:focus {
    outline: none;
    background: rgba(0, 102, 204, 0.05);
  }
`;

const FontSizeButton = styled.button.attrs({ type: 'button' })`
  background: transparent;
  border: none;
  color: #4a5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 34px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    background: rgba(0, 102, 204, 0.1);
    color: #0066cc;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Simple, understandable icon components
const UndoIcon = () => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>↶</span>;
const RedoIcon = () => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>↷</span>;
const BoldIcon = () => <span style={{ fontSize: '14px', fontWeight: 'bold' }}>B</span>;
const ItalicIcon = () => <span style={{ fontSize: '14px', fontStyle: 'italic' }}>I</span>;
const UnderlineIcon = () => <span style={{ fontSize: '14px', textDecoration: 'underline' }}>U</span>;
const StrikethroughIcon = () => <span style={{ fontSize: '14px', textDecoration: 'line-through' }}>S</span>;
const LinkIcon = () => <span style={{ fontSize: '14px' }}>🔗</span>;
const AlignLeftIcon = () => <span style={{ fontSize: '14px' }}>⬅</span>;
const AlignCenterIcon = () => <span style={{ fontSize: '14px' }}>↔</span>;
const AlignRightIcon = () => <span style={{ fontSize: '14px' }}>➡</span>;
const AlignJustifyIcon = () => <span style={{ fontSize: '14px' }}>⬌</span>;
const PlusIcon = () => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>;
const ChevronDownIcon = () => <span style={{ fontSize: '12px' }}>▼</span>;

// Block type mappings
const blockTypeToBlockName = {
  bullet: 'Bullet List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

// Font family options
const fontFamilyOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
];

export default function ProfessionalToolbarPlugin({
    setIsLinkEditMode,
    enableImages = true,
    enableTables = true,
    enableHashtags = true,
    enableMentions = true,
    enableEmojis = true,
    onImageUpload
}) {
    const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    const [blockType, setBlockType] = useState('paragraph');
    const [fontSize, setFontSize] = useState('15px');
    const [fontColor, setFontColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [fontFamily, setFontFamily] = useState('Inter');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [showInsertDropdown, setShowInsertDropdown] = useState(false);
    const [showAlignDropdown, setShowAlignDropdown] = useState(false);
    const [elementFormat, setElementFormat] = useState('left');
    const dropdownRef = useRef(null);
    const alignDropdownRef = useRef(null);

    // Update toolbar state
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
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));
            setIsCode(selection.hasFormat('code'));

            // Update font properties
            setFontSize(
                $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
            );
            setFontColor(
                $getSelectionStyleValueForProperty(selection, 'color', '#000000'),
            );
            setBgColor(
                $getSelectionStyleValueForProperty(
                    selection,
                    'background-color',
                    '#ffffff',
                ),
            );
            setFontFamily(
                $getSelectionStyleValueForProperty(selection, 'font-family', 'Inter'),
            );

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

                // Update element format (alignment)
                const elementStyle = elementDOM.style;
                const textAlign = elementStyle.textAlign || 'left';
                setElementFormat(textAlign);
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

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowInsertDropdown(false);
            }
            if (alignDropdownRef.current && !alignDropdownRef.current.contains(event.target)) {
                setShowAlignDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const applyStyleText = useCallback(
        (styles) => {
            activeEditor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $patchStyleText(selection, styles);
                }
            });
        },
        [activeEditor],
    );

    const onFontColorSelect = useCallback(
        (value) => {
            applyStyleText({ color: value });
        },
        [applyStyleText],
    );

    const onBgColorSelect = useCallback(
        (value) => {
            applyStyleText({ 'background-color': value });
        },
        [applyStyleText],
    );

    const onFontSizeChange = useCallback(
        (value) => {
            applyStyleText({ 'font-size': value });
        },
        [applyStyleText],
    );

    const increaseFontSize = useCallback(() => {
        const currentSize = parseInt(fontSize) || 15;
        const newSize = Math.min(currentSize + 1, 72);
        onFontSizeChange(`${newSize}px`);
    }, [fontSize, onFontSizeChange]);

    const decreaseFontSize = useCallback(() => {
        const currentSize = parseInt(fontSize) || 15;
        const newSize = Math.max(currentSize - 1, 8);
        onFontSizeChange(`${newSize}px`);
    }, [fontSize, onFontSizeChange]);

    const onFontFamilySelect = useCallback(
        (value) => {
            applyStyleText({ 'font-family': value });
        },
        [applyStyleText],
    );

    const insertLink = useCallback(() => {
        const url = prompt('Enter the URL:');
        if (url) {
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
    }, [activeEditor]);

    const formatParagraph = () => {
        activeEditor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = (headingSize) => {
        if (blockType !== headingSize) {
            activeEditor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(headingSize));
                }
            });
        }
    };

    const formatBulletList = () => {
        if (blockType !== 'bullet') {
            activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatNumberedList = () => {
        if (blockType !== 'number') {
            activeEditor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatCheckList = () => {
        if (blockType !== 'check') {
            activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        } else {
            activeEditor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
    };

    const formatQuote = () => {
        if (blockType !== 'quote') {
            activeEditor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                }
            });
        }
    };

    const formatCode = () => {
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
    };

    // Insert dropdown items with professional icons and descriptions
    const insertItems = [
        {
            key: 'horizontal-rule',
            icon: '➖',
            label: 'Horizontal Rule',
            description: 'Add a horizontal divider line',
            action: () => {
                activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'page-break',
            icon: '📄',
            label: 'Page Break',
            description: 'Insert a page break for printing',
            action: () => {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertRawText('\n\n--- PAGE BREAK ---\n\n');
                    }
                });
                setShowInsertDropdown(false);
            }
        },
        ...(enableImages ? [{
            key: 'image',
            icon: '🖼️',
            label: 'Image',
            description: 'Upload and insert an image',
            action: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        try {
                            let imageUrl;
                            if (onImageUpload) {
                                imageUrl = await onImageUpload(file);
                            } else {
                                imageUrl = URL.createObjectURL(file);
                            }
                            
                            activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                src: imageUrl,
                                alt: file.name,
                                width: 'auto',
                                height: 'auto'
                            });
                        } catch (error) {
                            console.error('Image upload failed:', error);
                            alert('Failed to upload image. Please try again.');
                        }
                    }
                };
                input.click();
                setShowInsertDropdown(false);
            }
        }] : []),
        {
            key: 'inline-image',
            icon: '🖼️',
            label: 'Inline Image',
            description: 'Insert a small inline image',
            action: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        try {
                            let imageUrl;
                            if (onImageUpload) {
                                imageUrl = await onImageUpload(file);
                            } else {
                                imageUrl = URL.createObjectURL(file);
                            }
                            
                            activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                src: imageUrl,
                                alt: file.name,
                                width: '100px',
                                height: 'auto'
                            });
                        } catch (error) {
                            console.error('Image upload failed:', error);
                        }
                    }
                };
                input.click();
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'gif',
            icon: '🎬',
            label: 'GIF',
            description: 'Insert an animated GIF',
            action: () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/gif';
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        try {
                            let imageUrl;
                            if (onImageUpload) {
                                imageUrl = await onImageUpload(file);
                            } else {
                                imageUrl = URL.createObjectURL(file);
                            }
                            
                            activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                src: imageUrl,
                                alt: file.name,
                                width: 'auto',
                                height: 'auto'
                            });
                        } catch (error) {
                            console.error('GIF upload failed:', error);
                        }
                    }
                };
                input.click();
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'excalidraw',
            icon: '✏️',
            label: 'Excalidraw',
            description: 'Create a drawing or diagram',
            action: () => {
                // Placeholder for Excalidraw integration
                alert('Excalidraw integration coming soon!');
                setShowInsertDropdown(false);
            }
        },
        ...(enableTables ? [{
            key: 'table',
            icon: '📊',
            label: 'Table',
            description: 'Insert a data table',
            action: () => {
                activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
                    columns: 3,
                    rows: 3,
                    includeHeaders: true,
                });
                setShowInsertDropdown(false);
            }
        }] : []),
        {
            key: 'poll',
            icon: '📊',
            label: 'Poll',
            description: 'Create an interactive poll',
            action: () => {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertRawText('\n📊 Poll: What do you think?\n☐ Option 1\n☐ Option 2\n☐ Option 3\n');
                    }
                });
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'columns',
            icon: '📰',
            label: 'Columns Layout',
            description: 'Create a multi-column layout',
            action: () => {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertRawText('\n\n[Column 1 Content]     |     [Column 2 Content]\n\n');
                    }
                });
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'equation',
            icon: '🧮',
            label: 'Equation',
            description: 'Insert a mathematical equation',
            action: () => {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertRawText('E = mc²');
                    }
                });
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'sticky-note',
            icon: '📝',
            label: 'Sticky Note',
            description: 'Add a highlighted note or callout',
            action: () => {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertRawText('\n💡 Note: Add your important note here\n');
                    }
                });
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'collapsible',
            icon: '📁',
            label: 'Collapsible Container',
            description: 'Create expandable/collapsible content',
            action: () => {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertRawText('\n▶️ Click to expand\n[Hidden content goes here]\n');
                    }
                });
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'date',
            icon: '📅',
            label: 'Date',
            description: 'Insert current date',
            action: () => {
                activeEditor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        selection.insertRawText(new Date().toLocaleDateString());
                    }
                });
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'tweet',
            icon: '🐦',
            label: 'X (Tweet)',
            description: 'Embed a tweet from X (Twitter)',
            action: () => {
                const url = prompt('Enter X (Twitter) post URL:');
                if (url) {
                    activeEditor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            selection.insertRawText(`\n🐦 X Post: ${url}\n`);
                        }
                    });
                }
                setShowInsertDropdown(false);
            }
        },
        {
            key: 'youtube',
            icon: '📺',
            label: 'YouTube Video',
            description: 'Embed a YouTube video',
            action: () => {
                const url = prompt('Enter YouTube video URL:');
                if (url) {
                    activeEditor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            selection.insertRawText(`\n📺 YouTube: ${url}\n`);
                        }
                    });
                }
                setShowInsertDropdown(false);
            }
        }
    ];

    return (
        <ToolbarContainer>
            {/* History Controls */}
            <ToolbarSection>
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
                    <UndoIcon />
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
                    <RedoIcon />
                </ToolbarButton>
            </ToolbarSection>

            {/* Block Type */}
            <ToolbarSection>
                {blockType in blockTypeToBlockName && activeEditor === editor && (
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
                            } else if (newBlockType === 'h4') {
                                formatHeading('h4');
                            } else if (newBlockType === 'h5') {
                                formatHeading('h5');
                            } else if (newBlockType === 'h6') {
                                formatHeading('h6');
                            } else if (newBlockType === 'bullet') {
                                formatBulletList();
                            } else if (newBlockType === 'number') {
                                formatNumberedList();
                            } else if (newBlockType === 'check') {
                                formatCheckList();
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
                        <option value="check">Check List</option>
                        <option value="quote">Quote</option>
                        <option value="code">Code Block</option>
                    </ToolbarSelect>
                )}
            </ToolbarSection>

            {/* Font Controls */}
            <ToolbarSection>
                <ToolbarSelect
                    value={fontFamily}
                    onChange={(e) => onFontFamilySelect(e.target.value)}
                    title="Font Family"
                >
                    {fontFamilyOptions.map(({ value, label }) => (
                        <option key={value} value={value} style={{ fontFamily: value }}>
                            {label}
                        </option>
                    ))}
                </ToolbarSelect>

                <FontSizeContainer>
                    <FontSizeButton
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            decreaseFontSize();
                        }}
                        disabled={!isEditable || parseInt(fontSize) <= 8}
                        title="Decrease font size"
                    >
                        −
                    </FontSizeButton>
                    <FontSizeInput
                        type="number"
                        value={parseInt(fontSize)}
                        onChange={(e) => onFontSizeChange(`${e.target.value}px`)}
                        min="8"
                        max="72"
                        title="Font Size"
                    />
                    <FontSizeButton
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            increaseFontSize();
                        }}
                        disabled={!isEditable || parseInt(fontSize) >= 72}
                        title="Increase font size"
                    >
                        +
                    </FontSizeButton>
                </FontSizeContainer>
            </ToolbarSection>

            {/* Text Formatting */}
            <ToolbarSection>
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
                    <BoldIcon />
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
                    <ItalicIcon />
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
                    <UnderlineIcon />
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
                    <StrikethroughIcon />
                </ToolbarButton>
            </ToolbarSection>

            {/* Colors */}
            <ToolbarSection>
                <ColorPicker
                    disabled={!isEditable}
                    value={fontColor}
                    onChange={(e) => onFontColorSelect(e.target.value)}
                    title="Text color"
                    type="color"
                />
                <ColorPicker
                    disabled={!isEditable}
                    value={bgColor}
                    onChange={(e) => onBgColorSelect(e.target.value)}
                    title="Background color"
                    type="color"
                />
            </ToolbarSection>

            {/* Link */}
            <ToolbarSection>
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
                    <LinkIcon />
                </ToolbarButton>
            </ToolbarSection>

            {/* Alignment */}
            <ToolbarSection>
                <DropdownContainer ref={alignDropdownRef}>
                    <ToolbarButton
                        disabled={!isEditable}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAlignDropdown(!showAlignDropdown);
                        }}
                        title="Text Alignment"
                        aria-label="Text Alignment"
                    >
                        {elementFormat === 'left' && <AlignLeftIcon />}
                        {elementFormat === 'center' && <AlignCenterIcon />}
                        {elementFormat === 'right' && <AlignRightIcon />}
                        {elementFormat === 'justify' && <AlignJustifyIcon />}
                        {!elementFormat && <AlignLeftIcon />}
                        <ChevronDownIcon />
                    </ToolbarButton>
                    <DropdownContent $visible={showAlignDropdown}>
                        <DropdownItem
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                                setElementFormat('left');
                                setShowAlignDropdown(false);
                            }}
                        >
                            <div className="icon"><AlignLeftIcon /></div>
                            <div className="label">Left Align</div>
                            <div className="shortcut">Ctrl+Shift+L</div>
                        </DropdownItem>
                        <DropdownItem
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                                setElementFormat('center');
                                setShowAlignDropdown(false);
                            }}
                        >
                            <div className="icon"><AlignCenterIcon /></div>
                            <div className="label">Center Align</div>
                            <div className="shortcut">Ctrl+Shift+E</div>
                        </DropdownItem>
                        <DropdownItem
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                                setElementFormat('right');
                                setShowAlignDropdown(false);
                            }}
                        >
                            <div className="icon"><AlignRightIcon /></div>
                            <div className="label">Right Align</div>
                            <div className="shortcut">Ctrl+Shift+R</div>
                        </DropdownItem>
                        <DropdownItem
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
                                setElementFormat('justify');
                                setShowAlignDropdown(false);
                            }}
                        >
                            <div className="icon"><AlignJustifyIcon /></div>
                            <div className="label">Justify</div>
                            <div className="shortcut">Ctrl+Shift+J</div>
                        </DropdownItem>
                    </DropdownContent>
                </DropdownContainer>
            </ToolbarSection>

            {/* Insert Dropdown */}
            <ToolbarSection>
                <DropdownContainer ref={dropdownRef}>
                    <ToolbarButton
                        disabled={!isEditable}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowInsertDropdown(!showInsertDropdown);
                        }}
                        title="Insert"
                        aria-label="Insert"
                    >
                        <PlusIcon />
                        <span style={{ marginLeft: '6px' }}>Insert</span>
                        <ChevronDownIcon />
                    </ToolbarButton>
                    <DropdownContent $visible={showInsertDropdown}>
                        {insertItems.map((item) => (
                            <DropdownItem key={item.key} onClick={item.action}>
                                <div className="icon">{item.icon}</div>
                                <div className="label">
                                    <div>{item.label}</div>
                                    <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '2px' }}>
                                        {item.description}
                                    </div>
                                </div>
                            </DropdownItem>
                        ))}
                    </DropdownContent>
                </DropdownContainer>
            </ToolbarSection>
        </ToolbarContainer>
    );
}
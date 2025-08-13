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
import {
  ToolbarContainer,
  ToolbarSection,
  ToolbarButton,
  ToolbarSelect,
  ColorPicker,
  DropdownContainer,
  DropdownContent,
  DropdownItem,
  FontSizeContainer,
  FontSizeInput,
  FontSizeButton,
  Divider,
  blockTypeToBlockName,
  fontFamilyOptions
} from '../shared/ToolbarComponents';





export default function AdvancedToolbarPlugin({
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
    const [fontFamily, setFontFamily] = useState('Arial');
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
                $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
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
        if (setIsLinkEditMode) {
            setIsLinkEditMode(true);
        }
        activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    }, [activeEditor, setIsLinkEditMode]);

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

    return (
        <ToolbarContainer>
            {/* History Controls */}
            <ToolbarSection>
                <ToolbarButton
                    type="button"
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
                    type="button"
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
                    type="button"
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
                    type="button"
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
                    type="button"
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
                    type="button"
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
                    type="button"
                    disabled={!isEditable}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
                    }}
                    $active={isSubscript}
                    title="Subscript"
                    aria-label="Format Subscript"
                >
                    X₂
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    disabled={!isEditable}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
                    }}
                    $active={isSuperscript}
                    title="Superscript"
                    aria-label="Format Superscript"
                >
                    X²
                </ToolbarButton>
                <ToolbarButton
                    type="button"
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
                    type="button"
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
            </ToolbarSection>

            {/* Alignment */}
            <ToolbarSection>
                <DropdownContainer ref={alignDropdownRef}>
                    <ToolbarButton
                        type="button"
                        disabled={!isEditable}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAlignDropdown(!showAlignDropdown);
                        }}
                        title="Text Alignment"
                        aria-label="Text Alignment"
                    >
                        {elementFormat === 'left' && '⬅'}
                        {elementFormat === 'center' && '↔'}
                        {elementFormat === 'right' && '➡'}
                        {elementFormat === 'justify' && '⬌'}
                        {!elementFormat && '⬅'} Left Align ▼
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
                            ⬅ Left Align
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
                            ↔ Center Align
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
                            ➡ Right Align
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
                            ⬌ Justify
                        </DropdownItem>
                    </DropdownContent>
                </DropdownContainer>
            </ToolbarSection>

            {/* Insert Dropdown */}
            <ToolbarSection>
                <DropdownContainer ref={dropdownRef}>
                    <ToolbarButton
                        type="button"
                        disabled={!isEditable}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowInsertDropdown(!showInsertDropdown);
                        }}
                        title="Insert"
                        aria-label="Insert"
                    >
                        ➕ Insert ▼
                    </ToolbarButton>
                    <DropdownContent $visible={showInsertDropdown}>
                        {enableTables && (
                            <>
                                <DropdownItem
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
                                            columns: 3,
                                            rows: 3,
                                            includeHeaders: true,
                                        });
                                        setShowInsertDropdown(false);
                                    }}
                                >
                                    <span>📊</span> Table
                                </DropdownItem>
                                <Divider />
                            </>
                        )}
                        {enableImages && (
                            <DropdownItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Trigger image upload
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
                                                    // Fallback: create object URL for preview
                                                    imageUrl = URL.createObjectURL(file);
                                                }
                                                
                                                // Insert image into editor
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
                                }}
                            >
                                <span>🖼️</span> Image
                            </DropdownItem>
                        )}
                        <DropdownItem
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
                                setShowInsertDropdown(false);
                            }}
                        >
                            <span>➖</span> Horizontal Rule
                        </DropdownItem>
                        <Divider />
                        <DropdownItem
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeEditor.update(() => {
                                    const selection = $getSelection();
                                    if ($isRangeSelection(selection)) {
                                        selection.insertRawText('📅 ' + new Date().toLocaleDateString());
                                    }
                                });
                                setShowInsertDropdown(false);
                            }}
                        >
                            <span>📅</span> Date
                        </DropdownItem>
                        {enableEmojis && (
                            <DropdownItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Trigger emoji picker
                                    activeEditor.update(() => {
                                        const selection = $getSelection();
                                        if ($isRangeSelection(selection)) {
                                            selection.insertRawText('😀');
                                        }
                                    });
                                    setShowInsertDropdown(false);
                                }}
                            >
                                <span>😀</span> Emoji
                            </DropdownItem>
                        )}
                        {enableMentions && (
                            <DropdownItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    activeEditor.update(() => {
                                        const selection = $getSelection();
                                        if ($isRangeSelection(selection)) {
                                            selection.insertRawText('@');
                                        }
                                    });
                                    setShowInsertDropdown(false);
                                }}
                            >
                                <span>@</span> Mention
                            </DropdownItem>
                        )}
                        {enableHashtags && (
                            <DropdownItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    activeEditor.update(() => {
                                        const selection = $getSelection();
                                        if ($isRangeSelection(selection)) {
                                            selection.insertRawText('#');
                                        }
                                    });
                                    setShowInsertDropdown(false);
                                }}
                            >
                                <span>#</span> Hashtag
                            </DropdownItem>
                        )}
                        <Divider />
                        <DropdownItem
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
                                setShowInsertDropdown(false);
                            }}
                        >
                            <span>➖</span> Horizontal Rule
                        </DropdownItem>
                    </DropdownContent>
                </DropdownContainer>
            </ToolbarSection>

            {/* Additional Tools */}
            <ToolbarSection>
                <ToolbarButton
                    type="button"
                    disabled={!isEditable}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                    }}
                    title="Indent"
                    aria-label="Indent"
                >
                    ⇥
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    disabled={!isEditable}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                    }}
                    title="Outdent"
                    aria-label="Outdent"
                >
                    ⇤
                </ToolbarButton>
            </ToolbarSection>

            {/* Additional Actions */}
            <ToolbarSection>
                <ToolbarButton
                    type="button"
                    disabled={!isEditable}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        activeEditor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                                // Clear all formatting
                                selection.formatText('bold', false);
                                selection.formatText('italic', false);
                                selection.formatText('underline', false);
                                selection.formatText('strikethrough', false);
                                selection.formatText('code', false);
                                selection.formatText('subscript', false);
                                selection.formatText('superscript', false);
                                // Clear styles
                                $patchStyleText(selection, {
                                    'font-size': null,
                                    'color': null,
                                    'background-color': null,
                                    'font-family': null,
                                });
                            }
                        });
                    }}
                    title="Clear Formatting"
                    aria-label="Clear Formatting"
                >
                    🧹
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    disabled={!isEditable}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Toggle debug view or other functionality
                        console.log('Debug view toggle');
                    }}
                    title="Debug View"
                    aria-label="Debug View"
                >
                    🐛
                </ToolbarButton>
                <ToolbarButton
                    type="button"
                    disabled={!isEditable}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Export or save functionality
                        activeEditor.getEditorState().read(() => {
                            const content = JSON.stringify(activeEditor.getEditorState().toJSON());
                            console.log('Editor content:', content);
                        });
                    }}
                    title="Export"
                    aria-label="Export"
                >
                    💾
                </ToolbarButton>
            </ToolbarSection>
        </ToolbarContainer>
    );
}
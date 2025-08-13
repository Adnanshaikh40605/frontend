// Advanced RichTextEditor with all Lexical playground features
import React, { useCallback } from 'react';
import ComprehensiveRichTextEditor from './LexicalEditor/ComprehensiveRichTextEditor';
import PropTypes from 'prop-types';

const RichTextEditor = ({
  value = '',
  onChange,
  onImageUpload,
  placeholder = 'Write your blog post content here...',
  autoFocus = false,
  readOnly = false,
  className = '',
  style = {},
  maxLength,
  showToolbar = true,
  showWordCount = true,
  showDebugView = false,
  enableImages = true,
  enableTables = true,
  enableHashtags = true,
  enableMentions = true,
  enableEmojis = true,
  enableMarkdown = true,
  enableCodeHighlight = true,
  enableCollaboration = false,
  enableDevTools = false,
  mode = 'rich',
  onError,
  ...props
}) => {
  const handleChange = useCallback((htmlContent, stats) => {
    if (onChange) {
      onChange(htmlContent, stats);
    }
  }, [onChange]);

  const handleImageUpload = useCallback(async (file) => {
    if (onImageUpload) {
      return await onImageUpload(file);
    }
    
    // Default image upload - create object URL for preview
    return URL.createObjectURL(file);
  }, [onImageUpload]);

  return (
    <ComprehensiveRichTextEditor
      initialValue={value}
      onChange={handleChange}
      onImageUpload={handleImageUpload}
      placeholder={placeholder}
      autoFocus={autoFocus}
      readOnly={readOnly}
      className={className}
      style={style}
      maxLength={maxLength}
      showToolbar={showToolbar}
      showWordCount={showWordCount}
      showDebugView={showDebugView}
      enableImages={enableImages}
      enableTables={enableTables}
      enableHashtags={enableHashtags}
      enableMentions={enableMentions}
      enableEmojis={enableEmojis}
      enableMarkdown={enableMarkdown}
      enableCodeHighlight={enableCodeHighlight}
      enableCollaboration={enableCollaboration}
      enableDevTools={enableDevTools}
      mode={mode}
      onError={onError}
      {...props}
    />
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onImageUpload: PropTypes.func,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  maxLength: PropTypes.number,
  showToolbar: PropTypes.bool,
  showWordCount: PropTypes.bool,
  showDebugView: PropTypes.bool,
  enableImages: PropTypes.bool,
  enableTables: PropTypes.bool,
  enableHashtags: PropTypes.bool,
  enableMentions: PropTypes.bool,
  enableEmojis: PropTypes.bool,
  enableMarkdown: PropTypes.bool,
  enableCodeHighlight: PropTypes.bool,
  enableCollaboration: PropTypes.bool,
  enableDevTools: PropTypes.bool,
  mode: PropTypes.oneOf(['rich', 'markdown', 'plain']),
  onError: PropTypes.func,
};

export default RichTextEditor;

// Also export as named export for backward compatibility
export { RichTextEditor };
# Advanced Lexical Editor

A comprehensive rich text editor built with Lexical that provides all the features you need for modern content creation.

## Features

### ✨ Rich Text Formatting
- **Bold**, *italic*, <u>underline</u>, ~~strikethrough~~
- Subscript and superscript
- Inline `code` formatting
- Text and background colors
- Font family and size controls

### 📝 Block Types
- Headings (H1-H6)
- Paragraphs
- Block quotes
- Code blocks with syntax highlighting
- Bulleted and numbered lists
- Interactive checklists

### 🔗 Links & Media
- Link insertion with floating editor
- Image uploads with drag & drop
- Horizontal rules
- Tables with headers

### 🎯 Special Content
- @mentions with autocomplete
- #hashtags
- 😀 Emoji picker
- Date insertion

### ⚡ Advanced Features
- Text alignment (left, center, right, justify)
- Indentation controls
- Clear formatting
- Undo/redo with history
- Debug view for development
- Export functionality
- Word and character count
- Responsive design
- Dark mode support

## Quick Start

### Basic Usage

```jsx
import React, { useState } from 'react';
import { AdvancedLexicalEditor } from './components/LexicalEditor';

function MyEditor() {
  const [content, setContent] = useState('');

  const handleChange = (htmlContent, stats) => {
    setContent(htmlContent);
    console.log('Word count:', stats.wordCount);
    console.log('Character count:', stats.charCount);
  };

  return (
    <AdvancedLexicalEditor
      initialValue="<p>Start typing...</p>"
      onChange={handleChange}
      placeholder="Enter your content here..."
      showToolbar={true}
      showWordCount={true}
    />
  );
}
```

### Advanced Usage with All Features

```jsx
import React, { useState, useCallback } from 'react';
import { AdvancedLexicalEditor } from './components/LexicalEditor';

function AdvancedEditor() {
  const [content, setContent] = useState('');

  const handleChange = useCallback((htmlContent, stats) => {
    setContent(htmlContent);
    // Handle content changes
  }, []);

  const handleImageUpload = useCallback(async (file) => {
    // Upload image to your server
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const { url } = await response.json();
    return url;
  }, []);

  return (
    <AdvancedLexicalEditor
      initialValue="<h1>Welcome!</h1><p>Start creating amazing content...</p>"
      onChange={handleChange}
      onImageUpload={handleImageUpload}
      placeholder="What's on your mind?"
      autoFocus={true}
      showToolbar={true}
      showWordCount={true}
      showDebugView={false}
      enableImages={true}
      enableTables={true}
      enableHashtags={true}
      enableMentions={true}
      enableEmojis={true}
      maxLength={10000}
      style={{ minHeight: '400px' }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialValue` | `string` | `''` | Initial HTML content |
| `onChange` | `function` | - | Callback when content changes |
| `onImageUpload` | `function` | - | Async function to handle image uploads |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text |
| `autoFocus` | `boolean` | `false` | Auto focus on mount |
| `readOnly` | `boolean` | `false` | Make editor read-only |
| `showToolbar` | `boolean` | `true` | Show/hide toolbar |
| `showWordCount` | `boolean` | `true` | Show word count in status bar |
| `showDebugView` | `boolean` | `false` | Show debug panel |
| `enableImages` | `boolean` | `true` | Enable image uploads |
| `enableTables` | `boolean` | `true` | Enable table insertion |
| `enableHashtags` | `boolean` | `true` | Enable hashtag support |
| `enableMentions` | `boolean` | `true` | Enable @mentions |
| `enableEmojis` | `boolean` | `true` | Enable emoji picker |
| `maxLength` | `number` | - | Maximum character limit |
| `className` | `string` | `''` | CSS class name |
| `style` | `object` | `{}` | Inline styles |

## Styling

The editor comes with comprehensive CSS that you can customize:

```css
/* Override editor container */
.editor-container {
  border-radius: 12px;
  border: 2px solid #e1e5e9;
}

/* Customize toolbar */
.toolbar {
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
}

/* Style headings */
.editor-heading-h1 {
  color: #2c3e50;
  font-weight: 700;
}
```

## Demo

Check out the comprehensive demo:

```jsx
import { LexicalEditorDemo } from './components/LexicalEditor';

function App() {
  return <LexicalEditorDemo />;
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

- React 16.8+
- Lexical
- Styled Components

## License

MIT License - see LICENSE file for details.
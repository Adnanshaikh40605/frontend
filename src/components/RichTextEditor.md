# RichTextEditor - Now with Advanced Features!

Your RichTextEditor component has been upgraded with all the advanced features from the Lexical playground!

## 🎉 What's New

Your RichTextEditor now includes:

### ✨ **Complete Toolbar** (matching Lexical playground)
- **Format Dropdown**: Normal, H1-H6, Lists, Quote, Code
- **Font Controls**: Font family, size with +/- buttons
- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Code, Sub/Superscript
- **Colors**: Text and background color pickers
- **Alignment**: Left, Center, Right, Justify dropdown
- **Insert Menu**: Tables, Images, Horizontal Rules, Emojis, Mentions, Hashtags

### 🚀 **Advanced Features**
- **Tables**: Insert and edit tables with headers
- **Images**: Drag & drop or upload images
- **Lists**: Bulleted, numbered, and interactive checklists
- **Links**: Floating link editor
- **Code Blocks**: Syntax highlighting
- **@Mentions**: User mentions with autocomplete
- **#Hashtags**: Hashtag support
- **😀 Emojis**: Emoji picker
- **Undo/Redo**: Full history support
- **Word Count**: Real-time statistics

## 📖 Usage

### Basic Usage (Same API as before!)
```jsx
import RichTextEditor from './components/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  const handleChange = (htmlContent, stats) => {
    setContent(htmlContent);
    console.log('Words:', stats.wordCount);
  };

  return (
    <RichTextEditor
      value={content}
      onChange={handleChange}
      placeholder="Write your blog post content here..."
    />
  );
}
```

### Advanced Usage with All Features
```jsx
import RichTextEditor from './components/RichTextEditor';

function AdvancedBlogEditor() {
  const [content, setContent] = useState('');

  const handleChange = (htmlContent, stats) => {
    setContent(htmlContent);
    // Handle content changes
  };

  const handleImageUpload = async (file) => {
    // Upload to your server
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    const { url } = await response.json();
    return url;
  };

  return (
    <RichTextEditor
      value={content}
      onChange={handleChange}
      onImageUpload={handleImageUpload}
      placeholder="Write your blog post content here..."
      showToolbar={true}
      showWordCount={true}
      enableImages={true}
      enableTables={true}
      enableHashtags={true}
      enableMentions={true}
      enableEmojis={true}
      maxLength={10000}
      style={{ minHeight: '500px' }}
    />
  );
}
```

## 🎛️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Initial HTML content |
| `onChange` | `function` | - | `(htmlContent, stats) => {}` |
| `onImageUpload` | `function` | - | `async (file) => imageUrl` |
| `placeholder` | `string` | `'Write your blog post content here...'` | Placeholder text |
| `showToolbar` | `boolean` | `true` | Show/hide the advanced toolbar |
| `showWordCount` | `boolean` | `true` | Show word count in status bar |
| `enableImages` | `boolean` | `true` | Enable image uploads |
| `enableTables` | `boolean` | `true` | Enable table insertion |
| `enableHashtags` | `boolean` | `true` | Enable #hashtag support |
| `enableMentions` | `boolean` | `true` | Enable @mentions |
| `enableEmojis` | `boolean` | `true` | Enable emoji picker |
| `maxLength` | `number` | - | Maximum character limit |
| `autoFocus` | `boolean` | `false` | Auto focus on mount |
| `readOnly` | `boolean` | `false` | Make editor read-only |
| `showDebugView` | `boolean` | `false` | Show debug panel |

## 🧪 Testing

Test your updated RichTextEditor:

```jsx
import RichTextEditorTest from './components/RichTextEditorTest';

function App() {
  return <RichTextEditorTest />;
}
```

## 🎨 Styling

The editor comes with comprehensive CSS. You can customize it:

```css
/* Customize the editor container */
.editor-container {
  border-radius: 12px;
  border: 2px solid #e1e5e9;
}

/* Customize the toolbar */
.toolbar {
  background: #f8f9fa;
}
```

## 🔄 Migration

**Good news!** Your existing code will work without changes. The RichTextEditor maintains the same API but now includes all the advanced features.

### Before (Basic editor)
```jsx
<RichTextEditor
  value={content}
  onChange={handleChange}
  placeholder="Write here..."
/>
```

### After (Advanced editor with same API!)
```jsx
<RichTextEditor
  value={content}
  onChange={handleChange}
  placeholder="Write here..."
  // Now includes: advanced toolbar, tables, images, mentions, etc.
/>
```

## ✅ Features Checklist

- ✅ **Backward Compatible**: Existing code works unchanged
- ✅ **Advanced Toolbar**: All Lexical playground features
- ✅ **Rich Formatting**: Bold, italic, colors, fonts, etc.
- ✅ **Block Types**: Headings, lists, quotes, code blocks
- ✅ **Media Support**: Images, tables, horizontal rules
- ✅ **Interactive**: Mentions, hashtags, emojis
- ✅ **Professional**: Word count, undo/redo, keyboard shortcuts
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Accessible**: Full keyboard and screen reader support

Your RichTextEditor is now a professional-grade editor with all the features you see in the Lexical playground! 🎉
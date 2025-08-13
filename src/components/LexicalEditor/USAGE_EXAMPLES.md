# Comprehensive Rich Text Editor Usage Examples

## 🚀 **Basic Usage**

### Simple Rich Text Editor
```jsx
import RichTextEditor from './components/RichTextEditor';

function BlogEditor() {
  const [content, setContent] = useState('');
  
  const handleChange = (htmlContent, stats) => {
    setContent(htmlContent);
    console.log('Word count:', stats.wordCount);
    console.log('Character count:', stats.charCount);
  };
  
  return (
    <RichTextEditor
      value={content}
      onChange={handleChange}
      placeholder="Write your blog post here..."
      showToolbar={true}
      showWordCount={true}
    />
  );
}
```

## 🎯 **Advanced Configuration**

### Full-Featured Editor
```jsx
function AdvancedEditor() {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('rich');
  
  const handleImageUpload = async (file) => {
    // Upload image to your server
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const { url } = await response.json();
    return url;
  };
  
  const handleError = (error) => {
    console.error('Editor error:', error);
    // Handle error (show notification, etc.)
  };
  
  return (
    <RichTextEditor
      value={content}
      onChange={(content, stats) => setContent(content)}
      mode={mode} // 'rich', 'markdown', 'plain'
      
      // Core Features
      enableImages={true}
      enableTables={true}
      enableHashtags={true}
      enableMentions={true}
      enableEmojis={true}
      enableMarkdown={true}
      enableCodeHighlight={true}
      
      // Advanced Features
      enableCollaboration={false}
      enableDevTools={process.env.NODE_ENV === 'development'}
      
      // UI Options
      showToolbar={true}
      showWordCount={true}
      showDebugView={false}
      
      // Constraints
      maxLength={50000}
      
      // Callbacks
      onImageUpload={handleImageUpload}
      onError={handleError}
      
      // Styling
      placeholder="Start writing your masterpiece..."
      className="my-editor"
      style={{ minHeight: '500px' }}
    />
  );
}
```

## 📝 **Mode-Specific Examples**

### Markdown Mode
```jsx
function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Hello World

This is **bold** text and this is *italic* text.

## Features
- Bullet points
- [Links](https://example.com)
- \`inline code\`

\`\`\`javascript
console.log('Code blocks too!');
\`\`\`
`);
  
  return (
    <RichTextEditor
      mode="markdown"
      value={markdown}
      onChange={(content) => setMarkdown(content)}
      enableMarkdown={true}
      placeholder="Type markdown here..."
    />
  );
}
```

### Plain Text Mode
```jsx
function PlainTextEditor() {
  const [text, setText] = useState('');
  
  return (
    <RichTextEditor
      mode="plain"
      value={text}
      onChange={(content) => setText(content)}
      showToolbar={false}
      placeholder="Simple text editor..."
      maxLength={1000}
    />
  );
}
```

## 🎨 **Customization Examples**

### Custom Styling
```jsx
const customStyles = {
  minHeight: '600px',
  border: '2px solid #0066cc',
  borderRadius: '12px',
  fontFamily: 'Georgia, serif'
};

function StyledEditor() {
  return (
    <RichTextEditor
      style={customStyles}
      className="custom-editor"
      placeholder="Beautifully styled editor..."
    />
  );
}
```

### Read-Only Display
```jsx
function ArticleDisplay({ article }) {
  return (
    <RichTextEditor
      value={article.content}
      readOnly={true}
      showToolbar={false}
      showWordCount={false}
      className="article-display"
    />
  );
}
```

## 🔧 **Integration Examples**

### With Form Libraries (Formik)
```jsx
import { Formik, Form, Field } from 'formik';

function BlogPostForm() {
  return (
    <Formik
      initialValues={{ title: '', content: '' }}
      onSubmit={(values) => {
        console.log('Submitting:', values);
      }}
    >
      {({ setFieldValue, values }) => (
        <Form>
          <Field name="title" placeholder="Post title..." />
          
          <RichTextEditor
            value={values.content}
            onChange={(content) => setFieldValue('content', content)}
            placeholder="Write your post content..."
          />
          
          <button type="submit">Publish Post</button>
        </Form>
      )}
    </Formik>
  );
}
```

### With State Management (Redux)
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { updatePostContent } from './store/postSlice';

function ReduxEditor() {
  const dispatch = useDispatch();
  const content = useSelector(state => state.post.content);
  
  const handleChange = (newContent, stats) => {
    dispatch(updatePostContent({
      content: newContent,
      wordCount: stats.wordCount,
      lastModified: new Date().toISOString()
    }));
  };
  
  return (
    <RichTextEditor
      value={content}
      onChange={handleChange}
      placeholder="Redux-powered editor..."
    />
  );
}
```

## 🚀 **Performance Optimization**

### Debounced Updates
```jsx
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';

function OptimizedEditor() {
  const [content, setContent] = useState('');
  
  // Debounce content updates to reduce API calls
  const debouncedUpdate = useMemo(
    () => debounce((content) => {
      // Save to server
      fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' }
      });
    }, 1000),
    []
  );
  
  const handleChange = useCallback((newContent, stats) => {
    setContent(newContent);
    debouncedUpdate(newContent);
  }, [debouncedUpdate]);
  
  return (
    <RichTextEditor
      value={content}
      onChange={handleChange}
      placeholder="Auto-saving editor..."
    />
  );
}
```

### Lazy Loading
```jsx
import { lazy, Suspense } from 'react';

const RichTextEditor = lazy(() => import('./components/RichTextEditor'));

function LazyEditor() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <RichTextEditor
        placeholder="Lazy-loaded editor..."
      />
    </Suspense>
  );
}
```

## 🎯 **Feature-Specific Examples**

### Image Upload with Progress
```jsx
function ImageEditor() {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadProgress(0);
          resolve(response.url);
        } else {
          reject(new Error('Upload failed'));
        }
      });
      
      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };
  
  return (
    <div>
      {uploadProgress > 0 && (
        <div>Upload Progress: {uploadProgress.toFixed(0)}%</div>
      )}
      <RichTextEditor
        onImageUpload={handleImageUpload}
        enableImages={true}
        placeholder="Drop images here..."
      />
    </div>
  );
}
```

### Collaboration Setup
```jsx
function CollaborativeEditor({ documentId, userId }) {
  const [collaborators, setCollaborators] = useState([]);
  
  useEffect(() => {
    // Set up WebSocket connection for collaboration
    const ws = new WebSocket(`ws://localhost:8080/collab/${documentId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'collaborators') {
        setCollaborators(data.users);
      }
    };
    
    return () => ws.close();
  }, [documentId]);
  
  return (
    <div>
      <div>
        Collaborators: {collaborators.map(user => user.name).join(', ')}
      </div>
      <RichTextEditor
        enableCollaboration={true}
        placeholder="Collaborative editing..."
      />
    </div>
  );
}
```

## 🛠️ **Development & Debugging**

### Debug Mode
```jsx
function DebugEditor() {
  const [debugInfo, setDebugInfo] = useState(null);
  
  const handleChange = (content, stats) => {
    setDebugInfo({
      contentLength: content.length,
      wordCount: stats.wordCount,
      isEmpty: stats.isEmpty,
      timestamp: new Date().toISOString()
    });
  };
  
  return (
    <div>
      <RichTextEditor
        onChange={handleChange}
        enableDevTools={true}
        showDebugView={true}
        placeholder="Debug mode enabled..."
      />
      
      {debugInfo && (
        <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '10px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
}
```

### Error Handling
```jsx
function RobustEditor() {
  const [error, setError] = useState(null);
  
  const handleError = (error) => {
    console.error('Editor error:', error);
    setError(error.message);
    
    // Report to error tracking service
    // errorTracker.captureException(error);
  };
  
  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>
        <h3>Editor Error</h3>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }
  
  return (
    <RichTextEditor
      onError={handleError}
      placeholder="Error-handled editor..."
    />
  );
}
```

## 📱 **Responsive Design**

### Mobile-Optimized Editor
```jsx
function ResponsiveEditor() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <RichTextEditor
      showToolbar={!isMobile} // Hide toolbar on mobile
      style={{
        minHeight: isMobile ? '300px' : '500px',
        fontSize: isMobile ? '16px' : '14px'
      }}
      placeholder={isMobile ? "Tap to write..." : "Click to start writing..."}
    />
  );
}
```

These examples demonstrate the full range of capabilities available in the comprehensive Lexical rich text editor implementation. The editor supports all major Lexical packages and provides extensive customization options for different use cases.
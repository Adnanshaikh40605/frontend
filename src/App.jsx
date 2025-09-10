import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

// Import global CSS variables and base styles
import './styles/globals.css';

// Context Providers
import { BlogProvider } from './context/BlogContext';
import { CommentProvider } from './context/CommentContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts and Route Guards
import Layout from './components/Layout';

// Import pages directly instead of using lazy loading
import HomePage from './pages/HomePage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PostFormPage from './pages/PostFormPage';
import CommentsPage from './pages/CommentsPage';
import BlogListPage from './pages/BlogListPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import LoginPage from './pages/LoginPage';
import SessionTestPage from './pages/SessionTestPage';
import NotFoundPage from './pages/NotFoundPage';
import QuillDocumentationPage from './pages/QuillDocumentationPage';

// Import Protected Route component
import ProtectedRoute from './components/ProtectedRoute';

// Import API test utility (will be available in window.testApi) - only in development
if (import.meta.env.DEV) {
  import('./utils/apiTest');
}

// Global styles - CSS variables are now imported from globals.css
const GlobalStyle = createGlobalStyle`
  /* Additional dynamic styles that complement globals.css */

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    width: 100%;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: var(--font-family-primary);
    line-height: 1.6;
    color: var(--text);
    background-color: var(--bg);
    font-size: 16px;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  a {
    color: var(--accent);
    text-decoration: none;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--accent-hover);
      // text-decoration: underline;
    }
    
    &:focus {
      // outline: 2px solid var(--focus);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }
  }
  
  #root {
    width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block; /* Prevent layout shifts */
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
    color: var(--text);
    margin-bottom: var(--spacing-4);
    font-family: var(--font-family-primary);
    letter-spacing: -0.02em;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  h2 {
    font-size: 2rem;
    
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }
  
  h3 {
    font-size: 1.5rem;
    
    @media (max-width: 768px) {
      font-size: 1.35rem;
    }
  }
  
  h4 {
    font-size: 1.25rem;
  }
  
  h5 {
    font-size: 1.125rem;
  }
  
  h6 {
    font-size: 1rem;
  }

  p {
    margin-bottom: var(--spacing-4);
    color: var(--text);
  }
  
  ul, ol {
    margin-bottom: var(--spacing-4);
    padding-left: var(--spacing-6);
  }
  
  li {
    margin-bottom: var(--spacing-1);
  }
  
  blockquote {
    border-left: 4px solid var(--border-dark);
    padding-left: var(--spacing-4);
    margin: var(--spacing-6) 0;
    font-style: italic;
    color: var(--text-muted);
  }
  
  hr {
    border: 0;
    height: 1px;
    background-color: var(--border);
    margin: var(--spacing-8) 0;
  }
  
  code {
    font-family: var(--font-family-mono);
    background-color: var(--surface);
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
  }
  
  pre {
    background-color: var(--primary);
    color: var(--primary-contrast);
    padding: var(--spacing-4);
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin: var(--spacing-6) 0;
    
    code {
      background-color: transparent;
      padding: 0;
      color: inherit;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--spacing-6) 0;
  }
  
  th, td {
    padding: var(--spacing-2) var(--spacing-4);
    border: 1px solid var(--border);
    text-align: left;
  }
  
  th {
    background-color: var(--surface);
    font-weight: 600;
  }
  
  /* Utility classes */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-4);
    width: 100%;
  }
  
  .page-transition {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Prevent multiple renders visible at the same time */
  .route-container {
    position: relative;
  }

  .route-container > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  
  /* Form elements */
  input, textarea, select {
    font-family: var(--font-family-primary);
    font-size: 1rem;
    padding: var(--spacing-3) var(--spacing-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background-color: var(--bg);
    color: var(--text);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    min-height: 44px;
    
    &:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: var(--shadow-focus);
    }
    
    &:disabled {
      background-color: var(--surface);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
  
  label {
    display: block;
    margin-bottom: var(--spacing-2);
    font-weight: 500;
    color: var(--text);
    font-size: 0.875rem;
  }
  
  /* Buttons already styled in Button component */
  
  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--surface);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--border-dark);
    border-radius: var(--radius-sm);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
  }
`;

const App = () => {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GlobalStyle />
        <AuthProvider>
          <BlogProvider>
            <CommentProvider>
              <Routes>
                {/* Public blog routes - outside Layout to prevent double headers */}
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />

                {/* Auth routes - no layout */}
                <Route path="/login" element={<LoginPage />} />

                {/* Dashboard route - no layout */}
                <Route path="/dashboard" element={<HomePage />} />

                {/* Admin routes with Layout and protection */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />

                  <Route path="admin/posts" element={
                    <ProtectedRoute adminOnly>
                      <PostListPage />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/posts/new" element={
                    <ProtectedRoute adminOnly>
                      <PostFormPage />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/posts/:slug/edit" element={
                    <ProtectedRoute adminOnly>
                      <PostFormPage />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/comments" element={
                    <ProtectedRoute adminOnly>
                      <CommentsPage />
                    </ProtectedRoute>
                  } />

                  {/* Documentation route */}
                  <Route path="docs/quill" element={<QuillDocumentationPage />} />

                  {/* Test route for session expiration */}
                  <Route path="session-test" element={<SessionTestPage />} />

                  {/* Legacy routes for backwards compatibility */}
                  <Route path="posts" element={<Navigate to="/admin/posts" replace />} />
                  <Route path="posts/new" element={<Navigate to="/admin/posts/new" replace />} />
                  <Route path="posts/edit/:slug" element={<Navigate to="/admin/posts/:slug/edit" replace />} />
                  <Route path="posts/:id/edit" element={<Navigate to="/admin/posts/:id/edit" replace />} />
                </Route>

                {/* 404 catch-all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </CommentProvider>
          </BlogProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;

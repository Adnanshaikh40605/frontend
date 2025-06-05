import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  Navigate
} from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

// Context Providers
import { BlogProvider } from './context/BlogContext';
import { CommentProvider } from './context/CommentContext';
import { AuthProvider } from './context/AuthContext';

// Layouts and Route Guards
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

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

// Global styles
const GlobalStyle = createGlobalStyle`
  :root {
    /* Primary Colors */
    --primary-color: #0066cc;
    --primary-light: #e6f2ff;
    --primary-dark: #004c99;
    
    /* Accent Colors */
    --accent-color: #ffcc00;
    --accent-light: #ffe066;
    --accent-dark: #e6b800;
    
    /* Neutral Colors */
    --neutral-100: #ffffff;
    --neutral-200: #f9f9f9;
    --neutral-300: #f1f1f1;
    --neutral-400: #e0e0e0;
    --neutral-500: #c2c2c2;
    --neutral-600: #9e9e9e;
    --neutral-700: #757575;
    --neutral-800: #424242;
    --neutral-900: #212121;
    
    /* Semantic Colors */
    --success: #28a745;
    --warning: #ffc107;
    --error: #dc3545;
    --info: #17a2b8;
    
    /* Typography */
    --font-primary: 'Lexend', sans-serif;
    --font-secondary: 'Inter', sans-serif;
    
    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-xxl: 3rem;
    
    /* Borders */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --border-radius-xl: 16px;
    --border-radius-round: 50%;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  }

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
    font-family: var(--font-primary), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: var(--neutral-800);
    background-color: var(--neutral-200);
    font-size: 16px;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s ease, background-color 0.2s ease;
    
    &:hover {
      color: var(--primary-dark);
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
    line-height: 1.3;
    color: var(--neutral-900);
    margin-bottom: var(--space-md);
    font-family: var(--font-primary);
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
    margin-bottom: var(--space-md);
    color: var(--neutral-800);
  }
  
  ul, ol {
    margin-bottom: var(--space-md);
    padding-left: var(--space-lg);
  }
  
  li {
    margin-bottom: var(--space-xs);
  }
  
  blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: var(--space-md);
    margin: var(--space-lg) 0;
    font-style: italic;
    color: var(--neutral-700);
  }
  
  hr {
    border: 0;
    height: 1px;
    background-color: var(--neutral-300);
    margin: var(--space-xl) 0;
  }
  
  code {
    font-family: 'Courier New', Courier, monospace;
    background-color: var(--neutral-300);
    padding: 0.2em 0.4em;
    border-radius: var(--border-radius-sm);
    font-size: 0.9em;
  }
  
  pre {
    background-color: var(--neutral-800);
    color: var(--neutral-200);
    padding: var(--space-md);
    border-radius: var(--border-radius-md);
    overflow-x: auto;
    margin: var(--space-lg) 0;
    
    code {
      background-color: transparent;
      padding: 0;
      color: inherit;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: var(--space-lg) 0;
  }
  
  th, td {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--neutral-400);
    text-align: left;
  }
  
  th {
    background-color: var(--neutral-300);
    font-weight: 600;
  }
  
  /* Utility classes */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-md);
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
    font-family: var(--font-primary);
    font-size: 1rem;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--neutral-400);
    border-radius: var(--border-radius-md);
    background-color: var(--neutral-100);
    transition: border-color 0.2s, box-shadow 0.2s;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
    }
  }
  
  label {
    display: block;
    margin-bottom: var(--space-xs);
    font-weight: 500;
    color: var(--neutral-800);
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
    background: var(--neutral-200);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--neutral-500);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--neutral-600);
  }
`;

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GlobalStyle />
      <AuthProvider>
        <BlogProvider>
          <CommentProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected and public routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                
                {/* Admin routes - protected */}
                <Route path="admin" element={<ProtectedRoute />}>
                  <Route path="posts" element={<PostListPage />} />
                  <Route path="posts/new" element={<PostFormPage />} />
                  <Route path="posts/:slug/edit" element={<PostFormPage />} />
                  <Route path="comments" element={<CommentsPage />} />
                </Route>
                
                {/* Public blog routes */}
                <Route path="blog" element={<BlogListPage />} />
                <Route path="blog/:slug" element={<BlogPostPage />} />
                
                {/* Legacy routes for backwards compatibility */}
                <Route path="posts">
                  <Route index element={<Navigate to="/admin/posts" replace />} />
                  <Route path="new" element={<Navigate to="/admin/posts/new" replace />} />
                  <Route path="edit/:slug" element={
                    <ProtectedRoute>
                      <PostFormPage />
                    </ProtectedRoute>
                  } />
                  {/* Add compatibility for old ID-based routes */}
                  <Route path=":id/edit" element={
                    <ProtectedRoute>
                      <PostFormPage />
                    </ProtectedRoute>
                  } />
                </Route>
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CommentProvider>
        </BlogProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

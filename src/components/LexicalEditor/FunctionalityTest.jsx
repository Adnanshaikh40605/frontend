import React, { useState, useCallback } from 'react';
import RichTextEditor from '../RichTextEditor';
import styled from 'styled-components';

const TestContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const TestSection = styled.div`
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
`;

const TestTitle = styled.h2`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.5rem;
`;

const TestDescription = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 1rem;
`;

const OutputContainer = styled.div`
  background: #fff;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
`;

const OutputTitle = styled.h4`
  color: #333;
  margin-bottom: 10px;
  font-size: 1rem;
`;

const OutputContent = styled.pre`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  color: #333;
  margin: 0;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 10px 15px;
  min-width: 80px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.2em;
  font-weight: 600;
  color: #0066cc;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 0.8em;
  color: #666;
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const ModeButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #0066cc;
  background: ${props => props.$active ? '#0066cc' : 'white'};
  color: ${props => props.$active ? 'white' : '#0066cc'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#f0f8ff'};
  }
`;

const FeatureToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  
  input {
    margin: 0;
  }
`;

const FeatureToggles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e1e5e9;
`;

const FunctionalityTest = () => {
  // Test states
  const [richContent, setRichContent] = useState(`
    <h1>Rich Text Editor Test</h1>
    <p>This is a <strong>comprehensive test</strong> of all <em>Lexical features</em>.</p>
    <h2>Features to Test:</h2>
    <ul>
      <li><strong>Bold</strong> and <em>italic</em> text</li>
      <li><u>Underlined</u> and <s>strikethrough</s> text</li>
      <li><code>Inline code</code> formatting</li>
      <li>Links and hashtags</li>
    </ul>
    <blockquote>
      This is a blockquote to test quote formatting.
    </blockquote>
    <p>Try typing <strong>#hashtag</strong> or <strong>@mention</strong> to test social features!</p>
  `);
  
  const [markdownContent, setMarkdownContent] = useState(`# Markdown Test

This is **bold** text and this is *italic* text.

## Features
- Bullet points
- [Links](https://example.com)
- \`inline code\`

> This is a blockquote

\`\`\`javascript
console.log('Code blocks!');
\`\`\`
`);
  
  const [plainContent, setPlainContent] = useState('This is plain text content for testing the plain text mode.');
  
  const [currentMode, setCurrentMode] = useState('rich');
  const [stats, setStats] = useState({});
  
  // Feature toggles
  const [features, setFeatures] = useState({
    enableImages: true,
    enableTables: true,
    enableHashtags: true,
    enableMentions: true,
    enableEmojis: true,
    enableMarkdown: true,
    enableCodeHighlight: true,
    enableCollaboration: false,
    enableDevTools: true,
    showToolbar: true,
    showWordCount: true,
    showDebugView: false
  });
  
  const handleFeatureToggle = (feature) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };
  
  const handleRichChange = useCallback((content, editorStats) => {
    setRichContent(content);
    setStats(editorStats);
  }, []);
  
  const handleMarkdownChange = useCallback((content, editorStats) => {
    setMarkdownContent(content);
    setStats(editorStats);
  }, []);
  
  const handlePlainChange = useCallback((content, editorStats) => {
    setPlainContent(content);
    setStats(editorStats);
  }, []);
  
  const handleImageUpload = useCallback(async (file) => {
    console.log('Image upload requested:', file.name);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return object URL for preview
    return URL.createObjectURL(file);
  }, []);
  
  const handleError = useCallback((error) => {
    console.error('Editor error:', error);
    alert(`Editor Error: ${error.message}`);
  }, []);
  
  const getCurrentContent = () => {
    switch (currentMode) {
      case 'markdown': return markdownContent;
      case 'plain': return plainContent;
      default: return richContent;
    }
  };
  
  const getCurrentHandler = () => {
    switch (currentMode) {
      case 'markdown': return handleMarkdownChange;
      case 'plain': return handlePlainChange;
      default: return handleRichChange;
    }
  };

  return (
    <TestContainer>
      <h1>Comprehensive Lexical Rich Text Editor Test</h1>
      <p>This page tests all implemented Lexical packages and features.</p>
      
      <TestSection>
        <TestTitle>Feature Configuration</TestTitle>
        <TestDescription>
          Toggle features on/off to test different configurations:
        </TestDescription>
        
        <FeatureToggles>
          {Object.entries(features).map(([feature, enabled]) => (
            <FeatureToggle key={feature}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handleFeatureToggle(feature)}
              />
              <span>{feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
            </FeatureToggle>
          ))}
        </FeatureToggles>
      </TestSection>
      
      <TestSection>
        <TestTitle>Editor Mode Test</TestTitle>
        <TestDescription>
          Test different editor modes (Rich Text, Markdown, Plain Text):
        </TestDescription>
        
        <ModeSelector>
          <ModeButton 
            $active={currentMode === 'rich'} 
            onClick={() => setCurrentMode('rich')}
          >
            Rich Text Mode
          </ModeButton>
          <ModeButton 
            $active={currentMode === 'markdown'} 
            onClick={() => setCurrentMode('markdown')}
          >
            Markdown Mode
          </ModeButton>
          <ModeButton 
            $active={currentMode === 'plain'} 
            onClick={() => setCurrentMode('plain')}
          >
            Plain Text Mode
          </ModeButton>
        </ModeSelector>
        
        <RichTextEditor
          value={getCurrentContent()}
          onChange={getCurrentHandler()}
          mode={currentMode}
          onImageUpload={handleImageUpload}
          onError={handleError}
          placeholder={`Type in ${currentMode} mode...`}
          maxLength={10000}
          {...features}
        />
        
        <StatsContainer>
          <StatCard>
            <StatValue>{stats.wordCount || 0}</StatValue>
            <StatLabel>Words</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.charCount || 0}</StatValue>
            <StatLabel>Characters</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.isEmpty ? 'Yes' : 'No'}</StatValue>
            <StatLabel>Empty</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{currentMode}</StatValue>
            <StatLabel>Mode</StatLabel>
          </StatCard>
        </StatsContainer>
        
        <OutputContainer>
          <OutputTitle>Generated Content ({currentMode} mode):</OutputTitle>
          <OutputContent>{getCurrentContent()}</OutputContent>
        </OutputContainer>
      </TestSection>
      
      <TestSection>
        <TestTitle>Feature Testing Instructions</TestTitle>
        <TestDescription>
          Test these features in the editor above:
        </TestDescription>
        
        <div style={{ background: 'white', padding: '15px', borderRadius: '4px' }}>
          <h4>Text Formatting:</h4>
          <ul>
            <li>Select text and use toolbar buttons for <strong>bold</strong>, <em>italic</em>, <u>underline</u></li>
            <li>Try keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)</li>
            <li>Test subscript and superscript formatting</li>
            <li>Use inline code formatting with backticks</li>
          </ul>
          
          <h4>Block Elements:</h4>
          <ul>
            <li>Create headings using the dropdown (H1-H6)</li>
            <li>Insert blockquotes using the toolbar</li>
            <li>Create bulleted and numbered lists</li>
            <li>Try interactive checklists</li>
          </ul>
          
          <h4>Advanced Features:</h4>
          <ul>
            <li>Insert links using the link button or Ctrl+K</li>
            <li>Type #hashtag to create hashtags</li>
            <li>Type @username to create mentions</li>
            <li>Use the emoji picker button</li>
            <li>Insert tables using the table button</li>
            <li>Drag and drop images (if enabled)</li>
          </ul>
          
          <h4>Markdown Mode:</h4>
          <ul>
            <li>Type # for headings</li>
            <li>Use **bold** and *italic* syntax</li>
            <li>Create lists with - or 1.</li>
            <li>Use > for blockquotes</li>
            <li>Use ``` for code blocks</li>
          </ul>
        </div>
      </TestSection>
    </TestContainer>
  );
};

export default FunctionalityTest;
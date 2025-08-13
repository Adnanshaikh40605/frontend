import React, { useState, useCallback } from 'react';
import AdvancedLexicalEditor from './AdvancedLexicalEditor';
import styled from 'styled-components';

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const DemoHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const DemoTitle = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5em;
  font-weight: 300;
`;

const DemoSubtitle = styled.p`
  color: #666;
  font-size: 1.2em;
  margin-bottom: 20px;
`;

const FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
`;

const FeatureTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1em;
`;

const FeatureDescription = styled.p`
  color: #666;
  font-size: 0.9em;
  line-height: 1.5;
  margin: 0;
`;

const EditorSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
  font-weight: 400;
`;

const OutputSection = styled.div`
  margin-top: 30px;
`;

const OutputTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2em;
`;

const OutputContent = styled.pre`
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 15px;
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 15px;
  min-width: 120px;
`;

const StatValue = styled.div`
  font-size: 1.5em;
  font-weight: 600;
  color: #0066cc;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9em;
  color: #666;
`;

const initialContent = `
<h1>Welcome to the Advanced Lexical Editor!</h1>
<p>This is a comprehensive rich text editor built with Lexical. Try out all the features:</p>

<h2>Text Formatting</h2>
<p>You can make text <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, <s>strikethrough</s>, or even <code>inline code</code>.</p>
<p>You can also use <sub>subscript</sub> and <sup>superscript</sup> formatting.</p>

<h2>Lists</h2>
<ul>
  <li>Bulleted lists</li>
  <li>With multiple items</li>
  <li>And nested support</li>
</ul>

<ol>
  <li>Numbered lists</li>
  <li>Are also supported</li>
  <li>With proper numbering</li>
</ol>

<h2>Quotes</h2>
<blockquote>
  This is a quote block. Perfect for highlighting important text or citations.
</blockquote>

<h2>Code Blocks</h2>
<pre><code>function hello() {
  console.log("Hello, World!");
  return "Welcome to Lexical!";
}</code></pre>

<h2>Links and More</h2>
<p>You can add <a href="https://lexical.dev">links</a>, use @mentions, #hashtags, and even 😀 emojis!</p>

<p>Try the toolbar above to explore all features including tables, images, and more formatting options.</p>
`;

const LexicalEditorDemo = () => {
  const [content, setContent] = useState(initialContent);
  const [stats, setStats] = useState({
    wordCount: 0,
    charCount: 0,
    isEmpty: true
  });

  const handleChange = useCallback((htmlContent, editorStats) => {
    setContent(htmlContent);
    setStats(editorStats);
  }, []);

  const handleImageUpload = useCallback(async (file) => {
    // Simulate image upload
    return new Promise((resolve) => {
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        resolve(imageUrl);
      }, 1000);
    });
  }, []);

  const features = [
    {
      title: "Rich Text Formatting",
      description: "Bold, italic, underline, strikethrough, subscript, superscript, and inline code formatting."
    },
    {
      title: "Font Controls",
      description: "Font family selection, font size controls with +/- buttons, and color customization."
    },
    {
      title: "Block Types",
      description: "Headings (H1-H6), paragraphs, quotes, code blocks, and various list types."
    },
    {
      title: "Lists & Checklists",
      description: "Bulleted lists, numbered lists, and interactive checklists with proper nesting."
    },
    {
      title: "Tables",
      description: "Insert and edit tables with headers, proper styling, and cell navigation."
    },
    {
      title: "Links & Media",
      description: "Link insertion with floating editor, image uploads, and horizontal rules."
    },
    {
      title: "Special Content",
      description: "@mentions, #hashtags, 😀 emojis, and date insertion with autocomplete."
    },
    {
      title: "Advanced Features",
      description: "Text alignment, indentation, clear formatting, debug view, and export functionality."
    }
  ];

  return (
    <DemoContainer>
      <DemoHeader>
        <DemoTitle>Advanced Lexical Editor</DemoTitle>
        <DemoSubtitle>
          A comprehensive rich text editor with all the features you need
        </DemoSubtitle>
      </DemoHeader>

      <FeatureList>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeatureList>

      <EditorSection>
        <SectionTitle>Try the Editor</SectionTitle>
        
        <StatsContainer>
          <StatCard>
            <StatValue>{stats.wordCount}</StatValue>
            <StatLabel>Words</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.charCount}</StatValue>
            <StatLabel>Characters</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.isEmpty ? 'Empty' : 'Content'}</StatValue>
            <StatLabel>Status</StatLabel>
          </StatCard>
        </StatsContainer>

        <AdvancedLexicalEditor
          initialValue={initialContent}
          onChange={handleChange}
          onImageUpload={handleImageUpload}
          placeholder="Start typing to explore all the features..."
          autoFocus={false}
          showToolbar={true}
          showWordCount={true}
          showDebugView={true}
          enableImages={true}
          enableTables={true}
          enableHashtags={true}
          enableMentions={true}
          enableEmojis={true}
          maxLength={10000}
          style={{ minHeight: '500px' }}
        />
      </EditorSection>

      <OutputSection>
        <OutputTitle>Generated HTML Output</OutputTitle>
        <OutputContent>{content}</OutputContent>
      </OutputSection>
    </DemoContainer>
  );
};

export default LexicalEditorDemo;
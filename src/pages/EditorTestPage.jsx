import React, { useState } from 'react';
import styled from 'styled-components';
import RichTextEditor from '../components/RichTextEditor';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  color: #333;
`;

const OutputContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
`;

const OutputTitle = styled.h3`
  margin-bottom: 1rem;
  color: #666;
`;

const OutputContent = styled.pre`
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  white-space: pre-wrap;
`;

const EditorTestPage = () => {
  const [content, setContent] = useState('<p>Start typing to test the Lexical editor...</p>');

  const handleChange = (newContent) => {
    setContent(newContent);
  };

  const handleImageUpload = async (file) => {
    // Mock image upload - in real app this would upload to server
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Container>
      <Title>Lexical Editor Test</Title>
      
      <RichTextEditor
        value={content}
        onChange={handleChange}
        placeholder="Start writing with the new Lexical editor..."
        onImageUpload={handleImageUpload}
        enableImages={true}
        enableTables={true}
        enableMarkdown={true}
        enableCodeHighlight={true}
        showWordCount={true}
        autoFocus={false}
      />
      
      <OutputContainer>
        <OutputTitle>Generated HTML Output:</OutputTitle>
        <OutputContent>{content}</OutputContent>
      </OutputContainer>
    </Container>
  );
};

export default EditorTestPage;
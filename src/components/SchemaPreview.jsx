import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SchemaContainer = styled.div`
  margin: var(--spacing-6) 0;
  padding: var(--spacing-4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
`;

const SchemaTitle = styled.h3`
  color: var(--text);
  margin-bottom: var(--spacing-4);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const SchemaCode = styled.pre`
  background-color: var(--primary);
  color: var(--primary-contrast);
  padding: var(--spacing-4);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ToggleButton = styled.button`
  background: var(--accent);
  color: white;
  border: none;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
  transition: var(--transition-smooth);
  
  &:hover {
    background: var(--accent-hover);
  }
`;

const SchemaInfo = styled.div`
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--success-light);
  border: 1px solid var(--success-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--success-dark);
`;

const ErrorInfo = styled.div`
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--danger-light);
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--danger-dark);
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  color: var(--text-muted);
`;

const SchemaPreview = ({ postSlug, showByDefault = false }) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(showByDefault);

  const fetchSchema = async () => {
    if (!postSlug) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postSlug}/schema/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.statusText}`);
      }

      const data = await response.json();
      setSchema(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && postSlug) {
      fetchSchema();
    }
  }, [isVisible, postSlug]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Schema copied to clipboard');
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  const validateSchema = (schemaString) => {
    try {
      const parsed = JSON.parse(schemaString);
      const requiredFields = ['@context', '@type', '@id', 'mainEntityOfPage', 'headline', 'description'];
      const missingFields = requiredFields.filter(field => !parsed[field]);
      
      return {
        isValid: missingFields.length === 0,
        missingFields,
        fieldCount: Object.keys(parsed).length
      };
    } catch (err) {
      return {
        isValid: false,
        error: 'Invalid JSON format'
      };
    }
  };

  if (!postSlug) {
    return (
      <SchemaContainer>
        <SchemaTitle>📋 JSON-LD Schema Preview</SchemaTitle>
        <ErrorInfo>No post slug provided for schema generation.</ErrorInfo>
      </SchemaContainer>
    );
  }

  return (
    <SchemaContainer>
      <SchemaTitle>
        📋 JSON-LD Schema Preview
        <ToggleButton onClick={toggleVisibility}>
          {isVisible ? 'Hide Schema' : 'Show Schema'}
        </ToggleButton>
      </SchemaTitle>

      {isVisible && (
        <>
          {loading && (
            <LoadingSpinner>
              Loading schema...
            </LoadingSpinner>
          )}

          {error && (
            <ErrorInfo>
              <strong>Error:</strong> {error}
            </ErrorInfo>
          )}

          {schema && (
            <>
              {(() => {
                const validation = validateSchema(schema.schema);
                return validation.isValid ? (
                  <SchemaInfo>
                    ✅ <strong>Valid Schema:</strong> {validation.fieldCount} fields present. 
                    Ready for search engines!
                  </SchemaInfo>
                ) : (
                  <ErrorInfo>
                    ❌ <strong>Schema Issues:</strong> {validation.error || `Missing fields: ${validation.missingFields.join(', ')}`}
                  </ErrorInfo>
                );
              })()}

              <div style={{ marginBottom: 'var(--spacing-3)' }}>
                <ToggleButton 
                  onClick={() => copyToClipboard(schema.script_tag)}
                  style={{ marginRight: 'var(--spacing-2)' }}
                >
                  📋 Copy Script Tag
                </ToggleButton>
                <ToggleButton onClick={() => copyToClipboard(schema.schema)}>
                  📋 Copy JSON-LD
                </ToggleButton>
              </div>

              <SchemaCode>
                {schema.script_tag}
              </SchemaCode>

              <div style={{ marginTop: 'var(--spacing-4)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Testing URLs:</strong>
                <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)' }}>
                  <li>
                    <a 
                      href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(window.location.origin + '/blog/' + postSlug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Rich Results Test
                    </a>
                  </li>
                  <li>
                    <a 
                      href={`https://validator.schema.org/#url=${encodeURIComponent(window.location.origin + '/blog/' + postSlug)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Schema.org Validator
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </SchemaContainer>
  );
};

export default SchemaPreview;
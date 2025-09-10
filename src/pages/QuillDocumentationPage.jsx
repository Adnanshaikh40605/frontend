import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';

const DocumentationContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-8);
  background-color: var(--bg);
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-12);
  padding: var(--spacing-8) 0;
  border-bottom: 2px solid var(--border-color);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  
  &::before {
    content: "📘";
    font-size: 2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    flex-direction: column;
    gap: var(--spacing-2);
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-muted);
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: var(--spacing-10);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text);
  margin-bottom: var(--spacing-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  
  &::before {
    content: "${props => props.icon || '🔧'}";
    font-size: 1.2rem;
  }
`;

const CodeBlock = styled.pre`
  background-color: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  overflow-x: auto;
  font-family: var(--font-family-mono);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: var(--spacing-4) 0;
  
  code {
    background: none;
    padding: 0;
    color: inherit;
  }
`;

const InlineCode = styled.code`
  background-color: var(--surface-light);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--font-family-mono);
  font-size: 0.9em;
  color: var(--primary);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: var(--spacing-4) 0;
  
  li {
    padding: var(--spacing-2) 0;
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-2);
    
    &::before {
      content: "✅";
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
`;

const InfoBox = styled.div`
  background-color: var(--surface-light);
  border-left: 4px solid var(--primary);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  
  p {
    margin: 0;
    color: var(--text);
  }
`;

const StepNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--primary);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.8rem;
  margin-right: var(--spacing-2);
`;

const QuillDocumentationPage = () => {
  return (
    <DocumentationContainer>
      <Helmet>
        <title>Quill Rich Text Editor Documentation - Blog CMS</title>
        <meta name="description" content="Complete documentation for implementing Quill Rich Text Editor in React + Django Blog CMS" />
      </Helmet>

      <Header>
        <Title>Quill Rich Text Editor – Documentation</Title>
        <Subtitle>for React + Django Blog</Subtitle>
      </Header>

      <Section>
        <SectionTitle icon="🔧">Installation</SectionTitle>
        <p><strong>In React (Frontend)</strong></p>
        <CodeBlock>
          <code>{`npm install quill react-quill`}</code>
        </CodeBlock>
        <p>
          <InlineCode>quill</InlineCode> → core library<br/>
          <InlineCode>react-quill</InlineCode> → React wrapper for Quill
        </p>
        <p>Import CSS in your component:</p>
        <CodeBlock>
          <code>{`import 'react-quill/dist/quill.snow.css';`}</code>
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle icon="🖊️">Basic Usage (React Component)</SectionTitle>
        <CodeBlock>
          <code>{`import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogEditor = () => {
  const [content, setContent] = useState('');

  return (
    <ReactQuill
      theme="snow"
      value={content}
      onChange={setContent}
      placeholder="Write your blog post content here..."
    />
  );
};`}</code>
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle icon="🎛️">Toolbar & Features (Modules & Formats)</SectionTitle>
        <p>Quill is modular and customizable. Example:</p>
        <CodeBlock>
          <code>{`const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image", "video"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "link", "image", "video"
];

<ReactQuill
  theme="snow"
  value={content}
  onChange={setContent}
  modules={modules}
  formats={formats}
/>`}</code>
        </CodeBlock>
        <FeatureList>
          <li>Headings, Bold/Italic, Lists, Links, Images, Videos</li>
        </FeatureList>
      </Section>

      <Section>
        <SectionTitle icon="🔗">Sending Data to Django (Backend)</SectionTitle>
        <p>When you submit the blog form:</p>
        <InfoBox>
          <p>The Quill content is HTML (or Delta JSON if you prefer structured data).<br/>
          Send it via API (Django REST Framework).</p>
        </InfoBox>
        <p><strong>Example (React)</strong></p>
        <CodeBlock>
          <code>{`const handleSubmit = async () => {
  const response = await fetch("http://127.0.0.1:8000/api/posts/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "My Blog", content }),
  });
  if (response.ok) {
    alert("Blog saved!");
  }
};`}</code>
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle icon="🛠️">Django API (Backend)</SectionTitle>
        
        <p><strong>models.py</strong></p>
        <CodeBlock>
          <code>{`from django.db import models

class Blog(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()  # stores Quill HTML
    created_at = models.DateTimeField(auto_now_add=True)`}</code>
        </CodeBlock>

        <p><strong>serializers.py</strong></p>
        <CodeBlock>
          <code>{`from rest_framework import serializers
from .models import Blog

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'`}</code>
        </CodeBlock>

        <p><strong>views.py</strong></p>
        <CodeBlock>
          <code>{`from rest_framework import viewsets
from .models import Blog
from .serializers import BlogSerializer

class BlogViewSet(viewsets.ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer`}</code>
        </CodeBlock>

        <p><strong>urls.py</strong></p>
        <CodeBlock>
          <code>{`from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogViewSet

router = DefaultRouter()
router.register(r'blogs', BlogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]`}</code>
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle icon="🖼️">Handling Images & Uploads</SectionTitle>
        <p>Quill supports base64 images by default but best practice is uploading to backend or cloud.</p>
        <p><strong>Use ImageHandler to upload to Django:</strong></p>
        <CodeBlock>
          <code>{`const modules = {
  toolbar: {
    container: [...],
    handlers: {
      image: function () {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          const formData = new FormData();
          formData.append("image", file);

          const res = await fetch("http://127.0.0.1:8000/api/upload/quill/", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          const range = this.quill.getSelection();
          this.quill.insertEmbed(range.index, "image", data.url);
        };
      },
    },
  },
};`}</code>
        </CodeBlock>

        <p><strong>Django view for upload:</strong></p>
        <CodeBlock>
          <code>{`from django.core.files.storage import FileSystemStorage
from rest_framework.views import APIView
from rest_framework.response import Response

class UploadImage(APIView):
    def post(self, request, *args, **kwargs):
        file = request.FILES['image']
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_url = fs.url(filename)
        return Response({"url": file_url})`}</code>
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle icon="✅">Best Practices</SectionTitle>
        <FeatureList>
          <li><strong>Sanitize input</strong> → Use bleach or similar to prevent XSS in Django.</li>
          <li><strong>Save HTML in DB</strong> (easy rendering) or Delta JSON (structured editing).</li>
          <li><strong>Limit toolbar</strong> → Only allow necessary features.</li>
          <li><strong>Autosave drafts</strong> → Store in localStorage while typing.</li>
          <li><strong>SEO considerations</strong> → Render HTML safely on frontend.</li>
        </FeatureList>

        <p><strong>Sanitization Example:</strong></p>
        <CodeBlock>
          <code>{`pip install bleach

import bleach
blog.content = bleach.clean(content, tags=['p','b','i','u','a','img','h1','h2','h3'])`}</code>
        </CodeBlock>
      </Section>

      <Section>
        <SectionTitle icon="🔗">References</SectionTitle>
        <FeatureList>
          <li><a href="https://quilljs.com/docs/quickstart/" target="_blank" rel="noopener noreferrer">Quill Quickstart Docs</a></li>
          <li><a href="https://github.com/zenoamaro/react-quill" target="_blank" rel="noopener noreferrer">React-Quill GitHub</a></li>
          <li><a href="https://www.django-rest-framework.org/" target="_blank" rel="noopener noreferrer">Django REST Framework</a></li>
        </FeatureList>
      </Section>
    </DocumentationContainer>
  );
};

export default QuillDocumentationPage;
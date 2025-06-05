// apiMocks.js - Contains mock data for development fallback

// Mock posts data
export const mockPosts = [
  {
    id: 1,
    title: "Sample Blog Post 1",
    content: "<p>This is a sample blog post for development.</p>",
    featured_image: null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  },
  {
    id: 2,
    title: "Sample Blog Post 2",
    content: "<p>This is another sample blog post for development.</p>",
    featured_image: null,
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  }
];

// Mock comments data
export const mockComments = {
  approved: [
    {
      id: 1,
      post: 1,
      name: "John Doe",
      email: "john@example.com",
      content: "Great article!",
      approved: true,
      created_at: new Date().toISOString()
    }
  ],
  pending: [
    {
      id: 2,
      post: 1,
      name: "Jane Smith",
      email: "jane@example.com",
      content: "I have a question about this topic.",
      approved: false,
      created_at: new Date().toISOString()
    }
  ]
};

// Helper for mock image uploads
export const createLocalImageUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}; 
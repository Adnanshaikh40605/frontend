/**
 * Extracts headings from HTML content and generates a table of contents
 */

/**
 * Generates a TOC object from HTML content
 * @param {string} htmlContent - The HTML content to parse
 * @returns {Array} - Array of heading objects with id, text, level, and children
 */
export const generateTableOfContents = (htmlContent) => {
  if (!htmlContent) return [];
  
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Find all heading elements (h1-h6)
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  // Early return if no headings found
  if (headings.length === 0) return [];
  
  // Create heading objects with necessary properties
  const headingObjects = Array.from(headings).map((heading, index) => {
    // Extract heading level (1-6)
    const level = parseInt(heading.tagName.substring(1));
    
    // Get or create an ID for the heading
    let id = heading.id;
    if (!id) {
      // Generate a slug from the heading text
      id = generateSlug(heading.textContent.trim()) + '-' + index;
      // Add the ID to the original heading element (helps with anchor links)
      heading.id = id;
    }
    
    return {
      id,
      text: heading.textContent.trim(),
      level,
      children: []
    };
  });
  
  // Now build a hierarchical TOC structure
  return buildTocHierarchy(headingObjects);
};

/**
 * Builds a hierarchical TOC structure from flat heading objects
 * @param {Array} headings - Array of heading objects
 * @returns {Array} - Nested array of heading objects
 */
const buildTocHierarchy = (headings) => {
  if (!headings.length) return [];
  
  // Find the minimum heading level to start our hierarchy
  const minLevel = Math.min(...headings.map(h => h.level));
  
  // Root array for our TOC
  const result = [];
  
  // Stack to keep track of the current parent at each level
  const stack = [{ level: minLevel - 1, children: result }];
  
  // Process each heading to build the hierarchy
  headings.forEach(heading => {
    // Pop stack items until we find a parent with a lower level
    while (stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    
    // Current parent is the last item in the stack
    const parent = stack[stack.length - 1];
    
    // Add current heading to its parent's children
    parent.children.push(heading);
    
    // Add current heading to the stack
    stack.push(heading);
  });
  
  return result;
};

/**
 * Generates a URL-friendly slug from text
 * @param {string} text - The text to slugify
 * @returns {string} - The generated slug
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
    .trim();
};

/**
 * Renders TOC as HTML
 * @param {Array} tocItems - Hierarchical TOC structure
 * @param {object} options - Rendering options
 * @returns {string} - HTML string of the TOC
 */
export const renderTocHtml = (tocItems, options = {}) => {
  const { 
    listType = 'ol',  // ol or ul
    maxDepth = 3,     // Maximum heading level to include
    title = 'Table of Contents',
    className = ''    // Optional custom class for different TOC placements
  } = options;
  
  if (!tocItems || !tocItems.length) return '';
  
  // Start building the HTML
  let html = `<div class="table-of-contents${className ? ' ' + className : ''}">`;
  
  // Add title if provided
  if (title) {
    html += `<h4>${title}</h4>`;
  }
  
  // Recursive function to build nested lists
  const buildTocList = (items, depth = 1) => {
    if (!items.length || depth > maxDepth) return '';
    
    let listHtml = `<${listType} class="toc-list toc-level-${depth}">`;
    
    items.forEach(item => {
      listHtml += `<li class="toc-item toc-level-${item.level}">`;
      listHtml += `<a href="#${item.id}" class="toc-link">${item.text}</a>`;
      
      // Recursively add children
      if (item.children && item.children.length) {
        listHtml += buildTocList(item.children, depth + 1);
      }
      
      listHtml += `</li>`;
    });
    
    listHtml += `</${listType}>`;
    return listHtml;
  };
  
  // Build the TOC structure
  html += buildTocList(tocItems);
  html += `</div>`;
  
  return html;
};

/**
 * Add IDs to all headings in HTML content if they don't already have one
 * @param {string} htmlContent - The HTML content
 * @returns {string} - Updated HTML with heading IDs
 */
export const addHeadingIds = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Find all heading elements (h1-h6)
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  // Process each heading
  headings.forEach((heading, index) => {
    // Skip if heading already has an ID
    if (heading.id) return;
    
    // Generate a slug from the heading text
    const id = generateSlug(heading.textContent.trim()) + '-' + index;
    heading.id = id;
  });
  
  // Return the updated HTML
  return tempDiv.innerHTML;
};

/**
 * Makes heading IDs clickable for easier sharing
 * @param {HTMLElement} container - The container with headings
 */
export const makeHeadingsClickable = (container) => {
  if (!container) return;
  
  // Find all headings with IDs
  const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
  
  headings.forEach(heading => {
    // Make the heading ID clickable
    heading.style.cursor = 'pointer';
    
    // Add click event listener
    heading.addEventListener('click', (e) => {
      // Create the URL with hash
      const url = new URL(window.location.href);
      url.hash = heading.id;
      
      // Copy to clipboard
      navigator.clipboard.writeText(url.toString())
        .then(() => {
          // Show a success tooltip or message
          const originalTitle = heading.getAttribute('title') || '';
          heading.setAttribute('title', 'Link copied!');
          heading.classList.add('copied');
          
          // Reset after a delay
          setTimeout(() => {
            if (originalTitle) {
              heading.setAttribute('title', originalTitle);
            } else {
              heading.removeAttribute('title');
            }
            heading.classList.remove('copied');
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
        });
      
      // Prevent default behavior if clicked on the heading itself
      e.preventDefault();
    });
    
    // Add title for better UX
    if (!heading.getAttribute('title')) {
      heading.setAttribute('title', 'Click to copy link to this section');
    }
  });
}; 
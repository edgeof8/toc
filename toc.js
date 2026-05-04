/**
 * toc - Table of Contents Generator Bookmarklet
 * Version: 0.2
 * Description: Generates a beautiful standalone Table of Contents page from the current webpage's headings.
 */

// Import shared utilities
const edgeUtilsScript = document.createElement('script');
edgeUtilsScript.src = chrome.runtime.getURL('edge-utils.js');
document.head.appendChild(edgeUtilsScript);

(function () {
  'use strict';

  // Configuration
  const config = {
    tocTitle: 'Table of Contents',
    copyAsMarkdownLabel: 'Copy as Markdown',
    noHeadingsMessage: 'No headings found on this page.',
    maxHeadingLevel: 6,
    // Styles for the generated TOC page
    styles: `
      :root {
        --bg-color: #ffffff;
        --text-color: #222222;
        --link-color: #0066cc;
        --link-hover-color: #0052a3;
        --border-color: #e0e0e0;
        --header-bg: #f8f9fa;
        --shadow: 0 2px 8px rgba(0,0,0,0.1);
        --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-color: #1e1e1e;
          --text-color: #f0f0f0;
          --link-color: #4da6ff;
          --link-hover-color: #80bfff;
          --border-color: #444444;
          --header-bg: #2d2d2d;
        }
      }
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: var(--font-family);
        background-color: var(--bg-color);
        color: var(--text-color);
        line-height: 1.6;
        padding: 20px;
      }
      header {
        background-color: var(--header-bg);
        border-bottom: 1px solid var(--border-color);
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: var(--shadow);
      }
      h1 {
        font-size: 1.8em;
        margin-bottom: 10px;
      }
      .actions {
        margin-top: 15px;
      }
      button {
        background-color: var(--link-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9em;
        transition: background-color 0.2s;
      }
      button:hover {
        background-color: var(--link-hover-color);
      }
      #toc {
        max-width: 800px;
        margin: 0 auto;
      }
      #toc ul {
        list-style: none;
        padding-left: 0;
      }
      #toc li {
        margin: 8px 0;
        padding-left: 0;
      }
      #toc a {
        text-decoration: none;
        color: var(--text-color);
        border-bottom: 1px dotted transparent;
        transition: border-bottom-color 0.2s, color 0.2s;
      }
      #toc a:hover {
        color: var(--link-color);
        border-bottom-color: var(--link-color);
      }
      .toc-level-1 { padding-left: 0; }
      .toc-level-2 { padding-left: 20px; }
      .toc-level-3 { padding-left: 40px; }
      .toc-level-4 { padding-left: 60px; }
      .toc-level-5 { padding-left: 80px; }
      .toc-level-6 { padding-left: 100px; }
      .markdown-output {
        background-color: var(--header-bg);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 12px;
        font-family: monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin-top: 15px;
        display: none;
      }
    `,
  };

  // Helper function to create a toast notification (shared)
  function showToast(message, bg = '#6366f1') {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:12px 24px;border-radius:8px;z-index:2147483647;font-family:system-ui;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);opacity:0;transition:0.3s;`;
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = '1', 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
  }

  // Extract headings from the current document
  function extractHeadings() {
    const headings = [];
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headingElements.forEach((element, index) => {
      // Ensure the heading has an id for linking
      if (!element.id) {
        element.id = 'toc-heading-' + index;
      }
      headings.push({
        level: parseInt(element.tagName.substring(1), 10),
        text: element.textContent.trim(),
        id: element.id,
        element: element,
      });
    });

    return headings;
  }

  // Build a nested tree from the flat list of headings
  function buildHeadingTree(headings) {
    if (headings.length === 0) return [];

    const root = { level: 0, children: [] };
    let stack = [root];

    headings.forEach(heading => {
      // Find the correct parent: pop until we find a node with level < current level
      while (stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      const node = { ...heading, children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    });

    return root.children;
  }

  // Generate HTML for the TOC tree
  function generateTOCHTML(tree) {
    if (!tree || tree.length === 0) return '';

    function processNode(node) {
      const link = `#${node.id}`;
      const indentClass = `toc-level-${node.level}`;
      let html = `<li class="${indentClass}"><a href="${link}">${node.text}</a>`;

      if (node.children && node.children.length > 0) {
        html += '<ul>';
        node.children.forEach(child => {
          html += processNode(child);
        });
        html += '</ul>';
      }

      html += '</li>';
      return html;
    }

    let html = '<ul>';
    tree.forEach(node => {
      html += processNode(node);
    });
    html += '</ul>';

    return html;
  }

  // Generate Markdown TOC
  function generateMarkdownTOC(tree) {
    let markdown = '';

    function processNode(node, depth = 0) {
      const indent = '  '.repeat(depth);
      markdown += `${indent}- [${node.text}](#${node.id})\n`;
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, depth + 1);
        });
      }
    }

    tree.forEach(node => {
      processNode(node);
    });

    return markdown.trim();
  }

  // Create the standalone TOC page content
  function createTOCPage(headings) {
    const tree = buildHeadingTree(headings);
    const tocHTML = generateTOCHTML(tree);
    const markdownTOC = generateMarkdownTOC(tree);

    // If no headings, show a message
    let content = tocHTML;
    if (!tocHTML.trim()) {
      content = `<p style="text-align: center; color: #666; font-style: italic;">${config.noHeadingsMessage}</p>`;
    }

    const pageTitle = document.title || 'Untitled Page';
    const pageUrl = window.location.href;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.tocTitle} - ${pageTitle}</title>
        <style>${config.styles}</style>
      </head>
      <body>
        <header>
          <h1>${config.tocTitle}</h1>
          <p>Source: <a href="${pageUrl}" style="color: var(--link-color); text-decoration: underline;">${pageTitle}</a></p>
          <div class="actions">
            <button id="copy-markdown-btn">${config.copyAsMarkdownLabel}</button>
          </div>
        </header>
        <div id="toc">
          ${content}
        </div>
        <div class="markdown-output" id="markdown-output">
          <strong>Markdown TOC:</strong><br>
          <pre id="markdown-text"></pre>
        </div>

        <script>
          // Copy to clipboard functionality
          document.getElementById('copy-markdown-btn').addEventListener('click', async () => {
            const markdownText = \`${markdownTOC.replace(/`/g, '\\`')}\`;
            try {
              await navigator.clipboard.writeText(markdownText);
              showToast('Markdown TOC copied to clipboard!');
              // Show the markdown output for a moment
              const output = document.getElementById('markdown-output');
              output.style.display = 'block';
              setTimeout(() => {
                output.style.display = 'none';
              }, 3000);
            } catch (err) {
              console.error('Failed to copy: ', err);
              showToast('Failed to copy markdown. Please try again.');
            }
          });

          // Optional: Make the page title flash briefly to indicate success
          (function() {
            const originalTitle = document.title;
            let flashCount = 0;
            const flash = () => {
              document.title = flashCount % 2 === 0 ? '✓ TOC Generated' : originalTitle;
              flashCount++;
              if (flashCount < 4) {
                setTimeout(flash, 250);
              } else {
                document.title = originalTitle;
              }
            };
            flash();
          })();
        </script>
      </body>
      </html>
    `;
  }

  // Main function to run the bookmarklet
  function runTOCBookmarklet() {
    try {
      const headings = extractHeadings();
      const tocPageContent = createTOCPage(headings);

      // Open a new tab/window with the TOC page
      const newWindow = window.open('', '_blank', 'width=800,height=600,menubar=no,toolbar=no');
      if (!newWindow) {
        alert('Please allow pop-ups for this site to see the Table of Contents.');
        return;
      }

      const blob = new Blob([tocPageContent], {type: 'text/html'});
      newWindow.location.href = URL.createObjectURL(blob);

      // Show a toast on the original page
      showToast('Table of Contents generated in a new tab!');
    } catch (error) {
      console.error('Error generating TOC:', error);
      showToast('An error occurred while generating the TOC. Please check the console for details.');
    }
  }

  // Run the bookmarklet
  runTOCBookmarklet();
})();
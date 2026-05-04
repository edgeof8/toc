/**
 * toc - Table of Contents Generator Bookmarklet (Tiny Version)
 */
(function() {
  'use strict';

  // Configuration
  var config = {
    tocTitle: 'Table of Contents',
    copyLabel: 'Copy as Markdown',
    noHeadings: 'No headings found on this page.'
  };

  // Extract headings
  function getHeadings() {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(function(el, i) {
      if (!el.id) el.id = 'toc-heading-' + i;
      return {
        level: parseInt(el.tagName.substring(1), 10),
        text: el.textContent.trim(),
        id: el.id
      };
    });
  }

  // Build tree
  function buildTree(headings) {
    if (!headings.length) return [];
    var root = { level: 0, children: [] };
    var stack = [root];
    headings.forEach(function(heading) {
      while (stack[stack.length - 1].level >= heading.level) stack.pop();
      var node = { ...heading, children: [] };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    });
    return root.children;
  }

  // Generate HTML for TOC tree
  function generateTOC(tree) {
    if (!tree.length) return '';
    function process(node) {
      var html = '<li class="toc-level-' + node.level + '"><a href="#' + node.id + '">' + node.text + '</a>';
      if (node.children.length) {
        html += '<ul>';
        node.children.forEach(function(child) { html += process(child); });
        html += '</ul>';
      }
      return html + '</li>';
    }
    var html = '<ul>';
    tree.forEach(function(node) { html += process(node); });
    return html + '</ul>';
  }

  // Generate markdown TOC
  function generateMarkdown(tree) {
    var md = '';
    function process(node, depth) {
      md += '  '.repeat(depth) + '- [' + node.text + '](#' + node.id + ')\n';
      node.children.forEach(function(child) { process(child, depth + 1); });
    }
    tree.forEach(function(node) { process(node, 0); });
    return md.trim();
  }

  // Create the TOC page content
  function createTOCPage(headings) {
    var tree = buildTree(headings);
    var tocHTML = generateTOC(tree);
    var markdown = generateMarkdown(tree);
    var content = tocHTML ? tocHTML : '<p style="text-align:center;color:#666;font-style:italic;">' + config.noHeadings + '</p>';
    var title = document.title || 'Untitled Page';
    var url = location.href;
    return '\n\
<!DOCTYPE html>\n\
<html lang="en">\n\
<head>\n\
  <meta charset="UTF-8">\n\
  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n\
  <title>' + config.tocTitle + ' - ' + title + '</title>\n\
  <style>\n\
    :root {\n\
      --bg: #fff; --text: #222; --link: #0066cc; --link-hover: #0052a3; --border: #e0e0e0; --header-bg: #f8f9fa; --shadow: 0 2px 8px rgba(0,0,0,0.1);\n\
      --font: -apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Oxygen,Ubuntu,Cantarell,\'Open Sans\',\'Helvetica Neue\',sans-serif;\n\
    }\n\
    @media(prefers-color-scheme:dark) {\n\
      :root {\n\
        --bg: #1e1e1e; --text: #f0f0f0; --link: #4da6ff; --link-hover: #80bfff; --border: #444; --header-bg: #2d2d2d;\n\
      }\n\
    }\n\
    * { box-sizing: border-box; margin: 0; padding: 0; }\n\
    body { font: 16px var(--font); background: var(--bg); color: var(--text); line-height: 1.6; padding: 20px; }\n\
    header { background: var(--header-bg); border-bottom: 1px solid var(--border); padding: 20px; margin-bottom: 30px; box-shadow: var(--shadow); }\n\
    h1 { font-size: 1.8em; margin-bottom: 10px; }\n\
    .actions { margin-top: 15px; }\n\
    button { background: var(--link-color); color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.9em; }\n\
    button:hover { background: var(--link-hover-color); }\n\
    #toc { max-width: 800px; margin: 0 auto; }\n\
    #toc ul { list-style: none; padding-left: 0; }\n\
    #toc li { margin: 8px 0; }\n\
    #toc a { text-decoration: none; color: var(--text); border-bottom: 1px dotted transparent; }\n\
    #toc a:hover { color: var(--link-color); border-bottom-color: var(--link-color); }\n\
    .toc-level-1 { padding-left: 0; }\n\
    .toc-level-2 { padding-left: 20px; }\n\
    .toc-level-3 { padding-left: 40px; }\n\
    .toc-level-4 { padding-left: 60px; }\n\
    .toc-level-5 { padding-left: 80px; }\n\
    .toc-level-6 { padding-left: 100px; }\n\
    .markdown-output { background: var(--header-bg); border: 1px solid var(--border); border-radius: 4px; padding: 12px; font-family: monospace; white-space: pre-wrap; margin-top: 15px; display: none; }\n\
  </style>\n\
</head>\n\
<body>\n\
  <header>\n\
    <h1>' + config.tocTitle + '</h1>\n\
    <p>Source: <a href="' + url + '" style="color:var(--link-color);text-decoration:underline;">' + title + '</a></p>\n\
    <div class="actions"><button id="copy-markdown-btn">' + config.copyLabel + '</button></div>\n\
  </header>\n\
  <div id="toc">' + content + '</div>\n\
  <div class="markdown-output" id="markdown-output">\n\
    <strong>Markdown TOC:</strong><br>\n\
    <pre id="markdown-text"></pre>\n\
  </div>\n\
  <script>\n\
    document.getElementById(\'copy-markdown-btn\').addEventListener(\'click\', async function() {\n\
      try {\n\
        await navigator.clipboard.writeText(' + JSON.stringify(markdown) + ');\n\
        alert(\'Markdown TOC copied to clipboard!\');\n\
      } catch (e) {\n\
        alert(\'Failed to copy markdown.\');\n\
      }\n\
    });\n\
  </script>\n\
</body>\n\
</html>';
  }

  // Main
  try {
    var headings = getHeadings();
    var tocPage = createTOCPage(headings);
    var w = window.open('', '_blank', 'width=800,height=600,menubar=no,toolbar=no');
    if (!w) {
      alert('Please allow pop-ups for this site to see the Table of Contents.');
      return;
    }
    w.document.write(tocPage);
    w.document.close();
  } catch (e) {
    console.error(e);
    alert('An error occurred while generating the TOC.');
  }
})();
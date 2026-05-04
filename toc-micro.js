/**
 * toc - Table of Contents Generator Bookmarklet (Micro Version)
 */
(function() {
  'use strict';

  var config = {
    tocTitle: 'Table of Contents',
    copyLabel: 'Copy as Markdown',
    noHeadings: 'No headings found.'
  };

  // Get headings
  var headings = [];
  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(function(el, i) {
    if (!el.id) el.id = 'toc-heading-' + i;
    headings.push({
      level: +el.tagName.charAt(1),
      text: el.textContent.trim(),
      id: el.id
    });
  });

  // Build tree
  function buildTree(list) {
    if (!list.length) return [];
    var root = {level:0, children:[]}, stack = [root];
    list.forEach(function(node) {
      while (stack[stack.length-1].level >= node.level) stack.pop();
      var item = {...node, children:[]};
      stack[stack.length-1].children.push(item);
      stack.push(item);
    });
    return root.children;
  }

  // Generate HTML for TOC
  function generateTOC(tree) {
    if (!tree.length) return '';
    function process(node) {
      var html = '<li class="l' + node.level + '"><a href="#' + node.id + '">' + node.text + '</a>';
      if (node.children.length) {
        html += '<ul>';
        node.children.forEach(function(child) { html += process(child); });
        html += '</ul>';
      }
      return html + '</li>';
    }
    return '<ul>' + tree.map(process).join('') + '</ul>';
  }

  // Generate markdown
  function generateMD(tree) {
    var md = '';
    function process(node, depth) {
      md += '  '.repeat(depth) + '- [' + node.text + '](#' + node.id + ')\n';
      node.children.forEach(function(child) { process(child, depth+1); });
    }
    tree.forEach(function(node) { process(node,0); });
    return md.trim();
  }

  // Create TOC page
  function createPage() {
    var tree = buildTree(headings);
    var tocHTML = generateTOC(tree);
    var markdown = generateMD(tree);
    var content = tocHTML ? tocHTML : '<p style="text-align:center;color:#666;font-style:italic;">' + config.noHeadings + '</p>';
    var title = document.title || 'Untitled';
    var url = location.href;
    return '\n\
<!DOCTYPE html>\n\
<html>\n\
<head>\n\
<meta charset="UTF-8">\n\
<title>' + config.tocTitle + ' - ' + title + '</title>\n\
<style>\n\
body{font-family:sans-serif;background:#fff;color:#222;padding:20px;line-height:1.6}\nh1{font-size:1.8em;margin-bottom:10px}\n#toc{max-width:800px;margin:auto}\n#toc ul{list-style:none;padding:0}\n#toc li{margin:8px 0}\n#toc a{text-decoration:none;color:#222;border-bottom:1px dotted transparent}\n#toc a:hover{color:#0066cc;border-bottom-color:#0066cc}\n.button{background:#0066cc;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer}\n.button:hover{background:#0052a3}\n</style>\n\
</head>\n\
<body>\n\
<h1>' + config.tocTitle + '</h1>\n\
<p>Source: <a href="' + url + '">' + title + '</a></p>\n\
<div id="toc">' + content + '</div>\n\
<button class="button" id="copyBtn">' + config.copyLabel + '</button>\n\
<script>\n\
document.getElementById(' + 'copyBtn' + ').onclick = function(){\n\
  navigator.clipboard.writeText(' + JSON.stringify(markdown) + ').then(function(){\n\
    alert(' + 'Markdown copied!' + ');\n\
  }, function(){\n\
    alert(' + 'Copy failed' + ');\n\
  });\n\
};\n\
</script>\n\
</body>\n\
</html>';
  }

  try {
    var page = createPage();
    var w = window.open('', '_blank', 'width=800,height=600');
    if (!w) {
      alert('Allow pop-ups to see the TOC.');
      return;
    }
    w.document.write(page);
    w.document.close();
  } catch (e) {
    console.error(e);
    alert('Error generating TOC.');
  }
})();
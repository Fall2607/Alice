const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Next/Alice/src/app/api');

let modified = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    // Replace: { params: Promise<{ id: string }> | { id: string } }
    .replace(/ \| \{ [a-zA-Z0-9_]+: string \}/g, "")
    // Replace: context: { params: Promise<{ id: string }> } | { params: { id: string } }
    .replace(/ \| \{ params: \{ [a-zA-Z0-9_]+: string \} \}/g, "");
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    modified++;
    console.log(`Fixed ${file}`);
  }
});

console.log(`Total files modified: ${modified}`);

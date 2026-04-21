const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'src', 'css');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(/background(-color)?:\s*(white|#ffffff|#fff);/gi, 'background$1: var(--card-bg);');
  content = content.replace(/background(-color)?:\s*(#f8fafc|#f9f9f9|#f1f5f9);/gi, 'background$1: var(--section-bg);');
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css')) {
      replaceColors(fullPath);
    }
  }
}

processDirectory(cssDir);
console.log('Done!');

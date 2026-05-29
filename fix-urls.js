const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5000/api')) {
        content = content.replace(/http:\/\/localhost:5000\/api/g, '/api');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

traverse(srcDir);
console.log('Done replacing URLs');

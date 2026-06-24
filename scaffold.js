const fs = require('fs');
const path = require('path');

const filesToParse = [
  '02-skills-and-templates.md',
  '03-installer-and-scripts.md',
  '04-manifests-and-docs.md'
];

for (const file of filesToParse) {
  const content = fs.readFileSync(file, 'utf8');
  
  const regex = /### `([^`]+)`\n+`{3,4}\w*\n([\s\S]*?)\n`{3,4}/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const filePath = match[1];
    let fileContent = match[2];
    
    const normalizedPath = filePath.split('/').join(path.sep);
    const fullPath = path.join(__dirname, normalizedPath);
    
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, fileContent, 'utf8');
    console.log(`Created ${filePath}`);
  }
}

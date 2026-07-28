const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (filePath.endsWith('.controller.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix permissions.guard import back to common
    content = content.replace(/from '\.\.\/guards\/permissions\.guard'/g, "from '../common/guards/permissions.guard'");
    content = content.replace(/from '\.\.\/guards\/roles\.guard'/g, "from '../common/guards/roles.guard'");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});

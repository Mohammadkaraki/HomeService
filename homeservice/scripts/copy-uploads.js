// Script to copy uploads from backend to frontend
const fs = require('fs');
const path = require('path');

// Paths
const BACKEND_UPLOADS = path.resolve('../homeservice-backend/public/uploads');
const FRONTEND_UPLOADS = path.resolve('./public/uploads');

// Ensure target directory exists
if (!fs.existsSync(FRONTEND_UPLOADS)) {
  fs.mkdirSync(FRONTEND_UPLOADS, { recursive: true });
  console.log('Created frontend uploads directory:', FRONTEND_UPLOADS);
}

// Copy function
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
    console.log('Created directory:', destination);
  }
  
  // Read source directory
  const files = fs.readdirSync(source);
  
  // Copy each file
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} -> ${destPath}`);
    }
  }
}

// Start the copy process
console.log(`Copying files from ${BACKEND_UPLOADS} to ${FRONTEND_UPLOADS}`);

if (!fs.existsSync(BACKEND_UPLOADS)) {
  console.error('Backend uploads directory does not exist:', BACKEND_UPLOADS);
  process.exit(1);
}

try {
  copyDirectory(BACKEND_UPLOADS, FRONTEND_UPLOADS);
  console.log('Finished copying uploads.');
} catch (error) {
  console.error('Error copying files:', error);
  process.exit(1);
} 
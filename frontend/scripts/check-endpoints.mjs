import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking for old API endpoints in src/...\n');

// Patterns to search for (old endpoints that should be removed)
const searchPatterns = [
  '/api/status',
  '/api/telemetry/latest',
  '/api/events',
  '"/api/status"',
  "'/api/status'",
  '`/api/status`',
  '"/api/telemetry/latest"',
  "'/api/telemetry/latest'",
  '`/api/telemetry/latest`',
  '"/api/events"',
  "'/api/events'",
  '`/api/events`',
];

const srcDir = path.join(__dirname, '..', 'src');
let foundIssues = false;
let checkedFiles = 0;

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let hasIssue = false;
    
    searchPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        console.log(`❌ Found old endpoint "${pattern}" in: ${filePath}`);
        hasIssue = true;
        foundIssues = true;
      }
    });
    
    return hasIssue;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
          checkedFiles++;
          searchInFile(filePath);
        }
      } catch (error) {
        // Skip files that can't be accessed
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Check if src directory exists
if (!fs.existsSync(srcDir)) {
  console.log(`❌ src directory not found at: ${srcDir}`);
  console.log('Please make sure you are running this script from the project root.');
  process.exit(1);
}

walkDir(srcDir);

console.log(`\n📁 Checked ${checkedFiles} files in src/`);

if (!foundIssues) {
  console.log('✅ No old API endpoints found in src/');
  console.log('\n✨ All endpoints appear to be using the correct /api/v1/ paths.');
} else {
  console.log('\n⚠️ Please update the files listed above to use the correct /api/v1/ endpoints.');
  console.log('\nOld endpoints to replace:');
  console.log('  ❌ /api/status        → ✅ /api/v1/fence/status');
  console.log('  ❌ /api/telemetry/latest → ✅ REMOVED (does not exist)');
  console.log('  ❌ /api/events        → ✅ /api/v1/events');
  process.exit(1);
}

console.log('\n✅ Verification complete!');
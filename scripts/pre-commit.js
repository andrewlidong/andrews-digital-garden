import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    // Run the filesystem update script
    execSync('node scripts/updateFilesystem.js', { stdio: 'inherit' });

    // Add the updated filesystem.json to the commit
    execSync('git add src/content/filesystem.json', { stdio: 'inherit' });

    console.log('✅ Pre-commit hook completed successfully');
    process.exit(0);
} catch (error) {
    console.error('❌ Pre-commit hook failed:', error);
    process.exit(1);
}
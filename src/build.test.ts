import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Build Output', () => {
  const distPath = join(process.cwd(), 'dist');
  
  beforeAll(() => {
    // Check if build has been run
    if (!existsSync(distPath)) {
      throw new Error('Please run "pnpm build" before running tests');
    }
  });

  it('should build successfully without errors', () => {
    // Check that essential build outputs exist
    const indexPath = join(distPath, 'index.html');
    expect(existsSync(indexPath)).toBe(true);
    
    // Check that assets directory exists (JS and CSS files will be there)
    const assetsPath = join(distPath, 'assets');
    expect(existsSync(assetsPath)).toBe(true);
  });
});
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Build Output', () => {
  const distPath = join(process.cwd(), 'dist');
  
  beforeAll(() => {
    // Check if build has been run
    if (!existsSync(distPath)) {
      throw new Error('Please run "pnpm build" before running tests');
    }
  });

  it('should generate index.html', () => {
    const indexPath = join(distPath, 'index.html');
    expect(existsSync(indexPath)).toBe(true);
    
    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('<!doctype html>');
    expect(content).toContain('<div id="app"></div>');
  });

  it('should generate CSS assets', () => {
    const indexPath = join(distPath, 'index.html');
    const content = readFileSync(indexPath, 'utf-8');
    
    // Check for CSS link tag
    const cssMatch = content.match(/<link[^>]+href="([^"]+\.css)"/);
    expect(cssMatch).toBeTruthy();
    
    if (cssMatch) {
      const cssPath = join(distPath, cssMatch[1]);
      expect(existsSync(cssPath)).toBe(true);
      
      // Check CSS contains expected classes
      const cssContent = readFileSync(cssPath, 'utf-8');
      expect(cssContent).toContain('.html-editor');
      expect(cssContent).toContain('.text-node');
    }
  });

  it('should generate JavaScript bundle', () => {
    const indexPath = join(distPath, 'index.html');
    const content = readFileSync(indexPath, 'utf-8');
    
    // Check for script tag
    const jsMatch = content.match(/<script[^>]+src="([^"]+\.js)"/);
    expect(jsMatch).toBeTruthy();
    
    if (jsMatch) {
      const jsPath = join(distPath, jsMatch[1]);
      expect(existsSync(jsPath)).toBe(true);
      
      // Check JS contains expected code
      const jsContent = readFileSync(jsPath, 'utf-8');
      expect(jsContent).toContain('HTML Editor Demo');
      expect(jsContent).toContain('NEXUS');
    }
  });

  it('should include all necessary HTML content in bundle', () => {
    const indexPath = join(distPath, 'index.html');
    const content = readFileSync(indexPath, 'utf-8');
    
    // Find JS file
    const jsMatch = content.match(/<script[^>]+src="([^"]+\.js)"/);
    if (jsMatch) {
      const jsPath = join(distPath, jsMatch[1]);
      const jsContent = readFileSync(jsPath, 'utf-8');
      
      // Check for key content that should be in the bundle
      expect(jsContent).toContain('Click on any text to select words');
      expect(jsContent).toContain('AI THAT');
      expect(jsContent).toContain('DELIVERS');
      expect(jsContent).toContain('Next-generation AI infrastructure');
    }
  });
});
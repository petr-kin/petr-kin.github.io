#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const FAVICON_SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'og-image.png', size: 1200, height: 630 }, // Special OG image
];

async function generateFavicon(size, outputPath, isOgImage = false) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for OG image or square favicon
  if (isOgImage) {
    await page.setViewportSize({ width: 1200, height: 630 });
  } else {
    await page.setViewportSize({ width: size * 2, height: size * 2 });
  }
  
  // Create favicon content
  const faviconHTML = isOgImage ? createOgImageHTML() : createFaviconHTML(size);
  
  await page.setContent(faviconHTML);
  await page.waitForTimeout(1000); // Wait for rendering
  
  // Take screenshot
  const screenshotOptions = isOgImage 
    ? { path: outputPath, fullPage: true }
    : { path: outputPath, clip: { x: 0, y: 0, width: size * 2, height: size * 2 } };
    
  await page.screenshot(screenshotOptions);
  await browser.close();
  
  console.log(`Generated: ${path.basename(outputPath)} (${isOgImage ? '1200x630' : size + 'x' + size})`);
}

function createFaviconHTML(size) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: ${size * 2}px;
          height: ${size * 2}px;
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #164e63 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Arial', sans-serif;
        }
        
        .logo {
          width: ${size * 1.6}px;
          height: ${size * 1.6}px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: ${size * 0.2}px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .text {
          color: white;
          font-weight: bold;
          font-size: ${size * 0.8}px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .accent {
          position: absolute;
          width: ${size * 0.3}px;
          height: ${size * 0.3}px;
          background: rgba(34, 197, 94, 0.8);
          border-radius: 50%;
          top: ${size * 0.2}px;
          right: ${size * 0.2}px;
          box-shadow: 0 0 ${size * 0.2}px rgba(34, 197, 94, 0.5);
        }
      </style>
    </head>
    <body>
      <div class="logo">
        <div class="text">PK</div>
        <div class="accent"></div>
      </div>
    </body>
    </html>
  `;
}

function createOgImageHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 30%, #164e63 70%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Arial', sans-serif;
          padding: 80px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        
        .content {
          flex: 1;
          z-index: 2;
        }
        
        .title {
          color: white;
          font-size: 72px;
          font-weight: bold;
          margin: 0 0 20px 0;
          line-height: 1.1;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 32px;
          margin: 0 0 30px 0;
          font-weight: 300;
        }
        
        .description {
          color: rgba(255, 255, 255, 0.8);
          font-size: 24px;
          line-height: 1.4;
          max-width: 600px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          z-index: 2;
        }
        
        .main-logo {
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          border: 3px solid rgba(255, 255, 255, 0.3);
          margin-bottom: 30px;
          position: relative;
        }
        
        .logo-text {
          color: white;
          font-weight: bold;
          font-size: 80px;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .logo-accent {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(34, 197, 94, 0.9);
          border-radius: 50%;
          top: 20px;
          right: 20px;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
        }
        
        .tagline {
          color: rgba(255, 255, 255, 0.8);
          font-size: 18px;
          text-align: center;
          font-weight: 500;
        }
        
        .bg-orb1 {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          filter: blur(60px);
        }
        
        .bg-orb2 {
          position: absolute;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -80px;
          left: -80px;
          filter: blur(50px);
        }
      </style>
    </head>
    <body>
      <div class="bg-orb1"></div>
      <div class="bg-orb2"></div>
      
      <div class="content">
        <h1 class="title">PETR KINDLMANN</h1>
        <p class="subtitle">Test Intelligence Engineer</p>
        <p class="description">Building self-healing test frameworks with AI. Where precision meets automation.</p>
      </div>
      
      <div class="logo-section">
        <div class="main-logo">
          <div class="logo-text">PK</div>
          <div class="logo-accent"></div>
        </div>
        <div class="tagline">AI-Powered QA Solutions</div>
      </div>
    </body>
    </html>
  `;
}

async function generateFaviconICO() {
  // For .ico generation, we'll create a 32x32 PNG and copy it as .ico
  // Modern browsers support PNG favicons, and this is simpler than generating true ICO format
  const publicDir = path.join(process.cwd(), 'public');
  const pngPath = path.join(publicDir, 'favicon-32x32.png');
  const icoPath = path.join(publicDir, 'favicon.ico');
  
  try {
    // Copy the 32x32 PNG as favicon.ico (browsers will handle it)
    const pngData = await fs.readFile(pngPath);
    await fs.writeFile(icoPath, pngData);
    console.log('Generated: favicon.ico (copied from 32x32 PNG)');
  } catch (error) {
    console.error('Failed to generate favicon.ico:', error.message);
  }
}

async function main() {
  try {
    console.log('🎨 Generating favicon suite...\n');
    
    const publicDir = path.join(process.cwd(), 'public');
    
    // Ensure public directory exists
    await fs.mkdir(publicDir, { recursive: true });
    
    // Generate all favicon sizes
    for (const favicon of FAVICON_SIZES) {
      const outputPath = path.join(publicDir, favicon.name);
      const isOgImage = favicon.name === 'og-image.png';
      
      await generateFavicon(favicon.size, outputPath, isOgImage);
    }
    
    // Generate favicon.ico
    await generateFaviconICO();
    
    console.log('\n✅ Favicon generation complete!');
    console.log('\nGenerated files:');
    console.log('- favicon.ico');
    FAVICON_SIZES.forEach(f => console.log(`- ${f.name}`));
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
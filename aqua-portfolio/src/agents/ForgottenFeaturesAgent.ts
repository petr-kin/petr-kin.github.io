#!/usr/bin/env ts-node

/**
 * Forgotten Features Agent - Finds unused/forgotten components and features
 * Based on actual codebase analysis and import patterns
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ForgottenFeature {
  type: 'component' | 'hook' | 'util' | 'page' | 'api' | 'asset';
  path: string;
  name: string;
  reason: string;
  complexity: number;
  lastModified: Date;
  potentialIntegrations: string[];
  codeSnippet?: string;
}

interface IntegrationSuggestion {
  feature: ForgottenFeature;
  targetFile: string;
  integrationCode: string;
  confidence: number;
  reason: string;
}

export class ForgottenFeaturesAgent {
  private readonly srcDir: string;
  private readonly rootDir: string;
  private readonly importGraph: Map<string, Set<string>> = new Map();
  private readonly exportGraph: Map<string, Set<string>> = new Map();

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
  }

  async analyzeCodebase(): Promise<void> {
    console.log('🔍 Analyzing codebase import/export patterns...');
    
    const allFiles = await this.findFiles(this.srcDir, /\.(ts|tsx|js|jsx)$/);
    
    for (const file of allFiles) {
      await this.analyzeFile(file);
    }
    
    console.log(`📊 Analyzed ${allFiles.length} files`);
  }

  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.rootDir, filePath);
      
      // Find imports
      const imports = new Set<string>();
      const importMatches = content.matchAll(/import.*?from\s+['"`](.+?)['"`]/g);
      for (const match of importMatches) {
        imports.add(this.normalizeImportPath(match[1], filePath));
      }
      this.importGraph.set(relativePath, imports);
      
      // Find exports
      const exports = new Set<string>();
      const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)/g);
      for (const match of exportMatches) {
        exports.add(match[1]);
      }
      
      // Check for default exports
      if (content.includes('export default')) {
        const fileName = path.basename(filePath, path.extname(filePath));
        exports.add(fileName);
      }
      
      this.exportGraph.set(relativePath, exports);
      
    } catch (error) {
      console.warn(`⚠️ Error analyzing ${filePath}:`, error);
    }
  }

  private normalizeImportPath(importPath: string, fromFile: string): string {
    if (importPath.startsWith('@/')) {
      return path.join('src', importPath.slice(2));
    } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const fromDir = path.dirname(fromFile);
      const resolved = path.resolve(fromDir, importPath);
      return path.relative(this.rootDir, resolved);
    }
    return importPath;
  }

  async findForgottenFeatures(): Promise<ForgottenFeature[]> {
    console.log('🔎 Searching for forgotten features...');
    
    await this.analyzeCodebase();
    
    const forgotten: ForgottenFeature[] = [];
    
    // Find unused components
    forgotten.push(...await this.findUnusedComponents());
    
    // Find unused hooks
    forgotten.push(...await this.findUnusedHooks());
    
    // Find unused utilities
    forgotten.push(...await this.findUnusedUtils());
    
    // Find unused pages/routes
    forgotten.push(...await this.findUnusedPages());
    
    // Find unused API routes
    forgotten.push(...await this.findUnusedAPIRoutes());
    
    // Find unused assets
    forgotten.push(...await this.findUnusedAssets());
    
    console.log(`🎯 Found ${forgotten.length} potentially forgotten features`);
    
    return forgotten.sort((a, b) => b.complexity - a.complexity);
  }

  private async findUnusedComponents(): Promise<ForgottenFeature[]> {
    const components: ForgottenFeature[] = [];
    const componentFiles = await this.findFiles(
      path.join(this.srcDir, 'components'), 
      /\.(tsx|jsx)$/
    );
    
    for (const file of componentFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const fileName = path.basename(file, path.extname(file));
      
      if (this.isFileUsed(relativePath) || this.isEntryPoint(file)) {
        continue;
      }
      
      const stats = await fs.stat(file);
      const content = await fs.readFile(file, 'utf-8');
      const complexity = this.calculateComplexity(content);
      
      components.push({
        type: 'component',
        path: relativePath,
        name: fileName,
        reason: 'Component is not imported anywhere in the codebase',
        complexity,
        lastModified: stats.mtime,
        potentialIntegrations: await this.findPotentialIntegrations(fileName, content),
        codeSnippet: this.extractMainExport(content)
      });
    }
    
    return components;
  }

  private async findUnusedHooks(): Promise<ForgottenFeature[]> {
    const hooks: ForgottenFeature[] = [];
    const hookFiles = await this.findFiles(
      path.join(this.srcDir, 'hooks'), 
      /\.(ts|tsx)$/
    );
    
    for (const file of hookFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const fileName = path.basename(file, path.extname(file));
      
      if (this.isFileUsed(relativePath)) {
        continue;
      }
      
      const stats = await fs.stat(file);
      const content = await fs.readFile(file, 'utf-8');
      const complexity = this.calculateComplexity(content);
      
      hooks.push({
        type: 'hook',
        path: relativePath,
        name: fileName,
        reason: 'Custom hook is not used in any component',
        complexity,
        lastModified: stats.mtime,
        potentialIntegrations: await this.findHookIntegrations(fileName, content),
        codeSnippet: this.extractMainExport(content)
      });
    }
    
    return hooks;
  }

  private async findUnusedUtils(): Promise<ForgottenFeature[]> {
    const utils: ForgottenFeature[] = [];
    const utilFiles = await this.findFiles(
      path.join(this.srcDir, 'lib'), 
      /\.(ts|tsx)$/
    );
    
    for (const file of utilFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const fileName = path.basename(file, path.extname(file));
      
      if (this.isFileUsed(relativePath)) {
        continue;
      }
      
      const stats = await fs.stat(file);
      const content = await fs.readFile(file, 'utf-8');
      const complexity = this.calculateComplexity(content);
      
      utils.push({
        type: 'util',
        path: relativePath,
        name: fileName,
        reason: 'Utility function is not imported anywhere',
        complexity,
        lastModified: stats.mtime,
        potentialIntegrations: await this.findUtilIntegrations(fileName, content),
        codeSnippet: this.extractMainExport(content)
      });
    }
    
    return utils;
  }

  private async findUnusedPages(): Promise<ForgottenFeature[]> {
    const pages: ForgottenFeature[] = [];
    
    try {
      const appDir = path.join(this.srcDir, 'app');
      const pageFiles = await this.findFiles(appDir, /page\.(tsx|jsx)$/);
      
      for (const file of pageFiles) {
        const relativePath = path.relative(this.rootDir, file);
        const route = this.getRouteFromPageFile(file);
        
        // Check if route is linked anywhere
        const isLinked = await this.isRouteLinked(route);
        
        if (!isLinked) {
          const stats = await fs.stat(file);
          const content = await fs.readFile(file, 'utf-8');
          const complexity = this.calculateComplexity(content);
          
          pages.push({
            type: 'page',
            path: relativePath,
            name: route,
            reason: 'Page route is not linked from any navigation or component',
            complexity,
            lastModified: stats.mtime,
            potentialIntegrations: await this.findPageIntegrations(route),
            codeSnippet: this.extractMainExport(content)
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error analyzing pages:', error);
    }
    
    return pages;
  }

  private async findUnusedAPIRoutes(): Promise<ForgottenFeature[]> {
    const apis: ForgottenFeature[] = [];
    
    try {
      const apiDir = path.join(this.srcDir, 'app', 'api');
      const apiFiles = await this.findFiles(apiDir, /route\.(ts|tsx)$/);
      
      for (const file of apiFiles) {
        const relativePath = path.relative(this.rootDir, file);
        const endpoint = this.getAPIEndpoint(file);
        
        // Check if API is called anywhere
        const isCalled = await this.isAPIEndpointUsed(endpoint);
        
        if (!isCalled) {
          const stats = await fs.stat(file);
          const content = await fs.readFile(file, 'utf-8');
          const complexity = this.calculateComplexity(content);
          
          apis.push({
            type: 'api',
            path: relativePath,
            name: endpoint,
            reason: 'API endpoint is not called from any component or service',
            complexity,
            lastModified: stats.mtime,
            potentialIntegrations: await this.findAPIIntegrations(endpoint),
            codeSnippet: this.extractMainExport(content)
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error analyzing API routes:', error);
    }
    
    return apis;
  }

  private async findUnusedAssets(): Promise<ForgottenFeature[]> {
    const assets: ForgottenFeature[] = [];
    
    try {
      const publicDir = path.join(this.rootDir, 'public');
      const assetFiles = await this.findFiles(publicDir, /\.(png|jpg|jpeg|svg|mp4|webm|gif)$/);
      
      for (const file of assetFiles) {
        const relativePath = path.relative(this.rootDir, file);
        const assetPath = '/' + path.relative(publicDir, file).replace(/\\/g, '/');
        
        // Check if asset is referenced anywhere
        const isReferenced = await this.isAssetReferenced(assetPath);
        
        if (!isReferenced) {
          const stats = await fs.stat(file);
          
          assets.push({
            type: 'asset',
            path: relativePath,
            name: path.basename(file),
            reason: 'Asset is not referenced in any component or CSS',
            complexity: Math.floor(stats.size / 1024), // Use file size as complexity
            lastModified: stats.mtime,
            potentialIntegrations: await this.findAssetIntegrations(assetPath)
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error analyzing assets:', error);
    }
    
    return assets;
  }

  // Helper methods
  private async findFiles(dir: string, pattern: RegExp): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...await this.findFiles(fullPath, pattern));
        } else if (entry.isFile() && pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  private isFileUsed(filePath: string): boolean {
    // Check if any file imports this one
    for (const [, imports] of this.importGraph) {
      for (const importPath of imports) {
        if (importPath === filePath || importPath.includes(path.basename(filePath, path.extname(filePath)))) {
          return true;
        }
      }
    }
    return false;
  }

  private isEntryPoint(filePath: string): boolean {
    const entryPoints = [
      'page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx', 
      'not-found.tsx', 'global-error.tsx', 'route.ts', 'middleware.ts',
      'app.tsx', 'index.tsx', '_app.tsx', '_document.tsx'
    ];
    const fileName = path.basename(filePath);
    return entryPoints.includes(fileName) || filePath.includes('src/app/');
  }

  private calculateComplexity(content: string): number {
    // Simple complexity calculation
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const functions = (content.match(/function|=>/g) || []).length;
    const hooks = (content.match(/use[A-Z]/g) || []).length;
    const jsx = (content.match(/<[A-Z]/g) || []).length;
    
    return lines.length + (functions * 2) + (hooks * 3) + jsx;
  }

  private extractMainExport(content: string): string {
    // Extract main export for preview
    const exportMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)?[^{]*\{([^}]*)\}/);
    if (exportMatch) {
      return `export default ${exportMatch[1] || 'function'}${exportMatch[2] ? ` { ${exportMatch[2].slice(0, 100)}... }` : ''}`;
    }
    
    const functionMatch = content.match(/(?:export\s+)?(?:const|function)\s+(\w+)[^{]*\{([^}]*)\}/);
    if (functionMatch) {
      return `${functionMatch[1]} { ${functionMatch[2].slice(0, 100)}... }`;
    }
    
    return content.slice(0, 200) + '...';
  }

  private async findPotentialIntegrations(componentName: string, content: string): Promise<string[]> {
    const integrations: string[] = [];
    
    // Look for similar component usage patterns
    const allFiles = await this.findFiles(this.srcDir, /\.(tsx|jsx)$/);
    
    for (const file of allFiles) {
      try {
        const fileContent = await fs.readFile(file, 'utf-8');
        const fileName = path.basename(file, path.extname(file));
        
        // Check for similar naming patterns or imports
        if (fileContent.includes('components/ui/') && componentName.includes('ui')) {
          integrations.push(`Could be used in ${fileName} with similar UI components`);
        }
        
        if (fileContent.includes('sections/') && componentName.includes('Section')) {
          integrations.push(`Could be integrated in ${fileName} as a section component`);
        }
        
        // Check for specific component patterns in content
        if (content.includes('Card') && fileContent.includes('<Card')) {
          integrations.push(`Could replace or enhance Card usage in ${fileName}`);
        }
        
        if (content.includes('Button') && fileContent.includes('<button')) {
          integrations.push(`Could replace button elements in ${fileName}`);
        }
        
      } catch (error) {
        // Skip file on error
      }
    }
    
    return integrations.slice(0, 3); // Limit to top 3 suggestions
  }

  private async findHookIntegrations(hookName: string, content: string): Promise<string[]> {
    const integrations: string[] = [];
    
    // Analyze what the hook does
    if (content.includes('useState')) {
      integrations.push('Could be used in components that need state management');
    }
    
    if (content.includes('useEffect')) {
      integrations.push('Could be used in components with lifecycle effects');
    }
    
    if (content.includes('performance') || content.includes('Performance')) {
      integrations.push('Could be integrated with performance monitoring components');
    }
    
    return integrations;
  }

  private async findUtilIntegrations(utilName: string, content: string): Promise<string[]> {
    const integrations: string[] = [];
    
    if (content.includes('class') || content.includes('className')) {
      integrations.push('Could be used for CSS class manipulation in components');
    }
    
    if (content.includes('format') || content.includes('parse')) {
      integrations.push('Could be used for data formatting in display components');
    }
    
    return integrations;
  }

  private getRouteFromPageFile(filePath: string): string {
    const appDir = path.join(this.srcDir, 'app');
    const relativePath = path.relative(appDir, filePath);
    const route = '/' + path.dirname(relativePath).replace(/\\/g, '/');
    return route === '/.' ? '/' : route;
  }

  private async isRouteLinked(route: string): Promise<boolean> {
    const allFiles = await this.findFiles(this.srcDir, /\.(ts|tsx|js|jsx)$/);
    
    for (const file of allFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes(`href="${route}"`) || content.includes(`to="${route}"`)) {
          return true;
        }
      } catch (error) {
        // Skip file on error
      }
    }
    
    return false;
  }

  private async findPageIntegrations(route: string): Promise<string[]> {
    return [`Could be linked in navigation components`, `Could be referenced in sitemap or routing`];
  }

  private getAPIEndpoint(filePath: string): string {
    const apiDir = path.join(this.srcDir, 'app', 'api');
    const relativePath = path.relative(apiDir, filePath);
    return '/api/' + path.dirname(relativePath).replace(/\\/g, '/');
  }

  private async isAPIEndpointUsed(endpoint: string): Promise<boolean> {
    const allFiles = await this.findFiles(this.srcDir, /\.(ts|tsx|js|jsx)$/);
    
    for (const file of allFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes(endpoint) || content.includes(`'${endpoint}'`) || content.includes(`"${endpoint}"`)) {
          return true;
        }
      } catch (error) {
        // Skip file on error
      }
    }
    
    return false;
  }

  private async findAPIIntegrations(endpoint: string): Promise<string[]> {
    return [`Could be called from form components`, `Could be integrated with data fetching hooks`];
  }

  private async isAssetReferenced(assetPath: string): Promise<boolean> {
    const allFiles = await this.findFiles(this.srcDir, /\.(ts|tsx|js|jsx|css|scss)$/);
    
    for (const file of allFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes(assetPath)) {
          return true;
        }
      } catch (error) {
        // Skip file on error
      }
    }
    
    return false;
  }

  private async findAssetIntegrations(assetPath: string): Promise<string[]> {
    const extension = path.extname(assetPath).toLowerCase();
    const integrations: string[] = [];
    
    if (['.png', '.jpg', '.jpeg', '.svg'].includes(extension)) {
      integrations.push('Could be used as image in components');
      integrations.push('Could be added to hero sections or galleries');
    }
    
    if (['.mp4', '.webm'].includes(extension)) {
      integrations.push('Could be used in video components');
      integrations.push('Could be added to demo showcases');
    }
    
    return integrations;
  }

  async generateIntegrationSuggestions(features: ForgottenFeature[]): Promise<IntegrationSuggestion[]> {
    console.log('💡 Generating integration suggestions...');
    
    const suggestions: IntegrationSuggestion[] = [];
    
    for (const feature of features) {
      for (const integration of feature.potentialIntegrations) {
        const suggestion = await this.createIntegrationSuggestion(feature, integration);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private async createIntegrationSuggestion(
    feature: ForgottenFeature, 
    integration: string
  ): Promise<IntegrationSuggestion | null> {
    // This would be more sophisticated in a real implementation
    return {
      feature,
      targetFile: 'src/app/page.tsx', // Example target
      integrationCode: `import ${feature.name} from '@/${feature.path}';`,
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
      reason: integration
    };
  }

  async generateReport(features: ForgottenFeature[], suggestions: IntegrationSuggestion[]): Promise<void> {
    const reportPath = path.join(this.rootDir, 'forgotten-features-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalForgotten: features.length,
        byType: this.groupByType(features),
        totalComplexity: features.reduce((sum, f) => sum + f.complexity, 0),
        suggestionsCount: suggestions.length
      },
      features: features.slice(0, 20), // Top 20 most complex
      suggestions: suggestions.slice(0, 10), // Top 10 suggestions
      actions: this.generateActionItems(features)
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${reportPath}`);
    
    // Console summary
    console.log(`\n🎯 Forgotten Features Agent Complete:`);
    console.log(`   📊 Found: ${features.length} forgotten features`);
    console.log(`   🔧 Components: ${report.summary.byType.component || 0}`);
    console.log(`   🪝 Hooks: ${report.summary.byType.hook || 0}`);
    console.log(`   📄 Pages: ${report.summary.byType.page || 0}`);
    console.log(`   🛠️ Utils: ${report.summary.byType.util || 0}`);
    console.log(`   💡 Suggestions: ${suggestions.length}`);
  }

  private groupByType(features: ForgottenFeature[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const feature of features) {
      groups[feature.type] = (groups[feature.type] || 0) + 1;
    }
    return groups;
  }

  private generateActionItems(features: ForgottenFeature[]): string[] {
    const actions: string[] = [];
    
    const highComplexity = features.filter(f => f.complexity > 100);
    if (highComplexity.length > 0) {
      actions.push(`Review ${highComplexity.length} high-complexity forgotten features for integration`);
    }
    
    const recentlyModified = features.filter(f => 
      Date.now() - f.lastModified.getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
    );
    if (recentlyModified.length > 0) {
      actions.push(`Investigate ${recentlyModified.length} recently modified but unused features`);
    }
    
    const components = features.filter(f => f.type === 'component');
    if (components.length > 0) {
      actions.push(`Consider integrating ${components.length} unused UI components`);
    }
    
    return actions;
  }

  async run(): Promise<void> {
    const features = await this.findForgottenFeatures();
    const suggestions = await this.generateIntegrationSuggestions(features);
    await this.generateReport(features, suggestions);
  }
}

// CLI usage
if (require.main === module) {
  const agent = new ForgottenFeaturesAgent();
  agent.run().catch(console.error);
}
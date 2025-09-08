#!/usr/bin/env ts-node

/**
 * Typography Master Agent - Ensures Apple-style typography consistency
 * Based on Apple's Human Interface Guidelines and design principles
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TypographyRule {
  name: string;
  category: 'hierarchy' | 'spacing' | 'font' | 'color' | 'responsive';
  severity: 'error' | 'warning' | 'suggestion';
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  description: string;
  appleGuideline: string;
}

interface TypographyIssue {
  file: string;
  line: number;
  column: number;
  rule: string;
  severity: 'error' | 'warning' | 'suggestion';
  current: string;
  suggested: string;
  description: string;
  appleGuideline: string;
}

interface TypographyReport {
  timestamp: string;
  summary: {
    filesAnalyzed: number;
    issuesFound: number;
    issuesFixed: number;
    consistencyScore: number;
  };
  issues: TypographyIssue[];
  recommendations: string[];
  designSystem: {
    fontStack: string[];
    typeScale: string[];
    colorTokens: string[];
    spacingTokens: string[];
  };
}

export class TypographyMasterAgent {
  private readonly rootDir: string;
  private readonly srcDir: string;
  private readonly rules: TypographyRule[];
  private readonly appleDesignTokens: {
    fonts: Map<string, string>;
    sizes: Map<string, string>;
    weights: Map<string, string>;
    colors: Map<string, string>;
    spacing: Map<string, string>;
  };

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
    this.rules = this.initializeTypographyRules();
    this.appleDesignTokens = this.initializeAppleDesignTokens();
  }

  private initializeAppleDesignTokens() {
    return {
      fonts: new Map([
        // Apple's font hierarchy
        ['system-font', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'],
        ['display-font', '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'],
        ['text-font', '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif'],
        ['mono-font', 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'],
      ]),
      
      sizes: new Map([
        // Apple's type scale (based on SF Pro)
        ['text-6xl', '3.75rem'], // 60px - Large Title
        ['text-5xl', '3rem'],    // 48px - Title 1
        ['text-4xl', '2.25rem'], // 36px - Title 2
        ['text-3xl', '1.875rem'], // 30px - Title 3
        ['text-2xl', '1.5rem'],  // 24px - Headline
        ['text-xl', '1.25rem'],  // 20px - Body Large
        ['text-lg', '1.125rem'], // 18px - Body
        ['text-base', '1rem'],   // 16px - Callout
        ['text-sm', '0.875rem'], // 14px - Subheadline
        ['text-xs', '0.75rem'],  // 12px - Footnote
        ['text-2xs', '0.625rem'], // 10px - Caption 2
      ]),
      
      weights: new Map([
        ['font-ultralight', '100'], // Ultra Light
        ['font-thin', '200'],       // Thin
        ['font-light', '300'],      // Light
        ['font-normal', '400'],     // Regular
        ['font-medium', '500'],     // Medium
        ['font-semibold', '600'],   // Semibold
        ['font-bold', '700'],       // Bold
        ['font-heavy', '800'],      // Heavy
        ['font-black', '900'],      // Black
      ]),
      
      colors: new Map([
        // Apple's semantic colors
        ['text-primary', 'rgb(0, 0, 0)'],           // Primary text
        ['text-secondary', 'rgb(108, 117, 125)'],   // Secondary text
        ['text-tertiary', 'rgb(174, 179, 183)'],    // Tertiary text
        ['text-quaternary', 'rgb(209, 213, 219)'],  // Quaternary text
        ['text-blue', 'rgb(0, 122, 255)'],          // System blue
        ['text-green', 'rgb(52, 199, 89)'],         // System green
        ['text-red', 'rgb(255, 59, 48)'],           // System red
        ['text-orange', 'rgb(255, 149, 0)'],        // System orange
      ]),
      
      spacing: new Map([
        // Apple's spatial system
        ['leading-none', '1'],
        ['leading-tight', '1.25'],   // -0.374pts (tight)
        ['leading-snug', '1.375'],   // -0.21pts (default)
        ['leading-normal', '1.5'],   // 0pts (relaxed)
        ['leading-relaxed', '1.625'], // +0.21pts
        ['leading-loose', '2'],      // Large spacing
      ])
    };
  }

  private initializeTypographyRules(): TypographyRule[] {
    return [
      // Font Family Rules
      {
        name: 'use-system-font-stack',
        category: 'font',
        severity: 'error',
        pattern: /font-family:\s*["']?(?!-apple-system|ui-)[^"';]+["']?/gi,
        replacement: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        description: 'Use Apple system font stack for consistency',
        appleGuideline: 'Use the system font to maintain consistency with the platform'
      },
      
      // Typography Hierarchy Rules
      {
        name: 'consistent-heading-hierarchy',
        category: 'hierarchy',
        severity: 'warning',
        pattern: /<h[1-6][^>]*className="[^"]*text-(xs|sm|base|lg|xl)"[^>]*>/gi,
        replacement: (match) => {
          // Extract heading level and suggest appropriate size
          const headingMatch = match.match(/<h([1-6])/);
          if (!headingMatch) return match;
          
          const level = parseInt(headingMatch[1]);
          const sizeMap = {
            1: 'text-5xl', // 48px
            2: 'text-4xl', // 36px
            3: 'text-3xl', // 30px
            4: 'text-2xl', // 24px
            5: 'text-xl',  // 20px
            6: 'text-lg'   // 18px
          };
          
          return match.replace(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/, sizeMap[level as keyof typeof sizeMap] || 'text-lg');
        },
        description: 'Maintain consistent heading hierarchy with Apple-style type scale',
        appleGuideline: 'Use a consistent type hierarchy that follows logical information structure'
      },
      
      // Line Height Rules
      {
        name: 'optimal-line-height',
        category: 'spacing',
        severity: 'warning',
        pattern: /leading-(none|tight|normal|relaxed|loose)/g,
        replacement: (match) => {
          const sizeContext = match.includes('text-') ? match.match(/text-(\w+)/)?.[1] : 'base';
          
          // Apple's line height recommendations
          const lineHeightMap: Record<string, string> = {
            '6xl': 'leading-none',    // Large titles: tight
            '5xl': 'leading-tight',   // Title 1: tight
            '4xl': 'leading-tight',   // Title 2: tight  
            '3xl': 'leading-snug',    // Title 3: snug
            '2xl': 'leading-snug',    // Headline: snug
            'xl': 'leading-normal',   // Body Large: normal
            'lg': 'leading-normal',   // Body: normal
            'base': 'leading-normal', // Callout: normal
            'sm': 'leading-relaxed',  // Subheadline: relaxed
            'xs': 'leading-relaxed'   // Footnote: relaxed
          };
          
          return lineHeightMap[sizeContext || 'base'] || 'leading-normal';
        },
        description: 'Use Apple-recommended line heights for optimal readability',
        appleGuideline: 'Adjust line spacing to improve readability and visual hierarchy'
      },
      
      // Color Contrast Rules
      {
        name: 'sufficient-color-contrast',
        category: 'color',
        severity: 'error',
        pattern: /text-gray-[1-4]00\b/g,
        replacement: 'text-gray-600', // Minimum for accessibility
        description: 'Ensure sufficient color contrast for accessibility (4.5:1 ratio minimum)',
        appleGuideline: 'Provide sufficient contrast between text and background colors'
      },
      
      // Responsive Typography
      {
        name: 'responsive-text-sizing',
        category: 'responsive',
        severity: 'suggestion',
        pattern: /className="[^"]*text-\w+(?:\s+(?!sm:|md:|lg:|xl:))/g,
        replacement: (match) => {
          // Add responsive prefixes for better mobile experience
          const sizeMatch = match.match(/text-(\w+)/);
          if (!sizeMatch) return match;
          
          const size = sizeMatch[1];
          const responsiveMap: Record<string, string> = {
            '6xl': 'text-4xl md:text-5xl lg:text-6xl',
            '5xl': 'text-3xl md:text-4xl lg:text-5xl',
            '4xl': 'text-2xl md:text-3xl lg:text-4xl',
            '3xl': 'text-xl md:text-2xl lg:text-3xl',
            '2xl': 'text-lg md:text-xl lg:text-2xl',
            'xl': 'text-base md:text-lg lg:text-xl'
          };
          
          const responsive = responsiveMap[size];
          return responsive ? match.replace(`text-${size}`, responsive) : match;
        },
        description: 'Use responsive text sizing for better mobile experience',
        appleGuideline: 'Scale typography appropriately across different screen sizes'
      },
      
      // Letter Spacing Rules  
      {
        name: 'optimal-letter-spacing',
        category: 'spacing',
        severity: 'suggestion',
        pattern: /tracking-(tighter|tight|normal|wide|wider|widest)/g,
        replacement: (match) => {
          // Apple uses subtle letter spacing adjustments
          const spacingMap: Record<string, string> = {
            'tracking-tighter': 'tracking-tight',   // -0.05em → -0.025em
            'tracking-tight': 'tracking-tight',     // Keep tight
            'tracking-normal': 'tracking-normal',   // Keep normal
            'tracking-wide': 'tracking-normal',     // Wide → normal
            'tracking-wider': 'tracking-normal',    // Wider → normal  
            'tracking-widest': 'tracking-wide'      // Widest → wide
          };
          
          return spacingMap[match] || 'tracking-normal';
        },
        description: 'Use subtle letter spacing following Apple typography principles',
        appleGuideline: 'Use minimal letter spacing adjustments for clean, readable text'
      }
    ];
  }

  async analyzeTypography(): Promise<TypographyReport> {
    console.log('🎨 Analyzing typography consistency...');
    
    const allFiles = await this.findFiles(this.srcDir, /\.(tsx|jsx|ts|js|css|scss)$/);
    const issues: TypographyIssue[] = [];
    
    for (const file of allFiles) {
      const fileIssues = await this.analyzeFile(file);
      issues.push(...fileIssues);
    }
    
    const consistencyScore = this.calculateConsistencyScore(issues, allFiles.length);
    
    const report: TypographyReport = {
      timestamp: new Date().toISOString(),
      summary: {
        filesAnalyzed: allFiles.length,
        issuesFound: issues.length,
        issuesFixed: 0, // Will be updated after fixes
        consistencyScore
      },
      issues: issues.sort((a, b) => {
        const severityOrder = { error: 0, warning: 1, suggestion: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      recommendations: this.generateRecommendations(issues),
      designSystem: {
        fontStack: Array.from(this.appleDesignTokens.fonts.values()),
        typeScale: Array.from(this.appleDesignTokens.sizes.entries()).map(([key, value]) => `${key}: ${value}`),
        colorTokens: Array.from(this.appleDesignTokens.colors.entries()).map(([key, value]) => `${key}: ${value}`),
        spacingTokens: Array.from(this.appleDesignTokens.spacing.entries()).map(([key, value]) => `${key}: ${value}`)
      }
    };
    
    return report;
  }

  private async analyzeFile(filePath: string): Promise<TypographyIssue[]> {
    const issues: TypographyIssue[] = [];
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        for (const rule of this.rules) {
          const matches = Array.from(line.matchAll(rule.pattern));
          
          for (const match of matches) {
            if (match.index === undefined) continue;
            
            const suggested = typeof rule.replacement === 'function' 
              ? rule.replacement(match[0])
              : rule.replacement;
            
            // Skip if suggested is the same as current
            if (suggested === match[0]) continue;
            
            issues.push({
              file: path.relative(this.rootDir, filePath),
              line: lineIndex + 1,
              column: match.index + 1,
              rule: rule.name,
              severity: rule.severity,
              current: match[0],
              suggested,
              description: rule.description,
              appleGuideline: rule.appleGuideline
            });
          }
        }
      }
      
      // Additional analysis for component-level issues
      const componentIssues = await this.analyzeComponentTypography(filePath, content);
      issues.push(...componentIssues);
      
    } catch (error) {
      console.warn(`⚠️ Could not analyze ${filePath}:`, error);
    }
    
    return issues;
  }

  private async analyzeComponentTypography(filePath: string, content: string): Promise<TypographyIssue[]> {
    const issues: TypographyIssue[] = [];
    
    // Check for missing typography classes in components
    const componentMatches = content.matchAll(/<(h[1-6]|p|span|div)[^>]*>/gi);
    
    for (const match of componentMatches) {
      const element = match[0];
      const tagName = match[1].toLowerCase();
      
      // Check if headings have proper typography classes
      if (/^h[1-6]$/.test(tagName)) {
        if (!element.includes('text-') || !element.includes('font-')) {
          const lineIndex = content.substring(0, match.index).split('\n').length - 1;
          
          issues.push({
            file: path.relative(this.rootDir, filePath),
            line: lineIndex + 1,
            column: (match.index || 0) + 1,
            rule: 'missing-heading-styles',
            severity: 'warning',
            current: element,
            suggested: this.suggestHeadingStyles(tagName, element),
            description: `Heading ${tagName} should have explicit typography classes`,
            appleGuideline: 'Define clear visual hierarchy with consistent styling'
          });
        }
      }
      
      // Check for inconsistent spacing
      if (element.includes('mb-') && element.includes('mt-')) {
        const spacing = this.extractSpacingValues(element);
        if (spacing.marginTop !== spacing.marginBottom && Math.abs(spacing.marginTop - spacing.marginBottom) > 2) {
          const lineIndex = content.substring(0, match.index).split('\n').length - 1;
          
          issues.push({
            file: path.relative(this.rootDir, filePath),
            line: lineIndex + 1,
            column: (match.index || 0) + 1,
            rule: 'inconsistent-vertical-spacing',
            severity: 'suggestion',
            current: element,
            suggested: this.suggestConsistentSpacing(element),
            description: 'Use consistent vertical spacing following Apple design principles',
            appleGuideline: 'Maintain consistent spacing relationships between elements'
          });
        }
      }
    }
    
    return issues;
  }

  private suggestHeadingStyles(tagName: string, element: string): string {
    const levelMap: Record<string, string> = {
      'h1': 'text-5xl font-bold tracking-tight',
      'h2': 'text-4xl font-bold tracking-tight', 
      'h3': 'text-3xl font-semibold tracking-tight',
      'h4': 'text-2xl font-semibold tracking-tight',
      'h5': 'text-xl font-medium',
      'h6': 'text-lg font-medium'
    };
    
    const suggestedClasses = levelMap[tagName] || 'text-lg font-medium';
    
    if (element.includes('className="')) {
      return element.replace(/className="([^"]*)"/, `className="$1 ${suggestedClasses}"`);
    } else {
      return element.replace('>', ` className="${suggestedClasses}">`);
    }
  }

  private extractSpacingValues(element: string): { marginTop: number, marginBottom: number } {
    const mtMatch = element.match(/mt-(\d+)/);
    const mbMatch = element.match(/mb-(\d+)/);
    
    return {
      marginTop: mtMatch ? parseInt(mtMatch[1]) : 0,
      marginBottom: mbMatch ? parseInt(mbMatch[1]) : 0
    };
  }

  private suggestConsistentSpacing(element: string): string {
    const spacing = this.extractSpacingValues(element);
    const avgSpacing = Math.round((spacing.marginTop + spacing.marginBottom) / 2);
    
    return element
      .replace(/mt-\d+/, `mt-${avgSpacing}`)
      .replace(/mb-\d+/, `mb-${avgSpacing}`);
  }

  private calculateConsistencyScore(issues: TypographyIssue[], fileCount: number): number {
    const errorWeight = 10;
    const warningWeight = 5;
    const suggestionWeight = 1;
    
    const totalPenalty = issues.reduce((sum, issue) => {
      switch (issue.severity) {
        case 'error': return sum + errorWeight;
        case 'warning': return sum + warningWeight;
        case 'suggestion': return sum + suggestionWeight;
        default: return sum;
      }
    }, 0);
    
    const maxPossibleScore = fileCount * 100;
    const score = Math.max(0, Math.min(100, 100 - (totalPenalty / maxPossibleScore) * 100));
    
    return Math.round(score);
  }

  private generateRecommendations(issues: TypographyIssue[]): string[] {
    const recommendations: string[] = [];
    
    const errorCount = issues.filter(i => i.severity === 'error').length;
    if (errorCount > 0) {
      recommendations.push(`Fix ${errorCount} critical typography errors for brand consistency`);
    }
    
    const fontIssues = issues.filter(i => i.rule.includes('font')).length;
    if (fontIssues > 5) {
      recommendations.push('Standardize font usage across components using Apple system fonts');
    }
    
    const hierarchyIssues = issues.filter(i => i.rule.includes('hierarchy')).length;
    if (hierarchyIssues > 3) {
      recommendations.push('Establish consistent heading hierarchy following Apple design principles');
    }
    
    const responsiveIssues = issues.filter(i => i.rule.includes('responsive')).length;
    if (responsiveIssues > 2) {
      recommendations.push('Implement responsive typography for better mobile experience');
    }
    
    const colorIssues = issues.filter(i => i.rule.includes('color')).length;
    if (colorIssues > 0) {
      recommendations.push('Ensure sufficient color contrast for accessibility compliance');
    }
    
    // Global recommendations
    recommendations.push('Create a typography design system with standardized tokens');
    recommendations.push('Document typography guidelines for team consistency');
    
    return recommendations;
  }

  async fixTypographyIssues(issues: TypographyIssue[], autoFix = false): Promise<number> {
    console.log(`🔧 ${autoFix ? 'Fixing' : 'Analyzing'} typography issues...`);
    
    let fixedCount = 0;
    const fileChanges = new Map<string, string>();
    
    // Group issues by file
    const issuesByFile = new Map<string, TypographyIssue[]>();
    for (const issue of issues) {
      if (!issuesByFile.has(issue.file)) {
        issuesByFile.set(issue.file, []);
      }
      issuesByFile.get(issue.file)!.push(issue);
    }
    
    for (const [filePath, fileIssues] of issuesByFile) {
      try {
        const fullPath = path.resolve(this.rootDir, filePath);
        let content = await fs.readFile(fullPath, 'utf-8');
        const originalContent = content;
        
        // Sort issues by line number (descending) to avoid offset issues
        const sortedIssues = fileIssues.sort((a, b) => b.line - a.line);
        
        for (const issue of sortedIssues) {
          // Only auto-fix errors and warnings, not suggestions
          if (issue.severity === 'suggestion' && !autoFix) continue;
          
          // Apply the fix
          content = content.replace(issue.current, issue.suggested);
          
          if (content !== originalContent) {
            fixedCount++;
            console.log(`   ✅ Fixed ${issue.rule} in ${issue.file}:${issue.line}`);
          }
        }
        
        // Write back to file if changes were made
        if (content !== originalContent) {
          if (autoFix) {
            await fs.writeFile(fullPath, content, 'utf-8');
            console.log(`💾 Updated ${filePath}`);
          } else {
            fileChanges.set(filePath, content);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
      }
    }
    
    if (!autoFix && fileChanges.size > 0) {
      console.log(`\n📝 Run with --auto-fix to apply ${fixedCount} typography fixes`);
    }
    
    return fixedCount;
  }

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

  async generateDesignSystemConfig(): Promise<void> {
    const configPath = path.join(this.rootDir, 'typography-design-system.json');
    
    const designSystem = {
      fonts: Object.fromEntries(this.appleDesignTokens.fonts),
      sizes: Object.fromEntries(this.appleDesignTokens.sizes),
      weights: Object.fromEntries(this.appleDesignTokens.weights),
      colors: Object.fromEntries(this.appleDesignTokens.colors),
      spacing: Object.fromEntries(this.appleDesignTokens.spacing),
      rules: this.rules.map(rule => ({
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        description: rule.description,
        appleGuideline: rule.appleGuideline
      }))
    };
    
    await fs.writeFile(configPath, JSON.stringify(designSystem, null, 2));
    console.log(`📄 Design system config saved: ${configPath}`);
  }

  async generateReport(report: TypographyReport): Promise<void> {
    const reportPath = path.join(this.rootDir, 'typography-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Typography report saved: ${reportPath}`);
    
    // Console summary
    console.log(`\n🎨 Typography Master Agent Complete:`);
    console.log(`   📊 Files analyzed: ${report.summary.filesAnalyzed}`);
    console.log(`   🔍 Issues found: ${report.summary.issuesFound}`);
    console.log(`   ✅ Consistency score: ${report.summary.consistencyScore}/100`);
    console.log(`   📝 Top recommendations:`);
    report.recommendations.slice(0, 3).forEach(rec => {
      console.log(`     • ${rec}`);
    });
  }

  async run(options: { autoFix?: boolean } = {}): Promise<void> {
    const { autoFix = false } = options;
    
    const report = await this.analyzeTypography();
    
    if (report.issues.length > 0) {
      const fixedCount = await this.fixTypographyIssues(report.issues, autoFix);
      report.summary.issuesFixed = fixedCount;
    }
    
    await this.generateReport(report);
    await this.generateDesignSystemConfig();
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const autoFix = args.includes('--auto-fix');
  
  const agent = new TypographyMasterAgent();
  agent.run({ autoFix }).catch(console.error);
}
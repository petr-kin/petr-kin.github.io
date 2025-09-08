#!/usr/bin/env ts-node

/**
 * Code Fix Agent - Identifies and fixes code issues automatically
 * Based on actual codebase analysis and TypeScript diagnostics
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CodeIssue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  category: 'typescript' | 'eslint' | 'import' | 'unused' | 'performance';
}

interface FixResult {
  file: string;
  issuesFound: number;
  issuesFixed: number;
  unfixableIssues: CodeIssue[];
  appliedFixes: string[];
}

export class CodeFixAgent {
  private readonly srcDir: string;
  private readonly rootDir: string;
  private readonly fixPatterns: Map<string, (content: string, issue: CodeIssue) => string>;

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
    this.fixPatterns = this.initializeFixPatterns();
  }

  private initializeFixPatterns(): Map<string, (content: string, issue: CodeIssue) => string> {
    return new Map([
      // Missing imports fixes
      ['TS2304', this.fixMissingImport.bind(this)],
      ['TS2307', this.fixModuleNotFound.bind(this)],
      
      // Type fixes
      ['TS2322', this.fixTypeAssignment.bind(this)],
      ['TS2345', this.fixArgumentType.bind(this)],
      ['TS2339', this.fixPropertyMissing.bind(this)],
      
      // React/Next.js specific
      ['TS6133', this.fixUnusedVariable.bind(this)],
      ['TS2786', this.fixReactProps.bind(this)],
      
      // Import/Export fixes
      ['TS1192', this.fixDuplicateImport.bind(this)],
      ['TS1005', this.fixSyntaxError.bind(this)],
    ]);
  }

  async analyzeCodeIssues(): Promise<CodeIssue[]> {
    console.log('🔍 Analyzing code issues...');
    
    const issues: CodeIssue[] = [];
    
    try {
      // Run TypeScript compiler check
      const { stdout: tscOutput } = await execAsync('npx tsc --noEmit --pretty false', {
        cwd: this.rootDir
      });
      
      if (tscOutput) {
        issues.push(...this.parseTypeScriptErrors(tscOutput));
      }
    } catch (error: any) {
      if (error.stdout) {
        issues.push(...this.parseTypeScriptErrors(error.stdout));
      }
    }

    try {
      // Run ESLint check
      const { stdout: eslintOutput } = await execAsync('npx eslint src --format json', {
        cwd: this.rootDir
      });
      
      if (eslintOutput) {
        issues.push(...this.parseESLintErrors(eslintOutput));
      }
    } catch (error: any) {
      if (error.stdout) {
        issues.push(...this.parseESLintErrors(error.stdout));
      }
    }

    // Custom analysis for forgotten components
    const forgottenIssues = await this.findForgottenComponents();
    issues.push(...forgottenIssues);

    console.log(`📊 Found ${issues.length} total issues`);
    return issues;
  }

  private parseTypeScriptErrors(output: string): CodeIssue[] {
    const issues: CodeIssue[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(.+)\((\d+),(\d+)\):\s+(error|warning|info)\s+TS(\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineStr, colStr, severity, code, message] = match;
        issues.push({
          file: path.relative(this.rootDir, file),
          line: parseInt(lineStr),
          column: parseInt(colStr),
          severity: severity as 'error' | 'warning' | 'info',
          code: `TS${code}`,
          message,
          category: 'typescript'
        });
      }
    }
    
    return issues;
  }

  private parseESLintErrors(output: string): CodeIssue[] {
    try {
      const eslintResults = JSON.parse(output);
      const issues: CodeIssue[] = [];
      
      for (const result of eslintResults) {
        for (const message of result.messages) {
          issues.push({
            file: path.relative(this.rootDir, result.filePath),
            line: message.line,
            column: message.column,
            severity: message.severity === 2 ? 'error' : 'warning',
            code: message.ruleId || 'ESLINT',
            message: message.message,
            category: 'eslint'
          });
        }
      }
      
      return issues;
    } catch {
      return [];
    }
  }

  async findForgottenComponents(): Promise<CodeIssue[]> {
    console.log('🔍 Searching for forgotten components...');
    const issues: CodeIssue[] = [];
    
    try {
      // Find all component files
      const componentFiles = await this.findFiles(this.srcDir, /\.(tsx|jsx)$/);
      
      // Find all import statements in the codebase
      const allImports = new Set<string>();
      const allFiles = await this.findFiles(this.srcDir, /\.(ts|tsx|js|jsx)$/);
      
      for (const file of allFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const importMatches = content.matchAll(/import.*?from\s+['"`](.+?)['"`]/g);
        for (const match of importMatches) {
          allImports.add(match[1]);
        }
      }
      
      // Check for components that are never imported
      for (const componentFile of componentFiles) {
        const relativePath = path.relative(this.srcDir, componentFile);
        const componentName = path.basename(componentFile, path.extname(componentFile));
        
        // Skip if it's already imported somewhere
        const isImported = Array.from(allImports).some(importPath => 
          importPath.includes(componentName) || importPath.includes(relativePath)
        );
        
        if (!isImported && !this.isEntryPoint(componentFile)) {
          issues.push({
            file: relativePath,
            line: 1,
            column: 1,
            severity: 'warning',
            code: 'FORGOTTEN_COMPONENT',
            message: `Component '${componentName}' appears to be unused/forgotten`,
            category: 'unused'
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Error finding forgotten components:', error);
    }
    
    return issues;
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

  private isEntryPoint(filePath: string): boolean {
    const entryPoints = [
      'page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx', 
      'not-found.tsx', 'global-error.tsx', 'route.ts', 'middleware.ts'
    ];
    const fileName = path.basename(filePath);
    return entryPoints.includes(fileName);
  }

  async fixIssue(issue: CodeIssue, content: string): Promise<string | null> {
    const fixFunction = this.fixPatterns.get(issue.code);
    if (fixFunction) {
      try {
        return fixFunction(content, issue);
      } catch (error) {
        console.warn(`⚠️ Failed to fix ${issue.code}:`, error);
        return null;
      }
    }
    return null;
  }

  private fixMissingImport(content: string, issue: CodeIssue): string {
    // Extract missing identifier from error message
    const match = issue.message.match(/Cannot find name '(\w+)'/);
    if (!match) return content;
    
    const identifier = match[1];
    const commonImports = {
      'React': "import React from 'react';",
      'useState': "import { useState } from 'react';",
      'useEffect': "import { useEffect } from 'react';",
      'useCallback': "import { useCallback } from 'react';",
      'useMemo': "import { useMemo } from 'react';",
      'motion': "import { motion } from 'framer-motion';",
      'AnimatePresence': "import { AnimatePresence } from 'framer-motion';",
      'clsx': "import clsx from 'clsx';",
      'cn': "import { cn } from '@/lib/utils';",
    };
    
    const importStatement = commonImports[identifier as keyof typeof commonImports];
    if (importStatement) {
      // Add import at the top, after existing imports
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Find last import line
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ') || lines[i].startsWith("import'") || lines[i].startsWith('import"')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          break;
        } else if (insertIndex > 0 && !lines[i].startsWith('import')) {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, importStatement);
      return lines.join('\n');
    }
    
    return content;
  }

  private fixModuleNotFound(content: string, issue: CodeIssue): string {
    // Fix common module path issues
    const fixes = new Map([
      ["Cannot find module '@/components", (content: string) => 
        content.replace(/@\/components(?!\/)/g, '@/components')],
      ["Cannot find module '@/lib", (content: string) => 
        content.replace(/@\/lib(?!\/)/g, '@/lib')],
      ["Cannot find module '@/hooks", (content: string) => 
        content.replace(/@\/hooks(?!\/)/g, '@/hooks')],
    ]);
    
    for (const [pattern, fix] of fixes) {
      if (issue.message.includes(pattern)) {
        return fix(content);
      }
    }
    
    return content;
  }

  private fixTypeAssignment(content: string, issue: CodeIssue): string {
    // Fix common type assignment issues
    if (issue.message.includes("Type 'undefined' is not assignable")) {
      // Add optional chaining or default values
      const lines = content.split('\n');
      const line = lines[issue.line - 1];
      if (line && line.includes('=')) {
        lines[issue.line - 1] = line.replace(/(\w+)\s*=\s*(.+)/, '$1 = $2 || ""');
        return lines.join('\n');
      }
    }
    return content;
  }

  private fixArgumentType(content: string, issue: CodeIssue): string {
    // Fix argument type mismatches
    return content;
  }

  private fixPropertyMissing(content: string, issue: CodeIssue): string {
    // Fix missing property access
    if (issue.message.includes("Property") && issue.message.includes("does not exist")) {
      const lines = content.split('\n');
      const line = lines[issue.line - 1];
      if (line) {
        // Add optional chaining
        lines[issue.line - 1] = line.replace(/\.(\w+)(?!\?)/g, '?.$1');
        return lines.join('\n');
      }
    }
    return content;
  }

  private fixUnusedVariable(content: string, issue: CodeIssue): string {
    // Remove or prefix unused variables
    const match = issue.message.match(/'(\w+)' is declared but never used/);
    if (match) {
      const variable = match[1];
      const lines = content.split('\n');
      const line = lines[issue.line - 1];
      
      if (line) {
        // Prefix with underscore or remove if it's a simple declaration
        lines[issue.line - 1] = line.replace(new RegExp(`\\b${variable}\\b`), `_${variable}`);
        return lines.join('\n');
      }
    }
    return content;
  }

  private fixReactProps(content: string, issue: CodeIssue): string {
    // Fix React component prop issues
    return content;
  }

  private fixDuplicateImport(content: string, issue: CodeIssue): string {
    // Remove duplicate imports
    const lines = content.split('\n');
    const importLines = new Set<string>();
    const filteredLines: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('import ')) {
        if (!importLines.has(line.trim())) {
          importLines.add(line.trim());
          filteredLines.push(line);
        }
      } else {
        filteredLines.push(line);
      }
    }
    
    return filteredLines.join('\n');
  }

  private fixSyntaxError(content: string, issue: CodeIssue): string {
    // Fix common syntax errors
    return content;
  }

  async fixAllIssues(): Promise<FixResult[]> {
    console.log('🛠️ Starting automated code fixing...');
    
    const issues = await this.analyzeCodeIssues();
    const results: FixResult[] = [];
    
    // Group issues by file
    const issuesByFile = new Map<string, CodeIssue[]>();
    for (const issue of issues) {
      if (!issuesByFile.has(issue.file)) {
        issuesByFile.set(issue.file, []);
      }
      issuesByFile.get(issue.file)!.push(issue);
    }
    
    for (const [filePath, fileIssues] of issuesByFile) {
      const result = await this.fixFileIssues(filePath, fileIssues);
      results.push(result);
    }
    
    // Generate summary report
    const totalIssues = results.reduce((sum, r) => sum + r.issuesFound, 0);
    const totalFixed = results.reduce((sum, r) => sum + r.issuesFixed, 0);
    
    console.log(`\n✅ Code Fix Agent Complete:`);
    console.log(`   📊 Total Issues: ${totalIssues}`);
    console.log(`   🔧 Fixed: ${totalFixed}`);
    console.log(`   ❌ Remaining: ${totalIssues - totalFixed}`);
    
    return results;
  }

  private async fixFileIssues(filePath: string, issues: CodeIssue[]): Promise<FixResult> {
    const fullPath = path.resolve(this.rootDir, filePath);
    const result: FixResult = {
      file: filePath,
      issuesFound: issues.length,
      issuesFixed: 0,
      unfixableIssues: [],
      appliedFixes: []
    };
    
    try {
      let content = await fs.readFile(fullPath, 'utf-8');
      const originalContent = content;
      
      // Sort issues by line number (descending) to avoid offset issues
      const sortedIssues = issues.sort((a, b) => b.line - a.line);
      
      for (const issue of sortedIssues) {
        const fixedContent = await this.fixIssue(issue, content);
        
        if (fixedContent && fixedContent !== content) {
          content = fixedContent;
          result.issuesFixed++;
          result.appliedFixes.push(`${issue.code}: ${issue.message}`);
          console.log(`   ✅ Fixed ${issue.code} in ${filePath}:${issue.line}`);
        } else {
          result.unfixableIssues.push(issue);
          console.log(`   ❌ Could not fix ${issue.code} in ${filePath}:${issue.line}`);
        }
      }
      
      // Write back to file if changes were made
      if (content !== originalContent) {
        await fs.writeFile(fullPath, content, 'utf-8');
        console.log(`💾 Updated ${filePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
      result.unfixableIssues = issues;
    }
    
    return result;
  }

  async generateReport(results: FixResult[]): Promise<void> {
    const reportPath = path.join(this.rootDir, 'code-fix-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: results.length,
        totalIssues: results.reduce((sum, r) => sum + r.issuesFound, 0),
        totalFixed: results.reduce((sum, r) => sum + r.issuesFixed, 0),
        successRate: 0
      },
      results
    };
    
    report.summary.successRate = report.summary.totalIssues > 0 
      ? Math.round((report.summary.totalFixed / report.summary.totalIssues) * 100)
      : 100;
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${reportPath}`);
  }
}

// CLI usage
if (require.main === module) {
  const agent = new CodeFixAgent();
  agent.fixAllIssues()
    .then(results => agent.generateReport(results))
    .catch(console.error);
}
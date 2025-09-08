#!/usr/bin/env ts-node

/**
 * Backup/Copy Detection Agent - Identifies backup files vs actively developed features
 * Based on file patterns, git history, and content analysis
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

interface FileAnalysis {
  path: string;
  type: 'backup' | 'copy' | 'active' | 'abandoned' | 'template';
  confidence: number;
  reasons: string[];
  originalFile?: string;
  similarity?: number;
  lastModified: Date;
  gitStatus: 'tracked' | 'untracked' | 'ignored';
  recommendations: string[];
}

interface SimilarityMatch {
  file1: string;
  file2: string;
  similarity: number;
  type: 'exact' | 'near-identical' | 'similar' | 'different';
}

export class BackupDetectionAgent {
  private readonly rootDir: string;
  private readonly srcDir: string;
  private readonly backupPatterns: RegExp[];
  private readonly fileContents = new Map<string, string>();
  private readonly fileHashes = new Map<string, string>();

  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.srcDir = path.join(rootDir, 'src');
    
    this.backupPatterns = [
      /.*\.backup\./,
      /.*\.bak$/,
      /.*\.old$/,
      /.*-backup$/,
      /.*-old$/,
      /.*-copy$/,
      /.*\.copy\./,
      /.*_backup\./,
      /.*_old\./,
      /.*_copy\./,
      /.*-broken$/,
      /.*\.broken\./,
      /.*-temp$/,
      /.*\.temp\./,
      /.*-test$/,
      /.*\.test\./,
      /.*\s+copy(\s+\d+)?$/i,
      /.*\s+\(\d+\)$/,  // macOS/Windows copy pattern
      /.+\s-\s(Copy|copy)$/,
    ];
  }

  async analyzeFiles(): Promise<FileAnalysis[]> {
    console.log('🔍 Analyzing files for backups and copies...');
    
    const allFiles = await this.findAllFiles();
    const analyses: FileAnalysis[] = [];
    
    // Pre-load file contents and compute hashes
    await this.loadFileContents(allFiles);
    
    // Find similarity matches
    const similarities = await this.findSimilarFiles();
    
    // Analyze each file
    for (const file of allFiles) {
      const analysis = await this.analyzeFile(file, similarities);
      analyses.push(analysis);
    }
    
    console.log(`📊 Analyzed ${analyses.length} files`);
    
    return analyses.sort((a, b) => {
      // Sort by type priority and confidence
      const typePriority = { backup: 0, copy: 1, abandoned: 2, template: 3, active: 4 };
      const aPriority = typePriority[a.type] || 5;
      const bPriority = typePriority[b.type] || 5;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return b.confidence - a.confidence;
    });
  }

  private async findAllFiles(): Promise<string[]> {
    const files: string[] = [];
    
    // Find all source files
    const sourceFiles = await this.findFiles(this.srcDir, /\.(ts|tsx|js|jsx|css|scss|json|md)$/);
    files.push(...sourceFiles);
    
    // Also check root level files
    const rootFiles = await this.findFiles(this.rootDir, /\.(ts|tsx|js|jsx|json|md)$/, false);
    files.push(...rootFiles);
    
    return files;
  }

  private async findFiles(dir: string, pattern: RegExp, recursive = true): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (recursive && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            files.push(...await this.findFiles(fullPath, pattern, recursive));
          }
        } else if (entry.isFile() && pattern.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  private async loadFileContents(files: string[]): Promise<void> {
    console.log('📖 Loading file contents for analysis...');
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        this.fileContents.set(file, content);
        
        // Compute hash for similarity detection
        const hash = crypto.createHash('md5').update(content).digest('hex');
        this.fileHashes.set(file, hash);
      } catch (error) {
        console.warn(`⚠️ Could not read ${file}:`, error);
      }
    }
  }

  private async findSimilarFiles(): Promise<SimilarityMatch[]> {
    console.log('🔍 Finding similar files...');
    
    const similarities: SimilarityMatch[] = [];
    const files = Array.from(this.fileContents.keys());
    
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const file1 = files[i];
        const file2 = files[j];
        
        const similarity = this.calculateSimilarity(
          this.fileContents.get(file1)!,
          this.fileContents.get(file2)!
        );
        
        if (similarity > 0.7) { // 70% or higher similarity
          const type = this.getSimilarityType(similarity);
          similarities.push({ file1, file2, similarity, type });
        }
      }
    }
    
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  private calculateSimilarity(content1: string, content2: string): number {
    // Check for exact match first
    if (content1 === content2) {
      return 1.0;
    }
    
    // Use Jaccard similarity on lines
    const lines1 = new Set(content1.split('\n').map(line => line.trim()).filter(line => line.length > 0));
    const lines2 = new Set(content2.split('\n').map(line => line.trim()).filter(line => line.length > 0));
    
    const intersection = new Set([...lines1].filter(x => lines2.has(x)));
    const union = new Set([...lines1, ...lines2]);
    
    return intersection.size / union.size;
  }

  private getSimilarityType(similarity: number): 'exact' | 'near-identical' | 'similar' | 'different' {
    if (similarity === 1.0) return 'exact';
    if (similarity > 0.95) return 'near-identical';
    if (similarity > 0.7) return 'similar';
    return 'different';
  }

  private async analyzeFile(filePath: string, similarities: SimilarityMatch[]): Promise<FileAnalysis> {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(this.rootDir, filePath);
    const stats = await fs.stat(filePath);
    
    const analysis: FileAnalysis = {
      path: relativePath,
      type: 'active',
      confidence: 0,
      reasons: [],
      lastModified: stats.mtime,
      gitStatus: await this.getGitStatus(filePath),
      recommendations: []
    };
    
    // Check for backup patterns in filename
    const isBackupName = this.backupPatterns.some(pattern => pattern.test(fileName));
    if (isBackupName) {
      analysis.type = 'backup';
      analysis.confidence += 80;
      analysis.reasons.push('File name matches backup pattern');
      analysis.originalFile = this.findOriginalFile(fileName);
    }
    
    // Check for similarity with other files
    const similarFiles = similarities.filter(s => s.file1 === filePath || s.file2 === filePath);
    if (similarFiles.length > 0) {
      const bestMatch = similarFiles[0];
      const otherFile = bestMatch.file1 === filePath ? bestMatch.file2 : bestMatch.file1;
      const otherFileName = path.basename(otherFile);
      
      if (bestMatch.similarity > 0.95) {
        // Determine which is the backup
        if (isBackupName && !this.backupPatterns.some(p => p.test(otherFileName))) {
          analysis.type = 'copy';
          analysis.confidence += 90;
          analysis.reasons.push(`${Math.round(bestMatch.similarity * 100)}% similar to active file ${path.basename(otherFile)}`);
          analysis.originalFile = path.relative(this.rootDir, otherFile);
          analysis.similarity = bestMatch.similarity;
        } else if (!isBackupName && this.backupPatterns.some(p => p.test(otherFileName))) {
          // This is the original, other is backup
          analysis.type = 'active';
          analysis.reasons.push(`Original file (backup found: ${path.basename(otherFile)})`);
        } else {
          // Both have similar names, use modification time
          const otherStats = await fs.stat(otherFile);
          if (stats.mtime < otherStats.mtime) {
            analysis.type = 'copy';
            analysis.confidence += 70;
            analysis.reasons.push(`Older duplicate of ${path.basename(otherFile)}`);
            analysis.originalFile = path.relative(this.rootDir, otherFile);
          }
        }
      } else if (bestMatch.similarity > 0.8) {
        analysis.reasons.push(`${Math.round(bestMatch.similarity * 100)}% similar to ${path.basename(otherFile)}`);
        analysis.similarity = bestMatch.similarity;
      }
    }
    
    // Check git status
    if (analysis.gitStatus === 'untracked') {
      analysis.confidence += 20;
      analysis.reasons.push('File is not tracked in git');
    }
    
    // Check last modification date
    const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceModified > 90) {
      analysis.confidence += 30;
      analysis.reasons.push(`Not modified for ${Math.round(daysSinceModified)} days`);
      
      if (daysSinceModified > 365) {
        analysis.type = analysis.type === 'active' ? 'abandoned' : analysis.type;
        analysis.confidence += 40;
        analysis.reasons.push('File appears to be abandoned (>1 year old)');
      }
    }
    
    // Check for template patterns
    if (fileName.includes('template') || fileName.includes('example') || fileName.includes('sample')) {
      analysis.type = 'template';
      analysis.confidence += 60;
      analysis.reasons.push('Appears to be a template or example file');
    }
    
    // Check content for development status
    const content = this.fileContents.get(filePath);
    if (content) {
      if (content.includes('TODO') || content.includes('FIXME') || content.includes('HACK')) {
        analysis.reasons.push('Contains TODO/FIXME comments - may be incomplete');
      }
      
      if (content.includes('// BACKUP') || content.includes('/* BACKUP') || content.includes('<!-- BACKUP')) {
        analysis.type = 'backup';
        analysis.confidence += 70;
        analysis.reasons.push('Contains backup markers in comments');
      }
      
      if (content.includes('DEPRECATED') || content.includes('@deprecated')) {
        analysis.type = 'abandoned';
        analysis.confidence += 80;
        analysis.reasons.push('Marked as deprecated in code');
      }
    }
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);
    
    // Ensure confidence is within bounds
    analysis.confidence = Math.min(100, Math.max(0, analysis.confidence));
    
    return analysis;
  }

  private findOriginalFile(backupFileName: string): string | undefined {
    // Try to find the original file by removing backup suffixes
    let original = backupFileName;
    
    // Remove backup extensions
    original = original.replace(/\.backup\./g, '.');
    original = original.replace(/\.bak$/, '');
    original = original.replace(/\.old$/, '');
    original = original.replace(/-backup$/, '');
    original = original.replace(/-old$/, '');
    original = original.replace(/-copy$/, '');
    original = original.replace(/\.copy\./g, '.');
    original = original.replace(/_backup\./g, '.');
    original = original.replace(/_old\./g, '.');
    original = original.replace(/_copy\./g, '.');
    original = original.replace(/-broken$/, '');
    original = original.replace(/\.broken\./g, '.');
    original = original.replace(/\s+copy(\s+\d+)?$/i, '');
    original = original.replace(/\s+\(\d+\)$/, '');
    original = original.replace(/\s-\s(Copy|copy)$/, '');
    
    return original !== backupFileName ? original : undefined;
  }

  private async getGitStatus(filePath: string): Promise<'tracked' | 'untracked' | 'ignored'> {
    try {
      // Check if file is tracked in git
      const { stdout } = await execAsync(`git ls-files "${filePath}"`, { 
        cwd: this.rootDir,
        stdio: 'pipe'
      });
      
      if (stdout.trim()) {
        return 'tracked';
      }
      
      // Check if file is ignored
      const { stdout: ignored } = await execAsync(`git check-ignore "${filePath}"`, {
        cwd: this.rootDir,
        stdio: 'pipe'
      });
      
      if (ignored.trim()) {
        return 'ignored';
      }
      
      return 'untracked';
    } catch (error) {
      // Git command failed, assume untracked
      return 'untracked';
    }
  }

  private generateRecommendations(analysis: FileAnalysis): string[] {
    const recommendations: string[] = [];
    
    switch (analysis.type) {
      case 'backup':
        if (analysis.originalFile) {
          recommendations.push(`Delete if ${analysis.originalFile} is working correctly`);
        } else {
          recommendations.push('Review and delete if no longer needed');
        }
        recommendations.push('Archive to backup directory if historically important');
        break;
        
      case 'copy':
        if (analysis.originalFile) {
          recommendations.push(`Merge useful changes into ${analysis.originalFile} and delete`);
        }
        recommendations.push('Compare with original to identify differences');
        recommendations.push('Delete after confirming no unique changes');
        break;
        
      case 'abandoned':
        recommendations.push('Review for useful code before deletion');
        recommendations.push('Archive or move to deprecated folder');
        recommendations.push('Remove from active codebase');
        break;
        
      case 'template':
        recommendations.push('Move to templates or examples directory');
        recommendations.push('Document as template/example in README');
        break;
        
      case 'active':
        if (analysis.gitStatus === 'untracked') {
          recommendations.push('Add to git if this is an active file');
        }
        if (analysis.reasons.some(r => r.includes('similar'))) {
          recommendations.push('Review for potential consolidation with similar files');
        }
        break;
    }
    
    if (analysis.gitStatus === 'untracked' && analysis.type !== 'active') {
      recommendations.push('Safe to delete (not tracked in git)');
    }
    
    return recommendations;
  }

  async cleanupBackups(analyses: FileAnalysis[], dryRun = true): Promise<void> {
    console.log(`🧹 ${dryRun ? 'Simulating' : 'Executing'} backup cleanup...`);
    
    const toDelete = analyses.filter(a => 
      (a.type === 'backup' || a.type === 'copy') && 
      a.confidence > 80 &&
      a.gitStatus !== 'tracked'
    );
    
    for (const analysis of toDelete) {
      const fullPath = path.resolve(this.rootDir, analysis.path);
      
      if (dryRun) {
        console.log(`🗑️  Would delete: ${analysis.path} (${analysis.confidence}% confidence)`);
      } else {
        try {
          await fs.unlink(fullPath);
          console.log(`✅ Deleted: ${analysis.path}`);
        } catch (error) {
          console.error(`❌ Failed to delete ${analysis.path}:`, error);
        }
      }
    }
    
    console.log(`${dryRun ? 'Would delete' : 'Deleted'} ${toDelete.length} backup files`);
  }

  async generateReport(analyses: FileAnalysis[]): Promise<void> {
    const reportPath = path.join(this.rootDir, 'backup-detection-report.json');
    
    const summary = {
      totalFiles: analyses.length,
      byType: this.groupByType(analyses),
      byConfidence: {
        high: analyses.filter(a => a.confidence > 80).length,
        medium: analyses.filter(a => a.confidence > 50 && a.confidence <= 80).length,
        low: analyses.filter(a => a.confidence <= 50).length
      },
      byGitStatus: {
        tracked: analyses.filter(a => a.gitStatus === 'tracked').length,
        untracked: analyses.filter(a => a.gitStatus === 'untracked').length,
        ignored: analyses.filter(a => a.gitStatus === 'ignored').length
      }
    };
    
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      highConfidenceBackups: analyses.filter(a => 
        (a.type === 'backup' || a.type === 'copy') && a.confidence > 80
      ).slice(0, 20),
      abandonedFiles: analyses.filter(a => a.type === 'abandoned'),
      duplicateGroups: this.findDuplicateGroups(analyses),
      recommendations: this.generateGlobalRecommendations(analyses),
      allAnalyses: analyses
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${reportPath}`);
    
    // Console summary
    console.log(`\n🗂️  Backup Detection Agent Complete:`);
    console.log(`   📊 Total files analyzed: ${analyses.length}`);
    console.log(`   📁 Backups: ${summary.byType.backup || 0}`);
    console.log(`   📋 Copies: ${summary.byType.copy || 0}`);
    console.log(`   🗑️  Abandoned: ${summary.byType.abandoned || 0}`);
    console.log(`   📄 Templates: ${summary.byType.template || 0}`);
    console.log(`   🔧 Active: ${summary.byType.active || 0}`);
    console.log(`   ⚡ High confidence cleanups: ${summary.byConfidence.high}`);
  }

  private groupByType(analyses: FileAnalysis[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const analysis of analyses) {
      groups[analysis.type] = (groups[analysis.type] || 0) + 1;
    }
    return groups;
  }

  private findDuplicateGroups(analyses: FileAnalysis[]): Array<{group: string[], type: string}> {
    const groups: Array<{group: string[], type: string}> = [];
    
    // Group by similarity
    const processed = new Set<string>();
    
    for (const analysis of analyses) {
      if (processed.has(analysis.path)) continue;
      
      const similar = analyses.filter(a => 
        a.originalFile === analysis.path || analysis.originalFile === a.path ||
        (a.similarity && a.similarity > 0.9)
      );
      
      if (similar.length > 1) {
        const group = similar.map(a => a.path);
        groups.push({ group, type: 'similar' });
        group.forEach(path => processed.add(path));
      }
    }
    
    return groups;
  }

  private generateGlobalRecommendations(analyses: FileAnalysis[]): string[] {
    const recommendations: string[] = [];
    
    const backups = analyses.filter(a => a.type === 'backup' && a.confidence > 80);
    if (backups.length > 0) {
      recommendations.push(`Review and clean up ${backups.length} backup files`);
    }
    
    const copies = analyses.filter(a => a.type === 'copy' && a.confidence > 70);
    if (copies.length > 0) {
      recommendations.push(`Merge or delete ${copies.length} duplicate copies`);
    }
    
    const abandoned = analyses.filter(a => a.type === 'abandoned');
    if (abandoned.length > 0) {
      recommendations.push(`Archive or remove ${abandoned.length} abandoned files`);
    }
    
    const untracked = analyses.filter(a => a.gitStatus === 'untracked' && a.type === 'active');
    if (untracked.length > 0) {
      recommendations.push(`Add ${untracked.length} untracked active files to git`);
    }
    
    return recommendations;
  }

  async run(options: { cleanup?: boolean, dryRun?: boolean } = {}): Promise<void> {
    const { cleanup = false, dryRun = true } = options;
    
    const analyses = await this.analyzeFiles();
    
    if (cleanup) {
      await this.cleanupBackups(analyses, dryRun);
    }
    
    await this.generateReport(analyses);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const cleanup = args.includes('--cleanup');
  const execute = args.includes('--execute');
  
  const agent = new BackupDetectionAgent();
  agent.run({ 
    cleanup, 
    dryRun: !execute 
  }).catch(console.error);
}
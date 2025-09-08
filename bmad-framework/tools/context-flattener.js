#!/usr/bin/env node

/**
 * BMAD-METHOD Context Flattener
 * Prepares project files and context for AI model consumption
 * Based on BMAD-METHOD codebase flattener concepts
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class BMadContextFlattener {
    constructor() {
        this.config = {
            maxFileSize: 1024 * 1024, // 1MB
            excludePatterns: [
                'node_modules',
                '.git',
                '.DS_Store', 
                '*.log',
                'dist',
                'build',
                '.cache'
            ],
            includeExtensions: [
                '.js', '.ts', '.jsx', '.tsx',
                '.md', '.json', '.yml', '.yaml',
                '.css', '.scss', '.html',
                '.py', '.go', '.java', '.cs'
            ]
        };
    }

    async flattenProject(projectName, options = {}) {
        console.log(`🔍 Flattening project: ${projectName}`);
        
        const projectDir = path.join(__dirname, '../projects', projectName);
        
        if (!fs.existsSync(projectDir)) {
            throw new Error(`Project not found: ${projectName}`);
        }

        const flattenedData = {
            project: projectName,
            timestamp: new Date().toISOString(),
            structure: {},
            files: {},
            context: {},
            summary: {}
        };

        // Scan project structure
        flattenedData.structure = this.scanDirectory(projectDir);
        
        // Extract file contents
        flattenedData.files = this.extractFiles(projectDir, options);
        
        // Build context map
        flattenedData.context = this.buildContextMap(flattenedData.files);
        
        // Generate summary
        flattenedData.summary = this.generateSummary(flattenedData);
        
        // Save flattened output
        this.saveFlattened(projectName, flattenedData, options);
        
        console.log(`✅ Project flattened successfully`);
        console.log(`📊 Files processed: ${Object.keys(flattenedData.files).length}`);
        console.log(`📝 Total size: ${this.formatBytes(this.calculateTotalSize(flattenedData.files))}`);
        
        return flattenedData;
    }

    scanDirectory(dir, relativePath = '') {
        const structure = {
            type: 'directory',
            name: path.basename(dir),
            path: relativePath,
            children: {}
        };

        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                if (this.shouldExclude(item)) continue;
                
                const itemPath = path.join(dir, item);
                const itemRelativePath = path.join(relativePath, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    structure.children[item] = this.scanDirectory(itemPath, itemRelativePath);
                } else if (stats.isFile()) {
                    structure.children[item] = {
                        type: 'file',
                        name: item,
                        path: itemRelativePath,
                        size: stats.size,
                        modified: stats.mtime.toISOString(),
                        extension: path.extname(item)
                    };
                }
            }
        } catch (error) {
            structure.error = error.message;
        }

        return structure;
    }

    extractFiles(projectDir, options = {}) {
        const files = {};
        
        this.walkDirectory(projectDir, (filePath, relativePath) => {
            if (this.shouldExclude(path.basename(filePath))) return;
            if (!this.shouldIncludeFile(filePath)) return;
            
            try {
                const stats = fs.statSync(filePath);
                
                if (stats.size > this.config.maxFileSize) {
                    files[relativePath] = {
                        type: 'large-file',
                        size: stats.size,
                        error: 'File too large for processing',
                        summary: this.generateFileSummary(filePath)
                    };
                    return;
                }

                const content = fs.readFileSync(filePath, 'utf8');
                
                files[relativePath] = {
                    type: 'file',
                    extension: path.extname(filePath),
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    content: content,
                    hash: crypto.createHash('md5').update(content).digest('hex'),
                    lines: content.split('\n').length
                };
                
                // Add language-specific analysis
                files[relativePath].analysis = this.analyzeFile(filePath, content);
                
            } catch (error) {
                files[relativePath] = {
                    type: 'error',
                    error: error.message
                };
            }
        });
        
        return files;
    }

    walkDirectory(dir, callback, relativePath = '') {
        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const itemRelativePath = path.join(relativePath, item);
                const stats = fs.statSync(itemPath);
                
                if (stats.isDirectory()) {
                    this.walkDirectory(itemPath, callback, itemRelativePath);
                } else if (stats.isFile()) {
                    callback(itemPath, itemRelativePath);
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    shouldExclude(name) {
        return this.config.excludePatterns.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(name);
            }
            return name === pattern || name.includes(pattern);
        });
    }

    shouldIncludeFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.config.includeExtensions.includes(ext);
    }

    analyzeFile(filePath, content) {
        const analysis = {
            language: this.detectLanguage(filePath),
            complexity: this.calculateComplexity(content),
            imports: this.extractImports(content, path.extname(filePath)),
            exports: this.extractExports(content, path.extname(filePath)),
            functions: this.extractFunctions(content, path.extname(filePath)),
            classes: this.extractClasses(content, path.extname(filePath))
        };
        
        return analysis;
    }

    detectLanguage(filePath) {
        const ext = path.extname(filePath);
        const languageMap = {
            '.js': 'javascript',
            '.jsx': 'javascript-react',
            '.ts': 'typescript',
            '.tsx': 'typescript-react',
            '.py': 'python',
            '.go': 'go',
            '.java': 'java',
            '.cs': 'csharp',
            '.md': 'markdown',
            '.json': 'json',
            '.yml': 'yaml',
            '.yaml': 'yaml'
        };
        
        return languageMap[ext] || 'unknown';
    }

    calculateComplexity(content) {
        // Simple complexity calculation
        const lines = content.split('\n').length;
        const functions = (content.match(/function\s+\w+|=>\s*{|def\s+\w+/g) || []).length;
        const conditionals = (content.match(/if\s*\(|switch\s*\(|for\s*\(|while\s*\(/g) || []).length;
        
        return {
            lines,
            functions,
            conditionals,
            score: functions * 2 + conditionals * 1.5 + lines * 0.1
        };
    }

    extractImports(content, extension) {
        const imports = [];
        
        if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
            // JavaScript/TypeScript imports
            const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                imports.push(match[1] || match[2]);
            }
        }
        
        return imports;
    }

    extractExports(content, extension) {
        const exports = [];
        
        if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
            // JavaScript/TypeScript exports
            const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)|export\s*{\s*([^}]+)\s*}/g;
            let match;
            while ((match = exportRegex.exec(content)) !== null) {
                if (match[1]) {
                    exports.push(match[1]);
                } else if (match[2]) {
                    exports.push(...match[2].split(',').map(s => s.trim()));
                }
            }
        }
        
        return exports;
    }

    extractFunctions(content, extension) {
        const functions = [];
        
        if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
            const funcRegex = /(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>|\w+\s*=>))/g;
            let match;
            while ((match = funcRegex.exec(content)) !== null) {
                functions.push(match[1] || match[2]);
            }
        }
        
        return functions;
    }

    extractClasses(content, extension) {
        const classes = [];
        
        if (['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
            const classRegex = /class\s+(\w+)/g;
            let match;
            while ((match = classRegex.exec(content)) !== null) {
                classes.push(match[1]);
            }
        }
        
        return classes;
    }

    buildContextMap(files) {
        const context = {
            dependencies: new Set(),
            exports: {},
            imports: {},
            relationships: []
        };
        
        // Build dependency graph
        for (const [filePath, fileData] of Object.entries(files)) {
            if (fileData.type !== 'file') continue;
            
            if (fileData.analysis) {
                // Track dependencies
                fileData.analysis.imports.forEach(imp => context.dependencies.add(imp));
                
                // Map exports
                context.exports[filePath] = fileData.analysis.exports;
                
                // Map imports
                context.imports[filePath] = fileData.analysis.imports;
            }
        }
        
        return {
            dependencies: Array.from(context.dependencies),
            exports: context.exports,
            imports: context.imports
        };
    }

    generateSummary(flattenedData) {
        const summary = {
            fileCount: Object.keys(flattenedData.files).length,
            totalSize: this.calculateTotalSize(flattenedData.files),
            languages: {},
            complexity: {
                totalLines: 0,
                totalFunctions: 0,
                averageComplexity: 0
            },
            structure: this.summarizeStructure(flattenedData.structure)
        };
        
        // Analyze languages and complexity
        let totalComplexity = 0;
        for (const fileData of Object.values(flattenedData.files)) {
            if (fileData.type === 'file' && fileData.analysis) {
                const lang = fileData.analysis.language;
                summary.languages[lang] = (summary.languages[lang] || 0) + 1;
                
                summary.complexity.totalLines += fileData.analysis.complexity.lines;
                summary.complexity.totalFunctions += fileData.analysis.complexity.functions;
                totalComplexity += fileData.analysis.complexity.score;
            }
        }
        
        if (summary.fileCount > 0) {
            summary.complexity.averageComplexity = totalComplexity / summary.fileCount;
        }
        
        return summary;
    }

    summarizeStructure(structure, depth = 0) {
        if (depth > 3) return '[Deep nesting...]';
        
        const summary = {
            name: structure.name,
            type: structure.type
        };
        
        if (structure.children) {
            summary.children = {};
            for (const [name, child] of Object.entries(structure.children)) {
                summary.children[name] = this.summarizeStructure(child, depth + 1);
            }
        }
        
        return summary;
    }

    calculateTotalSize(files) {
        return Object.values(files).reduce((total, file) => {
            return total + (file.size || 0);
        }, 0);
    }

    generateFileSummary(filePath) {
        try {
            const stats = fs.statSync(filePath);
            const ext = path.extname(filePath);
            return `Large ${ext} file (${this.formatBytes(stats.size)}) - content not included`;
        } catch (error) {
            return 'File summary unavailable';
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    saveFlattened(projectName, flattenedData, options = {}) {
        const outputDir = path.join(__dirname, '../projects', projectName, '06-flattened');
        fs.mkdirSync(outputDir, { recursive: true });
        
        // Save complete flattened data
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFile = path.join(outputDir, `flattened-${timestamp}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(flattenedData, null, 2));
        
        // Save human-readable format
        const readableFile = path.join(outputDir, `flattened-readable-${timestamp}.md`);
        this.saveReadableFormat(readableFile, flattenedData);
        
        // Update latest symlinks
        const latestJson = path.join(outputDir, 'latest.json');
        const latestMd = path.join(outputDir, 'latest.md');
        
        [latestJson, latestMd].forEach(file => {
            if (fs.existsSync(file)) fs.unlinkSync(file);
        });
        
        fs.symlinkSync(path.basename(outputFile), latestJson);
        fs.symlinkSync(path.basename(readableFile), latestMd);
        
        console.log(`💾 Flattened data saved to: ${outputFile}`);
    }

    saveReadableFormat(filePath, flattenedData) {
        let content = `# ${flattenedData.project} - Flattened Context

**Generated:** ${new Date(flattenedData.timestamp).toLocaleString()}  
**Files:** ${flattenedData.summary.fileCount}  
**Total Size:** ${this.formatBytes(flattenedData.summary.totalSize)}

## Project Summary

### Languages
${Object.entries(flattenedData.summary.languages)
    .map(([lang, count]) => `- ${lang}: ${count} files`)
    .join('\n')}

### Complexity
- Total Lines: ${flattenedData.summary.complexity.totalLines}
- Total Functions: ${flattenedData.summary.complexity.totalFunctions}  
- Average Complexity: ${flattenedData.summary.complexity.averageComplexity.toFixed(2)}

## File Contents

`;

        // Add file contents
        for (const [filePath, fileData] of Object.entries(flattenedData.files)) {
            if (fileData.type === 'file') {
                content += `### ${filePath}

\`\`\`${fileData.analysis?.language || 'text'}
${fileData.content}
\`\`\`

---

`;
            } else if (fileData.type === 'large-file') {
                content += `### ${filePath}

*${fileData.summary}*

---

`;
            }
        }
        
        fs.writeFileSync(filePath, content);
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node context-flattener.js <project-name> [options]');
        process.exit(1);
    }

    const [projectName] = args;
    const flattener = new BMadContextFlattener();
    
    flattener.flattenProject(projectName)
        .catch(error => {
            console.error('Flattening failed:', error.message);
            process.exit(1);
        });
}

module.exports = BMadContextFlattener;
#!/usr/bin/env node

/**
 * BMAD-METHOD Project Validator
 * Validates project structure and agent outputs
 */

const fs = require('fs');
const path = require('path');

class BMadProjectValidator {
    constructor() {
        this.config = this.loadConfig();
        this.validationResults = {
            valid: true,
            errors: [],
            warnings: [],
            summary: {}
        };
    }

    loadConfig() {
        const configPath = path.join(__dirname, '../config/framework-config.json');
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    validateProject(projectName) {
        console.log(`🔍 Validating project: ${projectName}`);
        
        const projectDir = path.join(__dirname, '../projects', projectName);
        
        if (!fs.existsSync(projectDir)) {
            this.addError(`Project directory not found: ${projectName}`);
            return this.validationResults;
        }

        // Validate structure
        this.validateProjectStructure(projectDir);
        
        // Validate agent outputs
        this.validateAgentOutputs(projectDir);
        
        // Validate dependencies
        this.validateAgentDependencies(projectDir);
        
        // Generate summary
        this.generateValidationSummary(projectName);
        
        console.log(this.validationResults.valid ? '✅ Project validation passed' : '❌ Project validation failed');
        return this.validationResults;
    }

    validateProjectStructure(projectDir) {
        const requiredDirs = [
            '01-analysis',
            '02-planning',
            '03-architecture', 
            '04-stories',
            '05-implementation'
        ];

        for (const dir of requiredDirs) {
            const dirPath = path.join(projectDir, dir);
            if (!fs.existsSync(dirPath)) {
                this.addWarning(`Missing directory: ${dir}`);
            }
        }

        // Check for project initialization file
        const initFile = path.join(projectDir, 'project-init.md');
        if (!fs.existsSync(initFile)) {
            this.addError('Missing project-init.md file');
        }

        // Check for README
        const readmeFile = path.join(projectDir, 'README.md');
        if (!fs.existsSync(readmeFile)) {
            this.addWarning('Missing README.md file');
        }
    }

    validateAgentOutputs(projectDir) {
        const agentConfigs = this.config.agents;
        
        for (const [agentName, config] of Object.entries(agentConfigs)) {
            const agentDir = this.getAgentDirectory(projectDir, agentName);
            
            if (!fs.existsSync(agentDir)) {
                this.addWarning(`Agent ${agentName} has no output directory`);
                continue;
            }

            // Check for agent outputs
            const files = fs.readdirSync(agentDir);
            const hasOutput = files.some(f => f.includes(agentName) && f.endsWith('.md'));
            
            if (!hasOutput) {
                this.addWarning(`Agent ${agentName} has no output files`);
            } else {
                // Validate output content
                this.validateAgentOutput(agentDir, agentName, files);
            }
        }
    }

    getAgentDirectory(projectDir, agentName) {
        const agentDirs = {
            'analyst': '01-analysis',
            'pm': '02-planning',
            'architect': '03-architecture',
            'scrum-master': '04-stories'
        };
        
        return path.join(projectDir, agentDirs[agentName] || `${agentName}-output`);
    }

    validateAgentOutput(agentDir, agentName, files) {
        const outputFiles = files.filter(f => f.includes(agentName) && f.endsWith('.md'));
        
        for (const file of outputFiles) {
            const filePath = path.join(agentDir, file);
            
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Basic content validation
                if (content.length < 100) {
                    this.addWarning(`Agent ${agentName} output seems too short: ${file}`);
                }

                // Check for expected sections based on agent type
                this.validateAgentSections(agentName, content, file);
                
            } catch (error) {
                this.addError(`Cannot read agent output: ${file} - ${error.message}`);
            }
        }
    }

    validateAgentSections(agentName, content, fileName) {
        const expectedSections = {
            'analyst': [
                'Requirements Analysis',
                'Domain Analysis', 
                'Scope Definition',
                'Risk Assessment'
            ],
            'pm': [
                'Project Charter',
                'Work Breakdown',
                'Timeline',
                'Risk Management'
            ],
            'architect': [
                'System Architecture',
                'Technology Stack',
                'API Design',
                'Technical Specifications'
            ],
            'scrum-master': [
                'Epic Breakdown',
                'User Stories',
                'Implementation Context',
                'Definition of Done'
            ]
        };

        const sections = expectedSections[agentName] || [];
        const missingSections = [];
        
        for (const section of sections) {
            if (!content.toLowerCase().includes(section.toLowerCase())) {
                missingSections.push(section);
            }
        }
        
        if (missingSections.length > 0) {
            this.addWarning(`Agent ${agentName} output missing sections: ${missingSections.join(', ')} in ${fileName}`);
        }
    }

    validateAgentDependencies(projectDir) {
        const agentConfigs = this.config.agents;
        
        for (const [agentName, config] of Object.entries(agentConfigs)) {
            if (!config.dependencies || config.dependencies.length === 0) continue;
            
            for (const depAgent of config.dependencies) {
                const depDir = this.getAgentDirectory(projectDir, depAgent);
                
                if (!fs.existsSync(depDir)) {
                    this.addError(`Agent ${agentName} depends on ${depAgent} but ${depAgent} has no output`);
                    continue;
                }

                const depFiles = fs.readdirSync(depDir);
                const hasDepOutput = depFiles.some(f => f.includes(depAgent) && f.endsWith('.md'));
                
                if (!hasDepOutput) {
                    this.addError(`Agent ${agentName} depends on ${depAgent} but ${depAgent} has no output files`);
                }
            }
        }
    }

    generateValidationSummary(projectName) {
        this.validationResults.summary = {
            project: projectName,
            timestamp: new Date().toISOString(),
            errorCount: this.validationResults.errors.length,
            warningCount: this.validationResults.warnings.length,
            agentStatus: this.getAgentStatus(projectName),
            completionPercentage: this.calculateCompletionPercentage(projectName)
        };
    }

    getAgentStatus(projectName) {
        const projectDir = path.join(__dirname, '../projects', projectName);
        const status = {};
        
        for (const agentName of Object.keys(this.config.agents)) {
            const agentDir = this.getAgentDirectory(projectDir, agentName);
            
            if (fs.existsSync(agentDir)) {
                const files = fs.readdirSync(agentDir);
                const hasOutput = files.some(f => f.includes(agentName) && f.endsWith('.md'));
                status[agentName] = hasOutput ? 'completed' : 'started';
            } else {
                status[agentName] = 'pending';
            }
        }
        
        return status;
    }

    calculateCompletionPercentage(projectName) {
        const agentStatus = this.getAgentStatus(projectName);
        const totalAgents = Object.keys(this.config.agents).length;
        const completedAgents = Object.values(agentStatus).filter(s => s === 'completed').length;
        
        return Math.round((completedAgents / totalAgents) * 100);
    }

    addError(message) {
        this.validationResults.errors.push(message);
        this.validationResults.valid = false;
        console.error(`❌ ERROR: ${message}`);
    }

    addWarning(message) {
        this.validationResults.warnings.push(message);
        console.warn(`⚠️  WARNING: ${message}`);
    }

    generateReport(projectName) {
        const results = this.validateProject(projectName);
        
        console.log('\n📊 VALIDATION REPORT');
        console.log('='.repeat(50));
        console.log(`Project: ${projectName}`);
        console.log(`Status: ${results.valid ? '✅ VALID' : '❌ INVALID'}`);
        console.log(`Completion: ${results.summary.completionPercentage}%`);
        console.log(`Errors: ${results.summary.errorCount}`);
        console.log(`Warnings: ${results.summary.warningCount}`);
        
        console.log('\n🤖 AGENT STATUS');
        for (const [agent, status] of Object.entries(results.summary.agentStatus)) {
            const statusIcon = status === 'completed' ? '✅' : status === 'started' ? '🔄' : '⏳';
            console.log(`${statusIcon} ${agent}: ${status}`);
        }
        
        if (results.errors.length > 0) {
            console.log('\n❌ ERRORS');
            results.errors.forEach(error => console.log(`  • ${error}`));
        }
        
        if (results.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS');
            results.warnings.forEach(warning => console.log(`  • ${warning}`));
        }
        
        return results;
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node validate-project.js <project-name>');
        process.exit(1);
    }

    const [projectName] = args;
    const validator = new BMadProjectValidator();
    
    const results = validator.generateReport(projectName);
    process.exit(results.valid ? 0 : 1);
}

module.exports = BMadProjectValidator;
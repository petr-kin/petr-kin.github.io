#!/usr/bin/env node

/**
 * BMAD-METHOD Workflow Orchestrator
 * Orchestrates complete BMAD workflow from planning to implementation
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

class BMadWorkflowOrchestrator {
    constructor() {
        this.config = this.loadConfig();
        this.projectData = {};
        this.agentOutputs = {};
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    loadConfig() {
        const configPath = path.join(__dirname, '../config/framework-config.json');
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    async runFullWorkflow(projectName, options = {}) {
        console.log(`🚀 Starting BMAD-METHOD Full Workflow for: ${projectName}`);
        console.log('=' .repeat(60));
        
        try {
            // Phase 1: Agentic Planning
            await this.runPhase1(projectName, options);
            
            // Validation checkpoint
            await this.validatePhase1(projectName);
            
            // Phase 2: Context-Engineered Development
            await this.runPhase2(projectName, options);
            
            // Final validation
            await this.finalValidation(projectName);
            
            console.log('\n🎉 BMAD-METHOD Workflow Complete!');
            console.log(`📁 Project artifacts: ./projects/${projectName}`);
            
        } catch (error) {
            console.error(`\n❌ Workflow failed: ${error.message}`);
            throw error;
        } finally {
            this.rl.close();
        }
    }

    async runPhase1(projectName, options) {
        console.log('\n📋 PHASE 1: AGENTIC PLANNING');
        console.log('-'.repeat(40));
        
        const planningAgents = ['analyst', 'pm', 'architect'];
        
        for (const agentName of planningAgents) {
            await this.runAgentInWorkflow(agentName, projectName, options);
            
            if (!options.skipReview) {
                await this.reviewAgentOutput(agentName, projectName);
            }
        }
        
        console.log('\n✅ Phase 1 Complete: Agentic Planning finished');
    }

    async runPhase2(projectName, options) {
        console.log('\n🛠️  PHASE 2: CONTEXT-ENGINEERED DEVELOPMENT');
        console.log('-'.repeat(40));
        
        // Run Scrum Master agent
        await this.runAgentInWorkflow('scrum-master', projectName, options);
        
        // Flatten context for easy consumption
        if (!options.skipFlattening) {
            await this.flattenProjectContext(projectName);
        }
        
        console.log('\n✅ Phase 2 Complete: Development stories ready');
    }

    async runAgentInWorkflow(agentName, projectName, options) {
        console.log(`\n🤖 Running ${agentName.toUpperCase()} Agent`);
        
        const agentConfig = this.config.agents[agentName];
        
        // Check dependencies
        if (agentConfig.dependencies && agentConfig.dependencies.length > 0) {
            console.log(`📊 Dependencies: ${agentConfig.dependencies.join(', ')}`);
            
            for (const dep of agentConfig.dependencies) {
                if (!this.agentOutputs[dep]) {
                    console.log(`⏳ Loading ${dep} output...`);
                    this.agentOutputs[dep] = await this.loadAgentOutput(projectName, dep);
                }
            }
        }
        
        // Execute agent
        if (options.autoMode) {
            await this.runAgentAutomatic(agentName, projectName);
        } else {
            await this.runAgentInteractive(agentName, projectName);
        }
        
        // Store output reference
        this.agentOutputs[agentName] = await this.loadAgentOutput(projectName, agentName);
        
        console.log(`✅ ${agentName} agent completed`);
    }

    async runAgentAutomatic(agentName, projectName) {
        return new Promise((resolve, reject) => {
            const agentRunner = spawn('node', [
                path.join(__dirname, 'agent-runner.js'),
                agentName,
                projectName
            ], {
                stdio: 'inherit',
                env: { ...process.env }
            });

            agentRunner.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Agent ${agentName} failed with code ${code}`));
                }
            });

            agentRunner.on('error', reject);
        });
    }

    async runAgentInteractive(agentName, projectName) {
        console.log(`\n💡 Interactive mode for ${agentName} agent`);
        console.log('Options:');
        console.log('1. Run with agent-runner (manual Claude interaction)');
        console.log('2. Skip this agent (use existing output)');
        console.log('3. Import external output');
        
        const choice = await this.question('Choice (1/2/3): ');
        
        switch (choice) {
            case '1':
                await this.runAgentAutomatic(agentName, projectName);
                break;
            case '2':
                console.log('⏭️  Skipping agent (using existing output if available)');
                break;
            case '3':
                await this.importAgentOutput(agentName, projectName);
                break;
            default:
                console.log('Invalid choice, defaulting to option 1');
                await this.runAgentAutomatic(agentName, projectName);
        }
    }

    async importAgentOutput(agentName, projectName) {
        const outputPath = await this.question('Path to output file: ');
        
        if (!fs.existsSync(outputPath)) {
            throw new Error(`File not found: ${outputPath}`);
        }
        
        const content = fs.readFileSync(outputPath, 'utf8');
        const projectDir = path.join(__dirname, '../projects', projectName);
        const agentDir = this.getAgentDirectory(projectDir, agentName);
        
        fs.mkdirSync(agentDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFile = path.join(agentDir, `${agentName}-imported-${timestamp}.md`);
        
        fs.writeFileSync(outputFile, content);
        console.log(`✅ Imported ${agentName} output`);
    }

    async reviewAgentOutput(agentName, projectName) {
        console.log(`\n📝 Review ${agentName} output?`);
        const review = await this.question('Review (y/n): ');
        
        if (review.toLowerCase() === 'y') {
            const output = await this.loadAgentOutput(projectName, agentName);
            
            if (output) {
                console.log('\n--- OUTPUT PREVIEW ---');
                console.log(output.substring(0, 1000));
                if (output.length > 1000) {
                    console.log('\n... [truncated] ...');
                }
                console.log('--- END PREVIEW ---\n');
                
                const satisfied = await this.question('Accept this output? (y/n): ');
                if (satisfied.toLowerCase() !== 'y') {
                    console.log('⚠️  Please manually edit the output or re-run the agent');
                    const retry = await this.question('Re-run agent? (y/n): ');
                    if (retry.toLowerCase() === 'y') {
                        await this.runAgentInWorkflow(agentName, projectName, {});
                    }
                }
            }
        }
    }

    async loadAgentOutput(projectName, agentName) {
        const projectDir = path.join(__dirname, '../projects', projectName);
        const agentDir = this.getAgentDirectory(projectDir, agentName);
        
        if (!fs.existsSync(agentDir)) {
            return null;
        }
        
        const files = fs.readdirSync(agentDir);
        const outputFiles = files.filter(f => f.includes(agentName) && f.endsWith('.md'));
        
        if (outputFiles.length === 0) {
            return null;
        }
        
        // Get the latest output file
        const latestFile = outputFiles.sort().pop();
        return fs.readFileSync(path.join(agentDir, latestFile), 'utf8');
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

    async validatePhase1(projectName) {
        console.log('\n🔍 Validating Phase 1 outputs...');
        
        const validator = spawn('node', [
            path.join(__dirname, 'validate-project.js'),
            projectName
        ], {
            stdio: 'pipe'
        });

        let output = '';
        validator.stdout.on('data', (data) => {
            output += data.toString();
        });

        return new Promise((resolve, reject) => {
            validator.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Phase 1 validation passed');
                    resolve();
                } else {
                    console.log('⚠️  Phase 1 validation warnings:');
                    console.log(output);
                    
                    this.question('Continue despite warnings? (y/n): ').then(answer => {
                        if (answer.toLowerCase() === 'y') {
                            resolve();
                        } else {
                            reject(new Error('Workflow halted due to validation issues'));
                        }
                    });
                }
            });
        });
    }

    async flattenProjectContext(projectName) {
        console.log('\n📦 Flattening project context...');
        
        return new Promise((resolve, reject) => {
            const flattener = spawn('node', [
                path.join(__dirname, 'context-flattener.js'),
                projectName
            ], {
                stdio: 'inherit'
            });

            flattener.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    console.log('⚠️  Context flattening failed (non-critical)');
                    resolve(); // Continue anyway
                }
            });

            flattener.on('error', reject);
        });
    }

    async finalValidation(projectName) {
        console.log('\n🏁 Final Validation');
        console.log('-'.repeat(40));
        
        const projectDir = path.join(__dirname, '../projects', projectName);
        
        // Check all agent outputs exist
        const agents = Object.keys(this.config.agents);
        const results = {
            complete: [],
            missing: []
        };
        
        for (const agent of agents) {
            const output = await this.loadAgentOutput(projectName, agent);
            if (output) {
                results.complete.push(agent);
            } else {
                results.missing.push(agent);
            }
        }
        
        console.log(`✅ Complete: ${results.complete.join(', ')}`);
        
        if (results.missing.length > 0) {
            console.log(`⚠️  Missing: ${results.missing.join(', ')}`);
        }
        
        // Generate workflow summary
        await this.generateWorkflowSummary(projectName, results);
    }

    async generateWorkflowSummary(projectName, validationResults) {
        const projectDir = path.join(__dirname, '../projects', projectName);
        const summaryPath = path.join(projectDir, 'workflow-summary.md');
        
        const summary = `# BMAD-METHOD Workflow Summary

**Project:** ${projectName}  
**Completed:** ${new Date().toLocaleString()}

## Workflow Status

### Phase 1: Agentic Planning
${validationResults.complete.filter(a => ['analyst', 'pm', 'architect'].includes(a))
    .map(a => `- ✅ ${a.charAt(0).toUpperCase() + a.slice(1)} Agent`).join('\n')}

### Phase 2: Context-Engineered Development
${validationResults.complete.filter(a => a === 'scrum-master')
    .map(a => `- ✅ ${a.charAt(0).toUpperCase() + a.slice(1).replace('-', ' ')} Agent`).join('\n')}

## Output Locations

- **Requirements Analysis:** 01-analysis/
- **Project Planning:** 02-planning/
- **Technical Architecture:** 03-architecture/
- **User Stories:** 04-stories/
- **Implementation:** 05-implementation/
- **Flattened Context:** 06-flattened/

## Next Steps

1. Review user stories in \`04-stories/\`
2. Begin implementation using detailed context
3. Track progress in \`05-implementation/\`
4. Use flattened context for AI assistance

---

*Generated by BMAD-METHOD Workflow Orchestrator*
`;

        fs.writeFileSync(summaryPath, summary);
        console.log(`\n📄 Workflow summary saved: ${summaryPath}`);
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node workflow-orchestrator.js <project-name> [options]');
        console.log('Options:');
        console.log('  --auto           Run in automatic mode');
        console.log('  --skip-review    Skip output reviews');
        console.log('  --skip-flatten   Skip context flattening');
        process.exit(1);
    }

    const projectName = args[0];
    const options = {
        autoMode: args.includes('--auto'),
        skipReview: args.includes('--skip-review'),
        skipFlattening: args.includes('--skip-flatten')
    };

    const orchestrator = new BMadWorkflowOrchestrator();
    
    orchestrator.runFullWorkflow(projectName, options)
        .catch(error => {
            console.error('Workflow failed:', error.message);
            process.exit(1);
        });
}

module.exports = BMadWorkflowOrchestrator;
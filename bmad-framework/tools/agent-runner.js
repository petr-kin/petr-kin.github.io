#!/usr/bin/env node

/**
 * BMAD-METHOD Agent Runner
 * Executes individual agents with Claude API integration
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

class BMadAgentRunner {
    constructor() {
        this.config = this.loadConfig();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    loadConfig() {
        const configPath = path.join(__dirname, '../config/framework-config.json');
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    async runAgent(agentName, projectName, inputs = {}) {
        console.log(`🤖 Running ${agentName} agent for project: ${projectName}`);
        
        try {
            // Load agent prompt template
            const promptTemplate = this.loadAgentPrompt(agentName);
            
            // Prepare project context
            const projectContext = this.loadProjectContext(projectName, agentName);
            
            // Process prompt with context
            const processedPrompt = this.processPromptTemplate(
                promptTemplate, 
                projectName, 
                inputs, 
                projectContext
            );

            console.log('📝 Processed prompt ready');
            console.log('🔍 Preview prompt? (y/n)');
            
            const preview = await this.question('');
            if (preview.toLowerCase() === 'y') {
                console.log('\n--- PROMPT PREVIEW ---');
                console.log(processedPrompt);
                console.log('--- END PREVIEW ---\n');
            }

            // Execute with Claude API (or manual mode)
            const response = await this.executeAgent(processedPrompt, agentName);
            
            // Save response to project
            this.saveAgentOutput(projectName, agentName, response);
            
            console.log(`✅ ${agentName} agent completed successfully`);
            console.log(`📁 Output saved to projects/${projectName}`);
            
            return response;
            
        } catch (error) {
            console.error(`❌ Error running ${agentName} agent:`, error.message);
            throw error;
        } finally {
            this.rl.close();
        }
    }

    loadAgentPrompt(agentName) {
        const promptPath = path.join(__dirname, `../agents/${agentName}/agent-prompt.md`);
        if (!fs.existsSync(promptPath)) {
            throw new Error(`Agent prompt not found: ${promptPath}`);
        }
        return fs.readFileSync(promptPath, 'utf8');
    }

    loadProjectContext(projectName, agentName) {
        const projectDir = path.join(__dirname, '../projects', projectName);
        const context = {
            projectName,
            agentName,
            dependencies: {}
        };

        // Load dependency outputs based on agent config
        const agentConfig = this.config.agents[agentName];
        if (agentConfig && agentConfig.dependencies) {
            for (const depAgent of agentConfig.dependencies) {
                const depOutputs = this.loadAgentOutputs(projectName, depAgent);
                context.dependencies[depAgent] = depOutputs;
            }
        }

        // Load project initialization data
        const initFile = path.join(projectDir, 'project-init.md');
        if (fs.existsSync(initFile)) {
            context.projectInit = fs.readFileSync(initFile, 'utf8');
        }

        return context;
    }

    loadAgentOutputs(projectName, agentName) {
        const projectDir = path.join(__dirname, '../projects', projectName);
        const agentOutputs = {};

        // Map agent names to directory numbers
        const agentDirs = {
            'analyst': '01-analysis',
            'pm': '02-planning', 
            'architect': '03-architecture',
            'scrum-master': '04-stories'
        };

        const agentDir = path.join(projectDir, agentDirs[agentName] || `${agentName}-output`);
        
        if (fs.existsSync(agentDir)) {
            const files = fs.readdirSync(agentDir);
            for (const file of files) {
                if (file.endsWith('.md')) {
                    const filePath = path.join(agentDir, file);
                    agentOutputs[file] = fs.readFileSync(filePath, 'utf8');
                }
            }
        }

        return agentOutputs;
    }

    processPromptTemplate(template, projectName, inputs, context) {
        let processed = template;

        // Replace basic variables
        processed = processed.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
        
        // Replace context variables
        if (context.projectInit) {
            // Extract variables from project init
            const projectData = this.extractProjectData(context.projectInit);
            for (const [key, value] of Object.entries(projectData)) {
                const placeholder = new RegExp(`\\{\\{${key.toUpperCase()}\\}\\}`, 'g');
                processed = processed.replace(placeholder, value || '');
            }
        }

        // Replace dependency outputs
        for (const [depAgent, outputs] of Object.entries(context.dependencies)) {
            const placeholder = new RegExp(`\\{\\{${depAgent.toUpperCase()}_OUTPUT\\}\\}`, 'g');
            const combinedOutput = Object.values(outputs).join('\n\n---\n\n');
            processed = processed.replace(placeholder, combinedOutput);
        }

        // Replace input variables
        for (const [key, value] of Object.entries(inputs)) {
            const placeholder = new RegExp(`\\{\\{${key.toUpperCase()}\\}\\}`, 'g');
            processed = processed.replace(placeholder, value);
        }

        return processed;
    }

    extractProjectData(projectInit) {
        const data = {};
        
        // Extract basic project info using regex
        const patterns = {
            domain: /\*\*Domain\*\*:\s*(.+)/,
            stakeholders: /\*\*Stakeholders\*\*:\s*(.+)/,
            timeline: /\*\*Timeline\*\*:\s*(.+)/,
            requirements: /## Initial Requirements\s*([\s\S]*?)(?=##|$)/
        };

        for (const [key, pattern] of Object.entries(patterns)) {
            const match = projectInit.match(pattern);
            if (match) {
                data[key] = match[1].trim();
            }
        }

        return data;
    }

    async executeAgent(prompt, agentName) {
        console.log('🚀 Choose execution mode:');
        console.log('1. Manual (copy prompt, paste response)');
        console.log('2. Claude API (requires ANTHROPIC_API_KEY)');
        
        const mode = await this.question('Mode (1/2): ');
        
        if (mode === '2') {
            return await this.executeWithClaudeAPI(prompt);
        } else {
            return await this.executeManually(prompt);
        }
    }

    async executeWithClaudeAPI(prompt) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable required for API mode');
        }

        console.log('🌐 Calling Claude API...');
        
        const requestData = JSON.stringify({
            model: this.config.integration['claude-api'].model,
            max_tokens: 4000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.anthropic.com',
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Length': Buffer.byteLength(requestData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.content && response.content[0]) {
                            resolve(response.content[0].text);
                        } else {
                            reject(new Error('Unexpected API response format'));
                        }
                    } catch (error) {
                        reject(new Error(`API response parse error: ${error.message}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(requestData);
            req.end();
        });
    }

    async executeManually(prompt) {
        console.log('\n📋 Copy this prompt to Claude:');
        console.log('=' .repeat(50));
        console.log(prompt);
        console.log('=' .repeat(50));
        console.log('\n✍️  Paste Claude\'s response below (end with empty line):');
        
        let response = '';
        let emptyLines = 0;
        
        while (emptyLines < 2) {
            const line = await this.question('');
            if (line.trim() === '') {
                emptyLines++;
            } else {
                emptyLines = 0;
                response += line + '\n';
            }
        }
        
        return response.trim();
    }

    saveAgentOutput(projectName, agentName, response) {
        const projectDir = path.join(__dirname, '../projects', projectName);
        
        // Map agent names to directory numbers
        const agentDirs = {
            'analyst': '01-analysis',
            'pm': '02-planning',
            'architect': '03-architecture', 
            'scrum-master': '04-stories'
        };

        const outputDir = path.join(projectDir, agentDirs[agentName] || `${agentName}-output`);
        fs.mkdirSync(outputDir, { recursive: true });

        // Save main output
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFile = path.join(outputDir, `${agentName}-output-${timestamp}.md`);
        
        const formattedOutput = `# ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent Output

**Generated:** ${new Date().toLocaleString()}  
**Project:** ${projectName}

---

${response}

---

*Generated with BMAD-METHOD Agent Runner*
`;

        fs.writeFileSync(outputFile, formattedOutput);
        
        // Create/update latest symlink
        const latestFile = path.join(outputDir, `${agentName}-latest.md`);
        if (fs.existsSync(latestFile)) {
            fs.unlinkSync(latestFile);
        }
        fs.symlinkSync(path.basename(outputFile), latestFile);
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
    
    if (args.length < 2) {
        console.log('Usage: node agent-runner.js <agent-name> <project-name> [input-file]');
        console.log('Available agents: analyst, pm, architect, scrum-master');
        process.exit(1);
    }

    const [agentName, projectName, inputFile] = args;
    const runner = new BMadAgentRunner();
    
    let inputs = {};
    if (inputFile && fs.existsSync(inputFile)) {
        inputs.file_content = fs.readFileSync(inputFile, 'utf8');
    }
    
    runner.runAgent(agentName, projectName, inputs)
        .catch(error => {
            console.error('Agent execution failed:', error.message);
            process.exit(1);
        });
}

module.exports = BMadAgentRunner;
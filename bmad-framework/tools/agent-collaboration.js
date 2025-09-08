#!/usr/bin/env node

/**
 * BMAD-METHOD Agent Collaboration System
 * Enables agents to share context and collaborate on complex tasks
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class AgentCollaborationSystem extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map();
        this.sharedContext = new Map();
        this.collaborationLog = [];
        this.config = this.loadConfig();
    }

    loadConfig() {
        const configPath = path.join(__dirname, '../config/framework-config.json');
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    registerAgent(agentName, capabilities = {}) {
        const agent = {
            name: agentName,
            capabilities,
            status: 'idle',
            outputs: new Map(),
            dependencies: this.config.agents[agentName]?.dependencies || [],
            lastActivity: new Date()
        };

        this.agents.set(agentName, agent);
        this.emit('agent-registered', agent);
        
        console.log(`🤖 Agent registered: ${agentName}`);
        return agent;
    }

    async collaborate(taskName, requiredAgents, projectContext) {
        console.log(`🤝 Starting collaboration: ${taskName}`);
        
        const collaboration = {
            id: this.generateCollaborationId(),
            taskName,
            startTime: new Date(),
            agents: requiredAgents,
            context: projectContext,
            results: {},
            status: 'in-progress'
        };

        try {
            // Initialize shared context
            this.initializeSharedContext(collaboration);
            
            // Execute agents in dependency order
            const executionOrder = this.determineExecutionOrder(requiredAgents);
            console.log(`📋 Execution order: ${executionOrder.join(' → ')}`);
            
            for (const agentName of executionOrder) {
                await this.executeAgentInCollaboration(agentName, collaboration);
            }
            
            // Validate collaboration results
            await this.validateCollaboration(collaboration);
            
            // Generate collaboration report
            const report = this.generateCollaborationReport(collaboration);
            
            collaboration.status = 'completed';
            collaboration.endTime = new Date();
            
            this.collaborationLog.push(collaboration);
            
            return report;
            
        } catch (error) {
            collaboration.status = 'failed';
            collaboration.error = error.message;
            this.collaborationLog.push(collaboration);
            throw error;
        }
    }

    initializeSharedContext(collaboration) {
        const contextId = collaboration.id;
        
        this.sharedContext.set(contextId, {
            project: collaboration.context.projectName,
            requirements: collaboration.context.requirements || '',
            constraints: collaboration.context.constraints || {},
            agentOutputs: {},
            metadata: {
                taskName: collaboration.taskName,
                startTime: collaboration.startTime
            }
        });
    }

    determineExecutionOrder(requiredAgents) {
        const order = [];
        const visited = new Set();
        const visiting = new Set();
        
        const visit = (agentName) => {
            if (visited.has(agentName)) return;
            if (visiting.has(agentName)) {
                throw new Error(`Circular dependency detected for agent: ${agentName}`);
            }
            
            visiting.add(agentName);
            
            const agent = this.agents.get(agentName) || 
                          { dependencies: this.config.agents[agentName]?.dependencies || [] };
            
            for (const dep of agent.dependencies) {
                if (requiredAgents.includes(dep)) {
                    visit(dep);
                }
            }
            
            visiting.delete(agentName);
            visited.add(agentName);
            order.push(agentName);
        };
        
        for (const agent of requiredAgents) {
            visit(agent);
        }
        
        return order;
    }

    async executeAgentInCollaboration(agentName, collaboration) {
        console.log(`\n🔄 Executing ${agentName} agent`);
        
        const agent = this.agents.get(agentName);
        if (agent) {
            agent.status = 'working';
        }
        
        // Get agent dependencies from shared context
        const context = this.sharedContext.get(collaboration.id);
        const agentInput = this.prepareAgentInput(agentName, context);
        
        // Simulate agent execution (in real implementation, this would call agent-runner)
        const agentOutput = await this.simulateAgentExecution(agentName, agentInput);
        
        // Store output in shared context
        context.agentOutputs[agentName] = agentOutput;
        collaboration.results[agentName] = {
            status: 'completed',
            output: agentOutput,
            timestamp: new Date()
        };
        
        if (agent) {
            agent.status = 'idle';
            agent.outputs.set(collaboration.id, agentOutput);
            agent.lastActivity = new Date();
        }
        
        // Emit collaboration event
        this.emit('agent-completed', {
            agentName,
            collaborationId: collaboration.id,
            output: agentOutput
        });
        
        console.log(`✅ ${agentName} completed`);
    }

    prepareAgentInput(agentName, context) {
        const agentConfig = this.config.agents[agentName];
        const input = {
            projectName: context.project,
            requirements: context.requirements,
            constraints: context.constraints,
            dependencies: {}
        };
        
        // Add dependency outputs
        if (agentConfig && agentConfig.dependencies) {
            for (const dep of agentConfig.dependencies) {
                if (context.agentOutputs[dep]) {
                    input.dependencies[dep] = context.agentOutputs[dep];
                }
            }
        }
        
        return input;
    }

    async simulateAgentExecution(agentName, input) {
        // Simulated agent outputs for demonstration
        const templates = {
            analyst: {
                requirements: 'Detailed requirements analysis based on: ' + input.requirements,
                scope: 'Well-defined project scope',
                risks: 'Identified risks and mitigation strategies'
            },
            pm: {
                timeline: 'Project timeline based on requirements',
                milestones: 'Key project milestones',
                resources: 'Resource allocation plan'
            },
            architect: {
                design: 'System architecture design',
                stack: 'Technology stack recommendations',
                apis: 'API specifications'
            },
            'scrum-master': {
                stories: 'User stories with acceptance criteria',
                implementation: 'Detailed implementation context',
                definition: 'Definition of done'
            }
        };
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return templates[agentName] || { 
            output: `${agentName} agent output based on input`,
            processedAt: new Date().toISOString()
        };
    }

    async validateCollaboration(collaboration) {
        const errors = [];
        const warnings = [];
        
        // Check all required agents completed
        for (const agent of collaboration.agents) {
            if (!collaboration.results[agent]) {
                errors.push(`Agent ${agent} did not complete`);
            }
        }
        
        // Validate agent output consistency
        const context = this.sharedContext.get(collaboration.id);
        
        // Check dependency outputs exist
        for (const agent of collaboration.agents) {
            const agentConfig = this.config.agents[agent];
            if (agentConfig && agentConfig.dependencies) {
                for (const dep of agentConfig.dependencies) {
                    if (collaboration.agents.includes(dep) && !context.agentOutputs[dep]) {
                        warnings.push(`${agent} missing dependency output from ${dep}`);
                    }
                }
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`Collaboration validation failed: ${errors.join(', ')}`);
        }
        
        if (warnings.length > 0) {
            console.log('⚠️  Validation warnings:', warnings.join(', '));
        }
        
        return { errors, warnings };
    }

    generateCollaborationReport(collaboration) {
        const context = this.sharedContext.get(collaboration.id);
        const duration = collaboration.endTime 
            ? collaboration.endTime - collaboration.startTime 
            : Date.now() - collaboration.startTime;
        
        const report = {
            collaborationId: collaboration.id,
            taskName: collaboration.taskName,
            status: collaboration.status,
            duration: Math.round(duration / 1000) + ' seconds',
            agents: collaboration.agents,
            summary: {},
            outputs: {},
            timeline: []
        };
        
        // Build summary
        for (const agent of collaboration.agents) {
            const result = collaboration.results[agent];
            if (result) {
                report.summary[agent] = result.status;
                report.outputs[agent] = result.output;
                report.timeline.push({
                    agent,
                    timestamp: result.timestamp,
                    status: result.status
                });
            }
        }
        
        // Sort timeline
        report.timeline.sort((a, b) => a.timestamp - b.timestamp);
        
        return report;
    }

    generateCollaborationId() {
        return `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async crossValidate(projectName) {
        console.log(`\n🔍 Cross-validating agent outputs for: ${projectName}`);
        
        const validation = {
            projectName,
            timestamp: new Date(),
            consistencyChecks: [],
            recommendations: []
        };
        
        // Load all agent outputs
        const projectDir = path.join(__dirname, '../projects', projectName);
        const agentOutputs = {};
        
        for (const agent of Object.keys(this.config.agents)) {
            const output = await this.loadAgentOutput(projectDir, agent);
            if (output) {
                agentOutputs[agent] = output;
            }
        }
        
        // Check analyst → PM consistency
        if (agentOutputs.analyst && agentOutputs.pm) {
            validation.consistencyChecks.push({
                check: 'Requirements → Timeline alignment',
                status: 'checked',
                note: 'Verify PM timeline reflects analyst requirements'
            });
        }
        
        // Check PM → Architect consistency
        if (agentOutputs.pm && agentOutputs.architect) {
            validation.consistencyChecks.push({
                check: 'Timeline → Architecture complexity',
                status: 'checked',
                note: 'Ensure architecture complexity matches timeline'
            });
        }
        
        // Check Architect → Scrum Master consistency
        if (agentOutputs.architect && agentOutputs['scrum-master']) {
            validation.consistencyChecks.push({
                check: 'Architecture → Story implementation',
                status: 'checked',
                note: 'Verify stories align with technical architecture'
            });
        }
        
        // Generate recommendations
        if (!agentOutputs.analyst) {
            validation.recommendations.push('Run Analyst agent first for requirements foundation');
        }
        
        if (agentOutputs['scrum-master'] && !agentOutputs.architect) {
            validation.recommendations.push('Architecture agent needed before story creation');
        }
        
        return validation;
    }

    async loadAgentOutput(projectDir, agentName) {
        const agentDirs = {
            'analyst': '01-analysis',
            'pm': '02-planning',
            'architect': '03-architecture',
            'scrum-master': '04-stories'
        };
        
        const agentDir = path.join(projectDir, agentDirs[agentName] || `${agentName}-output`);
        
        if (!fs.existsSync(agentDir)) {
            return null;
        }
        
        const files = fs.readdirSync(agentDir);
        const outputFiles = files.filter(f => f.endsWith('.md'));
        
        if (outputFiles.length > 0) {
            const latestFile = outputFiles.sort().pop();
            return fs.readFileSync(path.join(agentDir, latestFile), 'utf8');
        }
        
        return null;
    }

    getCollaborationHistory() {
        return this.collaborationLog;
    }

    getAgentStatus(agentName) {
        const agent = this.agents.get(agentName);
        return agent ? agent.status : 'not-registered';
    }

    clearSharedContext(collaborationId) {
        this.sharedContext.delete(collaborationId);
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const collaborationSystem = new AgentCollaborationSystem();
    
    switch (command) {
        case 'collaborate':
            if (args.length < 3) {
                console.log('Usage: node agent-collaboration.js collaborate <project-name> <agents...>');
                process.exit(1);
            }
            
            const projectName = args[1];
            const agents = args.slice(2);
            
            // Register agents
            agents.forEach(agent => collaborationSystem.registerAgent(agent));
            
            // Run collaboration
            collaborationSystem.collaborate(`${projectName}-development`, agents, {
                projectName,
                requirements: 'Project requirements from initialization'
            })
            .then(report => {
                console.log('\n📊 COLLABORATION REPORT');
                console.log('='.repeat(50));
                console.log(JSON.stringify(report, null, 2));
            })
            .catch(error => {
                console.error('Collaboration failed:', error.message);
                process.exit(1);
            });
            break;
            
        case 'validate':
            if (args.length < 2) {
                console.log('Usage: node agent-collaboration.js validate <project-name>');
                process.exit(1);
            }
            
            collaborationSystem.crossValidate(args[1])
                .then(validation => {
                    console.log('\n🔍 CROSS-VALIDATION REPORT');
                    console.log('='.repeat(50));
                    console.log(JSON.stringify(validation, null, 2));
                })
                .catch(error => {
                    console.error('Validation failed:', error.message);
                    process.exit(1);
                });
            break;
            
        default:
            console.log('Commands:');
            console.log('  collaborate <project> <agents...> - Run agent collaboration');
            console.log('  validate <project>                - Cross-validate agent outputs');
            process.exit(1);
    }
}

module.exports = AgentCollaborationSystem;
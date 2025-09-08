#!/usr/bin/env node

/**
 * BMAD-METHOD Project Initialization Tool
 * Creates new project structure and initializes agent workflow
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class BMadProjectInit {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.projectData = {};
    }

    async initializeProject() {
        console.log('🚀 BMAD-METHOD Project Initialization\n');
        
        // Collect project information
        await this.collectProjectInfo();
        
        // Create project structure
        this.createProjectStructure();
        
        // Generate initial templates
        this.generateTemplates();
        
        console.log(`\n✅ Project '${this.projectData.name}' initialized successfully!`);
        console.log(`📁 Location: ./projects/${this.projectData.name}`);
        console.log('\n🔄 Next steps:');
        console.log('1. Run Analyst Agent on requirements');
        console.log('2. Execute PM Agent for project planning');
        console.log('3. Generate architecture with Architect Agent');
        console.log('4. Create stories with Scrum Master Agent');
        
        this.rl.close();
    }

    async collectProjectInfo() {
        this.projectData.name = await this.question('Project Name: ');
        this.projectData.domain = await this.question('Domain/Industry: ');
        this.projectData.stakeholders = await this.question('Key Stakeholders: ');
        this.projectData.timeline = await this.question('Target Timeline: ');
        this.projectData.requirements = await this.question('Initial Requirements: ');
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    createProjectStructure() {
        const projectDir = path.join('./projects', this.projectData.name);
        
        const directories = [
            '01-analysis',
            '02-planning', 
            '03-architecture',
            '04-stories',
            '05-implementation'
        ];

        // Create project directory
        fs.mkdirSync(projectDir, { recursive: true });
        
        // Create subdirectories
        directories.forEach(dir => {
            fs.mkdirSync(path.join(projectDir, dir), { recursive: true });
        });
    }

    generateTemplates() {
        const projectDir = path.join('./projects', this.projectData.name);
        
        // Generate project initialization file
        const initContent = this.generateInitTemplate();
        fs.writeFileSync(
            path.join(projectDir, 'project-init.md'),
            initContent
        );

        // Create README
        const readmeContent = this.generateReadmeTemplate();
        fs.writeFileSync(
            path.join(projectDir, 'README.md'),
            readmeContent
        );
    }

    generateInitTemplate() {
        return `# ${this.projectData.name} - BMAD-METHOD Project

## Project Overview
- **Project Name**: ${this.projectData.name}
- **Domain**: ${this.projectData.domain}
- **Stakeholders**: ${this.projectData.stakeholders}
- **Timeline**: ${this.projectData.timeline}

## Initial Requirements
${this.projectData.requirements}

## Agent Workflow Status
- [ ] **Analyst Agent**: Requirements analysis
- [ ] **PM Agent**: Project planning  
- [ ] **Architect Agent**: Technical architecture
- [ ] **Scrum Master Agent**: Story creation

## Project Structure
- \`01-analysis/\` - Requirements and domain analysis
- \`02-planning/\` - Project management artifacts
- \`03-architecture/\` - Technical design documents
- \`04-stories/\` - Development user stories
- \`05-implementation/\` - Development tracking
`;
    }

    generateReadmeTemplate() {
        return `# ${this.projectData.name}

${this.projectData.requirements}

## Development Status
🔄 **Planning Phase** - Running BMAD-METHOD agentic planning

## Quick Start
1. Review agent outputs in numbered directories
2. Follow implementation stories in \`04-stories/\`
3. Track development progress in \`05-implementation/\`

---
*Generated with BMAD-METHOD framework*
`;
    }
}

// Run initialization
if (require.main === module) {
    const init = new BMadProjectInit();
    init.initializeProject().catch(console.error);
}

module.exports = BMadProjectInit;
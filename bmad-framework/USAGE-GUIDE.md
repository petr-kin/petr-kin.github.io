# BMAD-METHOD Usage Guide

## Quick Start

### 1. Initialize New Project
```bash
cd bmad-framework
node tools/project-init.js
```

### 2. Run Agentic Planning Phase
Execute agents in sequence:

#### Analyst Agent
```bash
# Use analyst prompt with your requirements
# Input: User requirements
# Output: Comprehensive requirements analysis
```

#### PM Agent  
```bash
# Use PM prompt with analyst output
# Input: Requirements analysis
# Output: Project plan and timeline
```

#### Architect Agent
```bash
# Use architect prompt with analyst + PM outputs  
# Input: Requirements + Project plan
# Output: Technical architecture
```

### 3. Context-Engineered Development
#### Scrum Master Agent
```bash
# Use scrum master prompt with all planning outputs
# Input: Analysis + Plan + Architecture  
# Output: Detailed implementation stories
```

## Agent Prompt Usage

### Working with Claude API
For each agent, use the corresponding prompt template from `agents/{agent-name}/agent-prompt.md`:

1. Copy the prompt template
2. Replace `{{VARIABLES}}` with actual project data
3. Submit to Claude API
4. Save output to appropriate project directory

### Example Workflow

```bash
# 1. Create project structure
projects/my-new-app/
├── 01-analysis/requirements-analysis.md
├── 02-planning/project-plan.md  
├── 03-architecture/technical-architecture.md
├── 04-stories/user-stories.md
└── 05-implementation/development-log.md

# 2. Execute agents sequentially
# Analyst → PM → Architect → Scrum Master

# 3. Implement from detailed stories
# Each story contains complete implementation context
```

## Framework Philosophy

### Eliminate Planning Inconsistency
- **Problem**: AI agents often provide incomplete or inconsistent planning
- **Solution**: Structured agent collaboration with defined handoffs
- **Result**: Comprehensive, consistent project foundation

### Eliminate Context Loss
- **Problem**: Development stories lack implementation details
- **Solution**: Context-engineered stories with complete technical context
- **Result**: Developer-ready implementation guidance

## Integration with My-Apps Ecosystem

### HIVE Integration
Use BMAD outputs as input for HIVE test generation:
```bash
# Generate tests from user stories
hive-generate "$(cat projects/my-app/04-stories/user-stories.md)"
```

### TIS Integration  
Store discovered patterns in Test Intelligence Storage:
```bash
# Remember successful patterns
tis-remember my-app implementation-pattern "$(cat successful-implementation.md)"
```

### Spider Integration
Discover UI patterns for web applications:
```bash
# Use for web app projects
spider-discover my-app-domain
```

## Best Practices

### Agent Sequence
1. **Always** run Analyst first - foundation for all other agents
2. **Never skip** PM Agent - provides crucial project structure  
3. **Architecture before Stories** - technical foundation required
4. **Validate handoffs** - ensure agent outputs are consistent

### Story Quality
- Each story must have complete implementation context
- Include code examples and API specifications
- Define clear acceptance criteria with Given/When/Then format
- Provide testing strategy and Definition of Done

### Context Engineering
- **Full Technical Context**: File structure, dependencies, code examples
- **Integration Details**: API contracts, database schemas, service connections
- **Implementation Guidance**: Step-by-step technical approach
- **Quality Gates**: Testing requirements, performance criteria

## Troubleshooting

### Inconsistent Agent Outputs
- Review agent prompts for clarity
- Ensure proper variable substitution
- Validate agent dependencies are met

### Incomplete Stories
- Check if all planning agents completed successfully
- Verify Scrum Master agent received all inputs
- Ensure context engineering guidelines followed

### Integration Issues
- Validate my-apps ecosystem tool availability
- Check API connections and configurations
- Review integration points in framework config
# BMAD-METHOD™ Quick Start Guide

## 🚀 Installation & Setup

```bash
cd /Users/petr/my-apps/web-apps/PK/bmad-framework
npm install  # If any dependencies are added later
./bmad help  # Verify installation
```

## 📋 Step-by-Step Workflow

### 1. Initialize Your Project

```bash
./bmad init
```

You'll be prompted for:
- Project Name
- Domain/Industry  
- Key Stakeholders
- Target Timeline
- Initial Requirements

### 2. Run the Complete Workflow

#### Interactive Mode (Recommended for first time)
```bash
./bmad workflow my-project
```

#### Automatic Mode (For experienced users)
```bash
./bmad workflow my-project --auto --skip-review
```

### 3. Validate Your Results

```bash
./bmad validate my-project
```

## 🤖 Individual Agent Usage

Run agents individually when you need more control:

```bash
# Requirements Analysis
./bmad agent analyst my-project

# Project Planning  
./bmad agent pm my-project

# Technical Architecture
./bmad agent architect my-project

# User Story Creation
./bmad agent scrum-master my-project
```

## 📦 Context Flattening

Prepare your project for AI consumption:

```bash
./bmad flatten my-project
```

## 🤝 Agent Collaboration

Run multiple agents in collaboration:

```bash
./bmad collaborate my-project analyst pm architect
```

## 📁 Output Structure

After running the workflow, find your outputs in:

```
bmad-framework/projects/my-project/
├── 01-analysis/          # Requirements analysis
├── 02-planning/          # Project plans and timelines  
├── 03-architecture/      # Technical design documents
├── 04-stories/           # User stories with full context
├── 05-implementation/    # Development tracking
├── 06-flattened/         # AI-ready context
└── workflow-summary.md   # Complete workflow report
```

## 💡 Tips

1. **Start Simple**: Use `./bmad init` for your first project
2. **Review Outputs**: Check each agent's output before proceeding
3. **Iterate**: Re-run agents if outputs need refinement
4. **Use Validation**: Always validate before implementation
5. **Leverage Context**: Use flattened context for AI assistance

## 🔄 Example: Complete Web App Project

```bash
# 1. Initialize project
./bmad init
# Enter: "my-web-app", "E-commerce", "Product team", "3 months", "Build shopping cart"

# 2. Run full workflow
./bmad workflow my-web-app

# 3. Validate results
./bmad validate my-web-app

# 4. Flatten for AI
./bmad flatten my-web-app

# 5. Begin implementation using stories in 04-stories/
```

## ⚡ Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `./bmad init` | Start new project |
| `./bmad workflow <name>` | Run complete process |
| `./bmad validate <name>` | Check project status |
| `./bmad agent <type> <name>` | Run specific agent |
| `./bmad flatten <name>` | Prepare for AI |
| `./bmad help` | Show all commands |

## 🆘 Troubleshooting

- **Agent fails**: Check dependencies completed first
- **Validation warnings**: Review agent outputs for completeness
- **Missing outputs**: Re-run specific agent with `./bmad agent`
- **Context too large**: Use selective flattening options

---

Ready to build systematically? Start with `./bmad init`!
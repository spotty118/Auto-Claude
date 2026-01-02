# Frequently Asked Questions

---

## General

### What is Auto Claude?

Auto Claude is an autonomous coding framework that uses multiple AI agents to build software. You describe what you want, and it handles planning, implementation, and quality assurance automatically.

### How is this different from using Claude directly?

| Claude (chat) | Auto Claude |
|---------------|-------------|
| Single conversation | Multi-agent coordination |
| You guide each step | Autonomous execution |
| No memory between sessions | Persistent memory |
| Manual code application | Automatic code changes |
| No QA validation | Built-in QA loop |

### Is my code sent to Anthropic?

Yes, like any Claude interaction:
- Your code is processed by Claude's API
- Anthropic's standard privacy policy applies
- Code is not used to train models (per Anthropic's policy)
- See [Anthropic's privacy policy](https://www.anthropic.com/privacy)

### What languages/frameworks are supported?

Auto Claude works with any language or framework. It analyzes your project to understand the tech stack. Commonly tested with:
- JavaScript/TypeScript (React, Next.js, Node.js)
- Python (Django, Flask, FastAPI)
- Go, Rust, Java, C#
- And many more

---

## Pricing & Subscriptions

### What subscription do I need?

**Claude Pro or Claude Max subscription** is required.

- Claude Pro: Standard rate limits
- Claude Max: Higher rate limits, recommended for heavy use

### Does Auto Claude cost extra?

No additional cost beyond your Claude subscription. Auto Claude uses the Claude Code OAuth system which is included with Pro/Max subscriptions.

### Are there API costs?

Not for the main agents. However, optional features may have costs:
- **Memory System (Graphiti)** - Requires embedding provider (OpenAI, etc.)
- **Linear Integration** - Free with Linear account

---

## Tasks & Workflow

### How long does a task take?

Depends on complexity:

| Complexity | Typical Time |
|------------|--------------|
| Simple (1-2 files) | 5-15 minutes |
| Standard (3-10 files) | 15-45 minutes |
| Complex (10+ files) | 45+ minutes |

### Can I run multiple tasks at once?

Yes! Each task runs in an isolated git worktree. You can run up to 12 agent terminals simultaneously.

### What if the agent makes a mistake?

Several safeguards:
1. **QA validation** catches most issues
2. **Isolated worktrees** protect your main branch
3. **You review before merging**
4. **You can discard** any task completely

### Can I modify the code while a task is running?

**In the worktree:** Not recommended while agents are active (can cause conflicts)

**In your main branch:** Yes! The worktree is isolated.

### How do I provide feedback during a build?

1. Create `HUMAN_INPUT.md` in the spec directory:

   ```bash
   echo "Use the existing Button component" > specs/001-my-feature/HUMAN_INPUT.md
   ```

2. Or pause the task and add instructions via the UI

### Can I edit the implementation plan?

Yes! Edit `specs/{spec-name}/implementation_plan.json` (e.g., `specs/001-my-feature/implementation_plan.json`):
- Change subtask order
- Modify subtask descriptions
- Add or remove subtasks
- Mark subtasks as completed/pending

---

## Quality & Security

### How reliable is the code it produces?

Quality depends on:
- **Task clarity** - Clear descriptions produce better results
- **Codebase complexity** - Well-organized code = better results
- **QA validation** - Catches most issues before you review

Always review code before deploying to production.

### What security controls are in place?

Three-layer security model:

1. **OS Sandbox** - Bash commands run in isolation
2. **Filesystem Restrictions** - Operations limited to project directory
3. **Dynamic Command Allowlist** - Only approved commands for your tech stack

### Can it access the internet?

Limited:
- **Web search** for documentation lookup
- **API calls** your project normally makes
- **No arbitrary network access**

### Can it delete my files?

Only within the project directory, and:
- All changes happen in isolated worktrees
- Your main branch is protected
- You can discard any changes

---

## Memory System

### What is the Memory Layer?

Graphiti-based persistent memory that helps agents:
- Remember patterns from your codebase
- Recall past gotchas and solutions
- Maintain context across sessions

### Is the Memory Layer required?

No. It's optional but recommended. Without it:
- Each session starts fresh
- Agents may repeat past mistakes
- Less efficient for complex projects

### Where is memory data stored?

Locally in your project:

```text
.auto-claude/specs/001-my-feature/memory/      # File-based fallback
.auto-claude/specs/001-my-feature/graphiti/    # Graphiti database
```

### Does memory sync across machines?

Not automatically. Memory is stored locally. You could:
- Commit the `memory/` directory (not recommended for large DBs)
- Use a shared filesystem
- Export/import manually

---

## Git & Version Control

### What happens to my git history?

Each subtask creates a commit. Your history looks like:

```text
abc123 feat(user): Add avatar upload endpoint
def456 feat(user): Add avatar component
ghi789 feat(user): Add avatar styling
```

### What if I have uncommitted changes?

Auto Claude creates a worktree from your current branch. Uncommitted changes in your main directory are preserved.

### Can I use this with git-flow or trunk-based development?

Yes! Auto Claude creates feature branches:
- `auto-claude/001-feature-name`

You merge into your workflow however you prefer.

### What if the build takes multiple days?

No problem:
- Progress is saved after each subtask
- Sessions resume where they left off
- `--continue` flag explicitly resumes

---

## Integrations

### How do I use with GitHub Issues?

1. Connect GitHub in the app settings
2. Go to GitHub tab
3. Browse/search issues
4. Click "Import as Task" or "Investigate"

### How do I use with GitLab?

Add to `apps/backend/.env`:
```bash
GITLAB_TOKEN=glpat-...
GITLAB_INSTANCE_URL=https://gitlab.example.com  # or omit for gitlab.com
```

### How do I use with Linear?

Add to `apps/backend/.env`:
```bash
LINEAR_API_KEY=lin_api_...
```

Tasks automatically sync:
- New task → Linear issue created
- Progress → Linear status updated
- Complete → Linear issue closed

---

## Technical

### What models does Auto Claude use?

Three Claude models are available:

| Model | ID | Best For |
|-------|------|----------|
| **Opus** | `claude-opus-4-5-20251101` | Complex tasks, highest quality (default) |
| **Sonnet** | `claude-sonnet-4-5-20250929` | Balanced speed and quality |
| **Haiku** | `claude-haiku-4-5-20251001` | Fast utility operations, cost-effective |

Override with:
```bash
AUTO_BUILD_MODEL=claude-sonnet-4-5-20250929
```

Or select in the UI when creating a task.

### Can I use my own API key?

No. Auto Claude is designed to use Claude Code OAuth tokens only. This ensures:
- Proper rate limiting
- Subscription verification
- No accidental API charges

### What's the difference between CLI and Desktop app?

| CLI | Desktop App |
|-----|-------------|
| Terminal-based | Visual interface |
| Manual Python setup | Auto-configured |
| Good for servers/CI | Good for daily use |
| Same core functionality | Same core functionality |

### Can I run this on a server?

Yes! Use the CLI:
```bash
cd apps/backend
python run.py --spec 001
```

See [CLI-USAGE.md](CLI-USAGE.md) for details.

---

## Troubleshooting

### Where do I get help?

1. **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues
2. **[Discord Community](https://discord.gg/KCXaPBr4Dj)** - Real-time help
3. **[GitHub Issues](https://github.com/AndyMik90/Auto-Claude/issues)** - Bug reports
4. **[GitHub Discussions](https://github.com/AndyMik90/Auto-Claude/discussions)** - Questions

### How do I report a bug?

1. Go to [GitHub Issues](https://github.com/AndyMik90/Auto-Claude/issues)
2. Click "New Issue"
3. Select "Bug Report" template
4. Include:
   - Auto Claude version
   - Operating system
   - Steps to reproduce
   - Error messages
   - Debug output (`DEBUG=true`)

### How do I request a feature?

1. Go to [GitHub Discussions](https://github.com/AndyMik90/Auto-Claude/discussions)
2. Create a new discussion in "Ideas" category
3. Describe your use case and proposed feature

---

## Contributing

### How can I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Development setup
- Code guidelines
- PR process
- Testing requirements

### Is Auto Claude open source?

Yes! Licensed under **AGPL-3.0**:
- Free to use
- Free to modify
- Modifications must be shared if distributed
- Commercial licensing available for closed-source use

### Who maintains Auto Claude?

Created by [AndyMik90](https://github.com/AndyMik90) with community contributions.

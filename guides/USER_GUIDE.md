# Auto Claude User Guide

Complete documentation for all Auto Claude features.

---

## Table of Contents

1. [Overview](#overview)
2. [Navigation](#navigation)
3. [Kanban Board](#kanban-board)
4. [Creating Tasks](#creating-tasks)
5. [The Build Process](#the-build-process)
6. [Agent Terminals](#agent-terminals)
7. [Reviewing & Merging](#reviewing--merging)
8. [Insights](#insights)
9. [Roadmap](#roadmap)
10. [Ideation](#ideation)
11. [Changelog](#changelog)
12. [Context](#context)
13. [MCP Overview](#mcp-overview)
14. [Worktrees](#worktrees)
15. [GitHub Integration](#github-integration)
16. [GitLab Integration](#gitlab-integration)
17. [Settings](#settings)
18. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Overview

Auto Claude is an autonomous coding framework that uses multiple AI agents to build software. Describe what you want, and agents handle planning, implementation, and quality assurance.

### How It Works

```text
You describe a task
       ↓
   [Spec Phase]     → Analyzes codebase, creates detailed specification
       ↓
  [Planning Phase]  → Creates subtask-based implementation plan
       ↓
   [Build Phase]    → Coder agent implements each subtask
       ↓
    [QA Phase]      → QA agent validates acceptance criteria
       ↓
  [Ready to Review] → You review and merge
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Spec** | Complete specification of what to build |
| **Subtask** | Small, atomic unit of work the coder implements |
| **Session** | One run of an agent with maintained context |
| **Worktree** | Isolated git workspace where changes happen |
| **QA Loop** | Automatic validation that catches issues |

---

## Navigation

The sidebar provides access to all features:

### Main Views

| View | Shortcut | Description |
|------|----------|-------------|
| **Kanban Board** | `K` | Visual task management |
| **Agent Terminals** | `A` | Real-time agent output |
| **Insights** | `N` | Chat interface for codebase exploration |
| **Roadmap** | `D` | AI-assisted feature planning |
| **Ideation** | `I` | Discover improvements and issues |
| **Changelog** | `L` | Generate release notes |
| **Context** | `C` | View codebase context |
| **MCP Overview** | `M` | Agent tool configuration |
| **Worktrees** | `W` | Manage git worktrees |

### Git Integration (when enabled)

| View | Shortcut | Description |
|------|----------|-------------|
| **GitHub Issues** | `G` | Browse and import GitHub issues |
| **GitHub PRs** | `P` | View and manage pull requests |
| **GitLab Issues** | `B` | Browse GitLab issues |
| **GitLab MRs** | `R` | View merge requests |

---

## Kanban Board

Visual task management from creation to completion.

### Task Columns

| Column | Meaning |
|--------|---------|
| **Planning** | Tasks being analyzed and spec created |
| **In Progress** | Being built by agents |
| **AI Review** | QA agent validating the implementation |
| **Human Review** | Complete - your review needed |
| **Done** | Merged into project |

### Task Cards

Each card shows:
- Task title and status
- Progress indicator (subtasks completed)
- Phase indicator
- Quick actions (pause, resume, view)

Click a card to see:
- Full specification
- Implementation plan
- Agent terminal output
- File changes

---

## Creating Tasks

### From the UI

1. Click **"+ New Task"** or press the new task button
2. Enter a description of what you want to build
3. (Optional) Override complexity level
4. Click **"Create"**

### Writing Good Descriptions

**Be specific:**

```text
Add a user profile page that displays:
- Profile picture with upload capability
- Username and email
- Account creation date
- Edit profile button that opens a modal
```

**Less effective:**

```text
Add profiles
```

### Complexity Tiers

| Tier | When Used | Phases |
|------|-----------|--------|
| **Simple** | 1-2 files, UI tweaks | 3 phases |
| **Standard** | Features, 3-10 files | 6 phases |
| **Complex** | Multi-service, 10+ files | 8 phases |

Auto Claude automatically assesses complexity, but you can override.

---

## The Build Process

### Phase 1: Spec Creation

Creates a detailed specification:

1. **Discovery** - Scans codebase structure
2. **Requirements** - Extracts user requirements
3. **Research** - Looks up APIs/libraries (if needed)
4. **Context** - Identifies files to modify
5. **Spec Writing** - Creates spec.md
6. **Validation** - Verifies completeness

### Phase 2: Planning

Creates implementation plan:
- Breaks into subtasks
- Orders by dependencies
- Identifies files per subtask
- Creates acceptance criteria

### Phase 3: Building

Implements each subtask:
1. Reads current subtask
2. Writes/modifies code
3. Runs tests
4. Commits changes
5. Moves to next subtask

### Phase 4: QA Validation

Validates implementation:
1. Reviews acceptance criteria
2. Runs automated tests
3. Checks for issues
4. Approves or creates fix requests

---

## Agent Terminals

View real-time agent output.

### Accessing Terminals

1. Click **"Agent Terminals"** in sidebar (or press `A`)
2. Select a task to view its terminal
3. Watch live agent thinking and actions

### Terminal Output

```text
[Coder Agent Session 3]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Working on: Add user avatar upload endpoint

Reading: app/routes/users.py
Writing: app/routes/users.py
Running: pytest tests/test_users.py
✓ All tests passed

Subtask completed: chunk-1-2
```

### Multiple Terminals

Run up to 12 agent terminals simultaneously for parallel tasks.

---

## Reviewing & Merging

### When a Task is Ready

The task moves to "Human Review" when:
- All subtasks completed
- QA validation passed

### Reviewing Changes

1. Click the task card
2. View file changes in the diff viewer
3. Test in the isolated worktree:
   ```bash
   cd .worktrees/001-my-feature/
   npm run dev  # or your start command
   ```

### Merging

When satisfied:
1. Click **"Merge"** on the task
2. Changes merge into your current branch
3. Worktree is cleaned up
4. Task moves to "Done"

### Discarding

If you don't want the changes:
1. Click **"Discard"**
2. Confirm the action
3. All changes are deleted

---

## Insights

Chat interface for exploring your codebase.

### Accessing

Click **"Insights"** in sidebar or press `N`

### What You Can Do

- Ask questions about your code
- Understand how features work
- Find where functionality is implemented
- Get explanations of complex logic

### Example Queries

- "How does the authentication flow work?"
- "Where is the API rate limiting implemented?"
- "What files handle user permissions?"

---

## Roadmap

AI-assisted feature planning with analysis.

### Accessing

Click **"Roadmap"** in sidebar or press `D`

### Features

- **Generate Roadmap** - AI analyzes codebase and suggests features
- **Competitor Analysis** - Compare against competitors
- **Feature Cards** - Organize and prioritize features
- **Build** - Turn roadmap items into tasks

---

## Ideation

Discover improvements automatically.

### Accessing

Click **"Ideation"** in sidebar or press `I`

### Analysis Types

| Type | What It Finds |
|------|---------------|
| **Code Improvements** | Code quality suggestions, refactoring opportunities |
| **UI/UX Improvements** | User interface and experience enhancements |
| **Documentation** | Missing or outdated documentation |
| **Security** | Potential vulnerabilities, unsafe patterns |
| **Performance** | Optimization opportunities |
| **Code Quality** | Pattern violations, antipatterns |

### Workflow

1. Select analysis type
2. Wait for AI analysis
3. Review suggestions
4. Create tasks from recommendations

---

## Changelog

Generate release notes from completed tasks.

### Accessing

Click **"Changelog"** in sidebar or press `L`

### Features

- Auto-generates changelog from completed tasks
- Groups by version/date
- Categorizes changes (features, fixes, etc.)
- Export as Markdown

---

## Context

View discovered codebase context.

### Accessing

Click **"Context"** in sidebar or press `C`

### What's Shown

- Project structure analysis
- Detected tech stack
- Key files and their purposes
- Patterns identified

---

## MCP Overview

Configure agent tools and MCP servers.

### Accessing

Click **"MCP Overview"** in sidebar or press `M`

### What's Shown

- Available MCP tools
- Active tool configurations
- Custom MCP server setup

### Available Integrations

| Integration | Purpose |
|-------------|---------|
| **Context7** | Documentation lookup via @upstash/context7-mcp |
| **Graphiti Memory** | Knowledge graph for cross-session context |
| **Auto-Claude Tools** | Build progress, session context, discoveries & gotchas |
| **Linear** | Project management via Linear API |
| **Electron MCP** | Desktop app automation via Chrome DevTools Protocol |
| **Puppeteer MCP** | Web browser automation for non-Electron frontends |

---

## Worktrees

Manage git worktrees for isolated builds.

### Accessing

Click **"Worktrees"** in sidebar or press `W`

### What's Shown

- All active worktrees
- Associated tasks
- Branch status
- Quick actions (open, clean up)

### How Worktrees Work

Each task runs in an isolated worktree:

```text
your-project/
├── .worktrees/
│   ├── 001-my-feature/    ← Task 1's workspace
│   └── 002-another-task/  ← Task 2's workspace
```

Your main branch is never modified until you merge.

---

## GitHub Integration

### Enabling

1. Go to Settings → Project
2. Enable GitHub integration
3. Authenticate with GitHub

### GitHub Issues

Access via **"GitHub Issues"** (shortcut `G`)

- Browse repository issues
- Search and filter
- **Import as Task** - Create Auto Claude task from issue
- **Investigate** - AI analyzes the issue

### GitHub PRs

Access via **"GitHub PRs"** (shortcut `P`)

- View open pull requests
- See PR details and changes
- AI-assisted PR review

---

## GitLab Integration

### Enabling

Add to `apps/backend/.env`:
```bash
GITLAB_TOKEN=glpat-...
GITLAB_INSTANCE_URL=https://gitlab.example.com  # optional
```

### GitLab Issues

Access via **"GitLab Issues"** (shortcut `B`)

- Browse project issues
- Import as tasks
- AI investigation

### GitLab MRs

Access via **"GitLab MRs"** (shortcut `R`)

- View merge requests
- See MR details

---

## Settings

### Accessing

Click the settings gear icon or open from menu

### App Settings

| Setting | Description |
|---------|-------------|
| **Theme** | Light/Dark/System |
| **Default Model** | Which Claude model to use |
| **Auto-QA** | Run QA automatically |
| **Memory** | Enable Graphiti memory |

### Project Settings

| Setting | Description |
|---------|-------------|
| **GitHub/GitLab** | Enable git integrations |
| **Linear** | Enable Linear sync |
| **Custom MCP** | Add custom MCP servers |

### Environment Configuration

Edit `apps/backend/.env`:
```bash
# Required
CLAUDE_CODE_OAUTH_TOKEN=your-token

# Optional
AUTO_BUILD_MODEL=claude-opus-4-5-20251101
GRAPHITI_ENABLED=true
LINEAR_API_KEY=lin_api_...
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `K` | Kanban Board |
| `A` | Agent Terminals |
| `N` | Insights |
| `D` | Roadmap |
| `I` | Ideation |
| `L` | Changelog |
| `C` | Context |
| `M` | MCP Overview |
| `W` | Worktrees |
| `G` | GitHub Issues (when enabled) |
| `P` | GitHub PRs (when enabled) |
| `B` | GitLab Issues (when enabled) |
| `R` | GitLab MRs (when enabled) |

---

## Providing Feedback During Build

### Pausing a Task

- Click **"Pause"** on the task card
- Or press `Ctrl+C` in terminal

### Adding Instructions

Create `HUMAN_INPUT.md` in the spec directory:

```bash
echo "Please use the existing Button component" > specs/001-my-feature/HUMAN_INPUT.md
```

### Resuming

Click **"Resume"** or use:

```bash
python run.py --spec 001 --continue
```

---

## Next Steps

- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues
- **[FAQ](FAQ.md)** - Frequently asked questions
- **[CLI Usage](CLI-USAGE.md)** - Terminal workflows

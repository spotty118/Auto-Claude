# Auto Claude Views Guide

A detailed explanation of every tab and view in Auto Claude.

---

## Navigation Overview

The sidebar on the left provides access to all views. Views are organized into categories:

```text
┌─────────────────────────────────────────┐
│  MAIN VIEWS                             │
│  ├── Kanban Board (K)                   │
│  ├── Agent Terminals (A)                │
│  ├── Insights (N)                       │
│  ├── Roadmap (D)                        │
│  ├── Ideation (I)                       │
│  ├── Changelog (L)                      │
│  ├── Context (C)                        │
│  ├── MCP Overview (M)                   │
│  └── Worktrees (W)                      │
│                                         │
│  GIT INTEGRATION (when enabled)         │
│  ├── GitHub Issues (G)                  │
│  ├── GitHub PRs (P)                     │
│  ├── GitLab Issues (B)                  │
│  └── GitLab MRs (R)                     │
└─────────────────────────────────────────┘
```

---

## Kanban Board

**Shortcut:** `K`

The main task management interface. Visualizes all your tasks as cards moving through stages.

### What It Shows

A board with columns representing task states:

| Column | Description |
|--------|-------------|
| **Planning** | Tasks being analyzed and spec created |
| **In Progress** | Agents actively building the feature |
| **AI Review** | QA agent validating the implementation |
| **Human Review** | Complete - waiting for your review |
| **Done** | Successfully merged into your project |

### Task Cards

Each card displays:
- **Title** - The task description
- **Status badge** - Current phase (e.g., "Coding", "AI Review")
- **Progress bar** - Subtasks completed vs total
- **Time indicator** - How long the task has been running

### Actions

- **Click a card** → Open task details (spec, plan, terminal, changes)
- **"+ New Task" button** → Create a new task
- **Drag cards** → Reorder tasks within columns

### Inline Action Buttons

Each card has action buttons based on its state:

| Button | When Available | What It Does |
|--------|----------------|--------------|
| **Start** | Task in Planning | Begin build execution |
| **Stop** | Task running | Stop the current build |
| **Resume** | Task stopped | Continue from where it left off |
| **Recover** | Task failed | Attempt recovery from failure |
| **Archive** | Task complete/stopped | Remove task from board |

### Tips

- Tasks automatically move between columns as they progress
- You can have multiple tasks in different stages simultaneously
- Click a task to see real-time agent output

---

## Agent Terminals

**Shortcut:** `A`

Real-time view of what agents are doing.

### What It Shows

A grid of terminal windows showing live agent output:

```text
┌─────────────────────────────────────────┐
│ [Coder Agent - Task 001]                │
├─────────────────────────────────────────┤
│ Working on: Add user authentication     │
│                                         │
│ Reading: src/auth/login.ts              │
│ Writing: src/auth/login.ts              │
│ Running: npm test                       │
│ ✓ Tests passed                          │
│                                         │
│ Subtask completed: chunk-1-3            │
└─────────────────────────────────────────┘
```

### Features

- **Multiple terminals** - View up to 12 agents simultaneously
- **Live streaming** - See output as it happens
- **Auto-scroll** - Follows latest output
- **Task selector** - Switch between tasks

### What You'll See

| Output | Meaning |
|--------|---------|
| `Reading: file.ts` | Agent is examining a file |
| `Writing: file.ts` | Agent is modifying a file |
| `Running: command` | Agent is executing a command |
| `✓ Tests passed` | Tests succeeded |
| `✗ Tests failed` | Tests failed (agent will fix) |
| `Subtask completed` | One unit of work done |

### Tips

- Great for understanding how agents approach problems
- Useful for debugging when something goes wrong
- You can copy text from the terminal

---

## Insights

**Shortcut:** `N`

Chat interface for exploring and understanding your codebase.

### What It Does

Have a conversation with AI about your code:

```text
You: How does the authentication flow work?

Claude: The authentication flow in this codebase works as follows:

1. User submits credentials to /api/auth/login
2. AuthService validates against the database
3. JWT token is generated and returned
4. Token is stored in localStorage
5. Subsequent requests include token in Authorization header

Key files:
- src/services/AuthService.ts (main logic)
- src/middleware/auth.ts (token validation)
- src/routes/auth.ts (API endpoints)
```

### Features

- **Chat history** - Previous conversations saved in sidebar
- **Multiple sessions** - Start new conversations for different topics
- **Model selection** - Choose which Claude model to use
- **Create tasks** - Convert insights into actionable tasks

### Example Questions

- "How does the payment processing work?"
- "Where is user input validated?"
- "What API endpoints exist for user management?"
- "How are database migrations handled?"
- "What testing patterns are used in this codebase?"

### Tips

- Be specific with your questions
- Reference file names if you know them
- Ask follow-up questions to dig deeper

---

## Roadmap

**Shortcut:** `D`

AI-assisted feature planning and roadmap generation.

### What It Does

Analyzes your codebase and suggests potential features:

1. **Codebase Analysis** - AI reviews your project structure
2. **Feature Suggestions** - Generates ideas based on your code
3. **Competitor Analysis** - (Optional) Compare against competitors
4. **Feature Organization** - Kanban-style planning board

### View Tabs

| Tab | Description |
|-----|-------------|
| **Kanban** | Features organized by status columns |
| **Phases** | Features grouped by implementation phase |
| **All Features** | Complete list of all features |
| **By Priority** | Features sorted by MoSCoW priority |

**Kanban View:**

```text
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ UNDER REVIEW │   PLANNED    │ IN PROGRESS  │     DONE     │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Feature A    │ Feature C    │ Feature E    │ Feature G    │
│ Feature B    │ Feature D    │ Feature F    │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Priority System (MoSCoW)

Features can be assigned priorities:

| Priority | Label | Meaning |
|----------|-------|---------|
| **Must** | Must Have | Critical for release |
| **Should** | Should Have | Important but not critical |
| **Could** | Could Have | Nice to have if time permits |
| **Won't** | Won't Have | Out of scope for now |

### Feature Cards

Each suggested feature includes:
- **Title** - Feature name
- **Description** - What it does
- **Priority** - MoSCoW priority level
- **Status** - Under Review, Planned, In Progress, Done
- **Complexity** - Implementation difficulty

### Actions

| Action | Description |
|--------|-------------|
| **Generate Roadmap** | AI analyzes and suggests features |
| **Competitor Analysis** | Add competitor context |
| **Add Feature** | Manually add a feature |
| **Build** | Create Auto Claude task from feature |
| **Go to Task** | View linked task (if built) |
| **Delete** | Remove feature from roadmap |
| **Refresh** | Reload roadmap data |
| **Drag to reorder** | Prioritize within columns |

### Tips

- Use MoSCoW priorities to focus on what matters
- Run competitor analysis for better suggestions
- Build high-priority features directly into tasks
- Use phases for release planning

---

## Ideation

**Shortcut:** `I`

Automatic discovery of improvements, optimizations, and issues.

### What It Does

AI scans your codebase and finds:

| Type | What It Finds |
|------|---------------|
| **Code Improvements** | Code quality suggestions, refactoring opportunities |
| **UI/UX Improvements** | User interface and experience enhancements |
| **Documentation** | Missing or outdated documentation |
| **Security** | Vulnerabilities, unsafe patterns, missing validation |
| **Performance** | Slow queries, inefficient algorithms, memory issues |
| **Code Quality** | Pattern violations, antipatterns, maintainability issues |

### The Interface

```text
┌─────────────────────────────────────────┐
│ Ideation                    [Generate]  │
├─────────────────────────────────────────┤
│ ☑ Code Improvements  ☑ UI/UX  ☑ Security│
│ ☐ Performance  ☐ Documentation          │
│ ☐ Code Quality                          │
│ ┌─────────────────────────────────────┐ │
│ │ 🔒 SQL Injection Risk               │ │
│ │ src/api/users.ts:45                 │ │
│ │ User input passed directly to query │ │
│ │ [Convert to Task] [Dismiss]         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Default enabled:** Code Improvements, UI/UX, Security (toggle others as needed)

### Workflow

1. **Select types** - Choose what to scan for
2. **Generate** - AI analyzes your codebase
3. **Review ideas** - See what was found
4. **Take action** - Convert to task or dismiss

### Actions

- **Generate** - Run new analysis
- **Convert to Task** - Create Auto Claude task to fix
- **Dismiss** - Hide ideas you don't want
- **Filter by type** - Show only certain categories

### Tips

- Run periodically to catch new issues
- Security findings should be prioritized
- Some ideas may be false positives - review before acting

---

## Changelog

**Shortcut:** `L`

Generate professional release notes from completed work.

### What It Does

Creates formatted changelogs from:
- **Completed Tasks** - Auto Claude tasks marked done
- **Git History** - Recent commits, date ranges, or tag ranges
- **Branch Comparison** - Commits between two branches

### Source Options

| Source | Best For |
|--------|----------|
| **Completed Tasks** | When using Auto Claude for all work |
| **Git History** | When mixing manual and Auto Claude work |
| **Branch Comparison** | For comparing changes between two branches |

### Configuration

| Setting | Options |
|---------|---------|
| **Format** | Keep a Changelog, Simple List, GitHub Release |
| **Audience** | Technical, User-Facing, Marketing |
| **Emoji Level** | None, Headings Only, Headings + Highlights, Everything |
| **Version** | Semantic version number |

### Generated Output Example

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- User profile avatars with image upload (#123)
- Dark mode toggle in settings (#124)

### Fixed
- Login button not working on mobile (#125)

### Changed
- Improved API response times (#126)
```

### Actions

- **Generate** - Create changelog
- **Edit** - Modify the generated text
- **Copy** - Copy to clipboard
- **Save** - Save as CHANGELOG.md

---

## Context

**Shortcut:** `C`

View what Auto Claude knows about your project.

### Two Tabs

#### Project Index

Shows the analyzed structure of your codebase:

```text
Project Structure
├── src/
│   ├── components/    → React components
│   ├── services/      → Business logic
│   ├── api/           → API routes
│   └── utils/         → Helper functions
├── tests/             → Test files
└── docs/              → Documentation
```

Includes:
- **Directory purposes** - What each folder is for
- **Key files** - Important files and their roles
- **Tech stack** - Detected frameworks and libraries
- **Patterns** - Coding patterns found

#### Memories

If Graphiti memory is enabled, shows:
- **Recent memories** - What agents learned recently
- **Search** - Find specific memories
- **Patterns** - Recurring patterns discovered
- **Gotchas** - Known issues and pitfalls

### Actions

- **Refresh** - Re-analyze the project
- **Search memories** - Find specific context

### Tips

- Check this if agents seem confused about your project
- Refresh after major structural changes
- Memories help agents avoid repeating mistakes

---

## MCP Overview

**Shortcut:** `M`

Configure Model Context Protocol (MCP) servers and agent tools.

### What It Shows

| Section | Description |
|---------|-------------|
| **Active Servers** | MCP servers currently enabled |
| **Available Tools** | Tools each server provides |
| **Agent Phases** | Which tools each agent type uses |
| **Custom Servers** | Your custom MCP configurations |

### Built-in MCP Servers

| Server | Purpose | Used By |
|--------|---------|---------|
| **Context7** | Documentation lookup via @upstash/context7-mcp | spec_researcher, planner, coder, pr_reviewer, analysis, roadmap_discovery (required) + qa_reviewer, qa_fixer (optional) |
| **Graphiti Memory** | Knowledge graph for cross-session context | planner, coder (required) + qa_reviewer, qa_fixer (optional) |
| **Auto-Claude Tools** | Build progress, session context, discoveries & gotchas | planner, coder (required) + qa_reviewer, qa_fixer (optional) |
| **Linear** | Project management via Linear API | planner, coder, qa_reviewer, qa_fixer (all optional) |
| **Electron MCP** | Desktop app automation via Chrome DevTools Protocol | QA agents |
| **Puppeteer MCP** | Web browser automation for non-Electron frontends | QA agents |

### Per-Agent Configuration

Shows which tools each agent type has access to:

```text
Coder Agent
├── Read, Write, Edit, Glob, Grep
├── Bash (sandboxed)
├── WebFetch, WebSearch
└── MCP: Context7, Graphiti, Auto-Claude
```

### Actions

- **Toggle servers** - Enable/disable for this project
- **Add custom server** - Configure your own MCP server
- **View tools** - See what tools a server provides

### Tips

- Disable unused servers to reduce noise
- Add custom MCP servers for specialized tools
- QA agents get browser tools automatically for web projects

---

## Worktrees

**Shortcut:** `W`

Manage git worktrees used for isolated builds.

### What It Shows

List of all active worktrees:

```text
┌─────────────────────────────────────────┐
│ Worktrees                    [Refresh]  │
├─────────────────────────────────────────┤
│ 📁 001-user-auth                        │
│    Branch: auto-claude/001-user-auth    │
│    Status: 5 commits ahead of main      │
│    Task: Add user authentication        │
│    [Open] [Merge] [Delete]              │
├─────────────────────────────────────────┤
│ 📁 002-dark-mode                        │
│    Branch: auto-claude/002-dark-mode    │
│    Status: Building (3/7 subtasks)      │
│    Task: Add dark mode toggle           │
│    [Open]                               │
└─────────────────────────────────────────┘
```

### Information Displayed

- **Worktree name** - Matches the spec ID
- **Branch** - Git branch name
- **Status** - Ahead/behind, conflicts
- **Linked task** - Associated Auto Claude task
- **File changes** - Added/modified/deleted counts

### Actions

| Action | Description |
|--------|-------------|
| **Open** | Open worktree folder in file explorer |
| **Merge** | Merge worktree changes into main |
| **Delete** | Remove worktree and branch |
| **Refresh** | Update worktree status |

### Tips

- Use "Open" to test changes in the isolated workspace
- Merge from here or from the task card
- Delete stale worktrees to clean up disk space

---

## GitHub Issues

**Shortcut:** `G` (when GitHub enabled)

Browse and import GitHub issues.

### What It Shows

Issues from your connected GitHub repository:

```text
┌─────────────────────────────────────────┐
│ GitHub Issues            [Refresh]      │
├─────────────────────────────────────────┤
│ 🔴 #42 Login fails on Safari            │
│    bug, high-priority                   │
│    [Import as Task] [Investigate]       │
├─────────────────────────────────────────┤
│ 🟢 #41 Add export to CSV                │
│    enhancement                          │
│    [Import as Task] [Investigate]       │
└─────────────────────────────────────────┘
```

### Features

- **Search** - Find issues by keyword
- **Filter** - By label, state, assignee
- **Sort** - By date, comments, reactions

### Actions

| Action | What It Does |
|--------|--------------|
| **Import as Task** | Create Auto Claude task from issue |
| **Investigate** | AI analyzes the issue and suggests approach |
| **View on GitHub** | Open in browser |

### Tips

- Use "Investigate" before importing complex issues
- Labels are preserved when importing
- Issue description becomes task context

---

## GitHub PRs

**Shortcut:** `P` (when GitHub enabled)

View and review pull requests.

### What It Shows

Open PRs on your repository:

```text
┌─────────────────────────────────────────┐
│ GitHub Pull Requests     [Refresh]      │
├─────────────────────────────────────────┤
│ #38 Add user authentication             │
│    auto-claude/001-user-auth → main     │
│    +342 -28 | 12 files                  │
│    [View Changes] [AI Review]           │
└─────────────────────────────────────────┘
```

### Features

- **View changes** - See diff in the app
- **AI Review** - Get AI analysis of the PR
- **Filter** - By author, status, branch

### AI Review

Analyzes the PR and provides:
- Summary of changes
- Potential issues
- Suggestions for improvement
- Security considerations

---

## GitLab Issues

**Shortcut:** `B` (when GitLab enabled)

Same functionality as GitHub Issues for GitLab repositories.

---

## GitLab MRs

**Shortcut:** `R` (when GitLab enabled)

Same functionality as GitHub PRs for GitLab merge requests.

---

## Summary Table

| View | Shortcut | Purpose |
|------|----------|---------|
| **Kanban Board** | `K` | Task management and progress visualization |
| **Agent Terminals** | `A` | Real-time agent output and debugging |
| **Insights** | `N` | Chat with AI about your codebase |
| **Roadmap** | `D` | Feature planning and prioritization |
| **Ideation** | `I` | Discover improvements and issues |
| **Changelog** | `L` | Generate release notes |
| **Context** | `C` | View project index and memories |
| **MCP Overview** | `M` | Configure agent tools |
| **Worktrees** | `W` | Manage isolated git workspaces |
| **GitHub Issues** | `G` | Import GitHub issues as tasks |
| **GitHub PRs** | `P` | View and review pull requests |
| **GitLab Issues** | `B` | Import GitLab issues as tasks |
| **GitLab MRs** | `R` | View merge requests |

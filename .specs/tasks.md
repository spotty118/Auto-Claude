# Auto Claude Codebase Improvement Backlog

> **⚠️ META-LAYER**: This is NOT part of Auto Claude. This is a work assignment system for external AI agents improving the codebase. See [README.md](README.md) for the full architecture.
>
> **Last Analysis**: 2026-01-02 (Ultrathink Analysis by Claude Opus 4.5)

---

## 🎯 How This Spec Steers You

This is not just a todo list—it is a **work assignment system**. Reading this changes what you do:

| What You Read | How It Steers You |
|:---|:---|
| "Task H1 is High Priority" | You now know what matters most. You won't waste time on low-value work. |
| "Mark task [/] when starting" | You now know how to claim work. You won't duplicate effort with other agents. |
| "Files: apps/backend/agents/coder.py" | You now know exactly where to look. You won't search blindly. |
| "Effort: Low" | You now know the scope. You won't over-engineer a simple fix. |

**The Task Spec is your work order.** It tells you what to do, where to do it, and how much effort to spend.

---

## 📊 Fresh Analysis (2026-01-02 - Ultrathink)

### Codebase Statistics
| Metric | Value | Details |
|:---|:---|:---|
| **Backend** | **448** Python files | 23+ subdirectories including `merge/` (56), `runners/` (89), `analysis/` (25) |
| **Frontend** | **675** TypeScript files | 223 Main process, 426 Renderer (363 components), 53 Shared |
| **Tests** | **58** files | pytest with asyncio, CodeCov (20% min) |
| **Prompts** | **23+** files | Extensively documented agent prompts |
| **CI/CD** | **16+** workflows | Multi-platform release, security scanning |
| **Agent Types** | **25+** | Defined in `AGENT_CONFIGS` with tool/MCP control |

### Key Findings from Ultrathink Analysis
1.  **Meta-Layer Fully Documented**: `.specs/` and `.spec-kit/` now documented in CONTEXT_MAP.md
2.  **Agent Configuration Matrix Expanded**: 25+ agent types with thinking budgets (none → ultrathink)
3.  **CI/CD Comprehensively Mapped**: 16+ GitHub Actions workflows documented
4.  **Project Analysis Module Added**: `project/` directory for stack detection now documented
5.  **Frontend Agent System**: `src/main/agent/` with spawn ID tracking, rate limit handling
6.  **Multi-Provider Memory**: Graphiti supports OpenAI, Anthropic, Azure, Ollama, Google, OpenRouter

---

## Task Legend

| Status | Meaning |
|:---|:---|
| `[ ]` | Pending - Available for work |
| `[/]` | In Progress - An agent is working on this |
| `[x]` | Completed |
| `[!]` | Blocked - Needs human input |

---

## 🟢 Completed Tasks

### Task A1-A5: Deep Codebase Analysis
- **Status**: `[x]` Completed (Antigravity - 2026-01-02)
- **Outcome**: Full backend/frontend enumeration, documentation update, code quality verification

### Task A6: Ultrathink Analysis & Context Map Update
- **Status**: `[x]` Completed (Claude Opus 4.5 - 2026-01-02)
- **Scope**: 8 parallel exploration agents analyzing entire codebase
- **Outcomes**:
  - Added Meta Layer section to CONTEXT_MAP.md
  - Expanded Agent Configuration Matrix (25+ agents, thinking levels, model hierarchy)
  - Added `project/` module documentation
  - Expanded CI/CD section (16+ workflows, multi-platform matrix)
  - Added Graphiti multi-provider documentation

---

## 🔴 High Priority Tasks

### Task H1: Frontend Test Coverage
- **Status**: `[/]` In Progress (Droid CLI + Spec-Driven - 2026-01-02)
- **Problem**: Frontend has 675 files but limited test coverage
- **Files**: `apps/frontend/src/renderer/components/` (363 components)
- **Goal**: Add Vitest tests for critical UI components (KanbanBoard, TaskCreationWizard, AgentTools)
- **Effort**: High
- **Acceptance**: 50%+ coverage on critical paths
- **Progress**:
  - ✅ `TaskCreationWizard.test.tsx` - 32 tests (draft management, form submission, git integration)
  - ✅ `RoadmapKanbanView.test.tsx` - 18 tests (rendering, DnD, feature grouping)
  - ✅ `Terminal.test.tsx` - 29 tests (lifecycle, file drop, Claude mode, task association)
  - ✅ `AgentTools.test.tsx` - 38 tests (MCP config, custom servers, health checks, agent cards)
  - ⏳ Pending: Run tests and generate coverage report (requires Node.js)
- **Total**: 117 tests across 4 critical components

### Task H2: IPC Handler Documentation
- **Status**: `[ ]` High Priority
- **Problem**: 103 IPC handlers with minimal inline documentation
- **Files**: `apps/frontend/src/main/ipc-handlers/`
- **Goal**: Add JSDoc comments to all IPC handlers describing request/response contracts
- **Effort**: Medium
- **Acceptance**: All handlers have JSDoc with @param, @returns, @example

### Task H3: Agent Process Error Recovery
- **Status**: `[ ]` High Priority
- **Problem**: Agent process crashes may leave orphan processes
- **Files**: `apps/frontend/src/main/agent/agent-process.ts`, `agent-state.ts`
- **Goal**: Implement process cleanup on crash, timeout handling
- **Effort**: Medium
- **Acceptance**: No orphan Python processes after Electron crash

---

## 🟡 Medium Priority Tasks

### Task M1: Merge Conflict Resolution Tests
- **Status**: `[ ]` Medium Priority
- **Problem**: `merge/` has 56 files but only 7 test files
- **Files**: `apps/backend/merge/`
- **Goal**: Add tests for edge cases (multi-file conflicts, semantic conflicts)
- **Effort**: High
- **Acceptance**: 70%+ coverage on merge module

### Task M2: Graphiti Provider Fallback
- **Status**: `[ ]` Medium Priority
- **Problem**: Graphiti fails silently if provider unavailable
- **Files**: `apps/backend/integrations/graphiti/`
- **Goal**: Add graceful fallback when LLM/embedder provider is unavailable
- **Effort**: Medium
- **Acceptance**: Clear error messages, optional file-based fallback

### Task M3: Rate Limit Auto-Swap Improvements
- **Status**: `[ ]` Medium Priority
- **Problem**: Auto-swap limited to 2 retries, could be smarter
- **Files**: `apps/frontend/src/main/agent/agent-process.ts`
- **Goal**: Implement exponential backoff, per-profile rate limit tracking
- **Effort**: Medium
- **Acceptance**: Reduced task failures due to rate limits

### Task M4: Security Scanner Integration Tests
- **Status**: `[ ]` Medium Priority
- **Problem**: Security scanner needs E2E validation
- **Files**: `apps/backend/analysis/security_scanner.py`, `apps/backend/security/`
- **Goal**: Add integration tests for real-world vulnerability detection
- **Effort**: Medium
- **Acceptance**: Tests covering OWASP Top 10 patterns

---

## 🔵 Low Priority Tasks (Optimization)

### Task O1: Improve Logging Coverage
- **Status**: `[ ]` Low Priority
- **Analysis**: ~25% coverage (77 files with `logging` + 34 with custom `debug` module)
- **Goal**: Increase observability for complex debug scenarios
- **Effort**: Medium

### Task O2: Narrow Exception Handling
- **Status**: `[ ]` Low Priority
- **Analysis**: 114 files use broad `except Exception`
- **Goal**: Replace with specific exceptions where possible
- **Effort**: High

### Task O3: Add Frontend E2E Tests
- **Status**: `[ ]` Low Priority
- **Scope**: Use Electron MCP for automated UI testing
- **Goal**: Playwright tests for critical user flows
- **Effort**: High

### Task O4: Centralize Configuration
- **Status**: `[ ]` Low Priority
- **Goal**: Consolidate scattered config constants
- **Effort**: High

### Task O5: Documentation Sync Automation
- **Status**: `[ ]` Low Priority
- **Problem**: CONTEXT_MAP.md can drift from actual codebase
- **Goal**: Add script to detect documentation drift
- **Effort**: Low

---

## 📋 Summary

**Codebase State**: Stable, well-documented after ultrathink analysis.
**Primary Directive**: Focus on high-priority tasks (H1-H3) for reliability improvements.
**Documentation**: CONTEXT_MAP.md now comprehensive with meta-layer, agents, CI/CD.

---

## Notes for AI Agents

- **Before starting**: Mark the task `[/]` so other agents know it's being worked on.
- **After completing**: Mark the task `[x]` and add a brief note with the commit hash.
- **Constitution**: Read `.specs/constitution.md` before starting any work.
- **Entry Points**: Use [CONTEXT_MAP.md](../CONTEXT_MAP.md) for navigation.
- **Model Selection**: Use haiku for simple tasks, sonnet for coding, opus for complex reasoning.

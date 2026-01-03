# Codebase Requirements for AI Agents

> **⚠️ META-LAYER**: This is NOT part of Auto Claude. This is a steering file for external AI agents improving the codebase. See [README.md](README.md) for the full architecture.

---

## 🎯 How This Spec Steers You

This is not just documentation—it is a **steering file**. Reading this changes your behavior:

| What You Read | How It Steers You |
|:---|:---|
| "Read PROJECT_SPEC.md first" | You now know where to start. You won't fumble around. |
| "Update specs when you change architecture" | You now know your obligations. You won't leave docs stale. |
| "Check tasks.md for improvement opportunities" | You now know what to work on. You won't invent random tasks. |
| "Push only to vzwjustin/user/justin" | You now know the boundaries. You won't break the workflow. |

**Spec-Driven Development = AI Steering.** The spec is your guardrail and your compass.

---

## 1. Project Identity

**Name**: Auto Claude
**Type**: Autonomous Software Engineering Agent System
**Vision**: A spec-driven development platform where AI agents plan before they code.

---

## 2. Core Requirements for AI Contributors

### REQ-01: Understand Before Acting
**As an** AI Agent entering this codebase,
**I must** read and understand the project's spec-driven methodology,
**So that** my contributions align with the architectural intent.

**Acceptance Criteria**:
- [ ] Read `PROJECT_SPEC.md` to understand the "Spec First" workflow.
- [ ] Read `CONTEXT_MAP.md` to navigate the file structure.
- [ ] Check `.specs/tasks.md` for current improvement opportunities.

---

### REQ-02: Respect the Living Documents
**As an** AI Agent making changes,
**I must** update specs when I change architecture,
**So that** documentation stays synchronized with code.

**Acceptance Criteria**:
- [ ] If I add a new file, I update `CONTEXT_MAP.md`.
- [ ] If I change the design, I update `.specs/design.md`.
- [ ] If I complete a task, I mark it `[x]` in `.specs/tasks.md`.

---

### REQ-03: Follow the Improvement Backlog
**As an** AI Agent looking to improve the codebase,
**I should** prioritize tasks listed in `.specs/tasks.md`,
**So that** work is coordinated and not duplicated.

**Acceptance Criteria**:
- [ ] Check `.specs/tasks.md` for pending improvements.
- [ ] Mark a task `[/]` when starting work.
- [ ] Create a proper spec in `.auto-claude/specs/` if the task is complex.

---

### REQ-04: Security First
**As an** AI Agent executing commands,
**I must** respect the project's security boundaries,
**So that** I do not cause harm.

**Acceptance Criteria**:
- [ ] Do not execute commands outside of `project_dir`.
- [ ] Do not install global packages without user approval.
- [ ] Do not push to `AndyMik90/Auto-Claude` unless explicitly requested.

---

### REQ-05: Testing is Mandatory
**As an** AI Agent writing code,
**I must** write or update tests for any functionality I change,
**So that** regressions are prevented.

**Acceptance Criteria**:
- [ ] Refer to `CONTEXT_MAP.md` Testing Map for test file locations.
- [ ] Run `pytest tests/` before claiming a task is complete.

---

## 3. Non-Functional Requirements

| ID | Requirement | Priority |
|:---|:---|:---|
| NFR-01 | Commits must be atomic and descriptive. | High |
| NFR-02 | Python code must pass `ruff` linting. | High |
| NFR-03 | TypeScript code must pass `eslint`. | High |
| NFR-04 | All changes must be pushed to `vzwjustin/user/justin`. | Critical |

---

## 4. Reference Links for AI Agents

- **Constitution**: [constitution.md](file:///Users/justinadams/auto-claude/.specs/constitution.md) ← **READ THIS FIRST**
- **Project Spec**: [PROJECT_SPEC.md](file:///Users/justinadams/auto-claude/PROJECT_SPEC.md)
- **File Map**: [CONTEXT_MAP.md](file:///Users/justinadams/auto-claude/CONTEXT_MAP.md)
- **Spec Methodology**: [SPEC_ARCHITECTURE.md](file:///Users/justinadams/auto-claude/SPEC_ARCHITECTURE.md)
- **Improvement Tasks**: [tasks.md](file:///Users/justinadams/auto-claude/.specs/tasks.md)
- **Templates**: [templates.md](file:///Users/justinadams/auto-claude/.specs/templates.md)

---

## 5. GitHub Spec-Kit Foundation

This project includes the official **GitHub Spec-Kit** as a foundational layer in `.spec-kit/`.

| Resource | Path | Description |
|:---|:---|:---|
| **Official Templates** | `.spec-kit/templates/` | Spec, Plan, Tasks templates from GitHub. |
| **Constitution Template** | `.spec-kit/memory/constitution.md` | Official constitution format. |
| **Scripts** | `.spec-kit/scripts/` | Helper scripts for spec management. |
| **Spec-Driven Guide** | `.spec-kit/spec-driven.md` | Comprehensive SDD methodology. |
| **Agent Instructions** | `.spec-kit/AGENTS.md` | How agents should work with spec-kit. |

**To reuse in another project**: Copy the `.spec-kit/` directory to your new project root.

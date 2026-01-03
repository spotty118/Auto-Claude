# Project Spec: Auto Claude

> **Master Context**: This document defines the **Requirements**, **Design**, and **Tasks** for the Auto Claude codebase, implementing a strict **Spec-Driven Development (SDD)** workflow inspired by **Kiro** and the **GitHub Spec Kit**.

---

## 1. Requirements (The "What")

**Goal**: Build an autonomous software engineering system where "coding" is the last step, strictly following a "Specify -> Plan -> Implement" lifecycle.

### 1.1. Core Capabilities
*   **Structured SDD**: Agents must strictly follow the `Specify -> Plan -> Tasks -> Implement` workflow.
*   **Living Documentation**: Specs are not static. If the code evolves, the spec **MUST** be updated to reflect reality.
*   **Atomic Task Execution**: Implementation is broken down into small, verifiable steps.

### 1.2. The 4-Phase Artifacts
To satisfy the SDD workflow (aligned with GitHub Spec Kit), the system uses the following mapping:

| Phase | Auto Claude Artifact | Purpose |
|:---|:---|:---|
| **1. Specify** | `spec.md` (Design) | High-level description, user stories, and technical architecture. |
| **2. Plan** | `implementation_plan.json` | Detailed technical constraints and architectural decisions. |
| **3. Tasks** | `implementation_plan.json` (Chunks) | Concrete, atomic units of work broken down from the plan. |
| **4. Implement** | Code Changes | Execution of tasks with incremental review. |

---

## 2. Design (The "How")

**Architecture Reference**: [CONTEXT_MAP.md](file:///Users/justinadams/auto-claude/CONTEXT_MAP.md)

### 2.1. System Modules
*   **Backend (`apps/backend`)**: Orchestration engine running the Spec Pipeline.
*   **Frontend (`apps/frontend`)**: UI for visualizing the "Living Specs".
*   **Memory (`integrations/graphiti`)**: Long-term storage for project context.

### 2.2. The Living Spec Lifecycle
1.  **Draft**: User request serves as the seed.
2.  **Specify**: Spec Writer analyzes code (`context.json`) to write the **Design** (`spec.md`).
3.  **Plan**: Planner converts Design into a technical strategy.
4.  **Tasks**: Planner breaks strategy into **Tasks** (`implementation_plan.json`).
5.  **Build**: Coder implements tasks.
6.  **Sync**: **CRITICAL** - If implementation reveals a design flaw, the Coder **MUST NOT** hack a fix. It must request a **Spec Update** to keep the Design document "alive".

---

## 3. Tasks & Directives (The "Action")

**Operational Rules for AI Agents**:

### 3.1. The "Spec First" Directive
**Trigger**: User requests a non-trivial code change.
**Action**:
1.  **Check**: Does a Plan (`implementation_plan.json`) exist?
2.  **If No**: STOP. Initiate the Spec Pipeline (`specify` -> `plan` -> `tasks`).
3.  **If Yes**: Execute the next `pending` task.

### 3.2. The "Living Doc" Directive
**Trigger**: You discover that the `spec.md` (Design) conflicts with reality or is impossible to implement.
**Action**:
1.  **Stop Coding**.
2.  **Update Spec**: Modify `spec.md` to reflect the necessary architectural change.
3.  **Update Plan**: Adjust `implementation_plan.json` to match the new design.
4.  **Resume**: Continue coding only after the "Docs" match the "Code".

### 3.3. Implementation Workflow
1.  **Read Task**: Get the current atomic step from `implementation_plan.json`.
2.  **Verify Context**: Ensure you are looking at the right files (refer to `context.json`).
3.  **Code & Test**: Implement the task and run its specific test.
4.  **Commit**: "feat(scope): descriptions" (linked to task ID).

---

## 4. Reference Links
*   [SPEC_ARCHITECTURE.md](file:///Users/justinadams/auto-claude/SPEC_ARCHITECTURE.md) (Detailed Pipeline Logic)
*   [CONTEXT_MAP.md](file:///Users/justinadams/auto-claude/CONTEXT_MAP.md) (File Structure)

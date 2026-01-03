# Spec Templates

> **Purpose**: This directory contains templates for creating new specs in the `.specs/` structure. AI agents should use these templates when creating new feature specifications.

---

## Available Templates

### 1. Feature Spec Template (`spec-template.md`)
Use this when creating a new feature specification.

```markdown
# Feature: [Name]

## Overview
[Brief description of the feature]

## User Stories

### US-01: [Story Title]
**As a** [role],
**I want** [capability],
**So that** [benefit].

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Constraints
- [Constraint 1]
- [Constraint 2]

## Out of Scope
- [Exclusion 1]
- [Exclusion 2]

## Review Checklist
- [ ] Requirements are unambiguous
- [ ] Acceptance criteria are testable
- [ ] Dependencies are identified
- [ ] Security implications considered
```

---

### 2. Plan Template (`plan-template.md`)
Use this when creating a technical implementation plan.

```markdown
# Implementation Plan: [Feature Name]

## Technical Decisions

### Architecture
[Describe the chosen architecture]

### Technology Stack
| Component | Choice | Justification |
|:---|:---|:---|
| [Component] | [Technology] | [Why] |

## Implementation Phases

### Phase 1: [Name]
- **Goal**: [What this phase achieves]
- **Files**: [Files to create/modify]
- **Dependencies**: [What must be done first]

### Phase 2: [Name]
...

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|:---|:---|:---|:---|
| [Risk] | High/Med/Low | High/Med/Low | [Strategy] |

## Verification Plan
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual verification complete
```

---

### 3. Tasks Template (`tasks-template.md`)
Use this when breaking down a plan into tasks.

```markdown
# Tasks: [Feature Name]

## Task Legend
| Status | Meaning |
|:---|:---|
| `[ ]` | Pending |
| `[/]` | In Progress |
| `[x]` | Completed |
| `[!]` | Blocked |

## Tasks

### Task 1: [Title]
- **Status**: `[ ]`
- **File**: `path/to/file.py`
- **Description**: [What to do]
- **Acceptance**: [How to verify]
- **Effort**: Low/Medium/High

### Task 2: [Title]
...

## Notes for AI Agents
- Mark `[/]` when starting
- Mark `[x]` when complete
- Mark `[!]` if blocked
```

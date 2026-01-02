# Quick Start Guide

Get Auto Claude running in 5 minutes.

---

## Step 1: Download & Install

Download the app for your platform from the [README](../README.md#download).

| Platform | What to Download |
|----------|------------------|
| **Windows** | `.exe` installer |
| **macOS (M1/M2/M3)** | `darwin-arm64.dmg` |
| **macOS (Intel)** | `darwin-x64.dmg` |
| **Linux** | `.AppImage` or `.deb` |

---

## Step 2: Open Your Project

1. Launch Auto Claude
2. Click **"Open Project"** or drag a folder onto the window
3. Select a folder that contains a **git repository**

> **Important:** Your project must be a git repo. If it's not, run `git init` in your project folder first.

---

## Step 3: Connect to Claude

The app will prompt you to authenticate:

1. Click **"Connect Claude"** when prompted
2. This opens your browser to sign in with your Claude account
3. Approve the connection
4. You're authenticated!

> **Requires:** Claude Pro or Max subscription

---

## Step 4: Create Your First Task

1. Click the **"+ New Task"** button
2. Describe what you want to build:
   - "Add a dark mode toggle to the settings page"
   - "Fix the login button not working on mobile"
   - "Add user profile avatars with image upload"
3. Click **"Create"**

---

## Step 5: Watch It Build

Auto Claude will:

1. **Analyze** your codebase to understand the structure
2. **Plan** the implementation with specific subtasks
3. **Code** each subtask automatically
4. **Validate** the work with QA checks
5. **Complete** - ready for your review!

You can watch progress in the:
- **Kanban board** - visual task cards moving through stages
- **Agent terminals** - real-time agent output (click a task to see)

---

## Step 6: Review & Merge

When the task is in **"Human Review"**:

1. Click the task to see what changed
2. Review the code in the diff viewer
3. Test the changes in the isolated workspace
4. Click **"Merge"** to add changes to your project

> **Safe by default:** All changes happen in an isolated git worktree. Your main branch is never modified until you explicitly merge.

---

## What's Next?

- **[User Guide](USER_GUIDE.md)** - Complete feature documentation
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
- **[FAQ](FAQ.md)** - Frequently asked questions
- **[CLI Usage](CLI-USAGE.md)** - Terminal-only usage

---

## Quick Tips

| Tip | How |
|-----|-----|
| **Pause a build** | Press `Ctrl+C` once in the terminal |
| **Add instructions mid-build** | Create a `HUMAN_INPUT.md` file in the spec folder |
| **Run multiple tasks** | Each task runs in its own isolated workspace |
| **See agent thinking** | Click the task card to open the agent terminal |
| **Test changes safely** | Navigate to `.worktrees/{spec-name}/` (e.g., `.worktrees/001-my-feature/`) |

---

## Getting Help

- **Discord:** [Join the community](https://discord.gg/KCXaPBr4Dj)
- **Issues:** [Report bugs](https://github.com/AndyMik90/Auto-Claude/issues)
- **Discussions:** [Ask questions](https://github.com/AndyMik90/Auto-Claude/discussions)

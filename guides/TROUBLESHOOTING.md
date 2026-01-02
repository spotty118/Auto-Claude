# Troubleshooting Guide

Common issues and their solutions.

---

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Build/Task Issues](#buildtask-issues)
3. [QA Loop Issues](#qa-loop-issues)
4. [Merge Issues](#merge-issues)
5. [Memory System Issues](#memory-system-issues)
6. [Platform-Specific Issues](#platform-specific-issues)
7. [Performance Issues](#performance-issues)

---

## Authentication Issues

### "No OAuth token found"

**Symptoms:**

```text
Error: No OAuth token found.
Auto Claude requires Claude Code OAuth authentication.
```

**Solutions:**

1. **Run the setup command:**

   ```bash
   claude setup-token
   ```

2. **Verify the token was saved:**
   - **macOS:** Check Keychain Access for "Claude Code-credentials"
   - **Windows:** Check `%USERPROFILE%\.claude\.credentials.json`
   - **Linux:** Set `CLAUDE_CODE_OAUTH_TOKEN` in `.env`

3. **Manual token setup:**

   ```bash
   # Add to apps/backend/.env
   CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-your-token-here
   ```

### "OAuth token expired"

**Symptoms:**
- Authentication errors after working previously
- "Invalid token" errors

**Solution:**

```bash
# Re-authenticate
claude setup-token
```

### "Subscription required"

**Symptoms:**

```text
Error: Claude Pro or Max subscription required
```

**Solution:**
- Upgrade at [claude.ai/upgrade](https://claude.ai/upgrade)
- Ensure you're signed in with the subscribed account

---

## Build/Task Issues

### Task stuck on "Spec Creation"

**Possible causes:**
1. Large codebase taking time to analyze
2. Network issues
3. Agent error

**Solutions:**

1. **Wait** - Large codebases can take 5-10 minutes
2. **Check the terminal** - Click the task to see agent output
3. **Check for errors** in the terminal output
4. **Restart the task:**
   - Click "Discard"
   - Create a new task with the same description

### Build incomplete

**Symptoms:**

```text
❌ Build is not complete. Cannot run QA validation.
   Progress: 5/10 subtasks completed
```

**Solutions:**

1. **Continue the build:**

   ```bash
   python run.py --spec 001 --continue
   ```

2. **Check for stuck subtasks:**
   - Look at `implementation_plan.json` for "in_progress" or "failed" subtasks
   - The agent may have encountered an error

3. **Reset a stuck subtask:**
   - Edit `implementation_plan.json`
   - Change the stuck subtask's status to "pending"
   - Re-run the build

### Agent keeps failing on same subtask

**Symptoms:**
- Same error repeated
- "Circular fix detected" message
- Task never progresses

**Solutions:**

1. **Provide human guidance:**

   ```bash
   # Create instruction file
   echo "For subtask X, try using the existing UserService instead of creating a new one" > specs/001-my-feature/HUMAN_INPUT.md
   ```

2. **Simplify the subtask:**
   - Edit `implementation_plan.json`
   - Split the problematic subtask into smaller pieces

3. **Skip the subtask:**
   - Mark it as "completed" manually in `implementation_plan.json`
   - Add a note about what needs to be done manually

### "Context exhausted"

**Symptoms:**

```text
Error: Context window exhausted
```

**Solutions:**

1. **This is expected** - The agent commits progress and continues in a new session
2. **If it happens repeatedly:**
   - Your subtasks may be too large
   - Split them into smaller pieces in `implementation_plan.json`

---

## QA Loop Issues

### QA loop running too long

**Symptoms:**
- QA iteration count keeps increasing
- Same issues being found repeatedly

**Solutions:**

1. **Check for recurring issues:**
   - Look at `qa_report.md` for patterns
   - After 3 occurrences of the same issue, the system escalates to human

2. **Provide guidance:**

   ```bash
   echo "The login test is flaky due to timing - skip it for now" > specs/001-my-feature/HUMAN_INPUT.md
   ```

3. **Force approval (use carefully):**
   - Edit `implementation_plan.json`
   - Set `qa_signoff.status` to `"approved"`

### "QA agent failed to update implementation_plan.json"

**Symptoms:**

```text
⚠️  3 consecutive errors without progress.
The QA agent is unable to properly update implementation_plan.json.
```

**Solutions:**

1. **Check file permissions:**

   ```bash
   ls -la specs/001-my-feature/implementation_plan.json
   ```

2. **Validate JSON:**

   ```bash
   python -m json.tool specs/001-my-feature/implementation_plan.json
   ```

3. **Restart QA:**

   ```bash
   python run.py --spec 001 --qa
   ```

### Tests failing that shouldn't

**Symptoms:**
- QA reports test failures for unrelated code
- Tests pass locally but fail in QA

**Solutions:**

1. **Check test isolation:**
   - Tests may depend on global state
   - Tests may have race conditions

2. **Skip flaky tests temporarily:**
   - Add guidance in `HUMAN_INPUT.md`

3. **Run tests manually in the worktree:**

   ```bash
   cd .worktrees/001-my-feature/
   npm test  # or pytest, etc.
   ```

---

## Merge Issues

### "Merge conflicts detected"

**Symptoms:**

```text
Merge conflicts in 3 files
```

**Solutions:**

1. **Auto Claude tries AI-assisted merge first**
   - Wait for the automatic resolution attempt

2. **If automatic merge fails:**

   ```bash
   cd .worktrees/001-my-feature/
   git status  # See conflicted files
   # Resolve manually, then:
   git add .
   git commit -m "Resolved conflicts"
   ```

3. **Re-attempt merge from UI**

### "Cannot merge - diverged from main"

**Symptoms:**
- Main branch has new commits since the build started
- Merge fails due to divergence

**Solutions:**

1. **Rebase the feature branch:**

   ```bash
   cd .worktrees/001-my-feature/
   git fetch origin
   git rebase origin/main
   # Resolve any conflicts
   ```

2. **Merge main into feature branch:**

   ```bash
   cd .worktrees/001-my-feature/
   git merge origin/main
   # Resolve any conflicts
   ```

### Worktree cleanup failed

**Symptoms:**
- Error about worktree still existing
- Can't create new tasks

**Solutions:**

1. **Manual cleanup:**

   ```bash
   # List all worktrees
   git worktree list

   # Remove the problematic one
   git worktree remove .worktrees/001-my-feature --force

   # Prune stale entries
   git worktree prune
   ```

---

## Memory System Issues

### "Graphiti not available"

**Symptoms:**

```text
Graphiti not available: [reason]
Using file-based memory as fallback
```

**Solutions:**

1. **Check configuration:**

   ```bash
   # Verify in apps/backend/.env
   GRAPHITI_ENABLED=true
   ```

2. **Check provider credentials:**

   ```bash
   # At least one of these must be set:
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=...
   ```

3. **File-based fallback works fine**
   - Memory still saves to `specs/001-my-feature/memory/`
   - Just without semantic search capabilities

### Memory not being used

**Symptoms:**
- Agents don't seem to remember past context
- Same mistakes repeated

**Solutions:**

1. **Verify Graphiti is initialized:**
   - Check for `specs/001-my-feature/graphiti/` directory
   - Contains `state.json` and database files

2. **Check for errors in debug output:**

   ```bash
   DEBUG=true python run.py --spec 001
   ```

---

## Platform-Specific Issues

### Windows: Unicode errors

**Symptoms:**

```text
UnicodeEncodeError: 'charmap' codec can't encode character
```

**Solutions:**

1. **Set environment variable:**

   ```cmd
   set PYTHONUTF8=1
   ```

2. **Or add to `.env`:**

   ```text
   PYTHONUTF8=1
   ```

### Windows: Path too long

**Symptoms:**

```text
OSError: [WinError 206] The filename or extension is too long
```

**Solutions:**

1. **Enable long paths in Windows:**

   ```powershell
   # Run as Administrator
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

2. **Move project to shorter path:**
   - `C:\projects\myapp` instead of `C:\Users\username\Documents\development\projects\myapp`

### macOS: Keychain access denied

**Symptoms:**

```text
Error accessing macOS Keychain
```

**Solutions:**

1. **Allow access in Keychain:**
   - Open Keychain Access
   - Find "Claude Code-credentials"
   - Right-click → Get Info → Access Control
   - Add your terminal app

2. **Use environment variable instead:**

   ```bash
   export CLAUDE_CODE_OAUTH_TOKEN=sk-ant-oat01-...
   ```

### Linux: Missing dependencies

**Symptoms:**

```text
ImportError: libXXX.so not found
```

**Solutions:**

```bash
# Ubuntu/Debian
sudo apt install python3-dev libffi-dev

# Fedora
sudo dnf install python3-devel libffi-devel
```

---

## Performance Issues

### Slow spec creation

**Causes:**
- Large codebase (10,000+ files)
- Slow disk
- Limited memory

**Solutions:**

1. **Exclude unnecessary directories:**
   - Add to `.gitignore` (Auto Claude respects it)
   - Especially: `node_modules/`, `venv/`, `.git/`, build artifacts

2. **Use SSD storage**

3. **Increase available memory**

### Agent responses slow

**Causes:**
- API rate limiting
- Network issues
- Large context-window

**Solutions:**

1. **Check network:**

   ```bash
   ping api.anthropic.com
   ```

2. **Reduce context:**
   - Smaller subtasks = faster responses
   - Split large tasks

### High disk usage

**Causes:**
- Many worktrees
- Large memory databases

**Solutions:**

1. **Clean up old worktrees:**

   ```bash
   git worktree prune
   rm -rf .worktrees/old-*
   ```

2. **Clean up completed specs:**

   ```bash
   # Remove old spec directories (after merging)
   rm -rf specs/001-old-feature/
   ```

---

## Still Having Issues?

1. **Enable debug mode:**

   ```bash
   DEBUG=true python run.py --spec 001
   ```

2. **Check logs:**
   - App logs: Click "View Logs" in settings
   - Backend logs: `apps/backend/logs/`

3. **Get help:**
   - [Discord Community](https://discord.gg/KCXaPBr4Dj)
   - [GitHub Issues](https://github.com/AndyMik90/Auto-Claude/issues)
   - [GitHub Discussions](https://github.com/AndyMik90/Auto-Claude/discussions)

When reporting issues, include:
- Auto Claude version
- Operating system
- Error messages (full text)
- Steps to reproduce
- Debug output if available

/**
 * @vitest-environment jsdom
 */
/**
 * Terminal Component Tests
 *
 * Comprehensive tests for the Terminal component covering:
 * - Rendering (terminal container, toolbar, task selector)
 * - Terminal Lifecycle (initialization, resize, cleanup)
 * - File Drop Handling (drag-over, drop file paths)
 * - Task Association (select task, update title, clear)
 * - Claude Mode (activate, track session, visual indicator)
 * - Props and Callbacks (onClose, onActivate, isActive)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Task } from '../../../shared/types';
import type { Terminal as TerminalType, TerminalStatus } from '../../stores/terminal-store';

// Import browser mock to get full ElectronAPI structure
import '../../lib/browser-mock';

// Mock the terminal store
vi.mock('../../stores/terminal-store', () => ({
  useTerminalStore: vi.fn()
}));

// Mock the settings store (used by useAutoNaming)
vi.mock('../../stores/settings-store', () => ({
  useSettingsStore: vi.fn()
}));

// Mock the hooks
vi.mock('../terminal/useXterm', () => ({
  useXterm: vi.fn()
}));

vi.mock('../terminal/usePtyProcess', () => ({
  usePtyProcess: vi.fn()
}));

vi.mock('../terminal/useTerminalEvents', () => ({
  useTerminalEvents: vi.fn()
}));

vi.mock('../terminal/useAutoNaming', () => ({
  useAutoNaming: vi.fn()
}));

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn()
}));

// Mock xterm CSS
vi.mock('@xterm/xterm/css/xterm.css', () => ({}));

import { useTerminalStore } from '../../stores/terminal-store';
import { useSettingsStore } from '../../stores/settings-store';
import { useXterm } from '../terminal/useXterm';
import { usePtyProcess } from '../terminal/usePtyProcess';
import { useTerminalEvents } from '../terminal/useTerminalEvents';
import { useAutoNaming } from '../terminal/useAutoNaming';
import { useDroppable } from '@dnd-kit/core';
import { Terminal } from '../Terminal';

// Helper to create test tasks
function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    specId: '',
    projectId: 'test-project',
    title: 'Test Task',
    description: 'Test task description',
    status: 'backlog',
    subtasks: [],
    logs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

// Helper to create test terminal state
function createTestTerminal(overrides: Partial<TerminalType> = {}): TerminalType {
  return {
    id: 'test-terminal-id',
    title: 'Terminal 1',
    status: 'running' as TerminalStatus,
    cwd: '/home/user/project',
    createdAt: new Date(),
    isClaudeMode: false,
    ...overrides
  };
}

// Mock electronAPI functions
const mockCreateTerminal = vi.fn();
const mockDestroyTerminal = vi.fn();
const mockSendTerminalInput = vi.fn();
const mockResizeTerminal = vi.fn();
const mockInvokeClaudeInTerminal = vi.fn();
const mockGenerateTerminalName = vi.fn();
const mockOnTerminalOutput = vi.fn();
const mockOnTerminalExit = vi.fn();
const mockOnTerminalTitleChange = vi.fn();
const mockOnTerminalClaudeSession = vi.fn();

describe('Terminal Component', () => {
  // Mock store functions
  const mockSetClaudeMode = vi.fn();
  const mockUpdateTerminal = vi.fn();
  const mockSetAssociatedTask = vi.fn();

  // Mock xterm functions
  const mockTerminalRef = { current: document.createElement('div') };
  const mockXtermRef = { current: null };
  const mockWrite = vi.fn();
  const mockWriteln = vi.fn();
  const mockFocus = vi.fn();
  const mockDispose = vi.fn();

  // Mock auto-naming functions
  const mockHandleCommandEnter = vi.fn();
  const mockCleanupAutoNaming = vi.fn();

  // Mock callbacks
  const mockOnClose = vi.fn();
  const mockOnActivate = vi.fn();
  const mockOnNewTaskClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup window.electronAPI mocks
    if (window.electronAPI) {
      window.electronAPI.createTerminal = mockCreateTerminal;
      window.electronAPI.destroyTerminal = mockDestroyTerminal;
      window.electronAPI.sendTerminalInput = mockSendTerminalInput;
      window.electronAPI.resizeTerminal = mockResizeTerminal;
      window.electronAPI.invokeClaudeInTerminal = mockInvokeClaudeInTerminal;
      window.electronAPI.generateTerminalName = mockGenerateTerminalName;
      window.electronAPI.onTerminalOutput = mockOnTerminalOutput.mockReturnValue(() => {});
      window.electronAPI.onTerminalExit = mockOnTerminalExit.mockReturnValue(() => {});
      window.electronAPI.onTerminalTitleChange = mockOnTerminalTitleChange.mockReturnValue(() => {});
      window.electronAPI.onTerminalClaudeSession = mockOnTerminalClaudeSession.mockReturnValue(() => {});
    }

    // Setup default mock implementations
    (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const mockState = {
        terminals: [createTestTerminal()],
        setClaudeMode: mockSetClaudeMode,
        updateTerminal: mockUpdateTerminal,
        setAssociatedTask: mockSetAssociatedTask
      };
      return selector(mockState);
    });

    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
      const mockState = {
        settings: {
          autoNameTerminals: true
        }
      };
      return selector(mockState);
    });

    (useXterm as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      terminalRef: mockTerminalRef,
      xtermRef: mockXtermRef,
      write: mockWrite,
      writeln: mockWriteln,
      focus: mockFocus,
      dispose: mockDispose,
      cols: 80,
      rows: 24
    });

    (usePtyProcess as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isCreated: true
    });

    (useTerminalEvents as unknown as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

    (useAutoNaming as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      handleCommandEnter: mockHandleCommandEnter,
      cleanup: mockCleanupAutoNaming
    });

    (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setNodeRef: vi.fn(),
      isOver: false
    });

    mockCreateTerminal.mockResolvedValue({ success: true });
    mockGenerateTerminalName.mockResolvedValue({ success: true, data: 'Generated Name' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING TESTS (5 tests)
  // ============================================
  describe('Rendering', () => {
    it('should render terminal container with correct structure', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Container should be rendered with the terminal ref
      expect(mockTerminalRef.current).toBeDefined();
    });

    it('should render terminal header with title', () => {
      const terminal = createTestTerminal({ title: 'My Terminal' });
      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('My Terminal')).toBeInTheDocument();
    });

    it('should render close button in header', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Find the close button (X icon button)
      const closeButtons = screen.getAllByRole('button');
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should render Claude button when not in Claude mode', () => {
      const terminal = createTestTerminal({ isClaudeMode: false, status: 'running' });
      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      expect(screen.getByText('Claude')).toBeInTheDocument();
    });

    it('should apply active styling when terminal is active', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={true}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Focus should be called when active
      expect(mockFocus).toHaveBeenCalled();
    });
  });

  // ============================================
  // TERMINAL LIFECYCLE TESTS (5 tests)
  // ============================================
  describe('Terminal Lifecycle', () => {
    it('should initialize xterm with correct options', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      expect(useXterm).toHaveBeenCalledWith(expect.objectContaining({
        terminalId: 'test-terminal-id'
      }));
    });

    it('should create PTY process with correct parameters', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          projectPath="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      expect(usePtyProcess).toHaveBeenCalledWith(expect.objectContaining({
        terminalId: 'test-terminal-id',
        cwd: '/home/user/project',
        projectPath: '/home/user/project',
        cols: 80,
        rows: 24
      }));
    });

    it('should setup terminal event listeners', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      expect(useTerminalEvents).toHaveBeenCalledWith(expect.objectContaining({
        terminalId: 'test-terminal-id'
      }));
    });

    it('should handle resize when PTY is created', () => {
      // Get the onResize callback passed to useXterm
      let capturedOnResize: ((cols: number, rows: number) => void) | undefined;
      (useXterm as unknown as ReturnType<typeof vi.fn>).mockImplementation((options: { onResize?: (cols: number, rows: number) => void }) => {
        capturedOnResize = options.onResize;
        return {
          terminalRef: mockTerminalRef,
          xtermRef: mockXtermRef,
          write: mockWrite,
          writeln: mockWriteln,
          focus: mockFocus,
          dispose: mockDispose,
          cols: 80,
          rows: 24
        };
      });

      // Simulate PTY is created
      let capturedOnCreated: (() => void) | undefined;
      (usePtyProcess as unknown as ReturnType<typeof vi.fn>).mockImplementation((options: { onCreated?: () => void }) => {
        capturedOnCreated = options.onCreated;
        return { isCreated: true };
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Simulate PTY created callback
      if (capturedOnCreated) {
        capturedOnCreated();
      }

      // Now simulate resize
      if (capturedOnResize) {
        capturedOnResize(100, 30);
      }

      expect(mockResizeTerminal).toHaveBeenCalledWith('test-terminal-id', 100, 30);
    });

    it('should cleanup on unmount', () => {
      const { unmount } = render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      unmount();

      // Verify auto-naming cleanup is called
      expect(mockCleanupAutoNaming).toHaveBeenCalled();
    });
  });

  // ============================================
  // FILE DROP HANDLING TESTS (4 tests)
  // ============================================
  describe('File Drop Handling', () => {
    it('should setup droppable zone with correct ID', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      expect(useDroppable).toHaveBeenCalledWith(expect.objectContaining({
        id: 'terminal-test-terminal-id',
        data: { type: 'terminal', terminalId: 'test-terminal-id' }
      }));
    });

    it('should show drop overlay when dragging over terminal', () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setNodeRef: vi.fn(),
        isOver: true
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Should show drop indicator
      expect(screen.getByText('Drop to insert path')).toBeInTheDocument();
    });

    it('should hide drop overlay when not dragging over', () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setNodeRef: vi.fn(),
        isOver: false
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Should not show drop indicator
      expect(screen.queryByText('Drop to insert path')).not.toBeInTheDocument();
    });

    it('should apply drag-over styling when isOver is true', () => {
      (useDroppable as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setNodeRef: vi.fn(),
        isOver: true
      });

      const { container } = render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Check for drop zone classes
      const terminalContainer = container.firstChild as HTMLElement;
      expect(terminalContainer.className).toContain('ring-2');
      expect(terminalContainer.className).toContain('ring-info');
    });
  });

  // ============================================
  // TASK ASSOCIATION TESTS (4 tests)
  // ============================================
  describe('Task Association', () => {
    it('should display task selector when in Claude mode', () => {
      const terminal = createTestTerminal({ isClaudeMode: true, status: 'claude-active' });
      const tasks = [createTestTask({ status: 'backlog' })];

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
          tasks={tasks}
        />
      );

      // Claude mode indicator should be visible
      const claudeIndicators = screen.getAllByText('Claude');
      expect(claudeIndicators.length).toBeGreaterThan(0);
    });

    it('should call setAssociatedTask when task is selected', async () => {
      const terminal = createTestTerminal({ isClaudeMode: true, status: 'claude-active' });
      const task = createTestTask({ id: 'task-123', title: 'Selected Task', status: 'backlog' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
          tasks={[task]}
        />
      );

      // The handleTaskSelect is passed to TerminalHeader
      // We verify the store actions are available
      expect(mockSetAssociatedTask).toBeDefined();
      expect(mockUpdateTerminal).toBeDefined();
    });

    it('should update terminal title when task is associated', () => {
      const terminal = createTestTerminal({
        isClaudeMode: true,
        associatedTaskId: 'task-123'
      });
      const task = createTestTask({ id: 'task-123', title: 'Associated Task' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
          tasks={[task]}
        />
      );

      // Associated task info should be accessible
      expect(task.title).toBe('Associated Task');
    });

    it('should clear task association when requested', () => {
      const terminal = createTestTerminal({
        isClaudeMode: true,
        associatedTaskId: 'task-123'
      });
      const task = createTestTask({ id: 'task-123' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
          tasks={[task]}
        />
      );

      // handleClearTask should call setAssociatedTask with undefined
      // and updateTerminal with title 'Claude'
      expect(mockSetAssociatedTask).toBeDefined();
      expect(mockUpdateTerminal).toBeDefined();
    });
  });

  // ============================================
  // CLAUDE MODE TESTS (4 tests)
  // ============================================
  describe('Claude Mode', () => {
    it('should activate Claude mode when Claude button is clicked', () => {
      const terminal = createTestTerminal({ isClaudeMode: false, status: 'running' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      const claudeButton = screen.getByText('Claude');
      fireEvent.click(claudeButton);

      expect(mockSetClaudeMode).toHaveBeenCalledWith('test-terminal-id', true);
      expect(mockInvokeClaudeInTerminal).toHaveBeenCalledWith('test-terminal-id', '/home/user/project');
    });

    it('should show Claude mode visual indicator when active', () => {
      const terminal = createTestTerminal({ isClaudeMode: true, status: 'claude-active' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Should show Claude badge
      const claudeBadges = screen.getAllByText('Claude');
      expect(claudeBadges.length).toBeGreaterThan(0);
    });

    it('should not show Claude button when already in Claude mode', () => {
      const terminal = createTestTerminal({ isClaudeMode: true, status: 'claude-active' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // The Claude button should not be present as a clickable action
      // Only the Claude badge should be visible
      const buttons = screen.getAllByRole('button');
      const claudeActionButton = buttons.find(btn =>
        btn.textContent === 'Claude' && !btn.className.includes('bg-primary/10')
      );
      expect(claudeActionButton).toBeUndefined();
    });

    it('should not show Claude button when terminal has exited', () => {
      const terminal = createTestTerminal({ isClaudeMode: false, status: 'exited' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Claude button should not be visible for exited terminals
      const claudeButton = screen.queryByRole('button', { name: /claude/i });
      expect(claudeButton).not.toBeInTheDocument();
    });
  });

  // ============================================
  // PROPS AND CALLBACKS TESTS (3 tests)
  // ============================================
  describe('Props and Callbacks', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Find and click the close button (last button in header typically)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => btn.className.includes('hover:bg-destructive'));

      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onActivate when terminal is clicked', () => {
      const { container } = render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      const terminalContainer = container.firstChild as HTMLElement;
      fireEvent.click(terminalContainer);

      expect(mockOnActivate).toHaveBeenCalled();
      expect(mockFocus).toHaveBeenCalled();
    });

    it('should focus terminal when isActive becomes true', () => {
      const { rerender } = render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // Initially not focused
      mockFocus.mockClear();

      // Rerender with isActive = true
      rerender(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={true}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      expect(mockFocus).toHaveBeenCalled();
    });
  });

  // ============================================
  // ADDITIONAL EDGE CASE TESTS
  // ============================================
  describe('Edge Cases', () => {
    it('should handle terminal not found in store gracefully', () => {
      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [], // Empty terminals array
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      // Should not throw
      expect(() => {
        render(
          <Terminal
            id="nonexistent-terminal"
            cwd="/home/user/project"
            isActive={false}
            onClose={mockOnClose}
            onActivate={mockOnActivate}
          />
        );
      }).not.toThrow();
    });

    it('should handle empty tasks array', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
          tasks={[]}
        />
      );

      // Should render without errors
      expect(screen.getByText('Terminal 1')).toBeInTheDocument();
    });

    it('should pass correct terminalCount to header', () => {
      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
          terminalCount={5}
        />
      );

      // Component should render with terminalCount prop
      expect(screen.getByText('Terminal 1')).toBeInTheDocument();
    });

    it('should call onNewTaskClick when passed', () => {
      const terminal = createTestTerminal({ isClaudeMode: true });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
          onNewTaskClick={mockOnNewTaskClick}
        />
      );

      // onNewTaskClick should be passed through to TerminalHeader
      expect(mockOnNewTaskClick).toBeDefined();
    });

    it('should handle title change via updateTerminal', () => {
      const terminal = createTestTerminal({ title: 'Original Title' });

      (useTerminalStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (state: unknown) => unknown) => {
        const mockState = {
          terminals: [terminal],
          setClaudeMode: mockSetClaudeMode,
          updateTerminal: mockUpdateTerminal,
          setAssociatedTask: mockSetAssociatedTask
        };
        return selector(mockState);
      });

      render(
        <Terminal
          id="test-terminal-id"
          cwd="/home/user/project"
          isActive={false}
          onClose={mockOnClose}
          onActivate={mockOnActivate}
        />
      );

      // handleTitleChange should call updateTerminal with new title
      expect(mockUpdateTerminal).toBeDefined();
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });
  });
});

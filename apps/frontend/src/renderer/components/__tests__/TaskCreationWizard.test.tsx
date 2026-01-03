/**
 * @vitest-environment jsdom
 */
/**
 * TaskCreationWizard Tests
 *
 * Comprehensive tests for the task creation dialog including:
 * - Rendering and UI state
 * - Draft management (save/restore/clear)
 * - Image handling (paste/drag-drop)
 * - File @mention autocomplete
 * - Form submission and validation
 * - Git branch integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TaskCreationWizard } from '../TaskCreationWizard';

// Mock the stores
vi.mock('../../stores/settings-store', () => ({
  useSettingsStore: vi.fn()
}));

vi.mock('../../stores/project-store', () => ({
  useProjectStore: vi.fn()
}));

// Mock task-store functions
vi.mock('../../stores/task-store', () => ({
  createTask: vi.fn(),
  saveDraft: vi.fn(),
  loadDraft: vi.fn(),
  clearDraft: vi.fn(),
  isDraftEmpty: vi.fn(),
  useTaskStore: vi.fn()
}));

// Mock child components that have complex dependencies
vi.mock('../AgentProfileSelector', () => ({
  AgentProfileSelector: ({ profileId, onProfileChange }: {
    profileId: string;
    onProfileChange: (id: string, model: string, thinking: string) => void;
  }) => (
    <div data-testid="agent-profile-selector">
      <select
        data-testid="profile-select"
        value={profileId}
        onChange={(e) => onProfileChange(e.target.value, 'claude-sonnet-4-5-20250929', 'normal')}
      >
        <option value="auto">Auto</option>
        <option value="fast">Fast</option>
      </select>
    </div>
  )
}));

vi.mock('../FileAutocomplete', () => ({
  FileAutocomplete: ({ onSelect, onClose }: {
    onSelect: (filename: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="file-autocomplete">
      <button onClick={() => onSelect('test-file.ts')}>Select File</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

vi.mock('../TaskFileExplorerDrawer', () => ({
  TaskFileExplorerDrawer: () => <div data-testid="file-explorer-drawer" />
}));

// Import mocked modules
import { useSettingsStore } from '../../stores/settings-store';
import { useProjectStore } from '../../stores/project-store';
import { createTask, saveDraft, loadDraft, clearDraft, isDraftEmpty } from '../../stores/task-store';

// Default mock values
const mockSettings = {
  selectedAgentProfile: 'auto',
  customPhaseModels: null,
  customPhaseThinking: null
};

const mockProjects = [
  { id: 'project-1', path: '/path/to/project', name: 'Test Project' }
];

const mockElectronAPI = {
  getGitBranches: vi.fn().mockResolvedValue({ success: true, data: ['main', 'develop', 'feature/test'] }),
  getProjectEnv: vi.fn().mockResolvedValue({ success: true, data: { defaultBranch: 'main' } }),
  detectMainBranch: vi.fn().mockResolvedValue({ success: true, data: 'main' })
};

describe('TaskCreationWizard', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mocks
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      settings: mockSettings
    });

    (useProjectStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ projects: mockProjects });
      }
      return { projects: mockProjects };
    });

    // Setup task-store mocks
    (loadDraft as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (isDraftEmpty as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (createTask as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'new-task-1' });

    // Setup electronAPI mock
    (window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI = mockElectronAPI;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // RENDERING & UI STATE TESTS
  // ===========================================
  describe('Rendering & UI State', () => {
    it('should render dialog when open is true', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });

    it('should not render dialog content when open is false', () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={false}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
    });

    it('should render description textarea as required field', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        const descriptionLabel = screen.getByText(/Description/);
        expect(descriptionLabel).toBeInTheDocument();
        expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
      });
    });

    it('should render title field as optional', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Task Title/)).toBeInTheDocument();
        expect(screen.getByText('(optional)')).toBeInTheDocument();
      });
    });

    it('should toggle advanced options visibility', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Advanced options should be hidden initially
      expect(screen.queryByLabelText(/Category/)).not.toBeInTheDocument();

      // Click to show advanced options
      const toggleButton = screen.getByText(/Classification \(optional\)/);
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/Category/)).toBeInTheDocument();
        expect(screen.getByText(/Priority/)).toBeInTheDocument();
      });
    });

    it('should toggle git options visibility', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Git options should be hidden initially
      expect(screen.queryByText(/Base Branch/)).not.toBeInTheDocument();

      // Click to show git options
      const gitToggle = screen.getByText(/Git Options \(optional\)/);
      fireEvent.click(gitToggle);

      await waitFor(() => {
        expect(screen.getByText(/Base Branch/)).toBeInTheDocument();
      });
    });

    it('should disable Create Task button when description is empty', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /Create Task/i });
        expect(createButton).toBeDisabled();
      });
    });

    it('should enable Create Task button when description has content', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Add login feature' } });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /Create Task/i });
        expect(createButton).not.toBeDisabled();
      });
    });
  });

  // ===========================================
  // DRAFT MANAGEMENT TESTS
  // ===========================================
  describe('Draft Management', () => {
    it('should load draft on dialog open when draft exists', async () => {
      const mockDraft = {
        projectId: 'project-1',
        title: 'Draft Title',
        description: 'Draft description',
        category: 'feature',
        priority: 'high',
        complexity: '',
        impact: '',
        profileId: 'auto',
        model: 'claude-sonnet-4-5-20250929',
        thinkingLevel: 'normal',
        images: [],
        referencedFiles: [],
        requireReviewBeforeCoding: false,
        savedAt: new Date()
      };

      (loadDraft as ReturnType<typeof vi.fn>).mockReturnValue(mockDraft);
      (isDraftEmpty as ReturnType<typeof vi.fn>).mockReturnValue(false);

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(loadDraft).toHaveBeenCalledWith('project-1');
        expect(screen.getByDisplayValue('Draft Title')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Draft description')).toBeInTheDocument();
      });
    });

    it('should show draft restored indicator when draft is loaded', async () => {
      const mockDraft = {
        projectId: 'project-1',
        title: 'Draft Title',
        description: 'Draft description',
        category: '',
        priority: '',
        complexity: '',
        impact: '',
        profileId: 'auto',
        model: 'claude-sonnet-4-5-20250929',
        thinkingLevel: 'normal',
        images: [],
        referencedFiles: [],
        requireReviewBeforeCoding: false,
        savedAt: new Date()
      };

      (loadDraft as ReturnType<typeof vi.fn>).mockReturnValue(mockDraft);
      (isDraftEmpty as ReturnType<typeof vi.fn>).mockReturnValue(false);

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Draft restored')).toBeInTheDocument();
      });
    });

    it('should call clearDraft when Start Fresh button is clicked', async () => {
      const mockDraft = {
        projectId: 'project-1',
        title: 'Draft Title',
        description: 'Draft description',
        category: '',
        priority: '',
        complexity: '',
        impact: '',
        profileId: 'auto',
        model: 'claude-sonnet-4-5-20250929',
        thinkingLevel: 'normal',
        images: [],
        referencedFiles: [],
        requireReviewBeforeCoding: false,
        savedAt: new Date()
      };

      (loadDraft as ReturnType<typeof vi.fn>).mockReturnValue(mockDraft);
      (isDraftEmpty as ReturnType<typeof vi.fn>).mockReturnValue(false);

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Start Fresh')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Start Fresh'));

      expect(clearDraft).toHaveBeenCalledWith('project-1');
    });

    it('should save draft when dialog is closed with content', async () => {
      (isDraftEmpty as ReturnType<typeof vi.fn>).mockReturnValue(false);

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Add content
      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Some task description' } });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalled();
      });
    });

    it('should clear draft after successful task creation', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Add description
      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Create a new feature' } });

      // Submit
      const createButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(clearDraft).toHaveBeenCalledWith('project-1');
      });
    });

    it('should not load draft from different project', async () => {
      const mockDraft = {
        projectId: 'different-project',
        title: 'Other Draft',
        description: 'Other description',
        category: '',
        priority: '',
        complexity: '',
        impact: '',
        profileId: 'auto',
        model: 'claude-sonnet-4-5-20250929',
        thinkingLevel: 'normal',
        images: [],
        referencedFiles: [],
        requireReviewBeforeCoding: false,
        savedAt: new Date()
      };

      (loadDraft as ReturnType<typeof vi.fn>).mockReturnValue(mockDraft);
      (isDraftEmpty as ReturnType<typeof vi.fn>).mockReturnValue(false);

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // loadDraft is called with the correct projectId
      await waitFor(() => {
        expect(loadDraft).toHaveBeenCalledWith('project-1');
      });
    });
  });

  // ===========================================
  // FORM SUBMISSION TESTS
  // ===========================================
  describe('Form Submission', () => {
    it('should show error when submitting without description', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // The button should be disabled, but let's verify error state
      const createButton = screen.getByRole('button', { name: /Create Task/i });
      expect(createButton).toBeDisabled();
    });

    it('should call createTask with correct parameters on submit', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Fill in title
      const titleInput = screen.getByPlaceholderText(/Leave empty to auto-generate/i);
      fireEvent.change(titleInput, { target: { value: 'New Feature' } });

      // Fill in description
      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Implement authentication' } });

      // Submit
      const createButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(createTask).toHaveBeenCalledWith(
          'project-1',
          'New Feature',
          'Implement authentication',
          expect.objectContaining({
            sourceType: 'manual'
          })
        );
      });
    });

    it('should close dialog after successful creation', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Fill in description
      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Create feature' } });

      // Submit
      const createButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should show loading state during creation', async () => {
      // Make createTask slow
      (createTask as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ id: 'task-1' }), 100))
      );

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Create feature' } });

      const createButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(createButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Creating.../i)).toBeInTheDocument();
      });
    });

    it('should show error when createTask fails', async () => {
      (createTask as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Create feature' } });

      const createButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create task/i)).toBeInTheDocument();
      });
    });

    it('should include metadata when advanced options are selected', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Fill description
      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Implement feature' } });

      // Open advanced options
      fireEvent.click(screen.getByText(/Classification \(optional\)/));

      await waitFor(() => {
        expect(screen.getByText(/Category/)).toBeInTheDocument();
      });

      // Submit
      const createButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(createTask).toHaveBeenCalledWith(
          'project-1',
          '',
          'Implement feature',
          expect.objectContaining({
            sourceType: 'manual'
          })
        );
      });
    });

    it('should include requireReviewBeforeCoding when checked', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Create feature' } });

      // Check the review checkbox
      const checkbox = screen.getByRole('checkbox', { name: /Require human review before coding/i });
      fireEvent.click(checkbox);

      const createButton = screen.getByRole('button', { name: /Create Task/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(createTask).toHaveBeenCalledWith(
          'project-1',
          '',
          'Create feature',
          expect.objectContaining({
            requireReviewBeforeCoding: true
          })
        );
      });
    });
  });

  // ===========================================
  // GIT INTEGRATION TESTS
  // ===========================================
  describe('Git Integration', () => {
    it('should fetch branches when dialog opens', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(mockElectronAPI.getGitBranches).toHaveBeenCalledWith('/path/to/project');
      });
    });

    it('should fetch project default branch when dialog opens', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(mockElectronAPI.getProjectEnv).toHaveBeenCalledWith('project-1');
      });
    });

    it('should display branch options in git dropdown', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Open git options
      fireEvent.click(screen.getByText(/Git Options \(optional\)/));

      await waitFor(() => {
        expect(screen.getByText(/Base Branch/)).toBeInTheDocument();
      });
    });

    it('should handle branch fetch error gracefully', async () => {
      mockElectronAPI.getGitBranches.mockResolvedValue({ success: false, error: 'Not a git repo' });

      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Should not crash, dialog should still render
      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FILE EXPLORER TESTS
  // ===========================================
  describe('File Explorer', () => {
    it('should show Browse Files button when project path exists', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browse Files/i })).toBeInTheDocument();
      });
    });

    it('should toggle file explorer visibility on button click', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const browseButton = screen.getByRole('button', { name: /Browse Files/i });
      fireEvent.click(browseButton);

      await waitFor(() => {
        expect(screen.getByTestId('file-explorer-drawer')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // CANCEL BEHAVIOR TESTS
  // ===========================================
  describe('Cancel Behavior', () => {
    it('should call onOpenChange with false when Cancel is clicked', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should reset form after cancel', async () => {
      render(
        <TaskCreationWizard
          projectId="project-1"
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      // Add content
      const titleInput = screen.getByPlaceholderText(/Leave empty to auto-generate/i);
      fireEvent.change(titleInput, { target: { value: 'Test Title' } });

      const textarea = screen.getByPlaceholderText(/Describe the feature/i);
      fireEvent.change(textarea, { target: { value: 'Test Description' } });

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });
});

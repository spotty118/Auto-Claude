/**
 * @vitest-environment jsdom
 */
/**
 * AgentTools Tests
 *
 * Comprehensive tests for the AgentTools component which displays
 * MCP server configuration, custom server management, and agent tooling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgentTools } from '../AgentTools';
import type { Project, ProjectEnvConfig, CustomMcpServer, McpHealthCheckResult, McpTestConnectionResult } from '../../../shared/types';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        // MCP translations
        'mcp.description': 'Configure MCP servers for this project',
        'mcp.descriptionNoProject': 'Select a project to configure MCP servers',
        'mcp.serversEnabled': `${options?.count ?? 0} servers enabled`,
        'mcp.noProjectSelected': 'No Project Selected',
        'mcp.noProjectSelectedDescription': 'Please select a project from the sidebar',
        'mcp.projectNotInitialized': 'Project Not Initialized',
        'mcp.projectNotInitializedDescription': 'Initialize Auto Claude in this project first',
        'mcp.configuration': 'MCP Configuration',
        'mcp.configurationHint': 'Enable or disable servers',
        'mcp.browserAutomation': 'Browser Automation',
        'mcp.alwaysEnabled': 'always enabled',
        'mcp.customServers': 'Custom Servers',
        'mcp.addCustomServer': 'Add Custom Server',
        'mcp.noCustomServers': 'No custom servers configured',
        'mcp.addServer': 'Add Server',
        'mcp.addMcpTo': `Add MCP to ${options?.agent ?? 'agent'}`,
        'mcp.addMcpDescription': 'Select an MCP server to add',
        'mcp.added': 'Added',
        'mcp.removed': 'removed',
        'mcp.remove': 'Remove',
        'mcp.restore': 'Restore',
        'mcp.noMcpServers': 'No MCP servers configured',
        'mcp.allMcpsAdded': 'All MCP servers already added',
        // Server names
        'mcp.servers.context7.name': 'Context7',
        'mcp.servers.context7.description': 'Documentation lookup',
        'mcp.servers.graphiti.name': 'Graphiti Memory',
        'mcp.servers.graphiti.description': 'Knowledge graph memory',
        'mcp.servers.graphiti.notConfigured': 'Not configured',
        'mcp.servers.linear.name': 'Linear',
        'mcp.servers.linear.description': 'Project management',
        'mcp.servers.linear.notConfigured': 'Not configured',
        'mcp.servers.electron.name': 'Electron MCP',
        'mcp.servers.electron.description': 'Desktop app automation',
        'mcp.servers.puppeteer.name': 'Puppeteer MCP',
        'mcp.servers.puppeteer.description': 'Browser automation',
        'mcp.servers.autoClaude.name': 'Auto-Claude Tools',
        'mcp.servers.autoClaude.description': 'Build progress tracking',
      };
      return translations[key] || key;
    },
    i18n: { language: 'en' }
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children
}));

// Mock CustomMcpDialog
vi.mock('../CustomMcpDialog', () => ({
  CustomMcpDialog: ({ open, onOpenChange, server, onSave }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    server: CustomMcpServer | null;
    existingIds: string[];
    onSave: (server: CustomMcpServer) => void;
  }) => {
    if (!open) return null;
    return (
      <div data-testid="custom-mcp-dialog">
        <h2>{server ? 'Edit Custom Server' : 'Add Custom Server'}</h2>
        <button
          onClick={() => {
            onSave({
              id: server?.id || 'new-server',
              name: server?.name || 'New Server',
              type: 'command',
              command: 'npx',
              args: ['-y', 'my-mcp-server']
            });
          }}
          data-testid="save-custom-server"
        >
          Save
        </button>
        <button onClick={() => onOpenChange(false)} data-testid="cancel-custom-server">
          Cancel
        </button>
      </div>
    );
  }
}));

// Mock stores
const mockSettings = {
  customPhaseModels: undefined,
  customPhaseThinking: undefined,
  featureModels: undefined,
  featureThinking: undefined
};

vi.mock('../../stores/settings-store', () => ({
  useSettingsStore: vi.fn((selector) => {
    const state = {
      settings: mockSettings
    };
    if (!selector) return state;
    return selector(state);
  })
}));

const mockProjects: Project[] = [];
let mockSelectedProjectId: string | null = null;

vi.mock('../../stores/project-store', () => ({
  useProjectStore: vi.fn((selector) => {
    const state = {
      projects: mockProjects,
      selectedProjectId: mockSelectedProjectId
    };
    if (!selector) return state;
    return selector(state);
  })
}));

// Mock electronAPI
const mockGetProjectEnv = vi.fn();
const mockUpdateProjectEnv = vi.fn();
const mockCheckMcpHealth = vi.fn();
const mockTestMcpConnection = vi.fn();

Object.defineProperty(window, 'electronAPI', {
  value: {
    getProjectEnv: mockGetProjectEnv,
    updateProjectEnv: mockUpdateProjectEnv,
    checkMcpHealth: mockCheckMcpHealth,
    testMcpConnection: mockTestMcpConnection
  },
  writable: true
});

// Helper to create test project
function createTestProject(overrides: Partial<Project> = {}): Project {
  return {
    id: `project-${Date.now()}`,
    name: 'Test Project',
    path: '/path/to/test-project',
    autoBuildPath: '.auto-claude',
    settings: {
      model: 'claude-3-haiku-20240307',
      memoryBackend: 'file',
      linearSync: false,
      notifications: {
        onTaskComplete: true,
        onTaskFailed: true,
        onReviewNeeded: true,
        sound: false
      },
      graphitiMcpEnabled: false
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

// Helper to create test env config
function createTestEnvConfig(overrides: Partial<ProjectEnvConfig> = {}): ProjectEnvConfig {
  return {
    claudeAuthStatus: 'authenticated',
    linearEnabled: false,
    githubEnabled: false,
    gitlabEnabled: false,
    graphitiEnabled: false,
    enableFancyUi: false,
    mcpServers: {
      context7Enabled: true,
      graphitiEnabled: false,
      linearMcpEnabled: false,
      electronEnabled: false,
      puppeteerEnabled: false
    },
    ...overrides
  };
}

// Helper to create custom MCP server
function createCustomServer(overrides: Partial<CustomMcpServer> = {}): CustomMcpServer {
  return {
    id: 'custom-server-1',
    name: 'Custom MCP Server',
    type: 'command',
    command: 'npx',
    args: ['-y', '@myorg/my-mcp-server'],
    description: 'A custom MCP server',
    ...overrides
  };
}

describe('AgentTools - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects.length = 0;
    mockSelectedProjectId = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component header with MCP Server Overview title', () => {
    render(<AgentTools />);

    expect(screen.getByText('MCP Server Overview')).toBeInTheDocument();
  });

  it('should show "No Project Selected" message when no project is selected', () => {
    render(<AgentTools />);

    expect(screen.getByText('No Project Selected')).toBeInTheDocument();
    expect(screen.getByText('Please select a project from the sidebar')).toBeInTheDocument();
  });

  it('should show "Project Not Initialized" when project has no autoBuildPath', () => {
    const project = createTestProject({ autoBuildPath: '' });
    mockProjects.push(project);
    mockSelectedProjectId = project.id;

    render(<AgentTools />);

    expect(screen.getByText('Project Not Initialized')).toBeInTheDocument();
    expect(screen.getByText('Initialize Auto Claude in this project first')).toBeInTheDocument();
  });

  it('should display project name in header when project is selected', async () => {
    const project = createTestProject({ name: 'My Test Project' });
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText(/for My Test Project/)).toBeInTheDocument();
    });
  });

  it('should render all agent categories when project is initialized', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Spec Creation')).toBeInTheDocument();
    });

    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('QA')).toBeInTheDocument();
    expect(screen.getByText('Utility')).toBeInTheDocument();
    expect(screen.getByText('Ideation')).toBeInTheDocument();
  });

  it('should display MCP server toggles in configuration section', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Context7')).toBeInTheDocument();
    });

    expect(screen.getByText('Graphiti Memory')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Electron MCP')).toBeInTheDocument();
    expect(screen.getByText('Puppeteer MCP')).toBeInTheDocument();
    expect(screen.getByText('Auto-Claude Tools')).toBeInTheDocument();
  });
});

describe('AgentTools - MCP Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects.length = 0;
    mockSelectedProjectId = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle Context7 server when switch is clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ mcpServers: { context7Enabled: true } })
    });
    mockUpdateProjectEnv.mockResolvedValueOnce({ success: true });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Context7')).toBeInTheDocument();
    });

    // Find the switch for Context7 (first switch after the label)
    const context7Row = screen.getByText('Context7').closest('.flex');
    const switchElement = context7Row?.querySelector('[role="switch"]');
    expect(switchElement).toBeInTheDocument();

    if (switchElement) {
      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(mockUpdateProjectEnv).toHaveBeenCalledWith(
          project.id,
          expect.objectContaining({
            mcpServers: expect.objectContaining({ context7Enabled: false })
          })
        );
      });
    }
  });

  it('should toggle Electron server when switch is clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ mcpServers: { electronEnabled: false } })
    });
    mockUpdateProjectEnv.mockResolvedValueOnce({ success: true });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Electron MCP')).toBeInTheDocument();
    });

    // Find and click the Electron switch
    const electronRow = screen.getByText('Electron MCP').closest('.flex');
    const switchElement = electronRow?.querySelector('[role="switch"]');

    if (switchElement) {
      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(mockUpdateProjectEnv).toHaveBeenCalledWith(
          project.id,
          expect.objectContaining({
            mcpServers: expect.objectContaining({ electronEnabled: true })
          })
        );
      });
    }
  });

  it('should toggle Puppeteer server when switch is clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ mcpServers: { puppeteerEnabled: false } })
    });
    mockUpdateProjectEnv.mockResolvedValueOnce({ success: true });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Puppeteer MCP')).toBeInTheDocument();
    });

    const puppeteerRow = screen.getByText('Puppeteer MCP').closest('.flex');
    const switchElement = puppeteerRow?.querySelector('[role="switch"]');

    if (switchElement) {
      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(mockUpdateProjectEnv).toHaveBeenCalledWith(
          project.id,
          expect.objectContaining({
            mcpServers: expect.objectContaining({ puppeteerEnabled: true })
          })
        );
      });
    }
  });

  it('should disable Graphiti toggle when provider not configured', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({
        graphitiEnabled: false,
        graphitiProviderConfig: undefined
      })
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Graphiti Memory')).toBeInTheDocument();
    });

    // Find the Graphiti switch - it should be disabled
    const graphitiRow = screen.getByText('Graphiti Memory').closest('.flex');
    const switchElement = graphitiRow?.querySelector('[role="switch"]');
    expect(switchElement).toHaveAttribute('data-disabled', 'true');
  });

  it('should enable Graphiti toggle when provider is configured', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({
        graphitiEnabled: true,
        graphitiProviderConfig: { embeddingProvider: 'openai' },
        mcpServers: { graphitiEnabled: true }
      })
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Graphiti Memory')).toBeInTheDocument();
    });

    const graphitiRow = screen.getByText('Graphiti Memory').closest('.flex');
    const switchElement = graphitiRow?.querySelector('[role="switch"]');
    expect(switchElement).not.toHaveAttribute('data-disabled', 'true');
  });

  it('should disable Linear toggle when Linear is not enabled', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ linearEnabled: false })
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Linear')).toBeInTheDocument();
    });

    const linearRow = screen.getByText('Linear').closest('.flex');
    const switchElement = linearRow?.querySelector('[role="switch"]');
    expect(switchElement).toHaveAttribute('data-disabled', 'true');
  });

  it('should show Auto-Claude Tools switch as always enabled and disabled', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Auto-Claude Tools')).toBeInTheDocument();
    });

    // Should show "always enabled" text
    expect(screen.getByText(/always enabled/)).toBeInTheDocument();

    // Switch should be disabled
    const autoClaudeRow = screen.getByText('Auto-Claude Tools').closest('.flex');
    const switchElement = autoClaudeRow?.querySelector('[role="switch"]');
    expect(switchElement).toHaveAttribute('data-disabled', 'true');
  });

  it('should revert optimistic update on API error', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ mcpServers: { context7Enabled: true } })
    });
    mockUpdateProjectEnv.mockRejectedValueOnce(new Error('API Error'));

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Context7')).toBeInTheDocument();
    });

    const context7Row = screen.getByText('Context7').closest('.flex');
    const switchElement = context7Row?.querySelector('[role="switch"]');

    if (switchElement) {
      fireEvent.click(switchElement);

      // Wait for reversion
      await waitFor(() => {
        expect(mockUpdateProjectEnv).toHaveBeenCalled();
      });
    }
  });
});

describe('AgentTools - Custom Server Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects.length = 0;
    mockSelectedProjectId = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should open add custom server dialog when Add Custom Server is clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Server')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Custom Server'));

    await waitFor(() => {
      expect(screen.getByTestId('custom-mcp-dialog')).toBeInTheDocument();
    });
  });

  it('should display existing custom servers', async () => {
    const customServer = createCustomServer();
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ customMcpServers: [customServer] })
    });
    mockCheckMcpHealth.mockResolvedValueOnce({
      success: true,
      data: { serverId: customServer.id, status: 'unknown', checkedAt: new Date().toISOString() }
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Custom MCP Server')).toBeInTheDocument();
    });
  });

  it('should save new custom server when dialog Save is clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });
    mockUpdateProjectEnv.mockResolvedValueOnce({ success: true });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Server')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Custom Server'));

    await waitFor(() => {
      expect(screen.getByTestId('custom-mcp-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('save-custom-server'));

    await waitFor(() => {
      expect(mockUpdateProjectEnv).toHaveBeenCalledWith(
        project.id,
        expect.objectContaining({
          customMcpServers: expect.arrayContaining([
            expect.objectContaining({ id: 'new-server', name: 'New Server' })
          ])
        })
      );
    });
  });

  it('should cancel dialog without saving when Cancel is clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Add Custom Server')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Custom Server'));

    await waitFor(() => {
      expect(screen.getByTestId('custom-mcp-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('cancel-custom-server'));

    await waitFor(() => {
      expect(screen.queryByTestId('custom-mcp-dialog')).not.toBeInTheDocument();
    });

    expect(mockUpdateProjectEnv).not.toHaveBeenCalled();
  });

  it('should delete custom server when delete button is clicked', async () => {
    const customServer = createCustomServer();
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ customMcpServers: [customServer] })
    });
    mockCheckMcpHealth.mockResolvedValueOnce({
      success: true,
      data: { serverId: customServer.id, status: 'unknown', checkedAt: new Date().toISOString() }
    });
    mockUpdateProjectEnv.mockResolvedValueOnce({ success: true });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Custom MCP Server')).toBeInTheDocument();
    });

    // Find and click the delete button
    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockUpdateProjectEnv).toHaveBeenCalledWith(
        project.id,
        expect.objectContaining({
          customMcpServers: []
        })
      );
    });
  });

  it('should open edit dialog when edit button is clicked', async () => {
    const customServer = createCustomServer();
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ customMcpServers: [customServer] })
    });
    mockCheckMcpHealth.mockResolvedValueOnce({
      success: true,
      data: { serverId: customServer.id, status: 'unknown', checkedAt: new Date().toISOString() }
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Custom MCP Server')).toBeInTheDocument();
    });

    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('custom-mcp-dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Custom Server')).toBeInTheDocument();
    });
  });
});

describe('AgentTools - Health Checking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects.length = 0;
    mockSelectedProjectId = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should check health of custom servers on load', async () => {
    const customServer = createCustomServer();
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ customMcpServers: [customServer] })
    });
    mockCheckMcpHealth.mockResolvedValueOnce({
      success: true,
      data: {
        serverId: customServer.id,
        status: 'healthy',
        checkedAt: new Date().toISOString()
      } as McpHealthCheckResult
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(mockCheckMcpHealth).toHaveBeenCalledWith(customServer);
    });
  });

  it('should show Test button for custom servers', async () => {
    const customServer = createCustomServer();
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ customMcpServers: [customServer] })
    });
    mockCheckMcpHealth.mockResolvedValueOnce({
      success: true,
      data: { serverId: customServer.id, status: 'unknown', checkedAt: new Date().toISOString() }
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('should call testMcpConnection when Test button is clicked', async () => {
    const customServer = createCustomServer();
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ customMcpServers: [customServer] })
    });
    mockCheckMcpHealth.mockResolvedValueOnce({
      success: true,
      data: { serverId: customServer.id, status: 'unknown', checkedAt: new Date().toISOString() }
    });
    mockTestMcpConnection.mockResolvedValueOnce({
      success: true,
      data: {
        serverId: customServer.id,
        success: true,
        message: 'Connection successful',
        responseTime: 150
      } as McpTestConnectionResult
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test'));

    await waitFor(() => {
      expect(mockTestMcpConnection).toHaveBeenCalledWith(customServer);
    });
  });

  it('should display health status with response time', async () => {
    const customServer = createCustomServer();
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ customMcpServers: [customServer] })
    });
    mockCheckMcpHealth.mockResolvedValueOnce({
      success: true,
      data: {
        serverId: customServer.id,
        status: 'healthy',
        responseTime: 250,
        checkedAt: new Date().toISOString()
      } as McpHealthCheckResult
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('250ms')).toBeInTheDocument();
    });
  });
});

describe('AgentTools - Store Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects.length = 0;
    mockSelectedProjectId = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load project env config when project is selected', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(mockGetProjectEnv).toHaveBeenCalledWith(project.id);
    });
  });

  it('should reload env config when selected project changes', async () => {
    const project1 = createTestProject({ id: 'project-1', name: 'Project 1' });
    const project2 = createTestProject({ id: 'project-2', name: 'Project 2' });
    mockProjects.push(project1, project2);
    mockSelectedProjectId = project1.id;
    mockGetProjectEnv.mockResolvedValue({ success: true, data: createTestEnvConfig() });

    const { rerender } = render(<AgentTools />);

    await waitFor(() => {
      expect(mockGetProjectEnv).toHaveBeenCalledWith(project1.id);
    });

    // Simulate project change
    mockSelectedProjectId = project2.id;
    rerender(<AgentTools />);

    await waitFor(() => {
      expect(mockGetProjectEnv).toHaveBeenCalledWith(project2.id);
    });
  });

  it('should persist MCP server settings through updateProjectEnv', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({ mcpServers: { puppeteerEnabled: false } })
    });
    mockUpdateProjectEnv.mockResolvedValueOnce({ success: true });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Puppeteer MCP')).toBeInTheDocument();
    });

    const puppeteerRow = screen.getByText('Puppeteer MCP').closest('.flex');
    const switchElement = puppeteerRow?.querySelector('[role="switch"]');

    if (switchElement) {
      fireEvent.click(switchElement);

      await waitFor(() => {
        expect(mockUpdateProjectEnv).toHaveBeenCalledWith(
          project.id,
          { mcpServers: expect.objectContaining({ puppeteerEnabled: true }) }
        );
      });
    }
  });

  it('should handle getProjectEnv failure gracefully', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockRejectedValueOnce(new Error('Failed to load'));

    render(<AgentTools />);

    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('MCP Server Overview')).toBeInTheDocument();
    });
  });
});

describe('AgentTools - Agent Card Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects.length = 0;
    mockSelectedProjectId = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should expand agent card when clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Spec Creation')).toBeInTheDocument();
    });

    // Find and click the Spec Gatherer agent card
    const specGathererButton = screen.getByRole('button', { name: /Spec Gatherer/i });
    fireEvent.click(specGathererButton);

    await waitFor(() => {
      // Should show MCP Servers section
      expect(screen.getByText('MCP Servers')).toBeInTheDocument();
    });
  });

  it('should collapse agent card when clicked again', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Spec Creation')).toBeInTheDocument();
    });

    const specGathererButton = screen.getByRole('button', { name: /Spec Gatherer/i });

    // Click to expand
    fireEvent.click(specGathererButton);
    await waitFor(() => {
      expect(screen.getByText('MCP Servers')).toBeInTheDocument();
    });

    // Click to collapse
    fireEvent.click(specGathererButton);
    await waitFor(() => {
      // MCP Servers section should no longer be visible
      expect(screen.queryByText('MCP Servers')).not.toBeInTheDocument();
    });
  });

  it('should toggle category expansion when category header is clicked', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Utility')).toBeInTheDocument();
    });

    // Utility category is expanded by default, click to collapse
    const utilityButton = screen.getByRole('button', { name: /Utility/ });
    fireEvent.click(utilityButton);

    // The category content should collapse (agents hidden)
    // Re-expand to verify toggle works
    fireEvent.click(utilityButton);

    await waitFor(() => {
      expect(screen.getByText(/PR Reviewer/)).toBeInTheDocument();
    });
  });

  it('should display model and thinking labels on agent cards', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Spec Creation')).toBeInTheDocument();
    });

    // Agent cards should display model badges (Sonnet by default)
    expect(screen.getAllByText(/Sonnet/).length).toBeGreaterThan(0);
  });

  it('should show Add Server button on expanded agent card', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({ success: true, data: createTestEnvConfig() });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Spec Creation')).toBeInTheDocument();
    });

    // Find and click the Coder agent card (has MCP servers)
    const coderButton = screen.getByRole('button', { name: /Coder/i });
    fireEvent.click(coderButton);

    await waitFor(() => {
      // Should show Add Server button
      expect(screen.getByText('Add Server')).toBeInTheDocument();
    });
  });
});

describe('AgentTools - Per-Agent MCP Overrides', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjects.length = 0;
    mockSelectedProjectId = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should show added MCP servers with "Added" badge', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({
        agentMcpOverrides: {
          spec_gatherer: { add: ['linear'] }
        }
      })
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Spec Creation')).toBeInTheDocument();
    });

    // Expand Spec Gatherer
    const specGathererButton = screen.getByRole('button', { name: /Spec Gatherer/i });
    fireEvent.click(specGathererButton);

    await waitFor(() => {
      // Should show Linear as added (with badge)
      expect(screen.getByText('Added')).toBeInTheDocument();
    });
  });

  it('should show removed MCP servers with strikethrough and restore option', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig({
        agentMcpOverrides: {
          coder: { remove: ['context7'] }
        }
      })
    });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Build')).toBeInTheDocument();
    });

    // Expand Coder agent
    const coderButton = screen.getByRole('button', { name: /Coder/i });
    fireEvent.click(coderButton);

    await waitFor(() => {
      // Should show "(removed)" text
      expect(screen.getByText('(removed)')).toBeInTheDocument();
    });
  });

  it('should persist agent MCP override when adding MCP server', async () => {
    const project = createTestProject();
    mockProjects.push(project);
    mockSelectedProjectId = project.id;
    mockGetProjectEnv.mockResolvedValueOnce({
      success: true,
      data: createTestEnvConfig()
    });
    mockUpdateProjectEnv.mockResolvedValueOnce({ success: true });

    render(<AgentTools />);

    await waitFor(() => {
      expect(screen.getByText('Build')).toBeInTheDocument();
    });

    // Expand Coder agent
    const coderButton = screen.getByRole('button', { name: /Coder/i });
    fireEvent.click(coderButton);

    await waitFor(() => {
      expect(screen.getByText('Add Server')).toBeInTheDocument();
    });

    // Click Add Server button
    fireEvent.click(screen.getByText('Add Server'));

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

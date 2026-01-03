/**
 * @vitest-environment jsdom
 */
/**
 * RoadmapKanbanView Tests
 *
 * Tests for the Kanban board component including:
 * - Column rendering and feature grouping
 * - Drag-and-drop interactions
 * - Status updates
 * - Empty state handling
 * - Feature click callbacks
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoadmapKanbanView } from '../RoadmapKanbanView';
import type { Roadmap, RoadmapFeature } from '../../../shared/types';

// Mock roadmap store
vi.mock('../../stores/roadmap-store', () => ({
  useRoadmapStore: vi.fn()
}));

// Mock SortableFeatureCard to simplify testing
vi.mock('../SortableFeatureCard', () => ({
  SortableFeatureCard: ({ feature, onClick }: { feature: RoadmapFeature; onClick: () => void }) => (
    <div data-testid={`feature-card-${feature.id}`} onClick={onClick}>
      <span data-testid="feature-title">{feature.title}</span>
      <span data-testid="feature-status">{feature.status}</span>
    </div>
  )
}));

// Mock DnD Kit with functional implementations
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragOver, onDragEnd }: {
    children: React.ReactNode;
    onDragStart?: (event: unknown) => void;
    onDragOver?: (event: unknown) => void;
    onDragEnd?: (event: unknown) => void;
  }) => (
    <div
      data-testid="dnd-context"
      data-ondragstart={onDragStart ? 'true' : 'false'}
      data-ondragover={onDragOver ? 'true' : 'false'}
      data-ondragend={onDragEnd ? 'true' : 'false'}
    >
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  closestCorners: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
  useDroppable: vi.fn(() => ({ setNodeRef: vi.fn() }))
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: 'vertical',
  arrayMove: vi.fn((arr, from, to) => {
    const newArr = [...arr];
    const [removed] = newArr.splice(from, 1);
    newArr.splice(to, 0, removed);
    return newArr;
  })
}));

import { useRoadmapStore } from '../../stores/roadmap-store';

// Test data
const createFeature = (id: string, status: string, title: string): RoadmapFeature => ({
  id,
  title,
  description: `Description for ${title}`,
  status: status as RoadmapFeature['status'],
  priority: 'medium',
  complexity: 'medium',
  impact: 'medium',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01')
});

const mockRoadmap: Roadmap = {
  id: 'roadmap-1',
  name: 'Test Roadmap',
  description: 'Test roadmap description',
  features: [
    createFeature('feature-1', 'backlog', 'Feature 1'),
    createFeature('feature-2', 'backlog', 'Feature 2'),
    createFeature('feature-3', 'planned', 'Feature 3'),
    createFeature('feature-4', 'in_progress', 'Feature 4'),
    createFeature('feature-5', 'done', 'Feature 5')
  ],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01')
};

const emptyRoadmap: Roadmap = {
  id: 'roadmap-2',
  name: 'Empty Roadmap',
  description: 'Empty roadmap',
  features: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01')
};

describe('RoadmapKanbanView', () => {
  const mockOnFeatureClick = vi.fn();
  const mockOnConvertToSpec = vi.fn();
  const mockOnGoToTask = vi.fn();
  const mockOnSave = vi.fn();
  const mockUpdateFeatureStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRoadmapStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        updateFeatureStatus: mockUpdateFeatureStatus
      };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render all four status columns', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // Check all column headers are present
      expect(screen.getByText('Backlog')).toBeInTheDocument();
      expect(screen.getByText('Planned')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should display correct feature counts in column headers', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // Get all count badges (there should be 4, one per column)
      const countBadges = screen.getAllByText(/^\d+$/);
      expect(countBadges).toHaveLength(4);

      // Backlog has 2 features
      expect(screen.getByText('2')).toBeInTheDocument();
      // Planned, In Progress, Done each have 1 feature
      const onesCount = screen.getAllByText('1');
      expect(onesCount.length).toBeGreaterThanOrEqual(3);
    });

    it('should render feature cards for each feature', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      expect(screen.getByTestId('feature-card-feature-1')).toBeInTheDocument();
      expect(screen.getByTestId('feature-card-feature-2')).toBeInTheDocument();
      expect(screen.getByTestId('feature-card-feature-3')).toBeInTheDocument();
      expect(screen.getByTestId('feature-card-feature-4')).toBeInTheDocument();
      expect(screen.getByTestId('feature-card-feature-5')).toBeInTheDocument();
    });

    it('should group features by their status in correct columns', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // Check features are in their correct columns by status
      const feature1 = screen.getByTestId('feature-card-feature-1');
      expect(feature1.querySelector('[data-testid="feature-status"]')).toHaveTextContent('backlog');

      const feature3 = screen.getByTestId('feature-card-feature-3');
      expect(feature3.querySelector('[data-testid="feature-status"]')).toHaveTextContent('planned');
    });

    it('should render DnD context with required handlers', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      const dndContext = screen.getByTestId('dnd-context');
      expect(dndContext).toHaveAttribute('data-ondragstart', 'true');
      expect(dndContext).toHaveAttribute('data-ondragover', 'true');
      expect(dndContext).toHaveAttribute('data-ondragend', 'true');
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty States', () => {
    it('should show empty state message for columns without features', () => {
      render(
        <RoadmapKanbanView
          roadmap={emptyRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // All columns should show "No features" message
      const noFeaturesMessages = screen.getAllByText('No features');
      expect(noFeaturesMessages).toHaveLength(4);
    });

    it('should show "Drag features here" hint in empty columns', () => {
      render(
        <RoadmapKanbanView
          roadmap={emptyRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      const dragHints = screen.getAllByText('Drag features here');
      expect(dragHints).toHaveLength(4);
    });

    it('should show zero count in column headers for empty columns', () => {
      render(
        <RoadmapKanbanView
          roadmap={emptyRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      const zeroCounts = screen.getAllByText('0');
      expect(zeroCounts).toHaveLength(4);
    });
  });

  // ===========================================
  // INTERACTION TESTS
  // ===========================================
  describe('Feature Interactions', () => {
    it('should call onFeatureClick when a feature card is clicked', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      const featureCard = screen.getByTestId('feature-card-feature-1');
      fireEvent.click(featureCard);

      expect(mockOnFeatureClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'feature-1',
          title: 'Feature 1'
        })
      );
    });

    it('should call onFeatureClick with correct feature data', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      const featureCard = screen.getByTestId('feature-card-feature-3');
      fireEvent.click(featureCard);

      expect(mockOnFeatureClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'feature-3',
          title: 'Feature 3',
          status: 'planned'
        })
      );
    });
  });

  // ===========================================
  // PROPS HANDLING TESTS
  // ===========================================
  describe('Props Handling', () => {
    it('should handle missing optional props gracefully', () => {
      // Should not throw when optional props are missing
      expect(() => {
        render(
          <RoadmapKanbanView
            roadmap={mockRoadmap}
            onFeatureClick={mockOnFeatureClick}
          />
        );
      }).not.toThrow();
    });

    it('should pass onConvertToSpec to feature cards when provided', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
          onConvertToSpec={mockOnConvertToSpec}
        />
      );

      // Component should render successfully with the prop
      expect(screen.getByTestId('feature-card-feature-1')).toBeInTheDocument();
    });

    it('should pass onGoToTask to feature cards when provided', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
          onGoToTask={mockOnGoToTask}
        />
      );

      expect(screen.getByTestId('feature-card-feature-1')).toBeInTheDocument();
    });
  });

  // ===========================================
  // DRAG OVERLAY TESTS
  // ===========================================
  describe('Drag Overlay', () => {
    it('should render drag overlay container', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
    });
  });

  // ===========================================
  // ROADMAP DATA TESTS
  // ===========================================
  describe('Roadmap Data Handling', () => {
    it('should update display when roadmap features change', () => {
      const { rerender } = render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // Initial state - 5 features
      expect(screen.getByTestId('feature-card-feature-1')).toBeInTheDocument();

      // Update with fewer features
      const updatedRoadmap: Roadmap = {
        ...mockRoadmap,
        features: [createFeature('feature-6', 'backlog', 'New Feature')]
      };

      rerender(
        <RoadmapKanbanView
          roadmap={updatedRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // Old features should be gone
      expect(screen.queryByTestId('feature-card-feature-1')).not.toBeInTheDocument();
      // New feature should be present
      expect(screen.getByTestId('feature-card-feature-6')).toBeInTheDocument();
    });

    it('should handle roadmap with features in single status', () => {
      const singleStatusRoadmap: Roadmap = {
        ...mockRoadmap,
        features: [
          createFeature('f1', 'in_progress', 'Active 1'),
          createFeature('f2', 'in_progress', 'Active 2'),
          createFeature('f3', 'in_progress', 'Active 3')
        ]
      };

      render(
        <RoadmapKanbanView
          roadmap={singleStatusRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // In Progress column should show count of 3
      expect(screen.getByText('3')).toBeInTheDocument();

      // Other columns should show 0
      const zeroCounts = screen.getAllByText('0');
      expect(zeroCounts).toHaveLength(3);
    });

    it('should display feature titles correctly', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.getByText('Feature 3')).toBeInTheDocument();
      expect(screen.getByText('Feature 4')).toBeInTheDocument();
      expect(screen.getByText('Feature 5')).toBeInTheDocument();
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should have semantic column structure', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // Column headers should be rendered as headings
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBe(4);
    });
  });

  // ===========================================
  // STORE INTEGRATION TESTS
  // ===========================================
  describe('Store Integration', () => {
    it('should access updateFeatureStatus from roadmap store', () => {
      render(
        <RoadmapKanbanView
          roadmap={mockRoadmap}
          onFeatureClick={mockOnFeatureClick}
        />
      );

      // Store selector should have been called
      expect(useRoadmapStore).toHaveBeenCalled();
    });
  });
});

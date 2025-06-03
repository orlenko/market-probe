import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import DeleteProjectButton from '../DeleteProjectButton';
import { ProjectWithCounts } from '@/types/admin';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock router implementation
const mockRefresh = jest.fn();
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: mockRefresh,
};

describe('DeleteProjectButton Component', () => {
  const mockProject: ProjectWithCounts = {
    id: 1,
    slug: 'test-project',
    title: 'Test Project',
    description: 'Test description',
    domain: 'test.com',
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      formSubmissions: 5,
      analyticsEvents: 100,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Default successful API response
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
      })
    );
  });

  describe('Initial Render', () => {
    it('renders delete button with trash icon', () => {
      render(<DeleteProjectButton project={mockProject} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveAttribute('title', 'Delete Project');

      // Check for TrashIcon (it should have SVG-related attributes)
      const icon = deleteButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('applies correct styling to delete button', () => {
      render(<DeleteProjectButton project={mockProject} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      expect(deleteButton).toHaveClass('text-red-400', 'hover:text-red-600');
    });
  });

  describe('Confirmation Workflow', () => {
    it('shows confirmation prompt when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      await user.click(deleteButton);

      expect(screen.getByText('Delete Test Project?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('hides trash icon when in confirmation state', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      await user.click(deleteButton);

      expect(screen.queryByRole('button', { name: 'Delete Project' })).not.toBeInTheDocument();
    });

    it('returns to initial state when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation state
      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      await user.click(deleteButton);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Should be back to initial state
      expect(screen.getByRole('button', { name: 'Delete Project' })).toBeInTheDocument();
      expect(screen.queryByText('Delete Test Project?')).not.toBeInTheDocument();
    });

    it('does not make API call when first clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      await user.click(deleteButton);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    it('makes DELETE API call when Yes is clicked', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation state
      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      await user.click(deleteButton);

      // Confirm deletion
      const yesButton = screen.getByRole('button', { name: 'Yes' });
      await user.click(yesButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/projects/1', {
          method: 'DELETE',
        });
      });
    });

    it('refreshes the router after successful deletion', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation and confirm
      await user.click(screen.getByRole('button', { name: 'Delete Project' }));
      await user.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('returns to initial state after successful deletion', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation and confirm
      await user.click(screen.getByRole('button', { name: 'Delete Project' }));
      await user.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete Project' })).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading text during deletion', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;

      mockFetch.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve;
          })
      );

      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation and confirm
      await user.click(screen.getByRole('button', { name: 'Delete Project' }));
      await user.click(screen.getByRole('button', { name: 'Yes' }));

      expect(screen.getByRole('button', { name: 'Deleting...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();

      // Resolve to complete test
      resolvePromise!({ ok: true });
    });

    it('disables yes button during deletion', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: any) => void;

      mockFetch.mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve;
          })
      );

      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation and confirm
      await user.click(screen.getByRole('button', { name: 'Delete Project' }));
      await user.click(screen.getByRole('button', { name: 'Yes' }));

      const deletingButton = screen.getByRole('button', { name: 'Deleting...' });
      expect(deletingButton).toBeDisabled();

      // Resolve to complete test
      resolvePromise!({ ok: true });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
        })
      );

      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation and confirm
      await user.click(screen.getByRole('button', { name: 'Delete Project' }));
      await user.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to delete project. Please try again.');
      });

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('handles network errors', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation and confirm
      await user.click(screen.getByRole('button', { name: 'Delete Project' }));
      await user.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to delete project. Please try again.');
      });

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('resets state after error', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
        })
      );

      render(<DeleteProjectButton project={mockProject} />);

      // Go to confirmation and confirm
      await user.click(screen.getByRole('button', { name: 'Delete Project' }));
      await user.click(screen.getByRole('button', { name: 'Yes' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete Project' })).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('provides proper button roles and labels', () => {
      render(<DeleteProjectButton project={mockProject} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      expect(deleteButton).toHaveAttribute('title', 'Delete Project');
    });

    it('maintains focus management during state changes', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      // Initial focus
      const deleteButton = screen.getByRole('button', { name: 'Delete Project' });
      deleteButton.focus();

      await user.click(deleteButton);

      // Confirmation state should have focusable elements
      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('provides clear confirmation text', async () => {
      const user = userEvent.setup();
      render(<DeleteProjectButton project={mockProject} />);

      await user.click(screen.getByRole('button', { name: 'Delete Project' }));

      expect(screen.getByText('Delete Test Project?')).toBeInTheDocument();
    });
  });
});

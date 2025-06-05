import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectStatusBadge from '../ProjectStatusBadge';

describe('ProjectStatusBadge Component', () => {
  describe('Status Variants', () => {
    it('renders ACTIVE status correctly', () => {
      render(<ProjectStatusBadge status="ACTIVE" />);

      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('renders DRAFT status correctly', () => {
      render(<ProjectStatusBadge status="DRAFT" />);

      const badge = screen.getByText('Draft');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('renders ARCHIVED status correctly', () => {
      render(<ProjectStatusBadge status="ARCHIVED" />);

      const badge = screen.getByText('Archived');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('renders GRADUATED status correctly', () => {
      render(<ProjectStatusBadge status="GRADUATED" />);

      const badge = screen.getByText('Graduated');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to DRAFT for unknown status', () => {
      render(<ProjectStatusBadge status="UNKNOWN_STATUS" />);

      const badge = screen.getByText('Draft');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('falls back to DRAFT for empty string', () => {
      render(<ProjectStatusBadge status="" />);

      const badge = screen.getByText('Draft');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Styling', () => {
    it('applies base badge styling classes', () => {
      render(<ProjectStatusBadge status="ACTIVE" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'px-2.5',
        'py-0.5',
        'rounded-full',
        'text-xs',
        'font-medium'
      );
    });

    it('renders as a span element', () => {
      render(<ProjectStatusBadge status="ACTIVE" />);

      const badge = screen.getByText('Active');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Accessibility', () => {
    it('provides readable text content', () => {
      render(<ProjectStatusBadge status="ACTIVE" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('uses semantic text for all statuses', () => {
      const statuses = ['ACTIVE', 'DRAFT', 'ARCHIVED', 'GRADUATED'];
      const expectedLabels = ['Active', 'Draft', 'Archived', 'Graduated'];

      statuses.forEach((status, index) => {
        const { unmount } = render(<ProjectStatusBadge status={status} />);
        expect(screen.getByText(expectedLabels[index])).toBeInTheDocument();
        unmount();
      });
    });
  });
});

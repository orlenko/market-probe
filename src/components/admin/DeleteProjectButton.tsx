'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ProjectWithCounts } from '@/types/admin';

interface DeleteProjectButtonProps {
  project: ProjectWithCounts;
}

export default function DeleteProjectButton({ project }: DeleteProjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs text-red-600">Delete {project.title}?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 text-xs"
        >
          {isDeleting ? 'Deleting...' : 'Yes'}
        </button>
        <button onClick={handleCancel} className="text-gray-600 hover:text-gray-800 text-xs">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600"
      title="Delete Project"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}

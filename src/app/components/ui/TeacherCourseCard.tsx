"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import LessonManager from './LessonManager';

interface Course {
  _id: string;
  title: string;
  description: string;
  lessons: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  files: any[];
}

interface TeacherCourseCardProps {
  course: Course;
  onDelete: () => void;
  onUpdate: () => void;
}

export default function TeacherCourseCard({ course, onDelete, onUpdate }: TeacherCourseCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [showLessonManager, setShowLessonManager] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      
      await axios.delete(`/api/courses/${course._id}`);
      onDelete();
      setShowDeleteConfirm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/teacher/courses/${course._id}/edit`);
  };

  const handleView = () => {
    router.push(`/courses/${course._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

        {/* Course Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <span>{course.lessons?.length || 0} Lessons</span>
          <span>•</span>
          <span>{course.files?.length || 0} Materials</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleView}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            View
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setShowLessonManager(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Manage Lessons
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Lesson Manager Modal */}
      {showLessonManager && (
        <LessonManager
          courseId={course._id}
          initialLessons={course.lessons || []}
          onClose={() => setShowLessonManager(false)}
          onUpdate={() => {
            onUpdate();
            setShowLessonManager(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Delete Course</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
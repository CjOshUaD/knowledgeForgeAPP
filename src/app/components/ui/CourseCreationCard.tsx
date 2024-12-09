'use client';

import { useState } from 'react';
import axios from 'axios';

interface Lesson {
  title: string;
  content: string;
  order: number;
}

interface Assignment {
  title: string;
  description: string;
  dueDate: string;
}

export default function CourseCreationCard({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [newLesson, setNewLesson] = useState({ title: '', content: '' });
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    description: '', 
    dueDate: '' 
  });

  const handleAddLesson = () => {
    if (newLesson.title && newLesson.content) {
      setLessons([
        ...lessons,
        { ...newLesson, order: lessons.length }
      ]);
      setNewLesson({ title: '', content: '' });
    }
  };

  const handleAddAssignment = () => {
    if (newAssignment.title && newAssignment.description && newAssignment.dueDate) {
      setAssignments([...assignments, newAssignment]);
      setNewAssignment({ title: '', description: '', dueDate: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      await axios.post('/api/courses', {
        title,
        description,
        enrollmentKey,
        lessons,
        assignments
      });

      setIsOpen(false);
      setTitle('');
      setDescription('');
      setEnrollmentKey('');
      setLessons([]);
      setAssignments([]);
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create course');
      } else {
        setError('Failed to create course');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Course
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Course Information */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Course Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded h-24"
                  required
                />
                <input
                  type="text"
                  placeholder="Enrollment Key (optional)"
                  value={enrollmentKey}
                  onChange={(e) => setEnrollmentKey(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Lessons Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Lessons</h3>
                <div className="space-y-2 mb-4">
                  {lessons.map((lesson, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <p className="font-medium">{lesson.title}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Lesson Content"
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    className="w-full p-2 border rounded h-24"
                  />
                  <button
                    type="button"
                    onClick={handleAddLesson}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Add Lesson
                  </button>
                </div>
              </div>

              {/* Assignments Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Assignments</h3>
                <div className="space-y-2 mb-4">
                  {assignments.map((assignment, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-gray-600">Due: {assignment.dueDate}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Assignment Title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Assignment Description"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    className="w-full p-2 border rounded h-24"
                  />
                  <input
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={handleAddAssignment}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Add Assignment
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-600">{error}</p>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
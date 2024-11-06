"use client";

import { useState } from 'react';
import axios from 'axios';

interface Lesson {
  title: string;
  content: string;
  order: number;
}

interface LessonManagerProps {
  courseId: string;
  initialLessons: Lesson[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function LessonManager({ 
  courseId, 
  initialLessons, 
  onClose, 
  onUpdate 
}: LessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [newLesson, setNewLesson] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddLesson = async () => {
    if (!newLesson.title || !newLesson.content) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`/api/courses/${courseId}/lessons`, {
        title: newLesson.title,
        content: newLesson.content,
        order: lessons.length
      });

      setLessons([...lessons, response.data.lesson]);
      setNewLesson({ title: '', content: '' });
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (index: number) => {
    try {
      setLoading(true);
      setError('');

      await axios.delete(`/api/courses/${courseId}/lessons/${index}`);

      const updatedLessons = lessons.filter((_, i) => i !== index);
      setLessons(updatedLessons);
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Lessons</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Existing Lessons */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Current Lessons</h3>
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{lesson.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteLesson(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  Delete
                </button>
              </div>
            ))}
            {lessons.length === 0 && (
              <p className="text-gray-500 italic">No lessons added yet</p>
            )}
          </div>
        </div>

        {/* Add New Lesson */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Add New Lesson</h3>
          <div className="space-y-3">
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
              className="w-full p-2 border rounded h-32"
            />
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              onClick={handleAddLesson}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Lesson'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
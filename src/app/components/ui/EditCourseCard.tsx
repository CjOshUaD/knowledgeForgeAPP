import { useState } from 'react';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  lessons: any[];
  files: any[];
  enrollmentKey?: string;
}

interface EditCourseCardProps {
  course: Course;
  onUpdate: () => void;
}

export default function EditCourseCard({ course, onUpdate }: EditCourseCardProps) {
  const [courseData, setCourseData] = useState({
    title: course.title,
    description: course.description,
    lessons: course.lessons,
    files: [] as File[],
    enrollmentKey: course.enrollmentKey || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCourseData({
        ...courseData,
        files: Array.from(e.target.files)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('lessons', JSON.stringify(courseData.lessons));
      formData.append('enrollmentKey', courseData.enrollmentKey);
      
      courseData.files.forEach(file => {
        formData.append('files', file);
      });

      await axios.put(`/api/courses/${course._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Course</h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title *
          </label>
          <input
            type="text"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Files
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            multiple
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enrollment Key
          </label>
          <input
            type="text"
            name="enrollmentKey"
            value={courseData.enrollmentKey}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional: Add an enrollment key"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Updating Course...' : 'Update Course'}
        </button>
      </form>
    </div>
  );
} 
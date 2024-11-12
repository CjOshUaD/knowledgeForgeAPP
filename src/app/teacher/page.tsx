"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Navbar from "../components/NavBar";
import TeacherCourseCard from "../components/ui/TeacherCourseCard";
import CreateCourseCard from "../components/ui/CreateCourseCard";

interface Course {
  _id: string;
  title: string;
  description: string;
  chapters: Array<{
    title: string;
    lessons: Array<any>;
    assignments: Array<any>;
    quizzes: Array<any>;
    files: Array<any>;
  }>;
  files: Array<any>;
}

export default function TeacherPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    if (!session?.user?.email) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/courses?type=teaching');
      setCourses(response.data);
    } catch (err: any) {
      console.error('Failed to fetch courses:', err);
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <CreateCourseCard onSuccess={fetchCourses} />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <TeacherCourseCard
                  key={course._id}
                  course={course}
                  onDelete={async () => {
                    try {
                      await axios.delete(`/api/courses/${course._id}`);
                      fetchCourses();
                    } catch (err) {
                      console.error('Failed to delete course:', err);
                      setError('Failed to delete course');
                    }
                  }}
                  onUpdate={fetchCourses}
                />
              ))}
            </div>

            {!loading && courses.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">You haven't created any courses yet.</p>
                <p className="text-gray-500 mt-2">Click the "Create Course" button to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
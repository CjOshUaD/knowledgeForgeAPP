"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios, { AxiosError } from 'axios';
import Navbar from "../components/NavBar";
import TeacherCourseCard from "../components/ui/TeacherCourseCard";
import CreateCourseCard from "../components/ui/CreateCourseCard";
import { toast } from 'react-hot-toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  chapters: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      files?: Array<{ name: string; url: string; type: string; }>;
    }>;
    assignments: Array<{
      title: string;
      content: string;
      startDateTime: string;
      endDateTime: string;
      files?: Array<{ name: string; url: string; type: string; }>;
    }>;
    quizzes: Array<{
      title: string;
      description: string;
      questions: Array<{ question: string; type: string; points: number; }>;
      startDateTime: string;
      endDateTime: string;
      duration: number;
      totalPoints: number;
    }>;
    files: Array<{ name: string; url: string; type: string; }>;
  }>;
  files: Array<{ name: string; url: string; type: string; }>;
}

export default function TeacherPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/courses?type=teaching');
      setCourses(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch courses:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || 'Failed to fetch courses');
      }
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session, fetchCourses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <div style={{ position: 'relative', zIndex: 50 }}>
            <CreateCourseCard 
              onSuccess={fetchCourses} 
              onOpenChange={(isOpen) => setIsCreateModalOpen(isOpen)}
            />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: isCreateModalOpen ? -1 : 'auto' }}>
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
                        const response = await axios.delete(`/api/courses/${course._id}`);
                        if (response.status === 204) {
                          await fetchCourses();
                          toast.success('Course deleted successfully');
                        }
                      } catch (err) {
                        if (axios.isAxiosError(err)) {
                          // Course might already be deleted, so we still refresh
                          await fetchCourses();
                          if (err.response?.status === 404) {
                            toast.success('Course deleted successfully');
                          } else {
                            toast.error('Failed to delete course');
                            setError('Failed to delete course');
                          }
                        }
                      }
                    }}
                    onUpdate={fetchCourses}
                    isCreateModalOpen={isCreateModalOpen}
                  />
                ))}
              </div>

              {!loading && courses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600">You haven&apos;t created any courses yet.</p>
                  <p className="text-gray-500 mt-2">Click the &quot;Create Course&quot; button to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
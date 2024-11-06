"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Navbar from "@/app/components/NavBar";

interface Course {
  _id: string;
  title: string;
  description: string;
  lessons: Array<{
    title: string;
    content: string;
  }>;
  files: Array<{
    name: string;
    path: string;
    type: string;
  }>;
}

export default function CoursePage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${params.courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error || !course) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Course not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-600 mb-8">{course.description}</p>

        {/* Lessons Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Lessons</h2>
          {course.lessons.length === 0 ? (
            <p className="text-gray-600">No lessons available yet.</p>
          ) : (
            <div className="space-y-4">
              {course.lessons.map((lesson, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium mb-2">{lesson.title}</h3>
                  <p className="text-gray-600">{lesson.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Course Materials Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Course Materials</h2>
          {course.files.length === 0 ? (
            <p className="text-gray-600">No materials available yet.</p>
          ) : (
            <div className="space-y-2">
              {course.files.map((file, index) => (
                <a
                  key={index}
                  href={file.path}
                  className="block bg-white p-3 rounded-lg shadow hover:bg-gray-50 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="text-blue-600">{file.name}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 
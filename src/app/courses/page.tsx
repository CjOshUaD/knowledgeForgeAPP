"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '../components/NavBar';
import { motion } from 'framer-motion';
import { Button } from '@nextui-org/react';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
  };
  enrolledStudents: string[];
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching courses...');
        const response = await axios.get('/api/courses/public');
        console.log('Courses response:', response.data);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.details || error.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-center text-[#024CAA] mb-12">
            Available Courses
          </h1>

          {courses.length === 0 ? (
            <div className="text-center text-gray-600">
              No courses available at the moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => {
                    if (!session) {
                      router.push('/register');
                    } else {
                      router.push(`/courses/${course._id}`);
                    }
                  }}
                >
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#1A4870] mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {course.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Instructor: {course.instructor?.name}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {course.enrolledStudents?.length || 0} students enrolled
                      </span>
                      <Button
                        className="bg-[#FFC55A]/90 text-white font-semibold px-6 py-2 rounded-lg 
                        transition-all duration-300 hover:-translate-y-1 hover:scale-105 
                        hover:bg-[#FFC55A] hover:shadow-lg shadow-md"
                      >
                        View Course
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
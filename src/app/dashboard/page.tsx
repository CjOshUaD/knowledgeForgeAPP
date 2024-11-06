"use client";

import { useState, useEffect } from 'react';
import { useSession} from 'next-auth/react';
//import { Session } from 'next-auth';
import axios from 'axios';
import Navbar from "../components/NavBar";
import CourseCard from "../components/ui/CourseCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  enrolledStudents: string[];
  lessons: any[];
  files: any[];
  enrollmentKey?: string;
}

interface Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  const [courses, setCourses] = useState<{
    enrolled: Course[];
    available: Course[];
    teaching: Course[];
  }>({
    enrolled: [],
    available: [],
    teaching: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    if (!session?.user?.id) {
      console.log('No user ID found in session:', session);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [enrolledRes, availableRes, teachingRes] = await Promise.all([
        axios.get('/api/courses?type=enrolled'),
        axios.get('/api/courses?type=available'),
        axios.get('/api/courses?type=teaching')
      ]);

      setCourses({
        enrolled: enrolledRes.data,
        available: availableRes.data,
        teaching: teachingRes.data
      });
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCourses();
    }
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto p-8">
          <CoursesSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Teaching Section */}
        {courses.teaching.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Courses You Teach</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.teaching.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={false}
                  isTeacher={true}
                  onEnroll={fetchCourses}
                />
              ))}
            </div>
          </section>
        )}

        {/* Enrolled Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">My Enrolled Courses</h2>
          {courses.enrolled.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.enrolled.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={true}
                  isTeacher={false}
                  onEnroll={fetchCourses}
                />
              ))}
            </div>
          )}
        </section>

        {/* Available Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>
          {courses.available.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No courses available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.available.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isEnrolled={false}
                  isTeacher={false}
                  onEnroll={fetchCourses}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const CoursesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <LoadingSkeleton key={i} />
    ))}
  </div>
);

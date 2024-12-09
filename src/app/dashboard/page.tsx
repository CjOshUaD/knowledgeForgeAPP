"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession} from 'next-auth/react';
import { Session } from 'next-auth';
import axios from 'axios';
import Navbar from "../components/NavBar";
import CourseCard from "../components/ui/CourseCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import CreateCourseCard from "../components/ui/CreateCourseCard";
import { toast } from 'react-hot-toast';

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    accessToken?: string;
  }
}

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  enrolledStudents: string[];
  lessons: {
    _id: string;
    title: string;
    content: string;
  }[];
  files: {
    _id?: string;
    name: string;
    url: string;
    type: string;
  }[];
  enrollmentKey?: string;
  chapters: {
    _id: string;
    title: string;
    lessons: Lesson[];
    assignments: {
      title: string;
      content: string;
      startDateTime: string;
      endDateTime: string;
      file?: {
        name: string;
        url: string;
        type: string;
      } | null;
    }[];
    quizzes: {
      title: string;
      description: string;
      questions: {
        question: string;
        type: string;
        options?: string[];
        correctAnswer?: string | boolean;
        points: number;
      }[];
      startDateTime: string;
      endDateTime: string;
      duration: number;
      totalPoints: number;
      file?: {
        name: string;
        url: string;
        type: string;
      } | null;
    }[];
  }[];
  stats?: {
    totalLessons: number;
    totalAssignments: number;
    totalQuizzes: number;
  };
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message: string;
}

function calculateCourseStats(course: Course) {
  return {
    totalChapters: course.chapters.length,
    totalLessons: course.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0),
    totalFiles: course.files.length,
    totalAssignments: course.chapters.reduce((acc, chapter) => acc + chapter.assignments.length, 0),
    totalQuizzes: course.chapters.reduce((acc, chapter) => acc + chapter.quizzes.length, 0),
    fileTypes: {
      course: course.files.length,
      chapter: 0,
      lesson: 0,
      assignment: 0,
      quiz: 0
    }
  };
}

export default function Dashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      console.log('User is not authenticated');
    }
  }) as { data: CustomSession | null };

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
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [enrollmentError, setEnrollmentError] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/courses');
      
      // Immediately update the course lists
      const enrolled = response.data.filter((course: Course) => 
        course.enrolledStudents?.includes(session.user.id)
      );
      
      const available = response.data.filter((course: Course) => 
        !course.enrolledStudents?.includes(session.user.id) && 
        course.teacherId !== session.user.id
      );
      
      const teaching = response.data.filter((course: Course) => 
        course.teacherId === session.user.id
      );

      // Update state with new course lists
      setCourses({
        enrolled,
        available,
        teaching
      });

      // Force a re-render of the enrolled courses section
      const enrolledSection = document.getElementById('enrolled-courses');
      if (enrolledSection) {
        enrolledSection.style.opacity = '0.99';
        setTimeout(() => {
          enrolledSection.style.opacity = '1';
        }, 50);
      }

    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Add this effect to ensure courses are always up to date
  useEffect(() => {
    if (session?.user) {
      fetchCourses();
    }
  }, [session, fetchCourses]);

  const handleEnroll = async (courseId: string) => {
    if (!session) {
      toast.error('Please log in to enroll');
      return;
    }

    try {
      const course = courses.available.find(c => c._id === courseId);
      
      if (course?.enrollmentKey) {
        setEnrollingCourseId(courseId);
        setShowEnrollModal(true);
        return;
      }

      await axios.post(`/api/courses/${courseId}/enroll`);
      await fetchCourses(); // Refresh course lists
      toast.success('Successfully enrolled in course!');
      
      // Scroll to enrolled courses section
      document.getElementById('enrolled-courses')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(apiError.response?.data?.error || 'Failed to enroll in course');
    }
  };

  const handleEnrollWithKey = async () => {
    if (!enrollingCourseId || !session) return;
    
    try {
      await axios.post(`/api/courses/${enrollingCourseId}/enroll`, {
        enrollmentKey
      });
      
      await fetchCourses(); // Refresh course lists
      toast.success('Successfully enrolled in course!');
      
      // Clear modal state
      setShowEnrollModal(false);
      setEnrollmentKey('');
      setEnrollingCourseId(null);
      setEnrollmentError('');
      
      // Scroll to enrolled courses section
      document.getElementById('enrolled-courses')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Invalid enrollment key';
      setEnrollmentError(errorMessage);
      toast.error(errorMessage);
    }
  };

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
        {session?.user?.role === 'teacher' && (
          <div className="mb-8">
            <CreateCourseCard 
              onSuccess={fetchCourses}
              onOpenChange={() => {}}
            />
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
                  stats={calculateCourseStats(course)}
                  isEnrolled={false}
                  isTeacher={true}
                  onRefresh={fetchCourses}
                />
              ))}
            </div>
          </section>
        )}

        {/* Enrolled Section */}
        <section id="enrolled-courses" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Enrolled Courses</h2>
          {courses.enrolled.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrolled Courses</h3>
                <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet. Browse our available courses below.</p>
                <button
                  onClick={() => document.getElementById('available-courses')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Browse Courses →
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.enrolled.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  stats={calculateCourseStats(course)}
                  isEnrolled={true}
                  isTeacher={false}
                  onRefresh={fetchCourses}
                />
              ))}
            </div>
          )}
        </section>

        {/* Available Section */}
        <section id="available-courses" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
          {courses.available.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Courses</h3>
                <p className="text-gray-500">Check back later for new courses!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.available
                .filter(course => course.teacherId !== session?.user?.id)
                .map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    stats={calculateCourseStats(course)}
                    isEnrolled={false}
                    isTeacher={false}
                    onRefresh={fetchCourses}
                    onEnroll={() => handleEnroll(course._id)}
                  />
              ))}
            </div>
          )}
        </section>

        {showEnrollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Enter Enrollment Key</h3>
              <input
                type="text"
                value={enrollmentKey}
                onChange={(e) => {
                  setEnrollmentKey(e.target.value);
                  setEnrollmentError('');
                }}
                placeholder="Enter enrollment key"
                className="w-full p-2 border rounded mb-4"
              />
              {enrollmentError && (
                <p className="text-red-500 text-sm mb-4">{enrollmentError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleEnrollWithKey}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setEnrollmentKey('');
                    setEnrollmentError('');
                    setEnrollingCourseId(null);
                  }}
                  className="flex-1 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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

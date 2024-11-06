'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Course } from '@/app/types';

interface CourseCardProps {
  course: Course;
  isEnrolled: boolean;
  isTeacher: boolean;
  onEnroll?: () => void;
}

export default function CourseCard({ course, isEnrolled, isTeacher, onEnroll }: CourseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnroll = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      setError('');

      await axios.post(`/api/courses/${course._id}/enroll`, {
        enrollmentKey: enrollmentKey || undefined
      });

      if (onEnroll) {
        onEnroll();
      }
      setShowEnrollForm(false);
      setEnrollmentKey('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (isEnrolled || isTeacher) {
      router.push(`/courses/${course._id}`);
    } else if (course.enrollmentKey) {
      setShowEnrollForm(true);
    } else {
      handleEnroll();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <span>{course.lessons?.length || 0} Lessons</span>
          <span>•</span>
          <span>{course.files?.length || 0} Materials</span>
          {course.enrollmentKey && (
            <>
              <span>•</span>
              <span className="text-yellow-600">Requires Key</span>
            </>
          )}
        </div>

        {!isTeacher && !isEnrolled && (
          <div className="space-y-3">
            {showEnrollForm && course.enrollmentKey ? (
              <>
                <input
                  type="text"
                  placeholder="Enter enrollment key"
                  value={enrollmentKey}
                  onChange={(e) => setEnrollmentKey(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowEnrollForm(false)}
                    className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEnroll}
                    disabled={loading || !enrollmentKey}
                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                  >
                    {loading ? 'Enrolling...' : 'Submit'}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleClick}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Processing...' : course.enrollmentKey ? 'Enter Key to Enroll' : 'Enroll Now'}
              </button>
            )}
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>
        )}

        {(isEnrolled || isTeacher) && (
          <button
            onClick={handleClick}
            className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            View Course
          </button>
        )}
      </div>
    </div>
  );
} 
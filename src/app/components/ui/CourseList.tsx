'use client';

import { useState, useCallback } from 'react';
import CourseCard from './CourseCard';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  files: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  enrolledStudents?: string[];
  enrollmentKey?: string;
}

interface CourseListProps {
  initialCourses: Course[];
  isTeacher: boolean;
  userId: string;
}

export default function CourseList({ initialCourses, isTeacher, userId }: CourseListProps) {
  const [courses, setCourses] = useState(initialCourses);

  const refreshCourses = useCallback(async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to refresh courses:', error);
    }
  }, []);

  return (
    <div className="mt-8">
      {!isTeacher && (
        <>
          {courses.some(c => c.enrolledStudents?.includes(userId)) && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Enrolled Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter(course => course.enrolledStudents?.includes(userId))
                  .map(course => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      isTeacher={isTeacher}
                      isEnrolled={true}
                    />
                  ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-4">Available Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter(course => !course.enrolledStudents?.includes(userId))
                .map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isTeacher={isTeacher}
                    isEnrolled={false}
                    onEnroll={refreshCourses}
                  />
                ))}
            </div>
          </div>
        </>
      )}

      {isTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              isTeacher={isTeacher}
              isEnrolled={false}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
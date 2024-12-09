'use client';

import { useState, useCallback, useEffect } from 'react';
import CourseCard from './CourseCard';
import axios from 'axios';

interface Lesson {
  title: string;
  content: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
}

interface Assignment {
  title: string;
  content: string;
  startDateTime: string;
  endDateTime: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
}

interface Quiz {
  title: string;
  description: string;
  questions: Array<{
    question: string;
    type: string;
    options?: string[];
    correctAnswer?: string | boolean;
    points: number;
  }>;
  startDateTime: string;
  endDateTime: string;
  duration: number;
  totalPoints: number;
  file?: {
    name: string;
    url: string;
    type: string;
  };
}

interface Chapter {
  _id: string;
  title: string;
  lessons: Array<Lesson>;
  assignments: Array<Assignment>;
  quizzes: Array<Quiz>;
  files: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  chapters: Chapter[];
  files: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  enrolledStudents?: string[];
  enrollmentKey?: string;
  stats: {
    totalChapters: number;
    totalLessons: number;
    totalAssignments: number;
    totalQuizzes: number;
    totalFiles: number;
    fileTypes: {
      course: number;
      chapter: number;
      lesson: number;
      assignment: number;
      quiz: number;
    };
  };
}

interface CourseStats {
  totalChapters: number;
  totalLessons: number;
  totalAssignments: number;
  totalQuizzes: number;
  totalFiles: number;
  fileTypes: {
    course: number;
    chapter: number;
    lesson: number;
    assignment: number;
    quiz: number;
  };
}

interface CourseListProps {
  initialCourses: Course[];
  isTeacher: boolean;
  userId: string;
}

export interface CourseCardProps {
  course: Course;
  stats: CourseStats;
  isTeacher: boolean;
  isEnrolled: boolean;
  onRefresh: () => void;
  onFileUpdate: (courseId: string) => Promise<void>;
}

export default function CourseList({ initialCourses, isTeacher, userId }: CourseListProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses');
      const coursesWithStats = response.data.map((course: Course) => ({
        ...course,
        stats: calculateCourseStats(course)
      }));
      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Failed to refresh courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateCourseStats = (course: Course) => {
    let totalFiles = 0;
    const fileTypes = {
      course: 0,
      chapter: 0,
      lesson: 0,
      assignment: 0,
      quiz: 0
    };

    // Count course-level files
    if (Array.isArray(course.files)) {
      totalFiles += course.files.length;
      fileTypes.course += course.files.length;
    }

    // Count chapter-level files
    course.chapters?.forEach(chapter => {
      // Count lesson files
      chapter.lessons?.forEach(lesson => {
        if (lesson.file) {
          totalFiles += 1;
          fileTypes.lesson += 1;
        }
      });

      // Count assignment files
      chapter.assignments?.forEach(assignment => {
        if (assignment.file) {
          totalFiles += 1;
          fileTypes.assignment += 1;
        }
      });

      // Count quiz files
      chapter.quizzes?.forEach(quiz => {
        if (quiz.file) {
          totalFiles += 1;
          fileTypes.quiz += 1;
        }
      });
    });

    return {
      totalChapters: course.chapters?.length || 0,
      totalLessons: course.chapters?.reduce((total, chapter) => 
        total + (chapter.lessons?.length || 0), 0) || 0,
      totalAssignments: course.chapters?.reduce((total, chapter) => 
        total + (chapter.assignments?.length || 0), 0) || 0,
      totalQuizzes: course.chapters?.reduce((total, chapter) => 
        total + (chapter.quizzes?.length || 0), 0) || 0,
      totalFiles,
      fileTypes
    };
  };

  const renderCourseCard = (course: Course) => {
    return (
      <CourseCard
        key={course._id}
        course={course}
        stats={course.stats}
        isTeacher={isTeacher}
        isEnrolled={course.enrolledStudents?.includes(userId) ?? false}
        onRefresh={refreshCourses}
      />
    );
  };

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  return (
    <div className="mt-8">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {!isTeacher && (
            <>
              {/* Enrolled Courses Section */}
              {courses.some(c => c.enrolledStudents?.includes(userId)) && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">My Courses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses
                      .filter(course => course.enrolledStudents?.includes(userId))
                      .map(course => renderCourseCard(course))}
                  </div>
                </div>
              )}

              {/* Available Courses Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Available Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses
                    .filter(course => !course.enrolledStudents?.includes(userId))
                    .map(course => renderCourseCard(course))}
                </div>
              </div>
            </>
          )}

          {/* Teacher's Courses Section */}
          {isTeacher && (
            <div>
              <h3 className="text-xl font-semibold mb-4">My Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter(course => course.teacherId === userId)
                  .map(course => renderCourseCard(course))}
              </div>
            </div>
          )}

          {courses.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              {isTeacher ? 
                "You haven't created any courses yet." : 
                "No courses available at the moment."}
            </div>
          )}
        </>
      )}
    </div>
  );
} 
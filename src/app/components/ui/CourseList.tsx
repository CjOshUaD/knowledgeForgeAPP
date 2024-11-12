'use client';

import { useState, useCallback } from 'react';
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
  stats?: {
    totalChapters: number;
    totalLessons: number;
    totalAssignments: number;
    totalQuizzes: number;
    totalFiles: number;
  };
}

interface CourseListProps {
  initialCourses: Course[];
  isTeacher: boolean;
  userId: string;
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
    let fileTypes = {
      course: 0,
      chapter: 0,
      lesson: 0,
      assignment: 0,
      quiz: 0
    };

    // Count course-level files
    if (Array.isArray(course.files)) {
      const validFiles = course.files.filter(file => 
        file.name && file.url && !file.name.includes('client_secret')
      );
      totalFiles += validFiles.length;
      fileTypes.course += validFiles.length;
    }

    // Count chapter-level files
    course.chapters?.forEach(chapter => {
      // Count chapter files
      if (Array.isArray(chapter.files)) {
        const validChapterFiles = chapter.files.filter(file => 
          file.name && file.url && !file.name.includes('client_secret')
        );
        totalFiles += validChapterFiles.length;
        fileTypes.chapter += validChapterFiles.length;
      }

      // Count lesson files
      chapter.lessons?.forEach(lesson => {
        if (lesson.file?.name && lesson.file?.url && 
            !lesson.file.name.includes('client_secret')) {
          totalFiles += 1;
          fileTypes.lesson += 1;
        }
      });

      // Count assignment files
      chapter.assignments?.forEach(assignment => {
        if (assignment.file?.name && assignment.file?.url && 
            !assignment.file.name.includes('client_secret')) {
          totalFiles += 1;
          fileTypes.assignment += 1;
        }
      });

      // Count quiz files
      chapter.quizzes?.forEach(quiz => {
        if (quiz.file?.name && quiz.file?.url && 
            !quiz.file.name.includes('client_secret')) {
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
    const stats = calculateCourseStats(course);
    return (
      <CourseCard
        key={course._id}
        course={{
          ...course,
          stats: {
            ...stats,
            fileTypes: stats.fileTypes
          }
        }}
        isTeacher={isTeacher}
        isEnrolled={course.enrolledStudents?.includes(userId) || false}
        onRefresh={refreshCourses}
        onFileUpdate={() => handleFileUpdate(course._id)}
      />
    );
  };

  const handleFileUpdate = async (courseId: string) => {
    try {
      const updatedCourses = await Promise.all(
        courses.map(async (course) => {
          if (course._id === courseId) {
            const response = await axios.get(`/api/courses/${courseId}`);
            return {
              ...response.data,
              stats: calculateCourseStats(response.data)
            };
          }
          return course;
        })
      );
      setCourses(updatedCourses);
    } catch (error) {
      console.error('Failed to update course files:', error);
      setError('Failed to update course files');
    }
  };

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
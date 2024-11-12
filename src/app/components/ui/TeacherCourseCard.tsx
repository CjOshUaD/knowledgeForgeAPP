"use client";

import { useRouter } from 'next/navigation';

interface FileData {
  name: string;
  url: string;
  type: string;
}

interface Lesson {
  title: string;
  content: string;
  file?: FileData;
}

interface Assignment {
  title: string;
  content: string;
  startDateTime: string;
  endDateTime: string;
  file?: FileData;
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
  file?: FileData;
}

interface Chapter {
  title: string;
  lessons: Lesson[];
  assignments: Assignment[];
  quizzes: Quiz[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  chapters: Chapter[];
  files?: FileData[];
  enrolledStudents?: string[];
  enrollmentKey?: string;
}

interface TeacherCourseCardProps {
  course: Course;
  onDelete: () => void;
  onUpdate: () => void;
}

export default function TeacherCourseCard({ course, onDelete, onUpdate }: TeacherCourseCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/courses/${course._id}/edit`);
  };

  // Function to calculate total files
  function calculateTotalFiles(course: Course): number {
    let total = 0;
    
    // Count course-level files
    if (Array.isArray(course.files)) {
      const validCourseFiles = course.files.filter(file => 
        file.name && file.url && !file.name.includes('client_secret')
      );
      total += validCourseFiles.length;
    }

    // Count files in chapters
    course.chapters?.forEach(chapter => {
      // Add lesson files
      chapter.lessons?.forEach(lesson => {
        if (lesson.file && !lesson.file.name.includes('client_secret')) {
          total += 1;
        }
      });

      // Add assignment files
      chapter.assignments?.forEach(assignment => {
        if (assignment.file && !assignment.file.name.includes('client_secret')) {
          total += 1;
        }
      });

      // Add quiz files
      chapter.quizzes?.forEach(quiz => {
        if (quiz.file && !quiz.file.name.includes('client_secret')) {
          total += 1;
        }
      });
    });

    return total;
  }

  // Calculate stats for the course
  const stats = {
    totalChapters: course.chapters?.length || 0,
    totalLessons: course.chapters?.reduce((total, chapter) => 
      total + (chapter.lessons?.length || 0), 0) || 0,
    totalAssignments: course.chapters?.reduce((total, chapter) => 
      total + (chapter.assignments?.length || 0), 0) || 0,
    totalQuizzes: course.chapters?.reduce((total, chapter) => 
      total + (chapter.quizzes?.length || 0), 0) || 0,
    totalFiles: calculateTotalFiles(course)
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>

      {/* Course Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded">
          <span className="text-xl font-bold text-blue-600">{stats.totalChapters}</span>
          <p className="text-sm text-blue-600">Chapters</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <span className="text-xl font-bold text-green-600">{stats.totalLessons}</span>
          <p className="text-sm text-green-600">Lessons</p>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <span className="text-xl font-bold text-purple-600">{stats.totalAssignments}</span>
          <p className="text-sm text-purple-600">Assignments</p>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <span className="text-xl font-bold text-yellow-600">{stats.totalQuizzes}</span>
          <p className="text-sm text-yellow-600">Quizzes</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <span className="text-xl font-bold text-red-600">{stats.totalFiles}</span>
          <p className="text-sm text-red-600">Files</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 
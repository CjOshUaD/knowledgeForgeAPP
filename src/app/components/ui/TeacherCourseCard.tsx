"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@nextui-org/react";
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
  grades?: {
    studentId: string;
    grade: number;
    feedback?: string;
    updatedAt: string;
  }[];
}

interface TeacherCourseCardProps {
  course: Course;
  onDelete: () => void;
  onUpdate: () => void;
  isCreateModalOpen: boolean;
}

export default function TeacherCourseCard({ 
  course, 
  onDelete, 
  onUpdate,
  isCreateModalOpen
}: TeacherCourseCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleEdit = () => {
    router.push(`/courses/${course._id}/edit`);
    onUpdate();
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/courses/${course._id}`);
      
      if (response.status === 204) {
        setIsVisible(false);
        onDelete();
        toast.success('Course deleted successfully');
        router.refresh();
      }
    } catch (error: unknown) {
      console.error('Delete error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error('Course not found');
      } else {
        toast.error('Failed to delete course');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageGrades = (courseId: string) => {
    router.push(`/courses/${courseId}/grades`);
  };

  if (!isVisible) return null;

  // Calculate stats for the course
  const stats = {
    chapters: course.chapters?.length || 0,
    lessons: course.chapters?.reduce((total, chapter) => 
      total + (chapter.lessons?.length || 0), 0) || 0,
    assignments: course.chapters?.reduce((total, chapter) => 
      total + (chapter.assignments?.length || 0), 0) || 0,
    quizzes: course.chapters?.reduce((total, chapter) => 
      total + (chapter.quizzes?.length || 0), 0) || 0,
    files: course.files?.length || 0
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6" 
      style={{ 
        display: isCreateModalOpen ? 'none' : 'block'
      }}
    >
      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>
      
      {/* Course Statistics */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded">
          <span className="text-xl font-bold text-blue-600">{stats.chapters}</span>
          <p className="text-sm text-blue-600">Chapters</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <span className="text-xl font-bold text-green-600">{stats.lessons}</span>
          <p className="text-sm text-green-600">Lessons</p>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <span className="text-xl font-bold text-purple-600">{stats.assignments}</span>
          <p className="text-sm text-purple-600">Assignments</p>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <span className="text-xl font-bold text-yellow-600">{stats.quizzes}</span>
          <p className="text-sm text-yellow-600">Quizzes</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <span className="text-xl font-bold text-red-600">{stats.files}</span>
          <p className="text-sm text-red-600">Files</p>
        </div>
        
      </div>

      {/* Action Buttons - with pointer-events-none when modal is open */}
      <div className="flex justify-end gap-2 mt-4" style={{ pointerEvents: isCreateModalOpen ? 'none' : 'auto' }}>
        <Button 
          onClick={handleEdit}
          className="flex-1 bg-[#0066FF] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          disabled={isCreateModalOpen || loading}
        >
          Edit
        </Button>
        <Button 
          onClick={handleDelete}
          className="flex-1 bg-[#FF1B6D] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          disabled={isCreateModalOpen || loading}
        >
          Delete
        </Button>
        <Button 
          color="primary"
          onClick={() => handleManageGrades(course._id)}
          className="font-semibold"
        >
          Manage Grades
        </Button>
      </div>
    </div>
  );
}

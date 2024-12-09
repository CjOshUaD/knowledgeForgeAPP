"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from "@/app/components/NavBar";
import { Button } from "@nextui-org/react";
import { getSession } from 'next-auth/react';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Grade {
  studentId: string;
  studentName?: string;
  grade: number;
  feedback?: string;
  updatedAt: string;
}

interface ItemGrade extends Grade {
  itemType: 'quiz' | 'assignment';
  itemId: string;
  itemTitle: string;
}

interface FileData {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  chapters: {
    title: string;
    assignments: {
      id: string;
      title: string;
      content: string;
      startDateTime: string;
      endDateTime: string;
      dueDate: string;
      files: FileData[];
      totalPoints: number;
    }[];
    quizzes: {
      id: string;
      title: string;
      questions: QuizQuestion[];
      startDateTime: string;
      endDateTime: string;
      timeLimit: number;
      totalPoints: number;
    }[];
  }[];
}

interface GradeStatus {
  isGraded: boolean;
  lastUpdated: string | null;
}

export default function CourseGradesPage() {
  const params = useParams();
  const router = useRouter();
  const [grades, setGrades] = useState<ItemGrade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'quiz' | 'assignment';
    id: string;
    title: string;
    chapterIndex: number;
    itemIndex: number;
  } | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [gradeStatuses, setGradeStatuses] = useState<Record<string, GradeStatus>>({});

  const fetchStudents = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      const response = await axios.get(`/api/courses/${params.courseId}/students`);
      setStudents(response.data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching students:', axiosError);
      if (axiosError.response?.status === 401) {
        router.push('/auth/signin');
      } else {
        toast.error('Failed to fetch students');
      }
    }
  }, [params.courseId, router]);

  const fetchGrades = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/${params.courseId}/grades`, {
        params: {
          itemType: selectedItem?.type,
          itemId: selectedItem?.id
        }
      });
      setGrades(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch grades');
    }
  }, [params.courseId, selectedItem]);

  const fetchCourse = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/${params.courseId}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to fetch course');
    }
  }, [params.courseId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchGrades(), fetchCourse()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStudents, fetchGrades, fetchCourse]);

  const handleUpdateGrade = async (studentId: string, grade: number, feedback: string) => {
    try {
      await axios.post(`/api/courses/${params.courseId}/grades`, {
        studentId,
        itemType: selectedItem?.type,
        itemId: selectedItem?.id,
        grade,
        feedback
      });
      
      setGradeStatuses(prev => ({
        ...prev,
        [studentId]: {
          isGraded: true,
          lastUpdated: new Date().toISOString()
        }
      }));
      
      toast.success('Grade updated successfully');
      fetchGrades();
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(`Failed to update grade: ${axiosError.message}`);
    }
  };

  const handleViewSubmission = (studentId: string) => {
    if (!selectedItem) return;
    router.push(`/courses/${params.courseId}/${selectedItem.type}/${selectedItem.chapterIndex}/${selectedItem.itemIndex}/submissions/${studentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-bold mb-6">Course Grades</h1>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Course Grades</h1>
          <Button 
            color="primary"
            onClick={() => router.back()}
          >
            Back to Course
          </Button>
        </div>
        <div className="space-y-4">
          {course?.chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{chapter.title}</h3>
              <div className="flex flex-wrap gap-2">
                {chapter.assignments.map((assignment, index) => (
                  <Button
                    key={`assignment-${index}`}
                    color={selectedItem?.id === `${chapterIndex}-${index}` && selectedItem?.type === 'assignment' ? "primary" : "default"}
                    onClick={() => setSelectedItem({
                      type: 'assignment',
                      id: `${chapterIndex}-${index}`,
                      title: assignment.title,
                      chapterIndex,
                      itemIndex: index
                    })}
                    className="mb-2"
                  >
                    {assignment.title}
                  </Button>
                ))}
                {chapter.quizzes.map((quiz, index) => (
                  <Button
                    key={`quiz-${index}`}
                    color={selectedItem?.id === `${chapterIndex}-${index}` && selectedItem?.type === 'quiz' ? "primary" : "default"}
                    onClick={() => setSelectedItem({
                      type: 'quiz',
                      id: `${chapterIndex}-${index}`,
                      title: quiz.title,
                      chapterIndex,
                      itemIndex: index
                    })}
                    className="mb-2"
                  >
                    {quiz.title}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {!selectedItem ? (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              Please select a quiz or assignment to view submissions
            </div>
          ) : (
            students.map((student) => {
              const studentGrade = grades.find(g => g.studentId === student.id);
              const maxPoints = selectedItem ? (
                selectedItem.type === 'quiz' ? 
                  course?.chapters[selectedItem.chapterIndex].quizzes[selectedItem.itemIndex].totalPoints : 
                  course?.chapters[selectedItem.chapterIndex].assignments[selectedItem.itemIndex].totalPoints
              ) : 100;

              return (
                <div key={student.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <p className="text-xs text-gray-400">
                        {gradeStatuses[student.id]?.isGraded 
                          ? `Last updated: ${new Date(gradeStatuses[student.id].lastUpdated!).toLocaleString()}`
                          : 'Not graded yet'
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="font-medium text-gray-700">Grade:</label>
                        <input
                          type="number"
                          min="0"
                          max={maxPoints || 100}
                          value={studentGrade?.grade || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (Number(value) >= 0 && Number(value) <= (maxPoints || 100))) {
                              handleUpdateGrade(student.id, Number(value), studentGrade?.feedback || '');
                            }
                          }}
                          className="w-16 h-8 px-2 border border-gray-300 rounded text-center"
                        />
                        <span className="text-sm text-gray-500">/ {maxPoints || 100}</span>
                      </div>
                      
                      <Button
                        color="primary"
                        isDisabled={!selectedItem}
                        onClick={() => handleViewSubmission(student.id)}
                      >
                        View Submission
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
} 
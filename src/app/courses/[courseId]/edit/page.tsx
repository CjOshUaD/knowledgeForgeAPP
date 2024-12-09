"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from "@/app/components/NavBar";
import { Input, Button } from "@/app/components/ui";
import { toast } from 'react-hot-toast';

interface FileData {
  name: string;
  url: string;
  type: string;
  size: number;
}

type Quiz = {
  title: string;
  file?: FileData;
  questions: Question[];
  startDateTime: string;
  endDateTime: string;
  timeLimit?: number;
};

interface AssignmentQuestion {
  content: string;
  points: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  enrollmentKey?: string;
  chapters: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      files: FileData[];
    }>;
    assignments: Array<{
      title: string;
      content: string;
      startDateTime: string;
      endDateTime: string;
      dueDate: string;
      files: FileData[];
      totalPoints: number;
      questions: AssignmentQuestion[];
    }>;
    quizzes: Quiz[];
    files: FileData[];
  }>;
  files: FileData[];
}

interface Question {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options: string[];
  correctAnswer: boolean | '';
  points: number;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    type: 'multiple_choice',
    options: [''],
    correctAnswer: '',
    points: 1
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${params.courseId}`);
        setCourse(response.data);
      } catch (error: unknown) {
        setError('Failed to fetch course');
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!course) {
        throw new Error('Course data is missing');
      }

      // Simplify the quiz data structure
      const formattedCourse = {
        ...course,
        chapters: course.chapters.map(chapter => ({
          ...chapter,
          quizzes: chapter.quizzes.map(quiz => ({
            title: quiz.title || '',
            questions: Array.isArray(quiz.questions) ? quiz.questions : [],
            file: quiz.file || null
          }))
        }))
      };

      console.log('Sending course data:', JSON.stringify(formattedCourse, null, 2));

      const response = await axios.put(`/api/courses/${params.courseId}`, formattedCourse);
      console.log('Server response:', response.data);
      
      toast.success('Course updated successfully');
      router.push('/teacher');
    } catch (error: unknown) {
      console.error('Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update course';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const addChapter = () => {
    const newChapters = [...course!.chapters, { title: '', lessons: [], assignments: [], quizzes: [], files: [] }];
    setCourse({ ...course!, chapters: newChapters });
  };

  const addLesson = (chapterIndex: number) => {
    const newChapters = [...course!.chapters];
    newChapters[chapterIndex].lessons.push({ title: '', content: '', files: [] });
    setCourse({ ...course!, chapters: newChapters });
  };

  const addAssignment = (chapterIndex: number) => {
    const newChapters = [...course!.chapters];
    newChapters[chapterIndex].assignments.push({
      title: '',
      content: '',
      startDateTime: '',
      endDateTime: '',
      dueDate: '',
      files: [],
      totalPoints: 0,
      questions: []
    });
    setCourse({ ...course!, chapters: newChapters });
  };

  const addQuiz = (chapterIndex: number) => {
    const newChapters = [...course!.chapters];
    newChapters[chapterIndex].quizzes.push({
      title: '',
      questions: [],
      startDateTime: '',
      endDateTime: '',
      timeLimit: 60,
      file: undefined
    });
    setCourse({ ...course!, chapters: newChapters });
  };

  const deleteChapter = (chapterIndex: number) => {
    const newChapters = course!.chapters.filter((_, index) => index !== chapterIndex);
    setCourse({ ...course!, chapters: newChapters });
  };

  const deleteLesson = (chapterIndex: number, lessonIndex: number) => {
    const newChapters = [...course!.chapters];
    newChapters[chapterIndex].lessons = newChapters[chapterIndex].lessons.filter((_, index) => index !== lessonIndex);
    setCourse({ ...course!, chapters: newChapters });
  };

  const deleteAssignment = (chapterIndex: number, assignmentIndex: number) => {
    const newChapters = [...course!.chapters];
    newChapters[chapterIndex].assignments = newChapters[chapterIndex].assignments.filter((_, index) => index !== assignmentIndex);
    setCourse({ ...course!, chapters: newChapters });
  };

  const deleteQuiz = (chapterIndex: number, quizIndex: number) => {
    const newChapters = [...course!.chapters];
    newChapters[chapterIndex].quizzes = newChapters[chapterIndex].quizzes.filter((_, index) => index !== quizIndex);
    setCourse({ ...course!, chapters: newChapters });
  };

  const handleFileUpload = async (
    file: File,
    type: 'lesson' | 'assignment' | 'quiz',
    chapterIndex: number,
    itemIndex: number
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('chapterIndex', chapterIndex.toString());
      formData.append('itemIndex', itemIndex.toString());

      const response = await axios.post(`/api/courses/${params.courseId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.url && course) {
        const newFile: FileData = {
          name: file.name,
          url: response.data.url,
          type: type,
          size: file.size
        };

        const updatedCourse = { ...course };
        const chapter = updatedCourse.chapters[chapterIndex];

        switch (type) {
          case 'lesson':
            if (!chapter.lessons[itemIndex].files) {
              chapter.lessons[itemIndex].files = [];
            }
            chapter.lessons[itemIndex].files.push(newFile);
            break;
          case 'assignment':
            if (!chapter.assignments[itemIndex].files) {
              chapter.assignments[itemIndex].files = [];
            }
            chapter.assignments[itemIndex].files.push(newFile);
            break;
          case 'quiz':
            if (!chapter.quizzes[itemIndex].file) {
              chapter.quizzes[itemIndex].file = newFile;
            }
            break;
        }

        setCourse(updatedCourse);
        toast.success('File uploaded successfully');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to upload file');
        toast.error(error.response?.data?.error || 'Failed to upload file');
      } else {
        setError('Failed to upload file');
        toast.error('Failed to upload file');
      }
    }
  };

  const handleRemoveFile = async (
    chapterIndex: number,
    type: 'assignment' | 'lesson' | 'quiz',
    itemIndex: number,
    fileIndex: number
  ) => {
    try {
      const newChapters = [...course!.chapters];
      switch (type) {
        case 'assignment':
          newChapters[chapterIndex].assignments[itemIndex].files = 
            newChapters[chapterIndex].assignments[itemIndex].files.filter((_, index) => index !== fileIndex);
          break;
        case 'lesson':
          newChapters[chapterIndex].lessons[itemIndex].files = 
            newChapters[chapterIndex].lessons[itemIndex].files.filter((_, index) => index !== fileIndex);
          break;
      }

      // Update the course in the database
      await axios.put(`/api/courses/${params.courseId}`, { 
        ...course, 
        chapters: newChapters 
      });
      
      setCourse({ ...course!, chapters: newChapters });
    } catch (error) {
      console.error('Error removing file:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to remove file');
      } else {
        setError('Failed to remove file');
      }
    }
  };

  const handleQuestionTypeChange = (type: 'multiple_choice' | 'true_false' | 'essay') => {
    setCurrentQuestion({
      ...currentQuestion,
      type,
      options: type === 'multiple_choice' ? [''] : [],
      correctAnswer: type === 'true_false' ? false : '',
      points: 1
    });
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), '']
    }));
  };

  const handleAddQuestion = (chapterIndex: number, quizIndex: number) => {
    if (!currentQuestion.question) {
      toast.error('Question text is required');
      return;
    }

    const newChapters = [...course!.chapters];
    newChapters[chapterIndex].quizzes[quizIndex].questions.push(currentQuestion);
    setCourse({ ...course!, chapters: newChapters });

    // Reset current question
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: [''],
      correctAnswer: '',
      points: 1
    });
    toast.success('Question added to quiz');
  };

  const handleManageGrades = (chapterIndex: number, itemIndex: number, type: 'quiz' | 'assignment') => {
    router.push(`/courses/${params.courseId}/grades?type=${type}&chapterIndex=${chapterIndex}&itemIndex=${itemIndex}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Edit Course</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-white/50"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Info */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-6">Course Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <Input
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  size="lg"
                  variant="bordered"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white"
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description
                </label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Enter course description..."
                  className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                    resize-y bg-white text-base shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Key
                </label>
                <Input
                  value={course.enrollmentKey || ''}
                  onChange={(e) => setCourse({ ...course, enrollmentKey: e.target.value })}
                  placeholder="Optional: Add an enrollment key"
                  size="lg"
                  variant="bordered"
                  classNames={{
                    input: "bg-white",
                    inputWrapper: "bg-white border-2 border-gray-200 hover:border-blue-500 focus:border-blue-500"
                  }}
                />
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500">
                    Leave empty for public access, or add a key to restrict enrollment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Chapters</h2>
              <Button 
                onClick={addChapter}
                color="primary"
                size="lg"
                className="font-semibold px-6"
              >
                + Add Chapter
              </Button>
            </div>

            {/* Chapter content */}
            <div className="space-y-8">
              {course.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                  {/* Chapter header */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-2">
                      Chapter Title
                    </label>
                    <Input
                      value={chapter.title}
                      onChange={(e) => {
                        const newChapters = [...course.chapters];
                        newChapters[chapterIndex].title = e.target.value;
                        setCourse({ ...course, chapters: newChapters });
                      }}
                      placeholder="Enter chapter title"
                      size="lg"
                      className="text-lg"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-4 mb-6">
                    <Button 
                      onClick={() => addLesson(chapterIndex)}
                      color="primary"
                      className="flex-1 font-semibold text-md py-2"
                    >
                      + Add Lesson
                    </Button>
                    <Button 
                      onClick={() => addAssignment(chapterIndex)} 
                      color="warning"
                      className="flex-1 font-semibold text-md py-2 text-white"
                    >
                      + Add Assignment
                    </Button>
                    <Button 
                      onClick={() => addQuiz(chapterIndex)}
                      color="success"
                      className="flex-1 font-semibold text-md py-2 text-white"
                    >
                      + Add Quiz
                    </Button>
                    <Button 
                      onClick={() => deleteChapter(chapterIndex)}
                      color="danger"
                      className="font-semibold text-md py-2"
                    >
                      Delete Chapter
                    </Button>
                  </div>

                  {/* Sections */}
                  <div className="space-y-6">
                    {/* Lessons Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Lessons</h3>
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <Input
                              value={lesson.title}
                              onChange={(e) => {
                                const newChapters = [...course.chapters];
                                newChapters[chapterIndex].lessons[lessonIndex].title = e.target.value;
                                setCourse({ ...course, chapters: newChapters });
                              }}
                              placeholder="Lesson title"
                              size="lg"
                              className="flex-1 mr-4 text-lg"
                            />
                            <Button 
                              color="danger"
                              size="lg"
                              onClick={() => deleteLesson(chapterIndex, lessonIndex)}
                              className="font-semibold"
                            >
                              Delete Lesson
                            </Button>
                          </div>
                          <textarea
                            value={lesson.content}
                            onChange={(e) => {
                              const newChapters = [...course.chapters];
                              newChapters[chapterIndex].lessons[lessonIndex].content = e.target.value;
                              setCourse({ ...course, chapters: newChapters });
                            }}
                            placeholder="Enter lesson content..."
                            className="w-full min-h-[200px] p-4 border-2 border-gray-200 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                              resize-y bg-white text-base shadow-sm"
                          />
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Lesson Files
                            </label>
                            <input
                              type="file"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(e.target.files[0], 'lesson', chapterIndex, lessonIndex);
                                }
                              }}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {/* Display existing files */}
                            {lesson.files?.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between mt-2">
                                <a 
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {file.name}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(chapterIndex, 'lesson', lessonIndex, fileIndex)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Assignments Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Assignments</h3>
                      {chapter.assignments.map((assignment, assignmentIndex) => (
                        <div key={assignmentIndex} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                            <div className="flex items-center justify-between gap-4">
                              {/* Left side - Title */}
                              <div className="flex-grow">
                                <Input
                                  value={assignment.title}
                                  onChange={(e) => {
                                    const newChapters = [...course.chapters];
                                    newChapters[chapterIndex].assignments[assignmentIndex].title = e.target.value;
                                    setCourse({ ...course, chapters: newChapters });
                                  }}
                                  placeholder="Assignment title"
                                  size="lg"
                                />
                              </div>

                              {/* Right side - Points and Delete */}
                              <div className="flex items-center gap-4 min-w-[300px]">
                                <div className="flex items-center gap-2">
                                  <label className="whitespace-nowrap text-sm font-medium text-gray-600">
                                    Total Points:
                                  </label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={assignment.totalPoints?.toString() || "0"}
                                    onChange={(e) => {
                                      const newChapters = [...course.chapters];
                                      newChapters[chapterIndex].assignments[assignmentIndex].totalPoints = Number(e.target.value);
                                      setCourse({ ...course, chapters: newChapters });
                                    }}
                                    className="w-24"
                                  />
                                </div>
                                <Button 
                                  color="danger"
                                  onClick={() => deleteAssignment(chapterIndex, assignmentIndex)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Assignment Time Settings */}
                          <div className="grid grid-cols-2 gap-4 mb-4 bg-white p-4 rounded-lg border border-gray-100">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Opens
                              </label>
                              <Input
                                type="datetime-local"
                                value={assignment.startDateTime}
                                onChange={(e) => {
                                  const newChapters = [...course.chapters];
                                  newChapters[chapterIndex].assignments[assignmentIndex].startDateTime = e.target.value;
                                  setCourse({ ...course, chapters: newChapters });
                                }}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Closes
                              </label>
                              <Input
                                type="datetime-local"
                                value={assignment.endDateTime}
                                onChange={(e) => {
                                  const newChapters = [...course.chapters];
                                  newChapters[chapterIndex].assignments[assignmentIndex].endDateTime = e.target.value;
                                  setCourse({ ...course, chapters: newChapters });
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>

                          {/* Assignment Questions */}
                          <div className="space-y-4">
                            {assignment.questions?.map((question, questionIndex) => (
                              <div key={questionIndex} className="bg-white p-4 rounded-lg border border-gray-100">
                                <div className="flex gap-4 mb-2">
                                  <Input
                                    value={question.content}
                                    onChange={(e) => {
                                      const newChapters = [...course.chapters];
                                      newChapters[chapterIndex].assignments[assignmentIndex].questions[questionIndex].content = e.target.value;
                                      setCourse({ ...course, chapters: newChapters });
                                    }}
                                    placeholder="Question text"
                                    className="flex-grow"
                                  />
                                  <div className="w-32">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                      Points
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={question.points?.toString() || "0"}
                                      onChange={(e) => {
                                        const newChapters = [...course.chapters];
                                        newChapters[chapterIndex].assignments[assignmentIndex].questions[questionIndex].points = Number(e.target.value);
                                        setCourse({ ...course, chapters: newChapters });
                                      }}
                                      className="w-full"
                                    />
                                  </div>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => {
                                      const newChapters = [...course.chapters];
                                      newChapters[chapterIndex].assignments[assignmentIndex].questions = 
                                        assignment.questions.filter((_, idx) => idx !== questionIndex);
                                      setCourse({ ...course, chapters: newChapters });
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            <Button
                              color="primary"
                              onClick={() => {
                                const newChapters = [...course.chapters];
                                if (!newChapters[chapterIndex].assignments[assignmentIndex].questions) {
                                  newChapters[chapterIndex].assignments[assignmentIndex].questions = [];
                                }
                                newChapters[chapterIndex].assignments[assignmentIndex].questions.push({
                                  content: '',
                                  points: 1
                                });
                                setCourse({ ...course, chapters: newChapters });
                              }}
                            >
                              Add Question
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quizzes Section */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Quizzes</h3>
                      {chapter.quizzes.map((quiz, quizIndex) => (
                        <div key={quizIndex} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center">
                            <Input
                              value={quiz.title}
                              onChange={(e) => {
                                const newChapters = [...course.chapters];
                                newChapters[chapterIndex].quizzes[quizIndex].title = e.target.value;
                                setCourse({ ...course, chapters: newChapters });
                              }}
                              placeholder="Quiz title"
                              size="lg"
                              className="flex-1 mr-4 text-lg"
                            />
                            <div className="flex gap-4 mt-4">
                              <Button 
                                color="primary"
                                onClick={() => handleManageGrades(chapterIndex, quizIndex, 'quiz')}
                                className="font-semibold"
                              >
                                Manage Grades
                              </Button>
                              <Button 
                                color="danger"
                                onClick={() => deleteQuiz(chapterIndex, quizIndex)}
                                className="font-semibold"
                              >
                                Delete Quiz
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quiz File
                            </label>
                            <input
                              type="file"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(e.target.files[0], 'quiz', chapterIndex, quizIndex);
                                }
                              }}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {/* Display existing file */}
                            {quiz.file && (
                              <div className="flex items-center justify-between mt-2">
                                <a 
                                  href={quiz.file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {quiz.file.name}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(chapterIndex, 'quiz', quizIndex, 0)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={quiz.startDateTime}
                                onChange={(e) => {
                                  const newChapters = [...course!.chapters];
                                  newChapters[chapterIndex].quizzes[quizIndex].startDateTime = e.target.value;
                                  setCourse({ ...course!, chapters: newChapters });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={quiz.endDateTime}
                                onChange={(e) => {
                                  const newChapters = [...course!.chapters];
                                  newChapters[chapterIndex].quizzes[quizIndex].endDateTime = e.target.value;
                                  setCourse({ ...course!, chapters: newChapters });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Limit (minutes)
                              </label>
                              <input
                                type="number"
                                value={quiz.timeLimit || 60}
                                min="1"
                                onChange={(e) => {
                                  const newChapters = [...course!.chapters];
                                  newChapters[chapterIndex].quizzes[quizIndex].timeLimit = Number(e.target.value);
                                  setCourse({ ...course!, chapters: newChapters });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          {/* Add Question Form */}
                          <div className="mt-4 space-y-4">
                            <select
                              value={currentQuestion.type}
                              onChange={(e) => handleQuestionTypeChange(e.target.value as 'multiple_choice' | 'true_false' | 'essay')}
                              className="w-full p-2 border rounded"
                            >
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="true_false">True/False</option>
                              <option value="essay">Essay</option>
                            </select>

                            <input
                              type="text"
                              name="question"
                              value={currentQuestion.question}
                              onChange={handleQuestionChange}
                              placeholder="Question text"
                              className="w-full p-2 border rounded"
                            />

                            {currentQuestion.type === 'multiple_choice' && (
                              <div className="space-y-2">
                                {currentQuestion.options?.map((option, index) => (
                                  <div key={index} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => handleOptionChange(index, e.target.value)}
                                      placeholder={`Option ${index + 1}`}
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                ))}
                                <Button onClick={addOption} className="mt-2">
                                  Add Option
                                </Button>
                              </div>
                            )}

                            {currentQuestion.type === 'true_false' && (
                              <div className="flex gap-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={currentQuestion.correctAnswer === true}
                                    onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: true }))}
                                    className="mr-2"
                                  />
                                  True
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={currentQuestion.correctAnswer === false}
                                    onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: false }))}
                                    className="mr-2"
                                  />
                                  False
                                </label>
                              </div>
                            )}

                            <input
                              type="number"
                              name="points"
                              value={currentQuestion.points}
                              onChange={handleQuestionChange}
                              placeholder="Points"
                              className="w-full p-2 border rounded"
                              min="1"
                            />

                            <Button onClick={() => handleAddQuestion(chapterIndex, quizIndex)} className="w-full">
                              Add Question
                            </Button>
                          </div>

                          {/* Display Questions */}
                          {quiz.questions.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                              <h4 className="font-medium mb-2">Questions ({quiz.questions.length})</h4>
                              <div className="space-y-2">
                                {quiz.questions.map((q, qIndex) => (
                                  <div key={qIndex} className="p-3 bg-white rounded border">
                                    <p className="font-medium">Question {qIndex + 1}: {q.question}</p>
                                    <p className="text-sm text-gray-600">Type: {q.type} | Points: {q.points}</p>
                                    <Button 
                                      color="danger" 
                                      size="sm" 
                                      onClick={() => {
                                        const newChapters = [...course.chapters];
                                        newChapters[chapterIndex].quizzes[quizIndex].questions = 
                                          quiz.questions.filter((_, i) => i !== qIndex);
                                        setCourse({ ...course, chapters: newChapters });
                                      }}
                                      className="mt-2"
                                    >
                                      Delete Question
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button 
              color="danger" 
              variant="light"
              size="lg"
              onClick={() => router.back()}
              className="font-semibold px-8"
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              type="submit"
              size="lg"
              className="font-semibold px-8"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
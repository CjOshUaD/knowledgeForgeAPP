'use client';

import { useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
interface Lesson {
  title: string;
  content: string;
  order?: number;
  files?: FileData[];
}

interface CourseFile {
  name: string;
  file: File;
  type: string;
}

interface Assignment {
  title: string;
  description: string;
  dueDate: string;
  startDateTime: string;
  endDateTime: string;
  files?: CourseFile[];
}

interface QuizQuestion {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer?: string | boolean;
  points: number;
}

interface Quiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
  startDateTime: string;
  endDateTime: string;
  duration: number;
  totalPoints: number;
  files?: FileData[];
  questionCount: number;
}

interface Chapter {
  _id?: string;
  title: string;
  order: number;
  lessons: Lesson[];
  assignments: Assignment[];
  quizzes: Quiz[];
}

interface NewLesson {
  title: string;
  content: string;
}

interface NewAssignment {
  title: string;
  content: string;
  startDateTime: string;
  endDateTime: string;
}

interface NewChapter {
  title: string;
  lessons: Lesson[];
  assignments: Assignment[];
}

interface ContentModalState {
  isOpen: boolean;
  type: 'lesson' | 'assignment' | 'quiz' | null;
  chapterIndex: number;
}

interface FileData {
  name: string;
  url?: string;
  type: string;
  file?: File;
}

interface FileStats {
  course: number;
  lessons: number;
  assignments: number;
  quizzes: number;
  total: number;
}

interface CreateCourseCardProps {
  onSuccess: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

interface Grade {
  studentId: string;
  grade: number;
  feedback?: string;
  updatedAt: string;
}

interface Course {
  title: string;
  description: string;
  enrollmentKey?: string;
  chapters: Chapter[];
  files: FileData[];
  grades?: Grade[];
}

interface Question {
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer?: string | boolean;
  points: number;
}

export default function CreateCourseCard({ onSuccess, onOpenChange }: CreateCourseCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Course basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [enrollmentKey, setEnrollmentKey] = useState('');
  
  // Chapter management
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapter, setNewChapter] = useState<NewChapter>({
    title: '',
    lessons: [],
    assignments: []
  });

  // Lesson management
  const [newLesson, setNewLesson] = useState<NewLesson>({
    title: '',
    content: ''
  });

  // Assignment management
  const [newAssignment, setNewAssignment] = useState<NewAssignment>({
    title: '',
    content: '',
    startDateTime: '',
    endDateTime: ''
  });

  // Files management
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [fileStats, setFileStats] = useState<FileStats>({
    course: 0,
    lessons: 0,
    assignments: 0,
    quizzes: 0,
    total: 0
  });

  // Quiz management
  const [newQuiz, setNewQuiz] = useState<Quiz>({
    title: '',
    description: '',
    questions: [],
    startDateTime: '',
    endDateTime: '',
    duration: 0,
    totalPoints: 0,
    questionCount: 0
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    type: 'multiple_choice',
    options: [''],
    correctAnswer: '',
    points: 1
  });

  const [contentModal, setContentModal] = useState<ContentModalState>({
    isOpen: false,
    type: null,
    chapterIndex: -1
  });

  const handleAddContent = (chapterIndex: number, type: 'lesson' | 'assignment' | 'quiz') => {
    setContentModal({ isOpen: true, type, chapterIndex });
    setError('');
  };

  // Handlers
  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    const [baseType] = fileToRemove.type.split('-');
    const contentType = baseType as keyof Omit<FileStats, 'total'>;
    
    setFiles(files.filter((_, i) => i !== index));
    
    setFileStats(prev => ({
      ...prev,
      [contentType]: Math.max(0, prev[contentType] - 1),
      total: Math.max(0, prev.total - 1)
    }));
  };

  const handleAddChapter = () => {
    if (!newChapter.title) {
      setError('Chapter title is required');
      return;
    }

    setChapters([
      ...chapters,
      {
        ...newChapter,
        order: chapters.length,
        lessons: [],
        assignments: [],
        quizzes: []
      }
    ]);
    setNewChapter({ title: '', lessons: [], assignments: [] });
    setError('');
  };

  const handleAddLessonToChapter = (chapterIndex: number) => {
    if (!newLesson.title || !newLesson.content) {
      setError('Please fill in both lesson title and content');
      return;
    }

    const lessonFiles = files.filter(f => f.type.startsWith(`lesson-${getChapterId(chapterIndex)}`));
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons.push({
      ...newLesson,
      order: updatedChapters[chapterIndex].lessons.length,
      files: lessonFiles
    });

    setChapters(updatedChapters);
    setNewLesson({ title: '', content: '' });
    setError('');
  };

  const calculateDuration = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleAddAssignmentToChapter = (chapterIndex: number) => {
    if (!newAssignment.title || !newAssignment.content || 
        !newAssignment.startDateTime || !newAssignment.endDateTime) {
      setError('Please fill in all assignment fields');
      return;
    }

    const assignmentFiles = files.filter(f => f.type.startsWith(`assignment-${getChapterId(chapterIndex)}`));
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].assignments.push({
      title: newAssignment.title,
      description: newAssignment.content,
      dueDate: newAssignment.endDateTime,
      startDateTime: newAssignment.startDateTime,
      endDateTime: newAssignment.endDateTime,
      files: assignmentFiles
    });

    setChapters(updatedChapters);
    setNewAssignment({
      title: '',
      content: '',
      startDateTime: '',
      endDateTime: ''
    });
    setError('');
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

  const handleAddQuestion = () => {
    if (!currentQuestion.question) {
      toast.error('Question text is required');
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: [''],
      correctAnswer: '',
      points: 1
    });
    toast.success('Question added');
  };

  const handleAddQuizToChapter = (chapterIndex: number) => {
    if (!newQuiz.title || !newQuiz.description || 
        !newQuiz.startDateTime || !newQuiz.endDateTime || 
        !newQuiz.duration) {
      setError('Please fill in all quiz fields');
      return;
    }

    const quizFiles = files.filter(f => f.type.startsWith(`quiz-${getChapterId(chapterIndex)}`));
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].quizzes.push({
      title: newQuiz.title,
      description: newQuiz.description,
      questions: questions,
      startDateTime: newQuiz.startDateTime,
      endDateTime: newQuiz.endDateTime,
      duration: newQuiz.duration,
      totalPoints,
      files: quizFiles,
      questionCount: questions.length
    });

    setChapters(updatedChapters);
    setNewQuiz({
      title: '',
      description: '',
      questions: [],
      startDateTime: '',
      endDateTime: '',
      duration: 0,
      totalPoints: 0,
      questionCount: 0
    });
    setQuestions([]);
    setContentModal({ isOpen: false, type: null, chapterIndex: -1 });
    toast.success(`Quiz saved with ${questions.length} questions`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const courseData: Course = {
      title,
      description,
      enrollmentKey,
      chapters,
      files,
      grades: []
    };

    try {
      const response = await axios.post('/api/courses', courseData);

      if (response.status === 201) {
        setIsOpen(false);
        onOpenChange(false);
        resetForm();
        onSuccess();
        toast.success('Course created successfully');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      setError('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  // Add a resetForm function to clear the form state
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEnrollmentKey('');
    setChapters([]);
    setFiles([]);
    setNewChapter({ title: '', lessons: [], assignments: [] });
    setNewLesson({ title: '', content: '' });
    setNewAssignment({
      title: '',
      content: '',
      startDateTime: '',
      endDateTime: ''
    });
    setNewQuiz({
      title: '',
      description: '',
      questions: [],
      startDateTime: '',
      endDateTime: '',
      duration: 0,
      totalPoints: 0,
      questionCount: 0
    });
    setError('');
    setFileStats({
      course: 0,
      lessons: 0,
      assignments: 0,
      quizzes: 0,
      total: 0
    });
  };

  const handleFileUpload = (
    file: File, 
    contentType: keyof Omit<FileStats, 'total'>, 
    chapterIndex?: number
  ) => {
    const fileType = chapterIndex !== undefined 
      ? `${contentType}-${getChapterId(chapterIndex)}`
      : 'course';

    const newFile: CourseFile = {
      name: file.name,
      file: file,
      type: fileType
    };

    setFiles(prev => [...prev, newFile]);
    
    setFileStats(prev => {
      const typeToUpdate = chapterIndex !== undefined ? contentType : 'course';
      return {
        ...prev,
        [typeToUpdate]: prev[typeToUpdate] + 1,
        total: prev.total + 1
      };
    });
  };

  // Add this helper function at the top of your component
  const getChapterId = (chapterIndex: number) => {
    return chapters[chapterIndex]?._id || `temp-${chapterIndex}`;
  };

  // Add a FileTracker component to show current files
  const FileTracker = () => {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Attached Files</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <div className="text-center p-2 bg-blue-50 rounded">
            <span className="text-sm font-semibold text-blue-600">{fileStats.course}</span>
            <p className="text-xs text-blue-600">Course Files</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <span className="text-sm font-semibold text-green-600">{fileStats.lessons}</span>
            <p className="text-xs text-green-600">Lesson Files</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <span className="text-sm font-semibold text-purple-600">{fileStats.assignments}</span>
            <p className="text-xs text-purple-600">Assignment Files</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <span className="text-sm font-semibold text-yellow-600">{fileStats.quizzes}</span>
            <p className="text-xs text-yellow-600">Quiz Files</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
            <span className="text-sm font-semibold text-gray-600">{fileStats.total}</span>
            <p className="text-xs text-gray-600">Total Files</p>
          </div>
        </div>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{file.name}</span>
                <span className="text-xs text-gray-400">({file.type})</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create New Course
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Course</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Course Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enrollment Key (Optional)
                </label>
                <input
                  type="text"
                  value={enrollmentKey}
                  onChange={(e) => setEnrollmentKey(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            
              {/* Chapters Section */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-medium mb-4">Chapters</h4>
                
                {/* Add New Chapter Form */}
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <h5 className="font-medium mb-3">Add New Chapter</h5>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Chapter Title"
                      value={newChapter.title}
                      onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={handleAddChapter}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add Chapter
                    </button>
                  </div>
                </div>

                {/* List of Added Chapters */}
                {chapters.map((chapter, chapterIndex) => (
                  <div key={chapterIndex} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-lg font-medium">{chapter.title}</h5>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedChapters = chapters.filter((_, i) => i !== chapterIndex);
                          setChapters(updatedChapters);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove Chapter
                      </button>
                    </div>

                    {/* Content Type Buttons */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => handleAddContent(chapterIndex, 'lesson')}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Add Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddContent(chapterIndex, 'assignment')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Add Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddContent(chapterIndex, 'quiz')}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Add Quiz
                      </button>
                    </div>

                    {/* Display existing content */}
                    <div className="space-y-4">
                      {/* Lessons */}
                      {chapter.lessons.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded">
                          <h6 className="font-medium mb-2">Lessons</h6>
                          {chapter.lessons.map((lesson, index) => (
                            <div key={index} className="mb-2 p-2 bg-white rounded">
                              <h6 className="font-medium">{lesson.title}</h6>
                              <p className="text-sm text-gray-600">{lesson.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Assignments */}
                      {chapter.assignments.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded">
                          <h6 className="font-medium mb-2">Assignments</h6>
                          {chapter.assignments.map((assignment, index) => (
                            <div key={index} className="mb-2 p-2 bg-white rounded">
                              <h6 className="font-medium">{assignment.title}</h6>
                              <p className="text-sm text-gray-600">{assignment.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Due: {new Date(assignment.dueDate).toLocaleString()}
                                <span className="ml-2">
                                  Duration: {calculateDuration(assignment.startDateTime, assignment.endDateTime)}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quizzes */}
                      {chapter.quizzes.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded">
                          <h6 className="font-medium mb-2">Quizzes</h6>
                          {chapter.quizzes.map((quiz, index) => (
                            <div key={index} className="mb-2 p-2 bg-white rounded">
                              <h6 className="font-medium">{quiz.title}</h6>
                              <p className="text-sm text-gray-600">{quiz.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Questions: {quiz.questions.length} | Points: {quiz.totalPoints}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add FileTracker to your form */}
              {files.length > 0 && <FileTracker />}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </span>
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {contentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Add {contentModal.type?.charAt(0).toUpperCase()}{contentModal.type?.slice(1)}
              </h3>
              <button
                onClick={() => setContentModal({ isOpen: false, type: null, chapterIndex: -1 })}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {contentModal.type === 'lesson' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Lesson Title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Lesson Content"
                  value={newLesson.content}
                  onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                  className="w-full p-2 border rounded h-32"
                />
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">Attach File (optional)</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, 'lessons', contentModal.chapterIndex);
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => handleAddLessonToChapter(contentModal.chapterIndex)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Lesson
                </button>
              </div>
            )}

            {contentModal.type === 'assignment' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Assignment Title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Assignment Content"
                  value={newAssignment.content}
                  onChange={(e) => setNewAssignment({ ...newAssignment, content: e.target.value })}
                  className="w-full p-2 border rounded h-32"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={newAssignment.startDateTime}
                      onChange={(e) => setNewAssignment({ ...newAssignment, startDateTime: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={newAssignment.endDateTime}
                      onChange={(e) => setNewAssignment({ ...newAssignment, endDateTime: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">Attach File (optional)</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file, 'assignments', contentModal.chapterIndex);
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => handleAddAssignmentToChapter(contentModal.chapterIndex)}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Assignment
                </button>
              </div>
            )}

            {contentModal.type === 'quiz' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Quiz Title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Quiz Description"
                  value={newQuiz.description}
                  onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                  className="w-full p-2 border rounded h-32"
                />
                
                {/* Question Form */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Add Question</h4>
                  <div className="space-y-3">
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
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={currentQuestion.correctAnswer === option}
                              onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: option }))}
                              className="mt-3"
                            />
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={addOption}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Add Option
                        </button>
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

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Display added questions */}
                {questions.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">
                      Questions Added ({questions.length})
                    </h4>
                    <div className="space-y-2">
                      {questions.map((q, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <p className="font-medium">Question {index + 1}: {q.question}</p>
                          <p className="text-sm text-gray-600">Type: {q.type} | Points: {q.points}</p>
                        </div>
                      ))}
                      <p className="text-sm text-gray-500">Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleAddQuizToChapter(contentModal.chapterIndex)}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 
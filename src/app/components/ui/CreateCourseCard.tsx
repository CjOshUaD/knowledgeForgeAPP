'use client';

import { useState } from 'react';
import axios from 'axios';

interface Lesson {
  title: string;
  content: string;
  order: number;
  files?: FileData[];
}

interface CourseFile {
  name: string;
  file: File;
  type: string;
}

interface Assignment {
  title: string;
  content: string;
  startDateTime: string;
  endDateTime: string;
  files?: FileData[];
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
}

interface Chapter {
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

export default function CreateCourseCard({ onSuccess }: { onSuccess: () => void }) {
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
  const [fileStats, setFileStats] = useState({
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
    totalPoints: 0
  });

  const [newQuestion, setNewQuestion] = useState<QuizQuestion>({
    question: '',
    type: 'multiple_choice',
    options: [''],
    correctAnswer: '',
    points: 1
  });

  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);

  const [contentModal, setContentModal] = useState<ContentModalState>({
    isOpen: false,
    type: null,
    chapterIndex: -1
  });

  const handleAddContent = (chapterIndex: number, type: string) => {
    setCurrentChapterIndex(chapterIndex);
    setSelectedContentType(type);
    setShowContentModal(true);
  };

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: CourseFile[] = Array.from(selectedFiles).map(file => ({
      name: file.name,
      file: file,
      type: file.type
    }));

    setFiles([...files, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    const contentType = fileToRemove.type.split('-')[0];
    
    setFiles(files.filter((_, i) => i !== index));
    
    // Update file stats
    setFileStats(prev => ({
      ...prev,
      [contentType + 's']: prev[contentType + 's'] - 1,
      total: prev.total - 1
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
      ...newAssignment,
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
    setNewQuestion({
      ...newQuestion,
      type,
      options: type === 'multiple_choice' ? [''] : [],
      correctAnswer: type === 'true_false' ? false : '',
      points: 1
    });
  };

  const handleAddQuestionToQuiz = () => {
    if (!newQuestion.question || newQuestion.points < 1) {
      setError('Please enter a question and valid points');
      return;
    }

    let isValid = true;
    let errorMessage = '';

    switch (newQuestion.type) {
      case 'multiple_choice':
        if (!newQuestion.options || newQuestion.options.length < 2) {
          isValid = false;
          errorMessage = 'Multiple choice questions need at least 2 options';
        } else if (!newQuestion.correctAnswer) {
          isValid = false;
          errorMessage = 'Please select a correct answer';
        }
        break;
      case 'true_false':
        if (typeof newQuestion.correctAnswer !== 'boolean') {
          isValid = false;
          errorMessage = 'Please select true or false';
        }
        break;
      case 'essay':
        // Essay questions don't need a correct answer
        break;
    }

    if (!isValid) {
      setError(errorMessage);
      return;
    }

    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset question form
    setNewQuestion({
      question: '',
      type: 'multiple_choice',
      options: [''],
      correctAnswer: '',
      points: 1
    });
    setError('');
  };

  const handleAddQuizToChapter = (chapterIndex: number) => {
    if (!newQuiz.title || !newQuiz.description || 
        !newQuiz.startDateTime || !newQuiz.endDateTime || 
        !newQuiz.duration || newQuiz.questions.length === 0) {
      setError('Please fill in all quiz fields and add at least one question');
      return;
    }

    const quizFiles = files.filter(f => f.type.startsWith(`quiz-${getChapterId(chapterIndex)}`));
    const totalPoints = newQuiz.questions.reduce((sum, q) => sum + q.points, 0);

    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].quizzes.push({
      ...newQuiz,
      totalPoints,
      files: quizFiles
    });

    setChapters(updatedChapters);
    setNewQuiz({
      title: '',
      description: '',
      questions: [],
      startDateTime: '',
      endDateTime: '',
      duration: 0,
      totalPoints: 0
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!title.trim()) {
        setError('Course title is required');
        return;
      }
      if (!description.trim()) {
        setError('Course description is required');
        return;
      }
      if (chapters.length === 0) {
        setError('At least one chapter is required');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('enrollmentKey', enrollmentKey);
      formData.append('chapters', JSON.stringify(chapters));

      // Add files to formData
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file.file);
        formData.append(`fileMetadata-${index}`, JSON.stringify({
          name: file.name,
          type: file.type
        }));
      });
      formData.append('fileCount', files.length.toString());

      console.log('Submitting course data:', {
        title,
        description,
        chaptersCount: chapters.length,
        filesCount: files.length
      });

      const response = await axios.post('/api/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Server response:', response.data);

      if (response.status === 201) {
        onSuccess();
        setIsOpen(false);
      }
    } catch (err: any) {
      console.error('Error creating course:', err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to create course');
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
      totalPoints: 0
    });
    setError('');
    setFileStats({
      lessons: 0,
      assignments: 0,
      quizzes: 0,
      total: 0
    });
  };

  const handleShowContentForm = (type: 'lesson' | 'assignment' | 'quiz', chapterIndex: number) => {
    setContentModal({ isOpen: true, type, chapterIndex });
    setError('');
  };

  const handleFileUpload = (file: File, contentType: 'lesson' | 'assignment' | 'quiz', chapterIndex: number) => {
    const fileType = `${contentType}-${getChapterId(chapterIndex)}`;
    const newFile: CourseFile = {
      name: file.name,
      file: file,
      type: fileType
    };

    setFiles(prev => [...prev, newFile]);
    setFileStats(prev => ({
      ...prev,
      [contentType + 's']: prev[contentType + 's'] + 1,
      total: prev.total + 1
    }));
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
                onClick={() => setIsOpen(false)}
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
                        onClick={() => handleShowContentForm('lesson', chapterIndex)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Add Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShowContentForm('assignment', chapterIndex)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Add Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShowContentForm('quiz', chapterIndex)}
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
                              <p className="text-sm text-gray-600">{assignment.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Due: {new Date(assignment.endDateTime).toLocaleString()}
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
                        handleFileUpload(file, 'lesson', getChapterId(contentModal.chapterIndex));
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
                        handleFileUpload(file, 'assignment', getChapterId(contentModal.chapterIndex));
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
                {/* ... (keep existing quiz form fields) ... */}
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">Attach Files (optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      newFiles.forEach(file => {
                        handleFileUpload(file, 'quiz', getChapterId(contentModal.chapterIndex));
                      });
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  onClick={() => handleAddQuizToChapter(contentModal.chapterIndex)}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Add Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 
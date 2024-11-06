'use client';

import { useState } from 'react';
import axios from 'axios';

interface Lesson {
  title: string;
  content: string;
  order: number;
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
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setFiles(files.filter((_, i) => i !== index));
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

    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].lessons.push({
      ...newLesson,
      order: updatedChapters[chapterIndex].lessons.length
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

    if (new Date(newAssignment.endDateTime) <= new Date(newAssignment.startDateTime)) {
      setError('End date must be after start date');
      return;
    }

    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].assignments.push({
      ...newAssignment
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

    // Calculate total points from questions
    const totalPoints = newQuiz.questions.reduce((sum, q) => sum + q.points, 0);

    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].quizzes.push({
      ...newQuiz,
      totalPoints
    });

    setChapters(updatedChapters);
    
    // Reset the form
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      setError('Course title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create the course data object
      const courseData = {
        title,
        description,
        enrollmentKey,
        chapters: chapters.map(chapter => ({
          title: chapter.title,
          order: chapter.order,
          lessons: chapter.lessons,
          assignments: chapter.assignments,
          quizzes: chapter.quizzes
        }))
      };

      // Send the course data to your API
      const response = await axios.post('/api/courses', courseData);

      // Handle file uploads if any
      if (files.length > 0) {
        const courseId = response.data._id;
        const formData = new FormData();
        
        files.forEach(file => {
          formData.append('files', file.file);
        });

        await axios.post(`/api/courses/${courseId}/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          }
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setEnrollmentKey('');
      setChapters([]);
      setFiles([]);
      setError('');
      setIsOpen(false);
      
      // Call success callback
      onSuccess();

    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
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

            <form onSubmit={handleCreateCourse} className="space-y-6">
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

                    {/* Lessons Section */}
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <h6 className="font-medium mb-2">Lessons</h6>
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="mb-2 p-2 bg-white rounded">
                          <h6 className="font-medium">{lesson.title}</h6>
                          <p className="text-sm text-gray-600">{lesson.content}</p>
                        </div>
                      ))}

                      {/* Add Lesson Form */}
                      <div className="mt-2 space-y-2">
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
                          className="w-full p-2 border rounded h-20"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddLessonToChapter(chapterIndex)}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Add Lesson
                        </button>
                      </div>
                    </div>

                    {/* Assignments Section */}
                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <h6 className="font-medium mb-2">Assignments</h6>
                      
                      {/* Display existing assignments */}
                      {chapter.assignments?.map((assignment, assignmentIndex) => (
                        <div key={assignmentIndex} className="mb-2 p-2 bg-white rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-medium">{assignment.title}</h6>
                              <p className="text-sm text-gray-600">{assignment.content}</p>
                            </div>
                            <button
                              onClick={() => {
                                const updatedChapters = [...chapters];
                                updatedChapters[chapterIndex].assignments = 
                                  updatedChapters[chapterIndex].assignments.filter((_, i) => i !== assignmentIndex);
                                setChapters(updatedChapters);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            <div>
                              <span className="font-medium">Start:</span> {new Date(assignment.startDateTime).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">End:</span> {new Date(assignment.endDateTime).toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {calculateDuration(assignment.startDateTime, assignment.endDateTime)}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Assignment Form */}
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Assignment Title"
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment({ 
                            ...newAssignment, 
                            title: e.target.value 
                          })}
                          className="w-full p-2 border rounded"
                        />
                        
                        <textarea
                          placeholder="Assignment Content"
                          value={newAssignment.content}
                          onChange={(e) => setNewAssignment({ 
                            ...newAssignment, 
                            content: e.target.value 
                          })}
                          className="w-full p-2 border rounded h-20"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={newAssignment.startDateTime}
                              onChange={(e) => setNewAssignment({
                                ...newAssignment,
                                startDateTime: e.target.value
                              })}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={newAssignment.endDateTime}
                              onChange={(e) => setNewAssignment({
                                ...newAssignment,
                                endDateTime: e.target.value
                              })}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>

                        {newAssignment.startDateTime && newAssignment.endDateTime && (
                          <div className="text-sm text-gray-600">
                            Duration: {calculateDuration(newAssignment.startDateTime, newAssignment.endDateTime)}
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => handleAddAssignmentToChapter(chapterIndex)}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Add Assignment
                        </button>
                      </div>
                    </div>

                    {/* Quizzes Section */}
                    <div className="bg-gray-50 p-3 rounded">
                      <h6 className="font-medium mb-2">Quizzes</h6>
                      
                      {/* Display existing quizzes */}
                      {chapter.quizzes?.map((quiz, quizIndex) => (
                        <div key={quizIndex} className="mb-4 p-3 bg-white rounded shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-medium">{quiz.title}</h6>
                              <p className="text-sm text-gray-600">{quiz.description}</p>
                            </div>
                            <button
                              onClick={() => {
                                const updatedChapters = [...chapters];
                                updatedChapters[chapterIndex].quizzes = 
                                  updatedChapters[chapterIndex].quizzes.filter((_, i) => i !== quizIndex);
                                setChapters(updatedChapters);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Questions: {quiz.questions.length} | Total Points: {quiz.totalPoints}
                            </p>
                            <div className="text-sm text-gray-500">
                              Start: {new Date(quiz.startDateTime).toLocaleString()}
                              <br />
                              End: {new Date(quiz.endDateTime).toLocaleString()}
                            </div>
                          </div>

                          {/* Display questions */}
                          <div className="mt-3 space-y-2">
                            {quiz.questions.map((q, qIndex) => (
                              <div key={qIndex} className="pl-4 border-l-2 border-gray-200">
                                <p className="font-medium">Q{qIndex + 1}: {q.question} ({q.points} pts)</p>
                                <p className="text-sm text-gray-600">Type: {q.type}</p>
                                {q.type === 'multiple_choice' && (
                                  <div className="pl-4">
                                    {q.options?.map((opt, i) => (
                                      <div key={i} className={`text-sm ${opt === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                        {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {q.type === 'true_false' && (
                                  <p className="text-sm text-green-600">Answer: {q.correctAnswer ? 'True' : 'False'}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Add Quiz Form */}
                      <div className="mt-4 space-y-4">
                        {/* Question Form */}
                        <div className="bg-white p-4 rounded shadow-sm">
                          <h6 className="font-medium mb-3">Add Question</h6>
                          
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Question"
                              value={newQuestion.question}
                              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                              className="w-full p-2 border rounded"
                            />
                            
                            <select
                              value={newQuestion.type}
                              onChange={(e) => handleQuestionTypeChange(e.target.value as 'multiple_choice' | 'true_false' | 'essay')}
                              className="w-full p-2 border rounded"
                            >
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="true_false">True/False</option>
                              <option value="essay">Essay</option>
                            </select>

                            {/* Multiple Choice Options */}
                            {newQuestion.type === 'multiple_choice' && (
                              <div className="space-y-2">
                                {newQuestion.options?.map((option, index) => (
                                  <div key={index} className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={`Option ${index + 1}`}
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(newQuestion.options || [])];
                                        newOptions[index] = e.target.value;
                                        setNewQuestion({ ...newQuestion, options: newOptions });
                                      }}
                                      className="flex-1 p-2 border rounded"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOptions = newQuestion.options?.filter((_, i) => i !== index);
                                        setNewQuestion({ ...newQuestion, options: newOptions });
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = [...(newQuestion.options || []), ''];
                                    setNewQuestion({ ...newQuestion, options: newOptions });
                                  }}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  Add Option
                                </button>

                                <select
                                  value={newQuestion.correctAnswer as string}
                                  onChange={(e) => setNewQuestion({
                                    ...newQuestion,
                                    correctAnswer: e.target.value
                                  })}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="">Select Correct Answer</option>
                                  {newQuestion.options?.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* True/False Answer */}
                            {newQuestion.type === 'true_false' && (
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={newQuestion.correctAnswer === true}
                                    onChange={() => setNewQuestion({
                                      ...newQuestion,
                                      correctAnswer: true
                                    })}
                                  />
                                  <span>True</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={newQuestion.correctAnswer === false}
                                    onChange={() => setNewQuestion({
                                      ...newQuestion,
                                      correctAnswer: false
                                    })}
                                  />
                                  <span>False</span>
                                </label>
                              </div>
                            )}

                            <input
                              type="number"
                              placeholder="Points"
                              value={newQuestion.points}
                              onChange={(e) => setNewQuestion({
                                ...newQuestion,
                                points: Math.max(1, parseInt(e.target.value) || 1)
                              })}
                              min="1"
                              className="w-full p-2 border rounded"
                            />

                            <button
                              type="button"
                              onClick={handleAddQuestionToQuiz}
                              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                              Add Question
                            </button>
                          </div>
                        </div>

                        {/* Display Added Questions */}
                        {newQuiz.questions.length > 0 && (
                          <div className="bg-white p-4 rounded shadow-sm">
                            <h6 className="font-medium mb-3">Added Questions</h6>
                            <div className="space-y-3">
                              {newQuiz.questions.map((q, index) => (
                                <div key={index} className="border p-3 rounded">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium">Q{index + 1}: {q.question}</p>
                                      <p className="text-sm text-gray-600">Type: {q.type} | Points: {q.points}</p>
                                      
                                      {q.type === 'multiple_choice' && q.options && (
                                        <div className="pl-4 mt-1">
                                          {q.options.map((opt, i) => (
                                            <div key={i} className={opt === q.correctAnswer ? 'text-green-600' : ''}>
                                              {opt}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {q.type === 'true_false' && (
                                        <p className="text-green-600 mt-1">
                                          Answer: {q.correctAnswer ? 'True' : 'False'}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <button
                                      onClick={() => {
                                        const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
                                        setNewQuiz({ ...newQuiz, questions: updatedQuestions });
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {error && (
                          <div className="text-red-500 text-sm">
                            {error}
                          </div>
                        )}
                      </div>

                      {/* Quiz Schedule */}
                      <div className="border-t pt-3 mt-3">
                        <h6 className="font-medium mb-2">Quiz Schedule</h6>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="datetime-local"
                            placeholder="Start Date"
                            value={newQuiz.startDateTime}
                            onChange={(e) => setNewQuiz({
                              ...newQuiz,
                              startDateTime: e.target.value
                            })}
                            className="w-full p-2 border rounded"
                          />
                          <input
                            type="datetime-local"
                            placeholder="End Date"
                            value={newQuiz.endDateTime}
                            onChange={(e) => setNewQuiz({
                              ...newQuiz,
                              endDateTime: e.target.value
                            })}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Duration (e.g., 1 hour)"
                          value={newQuiz.duration}
                          onChange={(e) => setNewQuiz({
                            ...newQuiz,
                            duration: Math.max(1, parseInt(e.target.value) || 1)
                          })}
                          className="w-full p-2 border rounded mt-2"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newQuiz.title || !newQuiz.description || newQuiz.questions.length === 0 ||
                              !newQuiz.startDateTime || !newQuiz.endDateTime || 
                              !newQuiz.duration) {
                            setError('Please fill in all quiz fields and add at least one question');
                            return;
                          }
                          handleAddQuizToChapter(chapterIndex);
                        }}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Add Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 
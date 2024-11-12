'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// import { Course } from '@/app/types';
import EditCourseModal from './EditCourseModal';

interface CourseCardProps {
  course: Course;
  isTeacher: boolean;
  isEnrolled: boolean;
  onRefresh: () => void;
}

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

interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  chapters: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      file?: {
        name: string;
        url: string;
        type: string;
      };
    }>;
    assignments: Array<{
      title: string;
      content: string;
      startDateTime: string;
      endDateTime: string;
      file?: {
        name: string;
        url: string;
        type: string;
      };
    }>;
    quizzes: Array<{
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
    }>;
  }>;
}

// Update FileDisplay to handle single file
const FileDisplay = ({ 
  file, 
  title, 
  onUpload, 
  onRemove 
}: { 
  file?: { name: string; url?: string; type: string; }; 
  title: string;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        {onUpload && !file && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Add File
          </button>
        )}
      </div>
      {file ? (
        <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded mt-1">
          <span className="text-gray-600">{file.name}</span>
          <div className="flex items-center space-x-2">
            {file.url && (
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                View
              </a>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : onUpload && (
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onUpload(e.target.files[0]);
            }
          }}
        />
      )}
    </div>
  );
};

// Add course-level file handling
const handleCourseFileUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentType', 'course');

    const response = await axios.post(`/api/courses/${course._id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.url) {
      const newFile = {
        name: file.name,
        url: response.data.url,
        type: 'course'
      };

      setEditedCourse(prev => ({
        ...prev,
        files: [...(prev.files || []), newFile]
      }));
      onRefresh(); // Refresh course data
    }
  } catch (error) {
    console.error('Error uploading course file:', error);
    setError('Failed to upload course file');
  }
};

const handleCourseFileRemove = async (fileIndex: number) => {
  try {
    const response = await axios.delete(`/api/courses/${course._id}/files`, {
      data: {
        contentType: 'course',
        fileIndex
      }
    });

    if (response.status === 200) {
      setEditedCourse(prev => ({
        ...prev,
        files: prev.files?.filter((_, index) => index !== fileIndex) || []
      }));
      onRefresh(); // Refresh course data
    }
  } catch (error) {
    console.error('Error removing course file:', error);
    setError('Failed to remove course file');
  }
};

// Add CourseFiles component
const CourseFiles = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Course Files</h4>
        {isTeacher && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Add File
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleCourseFileUpload(e.target.files[0]);
          }
        }}
      />

      <div className="space-y-2">
        {editedCourse.files?.map((file, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between text-sm bg-white p-2 rounded border"
          >
            <span className="text-gray-600">{file.name}</span>
            <div className="flex items-center space-x-2">
              {file.url && (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  View
                </a>
              )}
              {isTeacher && (
                <button
                  type="button"
                  onClick={() => handleCourseFileRemove(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CourseCard({ course, isTeacher, isEnrolled, onRefresh }: CourseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedCourse, setEditedCourse] = useState<Course>(course);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add file tracking state and handlers
  const [files, setFiles] = useState<Array<{
    name: string;
    url?: string;
    type: string;
  }>>([]);

  // Add file upload handler
  const handleFileUpload = async (
    file: File, 
    contentType: 'lesson' | 'assignment' | 'quiz', 
    chapterIndex: number
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', contentType);
      formData.append('chapterId', course.chapters[chapterIndex]._id);

      const response = await axios.post(`/api/courses/${course._id}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.url) {
        const newFile = {
          name: file.name,
          url: response.data.url,
          type: `${contentType}-${course.chapters[chapterIndex]._id}`
        };

        // Update the course state with the new file
        const updatedCourse = { ...editedCourse };
        const chapter = updatedCourse.chapters[chapterIndex];

        switch (contentType) {
          case 'lesson':
            if (chapter.lessons[chapter.lessons.length - 1]) {
              chapter.lessons[chapter.lessons.length - 1].file = newFile;
            }
            break;
          case 'assignment':
            if (chapter.assignments[chapter.assignments.length - 1]) {
              chapter.assignments[chapter.assignments.length - 1].file = newFile;
            }
            break;
          case 'quiz':
            if (chapter.quizzes[chapter.quizzes.length - 1]) {
              chapter.quizzes[chapter.quizzes.length - 1].file = newFile;
            }
            break;
        }

        setEditedCourse(updatedCourse);
        setFiles(prev => [...prev, newFile]);
        onRefresh(); // Refresh the course data
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
    }
  };

  // Add file removal handler
  const handleRemoveFile = async (
    contentType: 'lesson' | 'assignment' | 'quiz',
    chapterIndex: number,
    contentIndex: number
  ) => {
    try {
      const response = await axios.delete(`/api/courses/${course._id}/files`, {
        data: {
          contentType,
          chapterId: course.chapters[chapterIndex]._id,
          contentIndex
        }
      });

      if (response.status === 200) {
        const updatedCourse = { ...editedCourse };
        const chapter = updatedCourse.chapters[chapterIndex];

        switch (contentType) {
          case 'lesson':
            if (chapter.lessons[contentIndex]) {
              chapter.lessons[contentIndex].file = undefined;
            }
            break;
          case 'assignment':
            if (chapter.assignments[contentIndex]) {
              chapter.assignments[contentIndex].file = undefined;
            }
            break;
          case 'quiz':
            if (chapter.quizzes[contentIndex]) {
              chapter.quizzes[contentIndex].file = undefined;
            }
            break;
        }

        setEditedCourse(updatedCourse);
        onRefresh(); // Refresh the course data
      }
    } catch (error) {
      console.error('Error removing file:', error);
      setError('Failed to remove file');
    }
  };

  // Add console.log to debug the incoming course data
  console.log('Course data:', {
    title: course.title,
    chapters: course.chapters,
    files: course.files
  });

  // Calculate stats from chapters with improved logging
  const calculateStats = () => {
    let totalLessons = 0;
    let totalAssignments = 0;
    let totalQuizzes = 0;
    let totalFiles = 0;

    course.chapters?.forEach((chapter, index) => {
      console.log(`Chapter ${index + 1} content:`, {
        title: chapter.title,
        lessonsCount: chapter.lessons?.length || 0,
        assignmentsCount: chapter.assignments?.length || 0,
        quizzesCount: chapter.quizzes?.length || 0,
        
      });

      // Count lessons and their files
      if (Array.isArray(chapter.lessons)) {
        totalLessons += chapter.lessons.length;
        chapter.lessons.forEach(lesson => {
          if (lesson.file && Array.isArray(lesson.file)) {
            totalFiles += lesson.file.length;
          }
        });
        console.log(`- Lessons: ${chapter.lessons.length}, with files: ${totalFiles}`);
      }

      // Count assignments and their files
      if (Array.isArray(chapter.assignments)) {
        totalAssignments += chapter.assignments.length;
        chapter.assignments.forEach(assignment => {
          if (assignment.file && Array.isArray(assignment.file)) {
            totalFiles += assignment.file.length;
          }
        });
        console.log(`- Assignments: ${chapter.assignments.length}, with files: ${totalFiles}`);
      }

      // Count quizzes and their files
      if (Array.isArray(chapter.quizzes)) {
        totalQuizzes += chapter.quizzes.length;
        chapter.quizzes.forEach(quiz => {
          if (quiz.file && Array.isArray(quiz.file)) {
            totalFiles += quiz.file.length;
          }
        });
        console.log(`- Quizzes: ${chapter.quizzes.length}, with files: ${totalFiles}`);
      }
    });

    // Add course-level files
    if (Array.isArray(course.files)) {
      totalFiles += course.files.length;
      console.log('Course-level files:', course.files.length);
    }

    return {
      totalLessons,
      totalAssignments,
      totalQuizzes,
      totalFiles
    };
  };

  const stats = calculateStats();

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/courses/${course._id}`);
      if (response.status === 200) {
        onRefresh(); // This will trigger a refresh of the parent component's course list
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleAddChapter = () => {
    setEditedCourse({
      ...editedCourse,
      chapters: [...editedCourse.chapters, {
        title: 'New Chapter',
        lessons: [],
        assignments: [],
        quizzes: [],
        files: []
      }]
    });
  };

  const handleChapterTitleChange = (chapterIndex: number, newTitle: string) => {
    const updatedChapters = [...editedCourse.chapters];
    updatedChapters[chapterIndex].title = newTitle;
    setEditedCourse({ ...editedCourse, chapters: updatedChapters });
  };

  const handleDeleteChapter = (chapterIndex: number) => {
    const updatedChapters = editedCourse.chapters.filter((_, index) => index !== chapterIndex);
    setEditedCourse({ ...editedCourse, chapters: updatedChapters });
  };

  const handleAddLesson = (chapterIndex: number) => {
    const updatedChapters = [...editedCourse.chapters];
    updatedChapters[chapterIndex].lessons.push({
      title: 'New Lesson',
      content: '',
      file: null
    });
    setEditedCourse({ ...editedCourse, chapters: updatedChapters });
  };

  const handleAddAssignment = (chapterIndex: number) => {
    const updatedChapters = [...editedCourse.chapters];
    updatedChapters[chapterIndex].assignments.push({
      title: 'New Assignment',
      content: '',
      startDateTime: new Date().toISOString(),
      endDateTime: new Date().toISOString(),
      file: null
    });
    setEditedCourse({ ...editedCourse, chapters: updatedChapters });
  };

  const handleAddQuiz = (chapterIndex: number) => {
    const updatedChapters = [...editedCourse.chapters];
    updatedChapters[chapterIndex].quizzes.push({
      title: 'New Quiz',
      description: '',
      questions: [],
      startDateTime: new Date().toISOString(),
      endDateTime: new Date().toISOString(),
      duration: 60,
      totalPoints: 0,
      file: null
    });
    setEditedCourse({ ...editedCourse, chapters: updatedChapters });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await axios.put(`/api/courses/${course._id}`, editedCourse);
      if (response.status === 200) {
        onRefresh();
        setShowEditModal(false);
      }
    } catch (err) {
      setError('Failed to save changes');
      console.error('Error updating course:', err);
    } finally {
      setLoading(false);
    }
  };

  const FileList = ({ files }: { files: Array<{ name: string; url: string; type: string; }> }) => {
    // Filter out client_secret files and invalid entries
    const validFiles = files.filter(file => 
      file.name && 
      file.url && 
      !file.name.includes('client_secret')
    );

    if (validFiles.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Course Files:</h4>
        {validFiles.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
            <span className="text-sm text-gray-600">{file.name}</span>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              View
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
          <p className="text-gray-600 mb-4">{course.description}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded">
              <span className="text-xl font-bold text-blue-600">{stats.totalChapters}</span>
              <p className="text-sm text-blue-600">Chapters</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <span className="text-xl font-bold text-green-600">{stats.totalLessons}</span>
              <p className="text-sm text-green-600">Lessons</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <span className="text-xl font-bold text-yellow-600">{stats.totalAssignments}</span>
              <p className="text-sm text-yellow-600">Assignments</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <span className="text-xl font-bold text-purple-600">{stats.totalQuizzes}</span>
              <p className="text-sm text-purple-600">Quizzes</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <span className="text-xl font-bold text-red-600">{stats.totalFiles}</span>
              <p className="text-sm text-red-600">Files</p>
            </div>
          </div>

          {/* Course Files Section */}
          <CourseFiles />

          {/* Chapter Details with content verification */}
          {isTeacher && course.chapters && course.chapters.length > 0 && (
            <div className="mt-4 space-y-2">
              {course.chapters.map((chapter, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-700">{chapter.title}</h4>
                  <div className="mt-1 text-sm text-gray-500 grid grid-cols-2 gap-2">
                    {chapter.lessons?.length > 0 && (
                      <div>
                        <span className="text-blue-600">{chapter.lessons.length}</span> Lessons
                        <div className="text-xs text-gray-400 mt-1">
                          {chapter.lessons.map(l => l.title).join(', ')}
                        </div>
                      </div>
                    )}
                    {chapter.assignments?.length > 0 && (
                      <div>
                        <span className="text-green-600">{chapter.assignments.length}</span> Assignments
                        <div className="text-xs text-gray-400 mt-1">
                          {chapter.assignments.map(a => a.title).join(', ')}
                        </div>
                      </div>
                    )}
                    {chapter.quizzes?.length > 0 && (
                      <div>
                        <span className="text-purple-600">{chapter.quizzes.length}</span> Quizzes
                        <div className="text-xs text-gray-400 mt-1">
                          {chapter.quizzes.map(q => q.title).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.push(`/courses/${course._id}`)}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Details
            </button>
            {isTeacher && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Course</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-6">
              {/* Basic Course Info */}
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedCourse.title}
                  onChange={(e) => setEditedCourse({ ...editedCourse, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Course Title"
                />
                <textarea
                  value={editedCourse.description}
                  onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
                  className="w-full p-2 border rounded h-24"
                  placeholder="Course Description"
                />
              </div>

              {/* Chapters Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Chapters</h3>
                  <button
                    type="button"
                    onClick={handleAddChapter}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Chapter
                  </button>
                </div>

                {editedCourse.chapters.map((chapter, chapterIndex) => (
                  <div key={chapterIndex} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) => handleChapterTitleChange(chapterIndex, e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Chapter Title"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteChapter(chapterIndex)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Chapter Content Controls */}
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => handleAddLesson(chapterIndex)}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Add Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddAssignment(chapterIndex)}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Add Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddQuiz(chapterIndex)}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Add Quiz
                      </button>
                    </div>

                    {/* Display chapter content */}
                    <div className="space-y-4 mt-4">
                      {chapter.lessons?.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="p-3 bg-white rounded border">
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{lesson.content}</p>
                          <FileDisplay 
                            file={lesson.file}
                            title="Lesson File"
                            onUpload={isTeacher ? (file) => handleFileUpload(file, 'lesson', chapterIndex) : undefined}
                            onRemove={isTeacher ? () => handleRemoveFile('lesson', chapterIndex, lessonIndex) : undefined}
                          />
                        </div>
                      ))}

                      {chapter.assignments?.map((assignment, assignmentIndex) => (
                        <div key={assignmentIndex} className="p-3 bg-white rounded border">
                          <h4 className="font-medium">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.content}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Due: {new Date(assignment.endDateTime).toLocaleString()}
                          </div>
                          <FileDisplay 
                            file={assignment.file}
                            title="Assignment File"
                            onUpload={isTeacher ? (file) => handleFileUpload(file, 'assignment', chapterIndex) : undefined}
                            onRemove={isTeacher ? () => handleRemoveFile('assignment', chapterIndex, assignmentIndex) : undefined}
                          />
                        </div>
                      ))}

                      {chapter.quizzes?.map((quiz, quizIndex) => (
                        <div key={quizIndex} className="p-3 bg-white rounded border">
                          <h4 className="font-medium">{quiz.title}</h4>
                          <p className="text-sm text-gray-600">{quiz.description}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Duration: {quiz.duration} minutes
                          </div>
                          <FileDisplay 
                            file={quiz.file}
                            title="Quiz File"
                            onUpload={isTeacher ? (file) => handleFileUpload(file, 'quiz', chapterIndex) : undefined}
                            onRemove={isTeacher ? () => handleRemoveFile('quiz', chapterIndex, quizIndex) : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 
'use client';

import { useState, useRef} from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "./button";
import { toast } from 'react-hot-toast';

interface CourseCardProps {
  course: Course;
  stats: {
    totalChapters: number;
    totalLessons: number;
    totalFiles: number;
    totalAssignments: number;
    totalQuizzes: number;
    fileTypes: {
      course: number;
      chapter: number;
      lesson: number;
      assignment: number;
      quiz: number;
    };
  };
  isTeacher: boolean;
  isEnrolled: boolean;
  onRefresh: () => Promise<void>;
  onEnroll?: (courseId: string) => Promise<void>;
}

interface Lesson {
  title: string;
  content: string;
  file?: {
    name: string;
    url: string;
    type: string;
  } | null;
}

export interface Assignment {
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

export interface Quiz {
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
  enrollmentKey?: string;
  files?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  chapters: Array<{
    _id: string;
    title: string;
    lessons: Array<Lesson>;
    assignments: Array<{
      title: string;
      content: string;
      startDateTime: string;
      endDateTime: string;
      file?: {
        name: string;
        url: string;
        type: string;
      } | null;
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
      } | null;
    }>;
  }>;
}

interface FileDisplayProps { 
  file?: { 
    name: string; 
    url?: string; 
    type: string; 
  } | null; 
  title: string;
  onUpload?: (file: File) => void;
  onRemove?: (contentType: 'lesson' | 'assignment' | 'quiz', chapterIndex: number, contentIndex: number) => void;
  contentType?: 'lesson' | 'assignment' | 'quiz';
  chapterIndex?: number;
  contentIndex?: number;
}

export const FileDisplay = ({ 
  file, 
  title, 
  onUpload, 
  onRemove,
  contentType,
  chapterIndex,
  contentIndex 
}: FileDisplayProps) => {
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
            {onRemove && contentType && typeof chapterIndex === 'number' && typeof contentIndex === 'number' && (
              <button
                type="button"
                onClick={() => onRemove(contentType, chapterIndex, contentIndex)}
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

// Update CourseFiles component to receive necessary props
export const CourseFiles = ({ 
  course, 
  isTeacher, 
  editedCourse, 
  setEditedCourse, 
  onRefresh, 
  setError, 
  onFileUpdate 
}: { 
  course: Course;
  isTeacher: boolean;
  editedCourse: Course;
  setEditedCourse: (course: Course) => void;
  onRefresh: () => void;
  setError: (error: string) => void;
  onFileUpdate: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Move handleCourseFileUpload inside CourseFiles
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

        setEditedCourse({
          ...editedCourse,
          files: [...(editedCourse.files || []), newFile]
        });
        onRefresh();
        onFileUpdate();
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
        const updatedCourse = {
          ...editedCourse,
          files: editedCourse.files?.filter((_, index) => index !== fileIndex) || []
        };
        setEditedCourse(updatedCourse);
        onRefresh();
        onFileUpdate();
      }
    } catch (error) {
      console.error('Error removing course file:', error);
      setError('Failed to remove course file');
    }
  };

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

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onSave: (course: Course) => Promise<void>;
  isLoading?: boolean;
}

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (key: string) => Promise<void>;
  error?: string;
  isLoading?: boolean;
  enrollmentKey: string;
  handleEnrollmentKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface UnenrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

// Add modal components
export const DeleteModal = ({ isOpen, onClose, onConfirm, isLoading }: DeleteModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <div className="p-6">
      <h3 className="text-lg font-semibold">Delete Course</h3>
      <p className="mt-2">Are you sure you want to delete this course? This action cannot be undone.</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  </Dialog>
);

export const EditModal = ({ isOpen, onClose, course, onSave, isLoading }: EditModalProps) => {
  const [editedCourse, setEditedCourse] = useState(course);

  const handleAddChapter = () => {
    setEditedCourse({
      ...editedCourse,
      chapters: [...editedCourse.chapters, {
        _id: `temp-${Date.now()}`,
        title: 'New Chapter',
        lessons: [],
        assignments: [],
        quizzes: []
      }]
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold">Edit Course</h3>
        
        {/* Basic Course Info */}
        <div className="mt-4 space-y-4">
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
            className="w-full p-2 border rounded"
            placeholder="Course Description"
          />
        </div>

        {/* Chapters Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Chapters</h4>
            <button
              onClick={handleAddChapter}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Add Chapter
            </button>
          </div>
          
          {editedCourse.chapters.map((chapter, chapterIndex) => (
            <div key={chapter._id} className="mt-4 p-4 border rounded">
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => {
                  const updatedChapters = [...editedCourse.chapters];
                  updatedChapters[chapterIndex].title = e.target.value;
                  setEditedCourse({ ...editedCourse, chapters: updatedChapters });
                }}
                className="w-full p-2 border rounded mb-2"
                placeholder="Chapter Title"
              />
              
              {/* Chapter Content Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddLesson(chapterIndex)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Add Lesson
                </button>
                <button
                  onClick={() => handleAddAssignment(chapterIndex)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Add Assignment
                </button>
                <button
                  onClick={() => handleAddQuiz(chapterIndex)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Add Quiz
                </button>
                <button
                  onClick={() => {
                    const updatedChapters = editedCourse.chapters.filter((_, idx) => idx !== chapterIndex);
                    setEditedCourse({ ...editedCourse, chapters: updatedChapters });
                  }}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Delete Chapter
                </button>
              </div>

              {/* Display Lessons, Assignments, and Quizzes */}
              <div className="mt-4 space-y-4">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="p-2 bg-gray-50 rounded">
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => {
                        const updatedChapters = [...editedCourse.chapters];
                        updatedChapters[chapterIndex].lessons[lessonIndex].title = e.target.value;
                        setEditedCourse({ ...editedCourse, chapters: updatedChapters });
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="Lesson Title"
                    />
                    <button
                      onClick={() => {
                        const updatedChapters = [...editedCourse.chapters];
                        updatedChapters[chapterIndex].lessons = chapter.lessons.filter((_, idx) => idx !== lessonIndex);
                        setEditedCourse({ ...editedCourse, chapters: updatedChapters });
                      }}
                      className="mt-2 text-sm text-red-500 hover:text-red-600"
                    >
                      Delete Lesson
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedCourse)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export const EnrollModal = ({ isOpen, onClose, onConfirm, error, isLoading, enrollmentKey, handleEnrollmentKeyChange }: EnrollModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold">Enroll in Course</h3>
        <input
          type="text"
          value={enrollmentKey}
          onChange={handleEnrollmentKeyChange}
          placeholder="Enter enrollment key"
          className="mt-2 w-full border rounded p-2"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(enrollmentKey)} disabled={isLoading}>
            {isLoading ? 'Enrolling...' : 'Enroll'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export const UnenrollModal = ({ isOpen, onClose, onConfirm, error, isLoading }: UnenrollModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <div className="p-6">
      <h3 className="text-lg font-semibold">Unenroll from Course</h3>
      <p className="mt-2">Are you sure you want to unenroll from this course?</p>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Unenrolling...' : 'Unenroll'}
        </Button>
      </div>
    </div>
  </Dialog>
);

export default function CourseCard({ 
  course, 
  stats, 
  isEnrolled,
  onRefresh,
  onEnroll,
}: CourseCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [error, setError] = useState('');

  const handleEnroll = async (key?: string) => {
    if (!session) {
      toast.error('Please log in to enroll');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/courses/${course._id}/enroll`, {
        enrollmentKey: key
      });

      toast.success('Successfully enrolled in course!');
      await onRefresh();
      setShowEnrollModal(false);
      setEnrollmentKey('');
      
      const enrolledSection = document.getElementById('enrolled-courses');
      if (enrolledSection) {
        enrolledSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || 'Failed to enroll');
      toast.error(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = async (fileIndex: number) => {
    try {
      await axios.delete(`/api/courses/${course._id}/files`, {
        data: {
          type: 'course',
          fileIndex
        }
      });
      await onRefresh();
      toast.success('File removed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove file';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>

      {/* Course Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalChapters}</div>
          <div className="text-sm text-blue-600">Chapters</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalLessons}</div>
          <div className="text-sm text-green-600">Lessons</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.totalAssignments}</div>
          <div className="text-sm text-yellow-600">Assignments</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalQuizzes}</div>
          <div className="text-sm text-purple-600">Quizzes</div>
        </div>
      </div>

      {/* Add file statistics */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-lg font-semibold text-gray-600">
            {stats.fileTypes.course}
          </div>
          <div className="text-sm text-gray-600">Course Files</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-lg font-semibold text-blue-600">
            {stats.fileTypes.lesson}
          </div>
          <div className="text-sm text-blue-600">Lesson Files</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-lg font-semibold text-green-600">
            {stats.fileTypes.assignment}
          </div>
          <div className="text-sm text-green-600">Assignment Files</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <div className="text-lg font-semibold text-purple-600">
            {stats.fileTypes.quiz}
          </div>
          <div className="text-sm text-purple-600">Quiz Files</div>
        </div>
      </div>

      <div className="mt-2 text-center text-gray-600">
        Total Files: {stats.totalFiles}
      </div>

      {/* Action Buttons */}
      {isEnrolled ? (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/courses/${course._id}`)}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            View Course
          </button>
        </div>
      ) : (
        <button
          onClick={() => course.enrollmentKey ? setShowEnrollModal(true) : onEnroll?.(course._id)}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Enroll'}
        </button>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Enter Enrollment Key</h3>
            <input
              type="text"
              value={enrollmentKey}
              onChange={(e) => {
                setEnrollmentKey(e.target.value);
                setError('');
              }}
              placeholder="Enter enrollment key"
              className="w-full p-2 border rounded mb-4"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => handleEnroll(enrollmentKey)}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={loading || !enrollmentKey}
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setEnrollmentKey('');
                  setError('');
                }}
                className="flex-1 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add this where you display course files */}
      <div className="mt-4">
        {course.files?.map((file, index) => (
          <div key={index} className="flex justify-between items-center">
            <a href={file.url} className="text-blue-500 hover:text-blue-600">
              {file.name}
            </a>
            <button
              onClick={() => handleRemoveFile(index)}
              className="text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 
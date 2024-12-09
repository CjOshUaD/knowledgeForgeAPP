"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Navbar from "@/app/components/NavBar";
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  file?: {
    url: string;
    name: string;
  };
}

interface Assignment {
  _id: string;
  courseId: string;
  title: string;
  content: string;
  startDateTime: string;
  endDateTime: string;
  totalPoints: number;
  submissions?: {
    userId: string;
    content: string;
    files?: {
      name: string;
      url: string;
    }[];
    submittedAt: Date;
    score?: number;
    feedback?: string;
    gradedAt?: Date;
    gradedBy?: string;
  }[];
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
}

interface Chapter {
  _id: string;
  title: string;
  lessons?: Lesson[];
  assignments?: Assignment[];
  quizzes?: Quiz[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  enrolledStudents?: string[];
}

export interface AssignmentSubmission {
  content: string;
  files?: File[];
}

function CourseContent({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{chapter.title}</h2>
      
      {/* Lessons Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Lessons
        </h3>
        
        <div className="space-y-4">
          {chapter.lessons?.map((lesson, index) => (
            <div key={lesson._id} 
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-semibold">
                      {index + 1}
                    </span>
                    {lesson.title}
                  </h4>
                </div>
                <p className="mt-2 text-gray-600 pl-11">{lesson.content}</p>
                {lesson.file && (
                  <div className="mt-3 pl-11">
                    <a href={lesson.file.url}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {lesson.file.name}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Assignments
        </h3>

        <div className="space-y-4">
          {chapter.assignments?.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quizzes
        </h3>

        <div className="space-y-4">
          {chapter.quizzes?.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b bg-gray-50 px-4 py-3 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  {quiz.title}
                </h4>
                <button
                  onClick={() => router.push(`/quiz/${quiz._id}`)}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Start Quiz
                </button>
              </div>
              
              <div className="p-4">
                <p className="text-gray-700 mb-4">{quiz.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="w-32 text-gray-500">Duration:</span>
                    <span className="text-gray-700">{quiz.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-32 text-gray-500">Total Points:</span>
                    <span className="text-gray-700">{quiz.totalPoints} points</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function CourseSidebar({ chapters, activeChapter, onChapterSelect }: {
  chapters: Chapter[];
  activeChapter: string;
  onChapterSelect: (chapterId: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="font-semibold text-gray-800 mb-4">Chapters</h2>
      <div className="space-y-1">
        {chapters.map((chapter) => (
          <button
            key={chapter._id}
            onClick={() => onChapterSelect(chapter._id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200
              ${activeChapter === chapter._id 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {chapter.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// Add this helper function to check assignment status
const getAssignmentStatus = (startDateTime: string, endDateTime: string) => {
  // Get current time in UTC
  const now = new Date();
  
  // Convert start and end times to UTC for comparison
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  // Convert all to timestamps for accurate comparison
  const nowTime = now.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();

  // Debug logs
  console.log('Current time:', now.toLocaleString());
  console.log('Start time:', start.toLocaleString());
  console.log('End time:', end.toLocaleString());

  if (nowTime < startTime) {
    return 'PENDING';
  } else if (nowTime > endTime) {
    return 'CLOSED';
  } else {
    return 'OPEN';
  }
};

// Add this to check if user has submitted
const getSubmissionStatus = (assignment: Assignment, userId: string) => {
  const submission = assignment.submissions?.find(s => s.userId === userId);
  if (!submission) return null;
  
  return {
    ...submission,
    status: submission.score !== undefined ? 'GRADED' : 'SUBMITTED'
  };
};

// Then in your assignment display component:
const AssignmentCard = ({ assignment }: { assignment: Assignment }) => {
  const params = useParams();
  const { data: session } = useSession();
  const [submissionText, setSubmissionText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const status = getAssignmentStatus(assignment.startDateTime, assignment.endDateTime);
  const submission = session?.user?.id ? getSubmissionStatus(assignment, session.user.id) : null;
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log('Submitting assignment:', {
        courseId: params.courseId,
        assignmentId: assignment._id,
        content: submissionText
      });

      const formData = new FormData();
      formData.append('content', submissionText);
      
      const response = await axios.post(
        `/api/courses/${params.courseId}/assignments/${assignment._id}/submit`, 
        formData
      );

      console.log('Submission response:', response.data);
      toast.success('Assignment submitted successfully!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Format dates properly
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{assignment.title}</h3>
        <span className={`${
          status === 'OPEN' ? 'bg-green-100 text-green-800' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        } px-3 py-1 rounded-full text-sm font-medium`}>
          {status}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Start: {formatDate(assignment.startDateTime)}</p>
        <p>End: {formatDate(assignment.endDateTime)}</p>
      </div>

      <p className="text-gray-700 mb-4">{assignment.content}</p>

      {status === 'OPEN' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Submission
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter your submission here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      )}

      {status === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex items-center text-yellow-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Assignment submission window hasn&apos;t started yet
          </div>
        </div>
      )}

      {submission && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5 13l4 4L19 7" />
            </svg>
            <span>Assignment submitted successfully!</span>
          </div>
          <p className="mt-2 text-sm text-green-600">
            Submitted on: {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export const AssignmentSubmissionForm = ({ assignment, onSubmitSuccess }: {
  assignment: Assignment;
  onSubmitSuccess?: () => void;
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() && files.length === 0) {
      setError('Please enter text or attach files for your submission');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (submissionText.trim()) {
        formData.append('content', submissionText);
      }
      files.forEach(file => {
        formData.append('files', file);
      });

      await axios.post(`/api/assignments/${assignment._id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Assignment submitted successfully!');
      setSubmissionText('');
      setFiles([]);
      setError('');
      onSubmitSuccess?.();
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      setError(axiosError.response?.data?.error || 'Failed to submit assignment');
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Submission
        </label>
        <textarea
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Enter your submission here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments (optional)
        </label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </form>
  );
};

export default function CourseView() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unenrolling, setUnenrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${params.courseId}`);
        setCourse(response.data);
        if (response.data.chapters && response.data.chapters.length > 0) {
          setActiveChapter(response.data.chapters[0]._id);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId]);

  const handleUnenroll = async () => {
    try {
      setUnenrolling(true);
      await axios.delete(`/api/courses/${params.courseId}/enroll`);
      toast.success('Successfully unenrolled from course');
      router.push('/dashboard'); // Redirect to dashboard after unenrolling
    } catch (error) {
      console.error('Error unenrolling:', error);
      toast.error('Failed to unenroll from course');
    } finally {
      setUnenrolling(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold">{course?.title}</h1>
          </div>
          
          {/* Add unenroll button if user is enrolled */}
          {course?.enrolledStudents?.includes(session?.user?.id as string) && (
            <button
              onClick={handleUnenroll}
              disabled={unenrolling}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg 
                       transition-colors duration-200 disabled:opacity-50"
            >
              {unenrolling ? 'Unenrolling...' : 'Unenroll from Course'}
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-8">{course.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar with chapters list */}
          <CourseSidebar 
            chapters={course.chapters}
            activeChapter={activeChapter || ''}
            onChapterSelect={setActiveChapter}
          />

          {/* Main content area */}
          <div className="md:col-span-3 bg-white p-6 rounded-lg shadow">
            {activeChapter ? (
              <CourseContent 
                chapter={course.chapters.find(c => c._id === activeChapter) as Chapter} 
              />
            ) : (
              <div className="text-center text-gray-500">
                Select a chapter to view its content
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
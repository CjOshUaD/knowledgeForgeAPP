export interface Lesson {
  title: string;
  content: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
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
  } | null;
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
  } | null;
}

export interface Chapter {
  _id: string;
  title: string;
  lessons: Lesson[];
  assignments: Assignment[];
  quizzes: Quiz[];
  files?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  chapters: Chapter[];
  enrolledStudents?: string[];
  enrollmentKey?: string;
  files?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  stats?: {
    totalFiles: number;
    fileTypes: {
      course: number;
      chapter: number;
      lesson: number;
      assignment: number;
      quiz: number;
    };
  };
} 
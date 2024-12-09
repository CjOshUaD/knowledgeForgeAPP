import { connectMongoDB } from "./mongodb";
import Course from "../models/Course";

interface CourseType {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  enrollmentKey?: string;
  files: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  enrolledStudents: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CourseStats {
  totalFiles: number;
  filesByType: {
    course: number;
    lessons: number;
    assignments: number;
    quizzes: number;
  };
}

interface Course {
  files?: Array<{ name: string; url: string; type: string; }>;
  chapters: Array<{
    lessons: Array<{ files?: Array<any> }>;
    assignments: Array<{ files?: Array<any> }>;
    quizzes: Array<{ file?: any }>;
  }>;
}

export async function getCourses(userId: string): Promise<CourseType[]> {
  try {
    await connectMongoDB();

    // Find courses based on user role (from session)
    const courses = await Course.find({
      $or: [
        { teacherId: userId },         // Courses where user is teacher
        { enrolledStudents: userId },  // Courses where user is enrolled
        { teacherId: { $exists: true } } // All courses for students to see
      ]
    }).sort({ createdAt: -1 }); // Sort by newest first

    return JSON.parse(JSON.stringify(courses)); // Serialize for Next.js
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Get a single course by ID
export async function getCourseById(courseId: string): Promise<CourseType | null> {
  try {
    await connectMongoDB();
    
    const course = await Course.findById(courseId);
    
    if (!course) return null;
    
    return JSON.parse(JSON.stringify(course)); // Serialize for Next.js
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

// Get courses created by a specific teacher
export async function getTeacherCourses(teacherId: string): Promise<CourseType[]> {
  try {
    await connectMongoDB();
    
    const courses = await Course.find({ teacherId })
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return [];
  }
}

// Get courses where a student is enrolled
export async function getEnrolledCourses(studentId: string): Promise<CourseType[]> {
  try {
    await connectMongoDB();
    
    const courses = await Course.find({ enrolledStudents: studentId })
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
}

// Get available courses for a student (not enrolled yet)
export async function getAvailableCourses(studentId: string): Promise<CourseType[]> {
  try {
    await connectMongoDB();
    
    const courses = await Course.find({
      enrolledStudents: { $ne: studentId } // Courses where student is not enrolled
    }).sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error('Error fetching available courses:', error);
    return [];
  }
}

// Search courses by title or description
export async function searchCourses(query: string): Promise<CourseType[]> {
  try {
    await connectMongoDB();
    
    const courses = await Course.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(courses));
  } catch (error) {
    console.error('Error searching courses:', error);
    return [];
  }
}

// Get course statistics
export async function getCourseStats(courseId: string) {
  try {
    await connectMongoDB();
    
    const course = await Course.findById(courseId);
    
    if (!course) return null;
    
    return {
      totalStudents: course.enrolledStudents.length,
      totalFiles: course.files.length,
      totalQuizzes: course.quizzes?.length || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
  } catch (error) {
    console.error('Error fetching course stats:', error);
    return null;
  }
}

// Update course details
export async function updateCourse(courseId: string, updateData: Partial<CourseType>) {
  try {
    await connectMongoDB();
    
    const course = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(course));
  } catch (error) {
    console.error('Error updating course:', error);
    return null;
  }
}

// Delete a course
export async function deleteCourse(courseId: string) {
  try {
    await connectMongoDB();
    
    await Course.findByIdAndDelete(courseId);
    
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    return false;
  }
}

export function calculateFileStats(course: Course) {
  const stats = {
    totalFiles: 0,
    filesByType: {
      course: course.files?.length || 0,
      lesson: 0,
      assignment: 0,
      quiz: 0
    }
  };

  course.chapters?.forEach(chapter => {
    chapter.lessons?.forEach(lesson => {
      if (lesson.files?.length) {
        stats.filesByType.lesson += lesson.files.length;
        stats.totalFiles += lesson.files.length;
      }
    });

    chapter.assignments?.forEach(assignment => {
      if (assignment.files?.length) {
        stats.filesByType.assignment += assignment.files.length;
        stats.totalFiles += assignment.files.length;
      }
    });

    chapter.quizzes?.forEach(quiz => {
      if (quiz.file) {
        stats.filesByType.quiz += 1;
        stats.totalFiles += 1;
      }
    });
  });

  stats.totalFiles += stats.filesByType.course;

  return stats;
} 
import { NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";

interface MongoDBCourse {
  _id: { toString(): string };
  title?: string;
  description?: string;
  instructor?: { name?: string };
  enrolledStudents?: string[];
}

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectMongoDB();
    console.log('Connected to MongoDB successfully');
    
    // Fetch all courses without population for now
    const courses = await Course.find().lean();
    console.log('Fetched courses:', courses);

    const formattedCourses = courses.map((course) => ({
      _id: (course._id as { toString(): string }).toString(),
      title: (course as MongoDBCourse).title || '',
      description: (course as MongoDBCourse).description || '',
      instructor: {
        name: 'Instructor' // Simplified for now
      },
      enrolledStudents: (course as MongoDBCourse).enrolledStudents || []
    }));

    console.log('Formatted courses:', formattedCourses);
    return NextResponse.json(formattedCourses);

  } catch (error) {
    console.error('Detailed error in courses/public:', error);
    
    // More detailed error response
    return NextResponse.json(
      { 
        error: "Failed to fetch courses",
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
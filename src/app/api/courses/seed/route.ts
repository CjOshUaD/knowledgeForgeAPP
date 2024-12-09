import { NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";

export async function POST() {
  try {
    await connectMongoDB();

    // Sample courses data
    const sampleCourses = [
      {
        title: "Introduction to Web Development",
        description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript.",
        instructor: "65c4a7891c89c1a7c6a59f99", // Replace with an actual user ID from your database
        enrolledStudents: [],
        chapters: [
          {
            title: "Getting Started",
            lessons: [
              {
                title: "Web Development Overview",
                content: "Introduction to web development concepts and tools."
              }
            ]
          }
        ]
      },
      {
        title: "Python Programming Basics",
        description: "Master the basics of Python programming language with hands-on exercises.",
        instructor: "65c4a7891c89c1a7c6a59f99", // Replace with an actual user ID from your database
        enrolledStudents: [],
        chapters: [
          {
            title: "Python Fundamentals",
            lessons: [
              {
                title: "Variables and Data Types",
                content: "Understanding Python variables and basic data types."
              }
            ]
          }
        ]
      }
    ];

    // Insert the sample courses
    await Course.insertMany(sampleCourses);

    return NextResponse.json({ 
      message: "Sample courses added successfully" 
    });

  } catch (error) {
    console.error('Error seeding courses:', error);
    return NextResponse.json(
      { error: "Failed to seed courses" },
      { status: 500 }
    );
  }
} 
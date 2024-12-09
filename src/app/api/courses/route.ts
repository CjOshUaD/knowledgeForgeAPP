import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../auth/[...nextauth]/route";
import { Session } from "next-auth";

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  }
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Fetch all courses
    const courses = await Course.find().sort({ createdAt: -1 });

    console.log(`Found ${courses.length} courses`);

    return NextResponse.json(courses);

  } catch (error: unknown) {
    console.error('Error in GET /api/courses:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: "Failed to fetch courses",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST request received');
    const session = (await getServerSession(authOptions)) as CustomSession | null;
    console.log('Session:', session);
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    const body = await request.json();
    console.log('Request body:', body);
    
    const newCourse = await Course.create({
      title: body.title,
      description: body.description,
      teacherId: session.user.id,
      enrollmentKey: body.enrollmentKey,
      chapters: body.chapters || [],
      files: body.files || [],
      enrolledStudents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('New course created:', newCourse);
    return NextResponse.json(newCourse, { status: 201 });
    
  } catch (error) {
    console.error('Detailed error in POST /api/courses:', error);
    return NextResponse.json(
      { 
        error: "Failed to create course",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

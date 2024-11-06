import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}
export async function GET(request: Request) {
  
 

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = session.user.id;

    let courses: any[] = [];

    switch (type) {
      case 'enrolled':
        // Get only courses where user is enrolled but not the teacher
        courses = await Course.find({
          enrolledStudents: userId,
          teacherId: { $ne: userId }
        }).lean();
        break;

      case 'available':
        // Get courses where user is not enrolled and not the teacher
        courses = await Course.find({
          $and: [
            { teacherId: { $ne: userId } },
            { enrolledStudents: { $nin: [userId] } }
          ]
        }).lean();
        break;

      case 'teaching':
        // Get only courses where user is the teacher
        courses = await Course.find({
          teacherId: userId
        }).lean();
        break;
    }

    return NextResponse.json(courses);

  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    console.log('Creating course with data:', {
      ...data,
      teacherId: session.user.id
    });

    await connectMongoDB();

    const course = await Course.create({
      ...data,
      teacherId: session.user.id,
      enrolledStudents: [],
      createdAt: new Date()
    });

    console.log('Created course:', course);

    return NextResponse.json({
      message: "Course created successfully",
      course
    });

  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
} 
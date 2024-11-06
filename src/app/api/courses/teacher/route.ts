import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// Define custom session interface
interface CustomSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as CustomSession | null;
    
    // Debug log for session
    console.log('Session in teacher courses:', {
      session,
      userId: session?.user?.id,
      userRole: session?.user?.role
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!session.user?.id) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    // Debug log for query
    console.log('Querying courses with teacherId:', session.user.id);

    // Fetch all courses where teacherId matches the current user's ID
    const courses = await Course.find({ teacherId: session.user.id })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Debug log for found courses
    console.log('Found courses:', courses);

    return NextResponse.json(courses);

  } catch (error: any) {
    console.error('Error fetching teacher courses:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch courses",
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
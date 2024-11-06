import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const { enrollmentKey } = await request.json();
    
    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    if (course.enrolledStudents.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Verify enrollment key if course requires it
    if (course.enrollmentKey && course.enrollmentKey !== enrollmentKey) {
      return NextResponse.json(
        { error: "Invalid enrollment key" },
        { status: 403 }
      );
    }

    // Add user to enrolled students
    course.enrolledStudents.push(session.user.id);
    await course.save();

    return NextResponse.json({
      message: "Successfully enrolled in course"
    });

  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
} re
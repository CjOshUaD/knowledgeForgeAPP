import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string; lessonIndex: string } }
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

    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (course.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to modify this course" },
        { status: 403 }
      );
    }

    const lessonIndex = parseInt(params.lessonIndex);
    course.lessons.splice(lessonIndex, 1);
    await course.save();

    return NextResponse.json({
      message: "Lesson deleted successfully"
    });

  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
} 
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

    const { title, content, order } = await request.json();

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

    const newLesson = { title, content, order };
    course.lessons.push(newLesson);
    await course.save();

    return NextResponse.json({
      message: "Lesson added successfully",
      lesson: newLesson
    });

  } catch (error: any) {
    console.error('Error adding lesson:', error);
    return NextResponse.json(
      { error: "Failed to add lesson" },
      { status: 500 }
    );
  }
} 
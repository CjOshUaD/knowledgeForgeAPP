import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    
    // Update the course with the new enrolled student
    const updatedCourse = await Course.findByIdAndUpdate(
      params.courseId,
      { $addToSet: { enrolledStudents: userId } },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Successfully enrolled",
      course: updatedCourse
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get courseId from URL
    const courseId = request.nextUrl.pathname.split('/')[3];
    const course = await Course.findById(courseId).exec();
    
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user is enrolled
    if (!course.enrolledStudents.includes(userId)) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 400 }
      );
    }

    // Remove user from enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(
      (studentId: string) => studentId !== userId
    );
    await course.save();

    return NextResponse.json({
      message: "Successfully unenrolled from course"
    });

  } catch (error: unknown) {
    console.error('Error unenrolling from course:', error);
    return NextResponse.json(
      { error: "Failed to unenroll from course" },
      { status: 500 }
    );
  }
}
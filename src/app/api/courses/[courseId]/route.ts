import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
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

    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this course
    const hasAccess = 
      course.teacherId === session.user.id || 
      course.enrolledStudents?.includes(session.user.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Not authorized to access this course" },
        { status: 403 }
      );
    }

    return NextResponse.json(course);

  } catch (error: any) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { courseId } = params;
    const body = await request.json();

    await connectMongoDB();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (course.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        title: body.title,
        description: body.description,
        enrollmentKey: body.enrollmentKey,
        updatedAt: new Date()
      },
      { new: true }
    );

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// Add DELETE method if needed
export async function DELETE(
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

    // Find the course
    const course = await Course.findById(params.courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (course.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this course" },
        { status: 403 }
      );
    }

    // Delete the course
    await Course.findByIdAndDelete(params.courseId);

    return NextResponse.json({
      message: "Course deleted successfully"
    });

  } catch (error: any) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { 
        error: "Failed to delete course",
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
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
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Add validation for required fields
    const title = formData.get('title');
    const description = formData.get('description');
    
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Safely parse JSON data with error handling
    let lessons = [];
    try {
      const lessonsStr = formData.get('lessons');
      if (lessonsStr) {
        lessons = JSON.parse(lessonsStr as string);
      }
    } catch (e) {
      console.error('Error parsing lessons:', e);
      return NextResponse.json(
        { error: "Invalid lessons data format" },
        { status: 400 }
      );
    }

    // Handle files
    const files = formData.getAll('files');
    const fileData = files.map((file: any) => {
      if (!file || !file.name) {
        throw new Error('Invalid file data');
      }
      return {
        name: file.name,
        path: `/uploads/${file.name}`,
        type: file.type
      };
    });

    await connectMongoDB();

    // Find the course and verify ownership
    const existingCourse = await Course.findById(params.courseId);
    
    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    if (existingCourse.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this course" },
        { status: 403 }
      );
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      params.courseId,
      {
        title,
        description,
        lessons,
        files: fileData,
        enrollmentKey: formData.get('enrollmentKey') || '',
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Course updated successfully",
      course: updatedCourse
    });

  } catch (error: any) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { 
        error: "Failed to update course",
        details: error.message 
      },
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
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    const courseId = context.params.courseId;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    const courseId = context.params.courseId;
    const updateData = await request.json();

    const course = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true }
    );

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    const courseId = context.params.courseId;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Handle file upload here (e.g., to cloud storage)
    // For now, let's simulate a successful upload
    const fileUrl = `/uploads/${file.name}`; // This would be your actual upload URL

    // Update course with file info
    const course = await Course.findByIdAndUpdate(
      courseId,
      { 
        $push: { 
          files: {
            name: file.name,
            url: fileUrl,
            type: file.type,
            size: file.size
          }
        }
      },
      { new: true }
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectMongoDB();
    const course = await Course.findByIdAndDelete(params.courseId);
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
} 
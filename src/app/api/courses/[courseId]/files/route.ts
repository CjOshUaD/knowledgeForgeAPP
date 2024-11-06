import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { writeFile } from 'fs/promises';
import path from 'path';

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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    const uploadedFiles = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

      // Save file to disk
      await writeFile(filePath, buffer);

      // Add file info to course
      uploadedFiles.push({
        name: file.name,
        path: `/uploads/${fileName}`,
        type: file.type
      });
    }

    // Update course with new files
    course.files = [...(course.files || []), ...uploadedFiles];
    await course.save();

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles
    });

  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { 
        error: "Failed to upload files",
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectMongoDB } from "@/app/lib/mongodb";
import Assignment from "@/app/models/Assignment";
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string, assignmentId: string } }
) {
  try {
    await connectMongoDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log('Submission attempt:', {
      courseId: params.courseId,
      assignmentId: params.assignmentId,
      userId: session.user.id
    });

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.assignmentId)) {
      console.log('Invalid assignment ID format');
      return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
    }

    const assignment = await Assignment.findOne({
      _id: params.assignmentId,
      courseId: params.courseId
    });

    if (!assignment) {
      console.log('Assignment not found in database');
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const content = formData.get('content') as string || '';

    // Update using findOneAndUpdate for atomic operation
    const updated = await Assignment.findOneAndUpdate(
      {
        _id: params.assignmentId,
        courseId: params.courseId
      },
      {
        $push: {
          submissions: {
            userId: session.user.id,
            content: content,
            submittedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      console.log('Failed to update assignment');
      return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
    }

    console.log('Submission successful');
    return NextResponse.json({ message: "Submission successful" });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }
}
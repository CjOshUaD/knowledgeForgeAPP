import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectMongoDB } from "@/app/lib/mongodb";
import Assignment from "@/app/models/Assignment";

export async function POST(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    await connectMongoDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const assignment = await Assignment.findById(params.assignmentId);
    
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const existingSubmission = await Assignment.findOne({
      _id: params.assignmentId,
      'submissions.studentId': session.user.id
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this assignment" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const content = formData.get('content') as string || '';
    const files = formData.getAll('files');

    if (!content && files.length === 0) {
      return NextResponse.json(
        { error: "Please provide either text content or files" },
        { status: 400 }
      );
    }

    const updated = await Assignment.findByIdAndUpdate(
      params.assignmentId,
      {
        $push: {
          submissions: {
            studentId: session.user.id,
            content: content,
            files: files.length > 0 ? files.map(file => {
              const fileBlob = file as Blob;
              return {
                name: (file as File).name || 'unnamed',
                url: URL.createObjectURL(fileBlob)
              };
            }) : undefined,
            submittedAt: new Date(),
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Submission successful" });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
} 
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
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { submissionId, score, feedback } = await request.json();

    const assignment = await Assignment.findOneAndUpdate(
      {
        _id: params.assignmentId,
        "submissions._id": submissionId
      },
      {
        $set: {
          "submissions.$.score": score,
          "submissions.$.feedback": feedback,
          "submissions.$.gradedAt": new Date(),
          "submissions.$.gradedBy": session.user.id
        }
      },
      { new: true }
    );

    return NextResponse.json({ message: "Grade updated successfully" });
  } catch (error) {
    console.error('Error grading assignment:', error);
    return NextResponse.json(
      { error: "Failed to grade assignment" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Assignment from "@/app/models/Assignment";
import Quiz from "@/app/models/Quiz";
import User from "@/app/models/User";

interface SubmissionDocument {
  _id: string;
  studentId: string;
  studentName: string;
  content?: string;
  files?: { url: string; name: string; }[];
  grade?: number;
  feedback?: string;
  submittedAt: string;
  totalPoints: number;
}

interface Submission {
  _id?: string;
  userId?: string;
  studentId?: string;
  content?: string;
  files?: { url: string; name: string; }[];
  grade?: number;
  feedback?: string;
  submittedAt: Date;
}

interface Assignment {
  _id: string;
  title: string;
  content: string;
  startDateTime: string;
  endDateTime: string;
  totalPoints: number;
  submissions?: {
    userId: string;
    content: string;
    files?: {
      name: string;
      url: string;
    }[];
    submittedAt: Date;
    score?: number;
    feedback?: string;
    gradedAt?: Date;
    gradedBy?: string;
  }[];
}

interface BaseDocument {
  _id: string;
  submissions?: Submission[];
  totalPoints: number;
}

interface DocumentWithSubmissions {
  _id: string;
  submissions: Array<{
    userId: string;
    studentId: string;
    content: string;
    files?: Array<{ name: string; url: string }>;
    submittedAt: Date;
    grade?: number;
    feedback?: string;
  }>;
  totalPoints: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string, type: string, chapterIndex: string, itemIndex: string, studentId: string } }
) {
  try {
    await connectMongoDB();
    console.log('1. Params:', params);
    
    const Model = params.type === 'assignment' ? Assignment : Quiz;
    
    // Find the document and specific submission in one query
    const doc = await Model.findOne({
      courseId: params.courseId,
      'chapters.chapterIndex': parseInt(params.chapterIndex),
      'chapters.items.itemIndex': parseInt(params.itemIndex)
    }).select({
      totalPoints: 1,
      submissions: {
        $elemMatch: { studentId: params.studentId }
      }
    }).lean() as DocumentWithSubmissions;

    console.log('2. Document found:', doc);
    console.log('3. Query params:', {
      courseId: params.courseId,
      chapterIndex: parseInt(params.chapterIndex),
      itemIndex: parseInt(params.itemIndex),
      studentId: params.studentId
    });

    if (!doc) {
      return NextResponse.json({ error: "Assignment/Quiz not found" }, { status: 404 });
    }

    // Find the submission in the nested structure
    const submission = doc.submissions[0];

    if (!submission) {
      return NextResponse.json({ error: "No submission found for this student" }, { status: 404 });
    }

    const user = await User.findById(params.studentId).select('name');

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const response = {
      _id: submission.studentId,
      studentId: params.studentId,
      studentName: user.name,
      content: submission.content,
      files: submission.files,
      grade: submission.grade,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt,
      totalPoints: doc.totalPoints
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in submission route:', error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
} 
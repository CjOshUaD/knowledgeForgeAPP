import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectMongoDB();
    
    const course = await Course.findById(params.courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course.grades || []);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { studentId, grade, feedback } = await request.json();

    await connectMongoDB();
    
    const course = await Course.findOneAndUpdate(
      { 
        _id: params.courseId,
        'grades.studentId': studentId 
      },
      { 
        $set: { 
          'grades.$': {
            studentId,
            grade,
            feedback,
            updatedAt: new Date().toISOString()
          }
        }
      },
      { new: true }
    );

    if (!course) {
      // If no existing grade found, create new one
      await Course.findByIdAndUpdate(
        params.courseId,
        {
          $push: {
            grades: {
              studentId,
              grade,
              feedback,
              updatedAt: new Date().toISOString()
            }
          }
        }
      );
    }

    return NextResponse.json({ message: "Grade updated successfully" });

  } catch (error) {
    console.error('Grade update error:', error);
    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
} 
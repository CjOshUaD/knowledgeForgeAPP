import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import User from "@/app/models/User";
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

    const enrolledStudents = await User.find(
      { _id: { $in: course.enrolledStudents || [] } },
      { password: 0 }
    );

    return NextResponse.json(enrolledStudents.map(student => ({
      id: student._id,
      name: student.name,
      email: student.email
    })));
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
} 
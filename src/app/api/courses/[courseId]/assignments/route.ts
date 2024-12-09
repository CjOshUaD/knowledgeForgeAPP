import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Assignment from "@/app/models/Assignment";

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    
    const { 
      title, 
      description, 
      chapterIndex, 
      itemIndex,
      totalPoints,
      startDateTime,
      endDateTime 
    } = await request.json();

    console.log('Creating assignment with data:', {
      courseId: params.courseId,
      title,
      description,
      chapterIndex,
      itemIndex,
      totalPoints,
      startDateTime,
      endDateTime
    });

    // Create new assignment with all required fields
    const assignment = await Assignment.create({
      courseId: params.courseId,
      title,
      description,
      chapterIndex: parseInt(chapterIndex),
      itemIndex: parseInt(itemIndex),
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      totalPoints: parseInt(totalPoints),
      submissions: [] // Initialize empty submissions array
    });

    console.log('Created assignment:', assignment); // Debug log

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

// GET route to fetch assignments
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    
    const assignments = await Assignment.find({ courseId: params.courseId });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
} 
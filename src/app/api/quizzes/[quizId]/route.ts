import { NextResponse } from 'next/server';
import { connectMongoDB } from "../../../lib/mongodb";
import Quiz from '../../../models/Quiz';

export async function GET(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    console.log('Fetching quiz with ID:', params.quizId);
    await connectMongoDB();
    const quiz = await Quiz.findById(params.quizId);
    
    console.log('Found quiz:', quiz);

    if (!quiz) {
      console.log('Quiz not found');
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
} 
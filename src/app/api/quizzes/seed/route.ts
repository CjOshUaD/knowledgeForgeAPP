import { NextResponse } from 'next/server';
import { connectMongoDB } from "../../../lib/mongodb";
import Quiz from '../../../models/Quiz';

export async function GET() {
  try {
    await connectMongoDB();
    
    const testQuiz = await Quiz.create({
      title: "Test Quiz",
      duration: 30,
      totalPoints: 100,
      questions: [
        {
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1
        }
      ]
    });

    return NextResponse.json({ message: 'Test quiz created', quiz: testQuiz });
  } catch (error) {
    console.error('Error seeding quiz:', error);
    return NextResponse.json({ error: 'Failed to seed quiz' }, { status: 500 });
  }
} 
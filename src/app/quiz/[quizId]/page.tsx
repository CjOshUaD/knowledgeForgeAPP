"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  duration: number;
  totalPoints: number;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        console.log('Fetching quiz ID:', params.quizId);
        const response = await axios.get(`/api/quizzes/${params.quizId}`);
        console.log('Quiz response:', response.data);
        setQuiz(response.data);
        setTimeLeft(response.data.duration * 60);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (params.quizId) {
      fetchQuiz();
    }
  }, [params.quizId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async () => {
    try {
      await axios.post(`/api/quizzes/${params.quizId}/submit`, { answers });
      toast.success('Quiz submitted successfully!');
      router.push(`/courses/${params.courseId}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  if (loading) return <div className="p-4">Loading quiz...</div>;
  if (!quiz) return <div className="p-4">Quiz not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="sticky top-0 bg-white p-4 border-b mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <div className="text-lg font-semibold">
              Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {quiz.questions.map((question, index) => (
            <div key={question._id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">
                {index + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name={question._id}
                      value={optionIndex}
                      checked={answers[question._id] === optionIndex}
                      onChange={() => setAnswers(prev => ({
                        ...prev,
                        [question._id]: optionIndex
                      }))}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
} 
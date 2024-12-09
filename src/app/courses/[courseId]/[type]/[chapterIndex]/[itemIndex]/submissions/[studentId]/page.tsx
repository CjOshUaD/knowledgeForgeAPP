"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from "@nextui-org/react";
import Navbar from "@/app/components/NavBar";

interface Submission {
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

export default function SubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/courses/${params.courseId}/${params.type}/${params.chapterIndex}/${params.itemIndex}/submissions/${submissionId}`);
  };

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        console.log('Fetching submission with params:', params);
        const response = await axios.get(`/api/courses/${params.courseId}/${params.type}/${params.chapterIndex}/${params.itemIndex}/submissions/${params.studentId}`);
        console.log('Submission response:', response.data);
        const data = response.data;
        setSubmission(data);
        setGrade(data.grade || 0);
        setFeedback(data.feedback || '');
      } catch (error: unknown) {
        const axiosError = error as AxiosError;
        console.error('Full error:', axiosError);
        toast.error(`Failed to fetch submission: ${axiosError.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [params]);

  const handleGrade = async () => {
    try {
      await axios.post(`/api/courses/${params.courseId}/${params.type}/${params.chapterIndex}/${params.itemIndex}/grade`, {
        submissionId: submission?._id,
        grade,
        feedback
      });
      toast.success('Grade updated successfully');
      router.refresh();
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(`Failed to update grade: ${axiosError.message}`);
    }
  };

  if (loading) {
    return <div className="p-8">Loading submission...</div>;
  }

  if (!submission) {
    return <div className="p-8">No submission found.</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Student Submission</h1>
          <div className="flex gap-4">
            <Button 
              color="primary"
              size="lg"
              className="px-8 py-2 text-lg font-semibold"
              onClick={() => handleViewSubmission(submission?._id || '')}
              disabled={!submission}
            >
              View Full Submission
            </Button>
            <Button 
              color="secondary" 
              size="lg"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Student: {submission.studentName}</h2>
            <p className="text-gray-700 text-lg">
              Submitted: {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>

          {submission.content && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Submission Content:</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                {submission.content}
              </div>
            </div>
          )}

          {submission.files && submission.files.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Attachments:</h3>
              <div className="space-y-2">
                {submission.files.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    className="text-blue-500 hover:underline block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-4">Grade Submission</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Grade (out of {submission.totalPoints})
                </label>
                <input
                  type="number"
                  min="0"
                  max={submission.totalPoints}
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-24 p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <Button 
                color="primary"
                onClick={handleGrade}
              >
                Update Grade
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
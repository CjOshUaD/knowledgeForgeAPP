"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from "@/app/components/NavBar";

interface AssignmentSubmission {
  _id: string;
  userId: string;
  userName: string;
  content: string;
  files?: Array<{
    name: string;
    url: string;
  }>;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export default function AssignmentGradesPage() {
  const params = useParams();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/assignments/${params.courseId}/${params.chapterIndex}/${params.assignmentIndex}/submissions`
      );
      setSubmissions(response.data);
    } catch (error: Error | unknown) {
      console.error('Fetch error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch submissions');
    }
  }, [params.courseId, params.chapterIndex, params.assignmentIndex]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleGrade = async (submissionId: string, grade: number, feedback: string) => {
    try {
      await axios.post(
        `/api/assignments/${params.courseId}/${params.chapterIndex}/${params.assignmentIndex}/grade`,
        { submissionId, grade, feedback }
      );
      toast.success('Grade updated');
      fetchSubmissions();
    } catch (error: Error | unknown) {
      console.error('Grade update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update grade');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Assignment Submissions</h1>
        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission._id} className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h3 className="font-semibold">Student: {submission.userName}</h3>
                <p className="text-gray-600">
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium">Submission:</h4>
                <p className="whitespace-pre-wrap">{submission.content}</p>
                {submission.files?.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 block mt-2"
                  >
                    {file.name}
                  </a>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Grade</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={submission.grade || 0}
                    onChange={(e) => handleGrade(
                      submission._id, 
                      Number(e.target.value), 
                      submission.feedback || ''
                    )}
                    className="mt-1 block w-32 rounded border-gray-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Feedback</label>
                  <textarea
                    value={submission.feedback || ''}
                    onChange={(e) => handleGrade(
                      submission._id, 
                      submission.grade || 0, 
                      e.target.value
                    )}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

interface Submission {
  _id: string;
  userName: string;
  submittedAt: string;
  content: string;
  score?: number;
  feedback?: string;
  files?: { url: string; name: string; }[];
}

export default function GradeAssignments() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/assignments/${params.assignmentId}/submissions`);
      setSubmissions(response.data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(`Failed to fetch submissions: ${axiosError.message}`);
    } finally {
      setLoading(false);
    }
  }, [params.assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [params.assignmentId, fetchSubmissions]);

  const handleGrade = async (submissionId: string, score: number, feedback: string) => {
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Please enter a valid score between 0 and 100');
      return;
    }

    try {
      await axios.post(`/api/assignments/${params.assignmentId}/grade`, {
        submissionId,
        score,
        feedback
      });
      toast.success('Submission graded successfully');
      fetchSubmissions();
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(`Failed to grade submission: ${axiosError.message}`);
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading submissions...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Grade Assignments</h1>
      {submissions.length === 0 ? (
        <p className="text-gray-600">No submissions yet.</p>
      ) : (
        <div className="space-y-6">
          {submissions.map((submission) => (
            <div key={submission._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">Student: {submission.userName}</h3>
                  <p className="text-gray-600">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  submission.score !== undefined 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {submission.score !== undefined ? 'Graded' : 'Pending'}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium">Submission:</h4>
                <p className="whitespace-pre-wrap">{submission.content}</p>
              </div>

              {submission.files && submission.files.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Attachments:</h4>
                  {submission.files.map((file) => (
                    <a
                      key={file.url}
                      href={file.url}
                      className="text-blue-500 hover:underline block mb-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {file.name}
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm"
                    value={submission.score || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
                        handleGrade(submission._id, Number(value), submission.feedback || '');
                      }
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Feedback</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={3}
                    value={submission.feedback || ''}
                    onChange={(e) => handleGrade(submission._id, submission.score || 0, e.target.value)}
                    placeholder="Provide feedback to the student..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
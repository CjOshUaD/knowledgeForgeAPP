'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface FileTrackerProps {
  trackId: string;
}

export default function FileTracker({ trackId }: FileTrackerProps) {
  const [downloads, setDownloads] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`/api/files/track?trackId=${trackId}`);
        setDownloads(response.data.downloadCount);
        setStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching file stats:', error);
      }
    };

    fetchStats();
  }, [trackId]);

  return (
    <div className="text-sm text-gray-500">
      <span className="mr-4">Status: {status}</span>
      <span>Downloads: {downloads}</span>
    </div>
  );
} 
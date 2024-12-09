import { useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AssignmentForm = () => {
  const params = useParams();
  const courseId = params.courseId;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapterIndex, setChapterIndex] = useState('');
  const [itemIndex, setItemIndex] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/courses/${courseId}/assignments`, {
        title,
        description,
        chapterIndex,
        itemIndex,
        totalPoints,
        startDateTime,
        endDateTime
      });
      
      console.log('Assignment created:', response.data);
      toast.success('Assignment created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setChapterIndex('');
      setItemIndex('');
      setTotalPoints('');
      setStartDateTime('');
      setEndDateTime('');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  return (
    <form onSubmit={handleCreateAssignment} className="space-y-4">
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Chapter Index</label>
        <input
          type="number"
          value={chapterIndex}
          onChange={(e) => setChapterIndex(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Item Index</label>
        <input
          type="number"
          value={itemIndex}
          onChange={(e) => setItemIndex(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Total Points</label>
        <input
          type="number"
          value={totalPoints}
          onChange={(e) => setTotalPoints(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Start Date & Time</label>
        <input
          type="datetime-local"
          value={startDateTime}
          onChange={(e) => setStartDateTime(e.target.value)}
          required
        />
      </div>
      <div>
        <label>End Date & Time</label>
        <input
          type="datetime-local"
          value={endDateTime}
          onChange={(e) => setEndDateTime(e.target.value)}
          required
        />
      </div>
      <button type="submit">Create Assignment</button>
    </form>
  );
};

export default AssignmentForm;
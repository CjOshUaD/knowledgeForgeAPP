import mongoose from 'mongoose';

export interface FileTrack {
  courseId: string;
  chapterId?: string;
  itemId?: string;
  itemType: 'lesson' | 'assignment' | 'quiz';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadDate: Date;
  status: 'pending' | 'completed' | 'failed';
  downloadCount: number;
}

const FileTrackSchema = new mongoose.Schema<FileTrack>({
  courseId: { type: String, required: true },
  chapterId: String,
  itemId: String,
  itemType: { 
    type: String, 
    required: true,
    enum: ['lesson', 'assignment', 'quiz']
  },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  downloadCount: { type: Number, default: 0 }
});

export default mongoose.models.FileTrack || mongoose.model<FileTrack>('FileTrack', FileTrackSchema); 
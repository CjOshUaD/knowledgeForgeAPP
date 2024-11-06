import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  teacherId: {
    type: String,
    required: [true, 'Teacher ID is required'],
  },
  enrolledStudents: {
    type: [String],
    default: [],
  },
  lessons: [{
    title: String,
    content: String,
    order: Number,
  }],
  files: [{
    name: String,
    path: String,
    type: String,
  }],
  enrollmentKey: String,
}, {
  timestamps: true,
});

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  teacherId: string;
  enrolledStudents: string[];
  lessons: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  files: Array<{
    name: string;
    path: string;
    type: string;
  }>;
  enrollmentKey?: string;
}

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export default Course; 
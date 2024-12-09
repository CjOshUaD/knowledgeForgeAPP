import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String
});

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  files: [{
    name: String,
    url: String,
    type: String
  }],
  lessons: [{
    title: String,
    content: String,
    file: FileSchema
  }],
  assignments: [{
    title: String,
    content: String,
    startDateTime: String,
    endDateTime: String,
    file: FileSchema
  }],
  quizzes: [{
    title: String,
    description: String,
    questions: [{
      question: String,
      type: String,
      options: [String],
      correctAnswer: mongoose.Schema.Types.Mixed,
      points: Number
    }],
    startDateTime: String,
    endDateTime: String,
    duration: Number,
    totalPoints: Number,
    file: FileSchema
  }]
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  teacherId: { type: String, required: true },
  enrollmentKey: String,
  chapters: [ChapterSchema],
  files: [FileSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  enrolledStudents: [String],
  stats: {
    totalFiles: Number,
    filesByType: {
      lessons: Number,
      assignments: Number,
      quizzes: Number
    }
  }
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema); 
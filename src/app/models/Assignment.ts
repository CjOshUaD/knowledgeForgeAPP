import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema({
  courseId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  chapterIndex: { type: Number, required: true },
  itemIndex: { type: Number, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  totalPoints: { type: Number, required: true, default: 100 },
  submissions: [{
    userId: { type: String, required: true },
    content: { type: String },
    files: [{
      name: String,
      url: String
    }],
    submittedAt: { type: Date, default: Date.now },
    score: Number,
    feedback: String,
    gradedAt: Date,
    gradedBy: String
  }]
}, { 
  timestamps: true,
  collection: 'assignments'
});

AssignmentSchema.index({ courseId: 1, chapterIndex: 1, itemIndex: 1 });

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema); 
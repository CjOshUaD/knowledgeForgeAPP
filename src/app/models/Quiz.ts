import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema); 
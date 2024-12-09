import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  bio: {
    type: String,
    default: ''
  },
  interests: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User; 
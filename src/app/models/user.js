import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'credentials'; // Only require password for credentials provider
    },
    minlength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, "Role is required"],
    default: 'student'
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
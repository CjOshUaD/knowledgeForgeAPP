import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Must be a valid email address"],
      unique: [true, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Must provide password"],
      unique: [true, "Please enter a valid email address"],
    },
    userType: {
      type: String,
      required: true,
      enum: ["student", "teacher"],
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
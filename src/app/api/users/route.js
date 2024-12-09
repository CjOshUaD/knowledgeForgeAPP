import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcrypt";

// GET all users
export async function GET(request) {
  try {
    await connectMongoDB();
    const users = await User.find({}).select('-password');
    console.log('Retrieved users:', users); // Debug log
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST new user
export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();
    console.log('Creating user with role:', role); // Debug log

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
      role
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request) {
  try {
    const { id, name, email, password, role } = await request.json();
    console.log('Updating user with role:', role); // Debug log

    if (!['student', 'teacher'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await connectMongoDB();
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
} 
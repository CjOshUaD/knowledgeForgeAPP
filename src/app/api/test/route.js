import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";

export async function GET() {
  try {
    await connectMongoDB();
    return NextResponse.json({ message: "Database connected successfully" });
  } catch (error) {
    console.error("Connection test error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
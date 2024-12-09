import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Make sure this directory exists
const uploadsDirectory = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadsDirectory, fileName);

    // Save file
    await writeFile(filePath, buffer);

    // Return the URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      url: fileUrl,
      message: "File uploaded successfully"
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
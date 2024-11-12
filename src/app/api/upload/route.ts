import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    // Check Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      // Create a unique filename
      const timestamp = Date.now();
      const originalName = file.name;
      const filename = `${timestamp}-${originalName}`;

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create file path and write file
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      // Return the file URL
      const fileUrl = `/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        url: fileUrl,
        filename: filename
      });
    } catch (err) {
      console.error('File system error:', err);
      return NextResponse.json(
        { error: 'Failed to save file', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: error.message },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable the body parsing, Let formData handle it
  }
};
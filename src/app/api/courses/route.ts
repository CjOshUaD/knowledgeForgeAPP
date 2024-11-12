import { NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

export async function GET(request: Request) {
  
 

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = session.user.id;

    let courses: any[] = [];

    switch (type) {
      case 'enrolled':
        // Get only courses where user is enrolled but not the teacher
        courses = await Course.find({
          enrolledStudents: userId,
          teacherId: { $ne: userId }
        }).lean();
        break;

      case 'available':
        // Get courses where user is not enrolled and not the teacher
        courses = await Course.find({
          $and: [
            { teacherId: { $ne: userId } },
            { enrolledStudents: { $nin: [userId] } }
          ]
        }).lean();
        break;

      case 'teaching':
        // Get only courses where user is the teacher
        courses = await Course.find({
          teacherId: userId
        }).lean();
        break;
    }

    return NextResponse.json(courses);

  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Parse form data
    const formData = await request.formData();
    
    // Log received data
    console.log('Received form data:', {
      title: formData.get('title'),
      description: formData.get('description'),
      chaptersJson: formData.get('chapters'),
      fileCount: formData.get('fileCount')
    });

    // Basic validation
    const title = formData.get('title');
    const description = formData.get('description');
    const chaptersJson = formData.get('chapters');

    if (!title || !description || !chaptersJson) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse chapters
    const chapters = JSON.parse(chaptersJson as string);

    // Handle files
    const fileCount = parseInt(formData.get('fileCount') as string || '0');
    const files = [];
    
    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file-${i}`);
      const metadataJson = formData.get(`fileMetadata-${i}`);
      
      if (file && metadataJson) {
        const metadata = JSON.parse(metadataJson as string);
        // For now, store file info without actual upload
        files.push({
          name: metadata.name,
          type: metadata.type,
          url: '/placeholder-url' // Replace with actual file upload later
        });
      }
    }

    // Create course
    const courseData = {
      title,
      description,
      enrollmentKey: formData.get('enrollmentKey'),
      teacherId: session.user.id,
      chapters,
      files
    };

    // Log course data before saving
    console.log('Creating course with data:', courseData);

    const savedCourse = await Course.create(courseData);

    // Log saved course
    console.log('Course created successfully:', savedCourse._id);

    return NextResponse.json({
      course: savedCourse,
      message: 'Course created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in course creation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create course',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Implement your file upload function
async function uploadFile(file: FormDataEntryValue): Promise<string> {
  // Implement your file upload logic here
  // This should upload the file to your storage service and return the URL
  // Example:
  // const uploadedFile = await uploadToS3(file);
  // return uploadedFile.url;
  throw new Error('File upload not implemented');
} 
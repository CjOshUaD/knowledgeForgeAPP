import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from "@/app/lib/mongodb";
import Course from "@/app/models/Course";
import FileTrack from '@/app/models/FileTrack';

export async function POST(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    const courseId = context.params.courseId;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'lesson' | 'assignment' | 'quiz' | 'course';
    const chapterIndex = parseInt(formData.get('chapterIndex') as string);
    const itemIndex = parseInt(formData.get('itemIndex') as string);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create file tracking record
    const fileTrack = await FileTrack.create({
      courseId,
      itemType: type,
      fileName: file.name,
      fileUrl: `/uploads/${file.name}`,
      fileSize: file.size,
      status: 'pending'
    });

    // Update course with file info
    const fileData = {
      name: file.name,
      url: fileTrack.fileUrl,
      type: file.type,
      size: file.size,
      trackId: fileTrack._id
    };

    const updateQuery = {
      $push: {}
    };

    if (type === 'course') {
      updateQuery.$push = { files: fileData };
      updateQuery.$inc = {
        'stats.totalFiles': 1,
        'stats.filesByType.course': 1
      };
    } else {
      updateQuery.$push = {
        [`chapters.${chapterIndex}.${type}s.${itemIndex}.files`]: fileData
      };

      if (type === 'quiz') {
        updateQuery.$set = {
          [`chapters.${chapterIndex}.quizzes.${itemIndex}.file`]: fileData
        };
      }

      updateQuery.$inc = {
        [`stats.filesByType.${type}s`]: 1
      };
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        ...updateQuery,
        $inc: {
          'stats.totalFiles': 1,
          [`stats.filesByType.${type}s`]: 1
        }
      },
      { new: true }
    );

    if (!course) {
      await FileTrack.findByIdAndUpdate(fileTrack._id, { status: 'failed' });
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Mark file upload as completed
    await FileTrack.findByIdAndUpdate(fileTrack._id, { status: 'completed' });

    return NextResponse.json({ 
      url: fileTrack.fileUrl,
      trackId: fileTrack._id 
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    await connectMongoDB();
    const courseId = context.params.courseId;
    const { type, chapterIndex, itemIndex, fileIndex } = await request.json();

    const updateQuery = {
      $pull: {}
    };

    switch (type) {
      case 'lesson':
        updateQuery.$pull[`chapters.${chapterIndex}.lessons.${itemIndex}.files`] = { $position: fileIndex };
        break;
      case 'assignment':
        updateQuery.$pull[`chapters.${chapterIndex}.assignments.${itemIndex}.files`] = { $position: fileIndex };
        break;
      case 'quiz':
        updateQuery.$unset = {
          [`chapters.${chapterIndex}.quizzes.${itemIndex}.file`]: ""
        };
        break;
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        ...updateQuery,
        $inc: {
          'stats.totalFiles': -1,
          [`stats.filesByType.${type}s`]: -1
        }
      },
      { new: true }
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "File removed successfully" });

  } catch (error) {
    console.error('Error removing file:', error);
    return NextResponse.json(
      { error: "Failed to remove file" },
      { status: 500 }
    );
  }
}

// Add a route to track file downloads
export async function GET(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    const trackId = request.nextUrl.searchParams.get('trackId');
    if (!trackId) {
      return NextResponse.json({ error: "No tracking ID provided" }, { status: 400 });
    }

    const fileTrack = await FileTrack.findByIdAndUpdate(
      trackId,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!fileTrack) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(fileTrack);
  } catch (error) {
    console.error('Error tracking file download:', error);
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }
} 
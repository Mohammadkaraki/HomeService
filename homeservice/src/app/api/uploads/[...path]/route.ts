import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Define the uploads folder path
const UPLOADS_PATH = process.env.FILE_UPLOAD_PATH || './public/uploads';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construct full path
    const filePath = path.join(UPLOADS_PATH, ...params.path);
    console.log('Trying to serve file from:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine mime type
    let mimeType = 'application/octet-stream';
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (filePath.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (filePath.endsWith('.gif')) {
      mimeType = 'image/gif';
    } else if (filePath.endsWith('.svg')) {
      mimeType = 'image/svg+xml';
    }

    // Return the file content
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
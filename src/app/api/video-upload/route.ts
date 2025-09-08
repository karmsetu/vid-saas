import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

// Configuration
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

// interface CloudinaryUploadApiResponse extends UploadApiResponse {

// }

export const config = {
    api: {
        bodyParser: false, // ✅ Crucial for handling raw FormData streams
    },
};

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                { error: 'Cloudinary credentials not found' },
                { status: 500 }
            );
        }

        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.log({ contentType });

            return new Response('Invalid content type', { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await new Promise<UploadApiResponse>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video',
                        folder: 'video-uploads',
                        transformation: [
                            { quality: 'auto', fetch_format: 'mp4' },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result!);
                    }
                );
                uploadStream.end(buffer);
            }
        );
        const video = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize: String(file.size),
                compressedSize: String(result.bytes),
                duration: result.duration || 0,
            },
        });
        return NextResponse.json(video);
    } catch (error) {
        console.log('UPload video failed', error);
        return NextResponse.json(
            { error: 'UPload video failed' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

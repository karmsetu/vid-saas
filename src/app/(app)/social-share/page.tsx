'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CldImage } from 'next-cloudinary';
import { Download } from 'lucide-react'; // Icon for download button
import { Skeleton } from '@/components/ui/skeleton'; // For loading states

const socialFormats = {
    'Instagram Square (1:1)': { width: 1080, height: 1080, aspectRatio: '1:1' },
    'Instagram Portrait (4:5)': {
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
    },
    'Twitter Post (16:9)': { width: 1200, height: 675, aspectRatio: '16:9' },
    'Twitter Header (3:1)': { width: 1500, height: 500, aspectRatio: '3:1' },
    'Facebook Cover (205:78)': {
        width: 820,
        height: 312,
        aspectRatio: '205:78',
    },
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialShare() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
        'Instagram Square (1:1)'
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (uploadedImage) {
            setIsTransforming(true);
        }
    }, [selectedFormat, uploadedImage]);

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/image-upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            setUploadedImage(data.publicId);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image'); // Consider using a toast notification
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = () => {
        if (!imageRef.current) return;

        fetch(imageRef.current.src)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${selectedFormat
                    .replace(/\s+/g, '_')
                    .toLowerCase()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                // Note: The second removeChild(link) call was redundant and removed.
            })
            .catch((error) => {
                console.error('Download error:', error);
                alert('Failed to download image'); // Consider using a toast notification
            });
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Social Media Image Creator
            </h1>

            {/* Use shadcn Card */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl">Upload an Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="image-upload">
                            Choose an image file
                        </Label>
                        {/* Use shadcn Input with type="file" */}
                        <Input
                            id="image-upload"
                            type="file"
                            onChange={handleFileUpload}
                            disabled={isUploading} // Disable while uploading
                        />
                    </div>

                    {/* Use shadcn Skeleton for upload progress/loading */}
                    {isUploading && (
                        <div className="mt-4">
                            <Skeleton className="h-4 w-full rounded-full" />
                            {/* Or if you prefer a simple text indicator: */}
                            {/* <p className="text-sm text-muted-foreground">Uploading...</p> */}
                        </div>
                    )}

                    {uploadedImage && (
                        <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="format-select">
                                    Select Social Media Format
                                </Label>
                                {/* Use shadcn Select */}
                                <Select
                                    value={selectedFormat}
                                    onValueChange={(value) =>
                                        setSelectedFormat(value as SocialFormat)
                                    } // onValueChange provides the string value directly
                                >
                                    <SelectTrigger
                                        id="format-select"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(socialFormats).map(
                                            (format) => (
                                                <SelectItem
                                                    key={format}
                                                    value={format}
                                                >
                                                    {format}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    Preview:
                                </h3>
                                <div className="flex justify-center items-center relative min-h-[200px]">
                                    {' '}
                                    {/* Added min height for better layout during loading */}
                                    {/* Use shadcn Skeleton for transformation loading */}
                                    {isTransforming && (
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            <Skeleton className="h-full w-full rounded-xl" />{' '}
                                            {/* Covers the image area */}
                                            {/* Or just a spinner overlay: */}
                                            {/* <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm z-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                             </div> */}
                                        </div>
                                    )}
                                    {/* CldImage remains, but wrapped for better layout */}
                                    <div className="relative">
                                        {' '}
                                        {/* Wrapper for CldImage */}
                                        <CldImage
                                            width={
                                                socialFormats[selectedFormat]
                                                    .width
                                            }
                                            height={
                                                socialFormats[selectedFormat]
                                                    .height
                                            }
                                            src={uploadedImage}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px" // Adjust sizes as needed for responsiveness
                                            alt="Transformed image"
                                            crop="fill"
                                            aspectRatio={
                                                socialFormats[selectedFormat]
                                                    .aspectRatio
                                            }
                                            gravity="auto"
                                            ref={imageRef}
                                            onLoad={() =>
                                                setIsTransforming(false)
                                            }
                                            className="rounded-lg shadow-md" // Optional styling
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                {/* Use CardFooter for the download button if image is uploaded */}
                {uploadedImage && (
                    <CardFooter className="flex justify-end">
                        {/* Use shadcn Button with icon */}
                        <Button onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download for {selectedFormat}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

// components/VideoCard.tsx (or similar path)

import React, { useState, useEffect, useCallback } from 'react';
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary';
import {
    Download,
    Clock,
    FileUp,
    FileDown,
    EyeOff, // Icon for preview error
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Fixed typo: 'realtiveTime' -> 'relativeTime'
import { filesize } from 'filesize';
import { Video } from '@/types';

// Import shadcn components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

dayjs.extend(relativeTime);

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: 'fill',
            gravity: 'auto',
            format: 'jpg',
            quality: 'auto',
            assetType: 'video',
        });
    }, []);

    const getFullVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 1920,
            height: 1080,
        });
    }, []);

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            rawTransformations: [
                'e_preview:duration_15:max_seg_9:min_seg_dur_1',
            ],
        });
    }, []);

    const formatSize = useCallback((size: number) => {
        // Ensure filesize returns a string
        const sizeObj = filesize(size, { output: 'string' });
        return sizeObj;
    }, []);

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    const compressionPercentage = Math.round(
        (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
    );

    useEffect(() => {
        setPreviewError(false);
    }, [isHovered]);

    const handlePreviewError = () => {
        setPreviewError(true);
    };

    return (
        // Wrap in TooltipProvider if not already present in a parent component
        <TooltipProvider>
            {/* Use shadcn Card */}
            <Card
                className="w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-xl" // Adjusted shadow class
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Video Thumbnail/Preview */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    {' '}
                    {/* Use a div for the figure/aspect ratio */}
                    {isHovered ? (
                        previewError ? (
                            // Preview Error State
                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                                <EyeOff className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground text-center px-2">
                                    Preview not available
                                </p>
                            </div>
                        ) : (
                            // Preview Video
                            <video
                                src={getPreviewVideoUrl(video.publicId)}
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                                onError={handlePreviewError}
                            />
                        )
                    ) : (
                        // Static Thumbnail
                        <img
                            src={getThumbnailUrl(video.publicId)}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            // Consider adding onError handler for thumbnail too if needed
                        />
                    )}
                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 bg-background/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium flex items-center">
                        <Clock size={14} className="mr-1" />
                        {formatDuration(video.duration)}
                    </div>
                </div>

                {/* Card Content */}
                <CardHeader className="p-4 pb-2">
                    {' '}
                    {/* Adjust padding */}
                    <CardTitle className="text-lg line-clamp-1">
                        {video.title}
                    </CardTitle>{' '}
                    {/* line-clamp for title overflow */}
                    <CardDescription className="text-sm line-clamp-2">
                        {' '}
                        {/* line-clamp for description overflow */}
                        {video.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                        Uploaded {dayjs(video.createdAt).fromNow()}
                    </p>
                    {/* File Sizes Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start">
                            {' '}
                            {/* items-start for better icon alignment */}
                            <FileUp
                                size={16}
                                className="mr-2 mt-0.5 text-primary flex-shrink-0"
                            />{' '}
                            {/* mt-0.5 for slight vertical alignment, flex-shrink-0 prevents icon shrinking */}
                            <div>
                                <div className="font-medium">Original</div>
                                <div className="text-muted-foreground">
                                    {formatSize(Number(video.originalSize))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <FileDown
                                size={16}
                                className="mr-2 mt-0.5 text-secondary flex-shrink-0"
                            />
                            <div>
                                <div className="font-medium">Compressed</div>
                                <div className="text-muted-foreground">
                                    {formatSize(Number(video.compressedSize))}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                {/* Card Footer with Compression and Download */}
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="text-sm font-medium cursor-help">
                                Compression:{' '}
                                <span className="text-primary">
                                    {compressionPercentage}%
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Space saved through compression</p>
                        </TooltipContent>
                    </Tooltip>
                    {/* Use shadcn Button */}
                    <Button
                        size="sm" // Small size
                        onClick={() =>
                            onDownload(
                                getFullVideoUrl(video.publicId),
                                video.title
                            )
                        }
                    >
                        <Download size={16} />
                        <span className="sr-only">Download</span>{' '}
                        {/* Accessible label for icon-only button */}
                    </Button>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
};

export default VideoCard;

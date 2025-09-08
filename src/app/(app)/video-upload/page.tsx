// app/components/VideoUpload.tsx

'use client';

import React, { useState } from 'react';
// Make sure axios types are available (usually included with axios)
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormStatus } from 'react-dom';
import { Alert, AlertDescription } from '@/components/ui/alert'; // For messages
import { AlertCircle, CheckCircle } from 'lucide-react'; // Icons for alerts
// --- Type Definitions ---

// Define the structure of the state returned by the action
type VideoUploadState = {
    message: string;
    // You could add more fields like error codes, success flags, etc.
    // success?: boolean;
} | null; // State can also be null initially

// Define the type for the action function
// useActionState expects this signature for the action
type VideoUploadAction = (
    prevState: VideoUploadState,
    formData: FormData
) => Promise<VideoUploadState>;

// --- Child Component for Submit Button ---
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Uploading...' : 'Upload Video'}
        </Button>
    );
}

// --- Main Component ---
export default function VideoUpload() {
    const router = useRouter();
    const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70 MB

    // --- Action Function ---
    // This async function handles the form submission logic for useActionState
    const uploadVideoAction: VideoUploadAction = async (
        prevState,
        formData
    ) => {
        // prevState is the previous state returned by this action (or initial state)
        // formData is automatically provided by the form submission

        // Get form data fields
        const file = formData.get('file');
        const title = formData.get('title');
        const description = formData.get('description');
        // const originalSize = formData.get("originalSize"); // Optional, if you have an input for it

        // Type guard and validation for the file
        if (!file || !(file instanceof File)) {
            // Return an error state if file is missing or invalid
            return { message: 'No file selected or invalid file.' };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            // Return an error state for file size
            return { message: 'File size too large (max 70MB).' };
        }

        // Optional: Client-side validation for title if needed beyond 'required'
        // if (!title || typeof title !== 'string') { ... }

        try {
            // Make the API request using the FormData
            // Axios should handle setting the correct Content-Type for FormData
            console.log({ formData });
            const response = await axios.post('/api/video-upload', formData);
            console.log({ response });

            // Axios throws an error for non-2xx status by default,
            // so reaching here usually means success (2xx status).
            // You might want more specific success handling based on your API response.

            // Example: Check for a specific success status if needed
            // if (response.status === 200 || response.status === 201) {
            // Signal success - could be just a message or a flag
            // Redirect is handled by router.push below or via useEffect if preferred
            router.push('/'); // Redirect on successful upload
            return { message: 'Upload successful!' }; // Or return null/success flag
            // } else {
            //    // Handle unexpected success status codes if they shouldn't trigger redirect
            //    return { message: `Upload completed with status: ${response.status}` };
            // }
        } catch (error: unknown) {
            // Use 'unknown' for broader error handling
            console.error('Upload error:', error);
            // Return an error state
            let errorMessage = 'An unexpected error occurred during upload.';

            // Type guard to check if it's an Axios error
            if (axios.isAxiosError(error)) {
                // Access Axios-specific error properties safely
                errorMessage =
                    error.response?.data?.message || // Error message from server response body
                    error.response?.statusText || // HTTP status text (e.g., "Not Found")
                    error.message || // General Axios error message
                    errorMessage; // Fallback
            } else if (error instanceof Error) {
                // Fallback for generic JS errors
                errorMessage = error.message;
            }
            // If it's some other type of error, use the default message

            return { message: `Upload failed: ${errorMessage}` };
        }
    };

    // --- useActionState Hook ---
    // Manages the action, pending state, and result state
    // Initial state is null (no message)
    const [state, formAction, isPending] = React.useActionState<
        VideoUploadState,
        FormData
    >(
        uploadVideoAction,
        null // Initial state
    );

    return (
        <div className="container mx-auto py-8 px-4 max-w-md">
            {' '}
            {/* Adjusted container padding and max width */}
            <Card>
                {' '}
                {/* Use Card for main container */}
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Upload Video
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Display error or success message from action state using shadcn Alert */}
                    {state?.message && (
                        <Alert
                            variant={
                                state.message.includes('failed') ||
                                state.message.includes('too large') ||
                                state.message.includes('unexpected')
                                    ? 'destructive'
                                    : 'default'
                            }
                            className="mb-4"
                        >
                            {state.message.includes('failed') ||
                            state.message.includes('too large') ||
                            state.message.includes('unexpected') ? (
                                <AlertCircle className="h-4 w-4" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form using action */}
                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="Enter video title"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter video description"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">Video File (Max 70MB)</Label>
                            <Input
                                type="file"
                                id="file"
                                name="file"
                                accept="video/*"
                                required
                            />
                        </div>

                        {/* Use the enhanced SubmitButton component */}
                        <SubmitButton />

                        {/* Optionally display overall pending state if needed outside button */}
                        {/* {isPending && <p className="text-center text-muted-foreground">Processing upload...</p>} */}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Optional: Enhanced Client-Side Validation (Controlled State Example) ---
// If you want immediate feedback (e.g., instant file size check on selection)
// while still using the action for submission:
/*
const [selectedFile, setSelectedFile] = useState<File | null>(null);

// Inside the file input's onChange:
onChange={(e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.size > MAX_FILE_SIZE) {
      alert("Selected file is too large (max 70MB).");
      e.target.value = ''; // Clear the input
      setSelectedFile(null);
      // Note: This alert/error is client-side only.
      // The action's validation still applies on submit.
    } else {
      setSelectedFile(file);
    }
  } else {
    setSelectedFile(null);
  }
}}

// In the action, you would still get the file from formData.get('file').
// The `selectedFile` state is for UX, not the submission source.
// The hidden input for originalSize is less relevant if calculated in action.
*/

import React, { useState, useRef, useCallback } from "react";
import { Upload, X, FileVideo, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";

interface VideoUploaderProps {
  onVideoUploaded?: (file: File, url: string, publicId?: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

const VideoUploader = ({
  onVideoUploaded = () => {},
  maxSizeMB = 100,
  acceptedFormats = ["video/mp4", "video/webm", "video/quicktime"],
}: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging],
  );

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      setErrorMessage(
        `Invalid file format. Please upload ${acceptedFormats.join(", ")}`,
      );
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setErrorMessage(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) {
      setUploadStatus("error");
      return;
    }

    setErrorMessage(null);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Get Cloudinary configuration
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset =
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "video_borders";

      if (!cloudName) {
        throw new Error(
          "Cloudinary cloud name not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in your environment variables.",
        );
      }

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("resource_type", "video");

      // Upload to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      };

      // Handle upload completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log("Cloudinary upload successful:", response);

          setUploadStatus("success");
          setUploadProgress(100);

          // Call the callback with file, secure_url, and public_id
          onVideoUploaded(file, response.secure_url, response.public_id);
        } else {
          throw new Error(
            `Upload failed with status ${xhr.status}: ${xhr.responseText}`,
          );
        }
      };

      // Handle upload errors
      xhr.onerror = () => {
        throw new Error("Network error during upload");
      };

      // Start the upload
      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed");
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetUploader = () => {
    setUploadStatus("idle");
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="bg-white w-full max-w-3xl mx-auto">
      <div
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"} ${uploadStatus === "error" ? "border-red-500 bg-red-50" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {uploadStatus === "idle" && (
          <>
            <FileVideo className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Drag and drop your video here
            </h3>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button onClick={triggerFileInput} variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Browse files
            </Button>
            <p className="mt-4 text-xs text-gray-500">
              Supported formats: {acceptedFormats.join(", ")} (Max: {maxSizeMB}
              MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.join(",")}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </>
        )}

        {uploadStatus === "uploading" && (
          <div className="w-full max-w-md">
            <h3 className="text-lg font-medium mb-2">Uploading video...</h3>
            <Progress value={uploadProgress} className="h-2 mb-2" />
            <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload Complete!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your video has been uploaded successfully
            </p>
            <Button onClick={resetUploader} variant="outline" size="sm">
              Upload another video
            </Button>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload Failed</h3>
            <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
            <Button onClick={resetUploader} variant="outline" size="sm">
              Try again
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoUploader;

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import VideoPlayer from "./VideoPlayer";
import { Button } from "./ui/button";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "./ui/progress";

interface VideoTrimmerProps {
  videoSrc: string;
  videoFile: File | null;
  inPoint: number | null;
  outPoint: number | null;
  onInPointSet: (time: number) => void;
  onOutPointSet: (time: number | null) => void;
  onTrimComplete?: (url: string) => void;
}

const VideoTrimmer = ({
  videoSrc,
  videoFile,
  inPoint,
  outPoint,
  onInPointSet,
  onOutPointSet,
  onTrimComplete,
}: VideoTrimmerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const uploadTrimmedVideo = async () => {
    if (!videoFile || inPoint === null || outPoint === null) {
      setErrorMessage("Please select in and out points before uploading");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    // Using hardcoded 'video_borders' preset for consistency
    const uploadPreset = "video_borders";

    if (!cloudName) {
      setUploadStatus("error");
      setErrorMessage(
        "Cloudinary cloud name is missing. Please check your environment variables.",
      );
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "video");
    formData.append("folder", "trimmed_videos");

    // Add trimming parameters
    const startOffset = Math.floor(inPoint);
    const endOffset = Math.ceil(outPoint);
    const duration = endOffset - startOffset;

    // Add transformation parameters for trimming
    formData.append(
      "transformation",
      JSON.stringify({
        start_offset: startOffset,
        end_offset: endOffset,
        duration: duration,
      }),
    );

    try {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        true,
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          console.log("✅ Cloudinary upload successful!");
          console.log("Full response:", response);
          console.log("Cloudinary URL:", response.secure_url);

          setCloudinaryUrl(response.secure_url);
          setUploadStatus("success");

          if (onTrimComplete) {
            onTrimComplete(response.secure_url);
          }
        } else {
          setUploadStatus("error");
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const errorMsg = `Upload failed: ${errorResponse.error?.message || xhr.status}`;
            setErrorMessage(errorMsg);
            console.error("❌ Cloudinary error:", errorResponse);
          } catch (e) {
            const errorMsg = `Upload failed with status: ${xhr.status}`;
            setErrorMessage(errorMsg);
            console.error("❌ Cloudinary error:", errorMsg);
          }
        }
      };

      xhr.onerror = () => {
        setUploadStatus("error");
        setErrorMessage("Network error occurred during upload");
        console.error("Network error during upload");
      };

      xhr.send(formData);
    } catch (error) {
      setUploadStatus("error");
      setErrorMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error("Upload error:", error);
    }
  };

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>Trim Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <VideoPlayer
          videoSrc={videoSrc}
          onTimeUpdate={handleTimeUpdate}
          onInPointSet={onInPointSet}
          onOutPointSet={onOutPointSet}
          inPoint={inPoint}
          outPoint={outPoint}
        />

        {inPoint !== null && outPoint !== null && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-sm font-medium text-blue-800">
              Selected clip: {formatTime(inPoint)} to {formatTime(outPoint)}{" "}
              (Duration: {formatTime(outPoint - inPoint)})
            </p>
          </div>
        )}

        {uploadStatus === "uploading" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Uploading trimmed video...
              </span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadStatus === "success" && cloudinaryUrl && (
          <div className="flex flex-col gap-3 text-green-600 bg-green-50 p-3 rounded border border-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Upload successful!</span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Trimmed video URL:</span>{" "}
              <a
                href={cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {cloudinaryUrl}
              </a>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded border border-red-100">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{errorMessage || "Upload failed"}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={uploadTrimmedVideo}
          disabled={
            !videoFile ||
            inPoint === null ||
            outPoint === null ||
            uploadStatus === "uploading"
          }
          className="w-full"
        >
          {uploadStatus === "uploading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Trimmed Video to Cloudinary
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoTrimmer;

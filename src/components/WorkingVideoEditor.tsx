import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Scissors,
} from "lucide-react";

interface WorkingVideoEditorProps {
  videoUrl?: string;
}

const WorkingVideoEditor: React.FC<WorkingVideoEditorProps> = ({
  videoUrl = "https://res.cloudinary.com/demo/video/upload/v1611764980/samples/elephants.mp4",
}) => {
  // Create a direct reference to the video element
  const videoRef = useRef<HTMLVideoElement>(null);

  // State for tracking video information
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markIn, setMarkIn] = useState<number | null>(null);
  const [markOut, setMarkOut] = useState<number | null>(null);

  // Set up event listeners when the component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.error("Video element not found on mount");
      return;
    }

    console.log("Video element found on mount:", video);

    // Event handlers
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    // Add event listeners
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    // Check for subclip end during playback
    const checkSubclipEnd = () => {
      if (markOut !== null && video.currentTime >= markOut) {
        video.pause();
      }
    };
    video.addEventListener("timeupdate", checkSubclipEnd);

    // Clean up event listeners on unmount
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", checkSubclipEnd);
    };
  }, [markOut]);

  // Control handlers - defined OUTSIDE of useEffect
  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    // If we have a mark in point and we're before it, start from there
    if (markIn !== null && video.currentTime < markIn) {
      video.currentTime = markIn;
    }

    video
      .play()
      .then(() => console.log("Video playing"))
      .catch((err) => console.error("Error playing video:", err));
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  };

  const handleStop = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const handleSkipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 5);
  };

  const handleSkipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, video.currentTime + 5);
  };

  const handleStepBack = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 1 / 30); // Assuming 30fps
  };

  const handleMarkIn = () => {
    const video = videoRef.current;
    if (!video) return;
    setMarkIn(video.currentTime);
  };

  const handleMarkOut = () => {
    const video = videoRef.current;
    if (!video) return;
    setMarkOut(video.currentTime);
  };

  const handlePreviewSubclip = () => {
    const video = videoRef.current;
    if (!video) return;

    if (markIn === null || markOut === null || markIn >= markOut) {
      alert("Please set valid mark in and mark out points");
      return;
    }

    video.currentTime = markIn;
    video
      .play()
      .then(() =>
        console.log(
          `Playing subclip from ${markIn.toFixed(2)}s to ${markOut.toFixed(2)}s`,
        ),
      )
      .catch((err) => console.error("Error playing subclip:", err));
  };

  // Format time as MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Working Video Editor</h2>

      {/* Video element */}
      <div className="bg-black rounded-md overflow-hidden mb-4">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto"
          preload="auto"
          crossOrigin="anonymous"
        />
      </div>

      {/* Time display */}
      <div className="flex justify-between mb-4 text-sm">
        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <span>
          {markIn !== null && markOut !== null
            ? `Subclip: ${formatTime(markIn)} - ${formatTime(markOut)} (${formatTime(markOut - markIn)})`
            : "No subclip selected"}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 bg-gray-200 rounded-full mb-4 cursor-pointer"
        onClick={(e) => {
          if (!videoRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          videoRef.current.currentTime = pos * duration;
        }}
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
        />

        {/* Mark in/out indicators */}
        {markIn !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-500 z-10"
            style={{ left: `${(markIn / Math.max(duration, 1)) * 100}%` }}
          />
        )}

        {markOut !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
            style={{ left: `${(markOut / Math.max(duration, 1)) * 100}%` }}
          />
        )}

        {/* Selected region */}
        {markIn !== null && markOut !== null && (
          <div
            className="absolute top-0 bottom-0 bg-blue-200"
            style={{
              left: `${(markIn / Math.max(duration, 1)) * 100}%`,
              width: `${((markOut - markIn) / Math.max(duration, 1)) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <Button variant="outline" size="sm" onClick={handleSkipBackward}>
          <SkipBack className="h-4 w-4 mr-1" /> -5s
        </Button>

        <Button variant="outline" size="sm" onClick={handleStepBack}>
          <SkipBack className="h-4 w-4 mr-1" /> -1f
        </Button>

        {isPlaying ? (
          <Button variant="outline" size="sm" onClick={handlePause}>
            <Pause className="h-4 w-4 mr-1" /> Pause
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={handlePlay}>
            <Play className="h-4 w-4 mr-1" /> Play
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={handleStop}>
          <Square className="h-4 w-4 mr-1" /> Stop
        </Button>

        <Button variant="outline" size="sm" onClick={handleSkipForward}>
          <SkipForward className="h-4 w-4 mr-1" /> +5s
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkIn}
          className="border-green-500"
        >
          Mark In
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkOut}
          className="border-red-500"
        >
          Mark Out
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewSubclip}
          disabled={markIn === null || markOut === null || markIn >= markOut}
        >
          <Scissors className="h-4 w-4 mr-1" /> Preview Subclip
        </Button>
      </div>

      {/* Debug info */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
        <p>
          Video element:{" "}
          {videoRef.current ? "✅ Available" : "❌ Not available"}
        </p>
        <p>Current time: {currentTime.toFixed(2)}s</p>
        <p>Duration: {duration.toFixed(2)}s</p>
        <p>Mark In: {markIn !== null ? `${markIn.toFixed(2)}s` : "Not set"}</p>
        <p>
          Mark Out: {markOut !== null ? `${markOut.toFixed(2)}s` : "Not set"}
        </p>
      </div>
    </div>
  );
};

export default WorkingVideoEditor;

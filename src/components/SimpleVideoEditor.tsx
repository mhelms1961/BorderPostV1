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

interface SimpleVideoEditorProps {
  videoUrl?: string;
  cloudinaryPublicId?: string;
}

const SimpleVideoEditor: React.FC<SimpleVideoEditorProps> = ({
  videoUrl = "https://res.cloudinary.com/demo/video/upload/v1611764980/samples/elephants.mp4",
  cloudinaryPublicId,
}) => {
  // Create a single video reference that will be used throughout the component
  const videoRef = useRef<HTMLVideoElement>(null);

  // State for video playback information
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markIn, setMarkIn] = useState<number | null>(null);
  const [markOut, setMarkOut] = useState<number | null>(null);

  // Debug video element on mount
  useEffect(() => {
    console.log("SimpleVideoEditor mounted");
    if (!videoRef.current) {
      console.error("❌ videoRef is null on mount");
    } else {
      console.log("✅ videoRef initialized:", videoRef.current);
    }

    // Clean up any event listeners on unmount
    return () => {
      if (videoRef.current) {
        console.log("Cleaning up video element event listeners");
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  // Initialize video metadata when loaded
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.log("Video metadata loaded:", {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    });
    setDuration(video.duration);
    setMarkOut(video.duration); // Initialize mark out to end of video
  };

  // Update current time during playback
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Check if we've reached the mark out point during playback
      if (markOut !== null && videoRef.current.currentTime >= markOut) {
        videoRef.current.pause();
        setIsPlaying(false);
        console.log(`Reached mark out point at ${markOut.toFixed(2)}s`);
      }
    }
  };

  // Play button handler
  const handlePlay = () => {
    console.log("Play button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot play: videoRef is null");
      return;
    }

    // If we have mark in/out points, start from mark in
    if (markIn !== null && videoRef.current.currentTime < markIn) {
      videoRef.current.currentTime = markIn;
    }

    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        console.log("✅ Video playing");
      })
      .catch((error) => {
        console.error("❌ Error playing video:", error);
      });
  };

  // Pause button handler
  const handlePause = () => {
    console.log("Pause button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot pause: videoRef is null");
      return;
    }

    videoRef.current.pause();
    setIsPlaying(false);
    console.log("✅ Video paused");
  };

  // Stop button handler
  const handleStop = () => {
    console.log("Stop button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot stop: videoRef is null");
      return;
    }

    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
    console.log("✅ Video stopped");
  };

  // Skip backward button handler
  const handleSkipBackward = () => {
    console.log("Skip backward button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot skip backward: videoRef is null");
      return;
    }

    const newTime = Math.max(0, videoRef.current.currentTime - 5);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    console.log(`✅ Skipped backward to ${newTime.toFixed(2)}s`);
  };

  // Skip forward button handler
  const handleSkipForward = () => {
    console.log("Skip forward button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot skip forward: videoRef is null");
      return;
    }

    const newTime = Math.min(duration, videoRef.current.currentTime + 5);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    console.log(`✅ Skipped forward to ${newTime.toFixed(2)}s`);
  };

  // Mark in button handler
  const handleMarkIn = () => {
    console.log("Mark in button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot mark in: videoRef is null");
      return;
    }

    const time = videoRef.current.currentTime;
    setMarkIn(time);
    console.log(`✅ Marked IN point at ${time.toFixed(2)}s`);
  };

  // Mark out button handler
  const handleMarkOut = () => {
    console.log("Mark out button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot mark out: videoRef is null");
      return;
    }

    const time = videoRef.current.currentTime;
    setMarkOut(time);
    console.log(`✅ Marked OUT point at ${time.toFixed(2)}s`);
  };

  // Preview subclip button handler
  const handlePreviewSubclip = () => {
    console.log("Preview subclip button clicked");
    if (!videoRef.current) {
      console.error("❌ Cannot preview subclip: videoRef is null");
      return;
    }

    if (markIn === null || markOut === null || markIn >= markOut) {
      console.error("❌ Invalid mark in/out points");
      alert("Please set valid mark in and mark out points");
      return;
    }

    // Set video to mark in point
    videoRef.current.currentTime = markIn;

    // Play the video
    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        console.log(
          `✅ Playing subclip from ${markIn.toFixed(2)}s to ${markOut.toFixed(2)}s`,
        );
      })
      .catch((error) => {
        console.error("❌ Error playing subclip:", error);
      });
  };

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Simple Video Editor</h2>

      {/* Video element */}
      <div className="relative mb-4 bg-black rounded-md overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
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
          const newTime = pos * duration;
          videoRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }}
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />

        {/* Mark in indicator */}
        {markIn !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-500 z-10"
            style={{ left: `${(markIn / duration) * 100}%` }}
          />
        )}

        {/* Mark out indicator */}
        {markOut !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
            style={{ left: `${(markOut / duration) * 100}%` }}
          />
        )}

        {/* Selected region */}
        {markIn !== null && markOut !== null && (
          <div
            className="absolute top-0 bottom-0 bg-blue-200"
            style={{
              left: `${(markIn / duration) * 100}%`,
              width: `${((markOut - markIn) / duration) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSkipBackward}
          title="Skip backward 5 seconds"
        >
          <SkipBack className="h-4 w-4 mr-1" /> -5s
        </Button>

        {isPlaying ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            title="Pause"
          >
            <Pause className="h-4 w-4 mr-1" /> Pause
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={handlePlay} title="Play">
            <Play className="h-4 w-4 mr-1" /> Play
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={handleStop} title="Stop">
          <Square className="h-4 w-4 mr-1" /> Stop
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSkipForward}
          title="Skip forward 5 seconds"
        >
          <SkipForward className="h-4 w-4 mr-1" /> +5s
        </Button>

        <div className="w-full my-2"></div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkIn}
          className="border-green-500"
          title="Mark In"
        >
          Mark In
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkOut}
          className="border-red-500"
          title="Mark Out"
        >
          Mark Out
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewSubclip}
          disabled={markIn === null || markOut === null || markIn >= markOut}
          title="Preview Subclip"
        >
          <Scissors className="h-4 w-4 mr-1" /> Preview Subclip
        </Button>
      </div>

      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Video element status:{" "}
          {videoRef.current ? "✅ Available" : "❌ Not available"}
        </p>
        <p>Current time: {currentTime.toFixed(2)}s</p>
        <p>Mark In: {markIn !== null ? `${markIn.toFixed(2)}s` : "Not set"}</p>
        <p>
          Mark Out: {markOut !== null ? `${markOut.toFixed(2)}s` : "Not set"}
        </p>
      </div>
    </div>
  );
};

export default SimpleVideoEditor;

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Scissors,
  Download,
  RefreshCw,
} from "lucide-react";
import VideoFilmstrip from "./VideoFilmstrip";

interface VideoEditorProps {
  videoUrl?: string;
  videoFile?: File | null;
  borderWidth?: number;
  borderColor?: string;
  cloudName?: string;
  publicId?: string;
}

export default function VideoEditor({
  videoUrl: propVideoUrl,
  videoFile: propVideoFile,
  borderWidth = 4,
  borderColor = "white",
  cloudName = "demo",
  publicId = "",
}: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markIn, setMarkIn] = useState<number | null>(null);
  const [markOut, setMarkOut] = useState<number | null>(null);
  const [videoInitialized, setVideoInitialized] = useState(false);

  // Debug: Check if videoRef is initialized on mount
  useEffect(() => {
    if (!videoRef.current) {
      console.warn("videoRef.current is null on mount");
    } else {
      console.log("videoRef initialized correctly");
      setVideoInitialized(true);
    }
  }, []);

  // Use provided videoUrl or create object URL for the video file
  useEffect(() => {
    if (propVideoUrl) {
      setLocalVideoUrl(propVideoUrl);
    } else if (propVideoFile) {
      const url = URL.createObjectURL(propVideoFile);
      setLocalVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [propVideoUrl, propVideoFile]);

  // Initialize markOut when video metadata is loaded
  useEffect(() => {
    if (duration > 0 && markOut === null) {
      setMarkOut(duration);
    }
  }, [duration, markOut]);

  // Core video controls - defined to always access videoRef.current at call time
  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Error playing video:", err));
    } else {
      console.error("Cannot play: video element not found");
    }
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    } else {
      console.error("Cannot pause: video element not found");
    }
  };

  const handleStop = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
      // Keep the current time position instead of resetting to 0
    } else {
      console.error("Cannot stop: video element not found");
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    } else {
      console.error("Cannot seek: video element not found");
    }
  };

  const handleSkipBackward = () => {
    const video = videoRef.current;
    if (video) {
      const newTime = Math.max(0, video.currentTime - 5);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.error("Cannot skip backward: video element not found");
    }
  };

  const handleSkipForward = () => {
    const video = videoRef.current;
    if (video) {
      const newTime = Math.min(duration, video.currentTime + 5);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    } else {
      console.error("Cannot skip forward: video element not found");
    }
  };

  // Handle video events
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      console.log("Video metadata loaded, duration:", video.duration);
      setDuration(video.duration);
      // Initialize markOut to the end of the video if not already set
      if (markOut === null) {
        setMarkOut(video.duration);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  // Subclip handling
  const handleMarkIn = () => {
    const video = videoRef.current;
    if (video) {
      const time = video.currentTime;
      setMarkIn(time);
      console.log(`Marked IN point at ${time.toFixed(2)}s`);
    } else {
      console.error("Cannot mark in: video element not found");
    }
  };

  const handleMarkOut = () => {
    const video = videoRef.current;
    if (video) {
      const time = video.currentTime;
      setMarkOut(time);
      console.log(`Marked OUT point at ${time.toFixed(2)}s`);
    } else {
      console.error("Cannot mark out: video element not found");
    }
  };

  const handlePreviewSubclip = () => {
    const video = videoRef.current;
    if (!video) {
      console.error("Cannot preview subclip: video element not found");
      return;
    }

    // Default to full video if marks aren't set
    const startTime = markIn !== null ? markIn : 0;
    const endTime = markOut !== null ? markOut : duration;

    if (endTime <= startTime) {
      console.error(
        "Invalid subclip: end time must be greater than start time",
      );
      return;
    }

    // Set video to start time
    video.currentTime = startTime;

    // Play the video
    video
      .play()
      .then(() => {
        setIsPlaying(true);
        console.log(`Playing subclip from ${startTime}s to ${endTime}s`);
      })
      .catch((err) => console.error("Error playing video:", err));

    // Remove any existing listeners to avoid duplicates
    const existingListener = video._stopAtOutListener;
    if (existingListener) {
      video.removeEventListener("timeupdate", existingListener);
    }

    // Set up a listener to pause at end time
    const stopAtOut = () => {
      if (!video) return;

      if (video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        video.removeEventListener("timeupdate", stopAtOut);
        console.log(`Reached end of subclip at ${endTime}s`);
      }
    };

    // Store the listener reference for cleanup
    video._stopAtOutListener = stopAtOut;
    video.addEventListener("timeupdate", stopAtOut);
  };

  const getExportUrl = () => {
    if (markIn !== null && markOut !== null && markOut > markIn && publicId) {
      const so = markIn.toFixed(2);
      const eo = markOut.toFixed(2);
      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Include border transformation if borderWidth is specified
      const borderTransform =
        borderWidth > 0
          ? `l_Border_1080_${borderWidth}px/e_overlay/fl_layer_apply/`
          : "";

      // Use a simpler URL format that's more reliable for direct downloads
      // The fl_attachment flag helps browsers recognize this as a downloadable file
      // Use slashes instead of commas to avoid URL encoding issues
      return `https://res.cloudinary.com/${cloudName}/video/upload/so_${so}/eo_${eo}/${borderTransform}fl_attachment/${cleanPublicId}.mp4`;
    }
    return null;
  };

  const handleExport = () => {
    const url = getExportUrl();
    if (url) window.open(url, "_blank");
    else alert("Set valid Mark In and Mark Out before exporting.");
  };

  const handleDownloadSubclip = async () => {
    const url = getExportUrl();
    if (url) {
      // Include the duration in the filename for clarity
      const duration =
        markIn !== null && markOut !== null
          ? (markOut - markIn).toFixed(2)
          : "unknown";
      const filename = `subclip_${markIn?.toFixed(2)}s_to_${markOut?.toFixed(2)}s_duration_${duration}s.mp4`;

      console.log(
        `Downloading subclip from ${markIn?.toFixed(2)}s to ${markOut?.toFixed(2)}s (duration: ${duration}s)`,
      );
      console.log("Download URL:", url);

      try {
        // Skip the window.open approach as it causes redirection instead of download
        // Import the download utility directly
        const { downloadCloudinaryVideo } = await import(
          "@/lib/download-utils"
        );

        // Use the utility function to handle the download
        await downloadCloudinaryVideo(url, filename);
        console.log("✅ Download initiated successfully via utility");
      } catch (error) {
        console.error("❌ Download failed:", error);
        alert(
          `Download failed: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
        );
      }
    } else {
      alert("Set valid Mark In and Mark Out before downloading.");
    }
  };

  // Keyboard shortcuts - independent of markIn/markOut state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if the component is in focus
      if (e.code === "Space") {
        e.preventDefault();
        const video = videoRef.current;
        if (video) {
          if (video.paused) handlePlay();
          else handlePause();
        }
      } else if (e.code === "KeyI") {
        e.preventDefault();
        handleMarkIn();
      } else if (e.code === "KeyO") {
        e.preventDefault();
        handleMarkOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // No dependencies to avoid stale closures

  if (!localVideoUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No video selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Video Preview</h2>
        {propVideoFile && (
          <p className="text-sm text-gray-600">
            {propVideoFile.name} (
            {(propVideoFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Video with border - placed BEFORE controls to ensure videoRef is initialized */}
      <div
        className="relative rounded-lg overflow-hidden mb-4"
        style={{
          padding: `${borderWidth}px`,
          backgroundColor: borderColor,
        }}
      >
        <video
          ref={videoRef}
          src={localVideoUrl}
          className="w-full h-auto rounded-sm"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnd}
          preload="auto"
        />

        {/* Play/Pause overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={isPlaying ? handlePause : handlePlay}
        >
          {!isPlaying && (
            <div className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Video controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSkipBackward}
          className="flex items-center gap-1"
        >
          <SkipBack className="h-4 w-4" /> -5s
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={isPlaying ? handlePause : handlePlay}
          className="flex items-center gap-1"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Play
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          className="flex items-center gap-1"
        >
          <Square className="h-4 w-4" /> Stop
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSkipForward}
          className="flex items-center gap-1"
        >
          <SkipForward className="h-4 w-4" /> +5s
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkIn}
          className="flex items-center gap-1 border-green-500 hover:bg-green-50"
        >
          <span className="text-green-600 font-bold">I</span> Mark In
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkOut}
          className="flex items-center gap-1 border-red-500 hover:bg-red-50"
        >
          <span className="text-red-600 font-bold">O</span> Mark Out
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewSubclip}
          className="flex items-center gap-1"
          // Allow preview even without marks - will use full video
        >
          <Scissors className="h-4 w-4" /> Preview Subclip
        </Button>

        {publicId && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-1"
              disabled={
                markIn === null ||
                markOut === null ||
                markIn >= (markOut || 0) ||
                !publicId
              }
            >
              <Download className="h-4 w-4" /> Export Subclip
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSubclip}
              className="flex items-center gap-1 bg-green-600 text-white hover:bg-green-700"
              disabled={
                markIn === null ||
                markOut === null ||
                markIn >= (markOut || 0) ||
                !publicId
              }
            >
              <Download className="h-4 w-4" /> Download Subclip
            </Button>
          </>
        )}
      </div>

      {/* Filmstrip timeline */}
      {duration > 0 && (
        <div className="mt-4">
          <VideoFilmstrip
            videoUrl={localVideoUrl}
            duration={duration}
            startTime={markIn || 0}
            endTime={markOut || duration}
            currentTime={currentTime}
            onStartTimeChange={setMarkIn}
            onEndTimeChange={setMarkOut}
            onSeek={handleSeek}
            onPreviewSubclip={handlePreviewSubclip}
            cloudName={cloudName}
            cloudinaryPublicId={publicId}
          />
        </div>
      )}

      {/* Export URL display */}
      {getExportUrl() && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm font-medium mb-1">Export URL:</p>
          <a
            href={getExportUrl() || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {getExportUrl()}
          </a>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Keyboard shortcuts: <span className="font-medium">I</span> = Mark In,{" "}
        <span className="font-medium">O</span> = Mark Out,{" "}
        <span className="font-medium">Space</span> = Play/Pause
      </div>
    </div>
  );
}

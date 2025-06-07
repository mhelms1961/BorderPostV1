import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Scissors,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  ensureMP4Compatibility,
  checkVideoCompatibility,
} from "@/lib/cloudinary-utils";

interface Subclip {
  id: string;
  startTime: number;
  endTime: number;
  name: string;
}

interface VideoFilmstripProps {
  videoUrl: string;
  duration: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  currentTime?: number;
  onSeek?: (time: number) => void;
  onPreviewSubclip?: () => void;
  cloudinaryPublicId?: string | null;
  cloudName?: string;
  onExportSubclip?: () => void;
  onDownloadWithBorder?: () => void;
  showTrimControls?: boolean;
  isVideoLoaded?: boolean;
  borderLayerId?: string;
  onBorderLayerChange?: (id: string) => void;
  availableBorders?: Array<{ value: string; label: string }>;
  onSubclipsChange?: (subclips: Subclip[]) => void;
}

export default function VideoFilmstrip({
  videoUrl,
  duration,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  currentTime = 0,
  onSeek,
  onPreviewSubclip,
  cloudinaryPublicId,
  cloudName,
  onExportSubclip,
  onDownloadWithBorder,
  showTrimControls = true,
  isVideoLoaded = true,
  borderLayerId,
  onBorderLayerChange,
  availableBorders = [
    { value: "Border_1080_10px_ert7sl", label: "1080p - 10px" },
    { value: "Border_1080_20px_moefgp", label: "1080p - 20px" },
    { value: "Border_1080_40px_szde6u", label: "1080p - 40px" },
    { value: "Border_4K_10px_wnw98u", label: "4K - 10px" },
    { value: "Border_4K_20px_hwfmti", label: "4K - 20px" },
    { value: "Border_4K_40px_k66aor", label: "4K - 40px" },
  ],
  onSubclipsChange,
}: VideoFilmstripProps) {
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subclips, setSubclips] = useState<Subclip[]>([]);
  const [activeSubclipId, setActiveSubclipId] = useState<string | null>(null);
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [pendingMarkIn, setPendingMarkIn] = useState<number | null>(null);

  const filmstripRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Reduced number of frames for better performance
  const frameCount = 20; // Reduced from 30 to 20 for better performance

  // Calculate frame width dynamically based on container width
  const [containerWidth, setContainerWidth] = useState(0);
  const frameWidth =
    containerWidth > 0 ? Math.floor(containerWidth / frameCount) : 20; // px

  // Extract frames using HTML5 Canvas - Optimized for performance
  useEffect(() => {
    console.log("VideoFilmstrip: Starting frame extraction", {
      loading,
      framesLength: frames.length,
      error,
      videoUrl: videoUrl ? "[url exists]" : "[no url]",
      duration,
    });

    // Only extract frames if we have a valid video URL and duration
    if (videoUrl && duration > 0) {
      setLoading(true);
      setError(null);
      setFrames([]); // Clear existing frames

      // Use a longer timeout to avoid blocking the UI
      const extractionTimeout = setTimeout(() => {
        extractFramesOptimized();
      }, 300);

      return () => {
        clearTimeout(extractionTimeout);
      };
    }
  }, [videoUrl, duration]); // Depend on both videoUrl and duration

  // Set up resize observer to update container width
  useEffect(() => {
    if (filmstripRef.current) {
      // Get initial width
      setContainerWidth(filmstripRef.current.clientWidth);

      // Set up resize observer
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      resizeObserverRef.current.observe(filmstripRef.current);

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, []);

  // Debug log at render time
  console.log(
    "VideoFilmstrip render - videoRef.current:",
    videoRef.current ? "exists" : "null",
    "containerWidth:",
    containerWidth,
    "frameWidth:",
    frameWidth,
  );

  // Add a debug useEffect to verify video element access and sync with main video
  useEffect(() => {
    console.log("VideoFilmstrip mount effect running");

    // Try to find the video element - prioritize cloudinary-video-player
    const videoElement = getPreviewVideo();

    if (videoElement) {
      console.log("✅ VideoFilmstrip: Found video element:", videoElement.id);
      videoRef.current = videoElement;

      // Add event listeners to sync with the main video player
      const handleVideoPlay = () => {
        console.log("Video started playing at", videoElement.currentTime);
        setIsPlaying(true);
      };

      const handleVideoPause = () => {
        console.log("Video paused at", videoElement.currentTime);
        setIsPlaying(false);
      };

      // Throttled time update handler to reduce performance impact
      let timeUpdateThrottle: number | null = null;
      const handleVideoTimeUpdate = () => {
        if (onSeek && !timeUpdateThrottle) {
          timeUpdateThrottle = window.setTimeout(() => {
            onSeek(videoElement.currentTime);
            timeUpdateThrottle = null;
          }, 100); // Throttle to 10fps instead of 60fps
        }
      };

      const handleVideoSeeked = () => {
        console.log("Video seeked to", videoElement.currentTime);
      };

      // Add event listeners
      videoElement.addEventListener("play", handleVideoPlay);
      videoElement.addEventListener("pause", handleVideoPause);
      videoElement.addEventListener("timeupdate", handleVideoTimeUpdate);
      videoElement.addEventListener("seeked", handleVideoSeeked);

      return () => {
        // Clean up event listeners and throttle timeout
        videoElement.removeEventListener("play", handleVideoPlay);
        videoElement.removeEventListener("pause", handleVideoPause);
        videoElement.removeEventListener("timeupdate", handleVideoTimeUpdate);
        videoElement.removeEventListener("seeked", handleVideoSeeked);
        if (timeUpdateThrottle) {
          clearTimeout(timeUpdateThrottle);
        }
      };
    } else {
      console.warn("VideoFilmstrip: Could not find video element");
    }
  }, [videoUrl, onSeek]);

  // Sync the video with our trim controls when they change
  useEffect(() => {
    const videoElement = getPreviewVideo();
    if (videoElement && startTime !== undefined) {
      // When trim controls change, update the video position to the start time
      videoElement.currentTime = startTime;
      console.log(`Synced video position to trim start time: ${startTime}s`);
    }
  }, [startTime]);

  // Optimized frame extraction function for better performance
  const extractFramesOptimized = async () => {
    try {
      console.log("VideoFilmstrip: Starting optimized frame extraction");

      // Create a new video element specifically for frame extraction
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.preload = "metadata"; // Changed from "auto" to "metadata" for faster loading
      video.playsInline = true;

      // Only use compatibility check for .mov files to avoid unnecessary processing of MP4s
      const isMovFile = videoUrl.toLowerCase().includes(".mov");
      const processedUrl = isMovFile
        ? checkVideoCompatibility(videoUrl).recommendedUrl
        : videoUrl;

      console.log("VideoFilmstrip: Using URL for extraction:", processedUrl);

      // Set up the video source
      video.src = processedUrl;

      // Wait for video to be ready with shorter timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Video loading timeout"));
        }, 8000); // Reduced timeout

        video.onloadedmetadata = () => {
          clearTimeout(timeout);
          console.log("VideoFilmstrip: Video metadata loaded", {
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
          });
          resolve();
        };

        video.onerror = () => {
          clearTimeout(timeout);
          reject(
            new Error(
              `Video loading error: ${video.error?.message || "Unknown error"}`,
            ),
          );
        };

        video.load();
      });

      // Reduced wait time for video readiness
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

      // Use smaller canvas size for better performance
      const targetWidth = Math.min(video.videoWidth || 640, 320);
      const targetHeight = Math.min(video.videoHeight || 360, 180);
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const extractedFrames: string[] = [];
      const interval = duration / frameCount;

      console.log(
        `VideoFilmstrip: Extracting ${frameCount} frames at ${interval}s intervals`,
      );

      // Extract frames with optimized seeking and reduced delays
      for (let i = 0; i < frameCount; i++) {
        const time = Math.min(i * interval, duration - 0.1);

        try {
          // Set video to specific time
          video.currentTime = time;

          // Optimized seeking with shorter timeout
          await new Promise<void>((resolve) => {
            let resolved = false;

            const onSeeked = () => {
              if (!resolved) {
                resolved = true;
                video.removeEventListener("seeked", onSeeked);
                resolve();
              }
            };

            video.addEventListener("seeked", onSeeked);

            // Much shorter timeout to prevent hanging
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                video.removeEventListener("seeked", onSeeked);
                resolve();
              }
            }, 200); // Reduced from 500ms to 200ms
          });

          // Minimal delay for frame readiness
          await new Promise((resolve) => setTimeout(resolve, 10)); // Reduced from 50ms to 10ms

          // Draw the video frame to the canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert to data URL with lower quality for better performance
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6); // Reduced quality from 0.8 to 0.6
          extractedFrames.push(dataUrl);

          // Update frames progressively for better UX
          if (i % 5 === 0) {
            setFrames([...extractedFrames]);
          }

          console.log(
            `VideoFilmstrip: Extracted frame ${i + 1}/${frameCount} at ${time.toFixed(2)}s`,
          );
        } catch (frameError) {
          console.warn(
            `VideoFilmstrip: Failed to extract frame ${i} at ${time}s:`,
            frameError,
          );
          // Create a simple placeholder frame
          ctx.fillStyle = "#333";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#fff";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            `${time.toFixed(1)}s`,
            canvas.width / 2,
            canvas.height / 2,
          );
          const placeholderUrl = canvas.toDataURL("image/jpeg", 0.6);
          extractedFrames.push(placeholderUrl);
        }
      }

      console.log(
        `VideoFilmstrip: Successfully extracted ${extractedFrames.length} frames`,
      );
      setFrames(extractedFrames);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("VideoFilmstrip: Error extracting frames:", err);
      setError(
        `Failed to extract frames: ${err instanceof Error ? err.message : String(err)}`,
      );
      setLoading(false);
    }
  };

  // Calculate positions for markers
  const getPositionFromTime = (time: number) => {
    if (!filmstripRef.current) return 0;
    return (time / duration) * containerWidth;
  };

  const getTimeFromPosition = (position: number) => {
    if (!filmstripRef.current) return 0;
    return (position / containerWidth) * duration;
  };

  // Enhanced click on filmstrip to seek and handle playhead movement
  const handleFilmstripClick = (e: React.MouseEvent) => {
    if (isDraggingStart || isDraggingEnd) return; // Don't seek if we're dragging markers

    if (!filmstripRef.current) return;
    const rect = filmstripRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const time = getTimeFromPosition(position);

    // Move playhead to clicked position
    const video = getPreviewVideo();
    if (video) {
      video.currentTime = time;
      console.log(`Playhead moved to ${time.toFixed(2)}s via filmstrip click`);
    }

    if (onSeek) {
      onSeek(time);
    }
  };

  // Handle mouse events for dragging markers
  const handleMouseDown = (marker: "start" | "end") => {
    if (marker === "start") {
      setIsDraggingStart(true);
    } else {
      setIsDraggingEnd(true);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!filmstripRef.current) return;

    const rect = filmstripRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const time = getTimeFromPosition(position);

    // Update hovered frame info
    setHoveredTime(time);
    setHoveredFrame(Math.floor((time / duration) * frameCount));

    // Update marker positions when dragging
    if (isDraggingStart) {
      const newStartTime = Math.max(0, Math.min(time, endTime - 0.1));
      onStartTimeChange(newStartTime);

      // Update video position in real-time while dragging
      const previewVideo = document.getElementById(
        "preview-video",
      ) as HTMLVideoElement;
      if (previewVideo) {
        previewVideo.currentTime = newStartTime;
      }
    } else if (isDraggingEnd) {
      const newEndTime = Math.min(duration, Math.max(time, startTime + 0.1));
      onEndTimeChange(newEndTime);

      // Optionally update video position to end marker while dragging end marker
      // Uncomment if you want this behavior
      // const previewVideo = document.getElementById("preview-video") as HTMLVideoElement;
      // if (previewVideo) {
      //   previewVideo.currentTime = newEndTime;
      // }
    }
  };

  const handleMouseUp = () => {
    if (isDraggingStart || isDraggingEnd) {
      // When finished dragging, update the video position to match the new marker position
      const previewVideo = document.getElementById(
        "preview-video",
      ) as HTMLVideoElement;
      if (previewVideo) {
        previewVideo.currentTime = startTime;
        console.log(
          `Updated video position to ${startTime}s after dragging marker`,
        );
      }
    }

    setIsDraggingStart(false);
    setIsDraggingEnd(false);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredFrame(null);
    setHoveredTime(null);
    handleMouseUp();
  };

  // Video control functions - Updated to use cloudinary-video-player element consistently
  const getPreviewVideo = () => {
    // First try to get the cloudinary video player, then fallback to preview-video
    const cloudinaryPlayer = document.getElementById(
      "cloudinary-video-player",
    ) as HTMLVideoElement;

    if (cloudinaryPlayer) {
      console.log("VideoFilmstrip: Using cloudinary-video-player element");
      return cloudinaryPlayer;
    }

    const previewVideo = document.getElementById(
      "preview-video",
    ) as HTMLVideoElement;

    if (previewVideo) {
      console.log("VideoFilmstrip: Using preview-video element");
      return previewVideo;
    }

    console.warn("VideoFilmstrip: No video element found");
    return null;
  };

  const handleSkipBackward = () => {
    const video = getPreviewVideo();
    if (!video) return;
    const newTime = Math.max(0, video.currentTime - 5);
    video.currentTime = newTime;
    if (onSeek) onSeek(newTime);
  };

  const handlePlayBackward = () => {
    const video = getPreviewVideo();
    if (!video) return;
    const newTime = Math.max(0, video.currentTime - 1 / 30); // Step back one frame (assuming 30fps)
    video.currentTime = newTime;
    if (onSeek) onSeek(newTime);
  };

  const handleTogglePlayPause = () => {
    const video = getPreviewVideo();
    if (!video) return;

    if (video.paused) {
      video.play().catch((err) => console.error("Error playing video:", err));
    } else {
      video.pause();
    }
  };

  const handleSkipForward = () => {
    const video = getPreviewVideo();
    if (!video) return;
    const newTime = Math.min(duration, video.currentTime + 5);
    video.currentTime = newTime;
    if (onSeek) onSeek(newTime);
  };

  // Enhanced Mark In/Out functions for multiple subclips
  const handleMarkIn = () => {
    const video = getPreviewVideo();
    if (!video) return;
    const time = video.currentTime;

    // Set pending mark in and enter marking mode
    setPendingMarkIn(time);
    setIsMarkingMode(true);
    onStartTimeChange(time);
    console.log(
      `Marked IN point at ${time.toFixed(2)}s - waiting for OUT point`,
    );
  };

  const handleMarkOut = () => {
    const video = getPreviewVideo();
    if (!video) return;
    const time = video.currentTime;

    if (pendingMarkIn !== null && time > pendingMarkIn) {
      // Create new subclip
      const newSubclip: Subclip = {
        id: `subclip-${Date.now()}`,
        startTime: pendingMarkIn,
        endTime: time,
        name: `Subclip ${subclips.length + 1}`,
      };

      const updatedSubclips = [...subclips, newSubclip];
      setSubclips(updatedSubclips);
      setActiveSubclipId(newSubclip.id);

      // Update current selection to the new subclip
      onStartTimeChange(pendingMarkIn);
      onEndTimeChange(time);

      // Reset marking mode
      setPendingMarkIn(null);
      setIsMarkingMode(false);

      // Notify parent component
      if (onSubclipsChange) {
        onSubclipsChange(updatedSubclips);
      }

      console.log(
        `Created subclip: ${newSubclip.name} (${pendingMarkIn.toFixed(2)}s - ${time.toFixed(2)}s)`,
      );
    } else {
      // Just set the end time for current selection
      onEndTimeChange(time);
      console.log(`Marked OUT point at ${time.toFixed(2)}s`);
    }
  };

  // Enhanced subclip management functions
  const handleDeleteSubclip = (subclipId?: string) => {
    if (subclipId) {
      // Delete specific subclip
      const updatedSubclips = subclips.filter((clip) => clip.id !== subclipId);
      setSubclips(updatedSubclips);

      if (activeSubclipId === subclipId) {
        setActiveSubclipId(null);
        // Reset to full video duration
        onStartTimeChange(0);
        onEndTimeChange(duration);
      }

      if (onSubclipsChange) {
        onSubclipsChange(updatedSubclips);
      }

      console.log(`Deleted subclip: ${subclipId}`);
    } else {
      // Reset current selection to full video duration
      onStartTimeChange(0);
      onEndTimeChange(duration);
      setActiveSubclipId(null);
      console.log("Reset selection to full video duration");
    }

    // Optionally seek to beginning
    const video = getPreviewVideo();
    if (video) {
      video.currentTime = 0;
      if (onSeek) onSeek(0);
    }
  };

  const handleSelectSubclip = (subclip: Subclip) => {
    setActiveSubclipId(subclip.id);
    onStartTimeChange(subclip.startTime);
    onEndTimeChange(subclip.endTime);

    // Seek to start of subclip
    const video = getPreviewVideo();
    if (video) {
      video.currentTime = subclip.startTime;
      if (onSeek) onSeek(subclip.startTime);
    }

    console.log(`Selected subclip: ${subclip.name}`);
  };

  const handleClearMarkingMode = () => {
    setPendingMarkIn(null);
    setIsMarkingMode(false);
    console.log("Cleared marking mode");
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if the filmstrip is in focus or a child element is in focus
      if (
        !filmstripRef.current?.contains(document.activeElement as Node) &&
        document.activeElement !== document.body
      )
        return;

      if (e.code === "KeyI") {
        e.preventDefault();
        handleMarkIn();
      }
      if (e.code === "KeyO") {
        e.preventDefault();
        handleMarkOut();
      }
      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlayPause();
      }
      if (e.code === "Escape") {
        e.preventDefault();
        handleClearMarkingMode();
      }
      if (e.code === "Delete" || e.code === "Backspace") {
        if (activeSubclipId) {
          e.preventDefault();
          handleDeleteSubclip(activeSubclipId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle preview subclip
  const handlePreviewSubclip = () => {
    // Find the video element - use the preview video
    const video = getPreviewVideo();

    if (!video) {
      console.warn(
        "VideoFilmstrip: No video element found for preview subclip",
      );
      return;
    }

    // Set video to start time
    video.currentTime = startTime;
    if (onSeek) onSeek(startTime);

    // Play the video
    video
      .play()
      .then(() =>
        console.log(
          `Playing subclip from ${startTime.toFixed(2)}s to ${endTime.toFixed(2)}s (duration: ${(endTime - startTime).toFixed(2)}s)`,
        ),
      )
      .catch((err) => console.error("Error playing video:", err));

    // Remove any existing listeners to avoid duplicates
    video.removeEventListener("timeupdate", checkTimeFunction);

    // Set up a listener to pause at end time
    video.addEventListener("timeupdate", checkTimeFunction);
  };

  // Define the check time function outside to avoid recreating it
  const checkTimeFunction = () => {
    const video = getPreviewVideo();

    if (!video) {
      console.error("❌ No video element found in checkTimeFunction");
      return;
    }

    if (video.currentTime >= endTime) {
      video.pause();
      video.removeEventListener("timeupdate", checkTimeFunction);
      console.log(`✅ Reached end of subclip at ${endTime.toFixed(2)}s`);
    }
  };

  return (
    <div className="w-full">
      {/* Enhanced status display */}
      <div className="mb-2 flex justify-between items-center text-sm">
        <div className="flex gap-4 text-gray-500">
          <span>Start: {startTime.toFixed(1)}s</span>
          <span>End: {endTime.toFixed(1)}s</span>
          <span>Duration: {(endTime - startTime).toFixed(1)}s</span>
        </div>
        <div className="flex items-center gap-2">
          {isMarkingMode && (
            <div className="flex items-center gap-2 text-orange-400">
              <span className="text-xs font-medium">MARKING MODE</span>
              <span className="text-xs">Mark OUT point to create subclip</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearMarkingMode}
                className="h-6 px-2 text-xs text-orange-400 hover:text-orange-300"
              >
                Cancel (ESC)
              </Button>
            </div>
          )}
          {subclips.length > 0 && (
            <span className="text-xs text-blue-400">
              {subclips.length} subclip{subclips.length !== 1 ? "s" : ""}{" "}
              created
            </span>
          )}
        </div>
      </div>

      {/* Subclips list */}
      {subclips.length > 0 && (
        <div className="mb-4 p-3 bg-gray-800 rounded-md">
          <div className="text-sm font-medium text-white mb-2">
            Created Subclips:
          </div>
          <div className="flex flex-wrap gap-2">
            {subclips.map((subclip) => (
              <div
                key={subclip.id}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs cursor-pointer transition-colors ${
                  activeSubclipId === subclip.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => handleSelectSubclip(subclip)}
              >
                <span>{subclip.name}</span>
                <span className="text-gray-400">
                  ({subclip.startTime.toFixed(1)}s -{" "}
                  {subclip.endTime.toFixed(1)}s)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubclip(subclip.id);
                  }}
                  className="ml-1 text-red-400 hover:text-red-300"
                  title="Delete subclip"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="relative h-24 bg-black rounded-md mb-4 overflow-y-visible"
        ref={filmstripRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleFilmstripClick}
      >
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-sm font-medium text-white">
              Extracting frames...
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 z-10">
            <div className="text-sm font-medium text-red-500">{error}</div>
          </div>
        )}

        {/* Filmstrip container */}
        <div className="flex h-full w-full">
          {/* Frames */}
          {frames.length > 0
            ? frames.map((frame, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0"
                  style={{ width: frameWidth + "px" }}
                >
                  <img
                    src={frame}
                    alt={`Frame ${index}`}
                    className="h-full w-full object-cover"
                  />
                  {/* Time indicator */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1">
                    {((index / frameCount) * duration).toFixed(1)}s
                  </div>
                  {/* Highlight current frame */}
                  {hoveredFrame === index && (
                    <div className="absolute inset-0 border-2 border-blue-500" />
                  )}
                </div>
              ))
            : // Placeholder frames when actual frames aren't loaded yet
              Array.from({ length: frameCount }).map((_, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 bg-gray-800 flex items-center justify-center"
                  style={{ width: frameWidth + "px" }}
                >
                  <span className="text-xs text-gray-400">
                    {((index / frameCount) * duration).toFixed(1)}s
                  </span>
                </div>
              ))}

          {/* Start marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-500 cursor-ew-resize z-20"
            style={{ left: getPositionFromTime(startTime) + "px" }}
            onMouseDown={() => handleMouseDown("start")}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-500 rounded-full" />
          </div>

          {/* End marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 cursor-ew-resize z-20"
            style={{ left: getPositionFromTime(endTime) + "px" }}
            onMouseDown={() => handleMouseDown("end")}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-red-500 rounded-full" />
          </div>

          {/* Selected region overlay */}
          <div
            className="absolute top-0 bottom-0 bg-blue-500/30 border border-blue-500 pointer-events-none"
            style={{
              left: getPositionFromTime(startTime) + "px",
              width:
                getPositionFromTime(endTime) -
                getPositionFromTime(startTime) +
                "px",
            }}
          />

          {/* Enhanced playhead with better visibility */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 pointer-events-none z-30 shadow-lg"
            style={{ left: getPositionFromTime(currentTime) + "px" }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium shadow-lg">
              {currentTime.toFixed(1)}s
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-500" />
          </div>

          {/* Pending mark in indicator */}
          {pendingMarkIn !== null && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-orange-500 pointer-events-none z-25 animate-pulse"
              style={{ left: getPositionFromTime(pendingMarkIn) + "px" }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">
                IN: {pendingMarkIn.toFixed(1)}s
              </div>
            </div>
          )}

          {/* Subclip indicators */}
          {subclips.map((subclip) => (
            <div
              key={`indicator-${subclip.id}`}
              className={`absolute top-0 bottom-0 border-2 pointer-events-none z-15 ${
                activeSubclipId === subclip.id
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-purple-500/10 border-purple-500"
              }`}
              style={{
                left: getPositionFromTime(subclip.startTime) + "px",
                width:
                  getPositionFromTime(subclip.endTime) -
                  getPositionFromTime(subclip.startTime) +
                  "px",
              }}
            >
              <div
                className={`absolute -top-6 left-1 text-xs px-1 py-0.5 rounded font-medium ${
                  activeSubclipId === subclip.id
                    ? "bg-blue-500 text-white"
                    : "bg-purple-500 text-white"
                }`}
              >
                {subclip.name}
              </div>
            </div>
          ))}

          {/* Hover time indicator */}
          {hoveredTime !== null && hoveredTime !== currentTime && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 pointer-events-none z-25"
              style={{ left: getPositionFromTime(hoveredTime) + "px" }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 py-0.5 rounded">
                {hoveredTime.toFixed(1)}s
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video control buttons - matching the preview monitor style */}
      <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePlayPause}
            className="flex items-center gap-1 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            disabled={!isVideoLoaded}
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
            onClick={handleMarkIn}
            className="flex items-center gap-1 border-green-500 bg-gray-700 text-white hover:bg-gray-600"
            disabled={!isVideoLoaded}
          >
            <span className="text-green-400 font-bold">I</span> Mark In
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkOut}
            className="flex items-center gap-1 border-red-500 bg-gray-700 text-white hover:bg-gray-600"
            disabled={!isVideoLoaded}
          >
            <span className="text-red-400 font-bold">O</span> Mark Out
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewSubclip || handlePreviewSubclip}
            className="flex items-center gap-1 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            disabled={startTime >= endTime || !isVideoLoaded}
          >
            <Scissors className="h-4 w-4" /> Preview Subclip
          </Button>

          {cloudinaryPublicId && onDownloadWithBorder && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadWithBorder}
              className="flex items-center gap-1 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              disabled={
                startTime >= endTime || !cloudinaryPublicId || !isVideoLoaded
              }
            >
              <Download className="h-4 w-4" /> Download with Border
            </Button>
          )}
        </div>

        {/* Border size dropdown */}
        {onBorderLayerChange && borderLayerId && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">Select border width</span>
            <Select
              value={borderLayerId}
              onValueChange={(value) => {
                if (onBorderLayerChange) {
                  onBorderLayerChange(value);
                }
              }}
            >
              <SelectTrigger className="w-[180px] bg-gray-800 text-white border-gray-600 h-9">
                <SelectValue placeholder="Select border" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                {availableBorders.map((border) => (
                  <SelectItem key={border.value} value={border.value}>
                    {border.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        <div className="mb-1">
          <span className="font-medium text-white">
            Enhanced Filmstrip Controls:
          </span>{" "}
          Click anywhere to move playhead
        </div>
        <div>
          Keyboard shortcuts: <span className="font-medium">I</span> = Mark In,{" "}
          <span className="font-medium">O</span> = Mark Out,{" "}
          <span className="font-medium">Space</span> = Play/Pause,{" "}
          <span className="font-medium">ESC</span> = Cancel Marking,{" "}
          <span className="font-medium">DEL</span> = Delete Selected Subclip
        </div>
      </div>
    </div>
  );
}

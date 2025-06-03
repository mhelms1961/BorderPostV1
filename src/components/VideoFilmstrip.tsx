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
}: VideoFilmstripProps) {
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const filmstripRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Number of frames to extract
  const frameCount = 30;

  // Calculate frame width dynamically based on container width
  const [containerWidth, setContainerWidth] = useState(0);
  const frameWidth =
    containerWidth > 0 ? Math.floor(containerWidth / frameCount) : 20; // px

  // Extract frames using HTML5 Canvas
  useEffect(() => {
    // Force extraction on mount or when videoUrl changes, regardless of other conditions
    console.log("VideoFilmstrip: Starting frame extraction", {
      loading,
      framesLength: frames.length,
      error,
      videoUrl: videoUrl ? "[url exists]" : "[no url]",
      duration,
    });

    // Always reset state when videoUrl changes
    if (videoUrl) {
      setLoading(true);
      setError(null);
      setFrames([]); // Clear existing frames

      // Use a timeout to ensure we don't start extraction too early
      const extractionTimeout = setTimeout(() => {
        // Create a new video element for frame extraction
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.preload = "metadata"; // Start with metadata only
        video.playsInline = true; // Better mobile support

        // Set up event handlers before setting src
        let metadataLoaded = false;

        video.onloadedmetadata = () => {
          metadataLoaded = true;
          console.log("VideoFilmstrip: Video metadata loaded for extraction", {
            duration: video.duration,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
          });

          // Change preload strategy after metadata is loaded
          video.preload = "auto";

          // Wait a moment to ensure the video is ready for seeking
          setTimeout(() => {
            extractFrames(video);
          }, 500);
        };

        video.onerror = () => {
          const errorMessage = video.error
            ? video.error.message
            : "Unknown error";
          console.error("VideoFilmstrip: Video error:", errorMessage);
          setError(`Failed to load video: ${errorMessage}`);
          setLoading(false);
        };

        // Set src after event handlers are established
        video.src = videoUrl;

        // Force load
        video.load();

        // Fallback if metadata never loads
        const metadataTimeout = setTimeout(() => {
          if (!metadataLoaded) {
            console.warn(
              "VideoFilmstrip: Metadata load timeout, attempting extraction anyway",
            );
            extractFrames(video);
          }
        }, 5000);

        // Cleanup function for the timeout
        return () => {
          clearTimeout(metadataTimeout);
        };
      }, 300); // Short delay before starting extraction

      // Cleanup function
      return () => {
        clearTimeout(extractionTimeout);
      };
    }
  }, [videoUrl]); // Only depend on videoUrl to ensure extraction happens when URL changes

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

  // Add a debug useEffect to verify video element access
  useEffect(() => {
    console.log("VideoFilmstrip mount effect running");
    // Try to find the preview video element on mount and when videoUrl changes
    const previewVideo = document.getElementById(
      "preview-video",
    ) as HTMLVideoElement;
    if (previewVideo) {
      console.log("✅ VideoFilmstrip: Found preview video element");
      videoRef.current = previewVideo;
      console.log(
        "✅ VideoFilmstrip: Successfully set videoRef.current to preview-video element",
      );

      // Force frame extraction immediately when the video element is found
      if (frames.length === 0 && !loading && !error) {
        console.log("VideoFilmstrip: Forcing frame extraction");
        setLoading(true);
        setError(null);

        // Create a new video element for frame extraction
        const extractionVideo = document.createElement("video");
        extractionVideo.crossOrigin = "anonymous";
        extractionVideo.muted = true;
        extractionVideo.preload = "auto";
        extractionVideo.src = videoUrl;

        // Set up event handlers for extraction
        extractionVideo.onloadedmetadata = () => {
          console.log("VideoFilmstrip: Extraction video metadata loaded");
          extractFrames(extractionVideo).catch((err) => {
            console.error("VideoFilmstrip: Error extracting frames:", err);
            setError(`Failed to extract frames: ${err.message}`);
            setLoading(false);
          });
        };

        extractionVideo.onerror = () => {
          const errorMessage = extractionVideo.error
            ? extractionVideo.error.message
            : "Unknown error";
          console.error("VideoFilmstrip: Video error:", errorMessage);
          setError(`Failed to load video: ${errorMessage}`);
          setLoading(false);
        };

        extractionVideo.load();
      }

      // Add event listeners to the preview video to track its state
      const handleVideoPlay = () => {
        console.log(
          "Preview video started playing at",
          previewVideo.currentTime,
        );
      };

      const handleVideoPause = () => {
        console.log("Preview video paused at", previewVideo.currentTime);
      };

      // Enhanced time update handler to sync filmstrip playhead with video
      const handleVideoTimeUpdate = () => {
        // Always update our currentTime state to match the video's current time
        // This ensures the filmstrip playhead updates in real-time with every frame
        if (onSeek) {
          requestAnimationFrame(() => {
            onSeek(previewVideo.currentTime);
          });
        }
      };

      const handleVideoSeeked = () => {
        console.log("Video seeked to", previewVideo.currentTime);
        // If the video is seeked outside our current selection, update the selection
        if (
          showTrimControls &&
          (previewVideo.currentTime < startTime ||
            previewVideo.currentTime > endTime)
        ) {
          // Create a new selection around the current time
          const newStartTime = Math.max(0, previewVideo.currentTime - 2);
          const newEndTime = Math.min(duration, previewVideo.currentTime + 8);
          onStartTimeChange(newStartTime);
          onEndTimeChange(newEndTime);
          console.log(
            `Updated selection to ${newStartTime}s - ${newEndTime}s based on video seek`,
          );
        }
      };

      previewVideo.addEventListener("play", () => {
        handleVideoPlay();
        setIsPlaying(true);
      });
      previewVideo.addEventListener("pause", () => {
        handleVideoPause();
        setIsPlaying(false);
      });
      previewVideo.addEventListener("timeupdate", handleVideoTimeUpdate);
      previewVideo.addEventListener("seeked", handleVideoSeeked);

      return () => {
        previewVideo.removeEventListener("play", () => {
          handleVideoPlay();
          setIsPlaying(true);
        });
        previewVideo.removeEventListener("pause", () => {
          handleVideoPause();
          setIsPlaying(false);
        });
        previewVideo.removeEventListener("timeupdate", handleVideoTimeUpdate);
        previewVideo.removeEventListener("seeked", handleVideoSeeked);
      };
    } else {
      console.warn(
        "VideoFilmstrip: Could not find preview video element in second useEffect",
      );
    }
  }, [
    videoUrl,
    startTime,
    endTime,
    duration,
    onStartTimeChange,
    onEndTimeChange,
    frames.length,
    loading,
    error,
    currentTime,
    onSeek,
    showTrimControls,
  ]);

  // Add a third useEffect to sync the video with our trim controls when they change
  useEffect(() => {
    const previewVideo = document.getElementById(
      "preview-video",
    ) as HTMLVideoElement;
    if (previewVideo) {
      // When trim controls change, update the video position to the start time
      previewVideo.currentTime = startTime;
      console.log(`Synced video position to trim start time: ${startTime}s`);
    }
  }, [startTime]);

  // Function to extract frames
  const extractFrames = async (video: HTMLVideoElement) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;

      const extractedFrames: string[] = [];
      const interval = duration / frameCount;

      console.log(
        `VideoFilmstrip: Extracting ${frameCount} frames at ${interval}s intervals`,
      );

      // Extract frames at regular intervals
      for (let i = 0; i < frameCount; i++) {
        const time = i * interval;

        // Set video to specific time
        video.currentTime = time;

        // Wait for the video to update to the new time
        await new Promise<void>((resolve, reject) => {
          const timeUpdate = () => {
            video.removeEventListener("seeked", timeUpdate);
            resolve();
          };

          const errorHandler = () => {
            video.removeEventListener("error", errorHandler);
            reject(new Error("Error seeking video"));
          };

          video.addEventListener("seeked", timeUpdate);
          video.addEventListener("error", errorHandler);

          // Add timeout to prevent hanging
          const timeout = setTimeout(() => {
            video.removeEventListener("seeked", timeUpdate);
            video.removeEventListener("error", errorHandler);
            resolve(); // Continue even if seeking times out
          }, 1000);
        });

        // Draw the video frame to the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        extractedFrames.push(dataUrl);
      }

      console.log(
        `VideoFilmstrip: Successfully extracted ${extractedFrames.length} frames`,
      );
      setFrames(extractedFrames);
      setLoading(false);
    } catch (err) {
      console.error("VideoFilmstrip: Error extracting frames:", err);
      throw err;
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

  // Direct click on filmstrip to seek
  const handleFilmstripClick = (e: React.MouseEvent) => {
    if (isDraggingStart || isDraggingEnd) return; // Don't seek if we're dragging markers

    if (!filmstripRef.current) return;
    const rect = filmstripRef.current.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const time = getTimeFromPosition(position);

    if (onSeek) {
      onSeek(time);
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
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

  // Video control functions - Updated to use preview-video element consistently
  const getPreviewVideo = () => {
    return (
      (document.getElementById(
        "cloudinary-video-player",
      ) as HTMLVideoElement) ||
      (document.getElementById("preview-video") as HTMLVideoElement)
    );
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

  // Mark In/Out functions - Updated to use preview video element
  const handleMarkIn = () => {
    const video = getPreviewVideo();
    if (!video) return;
    const time = video.currentTime;
    onStartTimeChange(time);
    console.log(`Marked IN point at ${time.toFixed(2)}s`);
  };

  const handleMarkOut = () => {
    const video = getPreviewVideo();
    if (!video) return;
    const time = video.currentTime;
    onEndTimeChange(time);
    console.log(`Marked OUT point at ${time.toFixed(2)}s`);
  };

  // Delete subclip function
  const handleDeleteSubclip = () => {
    // Reset to full video duration
    onStartTimeChange(0);
    onEndTimeChange(duration);
    console.log("Subclip deleted, reset to full video duration");

    // Optionally seek to beginning
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (onSeek) onSeek(0);
    }
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
      <div className="mb-2 flex justify-between text-sm text-gray-500">
        <span>Start: {startTime.toFixed(1)}s</span>
        <span>End: {endTime.toFixed(1)}s</span>
        <span>Duration: {(endTime - startTime).toFixed(1)}s</span>
      </div>

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

          {/* Current time indicator (playhead) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-30"
            style={{ left: getPositionFromTime(currentTime) + "px" }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 py-0.5 rounded">
              {currentTime.toFixed(1)}s
            </div>
          </div>

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
        Keyboard shortcuts: <span className="font-medium">I</span> = Mark In,{" "}
        <span className="font-medium">O</span> = Mark Out,{" "}
        <span className="font-medium">Space</span> = Play/Pause
      </div>
    </div>
  );
}

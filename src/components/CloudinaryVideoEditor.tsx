import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Scissors,
  Download,
} from "lucide-react";
import VideoFilmstrip from "./VideoFilmstrip";

interface CloudinaryVideoEditorProps {
  videoUrl?: string;
  cloudName?: string;
  publicId?: string;
  borderLayerId?: string;
  initialVideoUrl?: string;
  cloudinaryPublicId?: string;
  apiKey?: string;
  onAddBorder?: (subclipUrl: string, subclipPublicId: string) => void;
}

const CloudinaryVideoEditor: React.FC<CloudinaryVideoEditorProps> = ({
  videoUrl = "https://res.cloudinary.com/dyco49ptm/video/upload/samples/elephants.mp4",
  cloudName = "dyco49ptm",
  publicId = "samples/elephants",
  borderLayerId = "Border_1080_20px_moefgp",
  initialVideoUrl,
  cloudinaryPublicId,
  apiKey,
  onAddBorder,
}) => {
  // State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markIn, setMarkIn] = useState<number | null>(null);
  const [markOut, setMarkOut] = useState<number | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Loading video...");
  const [selectedBorderLayerId, setSelectedBorderLayerId] =
    useState(borderLayerId);
  // Border is applied ONLY via Cloudinary transformation in the URL
  // No CSS or HTML styling is used for the border

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Apply border transformation to URL
  const applyBorderTransformation = (
    url: string,
    borderLayerId: string = "Border_1080_20px_moefgp",
  ): string => {
    // Parse the URL to insert the transformation
    const parts = url.split("/upload/");
    if (parts.length !== 2) return url; // Invalid URL format

    // Simplified approach: use direct overlay without format transformations
    // This should avoid the HTTP 400 error
    return `${parts[0]}/upload/l_${borderLayerId},fl_layer_apply/${parts[1]}`;
  };

  // Get the video URL with border overlay
  const getVideoUrlWithBorder = () => {
    return applyBorderTransformation(videoUrl, borderLayerId);
  };

  // Initialize video on mount
  useEffect(() => {
    console.log("CloudinaryVideoEditor: Initializing with URL:", videoUrl);
    setLoadingStatus("Loading video...");
    setIsVideoLoaded(false);

    // Reset state when component mounts
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setMarkIn(null);
    setMarkOut(null);
  }, [videoUrl]);

  // Get the video URL with border overlay
  const currentVideoUrl = getVideoUrlWithBorder();

  // Log the URL to verify it's correct
  useEffect(() => {
    console.log("Current video URL with border:", currentVideoUrl);
  }, [currentVideoUrl]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;

    console.log("Video metadata loaded:", {
      duration: videoRef.current.duration,
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    });

    setDuration(videoRef.current.duration);
    setMarkOut(videoRef.current.duration); // Initialize mark out to end of video
    setLoadingStatus("Buffering video frames...");
  };

  const handleCanPlayThrough = () => {
    console.log("Video can play through - all frames loaded");
    setIsVideoLoaded(true);
    setLoadingStatus("Video ready");
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);

    // Check if we've reached the mark out point during playback
    if (markOut !== null && videoRef.current.currentTime >= markOut) {
      videoRef.current.pause();
      setIsPlaying(false);
      console.log(`Reached mark out point at ${markOut.toFixed(2)}s`);
    }
  };

  // Control handlers
  const handlePlay = () => {
    if (!videoRef.current || !isVideoLoaded) {
      console.error("Cannot play: Video not fully loaded");
      return;
    }

    console.log("Play button clicked");

    // If we have mark in/out points, start from mark in
    if (markIn !== null && videoRef.current.currentTime < markIn) {
      videoRef.current.currentTime = markIn;
    }

    // Use setTimeout to ensure any state updates have completed
    setTimeout(() => {
      const playPromise = videoRef.current?.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("✅ Video playing");
          })
          .catch((error) => {
            console.error("❌ Error playing video:", error);

            // Try again with muted if autoplay policy is the issue
            if (error.name === "NotAllowedError" && videoRef.current) {
              console.log("Trying to play muted due to autoplay policy...");
              videoRef.current.muted = true;
              videoRef.current
                .play()
                .then(() => {
                  setIsPlaying(true);
                  console.log("✅ Video playing muted");

                  // Add unmute button
                  const unmuteButton = document.createElement("button");
                  unmuteButton.textContent = "Unmute";
                  unmuteButton.className =
                    "absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded";
                  unmuteButton.onclick = () => {
                    if (videoRef.current) videoRef.current.muted = false;
                    unmuteButton.remove();
                  };

                  if (videoContainerRef.current) {
                    videoContainerRef.current.appendChild(unmuteButton);
                  }
                })
                .catch((err) =>
                  console.error("❌ Still cannot play even muted:", err),
                );
            }
          });
      }
    }, 100);
  };

  const handlePause = () => {
    if (!videoRef.current) return;

    console.log("Pause button clicked");
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!videoRef.current) return;

    console.log("Stop button clicked");
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleSkipBackward = () => {
    if (!videoRef.current) return;

    console.log("Skip backward button clicked");
    const newTime = Math.max(0, videoRef.current.currentTime - 5);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    if (!videoRef.current) return;

    console.log("Skip forward button clicked");
    const newTime = Math.min(duration, videoRef.current.currentTime + 5);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMarkIn = () => {
    if (!videoRef.current) return;

    console.log("Mark in button clicked");
    const time = videoRef.current.currentTime;
    setMarkIn(time);
    console.log(`Marked IN point at ${time.toFixed(2)}s`);
  };

  const handleMarkOut = () => {
    if (!videoRef.current) return;

    console.log("Mark out button clicked");
    const time = videoRef.current.currentTime;
    setMarkOut(time);
    console.log(`Marked OUT point at ${time.toFixed(2)}s`);
  };

  const handlePreviewSubclip = () => {
    if (!videoRef.current) return;

    console.log("Preview subclip button clicked");

    if (markIn === null || markOut === null || markIn >= markOut) {
      console.error("Invalid mark in/out points");
      alert("Please set valid mark in and mark out points");
      return;
    }

    // Set video to mark in point
    videoRef.current.currentTime = markIn;

    // No need to manipulate border during preview as it's now part of the container

    // Use setTimeout to ensure currentTime is set before playing
    setTimeout(() => {
      // No need to manipulate any border styling - the border is part of the video via Cloudinary overlay

      const playPromise = videoRef.current?.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log(
              `Playing subclip from ${markIn.toFixed(2)}s to ${markOut.toFixed(2)}s`,
            );
          })
          .catch((error) => {
            console.error("Error playing subclip:", error);
          });
      }
    }, 100);
  };

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Generate Cloudinary transformation URL for subclip with border watermark
  const getExportUrl = () => {
    const effectivePublicId = cloudinaryPublicId || publicId;
    if (
      markIn === null ||
      markOut === null ||
      markIn >= markOut ||
      !effectivePublicId
    ) {
      return null;
    }

    const startOffset = markIn.toFixed(2);
    const endOffset = markOut.toFixed(2);

    // Fixed Cloudinary URL format - remove .mp4 extension and use proper syntax
    const cleanPublicId = effectivePublicId.replace(/\.(mp4|mov|avi)$/i, "");

    // Use proper Cloudinary watermark syntax for video overlays
    // Apply trimming first, then apply border as watermark with proper positioning
    // g_center positions the watermark in the center
    // fl_layer_apply applies the watermark layer
    // The border should be applied as a watermark that covers the entire video
    return `https://res.cloudinary.com/${cloudName}/video/upload/so_${startOffset},eo_${endOffset}/l_${borderLayerId},g_center,w_1.0,h_1.0,fl_relative,fl_layer_apply/${cleanPublicId}.mp4`;
  };

  const handleExportSubclip = () => {
    const exportUrl = getExportUrl();
    if (exportUrl) {
      window.open(exportUrl, "_blank");
    } else {
      alert("Please set valid mark in and mark out points");
    }
  };

  const handleDownloadSubclip = async () => {
    try {
      // First, check if we have valid mark in/out points
      if (
        markIn === null ||
        markOut === null ||
        markIn >= markOut ||
        !(cloudinaryPublicId || publicId)
      ) {
        alert("Set valid Mark In and Mark Out before downloading.");
        return;
      }

      // Get the export URL with proper Cloudinary transformations
      const exportUrl = getExportUrl();
      if (!exportUrl) {
        alert("Cannot generate export URL. Please try again.");
        return;
      }

      console.log("Download URL:", exportUrl);

      // Generate the filename
      const duration = (markOut - markIn).toFixed(2);
      const filename = `subclip_${markIn.toFixed(2)}s_to_${markOut.toFixed(2)}s_duration_${duration}s.mp4`;

      // Show loading indicator
      const loadingDiv = document.createElement("div");
      loadingDiv.style.position = "fixed";
      loadingDiv.style.top = "50%";
      loadingDiv.style.left = "50%";
      loadingDiv.style.transform = "translate(-50%, -50%)";
      loadingDiv.style.padding = "20px";
      loadingDiv.style.background = "rgba(0,0,0,0.8)";
      loadingDiv.style.color = "white";
      loadingDiv.style.borderRadius = "8px";
      loadingDiv.style.zIndex = "9999";
      loadingDiv.style.fontSize = "16px";
      loadingDiv.textContent = "Preparing download...";
      document.body.appendChild(loadingDiv);

      try {
        // Try to fetch the video and download it as a blob
        const response = await fetch(exportUrl, {
          method: "GET",
          headers: {
            Accept: "video/mp4,video/*,*/*",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status}`);
        }

        loadingDiv.textContent = "Downloading video...";

        const blob = await response.blob();

        // Create blob URL and download
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);

        loadingDiv.textContent = "Download started!";
        setTimeout(() => {
          if (document.body.contains(loadingDiv)) {
            document.body.removeChild(loadingDiv);
          }
        }, 2000);
      } catch (fetchError) {
        console.error("Fetch failed:", fetchError);

        // Remove loading indicator
        if (document.body.contains(loadingDiv)) {
          document.body.removeChild(loadingDiv);
        }

        // Fallback: Create a proper download link
        const downloadLink = document.createElement("a");
        downloadLink.href = exportUrl;
        downloadLink.download = filename;
        downloadLink.target = "_blank";
        downloadLink.rel = "noopener noreferrer";

        // Force the browser to treat it as a download
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);

        // Trigger download
        downloadLink.click();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(downloadLink);
        }, 100);

        // Show helpful message
        setTimeout(() => {
          alert(
            `Download initiated. If the video opens in your browser instead of downloading:\n\n` +
              `1. Right-click on the video\n` +
              `2. Select "Save video as..." or "Download video"\n` +
              `3. Save it to your desired location\n\n` +
              `Alternatively, you can copy this URL and paste it in a new browser tab:\n${exportUrl}`,
          );
        }, 500);
      }
    } catch (error) {
      console.error("Error during download:", error);

      // Remove loading indicator if it exists
      const loadingDiv = document.querySelector(
        'div[style*="position: fixed"]',
      );
      if (loadingDiv && loadingDiv.parentNode) {
        loadingDiv.parentNode.removeChild(loadingDiv);
      }

      // Show error with URL
      alert(
        `Download failed: ${error instanceof Error ? error.message : String(error)}\n\n` +
          `You can manually download by copying this URL and pasting it in your browser:\n${getExportUrl()}`,
      );
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-white overflow-visible">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Video Editor</h2>
        <p className="text-sm text-gray-300">
          Video with border overlay (via Cloudinary transformation)
        </p>
      </div>

      {/* Video container */}
      <div
        ref={videoContainerRef}
        className="relative overflow-hidden mb-4"
        style={{
          width: "100%",
          aspectRatio: "16/9",
          position: "relative",
          backgroundColor: "transparent",
          maxHeight: "60vh",
        }}
      >
        {/* Loading overlay */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
              <p>{loadingStatus}</p>
            </div>
          </div>
        )}

        {/* Video container with relative positioning */}
        <div
          className="video-container relative mx-auto"
          style={{
            width: "100%",
            maxWidth: "1920px",
            aspectRatio: "16/9",
            position: "relative",
          }}
        >
          {/* Video element - using original URL without border */}
          <video
            ref={videoRef}
            src={videoUrl} /* Use original URL without border transformation */
            className="w-full h-full block"
            style={{
              objectFit: "contain",
              display: "block",
              borderRadius: 0,
            }}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlayThrough={handleCanPlayThrough}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            preload="auto"
            crossOrigin="anonymous"
            playsInline
            id="cloudinary-video-player"
          />

          {/* Border overlay with absolute positioning */}
          {isVideoLoaded && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: `url(https://res.cloudinary.com/${cloudName}/image/upload/v1/${borderLayerId})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
        </div>

        {/* Play/Pause overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={isPlaying ? handlePause : handlePlay}
        >
          {isVideoLoaded && (
            <div className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Time display */}
      <div className="flex justify-between mb-4 text-sm text-gray-300">
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
        className="relative h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
        onClick={(e) => {
          if (!videoRef.current || !isVideoLoaded) return;

          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          const newTime = pos * duration;
          videoRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }}
      >
        {/* Playback progress */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
        />

        {/* Mark in indicator */}
        {markIn !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-500 z-10"
            style={{ left: `${(markIn / Math.max(duration, 1)) * 100}%` }}
          />
        )}

        {/* Mark out indicator */}
        {markOut !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
            style={{ left: `${(markOut / Math.max(duration, 1)) * 100}%` }}
          />
        )}

        {/* Selected region */}
        {markIn !== null && markOut !== null && (
          <div
            className="absolute top-0 bottom-0 bg-blue-400"
            style={{
              left: `${(markIn / Math.max(duration, 1)) * 100}%`,
              width: `${((markOut - markIn) / Math.max(duration, 1)) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Filmstrip timeline */}
      {duration > 0 && isVideoLoaded && (
        <div className="mt-4">
          <VideoFilmstrip
            videoUrl={videoUrl} // Use original URL for filmstrip (without border)
            duration={duration}
            startTime={markIn || 0}
            endTime={markOut || duration}
            currentTime={currentTime}
            onStartTimeChange={setMarkIn}
            onEndTimeChange={setMarkOut}
            onSeek={(time) => {
              if (videoRef.current) {
                videoRef.current.currentTime = time;
                setCurrentTime(time);
              }
            }}
            onPreviewSubclip={handlePreviewSubclip}
            cloudName={cloudName}
            cloudinaryPublicId={cloudinaryPublicId || publicId}
            onDownloadWithBorder={handleDownloadSubclip}
            showTrimControls={true}
            borderLayerId={selectedBorderLayerId}
            onBorderLayerChange={(id) => setSelectedBorderLayerId(id)}
            availableBorders={[
              { value: "Border_1080_10px_ert7sl", label: "1080p - 10px" },
              { value: "Border_1080_20px_moefgp", label: "1080p - 20px" },
              { value: "Border_1080_40px_szde6u", label: "1080p - 40px" },
              { value: "Border_4K_10px_wnw98u", label: "4K - 10px" },
              { value: "Border_4K_20px_hwfmti", label: "4K - 20px" },
              { value: "Border_4K_40px_k66aor", label: "4K - 40px" },
            ]}
          />
        </div>
      )}

      {/* Debug info */}
      <div className="mt-2 text-xs text-gray-400">
        <p>
          Keyboard shortcuts:{" "}
          <span className="font-medium text-gray-300">I</span> = Mark In,{" "}
          <span className="font-medium text-gray-300">O</span> = Mark Out,{" "}
          <span className="font-medium text-gray-300">Space</span> = Play/Pause
        </p>
        <p>
          Video loaded: {isVideoLoaded ? "✅" : "❌"} | Status: {loadingStatus}
        </p>
      </div>
    </div>
  );
};

export default CloudinaryVideoEditor;

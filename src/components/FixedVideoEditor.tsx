import React, { useState, useEffect } from "react";

const FixedVideoEditor = () => {
  // Use state instead of refs for everything
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markIn, setMarkIn] = useState<number | null>(null);
  const [markOut, setMarkOut] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get direct access to the video element when needed
  const getVideoElement = (): HTMLVideoElement | null => {
    return document.getElementById("video-element") as HTMLVideoElement;
  };

  // Initialize video metadata
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log("✅ Video metadata loaded");
    setDuration(e.currentTarget.duration);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime);

    // Check if we need to stop at mark out point
    if (markOut !== null && e.currentTarget.currentTime >= markOut) {
      e.currentTarget.pause();
      setIsPlaying(false);
    }
  };

  // Controls
  const handlePlay = () => {
    const video = getVideoElement();
    if (!video) return;

    // If we have a mark in point and we're before it, start from there
    if (markIn !== null && video.currentTime < markIn) {
      video.currentTime = markIn;
    }

    video
      .play()
      .then(() => {
        setIsPlaying(true);
        console.log("✅ Video playing");
      })
      .catch((err) => console.error("❌ Error playing video:", err));
  };

  const handlePause = () => {
    const video = getVideoElement();
    if (!video) return;
    video.pause();
    setIsPlaying(false);
  };

  const handleStop = () => {
    const video = getVideoElement();
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  };

  const handleSkipForward = () => {
    const video = getVideoElement();
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
  };

  const handleStepBack = () => {
    const video = getVideoElement();
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 1 / 30);
  };

  const handlePreviewSubclip = () => {
    const video = getVideoElement();
    if (!video || markIn === null || markOut === null || markIn >= markOut) {
      alert("Mark In and Mark Out must be set correctly.");
      return;
    }

    // Set to mark in point and play
    video.currentTime = markIn;
    video
      .play()
      .then(() => {
        setIsPlaying(true);
        console.log(
          `✅ Playing subclip from ${markIn.toFixed(2)}s to ${markOut.toFixed(2)}s`,
        );
      })
      .catch((err) => console.error("❌ Error playing subclip:", err));
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          isPlaying ? handlePause() : handlePlay();
          break;
        case "KeyI":
          e.preventDefault();
          setMarkIn(currentTime);
          break;
        case "KeyO":
          e.preventDefault();
          setMarkOut(currentTime);
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleStepBack();
          break;
        case "ArrowRight":
          e.preventDefault();
          const video = getVideoElement();
          if (video)
            video.currentTime = Math.min(
              video.duration,
              video.currentTime + 1 / 30,
            );
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, isPlaying, markIn, markOut]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🎬 Fixed Video Editor</h2>

      {/* Video Preview Box */}
      <div className="bg-black rounded-lg overflow-hidden mb-4">
        <video
          id="video-element" // Use ID instead of ref
          src="https://res.cloudinary.com/demo/video/upload/v1611764980/samples/elephants.mp4"
          className="w-full h-auto"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          controls={false}
          preload="auto"
          crossOrigin="anonymous"
        />
      </div>

      {/* Progress bar */}
      <div
        className="relative h-2 bg-gray-200 rounded-full mb-4 cursor-pointer"
        onClick={(e) => {
          const video = getVideoElement();
          if (!video) return;

          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          video.currentTime = pos * duration;
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
            className="absolute top-0 bottom-0 bg-blue-200"
            style={{
              left: `${(markIn / Math.max(duration, 1)) * 100}%`,
              width: `${((markOut - markIn) / Math.max(duration, 1)) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Time display */}
      <div className="flex justify-between mb-4 text-sm">
        <span>
          {Math.floor(currentTime / 60)}:
          {Math.floor(currentTime % 60)
            .toString()
            .padStart(2, "0")}{" "}
          / {Math.floor(duration / 60)}:
          {Math.floor(duration % 60)
            .toString()
            .padStart(2, "0")}
        </span>
        {markIn !== null && markOut !== null && (
          <span>Subclip: {(markOut - markIn).toFixed(2)}s</span>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleStepBack}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⬅ Step Back
        </button>

        {isPlaying ? (
          <button
            onClick={handlePause}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ▶ Play
          </button>
        )}

        <button
          onClick={handleStop}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⏹ Stop
        </button>

        <button
          onClick={handleSkipForward}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          ⏩ +5s
        </button>
      </div>

      {/* Mark In/Out Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMarkIn(currentTime)}
          className="px-3 py-1 bg-green-100 hover:bg-green-200 border border-green-500 rounded"
        >
          📍 Mark In
        </button>

        <button
          onClick={() => setMarkOut(currentTime)}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-500 rounded"
        >
          🎯 Mark Out
        </button>

        <button
          onClick={handlePreviewSubclip}
          disabled={markIn === null || markOut === null || markIn >= markOut}
          className={`px-3 py-1 rounded ${markIn !== null && markOut !== null && markIn < markOut ? "bg-blue-100 hover:bg-blue-200 border border-blue-500" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          🎞 Preview Subclip
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
        <p>
          <strong>⏱ Current Time:</strong> {currentTime.toFixed(2)}s
        </p>
        <p>
          <strong>🟢 Mark In:</strong>{" "}
          {markIn !== null ? `${markIn.toFixed(2)}s` : "Not set"}
        </p>
        <p>
          <strong>🔴 Mark Out:</strong>{" "}
          {markOut !== null ? `${markOut.toFixed(2)}s` : "Not set"}
        </p>
        <p>
          <strong>📏 Subclip Duration:</strong>{" "}
          {markIn !== null && markOut !== null
            ? `${(markOut - markIn).toFixed(2)}s`
            : "N/A"}
        </p>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Keyboard shortcuts: <strong>Space</strong> = Play/Pause,{" "}
          <strong>I</strong> = Mark In, <strong>O</strong> = Mark Out,{" "}
          <strong>←/→</strong> = Step frame
        </p>
      </div>
    </div>
  );
};

export default FixedVideoEditor;

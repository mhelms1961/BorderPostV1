import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Scissors,
  CornerDownRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface VideoPlayerProps {
  videoSrc?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onFrameSelect?: (frameTime: number) => void;
  selectedTime?: number;
  onInPointSet?: (time: number) => void;
  onOutPointSet?: (time: number | null) => void;
  inPoint?: number | null;
  outPoint?: number | null;
  onDurationChange?: (duration: number) => void;
}

const VideoPlayer = ({
  videoSrc = "",
  onTimeUpdate,
  onFrameSelect,
  selectedTime,
  onInPointSet,
  onOutPointSet,
  inPoint: externalInPoint = null,
  outPoint: externalOutPoint = null,
  onDurationChange,
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [inPoint, setInPoint] = useState<number | null>(externalInPoint);
  const [outPoint, setOutPoint] = useState<number | null>(externalOutPoint);
  const [isPreviewingClip, setIsPreviewingClip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format time in MM:SS format
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      if (onFrameSelect) {
        onFrameSelect(newTime);
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.min(
        Math.max(videoRef.current.currentTime + seconds, 0),
        duration,
      );
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      if (onFrameSelect) {
        onFrameSelect(newTime);
      }
    }
  };

  // Set in point at current time
  const setInPointAtCurrentTime = () => {
    const time = currentTime;
    setInPoint(time);
    if (onInPointSet) {
      onInPointSet(time);
    }
    // If out point is before in point, reset it
    if (outPoint !== null && outPoint <= time) {
      setOutPoint(null);
      if (onOutPointSet) {
        onOutPointSet(null);
      }
    }
  };

  // Set out point at current time
  const setOutPointAtCurrentTime = () => {
    const time = currentTime;
    // Only set out point if it's after in point
    if (inPoint === null || time > inPoint) {
      setOutPoint(time);
      if (onOutPointSet) {
        onOutPointSet(time);
      }
    }
  };

  // Preview the trimmed clip
  const previewClip = () => {
    if (videoRef.current && inPoint !== null) {
      // Seek to in point
      videoRef.current.currentTime = inPoint;
      setIsPreviewingClip(true);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Update time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }

      // If previewing clip and reached out point, pause
      if (
        isPreviewingClip &&
        outPoint !== null &&
        video.currentTime >= outPoint
      ) {
        video.pause();
        setIsPlaying(false);
        setIsPreviewingClip(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (onDurationChange) {
        onDurationChange(video.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsPreviewingClip(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onTimeUpdate, isPreviewingClip, outPoint]);

  // Sync with external in/out points
  useEffect(() => {
    if (externalInPoint !== undefined && externalInPoint !== inPoint) {
      setInPoint(externalInPoint);
    }
    if (externalOutPoint !== undefined && externalOutPoint !== outPoint) {
      setOutPoint(externalOutPoint);
    }
  }, [externalInPoint, externalOutPoint]);

  // Sync with selected time from filmstrip
  useEffect(() => {
    if (
      videoRef.current &&
      selectedTime !== undefined &&
      selectedTime !== videoRef.current.currentTime
    ) {
      videoRef.current.currentTime = selectedTime;
      setCurrentTime(selectedTime);
    }
  }, [selectedTime]);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Video container */}
      <div className="relative w-full aspect-video bg-black">
        {videoSrc ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={videoSrc}
            playsInline
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
            <p>Upload a video to preview</p>
          </div>
        )}

        {/* In/Out point markers on video */}
        {inPoint !== null && (
          <div
            className="absolute h-full w-1 bg-blue-500 opacity-70"
            style={{ left: `${(inPoint / duration) * 100}%` }}
          />
        )}
        {outPoint !== null && (
          <div
            className="absolute h-full w-1 bg-red-500 opacity-70"
            style={{ left: `${(outPoint / duration) * 100}%` }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-white">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="relative">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              disabled={!videoSrc}
              className="cursor-pointer"
            />

            {/* In/Out point indicators on slider */}
            {inPoint !== null && (
              <div
                className="absolute top-1/2 w-2 h-4 bg-blue-500 rounded-sm -translate-y-1/2"
                style={{
                  left: `${(inPoint / duration) * 100}%`,
                  marginLeft: "-4px",
                }}
              />
            )}
            {outPoint !== null && (
              <div
                className="absolute top-1/2 w-2 h-4 bg-red-500 rounded-sm -translate-y-1/2"
                style={{
                  left: `${(outPoint / duration) * 100}%`,
                  marginLeft: "-4px",
                }}
              />
            )}

            {/* Highlight selected region */}
            {inPoint !== null && outPoint !== null && (
              <div
                className="absolute top-1/2 h-2 bg-yellow-400 opacity-40 -translate-y-1/2"
                style={{
                  left: `${(inPoint / duration) * 100}%`,
                  width: `${((outPoint - inPoint) / duration) * 100}%`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-5)}
              disabled={!videoSrc}
              className="rounded-full"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              disabled={!videoSrc}
              className="rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(5)}
              disabled={!videoSrc}
              className="rounded-full"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              disabled={!videoSrc}
              className="rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              disabled={!videoSrc}
              className={cn("w-24", !videoSrc && "opacity-50")}
            />
          </div>
        </div>

        {/* Trimming controls */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={setInPointAtCurrentTime}
                disabled={!videoSrc}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Scissors className="h-4 w-4" /> Set In Point
              </Button>
              {inPoint !== null && (
                <Badge variant="outline" className="bg-blue-50">
                  In: {formatTime(inPoint)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={setOutPointAtCurrentTime}
                disabled={!videoSrc || inPoint === null}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <Scissors className="h-4 w-4" /> Set Out Point
              </Button>
              {outPoint !== null && (
                <Badge variant="outline" className="bg-red-50">
                  Out: {formatTime(outPoint)}
                </Badge>
              )}
            </div>

            <Button
              onClick={previewClip}
              disabled={!videoSrc || inPoint === null}
              size="sm"
              variant="default"
              className="ml-auto flex items-center gap-1"
            >
              <CornerDownRight className="h-4 w-4" /> Preview Clip
            </Button>
          </div>

          {inPoint !== null && outPoint !== null && (
            <div className="mt-2 text-xs text-gray-500">
              Clip duration: {formatTime(outPoint - inPoint)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

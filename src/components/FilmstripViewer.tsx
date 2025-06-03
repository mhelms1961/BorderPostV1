import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface FilmstripViewerProps {
  videoSrc?: string;
  thumbnails?: string[];
  onFrameSelect?: (frameIndex: number) => void;
  selectedFrame?: number;
  totalFrames?: number;
  duration?: number;
  inPoint?: number | null;
  outPoint?: number | null;
}

const FilmstripViewer = ({
  videoSrc = "",
  thumbnails = Array(10).fill(
    "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200&q=80",
  ),
  onFrameSelect = () => {},
  selectedFrame = 0,
  totalFrames = 10,
  duration = 60,
  inPoint = null,
  outPoint = null,
}: FilmstripViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const filmstripRef = useRef<HTMLDivElement>(null);

  // Simulate loading thumbnails
  useEffect(() => {
    if (videoSrc) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [videoSrc]);

  const handleFrameClick = (index: number) => {
    onFrameSelect(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const calculateTimeForFrame = (index: number) => {
    const timePerFrame = duration / totalFrames;
    return formatTime(index * timePerFrame);
  };

  return (
    <div className="w-full bg-white border rounded-md shadow-sm p-4">
      <h3 className="text-sm font-medium mb-2">Timeline</h3>

      {!videoSrc ? (
        <div className="flex items-center justify-center h-32 bg-muted/20 rounded-md">
          <p className="text-muted-foreground text-sm">
            Upload a video to see the filmstrip
          </p>
        </div>
      ) : (
        <ScrollArea className="h-44 w-full">
          <div ref={filmstripRef} className="flex space-x-1 p-1 min-w-full">
            {isLoading
              ? // Loading skeletons
                Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <Skeleton className="h-32 w-48 rounded-md" />
                      <Skeleton className="h-4 w-12 mt-1 rounded-md" />
                    </div>
                  ))
              : // Actual thumbnails
                thumbnails.map((thumbnail, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleFrameClick(index)}
                  >
                    <div
                      className={`relative h-32 w-48 rounded-md overflow-hidden border-2 ${selectedFrame === index ? "border-primary" : "border-transparent"}`}
                    >
                      <img
                        src={thumbnail}
                        alt={`Frame ${index}`}
                        className="h-full w-full object-cover"
                      />
                      {selectedFrame === index && (
                        <div className="absolute inset-0 bg-primary/10"></div>
                      )}

                      {/* In point marker */}
                      {inPoint !== null &&
                        calculateTimeForFrame(index) >= formatTime(inPoint) &&
                        calculateTimeForFrame(index) <= formatTime(inPoint) && (
                          <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 py-0.5">
                            IN
                          </div>
                        )}

                      {/* Out point marker */}
                      {outPoint !== null &&
                        calculateTimeForFrame(index) >= formatTime(outPoint) &&
                        calculateTimeForFrame(index) <=
                          formatTime(outPoint) && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5">
                            OUT
                          </div>
                        )}

                      {/* Selected region highlight */}
                      {inPoint !== null && outPoint !== null && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"
                          style={{
                            opacity:
                              calculateTimeForFrame(index) >=
                                formatTime(inPoint) &&
                              calculateTimeForFrame(index) <=
                                formatTime(outPoint)
                                ? 1
                                : 0,
                          }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {calculateTimeForFrame(index)}
                    </span>
                  </div>
                ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>0:00</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default FilmstripViewer;

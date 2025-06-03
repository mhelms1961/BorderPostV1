import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ExternalLink, Copy, Check } from "lucide-react";

interface DirectCloudinaryDownloaderProps {
  cloudName: string;
  publicId: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
  filename?: string;
}

export default function DirectCloudinaryDownloader({
  cloudName,
  publicId,
  startTime,
  endTime,
  borderLayerId,
  filename = "video.mp4",
}: DirectCloudinaryDownloaderProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate a direct URL to the video
  const generateDirectUrl = () => {
    // Clean the publicId to remove any file extensions
    const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

    // Create a basic URL without transformations
    return `https://res.cloudinary.com/${cloudName}/video/upload/${cleanPublicId}.mp4`;
  };

  // Generate a URL with just the trim parameters (no border)
  const generateTrimOnlyUrl = () => {
    if (!startTime || !endTime || startTime >= endTime) {
      return generateDirectUrl();
    }

    // Clean the publicId to remove any file extensions
    const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

    // Create URL with just trim parameters
    return `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)}/${cleanPublicId}.mp4`;
  };

  // Generate a URL with trim and border parameters
  const generateFullUrl = () => {
    // Clean the publicId to remove any file extensions
    const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

    // Start with base URL
    let url = `https://res.cloudinary.com/${cloudName}/video/upload/`;

    // Add transformations
    const transformations = [];

    // Add trim parameters if available
    if (
      startTime !== undefined &&
      endTime !== undefined &&
      startTime < endTime
    ) {
      transformations.push(`so_${startTime.toFixed(2)}`);
      transformations.push(`eo_${endTime.toFixed(2)}`);
    }

    // Add border if provided
    if (borderLayerId) {
      transformations.push(`l_${borderLayerId}`);
      transformations.push("e_overlay");
    }

    // Join transformations and add to URL
    if (transformations.length > 0) {
      url += transformations.join(",") + "/";
    }

    // Add the public ID
    url += `${cleanPublicId}.mp4`;

    return url;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (url: string, suffix: string = "") => {
    setIsDownloading(true);

    // Create a modified filename with the suffix
    const downloadFilename = suffix
      ? filename.replace(/\.mp4$/i, `${suffix}.mp4`)
      : filename;

    // Create a hidden anchor and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFilename;
    link.target = "_blank"; // Open in new tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloading(false);
  };

  // URLs for different download options
  const directUrl = generateDirectUrl();
  const trimOnlyUrl = generateTrimOnlyUrl();
  const fullUrl = generateFullUrl();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          Alternative Download Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original Video (No Transformations) */}
        <div className="space-y-2">
          <Label className="text-white">
            Original Video (No Transformations)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={directUrl}
              readOnly
              className="flex-1 bg-gray-700 text-white border-gray-600"
            />
            <Button
              variant="outline"
              size="icon"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => handleCopyUrl(directUrl)}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
              onClick={() => handleDownload(directUrl, "_original")}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" /> Download Original
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => window.open(directUrl, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
            </Button>
          </div>
        </div>

        {/* Trimmed Video (No Border) */}
        {startTime !== undefined &&
          endTime !== undefined &&
          startTime < endTime && (
            <div className="space-y-2">
              <Label className="text-white">Trimmed Video (No Border)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={trimOnlyUrl}
                  readOnly
                  className="flex-1 bg-gray-700 text-white border-gray-600"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => handleCopyUrl(trimOnlyUrl)}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-400 hover:bg-green-900/20"
                  onClick={() => handleDownload(trimOnlyUrl, "_trimmed")}
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Trimmed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => window.open(trimOnlyUrl, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
                </Button>
              </div>
            </div>
          )}

        {/* Full Transformation (Trim + Border) */}
        {borderLayerId && (
          <div className="space-y-2">
            <Label className="text-white">
              Full Transformation (Trim + Border)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={fullUrl}
                readOnly
                className="flex-1 bg-gray-700 text-white border-gray-600"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => handleCopyUrl(fullUrl)}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
                onClick={() => handleDownload(fullUrl, "_with_border")}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" /> Download with Border
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => window.open(fullUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 pt-2">
          <p>Try different methods if one doesn't work. You can:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Download directly using the buttons</li>
            <li>
              Open the URL in a new tab and use browser's save functionality
            </li>
            <li>Copy the URL and paste it in a new tab or download manager</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

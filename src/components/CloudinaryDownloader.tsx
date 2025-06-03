import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, ExternalLink, Copy } from "lucide-react";

interface CloudinaryDownloaderProps {
  cloudName: string;
  publicId: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
  filename?: string;
}

export default function CloudinaryDownloader({
  cloudName,
  publicId,
  startTime,
  endTime,
  borderLayerId,
  filename = "video.mp4",
}: CloudinaryDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate a direct download URL using Cloudinary's download API
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Try a completely different approach with a very simple URL structure
      // Using the raw transformation parameter format that Cloudinary expects
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

      // Add attachment flag for download
      transformations.push("fl_attachment");

      // Build the URL with a single transformation string
      const transformationString =
        transformations.length > 0 ? transformations.join(",") + "/" : "";
      const downloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}${cleanPublicId}.mp4`;

      console.log("Generated simplified download URL:", downloadUrl);

      // Create a hidden anchor and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.target = "_blank"; // Open in new tab to avoid CORS issues
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Download initiated! Check your browser's download tab.");
      setIsDownloading(false);
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Download failed");
      setIsDownloading(false);
    }
  };

  // Alternative approach using a server-side proxy
  const handleProxyDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Try a completely different approach with a very simple URL structure
      // Using the raw transformation parameter format that Cloudinary expects
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

      // Build the URL with a single transformation string
      const transformationString =
        transformations.length > 0 ? transformations.join(",") + "/" : "";
      const resourceUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}${cleanPublicId}.mp4`;

      console.log("Using simplified URL for download helper:", resourceUrl);

      // Encode the URL for the download helper
      const encodedUrl = encodeURIComponent(resourceUrl);

      // Use the download helper page
      window.open(
        `/download-helper.html?url=${encodedUrl}&filename=${encodeURIComponent(filename)}`,
        "_blank",
      );

      setSuccess("Download helper opened in a new tab!");
      setIsDownloading(false);
    } catch (err) {
      console.error("Proxy download error:", err);
      setError(err instanceof Error ? err.message : "Proxy download failed");
      setIsDownloading(false);
    }
  };

  // New method: Download without border
  const handleDownloadWithoutBorder = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Create a URL with only the trim transformations
      let downloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

      // Only add trim transformations
      if (
        startTime !== undefined &&
        endTime !== undefined &&
        startTime < endTime
      ) {
        downloadUrl += `/so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)},fl_attachment`;
      } else {
        downloadUrl += "/fl_attachment";
      }

      // Add the public ID
      downloadUrl += `/${cleanPublicId}.mp4`;

      console.log("Generated simple download URL (no border):", downloadUrl);

      // Create a hidden anchor and trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename.replace(".mp4", "_no_border.mp4");
      link.target = "_blank"; // Open in new tab to avoid CORS issues
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess("Download without border initiated!");
      setIsDownloading(false);
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Download failed");
      setIsDownloading(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = () => {
    try {
      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Create a URL with comma-separated transformations
      let downloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

      // Build transformation string with commas
      const transformations = [];

      // Add trim if start and end times are provided
      if (
        startTime !== undefined &&
        endTime !== undefined &&
        startTime < endTime
      ) {
        transformations.push(
          `so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)}`,
        );
      }

      // Add border if provided
      if (borderLayerId) {
        transformations.push(`l_${borderLayerId},fl_layer_apply`);
      }

      // Join transformations with commas and add to URL
      if (transformations.length > 0) {
        downloadUrl += "/" + transformations.join(",") + "/";
      } else {
        downloadUrl += "/";
      }

      // Add the public ID
      downloadUrl += `${cleanPublicId}.mp4`;

      navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy error:", err);
      setError(err instanceof Error ? err.message : "Copy failed");
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Download Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download with Border
              </>
            )}
          </Button>

          <Button
            onClick={handleProxyDownload}
            disabled={isDownloading}
            variant="outline"
            className="w-full border-blue-600 text-blue-400 hover:bg-blue-900/20"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Download Helper
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleDownloadWithoutBorder}
            disabled={isDownloading}
            variant="outline"
            className="w-full border-green-600 text-green-400 hover:bg-green-900/20"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download without Border
              </>
            )}
          </Button>

          <Button
            onClick={handleCopyUrl}
            disabled={isDownloading}
            variant="outline"
            className="w-full border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "URL Copied!" : "Copy URL"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-md text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-900/30 border border-green-700 rounded-md text-green-300 text-sm">
            {success}
          </div>
        )}

        <div className="text-xs text-gray-400">
          <p>If one method doesn't work, try another option.</p>
          <p className="mt-1">
            Video details: {startTime?.toFixed(2)}s to {endTime?.toFixed(2)}s{" "}
            {borderLayerId ? `with ${borderLayerId}` : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

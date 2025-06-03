import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";

interface SimpleCloudinaryDownloaderProps {
  cloudName: string;
  publicId: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
  filename?: string;
}

export default function SimpleCloudinaryDownloader({
  cloudName,
  publicId,
  startTime,
  endTime,
  borderLayerId,
  filename = "video.mp4",
}: SimpleCloudinaryDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generate a simplified URL structure for downloading
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Create a basic URL without transformations
      let downloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

      // Add transformations one by one with individual slashes
      // This approach avoids complex URL structures that might cause issues
      if (
        startTime !== undefined &&
        endTime !== undefined &&
        startTime < endTime
      ) {
        downloadUrl += `/so_${startTime.toFixed(2)}`;
        downloadUrl += `/eo_${endTime.toFixed(2)}`;
      }

      // Add border if provided - using a simpler approach
      if (borderLayerId) {
        downloadUrl += `/l_${borderLayerId}`;
        downloadUrl += `/e_overlay`;
      }

      // Add attachment flag for download
      downloadUrl += `/fl_attachment`;

      // Add the public ID
      downloadUrl += `/${cleanPublicId}.mp4`;

      console.log("Generated simplified download URL:", downloadUrl);

      // Create an iframe to handle the download without redirecting the main page
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);

      // Set a timeout to remove the iframe
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        setIsDownloading(false);
        setSuccess("Download initiated! Check your downloads folder.");
      }, 2000);
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Download failed");
      setIsDownloading(false);
    }
  };

  // Alternative download method using a form
  const handleFormDownload = () => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Create a basic URL without transformations
      let downloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

      // Add transformations one by one with individual slashes
      if (
        startTime !== undefined &&
        endTime !== undefined &&
        startTime < endTime
      ) {
        downloadUrl += `/so_${startTime.toFixed(2)}`;
        downloadUrl += `/eo_${endTime.toFixed(2)}`;
      }

      // Add border if provided - using a simpler approach
      if (borderLayerId) {
        downloadUrl += `/l_${borderLayerId}`;
        downloadUrl += `/e_overlay`;
      }

      // Add the public ID (without attachment flag)
      downloadUrl += `/${cleanPublicId}.mp4`;

      console.log("Form download URL:", downloadUrl);

      // Create a form to download the file
      const form = document.createElement("form");
      form.method = "GET";
      form.action = downloadUrl;
      form.target = "_blank";
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setIsDownloading(false);
      setSuccess("Download initiated in a new tab!");
    } catch (err) {
      console.error("Form download error:", err);
      setError(err instanceof Error ? err.message : "Form download failed");
      setIsDownloading(false);
    }
  };

  // Direct link download method
  const handleDirectLinkDownload = () => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Create a basic URL without transformations
      let downloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

      // Add only essential transformations with individual slashes
      if (
        startTime !== undefined &&
        endTime !== undefined &&
        startTime < endTime
      ) {
        downloadUrl += `/so_${startTime.toFixed(2)}`;
        downloadUrl += `/eo_${endTime.toFixed(2)}`;
      }

      // Add border if provided - using a simpler approach
      if (borderLayerId) {
        downloadUrl += `/l_${borderLayerId}`;
        downloadUrl += `/e_overlay`;
      }

      // Add the public ID (without attachment flag)
      downloadUrl += `/${cleanPublicId}.mp4`;

      console.log("Direct link URL:", downloadUrl);

      // Open in a new tab
      window.open(downloadUrl, "_blank");

      setIsDownloading(false);
      setSuccess(
        "Video opened in a new tab. Right-click and select 'Save Video As...' to download.",
      );
    } catch (err) {
      console.error("Direct link error:", err);
      setError(err instanceof Error ? err.message : "Direct link failed");
      setIsDownloading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Simple Download Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Download (iframe)
              </>
            )}
          </Button>

          <Button
            onClick={handleFormDownload}
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
                Download (form)
              </>
            )}
          </Button>

          <Button
            onClick={handleDirectLinkDownload}
            disabled={isDownloading}
            variant="outline"
            className="w-full border-purple-600 text-purple-400 hover:bg-purple-900/20"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Open & Save As
              </>
            )}
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
          <p>If one method doesn't work, try another option:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>The iframe method attempts to trigger a download directly</li>
            <li>
              The form method opens the video in a new tab with a GET request
            </li>
            <li>The direct link opens the video for manual saving</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

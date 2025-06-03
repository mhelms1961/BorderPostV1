import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, ExternalLink } from "lucide-react";
import {
  generateSimpleCloudinaryUrl,
  downloadCloudinaryVideoWithMethod,
} from "@/lib/cloudinary-utils";

interface CloudinarySimpleDownloadProps {
  cloudName: string;
  publicId: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
  filename?: string;
}

export default function CloudinarySimpleDownload({
  cloudName,
  publicId,
  startTime,
  endTime,
  borderLayerId,
  filename = "video.mp4",
}: CloudinarySimpleDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generate a download URL using the utility function
  const getDownloadUrl = (includeDownloadFlag: boolean = true) => {
    return generateSimpleCloudinaryUrl(cloudName, publicId, {
      startTime,
      endTime,
      borderLayerId,
      download: includeDownloadFlag,
    });
  };

  // Handle download with specified method
  const handleDownload = async (
    method: "iframe" | "form" | "direct" | "fetch",
  ) => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Get the URL with or without download flag based on method
      const includeDownloadFlag = method === "iframe" || method === "fetch";
      const url = getDownloadUrl(includeDownloadFlag);

      console.log(`Starting ${method} download with URL:`, url);

      // Use the utility function to handle the download
      await downloadCloudinaryVideoWithMethod(url, filename, method);

      // Show success message
      let successMessage = "";
      switch (method) {
        case "iframe":
          successMessage = "Download initiated! Check your downloads folder.";
          break;
        case "form":
          successMessage = "Download initiated in a new tab!";
          break;
        case "direct":
          successMessage =
            "Video opened in a new tab. Right-click and select 'Save Video As...' to download.";
          break;
        case "fetch":
          successMessage = "Download complete! Check your downloads folder.";
          break;
      }

      setSuccess(successMessage);
    } catch (err) {
      console.error(`${method} download error:`, err);
      setError(
        err instanceof Error ? err.message : `${method} download failed`,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Simplified Download</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleDownload("iframe")}
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
                Quick Download
              </>
            )}
          </Button>

          <Button
            onClick={() => handleDownload("fetch")}
            disabled={isDownloading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Fetch & Download
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleDownload("form")}
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
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </>
            )}
          </Button>

          <Button
            onClick={() => handleDownload("direct")}
            disabled={isDownloading}
            variant="outline"
            className="w-full border-orange-600 text-orange-400 hover:bg-orange-900/20"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                View & Save As
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
          <p>Try different methods if one doesn't work:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>
              <strong>Quick Download:</strong> Uses an iframe for direct
              download
            </li>
            <li>
              <strong>Fetch & Download:</strong> Downloads the file using the
              Fetch API
            </li>
            <li>
              <strong>Open in New Tab:</strong> Opens the video in a new tab
            </li>
            <li>
              <strong>View & Save As:</strong> Opens the video for manual saving
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

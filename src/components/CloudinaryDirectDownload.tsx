import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, ExternalLink } from "lucide-react";

interface CloudinaryDirectDownloadProps {
  cloudName: string;
  publicId: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
  filename?: string;
}

export default function CloudinaryDirectDownload({
  cloudName,
  publicId,
  startTime,
  endTime,
  borderLayerId,
  filename = "video.mp4",
}: CloudinaryDirectDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generate a simplified URL for trimming only (no border)
  const getTrimOnlyUrl = () => {
    // Clean the publicId to remove any file extensions
    const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

    // If no trim parameters, return the original video
    if (
      startTime === undefined ||
      endTime === undefined ||
      startTime >= endTime
    ) {
      return `https://res.cloudinary.com/${cloudName}/video/upload/f_mp4,vc_h264/${cleanPublicId}.mp4`;
    }

    // Import the utility function to generate a reliable URL
    try {
      // Use the utility function from cloudinary-utils.ts
      const { generateSimpleCloudinaryUrl } = require("@/lib/cloudinary-utils");
      return generateSimpleCloudinaryUrl(cloudName, publicId, {
        startTime,
        endTime,
        // No border
      });
    } catch (error) {
      console.error("Error importing generateSimpleCloudinaryUrl:", error);
      // Fallback to direct URL construction with commas
      return `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)},f_mp4,vc_h264/${cleanPublicId}.mp4`;
    }
  };

  // Generate a URL with trim and border
  const getTrimWithBorderUrl = async () => {
    // If no trim parameters or no border, use the trim-only URL
    if (
      startTime === undefined ||
      endTime === undefined ||
      startTime >= endTime ||
      !borderLayerId
    ) {
      return getTrimOnlyUrl();
    }

    try {
      // Use the utility function from cloudinary-utils.ts
      const { generateSimpleCloudinaryUrl } = await import(
        "@/lib/cloudinary-utils"
      );
      return generateSimpleCloudinaryUrl(cloudName, publicId, {
        startTime,
        endTime,
        borderLayerId,
        download: true, // Add download flag to force download
      });
    } catch (error) {
      console.error("Error importing generateSimpleCloudinaryUrl:", error);

      // Clean the publicId to remove any file extensions
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

      // Ensure the border ID has the "Border_" prefix
      const fullBorderId = borderLayerId.startsWith("Border_")
        ? borderLayerId
        : `Border_${borderLayerId}`;

      // Build transformations with commas
      const transformations = [
        `l_image:${fullBorderId}`,
        "fl_relative",
        "w_1.0",
        "fl_layer_apply",
        `so_${startTime.toFixed(2)}`,
        `eo_${endTime.toFixed(2)}`,
        "f_mp4",
        "vc_h264",
        "fl_attachment",
      ];

      // Construct the URL with comma-separated transformations
      const url = `https://res.cloudinary.com/${cloudName}/video/upload/${transformations.join(",")}/${cleanPublicId}.mp4`;
      console.log("Fallback URL generated:", url);
      return url;
    }
  };

  // Handle download with a specific method
  const handleDownload = async (method: "trim" | "original") => {
    try {
      setIsDownloading(true);
      setError(null);
      setSuccess(null);

      // Get the appropriate URL based on the method
      const url =
        method === "trim"
          ? getTrimOnlyUrl()
          : `https://res.cloudinary.com/${cloudName}/video/upload/${publicId.replace(/\.(mp4|mov|avi|webm)$/i, "")}.mp4`;

      console.log(`Starting ${method} download with URL:`, url);

      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = method === "trim" ? filename : `original_${filename}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(
        `${method === "trim" ? "Trimmed" : "Original"} video download initiated!`,
      );
    } catch (err) {
      console.error(`${method} download error:`, err);
      setError(
        err instanceof Error ? err.message : `${method} download failed`,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Open the video in a new tab for manual saving
  const handleOpenInNewTab = (method: "trim" | "original") => {
    try {
      const url =
        method === "trim"
          ? getTrimOnlyUrl()
          : `https://res.cloudinary.com/${cloudName}/video/upload/${publicId.replace(/\.(mp4|mov|avi|webm)$/i, "")}.mp4`;
      window.open(url, "_blank");
      setSuccess(
        `${method === "trim" ? "Trimmed" : "Original"} video opened in new tab. Right-click and select 'Save Video As...'`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to open ${method} video`,
      );
    }
  };

  // Create a download helper URL
  const getDownloadHelperUrl = (method: "trim" | "original") => {
    const url =
      method === "trim"
        ? getTrimOnlyUrl()
        : `https://res.cloudinary.com/${cloudName}/video/upload/${publicId.replace(/\.(mp4|mov|avi|webm)$/i, "")}.mp4`;
    const downloadFilename =
      method === "trim" ? filename : `original_${filename}`;
    return `/download-helper.html?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(downloadFilename)}`;
  };

  // Get a direct streaming URL (may work better for some browsers)
  const getStreamingUrl = (method: "trim" | "original") => {
    if (method === "trim" && startTime !== undefined && endTime !== undefined) {
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");
      // Use streaming_attachment instead of fl_attachment with comma-separated transformations
      // Include border if provided
      if (borderLayerId) {
        return `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)},l_image:${borderLayerId},fl_relative,w_1.0,fl_layer_apply,fl_streaming,f_mp4,vc_h264/${cleanPublicId}.mp4`;
      } else {
        return `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)},fl_streaming,f_mp4,vc_h264/${cleanPublicId}.mp4`;
      }
    } else {
      const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");
      return `https://res.cloudinary.com/${cloudName}/video/upload/fl_streaming,f_mp4,vc_h264/${cleanPublicId}.mp4`;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Reliable Download Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-300 text-sm mb-4">
          <p className="font-medium">⚠️ Border Download Issue</p>
          <p className="mt-1">
            We've detected issues with downloading videos that have both
            trimming and borders. As a workaround, you can download the trimmed
            video without the border, and then add the border separately in your
            video editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleDownload("trim")}
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
                Download Trimmed Video
              </>
            )}
          </Button>

          <Button
            onClick={() => handleDownload("original")}
            disabled={isDownloading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Original Video
              </>
            )}
          </Button>

          {borderLayerId && (
            <Button
              onClick={async () => {
                try {
                  const url = await getTrimWithBorderUrl();
                  console.log("Using URL for download:", url);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `${filename.replace(".mp4", "")}_with_border.mp4`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setSuccess("Download with border initiated!");
                } catch (error) {
                  console.error("Download error:", error);
                  setError(
                    error instanceof Error ? error.message : String(error),
                  );
                }
              }}
              disabled={isDownloading}
              className="w-full bg-purple-600 hover:bg-purple-700 col-span-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download With Border
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => window.open(getDownloadHelperUrl("trim"), "_blank")}
            variant="outline"
            className="w-full border-blue-600 text-blue-400 hover:bg-blue-900/20"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Trimmed in Helper
          </Button>

          <Button
            onClick={() => handleOpenInNewTab("trim")}
            variant="outline"
            className="w-full border-purple-600 text-purple-400 hover:bg-purple-900/20"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View & Save Trimmed
          </Button>

          <Button
            onClick={() => window.open(getStreamingUrl("trim"), "_blank")}
            variant="outline"
            className="w-full border-amber-600 text-amber-400 hover:bg-amber-900/20"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Stream Trimmed Video
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
          <p>
            These options provide the most reliable ways to download your video:
          </p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>
              <strong>Download Trimmed Video:</strong> Gets your video with the
              trim points but without the border
            </li>
            <li>
              <strong>Download Original Video:</strong> Downloads the complete
              original video
            </li>
            <li>
              <strong>Open in Helper:</strong> Uses our download helper page for
              more reliable downloads
            </li>
            <li>
              <strong>View & Save:</strong> Opens the video in a new tab for
              manual saving
            </li>
            <li>
              <strong>Stream Trimmed Video:</strong> Opens a streaming version
              that you can save with right-click
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

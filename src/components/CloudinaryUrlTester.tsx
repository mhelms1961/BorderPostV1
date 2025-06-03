import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ExternalLink, Copy, Check, Download } from "lucide-react";

interface CloudinaryUrlTesterProps {
  initialCloudName?: string;
  initialPublicId?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialBorderLayerId?: string;
}

export default function CloudinaryUrlTester({
  initialCloudName = "dyco49ptm",
  initialPublicId = "mwkhvk2grw3oekqoebc7",
  initialStartTime = "1.73",
  initialEndTime = "3.62",
  initialBorderLayerId = "Border_1080_40px_szde6u",
}: CloudinaryUrlTesterProps) {
  const [cloudName, setCloudName] = useState(initialCloudName);
  const [publicId, setPublicId] = useState(initialPublicId);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [borderLayerId, setBorderLayerId] = useState(initialBorderLayerId);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"urls" | "download">("urls");

  // Generate different URL formats
  const generateUrls = () => {
    const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

    // Format 1: Original problematic URL (with e_overlay - INCORRECT)
    // This is kept only for demonstration purposes of what NOT to use
    const originalUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime}/eo_${endTime}/l_${borderLayerId}/e_overlay/fl_layer_apply/fl_attachment/${cleanPublicId}.mp4`;

    // Format 2: Simplified URL with commas (INCORRECT)
    const commaUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime},eo_${endTime},l_${borderLayerId},fl_layer_apply/${cleanPublicId}.mp4`;

    // Format 3: Trim only URL
    const trimOnlyUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime}/eo_${endTime}/${cleanPublicId}.mp4`;

    // Format 4: Border only URL
    const borderOnlyUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_${borderLayerId}/fl_layer_apply/${cleanPublicId}.mp4`;

    // Format 5: Original video URL
    const originalVideoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${cleanPublicId}.mp4`;

    // Format 6: Alternative format with border first (NOW CORRECT)
    const borderFirstUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_${borderLayerId}/fl_relative/w_1.0/fl_layer_apply/so_${startTime}/eo_${endTime}/${cleanPublicId}.mp4`;

    // Format 7: Using e_overlay for border (INCORRECT)
    // This is kept only for demonstration purposes of what NOT to use
    const eOverlayUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime}/eo_${endTime}/l_${borderLayerId}/e_overlay/${cleanPublicId}.mp4`;

    // Format 8: CORRECT format with proper order and no e_overlay
    const correctUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_image:${borderLayerId}/fl_relative/w_1.0/fl_layer_apply/so_${startTime}/eo_${endTime}/${cleanPublicId}.mp4`;

    // Format 9: CORRECT format with download flag
    const correctDownloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_image:${borderLayerId}/fl_relative/w_1.0/fl_layer_apply/so_${startTime}/eo_${endTime}/fl_attachment/${cleanPublicId}.mp4`;

    // Generate URL using the utility function
    let utilityUrl = "";
    try {
      const { generateSimpleCloudinaryUrl } = require("@/lib/cloudinary-utils");
      utilityUrl = generateSimpleCloudinaryUrl(cloudName, publicId, {
        startTime: parseFloat(startTime),
        endTime: parseFloat(endTime),
        borderLayerId,
        download: true,
      });
    } catch (error) {
      console.error("Error generating utility URL:", error);
    }

    return {
      originalUrl,
      commaUrl,
      trimOnlyUrl,
      borderOnlyUrl,
      originalVideoUrl,
      borderFirstUrl,
      eOverlayUrl,
      correctUrl,
      correctDownloadUrl,
      utilityUrl,
    };
  };

  const urls = generateUrls();

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (url: string, label: string) => {
    try {
      // Create a link element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${publicId}_${label}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error downloading ${label}:`, error);
      // Open in new tab as fallback
      window.open(url, "_blank");
    }
  };

  return (
    <div className="bg-white p-6">
      <Card>
        <CardHeader>
          <CardTitle>Cloudinary URL Tester</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cloud-name">Cloud Name</Label>
              <Input
                id="cloud-name"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="public-id">Public ID</Label>
              <Input
                id="public-id"
                value={publicId}
                onChange={(e) => setPublicId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="border-layer">Border Layer ID</Label>
              <Input
                id="border-layer"
                value={borderLayerId}
                onChange={(e) => setBorderLayerId(e.target.value)}
              />
            </div>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "urls" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("urls")}
            >
              Test URLs
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "download" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("download")}
            >
              Download Options
            </button>
          </div>

          {activeTab === "urls" && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Test URLs</h3>

              {/* Original URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Original Problematic URL
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.originalUrl}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.originalUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.originalUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comma URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Simplified URL with Commas
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.commaUrl}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.commaUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.commaUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Trim Only URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Trim Only URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.trimOnlyUrl}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.trimOnlyUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.trimOnlyUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Border Only URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Border Only URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.borderOnlyUrl}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.borderOnlyUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.borderOnlyUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Border First URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Border First URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.borderFirstUrl}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.borderFirstUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.borderFirstUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* E-Overlay URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  E-Overlay URL (INCORRECT)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.eOverlayUrl}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.eOverlayUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.eOverlayUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* CORRECT URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-600 font-bold">
                  CORRECT URL FORMAT (No e_overlay)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.correctUrl}
                    readOnly
                    className="flex-1 text-xs border-green-500"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.correctUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.correctUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* CORRECT DOWNLOAD URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-green-600 font-bold">
                  CORRECT DOWNLOAD URL
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.correctDownloadUrl}
                    readOnly
                    className="flex-1 text-xs border-green-500"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.correctDownloadUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      window.open(urls.correctDownloadUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Utility Function URL */}
              {urls.utilityUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-600 font-bold">
                    Generated by Utility Function
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={urls.utilityUrl}
                      readOnly
                      className="flex-1 text-xs border-blue-500"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyUrl(urls.utilityUrl)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(urls.utilityUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Original Video URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Original Video URL
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={urls.originalVideoUrl}
                    readOnly
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(urls.originalVideoUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(urls.originalVideoUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "download" && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Download Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() =>
                    handleDownload(urls.correctUrl, "correct_format")
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 col-span-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download with CORRECT Format
                </Button>

                <Button
                  onClick={() =>
                    handleDownload(urls.correctDownloadUrl, "correct_download")
                  }
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download with Attachment Flag
                </Button>

                {urls.utilityUrl && (
                  <Button
                    onClick={() =>
                      handleDownload(urls.utilityUrl, "utility_function")
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download with Utility Function
                  </Button>
                )}

                <Button
                  onClick={() => handleDownload(urls.trimOnlyUrl, "trim_only")}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-400 hover:bg-blue-900/20"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Trimmed Only
                </Button>

                <Button
                  onClick={() =>
                    handleDownload(urls.originalVideoUrl, "original")
                  }
                  variant="outline"
                  className="w-full border-green-600 text-green-400 hover:bg-green-900/20"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Original Video
                </Button>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mt-4">
                <h4 className="font-medium text-yellow-800">
                  Troubleshooting Tips
                </h4>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-yellow-700">
                  <li>
                    If you're getting a 400 error, try downloading the trimmed
                    video without the border
                  </li>
                  <li>
                    You can add the border separately in a video editor after
                    downloading
                  </li>
                  <li>
                    Try using the download helper page which can handle some
                    Cloudinary restrictions
                  </li>
                  <li>
                    If all else fails, download the original video and trim it
                    locally
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ExternalLink, Copy, Check, Download } from "lucide-react";
import { generateSimpleCloudinaryUrl } from "@/lib/cloudinary-utils";

export default function BorderOverlayTest() {
  const [cloudName, setCloudName] = useState("dyco49ptm");
  const [publicId, setPublicId] = useState("mwkhvk2grw3oekqoebc7");
  const [startTime, setStartTime] = useState("1.73");
  const [endTime, setEndTime] = useState("3.62");
  const [borderLayerId, setBorderLayerId] = useState("Border_1080_40px_szde6u");
  const [copied, setCopied] = useState(false);

  // Generate the URL using the utility function
  const utilityUrl = generateSimpleCloudinaryUrl(cloudName, publicId, {
    startTime: parseFloat(startTime),
    endTime: parseFloat(endTime),
    borderLayerId,
    download: true,
  });

  // Generate the expected correct URL format manually
  const expectedUrl = `https://res.cloudinary.com/dyco49ptm/video/upload/l_image:Border_1080_20px_moefgp,fl_relative,w_1.0,fl_layer_apply,so_2.70,eo_8.79,f_mp4,vc_h264,fl_attachment/${publicId.replace(/\.(mp4|mov|avi|webm)$/i, "")}.mp4`;

  // Generate the URL with commas (alternative format)
  const commaUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_image:${borderLayerId},fl_relative,w_1.0,fl_layer_apply,so_${startTime},eo_${endTime},fl_attachment,f_mp4,vc_h264/${publicId.replace(/\.(mp4|mov|avi|webm)$/i, "")}.mp4`;

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
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Border Overlay URL Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cloud-name" className="text-white">
              Cloud Name
            </Label>
            <Input
              id="cloud-name"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="public-id" className="text-white">
              Public ID
            </Label>
            <Input
              id="public-id"
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-time" className="text-white">
              Start Time
            </Label>
            <Input
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-time" className="text-white">
              End Time
            </Label>
            <Input
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="border-layer" className="text-white">
              Border Layer ID
            </Label>
            <Input
              id="border-layer"
              value={borderLayerId}
              onChange={(e) => setBorderLayerId(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-700 rounded-md">
          <h3 className="text-lg font-medium text-white mb-2">
            Generated URL (Utility Function)
          </h3>
          <div className="flex items-center gap-2">
            <Input
              value={utilityUrl}
              readOnly
              className="flex-1 text-xs bg-gray-600 text-green-300 border-gray-500"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyUrl(utilityUrl)}
              className="border-gray-500 text-gray-300"
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
              onClick={() => window.open(utilityUrl, "_blank")}
              className="border-gray-500 text-gray-300"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 bg-gray-700 rounded-md">
          <h3 className="text-lg font-medium text-white mb-2">
            Expected URL Format
          </h3>
          <div className="flex items-center gap-2">
            <Input
              value={expectedUrl}
              readOnly
              className="flex-1 text-xs bg-gray-600 text-blue-300 border-gray-500"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyUrl(expectedUrl)}
              className="border-gray-500 text-gray-300"
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
              onClick={() => window.open(expectedUrl, "_blank")}
              className="border-gray-500 text-gray-300"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 bg-gray-700 rounded-md">
          <h3 className="text-lg font-medium text-white mb-2">
            Comma Format URL
          </h3>
          <div className="flex items-center gap-2">
            <Input
              value={commaUrl}
              readOnly
              className="flex-1 text-xs bg-gray-600 text-yellow-300 border-gray-500"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyUrl(commaUrl)}
              className="border-gray-500 text-gray-300"
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
              onClick={() => window.open(commaUrl, "_blank")}
              className="border-gray-500 text-gray-300"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleDownload(utilityUrl, "utility_function")}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download (Utility)
          </Button>

          <Button
            onClick={() => handleDownload(expectedUrl, "expected_format")}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download (Expected)
          </Button>

          <Button
            onClick={() => handleDownload(commaUrl, "comma_format")}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download (Comma)
          </Button>
        </div>

        <div className="p-4 bg-gray-700 rounded-md text-sm text-gray-300">
          <h3 className="text-lg font-medium text-white mb-2">
            URL Comparison
          </h3>
          <p className="mb-2">
            This test compares three different URL formats for Cloudinary video
            downloads with borders:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-green-300 font-medium">
                Utility Function:
              </span>{" "}
              Generated using our utility function
            </li>
            <li>
              <span className="text-blue-300 font-medium">
                Expected Format:
              </span>{" "}
              The format we expect to work with slashes
            </li>
            <li>
              <span className="text-yellow-300 font-medium">Comma Format:</span>{" "}
              Alternative format using commas instead of slashes
            </li>
          </ul>
          <p className="mt-2">
            Test each URL by clicking the download buttons to see which format
            works correctly.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

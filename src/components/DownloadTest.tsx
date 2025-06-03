import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { addAttachmentFlagToUrl } from "@/lib/download-utils";

interface DownloadTestProps {
  defaultUrl?: string;
}

export default function DownloadTest({ defaultUrl = "" }: DownloadTestProps) {
  const [url, setUrl] = useState(
    defaultUrl ||
      "https://res.cloudinary.com/dyco49ptm/video/upload/so_2.55,eo_4.89/l_Border_1080_40px_szde6u,e_overlay/j8b2ttug14sjwznbqgrj.mp4",
  );
  const [status, setStatus] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleAddAttachmentFlag = () => {
    if (!url) {
      setStatus("Please enter a URL");
      return;
    }

    try {
      const modifiedUrl = addAttachmentFlagToUrl(url);
      setDownloadUrl(modifiedUrl);
      setStatus(`URL modified with fl_attachment flag`);
    } catch (error) {
      setStatus(
        `Error modifying URL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const handleDownload = async () => {
    if (!url) {
      setStatus("Please enter a URL");
      return;
    }

    try {
      setStatus("Testing download...");

      // Import the download utility dynamically
      const { downloadCloudinaryVideo } = await import("@/lib/download-utils");

      // Use the utility function to handle the download
      await downloadCloudinaryVideo(url, "downloaded-video.mp4");

      setStatus("Download successful!");
    } catch (error) {
      console.error("Download failed:", error);
      setStatus(
        `Download failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Import the manual download instructions utility
      const { showManualDownloadInstructions } = await import(
        "@/lib/download-utils"
      );
      showManualDownloadInstructions(url, "downloaded-video.mp4");
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Cloudinary Download Test Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cloudinary URL to Test
          </label>
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Cloudinary URL"
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAddAttachmentFlag}
            variant="outline"
            className="flex-1"
          >
            Add fl_attachment Flag
          </Button>
          <Button onClick={handleDownload} className="flex-1">
            Test Download
          </Button>
        </div>

        {downloadUrl && (
          <div className="mt-4 p-3 rounded bg-gray-100">
            <p className="font-medium mb-1">Modified URL:</p>
            <p className="text-xs break-all">{downloadUrl}</p>
            <div className="mt-2">
              <a
                href={downloadUrl}
                download="test-download.mp4"
                className="text-blue-600 hover:underline text-sm"
              >
                Direct download link
              </a>
            </div>
          </div>
        )}

        {status && (
          <div
            className={`mt-4 p-3 rounded ${status.includes("failed") || status.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {status}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

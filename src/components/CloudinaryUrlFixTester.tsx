import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ExternalLink, Copy, Check, Download } from "lucide-react";

export default function CloudinaryUrlFixTester() {
  const [cloudName, setCloudName] = useState("dyco49ptm");
  const [publicId, setPublicId] = useState("umf7ylq7jatvr6towqzu");
  const [startTime, setStartTime] = useState("2.73");
  const [endTime, setEndTime] = useState("8.71");
  const [borderLayerId, setBorderLayerId] = useState("Border_1080_20px_moefgp");
  const [copied, setCopied] = useState(false);
  const [testResults, setTestResults] = useState<
    { url: string; status: string; working: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Generate different URL formats
  const generateUrls = () => {
    const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

    // Format 1: Original problematic URL (with e_overlay - INCORRECT)
    // This is kept only for demonstration purposes of what NOT to use
    const originalUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime}/eo_${endTime}/l_${borderLayerId}/e_overlay/fl_layer_apply/fl_attachment/${cleanPublicId}.mp4`;

    // Format 2: Border first with l_image prefix (CORRECT)
    const borderFirstUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_image:${borderLayerId}/fl_relative/w_1.0/fl_layer_apply/so_${startTime}/eo_${endTime}/f_mp4/vc_h264/${cleanPublicId}.mp4`;

    // Format 3: Border first with l_image prefix and attachment flag (CORRECT for download)
    const borderFirstDownloadUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_image:${borderLayerId}/fl_relative/w_1.0/fl_layer_apply/so_${startTime}/eo_${endTime}/f_mp4/vc_h264/fl_attachment/${cleanPublicId}.mp4`;

    // Format 4: Border first with commas (CORRECT alternative syntax)
    const commaUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_image:${borderLayerId},fl_relative,w_1.0,fl_layer_apply,so_${startTime},eo_${endTime},f_mp4,vc_h264/${cleanPublicId}.mp4`;

    // Format 5: Trim only URL (should work)
    const trimOnlyUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_${startTime}/eo_${endTime}/f_mp4/vc_h264/${cleanPublicId}.mp4`;

    // Format 6: Border only URL (should work)
    const borderOnlyUrl = `https://res.cloudinary.com/${cloudName}/video/upload/l_image:${borderLayerId}/fl_relative/w_1.0/fl_layer_apply/f_mp4/vc_h264/${cleanPublicId}.mp4`;

    // Format 7: Original video URL (should work)
    const originalVideoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/f_mp4/vc_h264/${cleanPublicId}.mp4`;

    return [
      { url: originalUrl, label: "Original Problematic URL (with e_overlay)" },
      { url: borderFirstUrl, label: "Border First with l_image prefix" },
      { url: borderFirstDownloadUrl, label: "Border First with Download Flag" },
      { url: commaUrl, label: "Border First with Commas" },
      { url: trimOnlyUrl, label: "Trim Only URL" },
      { url: borderOnlyUrl, label: "Border Only URL" },
      { url: originalVideoUrl, label: "Original Video URL" },
    ];
  };

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
      link.download = `${publicId}_${label.replace(/ /g, "_")}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Error downloading ${label}:`, error);
      // Open in new tab as fallback
      window.open(url, "_blank");
    }
  };

  const testAllUrls = async () => {
    setLoading(true);
    setTestResults([]);

    const urls = generateUrls();
    const results = [];

    for (const { url, label } of urls) {
      try {
        const response = await fetch(url, { method: "HEAD" });
        results.push({
          url,
          status: `${response.status} ${response.statusText}`,
          working: response.ok,
        });
      } catch (error) {
        results.push({
          url,
          status: `Error: ${error instanceof Error ? error.message : String(error)}`,
          working: false,
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const urls = generateUrls();

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Cloudinary URL Fix Tester</h2>
      <p className="mb-6">
        This tool tests different URL formats to find which ones work with
        Cloudinary.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="cloud-name">Cloud Name</Label>
          <Input
            id="cloud-name"
            value={cloudName}
            onChange={(e) => setCloudName(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="public-id">Public ID</Label>
          <Input
            id="public-id"
            value={publicId}
            onChange={(e) => setPublicId(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="border-layer">Border Layer ID</Label>
          <Input
            id="border-layer"
            value={borderLayerId}
            onChange={(e) => setBorderLayerId(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <Button
        onClick={testAllUrls}
        className="w-full mb-6 bg-blue-600 hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Testing URLs..." : "Test All URL Formats"}
      </Button>

      {testResults.length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded ${result.working ? "bg-green-900/30 border border-green-700" : "bg-red-900/30 border border-red-700"}`}
              >
                <p className="font-medium">{urls[index].label}</p>
                <p className="text-sm mb-2">{result.status}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyUrl(result.url)}
                    className="border-gray-600"
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(result.url, "_blank")}
                    className="border-gray-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" /> Open
                  </Button>
                  {result.working && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDownload(result.url, urls[index].label)
                      }
                      className="border-green-600 text-green-400"
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold">All URL Formats</h3>
        {urls.map((item, index) => (
          <div key={index} className="p-4 bg-gray-800 rounded-lg">
            <p className="font-medium mb-2">{item.label}</p>
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={item.url}
                readOnly
                className="flex-1 text-xs bg-gray-700 border-gray-600"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyUrl(item.url)}
                className="border-gray-600"
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
                onClick={() => window.open(item.url, "_blank")}
                className="border-gray-600"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => handleDownload(item.url, item.label)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Troubleshooting Tips</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            The <strong>Border First with l_image prefix</strong> format is the
            recommended approach
          </li>
          <li>
            Always use <code>l_image:</code> prefix for border overlays, not{" "}
            <code>l_</code> or <code>e_overlay</code>
          </li>
          <li>
            Apply the border transformation <strong>before</strong> the trim
            parameters
          </li>
          <li>
            Include <code>fl_relative</code> and <code>w_1.0</code> for proper
            border scaling
          </li>
          <li>
            Add <code>f_mp4</code> and <code>vc_h264</code> for better
            compatibility
          </li>
          <li>
            For downloads, add <code>fl_attachment</code> at the end of
            transformations
          </li>
          <li>
            If all else fails, try downloading the trimmed video without border
            and add the border separately
          </li>
        </ul>
      </div>
    </div>
  );
}

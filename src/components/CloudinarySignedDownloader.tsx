import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Key } from "lucide-react";
import {
  generateSignedUrl,
  generateSimpleDownloadUrl,
  initiateDownload,
} from "@/lib/cloudinary-signed-urls";

interface CloudinarySignedDownloaderProps {
  cloudName: string;
  publicId: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
  filename?: string;
}

export default function CloudinarySignedDownloader({
  cloudName,
  publicId,
  startTime,
  endTime,
  borderLayerId,
  filename = "video.mp4",
}: CloudinarySignedDownloaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(
    "328246238858881" || import.meta.env.VITE_CLOUDINARY_API_KEY || "",
  );
  const [apiSecret, setApiSecret] = useState<string>(
    "Rofj-I7QBlFsaNNysprRKzCrFIg" || "",
  );
  const [showApiFields, setShowApiFields] = useState(false);

  // Handle download with signed URL
  const handleSignedDownload = () => {
    // API key and secret are now pre-filled
    if (!apiKey || !apiSecret) {
      setError("API Key and Secret are required for signed downloads");
      setShowApiFields(true);
      return;
    }

    setIsDownloading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate a signed URL
      const signedUrl = generateSignedUrl({
        cloudName,
        publicId,
        apiKey,
        apiSecret,
        startTime,
        endTime,
        borderLayerId,
      });

      console.log("Generated signed URL:", signedUrl);

      // Generate a filename
      const downloadFilename = filename.includes(".mp4")
        ? filename
        : `${filename}.mp4`;

      // Initiate the download
      initiateDownload(signedUrl, downloadFilename);

      setSuccess("Download initiated with signed URL!");
    } catch (err) {
      console.error("Signed download error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle download with simple URL
  const handleSimpleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate a simple URL using the utility function
      const { generateSimpleCloudinaryUrl } = await import(
        "@/lib/cloudinary-utils"
      );
      const simpleUrl = generateSimpleCloudinaryUrl(cloudName, publicId, {
        startTime,
        endTime,
        borderLayerId,
        download: true,
      });

      console.log("Generated simple URL:", simpleUrl);

      // Generate a filename
      const downloadFilename = filename.includes(".mp4")
        ? filename
        : `${filename}.mp4`;

      // Initiate the download
      initiateDownload(simpleUrl, downloadFilename);

      setSuccess("Download initiated with simple URL!");
    } catch (err) {
      console.error("Simple download error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle download without border
  const handleDownloadWithoutBorder = () => {
    setIsDownloading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate a simple URL without border
      const simpleUrl = generateSimpleDownloadUrl({
        cloudName,
        publicId,
        startTime,
        endTime,
        // No borderLayerId
      });

      console.log("Generated URL without border:", simpleUrl);

      // Generate a filename
      const downloadFilename = filename.includes(".mp4")
        ? filename.replace(".mp4", "_no_border.mp4")
        : `${filename}_no_border.mp4`;

      // Initiate the download
      initiateDownload(simpleUrl, downloadFilename);

      setSuccess("Download without border initiated!");
    } catch (err) {
      console.error("Download without border error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDownloading(false);
    }
  };

  // Toggle API fields visibility
  const toggleApiFields = () => {
    setShowApiFields(!showApiFields);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Cloudinary Signed Download</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key and Secret fields */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleApiFields}
            className="flex items-center gap-2 mb-4 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
          >
            <Key className="h-4 w-4" />
            {showApiFields ? "Hide API Fields" : "Show API Fields"}
          </Button>

          {showApiFields && (
            <div className="space-y-4 p-4 bg-gray-700 rounded-md">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-white">
                  Cloudinary API Key
                </Label>
                <Input
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Cloudinary API Key"
                  className="bg-gray-600 text-white border-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-secret" className="text-white">
                  Cloudinary API Secret
                </Label>
                <Input
                  id="api-secret"
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="Enter your Cloudinary API Secret"
                  className="bg-gray-600 text-white border-gray-500"
                />
              </div>

              <p className="text-xs text-gray-300">
                Your API credentials are used locally to generate signed URLs
                and are not stored or transmitted elsewhere.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleSignedDownload}
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
                Download with Signed URL
              </>
            )}
          </Button>

          <Button
            onClick={handleSimpleDownload}
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
                Download with Simple URL
              </>
            )}
          </Button>
        </div>

        <Button
          onClick={handleDownloadWithoutBorder}
          disabled={isDownloading}
          variant="outline"
          className="w-full border-purple-600 text-purple-400 hover:bg-purple-900/20"
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Without Border
            </>
          )}
        </Button>

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
          <p className="font-medium mb-1">About Signed URLs:</p>
          <p>
            Signed URLs include authentication parameters that can help bypass
            restrictions that might be causing 400 errors. For this to work, you
            need to provide your Cloudinary API Key and Secret.
          </p>
          <p className="mt-2">
            If you don't have these credentials, try the "Download Without
            Border" option which uses a simpler URL structure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, ExternalLink } from "lucide-react";

interface DownloadProxyServiceProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  filename: string;
}

export default function DownloadProxyService({
  open,
  onClose,
  videoUrl,
  filename,
}: DownloadProxyServiceProps) {
  const [copied, setCopied] = useState(false);

  // Create a direct download link
  const directDownloadUrl = videoUrl;

  // Create a fallback download link using a proxy service
  const proxyDownloadUrl = `https://download-proxy.vercel.app/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(directDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectDownload = () => {
    window.open(directDownloadUrl, "_blank");
  };

  const handleProxyDownload = () => {
    window.open(proxyDownloadUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Video</DialogTitle>
          <DialogDescription>
            Choose one of the download options below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Video URL</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={directDownloadUrl}
                readOnly
                className="flex-1 text-xs"
              />
              <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                {copied ? "Copied!" : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full" onClick={handleDirectDownload}>
              <Download className="mr-2 h-4 w-4" />
              Direct Download
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleProxyDownload}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Download via Proxy
            </Button>

            <p className="text-xs text-gray-500 text-center">
              If the direct download doesn't work, try the proxy option. The
              proxy helps bypass CORS restrictions and handles Cloudinary
              transformations better.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

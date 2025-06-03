import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CloudinaryDirectDownload from "@/components/CloudinaryDirectDownload";
import CloudinarySignedDownloader from "@/components/CloudinarySignedDownloader";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DownloadTestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black shadow-sm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Download Test Page
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Test Video Download</CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <p className="mb-4">
              This page allows you to test different download methods for a
              video with trim points and border.
            </p>

            <div className="space-y-8">
              {/* Direct Download Options */}
              <CloudinaryDirectDownload
                cloudName="dyco49ptm"
                publicId="vgrlljlnkxywzw8prmy4"
                startTime={1.69}
                endTime={4.06}
                borderLayerId="Border_1080_40px_szde6u"
                filename="test_video.mp4"
              />

              {/* Signed Download Options */}
              <CloudinarySignedDownloader
                cloudName="dyco49ptm"
                publicId="vgrlljlnkxywzw8prmy4"
                startTime={1.69}
                endTime={4.06}
                borderLayerId="Border_1080_40px_szde6u"
                filename="test_video.mp4"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

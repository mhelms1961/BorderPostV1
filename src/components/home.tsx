import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import VideoEditorStoryboard from "@/components/ui/VideoEditorStoryboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white p-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">BorderPost_Clean</h1>
            <span className="text-sm text-muted-foreground">
              Video Uploader
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 py-8">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Upload Video to Cloudinary
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select a video file to upload. Once uploaded, you'll be able to
                access it in your Cloudinary media library.
              </p>
              <VideoEditorStoryboard />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white p-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>
            © {new Date().getFullYear()} BorderPost_Clean. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

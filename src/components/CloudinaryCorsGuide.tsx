import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Info, CheckCircle } from "lucide-react";

export default function CloudinaryCorsGuide() {
  const vercelUrl =
    "https://border-post-v1-87uavxskx-mark-helms-projects.vercel.app";

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-6">
        Cloudinary CORS Configuration Guide
      </h1>

      <Alert className="mb-6 border-blue-500 bg-blue-50">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle className="text-blue-700">Important</AlertTitle>
        <AlertDescription className="text-blue-600">
          CORS settings in Cloudinary are found in Upload Presets, not in the
          Security section.
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 1: Access Upload Presets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Navigate to your Cloudinary Dashboard:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Click on the <strong>Settings</strong> (gear icon) in the top
              navigation
            </li>
            <li>
              Select the <strong>Upload</strong> tab
            </li>
            <li>
              Scroll down to find <strong>Upload Presets</strong>
            </li>
          </ol>
          <div className="rounded-md overflow-hidden border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1611174743420-3d7df880ce32?w=800&q=80"
              alt="Cloudinary Dashboard Navigation"
              className="w-full h-auto"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 2: Configure Upload Preset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Find and edit your upload preset:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Locate the preset named{" "}
              <code>
                {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
                  "your_upload_preset"}
              </code>
            </li>
            <li>Click on it to edit settings</li>
            <li>
              Scroll down to <strong>Access Control</strong> section
            </li>
            <li>
              In <strong>Allowed origins</strong>, add your Vercel domain:
            </li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm mb-4">
            {vercelUrl}
          </div>

          <p className="text-sm text-gray-600">
            You may also want to add your local development URL if testing
            locally:
          </p>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm">
            http://localhost:5173
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 3: Verify Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Ensure these environment variables are set in your Vercel project:
          </p>

          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm space-y-2">
            <div>
              VITE_CLOUDINARY_CLOUD_NAME=
              {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name"}
            </div>
            <div>
              VITE_CLOUDINARY_UPLOAD_PRESET=
              {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
                "your_upload_preset"}
            </div>
          </div>

          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-700">Note</AlertTitle>
            <AlertDescription className="text-green-600">
              After updating CORS settings, it may take a few minutes for
              changes to propagate through Cloudinary's CDN.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          Need more help? Check Cloudinary's documentation:
        </p>
        <a
          href="https://cloudinary.com/documentation/upload_presets"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          Cloudinary Upload Presets <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

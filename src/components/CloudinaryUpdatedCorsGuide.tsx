import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Info, CheckCircle, ArrowRight } from "lucide-react";

export default function CloudinaryUpdatedCorsGuide() {
  const vercelUrl =
    "https://border-post-v1-87uavxskx-mark-helms-projects.vercel.app";

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-6">
        Updated Cloudinary CORS Configuration Guide
      </h1>

      <Alert className="mb-6 border-blue-500 bg-blue-50">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle className="text-blue-700">Important Update</AlertTitle>
        <AlertDescription className="text-blue-600">
          Cloudinary's UI has been updated. The "Allowed origins" setting might
          be hidden by default or located in a different section.
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 1: Access Upload Presets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You're already at the correct URL:{" "}
            <code>
              https://console.cloudinary.com/app/c-89d57537b7249bab9df00ff50adb58/settings/upload/presets
            </code>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 2: Edit Your Upload Preset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Click on the name of your upload preset (not just the checkbox) to
            edit its settings.
          </p>
          <div className="rounded-md overflow-hidden border border-gray-200 p-4 bg-gray-50">
            <p className="font-medium">Look for your preset named:</p>
            <code className="block p-2 bg-gray-100 rounded mt-2">
              {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
                "your_upload_preset"}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 3: Find Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>In the preset editing view:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Look for an "Advanced" or "More Options" section (you might need
              to scroll down)
            </li>
            <li>Check for a "CORS" section or tab</li>
            <li>
              If you don't see it immediately, look for a toggle or dropdown
              that might expand additional settings
            </li>
            <li>
              In some accounts, you may need to click on "Show Advanced Options"
              or a similar button
            </li>
          </ol>

          <Alert className="border-yellow-500 bg-yellow-50 mt-4">
            <Info className="h-5 w-5 text-yellow-500" />
            <AlertTitle className="text-yellow-700">UI Variations</AlertTitle>
            <AlertDescription className="text-yellow-600">
              Cloudinary's interface may vary based on your account type and
              recent UI updates. The "Allowed origins" field might be labeled
              differently, such as "CORS allowed origins" or simply "Origins".
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 4: Alternative Approach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>If you cannot find the CORS settings in the preset:</p>

          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to the main Settings page (gear icon)</li>
            <li>Look for "Security" or "CORS" in the left sidebar</li>
            <li>Check if there's a global CORS configuration option</li>
            <li>
              You may need to add your domain at the account level rather than
              the preset level
            </li>
          </ol>

          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm mb-4">
            {vercelUrl}
          </div>

          <p className="text-sm text-gray-600">
            You should also add your local development URL:
          </p>
          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm">
            http://localhost:5173
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 5: Contact Cloudinary Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            If you still cannot find the CORS settings, Cloudinary may have
            changed their UI or your account type might have different options.
          </p>

          <div className="flex items-center p-4 bg-gray-50 rounded-md border border-gray-200">
            <ArrowRight className="h-5 w-5 text-blue-500 mr-2" />
            <a
              href="https://support.cloudinary.com/hc/en-us/requests/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Contact Cloudinary Support
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          For more information, check Cloudinary's documentation:
        </p>
        <a
          href="https://cloudinary.com/documentation/upload_presets#cors_settings"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          Cloudinary CORS Documentation{" "}
          <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

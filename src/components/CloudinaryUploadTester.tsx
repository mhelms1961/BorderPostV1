import React, { useState } from "react";
import CloudinaryUploadHelper from "./CloudinaryUploadHelper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CloudinaryUploadTester() {
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [uploadedPublicId, setUploadedPublicId] = useState<string>("");
  const [error, setError] = useState<string>("");

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Upload Tester</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Environment Variables:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>
            <strong>VITE_CLOUDINARY_CLOUD_NAME:</strong>{" "}
            {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "Not set"}
          </p>
          <p>
            <strong>VITE_CLOUDINARY_UPLOAD_PRESET:</strong>{" "}
            {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "Not set"}
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Video to Cloudinary</CardTitle>
        </CardHeader>
        <CardContent>
          <CloudinaryUploadHelper
            onUploadSuccess={(url, publicId) => {
              setUploadedUrl(url);
              setUploadedPublicId(publicId);
              setError("");
            }}
            onUploadError={(errorMsg) => {
              setError(errorMsg);
              setUploadedUrl("");
              setUploadedPublicId("");
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadedUrl && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>
            <strong>Upload successful!</strong>
          </p>
          <p>
            <strong>Public ID:</strong> {uploadedPublicId}
          </p>
          <p>
            <strong>URL:</strong> {uploadedUrl}
          </p>
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Uploaded Video:</h2>
          <div className="aspect-video bg-black rounded overflow-hidden">
            <video src={uploadedUrl} controls className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
}

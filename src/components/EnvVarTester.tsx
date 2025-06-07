import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EnvVarTester() {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Tester</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cloudinary Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                VITE_CLOUDINARY_CLOUD_NAME:
              </h2>
              <div className="bg-gray-100 p-3 rounded-md">
                {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "Not set"}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                VITE_CLOUDINARY_UPLOAD_PRESET:
              </h2>
              <div className="bg-gray-100 p-3 rounded-md">
                {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "Not set"}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                VITE_CLOUDINARY_API_KEY:
              </h2>
              <div className="bg-gray-100 p-3 rounded-md">
                {import.meta.env.VITE_CLOUDINARY_API_KEY
                  ? "Set (value hidden)"
                  : "Not set"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

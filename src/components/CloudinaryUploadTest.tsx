import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Upload, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Progress } from "./ui/progress";

const CloudinaryUploadTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<
    {
      preset: string;
      status: string;
      url?: string;
      error?: string;
      publicId?: string;
      timestamp?: string;
    }[]
  >([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`,
    ]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      addLog(
        `File selected: ${e.target.files[0].name} (${(e.target.files[0].size / (1024 * 1024)).toFixed(2)} MB)`,
      );
    }
  };

  const testUpload = async (preset: string) => {
    if (!file) {
      addLog("❌ No file selected");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      addLog("❌ Missing VITE_CLOUDINARY_CLOUD_NAME environment variable");
      return;
    }

    // Add unique identifier to filename to distinguish between uploads
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uniqueFilename = `${preset}_${timestamp}_${file.name}`;

    addLog(
      `🚀 Testing upload with preset: ${preset} (Unique filename: ${uniqueFilename})`,
    );
    setUploadStatus("uploading");
    setUploadProgress(0);
    setActivePreset(preset);

    const formData = new FormData();

    // Create a new File object with the unique name
    const uniqueFile = new File([file], uniqueFilename, { type: file.type });
    formData.append("file", uniqueFile);
    formData.append("upload_preset", preset);
    formData.append("resource_type", "video");
    formData.append("folder", "test_uploads");

    try {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        true,
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          if (progress % 20 === 0) {
            addLog(`📤 Upload progress (${preset}): ${progress}%`);
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          addLog(`✅ Upload successful with preset: ${preset}`);
          addLog(`📁 File stored at: ${response.secure_url}`);
          addLog(`📂 Folder: ${response.folder || "(root)"}`);
          addLog(`🆔 Public ID: ${response.public_id}`);

          setResults((prev) => [
            ...prev,
            {
              preset,
              status: "success",
              url: response.secure_url,
              publicId: response.public_id,
              timestamp: timestamp,
            },
          ]);
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const errorMsg =
              errorResponse.error?.message || `HTTP Error: ${xhr.status}`;
            addLog(`❌ Upload failed with preset ${preset}: ${errorMsg}`);
            setResults((prev) => [
              ...prev,
              {
                preset,
                status: "error",
                error: errorMsg,
                timestamp: timestamp,
              },
            ]);
          } catch (e) {
            addLog(
              `❌ Upload failed with preset ${preset}: HTTP status ${xhr.status}`,
            );
            setResults((prev) => [
              ...prev,
              {
                preset,
                status: "error",
                error: `HTTP status ${xhr.status}`,
                timestamp: timestamp,
              },
            ]);
          }
        }
        setUploadStatus("idle");
        setActivePreset(null);
      };

      xhr.onerror = () => {
        addLog(`❌ Network error during upload with preset ${preset}`);
        setResults((prev) => [
          ...prev,
          {
            preset,
            status: "error",
            error: "Network error",
            timestamp: timestamp,
          },
        ]);
        setUploadStatus("idle");
        setActivePreset(null);
      };

      xhr.send(formData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(
        `❌ Exception during upload with preset ${preset}: ${errorMessage}`,
      );
      setResults((prev) => [
        ...prev,
        {
          preset,
          status: "error",
          error: errorMessage,
          timestamp: timestamp,
        },
      ]);
      setUploadStatus("idle");
      setActivePreset(null);
    }
  };

  const testAllPresets = () => {
    setResults([]);
    setLogs([]);
    addLog("🧪 Starting upload tests for all presets");
    testUpload("video_borders");
    setTimeout(() => testUpload("ml_default"), 500); // Slight delay between tests
  };

  const clearLogs = () => {
    setLogs([]);
    setResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Cloudinary Upload Preset Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" /> Select Video File
          </Button>
          <input
            id="fileInput"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-sm">
            {file
              ? `Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
              : "No file selected"}
          </span>
        </div>

        {uploadStatus === "uploading" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Uploading with preset: {activePreset}...
              </span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              onClick={testAllPresets}
              disabled={!file || uploadStatus === "uploading"}
            >
              Test Both Presets
            </Button>
            <Button
              onClick={() => testUpload("video_borders")}
              disabled={!file || uploadStatus === "uploading"}
              variant="outline"
            >
              Test video_borders Only
            </Button>
            <Button
              onClick={() => testUpload("ml_default")}
              disabled={!file || uploadStatus === "uploading"}
              variant="outline"
            >
              Test ml_default Only
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              <Trash2 className="h-4 w-4 mr-2" /> Clear Results
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-medium">Test Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className={
                      result.status === "success"
                        ? "border-green-500"
                        : "border-red-500"
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        {result.status === "success" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="w-full">
                          <h4 className="font-medium text-lg">
                            {result.preset}
                          </h4>
                          <p className="text-sm mt-1">
                            {result.status === "success"
                              ? "Upload successful"
                              : `Error: ${result.error}`}
                          </p>
                          {result.publicId && (
                            <p className="text-xs text-gray-500 mt-1 break-all">
                              Public ID: {result.publicId}
                            </p>
                          )}
                          {result.url && (
                            <div className="mt-3">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline block"
                              >
                                View uploaded file
                              </a>
                              <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                                <p className="font-medium">
                                  How to identify this file:
                                </p>
                                <p>
                                  Filename starts with:{" "}
                                  <span className="font-mono">
                                    {result.preset}_
                                    {result.timestamp?.substring(0, 10)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Upload Logs</h3>
            <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-xs">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="pb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  No logs yet. Select a file and test the upload presets.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-gray-600">
        <p className="mb-2 font-medium">How to identify which preset worked:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Each upload is tagged with the preset name at the beginning of the
            filename
          </li>
          <li>
            Look in your{" "}
            <a
              href="https://console.cloudinary.com/console/media_library/folders/test_uploads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              test_uploads folder
            </a>{" "}
            in your Media Library
          </li>
          <li>
            Files starting with{" "}
            <span className="font-mono">video_borders_</span> were uploaded with
            the video_borders preset
          </li>
          <li>
            Files starting with <span className="font-mono">ml_default_</span>{" "}
            were uploaded with the ml_default preset
          </li>
        </ul>
      </CardFooter>
    </Card>
  );
};

export default CloudinaryUploadTest;

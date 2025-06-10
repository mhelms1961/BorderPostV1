import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle, AlertTriangle } from "lucide-react";

export default function CloudinaryCorsTest() {
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [corsStatus, setCorsStatus] = useState<string>("");

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "video_borders";
  const vercelUrl = "https://border-post-v1.vercel.app";

  const runCorsTest = async () => {
    setTestStatus("testing");
    setErrorMessage("");
    setCorsStatus("Testing CORS configuration...");

    if (!cloudName) {
      setTestStatus("error");
      setErrorMessage("Cloudinary cloud name is not configured");
      return;
    }

    try {
      // First, test if we can make a simple OPTIONS request to Cloudinary
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

      // Create a small test file (1x1 pixel transparent GIF)
      const base64Data =
        "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const testFile = new File(byteArrays, "test.gif", { type: "image/gif" });

      // Create form data
      const formData = new FormData();
      formData.append("file", testFile);
      formData.append("upload_preset", uploadPreset);

      // Add a timestamp to prevent caching
      formData.append("timestamp", Date.now().toString());

      setCorsStatus("Sending test upload to Cloudinary...");

      // Try to upload the test file
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTestStatus("success");
        setCorsStatus(
          `CORS is configured correctly! Upload successful. Public ID: ${data.public_id}`,
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Upload failed with status ${response.status}: ${errorText}`,
        );
      }
    } catch (error) {
      setTestStatus("error");
      setErrorMessage(
        `CORS test failed: ${error instanceof Error ? error.message : String(error)}\n\n` +
          "This likely means your Cloudinary CORS settings need to be updated to allow uploads from this domain.",
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold mb-6">Cloudinary CORS Test</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              VITE_CLOUDINARY_CLOUD_NAME:
            </h2>
            <div className="bg-gray-100 p-3 rounded-md">
              {cloudName || "Not set"}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              VITE_CLOUDINARY_UPLOAD_PRESET:
            </h2>
            <div className="bg-gray-100 p-3 rounded-md">
              {uploadPreset || "Not set"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>CORS Configuration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="mb-4 border-blue-500 bg-blue-50">
            <Info className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-700">Important</AlertTitle>
            <AlertDescription className="text-blue-600">
              This test will attempt to upload a tiny test file to Cloudinary to
              verify if CORS is configured correctly for your domain.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-100 p-4 rounded-md font-mono text-sm mb-4">
            <p>
              <strong>Testing URL:</strong> {vercelUrl}
            </p>
          </div>

          <Button
            onClick={runCorsTest}
            disabled={testStatus === "testing"}
            className="w-full"
          >
            {testStatus === "testing" ? "Testing..." : "Run CORS Test"}
          </Button>

          {testStatus === "testing" && corsStatus && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <AlertTriangle className="h-5 w-5 inline mr-2" />
              {corsStatus}
            </div>
          )}

          {testStatus === "success" && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <AlertTitle className="text-green-700">Success!</AlertTitle>
              <AlertDescription className="text-green-600">
                {corsStatus}
              </AlertDescription>
            </Alert>
          )}

          {testStatus === "error" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded whitespace-pre-wrap">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Fix CORS Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Access Upload Presets:</strong> Go to your Cloudinary
              Dashboard &gt; Settings &gt; Upload &gt; Upload Presets
            </li>
            <li>
              <strong>Edit Your Preset:</strong> Click on the preset named{" "}
              <code>{uploadPreset}</code>
            </li>
            <li>
              <strong>Find CORS Settings:</strong> Look for "Access Control" or
              "Allowed origins" section (may be under Advanced settings)
            </li>
            <li>
              <strong>Add Your Domain:</strong> Add <code>{vercelUrl}</code> to
              the list of allowed origins
            </li>
            <li>
              <strong>Save Changes:</strong> Make sure to save your changes
            </li>
            <li>
              <strong>Wait for Propagation:</strong> Changes may take a few
              minutes to propagate through Cloudinary's CDN
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

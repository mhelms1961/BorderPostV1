import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, ArrowLeft } from "lucide-react";

export default function BorderAdditionStoryboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get video information from URL parameters
  const videoUrl = searchParams.get("videoUrl") || "";
  const publicId = searchParams.get("publicId") || "";
  const borderLayerId =
    searchParams.get("borderLayerId") || "Border_1080_20px_moefgp";
  const cloudName = "dyco49ptm";

  // Extract border info from the layer ID
  const borderInfo = borderLayerId.includes("_")
    ? borderLayerId.split("_")
    : [];
  const borderWidth =
    borderInfo.length > 2 ? parseInt(borderInfo[2].replace("px", "")) : 20;
  const borderColor = "white";
  const [isDownloading, setIsDownloading] = useState(false);

  // Generate Cloudinary URL with border transformation
  const getBorderedVideoUrl = () => {
    if (!videoUrl || !publicId) return "";

    // Parse the URL to ensure it has the border transformation
    if (videoUrl.includes("l_" + borderLayerId + ",fl_splice,fl_layer_apply")) {
      return videoUrl;
    }

    // Add the border transformation if it's not already present
    const parts = videoUrl.split("/upload/");
    if (parts.length !== 2) return videoUrl; // Invalid URL format
  };

  const handleDownload = () => {
    try {
      setIsDownloading(true);

      // Get the bordered video URL with proper Cloudinary transformations
      const borderedUrl = getBorderedVideoUrl();

      if (!borderedUrl) {
        alert("Cannot generate download URL. Missing video information.");
        setIsDownloading(false);
        return;
      }

      // Create a loading indicator
      const loadingDiv = document.createElement("div");
      loadingDiv.style.position = "fixed";
      loadingDiv.style.top = "50%";
      loadingDiv.style.left = "50%";
      loadingDiv.style.transform = "translate(-50%, -50%)";
      loadingDiv.style.padding = "20px";
      loadingDiv.style.background = "rgba(0,0,0,0.7)";
      loadingDiv.style.color = "white";
      loadingDiv.style.borderRadius = "8px";
      loadingDiv.style.zIndex = "9999";
      loadingDiv.textContent = "Preparing download...";
      document.body.appendChild(loadingDiv);

      // Generate a filename for the download
      const filename = `video_with_${borderWidth}px_${borderColor}_border.mp4`;

      console.log("Downloading with URL:", borderedUrl);

      // Create a download link for the URL
      const a = document.createElement("a");
      a.href = borderedUrl;
      a.download = filename; // Set the filename
      a.target = "_blank"; // Open in new tab
      document.body.appendChild(a);

      // Trigger the download
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);

      // Update loading message
      loadingDiv.textContent = "Download started...";

      // Clean up the loading indicator after a delay
      setTimeout(() => {
        if (document.body.contains(loadingDiv)) {
          document.body.removeChild(loadingDiv);
        }
        setIsDownloading(false);
      }, 3000);

      // Provide a fallback method if the download doesn't start
      setTimeout(() => {
        alert(
          "If the download didn't start, click OK to try again in a new tab.",
        );
        window.open(borderedUrl, "_blank");
      }, 5000);

      // If the window was blocked by a popup blocker
      if (
        !downloadWindow ||
        downloadWindow.closed ||
        typeof downloadWindow.closed === "undefined"
      ) {
        console.warn("Popup blocked, trying alternative download method");

        // Create a hidden iframe for download as fallback
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = borderedUrl;
        document.body.appendChild(iframe);

        // Clean up iframe after a delay
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);

        // Also provide a direct link for the user
        alert(
          "Download started. If it doesn't work, please click OK to open the download in a new tab.",
        );
        window.open(borderedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error during download:", error);

      // Remove loading indicator if it exists
      const loadingDiv = document.querySelector(
        'div[style*="position: fixed"]',
      );
      if (loadingDiv && loadingDiv.parentNode) {
        loadingDiv.parentNode.removeChild(loadingDiv);
      }

      alert(
        `Error initiating download: ${error instanceof Error ? error.message : String(error)}. Please try opening the URL directly in your browser.`,
      );
      setIsDownloading(false);
    }
  };

  const handleGoBack = () => {
    // Extract the original video URL from the subclip URL to pass back to the editor
    const originalVideoUrl =
      videoUrl.split("/upload/")[0] +
      "/upload/" +
      publicId.split("/")[0] +
      ".mp4";
    const originalPublicId = publicId.split("/")[0];

    // Navigate back to VideoEditorStoryboard with the original video information
    navigate(
      `/tempobook/dynamic/src/components/VideoEditorStoryboard?storyboard=true&type=COMPONENT&framework=VITE&videoUrl=${encodeURIComponent(originalVideoUrl)}&publicId=${encodeURIComponent(originalPublicId)}&borderLayerId=${encodeURIComponent(borderLayerId)}`,
    );
  };

  // If no video URL is provided, show an error message
  if (!videoUrl || !publicId) {
    return (
      <div className="bg-white p-4 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">No video information provided.</p>
            <Button onClick={handleGoBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Border to Video</CardTitle>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div>
              <h3 className="text-lg font-medium mb-2">Preview</h3>
              <div
                className="rounded-lg overflow-hidden relative"
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  position: "relative",
                  backgroundColor: "transparent",
                }}
              >
                {/* Video container with border overlay */}
                <div
                  className="relative mx-auto"
                  style={{
                    width: "100%",
                    maxWidth: "1920px",
                    aspectRatio: "16/9",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Video element */}
                  <video
                    src={getBorderedVideoUrl()}
                    className="w-full h-full"
                    style={{
                      objectFit: "contain",
                      display: "block",
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                    controls
                    preload="auto"
                    crossOrigin="anonymous"
                  />

                  {/* Inset border - positioned inside the video */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      boxShadow: `inset 0 0 0 ${borderWidth}px ${borderColor}`,
                      zIndex: 10,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Border Controls */}
            <div>
              <h3 className="text-lg font-medium mb-4">Border Settings</h3>

              <div className="space-y-6">
                {/* Fixed Border Information */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Border: {borderWidth}px white</Label>
                  </div>
                  <div className="h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                    Using border layer: {borderLayerId}
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  className="w-full mt-6"
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading
                    ? "Downloading..."
                    : "Download Video with Border"}
                </Button>

                <p className="text-sm text-gray-500 mt-2">
                  This will download the video with a {borderWidth}px white
                  border.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CloudinaryUploadHelper from "@/components/CloudinaryUploadHelper";
import CloudinaryVideoEditor from "@/components/CloudinaryVideoEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Square, Home, SquareAsterisk } from "lucide-react";

export default function VideoEditorStoryboard() {
  const [searchParams] = useSearchParams();
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string | null>(
    null,
  );
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [hasBorder, setHasBorder] = useState<boolean>(false);
  const [selectedBorderLayerId, setSelectedBorderLayerId] = useState<string>(
    "Border_1080_20px_moefgp",
  );
  const navigate = useNavigate();

  // Check for URL parameters when component mounts (for navigation back from border page)
  useEffect(() => {
    const urlVideoUrl = searchParams.get("videoUrl");
    const urlPublicId = searchParams.get("publicId");
    const urlBorderLayerId = searchParams.get("borderLayerId");

    if (urlVideoUrl && urlPublicId) {
      console.log("Restoring video from URL params:", {
        urlVideoUrl,
        urlPublicId,
        urlBorderLayerId,
      });
      setVideoUrl(urlVideoUrl);
      setCloudinaryPublicId(urlPublicId);
      if (urlBorderLayerId) {
        setSelectedBorderLayerId(urlBorderLayerId);
      }
      setShowEditor(true);
    }
  }, [searchParams]);

  // Use verified Cloudinary cloud name
  const cloudName = "dyco49ptm";
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || "";

  // Update showEditor state when videoUrl changes
  useEffect(() => {
    if (videoUrl) {
      setShowEditor(true);
    }
  }, [videoUrl]);

  // If no video is uploaded yet, use a sample video
  const baseDisplayUrl =
    videoUrl ||
    "https://res.cloudinary.com/dyco49ptm/video/upload/samples/elephants.mp4";
  const displayPublicId = cloudinaryPublicId || "samples/elephants";

  // Log the transformed URL to verify it's correct
  console.log("Transformed video URL with border overlay:", baseDisplayUrl);

  // Toggle border function
  const toggleBorder = () => {
    setHasBorder(!hasBorder);
  };

  // Handle navigation to border addition storyboard with subclip parameters
  const handleAddBorder = (subclipUrl: string, subclipPublicId: string) => {
    if (subclipUrl && subclipPublicId) {
      // Navigate to border addition storyboard with subclip info as URL parameters
      navigate(
        `/border?videoUrl=${encodeURIComponent(subclipUrl)}&publicId=${encodeURIComponent(subclipPublicId)}&borderLayerId=${encodeURIComponent(selectedBorderLayerId)}`,
      );
    } else {
      alert("Please create a valid subclip first");
    }
  };

  return (
    <div
      className="bg-black p-4 max-w-6xl mx-auto w-full h-full overflow-y-auto"
      style={{ minHeight: "100vh" }}
    >
      <div className="mb-4">
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="flex items-center gap-2 bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>
      {!showEditor ? (
        <Card className="mb-6 bg-gray-900 border-gray-700 text-white">
          <CardHeader>
            <CardTitle className="text-white">Upload Video</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <CloudinaryUploadHelper
              onUploadSuccess={(url, publicId) => {
                console.log("Upload success, original URL:", url);
                setVideoUrl(url);
                setCloudinaryPublicId(publicId);
              }}
              onUploadError={(error) => {
                console.error("Upload error:", error);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-900 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Video Editor</CardTitle>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedBorderLayerId}
                  onValueChange={setSelectedBorderLayerId}
                >
                  <SelectTrigger className="w-[180px] bg-gray-800 text-white border-gray-600">
                    <SelectValue placeholder="Select border" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    <SelectItem value="Border_1080_10px_ert7sl">
                      1080p - 10px
                    </SelectItem>
                    <SelectItem value="Border_1080_20px_moefgp">
                      1080p - 20px
                    </SelectItem>
                    <SelectItem value="Border_1080_40px_szde6u">
                      1080p - 40px
                    </SelectItem>
                    <SelectItem value="Border_4K_10px_wnw98u">
                      4K - 10px
                    </SelectItem>
                    <SelectItem value="Border_4K_20px_hwfmti">
                      4K - 20px
                    </SelectItem>
                    <SelectItem value="Border_4K_40px_k66aor">
                      4K - 40px
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                Upload a different video
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <CloudinaryVideoEditor
              videoUrl={baseDisplayUrl}
              publicId={displayPublicId}
              cloudName={cloudName}
              apiKey={apiKey}
              onAddBorder={handleAddBorder}
              cloudinaryPublicId={cloudinaryPublicId}
              borderLayerId={selectedBorderLayerId}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

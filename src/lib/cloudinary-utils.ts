/**
 * Utility functions for working with Cloudinary URLs and transformations
 */

/**
 * Converts a Cloudinary video URL to use MP4 format for better browser compatibility
 * This is especially useful for .mov files that may not play properly in all browsers
 * @param url The original Cloudinary video URL
 * @returns URL with MP4 format conversion applied
 */
export function ensureMP4Compatibility(url: string): string {
  if (!url.includes("cloudinary.com")) {
    return url; // Not a Cloudinary URL, return as-is
  }

  // Check if format conversion is already applied
  if (url.includes("f_mp4") || url.includes("f_auto")) {
    return url; // Already has format conversion
  }

  const parts = url.split("/upload/");
  if (parts.length !== 2) {
    return url; // Invalid URL format
  }

  // Add MP4 format conversion
  return `${parts[0]}/upload/f_mp4/${parts[1]}`;
}

/**
 * Checks if a video URL is likely to have codec compatibility issues
 * @param url The video URL to check
 * @returns Object with compatibility info
 */
export function checkVideoCompatibility(url: string): {
  isMovFile: boolean;
  needsConversion: boolean;
  recommendedUrl: string;
  compatibilityNotes: string[];
} {
  const isMovFile = url.toLowerCase().includes(".mov");
  const notes: string[] = [];

  if (isMovFile) {
    notes.push(
      ".mov files may have codec compatibility issues in some browsers",
    );
    notes.push("Consider using MP4 format for better compatibility");
  }

  const needsConversion =
    isMovFile && url.includes("cloudinary.com") && !url.includes("f_mp4");
  const recommendedUrl = needsConversion ? ensureMP4Compatibility(url) : url;

  if (needsConversion) {
    notes.push("Cloudinary format conversion to MP4 recommended");
  }

  return {
    isMovFile,
    needsConversion,
    recommendedUrl,
    compatibilityNotes: notes,
  };
}

/**
 * Generates a Cloudinary URL with transformations using comma-separated format
 * @param cloudName The Cloudinary cloud name
 * @param publicId The public ID of the video
 * @param options Options for transformations
 * @returns A URL string with transformations applied in the specified order
 */
export function generateSimpleCloudinaryUrl(
  cloudName: string,
  publicId: string,
  options: {
    startTime?: number;
    endTime?: number;
    borderLayerId?: string;
    download?: boolean;
  } = {},
): string {
  // Clean the publicId to remove any file extensions
  const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

  // Create transformations array in the correct order
  const transformations = [];

  // 1. Add border FIRST if provided - using l_image: prefix
  if (options.borderLayerId) {
    // Ensure the border ID has the "Border_" prefix
    const borderLayerId = options.borderLayerId.startsWith("Border_")
      ? options.borderLayerId
      : `Border_${options.borderLayerId}`;

    transformations.push(`l_image:${borderLayerId}`);
    transformations.push("fl_relative");
    transformations.push("w_1.0");
    transformations.push("fl_layer_apply");
  }

  // 2. Add trim parameters AFTER border
  if (
    options.startTime !== undefined &&
    options.endTime !== undefined &&
    options.startTime < options.endTime
  ) {
    transformations.push(`so_${options.startTime.toFixed(2)}`);
    transformations.push(`eo_${options.endTime.toFixed(2)}`);
  }

  // 3. Add format and codec transformations
  transformations.push("f_mp4");
  transformations.push("vc_h264");

  // 4. Add attachment flag for download if requested
  if (options.download) {
    transformations.push("fl_attachment");
  }

  // Construct the final URL with comma-separated transformations
  const transformationString = transformations.join(",");
  const url = `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}/${cleanPublicId}.mp4`;

  console.log("Generated URL:", url);
  return url;
}

/**
 * Initiates a download of a Cloudinary video using various methods
 * @param url The URL to download
 * @param filename The filename to save as
 * @param method The download method to use
 */
export async function downloadCloudinaryVideoWithMethod(
  url: string,
  filename: string,
  method: "iframe" | "form" | "direct" | "fetch" = "iframe",
): Promise<void> {
  console.log(`Downloading video using ${method} method:`, url);

  switch (method) {
    case "iframe":
      // Create an iframe to handle the download without redirecting the main page
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      // Set a timeout to remove the iframe
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
      break;

    case "form":
      // Create a form to download the file
      const form = document.createElement("form");
      form.method = "GET";
      form.action = url;
      form.target = "_blank";
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      break;

    case "direct":
      // Open in a new tab
      window.open(url, "_blank");
      break;

    case "fetch":
      try {
        // Create and show loading indicator
        const loadingId = "cloudinary-download-" + Date.now();
        const loadingDiv = document.createElement("div");
        loadingDiv.id = loadingId;
        loadingDiv.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 20px;
          background: rgba(0,0,0,0.9);
          color: white;
          border-radius: 8px;
          z-index: 9999;
          font-size: 16px;
          text-align: center;
          min-width: 300px;
        `;
        loadingDiv.innerHTML = `
          <div>🔄 Starting download...</div>
          <div style="margin-top: 10px; font-size: 12px;">Preparing video...</div>
        `;
        document.body.appendChild(loadingDiv);

        // Helper function to safely remove loading indicator
        const removeLoadingIndicator = () => {
          const indicator = document.getElementById(loadingId);
          if (indicator && document.body.contains(indicator)) {
            document.body.removeChild(indicator);
          }
        };

        // Fetch the video
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the blob
        const blob = await response.blob();

        // Create a URL for the blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a link to download the blob
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);

        // Show success message
        loadingDiv.innerHTML = `
          <div style="color: #4ade80;">✅ Download complete!</div>
          <div style="margin-top: 10px; font-size: 12px;">Check your downloads folder</div>
        `;

        // Remove loading indicator after a delay
        setTimeout(() => removeLoadingIndicator(), 2000);
      } catch (error) {
        console.error("Fetch download error:", error);
        throw error;
      }
      break;
  }
}

/**
 * Generates a transformation string for Cloudinary explicit API
 * @param options Options for transformations
 * @returns A transformation string for the explicit API
 */
export function generateExplicitTransformation(options: {
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
}): string {
  const transformations = [];

  // SIMPLIFIED VERSION: Only include trimming transformations

  // 1. Add trim parameters FIRST and ONLY (removing border overlay for testing)
  if (
    options.startTime !== undefined &&
    options.endTime !== undefined &&
    options.startTime < options.endTime
  ) {
    transformations.push(`so_${options.startTime.toFixed(2)}`);
    transformations.push(`eo_${options.endTime.toFixed(2)}`);
  }

  // 2. Always add format transformation for compatibility
  transformations.push("f_mp4");

  // 3. Add attachment flag for download
  transformations.push("fl_attachment");

  return transformations.join(",");
}

/**
 * Calls Cloudinary's explicit API to create a preprocessed video with transformations
 * @param cloudName The Cloudinary cloud name
 * @param apiKey The Cloudinary API key
 * @param apiSecret The Cloudinary API secret
 * @param publicId The public ID of the video
 * @param options Options for transformations
 * @returns Promise with the processed video URL
 */
export async function createProcessedVideo(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicId: string,
  options: {
    startTime?: number;
    endTime?: number;
    borderLayerId?: string;
  },
): Promise<string> {
  // Create and show loading indicator
  const loadingId = "cloudinary-processing-" + Date.now();
  const loadingDiv = document.createElement("div");
  loadingDiv.id = loadingId;
  loadingDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background: rgba(0,0,0,0.9);
    color: white;
    border-radius: 8px;
    z-index: 9999;
    font-size: 16px;
    text-align: center;
    min-width: 300px;
  `;
  loadingDiv.innerHTML = `
    <div>🔄 Processing video...</div>
    <div style="margin-top: 10px; font-size: 12px;">This may take a moment</div>
  `;
  document.body.appendChild(loadingDiv);

  // Helper function to safely remove loading indicator
  const removeLoadingIndicator = () => {
    const indicator = document.getElementById(loadingId);
    if (indicator && document.body.contains(indicator)) {
      document.body.removeChild(indicator);
    }
  };

  try {
    // Generate timestamp for API signature
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Clean the publicId to remove any file extensions
    const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

    // Generate transformation string
    const transformation = generateExplicitTransformation(options);

    // Create form data for the API request
    const formData = new FormData();
    formData.append("public_id", cleanPublicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("resource_type", "video");

    // Add eager transformation
    formData.append("eager", transformation);
    formData.append("type", "upload");
    formData.append("eager_async", "false"); // Process synchronously for immediate download

    // Generate signature
    // Note: In a production environment, this should be done server-side
    // This is a simplified version for demonstration purposes
    const signatureString = `eager=${transformation}&eager_async=false&public_id=${cleanPublicId}&resource_type=video&timestamp=${timestamp}&type=upload${apiSecret}`;
    const signature = await generateSHA1(signatureString);
    formData.append("signature", signature);

    // Update loading message
    loadingDiv.innerHTML = `
      <div>🔄 Sending request to Cloudinary...</div>
      <div style="margin-top: 10px; font-size: 12px;">Processing video with transformations</div>
    `;

    // Make the API request
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/explicit`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Cloudinary explicit API response:", data);

    // Check if eager transformation was successful
    if (!data.eager || data.eager.length === 0) {
      throw new Error("No eager transformation result returned");
    }

    // Get the secure URL from the eager transformation result
    const processedUrl = data.eager[0].secure_url;

    // Update loading message with success
    loadingDiv.innerHTML = `
      <div style="color: #4ade80;">✅ Video processed successfully!</div>
      <div style="margin-top: 10px; font-size: 12px;">Preparing download...</div>
    `;

    // Remove loading indicator after a delay
    setTimeout(() => removeLoadingIndicator(), 2000);

    // Return the processed video URL
    return processedUrl;
  } catch (error) {
    console.error("Error creating processed video:", error);

    // Update loading message with error
    loadingDiv.innerHTML = `
      <div style="color: #f87171;">❌ Video processing failed</div>
      <div style="margin-top: 10px; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</div>
    `;

    // Remove loading indicator after a delay
    setTimeout(() => removeLoadingIndicator(), 5000);

    throw error;
  }
}

/**
 * Creates a direct download URL for a trimmed video with optional border overlay
 * @param cloudName The Cloudinary cloud name
 * @param publicId The public ID of the video
 * @param options Options for transformations
 * @returns A URL string for downloading the video
 */
export function createDirectDownloadUrl(
  cloudName: string,
  publicId: string,
  options: {
    startTime: number;
    endTime: number;
    borderLayerId?: string;
  },
): string {
  // Use the generateSimpleCloudinaryUrl function to create the URL
  return generateSimpleCloudinaryUrl(cloudName, publicId, {
    startTime: options.startTime,
    endTime: options.endTime,
    borderLayerId: options.borderLayerId,
    download: true, // Always include download flag
  });
}

/**
 * Generate SHA1 hash for Cloudinary API signature
 * @param message The message to hash
 * @returns SHA1 hash of the message
 */
async function generateSHA1(message: string): Promise<string> {
  // Use the Web Crypto API to generate the SHA-1 hash
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Downloads a processed video from Cloudinary
 * @param url The processed video URL
 * @param filename The filename to save as
 */
export async function downloadProcessedVideo(
  url: string,
  filename: string,
): Promise<void> {
  try {
    // Create and show loading indicator
    const loadingId = "cloudinary-download-" + Date.now();
    const loadingDiv = document.createElement("div");
    loadingDiv.id = loadingId;
    loadingDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px;
      background: rgba(0,0,0,0.9);
      color: white;
      border-radius: 8px;
      z-index: 9999;
      font-size: 16px;
      text-align: center;
      min-width: 300px;
    `;
    loadingDiv.innerHTML = `
      <div>🔄 Starting download...</div>
      <div style="margin-top: 10px; font-size: 12px;">Preparing video...</div>
    `;
    document.body.appendChild(loadingDiv);

    // Helper function to safely remove loading indicator
    const removeLoadingIndicator = () => {
      const indicator = document.getElementById(loadingId);
      if (indicator && document.body.contains(indicator)) {
        document.body.removeChild(indicator);
      }
    };

    // Add fl_attachment to the URL if it doesn't already have it
    const downloadUrl = url.includes("fl_attachment")
      ? url
      : `${url}?fl_attachment`;

    // Create a link element to trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also open in a new tab as a fallback
    setTimeout(() => {
      window.open(downloadUrl, "_blank");
    }, 500);

    // Show success message
    loadingDiv.innerHTML = `
      <div style="color: #4ade80;">✅ Download started!</div>
      <div style="margin-top: 10px; font-size: 12px;">Check your downloads folder</div>
    `;

    // Remove loading indicator after a delay
    setTimeout(() => removeLoadingIndicator(), 3000);
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
}

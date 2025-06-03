/**
 * Utility functions for downloading videos from Cloudinary
 */

/**
 * Adds fl_attachment flag to Cloudinary URL to force download
 * @param url The Cloudinary URL
 * @returns Modified URL with fl_attachment flag
 * @deprecated This function is no longer needed as we're using fetch API to download
 */
export function addAttachmentFlagToUrl(url: string): string {
  // This function is kept for backward compatibility but is no longer used
  // We're now using fetch API to download the file directly
  return url;
}

/**
 * Downloads a video from Cloudinary URL as a file
 * @param url The Cloudinary URL to download
 * @param filename The filename to save as
 * @returns Promise that resolves when download starts or rejects with error
 */
export async function downloadCloudinaryVideo(
  url: string,
  filename: string,
): Promise<void> {
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

  try {
    // Log the URL for debugging
    console.log("Attempting to download from URL:", url);

    // Use the URL as-is without any modifications
    let downloadUrl = url;

    // Update loading message
    loadingDiv.innerHTML = `
      <div>🔄 Fetching video...</div>
      <div style="margin-top: 10px; font-size: 12px;">This may take a moment</div>
    `;

    // Single download method: Direct link with download attribute
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    loadingDiv.innerHTML = `
      <div style="color: #4ade80;">✅ Download started!</div>
      <div style="margin-top: 10px; font-size: 12px;">Check your downloads folder</div>
    `;

    // Remove loading indicator after a delay
    setTimeout(() => removeLoadingIndicator(), 2000);
    return Promise.resolve();
  } catch (error) {
    // Handle errors
    console.error("Download failed:", error);
    loadingDiv.innerHTML = `
      <div style="color: #f87171;">❌ Download failed</div>
      <div style="margin-top: 10px; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</div>
    `;

    // Remove loading indicator after a delay
    setTimeout(() => removeLoadingIndicator(), 3000);
    throw error;
  }
}

/**
 * Creates a proxy URL that will handle the download without CORS issues
 * @param url The original Cloudinary URL
 * @param filename The filename to save as
 * @returns A URL that will trigger the download
 * @deprecated This function is no longer used as we're using direct download
 */
export function createProxyDownloadUrl(url: string, filename: string): string {
  // This function is kept for backward compatibility but is no longer used
  // We're now using direct download without a proxy
  console.warn(
    "createProxyDownloadUrl is deprecated - using direct download instead",
  );

  // Encode the URL and filename for safe transport in query parameters
  const encodedUrl = encodeURIComponent(url);
  const encodedFilename = encodeURIComponent(filename);

  // Use our local download helper page
  return `/download-helper.html?url=${encodedUrl}&filename=${encodedFilename}`;
}

/**
 * Shows instructions for manual download when automatic download fails
 * @param url The URL to download from
 * @param filename The suggested filename
 * @deprecated This function is no longer used as we've improved the direct download functionality
 */
export function showManualDownloadInstructions(
  url: string,
  filename: string,
): void {
  // This function is kept for backward compatibility but is no longer used
  console.log(
    "Manual download instructions are deprecated - using direct download instead",
  );

  // Instead of showing instructions, try to download directly
  try {
    downloadCloudinaryVideo(url, filename);
  } catch (error) {
    console.error("Even direct download retry failed:", error);
    alert("Download failed. Please try again later.");
  }
}

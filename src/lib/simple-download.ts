/**
 * Simple download utilities for Cloudinary videos
 * This file provides a simplified approach to downloading videos from Cloudinary
 */

/**
 * Creates a simple download URL for a Cloudinary video with trimming parameters and optional border
 * @param cloudName The Cloudinary cloud name
 * @param publicId The public ID of the video
 * @param startTime The start time in seconds
 * @param endTime The end time in seconds
 * @param borderLayerId Optional border layer ID to apply
 * @returns A URL string for downloading the trimmed video with optional border
 */
export function createSimpleDownloadUrl(
  cloudName: string,
  publicId: string,
  startTime: number,
  endTime: number,
  borderLayerId?: string,
): string {
  // Clean the publicId to remove any file extensions
  const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

  // Format the start and end times
  const startOffset = startTime.toFixed(2);
  const endOffset = endTime.toFixed(2);

  // Create transformation string
  let transformations = `so_${startOffset},eo_${endOffset}`;

  // Add border if provided
  if (borderLayerId) {
    transformations += `,l_${borderLayerId},fl_layer_apply`;
  }

  // Add attachment flag
  transformations += `,fl_attachment`;

  // Create the final URL with comma-separated transformations
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformations}/${cleanPublicId}.mp4`;
}

/**
 * Initiates a download of a Cloudinary video
 * @param url The URL to download
 * @param filename The filename to save as
 */
export function initiateSimpleDownload(url: string, filename: string): void {
  console.log("Initiating simple download with URL:", url);

  // Create a link element and trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a trimmed video from Cloudinary with optional border
 * @param cloudName The Cloudinary cloud name
 * @param publicId The public ID of the video
 * @param startTime The start time in seconds
 * @param endTime The end time in seconds
 * @param filename The filename to save as
 * @param borderLayerId Optional border layer ID to apply
 */
export function downloadTrimmedVideo(
  cloudName: string,
  publicId: string,
  startTime: number,
  endTime: number,
  filename: string,
  borderLayerId?: string,
): void {
  const url = createSimpleDownloadUrl(
    cloudName,
    publicId,
    startTime,
    endTime,
    borderLayerId,
  );
  console.log("Simple download URL with border:", url);
  initiateSimpleDownload(url, filename);
}

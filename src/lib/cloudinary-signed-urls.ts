/**
 * Utility for generating signed URLs for Cloudinary resources
 * This approach uses the Cloudinary API to generate properly signed URLs
 * that should bypass restrictions causing 400 errors
 */

import { SHA1 } from "crypto-js";

/**
 * Generate a signature for Cloudinary URL
 * @param paramsToSign Object containing parameters to sign
 * @param apiSecret Cloudinary API secret
 * @returns Signature string
 */
function generateSignature(
  paramsToSign: Record<string, any>,
  apiSecret: string,
): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .reduce((acc: Record<string, any>, key) => {
      acc[key] = paramsToSign[key];
      return acc;
    }, {});

  // Convert to query string format
  const stringToSign = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Generate SHA1 hash
  return SHA1(stringToSign + apiSecret).toString();
}

/**
 * Generate a signed URL for downloading a video with transformations
 * @param options Options for generating the URL
 * @returns Signed URL string
 */
export function generateSignedUrl(options: {
  cloudName: string;
  publicId: string;
  apiKey: string;
  apiSecret: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
  timestamp?: number;
  filename?: string;
}): string {
  const {
    cloudName,
    publicId,
    apiKey,
    apiSecret,
    startTime,
    endTime,
    borderLayerId,
    filename,
  } = options;

  // Clean the publicId to remove any file extensions
  const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

  // Create timestamp if not provided
  const timestamp = options.timestamp || Math.floor(Date.now() / 1000);

  // Build transformation string
  let transformation = "";

  // Add border FIRST if provided - IMPORTANT: Use l_image: prefix and do NOT use e_overlay
  // Border images are stored in the root, not in a folder
  // Use fl_relative and w_1.0 to ensure the border scales properly and all edges are visible
  if (borderLayerId) {
    transformation += `l_image:${borderLayerId},fl_relative,w_1.0,fl_layer_apply`;
  }

  // Add trim parameters AFTER border
  if (startTime !== undefined && endTime !== undefined && startTime < endTime) {
    if (transformation) {
      transformation += `,so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)}`;
    } else {
      transformation += `so_${startTime.toFixed(2)},eo_${endTime.toFixed(2)}`;
    }
  }

  // Add format and codec transformations for compatibility with QuickTime, VLC, etc.
  if (transformation) {
    transformation += ",f_mp4,vc_h264";
  } else {
    transformation = "f_mp4,vc_h264";
  }

  // Add attachment flag for download
  if (transformation) {
    transformation += ",fl_attachment";
  } else {
    transformation = "fl_attachment";
  }

  // Parameters to sign
  const paramsToSign: Record<string, any> = {
    public_id: cleanPublicId,
    timestamp,
  };

  // Add transformation to parameters if present
  if (transformation) {
    paramsToSign.transformation = transformation;
  }

  // Generate signature
  const signature = generateSignature(paramsToSign, apiSecret);

  // Build the final URL
  let url = `https://res.cloudinary.com/${cloudName}/video/upload`;

  // Add transformation if present
  if (transformation) {
    url += `/${transformation}`;
  }

  // Add signature and other parameters
  url += `/${cleanPublicId}.mp4?api_key=${apiKey}&timestamp=${timestamp}&signature=${signature}`;

  return url;
}

/**
 * Generate a download URL for a video with transformations
 * This is a simplified version that doesn't require API credentials
 * @param options Options for generating the URL
 * @returns URL string
 */
export function generateSimpleDownloadUrl(options: {
  cloudName: string;
  publicId: string;
  startTime?: number;
  endTime?: number;
  borderLayerId?: string;
}): string {
  const { cloudName, publicId, startTime, endTime, borderLayerId } = options;

  // Clean the publicId to remove any file extensions
  const cleanPublicId = publicId.replace(/\.(mp4|mov|avi|webm)$/i, "");

  // Build URL with transformations
  let url = `https://res.cloudinary.com/${cloudName}/video/upload`;

  // Build transformations array
  const transformations = [];

  // Add border FIRST if provided - Border images are stored in the root, not in a folder
  // Use fl_relative and w_1.0 to ensure the border scales properly and all edges are visible
  if (borderLayerId) {
    transformations.push(`l_image:${borderLayerId}`);
    transformations.push("fl_relative");
    transformations.push("w_1.0");
    transformations.push("fl_layer_apply");
  }

  // Add trim parameters AFTER border
  if (startTime !== undefined && endTime !== undefined && startTime < endTime) {
    transformations.push(`so_${startTime.toFixed(2)}`);
    transformations.push(`eo_${endTime.toFixed(2)}`);
  }

  // Add format and codec transformations for compatibility with QuickTime, VLC, etc.
  transformations.push("f_mp4");
  transformations.push("vc_h264");

  // Add attachment flag for download
  transformations.push("fl_attachment");

  // Add transformations to URL
  if (transformations.length > 0) {
    url += `/${transformations.join(",")}`;
  }

  // Add the public ID
  url += `/${cleanPublicId}.mp4`;

  return url;
}

/**
 * Initiate download of a video using the provided URL
 * @param url URL to download
 * @param filename Filename to save as
 */
export function initiateDownload(url: string, filename: string): void {
  // Create a link element to trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank"; // Open in new tab to avoid CORS issues
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Also open in a new tab as a fallback
  setTimeout(() => {
    window.open(url, "_blank");
  }, 500);
}

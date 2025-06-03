import { lazy, Suspense } from "react";

const DownloadTest = lazy(() => import("./download-test"));

export default function DownloadTestWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DownloadTest />
    </Suspense>
  );
}


import { Suspense } from "react";
import ConfirmationContent from "./confirmation-content";

// This is the main page component. It is a Server Component.
// Its only job is to set up the Suspense boundary.
export default function ConfirmationPage() {
  return (
    // The Suspense boundary tells Next.js to show a fallback UI while the
    // client-side component inside it is loading.
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-background">
        <p>உங்கள் உறுதிப்படுத்தல் ஏற்றப்படுகிறது...</p>
      </div>
    }>
      {/* ConfirmationContent is a Client Component that can safely use hooks. */}
      <ConfirmationContent />
    </Suspense>
  );
}

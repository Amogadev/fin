"use client"; // this makes sure it runs on the client only

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConfirmationInner() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Unknown";
  const amount = searchParams.get("amount") || "0";

  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <h1>🎉 Diwali Fund Confirmation</h1>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Amount:</strong> ₹{amount}</p>
      <p>✅ Payment successful!</p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading confirmation...</div>}>
      <ConfirmationInner />
    </Suspense>
  );
}

// ⛔ Disable static rendering — this page must render only on the client
export const dynamic = "force-dynamic";

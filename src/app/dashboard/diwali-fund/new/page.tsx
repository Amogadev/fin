"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function NewDiwaliFundInner() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name") || "Guest";
  const phone = searchParams.get("phone") || "N/A";

  return (
    <div style={{ padding: "24px" }}>
      <h1>✨ New Diwali Fund Entry</h1>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Phone:</strong> {phone}</p>
      <p>Fill out your contribution details below 🎁</p>
    </div>
  );
}

export default function NewDiwaliFundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewDiwaliFundInner />
    </Suspense>
  );
}

// 🚀 Important to stop static pre-rendering
export const dynamic = "force-dynamic";

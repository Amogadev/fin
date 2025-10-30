"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConfirmationInner() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name");
  const amount = searchParams.get("amount");

  return (
    <div style={{ padding: "20px", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>
      <div style={{ border: "1px solid hsl(var(--border))", padding: "40px", borderRadius: "var(--radius)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", marginBottom: "1rem" }}>🎉 Diwali Fund Confirmation</h1>
        <div style={{ fontSize: "1.125rem", display: "grid", gap: "1rem", textAlign: "left", width: "300px", margin: "0 auto" }}>
            <p><b>Name:</b> {name || "N/A"}</p>
            <p><b>Amount:</b> ₹{amount ? Number(amount).toLocaleString('en-IN') : "N/A"}</p>
            <p><b>Status:</b> Payment Successful!</p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
        <div style={{ padding: "20px", textAlign: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--background))", color: "hsl(var(--muted-foreground))" }}>
            Loading confirmation...
        </div>
    }>
      <ConfirmationInner />
    </Suspense>
  );
}

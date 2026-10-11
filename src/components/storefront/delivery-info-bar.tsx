import React from "react";

interface DeliveryInfoBarProps {
  message?: string | null;
}

export function DeliveryInfoBar({ message }: DeliveryInfoBarProps) {
  if (!message) return null;

  return (
    <div
      className="w-full py-2 px-4 text-center text-xs font-semibold"
      style={{
        backgroundColor: "var(--store-primary, #3b82f6)",
        color: "#ffffff",
      }}
    >
      {message}
    </div>
  );
}

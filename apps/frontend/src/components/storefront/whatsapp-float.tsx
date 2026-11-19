"use client";

import React from "react";
import { buildWhatsAppUrl } from "@/lib/utils";

interface WhatsAppFloatProps {
  phoneNumber: string;
  storeName: string;
}

export function WhatsAppFloat({ phoneNumber, storeName }: WhatsAppFloatProps) {
  const url = buildWhatsAppUrl(
    phoneNumber,
    `Hi ${storeName}! I found your store and would like to get in touch.`
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#22bf5b] shadow-2xl shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.4 5.82c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.188 8.188 0 0 1-1.26-4.36c.01-4.54 3.7-8.24 8.26-8.24zm-3.11 4.43c-.18 0-.46.07-.7.34-.24.27-.91.89-.91 2.16 0 1.28.93 2.52 1.06 2.69.13.17 1.82 2.78 4.41 3.79.61.27 1.09.42 1.46.54.61.2 1.17.17 1.61.1.49-.07 1.51-.62 1.72-1.22.21-.6.21-1.11.15-1.22-.06-.11-.23-.17-.48-.3-.25-.13-1.47-.73-1.7-.81-.23-.08-.39-.13-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23a7.45 7.45 0 0 1-1.38-1.72c-.15-.25-.02-.39.11-.51.12-.12.25-.31.38-.46.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43H8.94z" />
      </svg>
    </a>
  );
}

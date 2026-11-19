"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";

interface StoreUrlBannerProps {
  storeUrl: string;
  storeSlug: string;
  copied: boolean;
  onCopyLink: () => void;
}

export function StoreUrlBanner({
  storeUrl,
  storeSlug,
  copied,
  onCopyLink,
}: StoreUrlBannerProps) {
  return (
    <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#101A3D] via-[#172653] to-[#101A3D] border border-[#202D55] shadow-md text-[#F5F7FF]">
      <div className="space-y-1 min-w-0">
        <span className="text-xs font-bold text-[#638BFF] uppercase tracking-wider">
          Your Public Store URL
        </span>
        <p className="font-mono text-sm text-[#F5F7FF] font-semibold truncate">{storeUrl}</p>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopyLink}
          className="flex-1 sm:flex-initial sm:w-36 justify-center bg-[#172653] hover:bg-[#1C3066] text-[#F5F7FF] border-[#202D55] shadow-xs font-semibold text-xs py-2 sm:py-2 cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-1.5 text-[#22C55E] shrink-0" />
          ) : (
            <Copy className="w-4 h-4 mr-1.5 text-[#7181A8] shrink-0" />
          )}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </Button>

        <Link href={`/store/${storeSlug}`} target="_blank" className="flex-1 sm:flex-initial sm:w-36">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full justify-center bg-[#4169E1] hover:bg-[#3458C7] text-white border border-[#4169E1]/30 shadow-md shadow-[#4169E1]/20 font-semibold text-xs py-2 sm:py-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 mr-1.5 shrink-0" />
            <span>Visit Store</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}

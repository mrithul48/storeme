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
    <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 border border-blue-400/20 shadow-sm text-white">
      <div className="space-y-1 min-w-0">
        <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
          Your Public Store URL
        </span>
        <p className="font-mono text-sm text-white font-semibold truncate">{storeUrl}</p>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopyLink}
          className="flex-1 sm:flex-initial sm:w-auto justify-center bg-white/95 hover:bg-white text-slate-800 border-white/80 shadow-xs font-semibold text-xs py-2 sm:py-1.5"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 mr-1.5 text-slate-500 shrink-0" />
          )}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </Button>

        <Link href={`/store/${storeSlug}`} target="_blank" className="flex-1 sm:flex-initial sm:w-auto">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full justify-center bg-[#2563EB] hover:bg-blue-700 text-white border border-blue-400/30 shadow-sm shadow-blue-900/30 font-semibold text-xs py-2 sm:py-1.5"
          >
            <ExternalLink className="w-4 h-4 mr-1.5 shrink-0" />
            <span>Visit Store</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}

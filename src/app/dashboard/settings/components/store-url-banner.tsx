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
    <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600/80 to-indigo-600/40 border border-blue-100 shadow-sm">
      <div className="space-y-1">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Your Public Store URL
        </span>
        <p className="font-mono text-sm text-gray-900 font-semibold truncate">{storeUrl}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCopyLink}>
          {copied ? <Check className="w-4 h-4 mr-1 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1 text-slate-500" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>

        <Link href={`/store/${storeSlug}`} target="_blank">
          <Button type="button" variant="primary" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            Visit Store
          </Button>
        </Link>
      </div>
    </Card>
  );
}

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
    <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/20">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
          Your Public Store URL
        </span>
        <p className="font-mono text-sm text-slate-200 truncate">{storeUrl}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCopyLink}>
          {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
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

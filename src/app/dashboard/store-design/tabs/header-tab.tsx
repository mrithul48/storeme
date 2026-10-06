"use client";

import React from "react";
import { Tag, User } from "lucide-react";
import { Input } from "@/components/ui/card";
import { Section, Toggle } from "../_ui/primitives";

interface HeaderTabProps {
  headerDeliveryInfo: string;
  setHeaderDeliveryInfo: (v: string) => void;
  showAccountIcon: boolean;
  setShowAccountIcon: (v: boolean) => void;
}

export function HeaderTab({
  headerDeliveryInfo,
  setHeaderDeliveryInfo,
  showAccountIcon,
  setShowAccountIcon,
}: HeaderTabProps) {
  return (
    <div className="space-y-4">
      <Section title="Header Navigation & Actions" icon={User}>
        <div className="space-y-4 pt-2">
          <Toggle
            label="Show Account Icon in Header"
            description="Controls visibility of the customer profile/account icon (👤) and menu in your storefront navbar."
            checked={showAccountIcon}
            onChange={setShowAccountIcon}
          />
        </div>
      </Section>

      <Section title="Header Announcement Bar" icon={Tag}>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Delivery Information Bar</label>
            <Input
              value={headerDeliveryInfo}
              onChange={(e) => setHeaderDeliveryInfo(e.target.value)}
              placeholder="e.g. Free delivery on orders above ₹499"
              maxLength={200}
            />
            <p className="text-[11px] text-slate-500">Displayed in a thin announcement bar at the top of the header.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400">
            <strong className="text-white">Header Colors</strong> (background, text) are configured in{" "}
            <a href="/dashboard/settings" className="text-blue-400 underline">
              Store Settings → Theme & Styling
            </a>
            .
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-400">
            <strong className="text-white">Social Media Links</strong> are configured in{" "}
            <a href="/dashboard/settings" className="text-blue-400 underline">
              Store Settings → General & Brand → Social Links
            </a>
            .
          </div>
        </div>
      </Section>
    </div>
  );
}

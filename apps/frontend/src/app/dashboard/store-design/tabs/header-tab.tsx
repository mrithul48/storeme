"use client";

import React from "react";
import { User } from "lucide-react";
import { Section, Toggle } from "../_ui/primitives";

interface HeaderTabProps {
  showAccountIcon: boolean;
  setShowAccountIcon: (v: boolean) => void;
}

export function HeaderTab({
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
    </div>
  );
}

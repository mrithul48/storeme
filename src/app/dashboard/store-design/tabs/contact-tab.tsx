"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { Section, Toggle } from "../_ui/primitives";

interface ContactTabProps {
  contactEnabled: boolean;
  setContactEnabled: (v: boolean) => void;
}

export function ContactTab({ contactEnabled, setContactEnabled }: ContactTabProps) {
  return (
    <div className="space-y-4">
      <Section title="Contact Page" icon={MessageCircle}>
        <div className="space-y-4 pt-2">
          <Toggle
            label="Enable Contact Page"
            description="Show the /contact page on your storefront"
            checked={contactEnabled}
            onChange={setContactEnabled}
          />
          {contactEnabled && (
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-slate-400">
              The contact form uses your business email and phone from{" "}
              <a href="/dashboard/settings" className="text-blue-400 underline">
                Store Settings → Contact Details
              </a>
              . Enquiries are sent to your configured support email.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

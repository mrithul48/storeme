"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Section Accordion ────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <span className="flex items-center gap-2.5 font-bold text-[#0F172A]">
          <Icon className="w-4 h-4 text-[#2563EB]" />
          {title}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#64748B]" />
          : <ChevronDown className="w-4 h-4 text-[#64748B]" />
        }
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
          {children}
        </div>
      )}
    </Card>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        {description && <p className="text-xs text-[#64748B] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          checked ? "bg-[#2563EB]" : "bg-slate-200"
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )} />
      </button>
    </div>
  );
}

// ─── Shape Picker ─────────────────────────────────────────────────────────────

interface ShapePickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon: string }[];
}

export function ShapePicker({ label, value, onChange, options }: ShapePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#0F172A]">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-sm",
              value === opt.value
                ? "bg-blue-50 border-[#2563EB] text-[#2563EB]"
                : "bg-white border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#0F172A] hover:bg-slate-50"
            )}
          >
            <span className="text-base leading-none">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Radius Picker ────────────────────────────────────────────────────────────

export const CARD_RADIUS_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "SM", label: "Small" },
  { value: "MD", label: "Medium" },
  { value: "LG", label: "Large" },
];

export const ALL_RADIUS_OPTIONS = [
  ...CARD_RADIUS_OPTIONS,
  { value: "FULL", label: "Full" },
];

interface RadiusPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options?: typeof CARD_RADIUS_OPTIONS;
}

export function RadiusPicker({ label, value, onChange, options = ALL_RADIUS_OPTIONS }: RadiusPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#0F172A]">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm",
              value === opt.value
                ? "bg-blue-50 border-[#2563EB] text-[#2563EB]"
                : "bg-white border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#0F172A] hover:bg-slate-50"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Select helper (shared select styling) ────────────────────────────────────

export const selectClass =
  "w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-[#2563EB] shadow-sm";

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
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/40 transition-colors text-left"
      >
        <span className="flex items-center gap-2.5 font-bold text-white">
          <Icon className="w-4 h-4 text-blue-400" />
          {title}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400" />
          : <ChevronDown className="w-4 h-4 text-slate-400" />
        }
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-800/60">
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
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          checked ? "bg-blue-600" : "bg-slate-700"
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
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
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all",
              value === opt.value
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
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
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              value === opt.value
                ? "bg-blue-600/20 border-blue-500 text-blue-300"
                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
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
  "w-full h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50";

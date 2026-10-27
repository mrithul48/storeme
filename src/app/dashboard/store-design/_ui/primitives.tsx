"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Check, X, Search, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Section Accordion ────────────────────────────────────────────────────────

interface AccordionContextType {
  openSection: string | null;
  toggleSection: (id: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

export function AccordionGroup({
  children,
  defaultOpenId = null,
}: {
  children: React.ReactNode;
  defaultOpenId?: string | null;
}) {
  const [openSection, setOpenSection] = useState<string | null>(defaultOpenId);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <AccordionContext.Provider value={{ openSection, toggleSection }}>
      {children}
    </AccordionContext.Provider>
  );
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
}

export function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  id,
}: SectionProps) {
  const accordion = React.useContext(AccordionContext);
  const sectionId = id || title;

  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const isOpen = accordion ? accordion.openSection === sectionId : localOpen;

  const handleToggle = () => {
    if (accordion) {
      accordion.toggleSection(sectionId);
    } else {
      setLocalOpen((o) => !o);
    }
  };

  return (
    <div className="sm:rounded-2xl sm:border sm:border-slate-200/90 sm:bg-white sm:shadow-sm bg-transparent border-0 shadow-none rounded-none overflow-visible">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-0 py-3 sm:px-6 sm:py-4 hover:bg-slate-50/50 transition-colors text-left border-b border-slate-100 sm:border-0 cursor-pointer"
      >
        <span className="flex items-center gap-2.5 font-bold text-sm sm:text-base text-[#0F172A]">
          <Icon className="w-4 h-4 text-[#2563EB]" />
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#64748B]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#64748B]" />
        )}
      </button>
      {isOpen && (
        <div className="px-0 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-2 border-0 sm:border-t sm:border-slate-100">
          {children}
        </div>
      )}
    </div>
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
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-sm font-semibold text-[#0F172A]">{label}</p>
        {description && <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          checked ? "bg-[#2563EB]" : "bg-slate-300"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
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

// ─── Custom Select / Dropdown ────────────────────────────────────────────────

export interface DropdownOption {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  placeholder?: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (val: string | null) => void;
  icon?: React.ElementType;
  emptyText?: string;
}

export function CustomDropdown({
  placeholder = "Select option",
  options,
  value,
  onChange,
  icon: Icon = Tag,
  emptyText = "No items available",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selected = options.find((o) => o.id === value);
  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full h-11 px-3.5 rounded-xl border bg-white flex items-center justify-between text-left transition-all cursor-pointer shadow-xs",
          isOpen
            ? "border-[#2563EB] ring-2 ring-blue-600/15 shadow-sm"
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div
            className={cn(
              "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              selected ? "bg-blue-50 text-[#2563EB]" : "bg-slate-100 text-slate-400"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span
            className={cn(
              "text-xs sm:text-sm font-medium truncate",
              selected ? "text-[#0F172A]" : "text-slate-400"
            )}
          >
            {selected ? selected.name : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180 text-[#2563EB]"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#2563EB] text-[#0F172A]"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 font-medium">
                {emptyText}
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer",
                      isSelected
                        ? "bg-blue-50 text-[#2563EB] font-semibold"
                        : "text-[#0F172A] hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Icon
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          isSelected ? "text-[#2563EB]" : "text-slate-400"
                        )}
                      />
                      <span className="truncate">{opt.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

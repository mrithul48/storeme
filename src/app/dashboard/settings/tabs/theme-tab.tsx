"use client";

import React from "react";
import { Card, Input } from "@/components/ui/card";
import { Type, Eye, AlertCircle } from "lucide-react";
import { getContrastRatio } from "@/lib/store-theme";
import { colorPresets, supportedFonts } from "../constants";

interface ThemeTabProps {
  name: string;
  logoUrl: string;
  primaryColor: string;
  setPrimaryColor: (val: string) => void;
  navbarBg: string;
  setNavbarBg: (val: string) => void;
  navbarText: string;
  setNavbarText: (val: string) => void;
  buttonBg: string;
  setButtonBg: (val: string) => void;
  buttonText: string;
  setButtonText: (val: string) => void;
  textColor: string;
  setTextColor: (val: string) => void;
  h1Color: string;
  setH1Color: (val: string) => void;
  h2Color: string;
  setH2Color: (val: string) => void;
  paragraphColor: string;
  setParagraphColor: (val: string) => void;
  buttonShape: string;
  setButtonShape: (val: string) => void;
  primaryFont: string;
  setPrimaryFont: (val: string) => void;
}

export function ThemeTab({
  name,
  logoUrl,
  primaryColor,
  setPrimaryColor,
  navbarBg,
  setNavbarBg,
  navbarText,
  setNavbarText,
  buttonBg,
  setButtonBg,
  buttonText,
  setButtonText,
  textColor,
  setTextColor,
  h1Color,
  setH1Color,
  h2Color,
  setH2Color,
  paragraphColor,
  setParagraphColor,
  buttonShape,
  setButtonShape,
  primaryFont,
  setPrimaryFont,
}: ThemeTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Color Presets</h2>
              <p className="text-xs text-slate-400">
                Choose a harmonious designer palette or customize every element individually.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {colorPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setButtonBg(preset.buttonBg);
                    setNavbarBg(preset.navbarBg);
                    setNavbarText("#ffffff");
                  }}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 flex items-center gap-2.5 transition-all text-left"
                >
                  <div
                    className="w-5 h-5 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Typography Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-blue-400" />
                Storefront Font Style
              </label>
              <select
                value={primaryFont}
                onChange={(e) => setPrimaryFont(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {supportedFonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Button Shape */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Button Shape</label>
              <select
                value={buttonShape}
                onChange={(e) => setButtonShape(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SQUARE">Sharp Corners (Square)</option>
                <option value="MEDIUM_ROUNDED">Rounded Corners (Standard)</option>
                <option value="FULLY_ROUNDED">Pill Shaped (Fully Rounded)</option>
              </select>
            </div>
          </Card>

          {/* Detailed Color Pickers */}
          <Card className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Element Colors</h2>
              <p className="text-xs text-slate-400">
                Exact HEX colors for specific storefront sections.
              </p>
            </div>

            {/* Contrast Accessibility Warning */}
            {(() => {
              const navContrast = getContrastRatio(navbarBg, navbarText);
              const pageContrast = getContrastRatio("#ffffff", textColor);
              const btnContrast = getContrastRatio(buttonBg, buttonText);
              const hasLow = navContrast < 2.5 || pageContrast < 2.5 || btnContrast < 2.5;
              if (!hasLow) return null;
              return (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Accessibility Warning: Low Contrast Detected</strong>
                    <span>
                      {pageContrast < 2.5 && "Page text and white background have low contrast. Text may be hard to read or invisible. "}
                      {navContrast < 2.5 && "Navbar background and text have low contrast. "}
                      {btnContrast < 2.5 && "Button background and text have low contrast. "}
                      Ensure text elements contrast with their backgrounds.
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Navbar Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={navbarBg}
                    onChange={(e) => setNavbarBg(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <Input value={navbarBg} onChange={(e) => setNavbarBg(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Navbar Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={navbarText}
                    onChange={(e) => setNavbarText(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <Input value={navbarText} onChange={(e) => setNavbarText(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Button Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={buttonBg}
                    onChange={(e) => setButtonBg(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <Input value={buttonBg} onChange={(e) => setButtonBg(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Button Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                </div>
              </div>


              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Heading 1 (H1) Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={h1Color}
                    onChange={(e) => setH1Color(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <Input value={h1Color} onChange={(e) => setH1Color(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Heading 2 (H2) Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={h2Color}
                    onChange={(e) => setH2Color(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <Input value={h2Color} onChange={(e) => setH2Color(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Paragraph Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={paragraphColor}
                    onChange={(e) => setParagraphColor(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <Input value={paragraphColor} onChange={(e) => setParagraphColor(e.target.value)} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Eye className="w-4 h-4" />
            Live Theme Preview
          </div>

          <div
            className="rounded-2xl border border-slate-700 shadow-2xl overflow-hidden transition-all sticky top-24"
            style={{
              backgroundColor: "#ffffff",
              fontFamily: primaryFont,
            }}
          >
            {/* Mock Navbar */}
            <div
              className="p-4 flex items-center justify-between border-b border-black/10 transition-colors"
              style={{ backgroundColor: navbarBg, color: navbarText }}
            >
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <div className="relative h-6 max-w-[120px] flex items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-6 w-auto max-w-[120px] object-contain object-left"
                    />
                  </div>
                ) : (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: buttonBg, color: buttonText }}
                  >
                    {name[0] || "S"}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs opacity-90">
                <span>Products</span>
                <span>Cart (2)</span>
              </div>
            </div>

            {/* Mock Hero Section */}
            <div className="p-6 space-y-4">
              <h1
                className="text-xl font-extrabold tracking-tight transition-colors"
                style={{ color: h1Color }}
              >
                New Summer Collection
              </h1>
              <h2
                className="text-sm font-semibold transition-colors"
                style={{ color: h2Color }}
              >
                Handcrafted contemporary essentials
              </h2>
              <p
                className="text-xs leading-relaxed transition-colors"
                style={{ color: paragraphColor }}
              >
                Engineered for timeless aesthetic, sustainable materials, and ultimate everyday comfort.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  className={`px-5 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                    buttonShape === "FULLY_ROUNDED"
                      ? "rounded-full"
                      : buttonShape === "SQUARE"
                      ? "rounded-none"
                      : "rounded-xl"
                  }`}
                  style={{
                    backgroundColor: buttonBg,
                    color: buttonText,
                  }}
                >
                  Shop Now • ₹1,299
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

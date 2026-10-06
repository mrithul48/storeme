"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Standard Image Uploader ──────────────────────────────────────────────────

interface ImageUploaderProps {
  label: string;
  url?: string | null;
  onUpload: (result: { url: string; publicId: string }) => void;
  onRemove: () => void;
  folder?: string;
  aspectHint?: string;
}

export function ImageUploader({
  label,
  url,
  onUpload,
  onRemove,
  folder = "banners",
  aspectHint,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 4 * 1024 * 1024) {
        alert("File size exceeds 4 MB limit. Please select an image under 4 MB.");
        e.target.value = "";
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (res.ok && json.success) {
          onUpload({ url: json.url, publicId: json.publicId });
        } else {
          alert(json.error || "Failed to upload image.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload error. Please try again.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [folder, onUpload]
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      {url ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800 aspect-video w-full max-w-sm">
          <Image src={url} alt={label} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg flex items-center gap-1">
              <Upload className="w-3 h-3" /> Replace
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer h-36 max-w-sm w-full",
            uploading && "opacity-60 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <span className="text-xs text-slate-400">Uploading…</span>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-slate-600" />
              <span className="text-xs text-slate-400">Click to upload (Max 4MB)</span>
              {aspectHint && <span className="text-[11px] text-slate-600">{aspectHint}</span>}
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

// ─── Hero Slider Banner Uploader ──────────────────────────────────────────────

interface SliderBannerUploadProps {
  onUpload: (r: { url: string; publicId: string }) => void;
  disabled: boolean;
}

export function SliderBannerUpload({ onUpload, disabled }: SliderBannerUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 4 * 1024 * 1024) {
        alert("File size exceeds 4 MB limit. Please select an image under 4 MB.");
        e.target.value = "";
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "hero-slider");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (res.ok && json.success) {
          onUpload({ url: json.url, publicId: json.publicId });
        } else {
          alert(json.error || "Failed to upload banner.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload error. Please try again.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [onUpload]
  );

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-blue-500/50 transition-all cursor-pointer h-28",
        (uploading || disabled) && "opacity-60 cursor-not-allowed"
      )}
    >
      {uploading ? (
        <span className="text-xs text-slate-400">Uploading…</span>
      ) : (
        <>
          <Upload className="w-6 h-6 text-slate-600" />
          <span className="text-xs text-slate-400">Upload Banner (Max 4MB)</span>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading || disabled} />
    </label>
  );
}

// ─── Badge Icon Uploader ──────────────────────────────────────────────────────

interface BadgeIconUploadProps {
  icon?: string | null;
  onUpload: (r: { url: string; publicId: string }) => void;
  onRemove: () => void;
}

export function BadgeIconUpload({ icon, onUpload, onRemove }: BadgeIconUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 4 * 1024 * 1024) {
        alert("File size exceeds 4 MB limit. Please select an image under 4 MB.");
        e.target.value = "";
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "badges");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (res.ok && json.success) {
          onUpload({ url: json.url, publicId: json.publicId });
        } else {
          alert(json.error || "Failed to upload icon.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload error. Please try again.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [onUpload]
  );

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-semibold text-slate-400">Icon (optional)</label>
      {icon ? (
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
            <Image src={icon} alt="Badge icon" fill className="object-cover" />
          </div>
          <button type="button" onClick={onRemove} className="text-rose-400 hover:text-rose-300">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] text-slate-300 border border-slate-700 cursor-pointer transition-colors">
          {uploading ? "Uploading…" : <><Upload className="w-3 h-3" /> Upload Icon</>}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Info, Sparkles, Star, Trash2, Plus, GripVertical } from "lucide-react";
import { Input, Textarea } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section, Toggle } from "../_ui/primitives";
import { ImageUploader, BadgeIconUpload } from "../_ui/image-uploader";
import { Badge } from "../_ui/types";

interface AboutTabProps {
  aboutEnabled: boolean;
  setAboutEnabled: (v: boolean) => void;
  aboutHeading: string;
  setAboutHeading: (v: string) => void;
  aboutContent: string;
  setAboutContent: (v: string) => void;
  aboutImageUrl: string;
  setAboutImageUrl: (v: string) => void;
  aboutImagePublicId: string;
  setAboutImagePublicId: (v: string) => void;
  vision: string;
  setVision: (v: string) => void;
  mission: string;
  setMission: (v: string) => void;
  badges: Badge[];
  addBadge: () => void;
  updateBadge: (idx: number, field: keyof Badge, value: unknown) => void;
  removeBadge: (idx: number) => void;
}

export function AboutTab({
  aboutEnabled,
  setAboutEnabled,
  aboutHeading,
  setAboutHeading,
  aboutContent,
  setAboutContent,
  aboutImageUrl,
  setAboutImageUrl,
  setAboutImagePublicId,
  vision,
  setVision,
  mission,
  setMission,
  badges,
  addBadge,
  updateBadge,
  removeBadge,
}: AboutTabProps) {
  return (
    <div className="space-y-4">
      <Section title="About Section" icon={Info}>
        <div className="space-y-4 pt-2">
          <Toggle
            label="Enable About Section"
            description="Show the About page / section on your storefront"
            checked={aboutEnabled}
            onChange={setAboutEnabled}
          />
          {aboutEnabled && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Section Heading</label>
                <Input
                  value={aboutHeading}
                  onChange={(e) => setAboutHeading(e.target.value)}
                  placeholder="e.g. About Us"
                  maxLength={200}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">About Content</label>
                <Textarea
                  value={aboutContent}
                  onChange={(e) => setAboutContent(e.target.value)}
                  placeholder="Tell customers your story, values, and what makes you special..."
                  className="min-h-[120px]"
                />
              </div>

              <ImageUploader
                label="About Section Image"
                url={aboutImageUrl}
                folder="about"
                aspectHint="Recommended: 600×500px portrait"
                onUpload={(r) => {
                  setAboutImageUrl(r.url);
                  setAboutImagePublicId(r.publicId);
                }}
                onRemove={() => {
                  setAboutImageUrl("");
                  setAboutImagePublicId("");
                }}
              />
            </>
          )}
        </div>
      </Section>

      {aboutEnabled && (
        <>
          <Section title="Vision & Mission" icon={Sparkles} defaultOpen={false}>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Our Vision</label>
                <Textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Where you see your business heading..."
                  className="min-h-[90px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Our Mission</label>
                <Textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="What you are dedicated to achieving..."
                  className="min-h-[90px]"
                />
              </div>
            </div>
          </Section>

          <Section title="Achievement Badges" icon={Star} defaultOpen={false}>
            <div className="space-y-4 pt-2">
              <p className="text-xs text-slate-500">
                Highlight key stats or achievements (e.g. &quot;500+ Happy Customers&quot;, &quot;5 Years in Business&quot;)
              </p>
              <div className="space-y-3">
                {badges.map((badge, idx) => (
                  <div key={badge.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                        Badge {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBadge(idx)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-400">Badge Text</label>
                        <Input
                          value={badge.text}
                          onChange={(e) => updateBadge(idx, "text", e.target.value)}
                          placeholder="e.g. 500+ Happy Customers"
                          maxLength={100}
                        />
                      </div>
                      <BadgeIconUpload
                        icon={badge.icon}
                        onUpload={(r) => {
                          updateBadge(idx, "icon", r.url);
                          updateBadge(idx, "iconPublicId", r.publicId);
                        }}
                        onRemove={() => {
                          updateBadge(idx, "icon", null);
                          updateBadge(idx, "iconPublicId", null);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addBadge}>
                <Plus className="w-4 h-4 mr-1" /> Add Badge
              </Button>
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

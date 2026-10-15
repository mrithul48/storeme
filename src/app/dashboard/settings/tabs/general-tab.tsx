"use client";

import React from "react";
import Image from "next/image";
import { Card, Input, Textarea } from "@/components/ui/card";
import { Store, Upload } from "lucide-react";

interface GeneralTabProps {
  name: string;
  setName: (val: string) => void;
  businessType: string;
  setBusinessType: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  logoUrl: string;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
}

export function GeneralTab({
  name,
  setName,
  businessType,
  setBusinessType,
  description,
  setDescription,
  logoUrl,
  onLogoUpload,
  email,
  setEmail,
  phone,
  setPhone,
  whatsapp,
  setWhatsapp,
  address,
  setAddress,
}: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Business Details</h2>
          <p className="text-xs text-slate-400">
            Basic identifying details displayed across your storefront and order receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Store Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lumina Apparel"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Business Category</label>
            <Input
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="e.g. Fashion &amp; Lifestyle"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Store Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers what makes your products and store special..."
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-slate-300">Brand Logo</label>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" fill className="object-cover" />
              ) : (
                <Store className="w-8 h-8 text-slate-500" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-all border border-slate-700">
                <Upload className="w-3.5 h-3.5" />
                Upload New Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={onLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">PNG, JPG or SVG up to 2MB</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Contact &amp; Support Details</h2>
          <p className="text-xs text-slate-400">
            Customers use these details to contact your store regarding inquiries and orders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Support Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@yourstore.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">WhatsApp Number</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Physical Address</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 74 Fashion Blvd, Indiranagar, Bengaluru, KA 560038"
          />
        </div>
      </Card>
    </div>
  );
}

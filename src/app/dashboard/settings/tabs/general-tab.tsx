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
      <Card className="space-y-6 bg-white border border-slate-200/90 shadow-sm">
        <div className="border-b border-slate-200/90 pb-3">
          <h2 className="text-base font-bold text-[#0F172A]">Business Details</h2>
          <p className="text-xs text-[#64748B]">
            Basic identifying details displayed across your storefront and order receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Store Name *</label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter store name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Business Category</label>
            <Input
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="Enter business category"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#0F172A]">Store Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter store description"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-[#0F172A]">Brand Logo</label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 sm:w-28 h-16 rounded-2xl bg-white border border-slate-200/90 overflow-hidden flex items-center justify-center flex-shrink-0 p-2 shadow-xs">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" fill className="object-contain p-1" />
              ) : (
                <Store className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-[#0F172A] cursor-pointer transition-all border border-slate-200 shadow-sm">
                <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                Upload New Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={onLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#64748B] mt-1">PNG, JPG or SVG up to 2MB</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 bg-white border border-slate-200/90 shadow-sm">
        <div className="border-b border-slate-200/90 pb-3">
          <h2 className="text-base font-bold text-[#0F172A]">Contact & Support Details</h2>
          <p className="text-xs text-[#64748B]">
            Customers use these details to contact your store regarding inquiries and orders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Support Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter support email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">Phone Number</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">WhatsApp Number</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Enter WhatsApp number"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#0F172A]">Physical Address</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter physical address"
          />
        </div>
      </Card>
    </div>
  );
}

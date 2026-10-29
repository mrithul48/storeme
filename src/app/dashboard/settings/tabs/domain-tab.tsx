"use client";

import React from "react";
import { Card, Input } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  ExternalLink,
  Unplug,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

interface DomainTabProps {
  customDomain: string;
  setCustomDomain: (val: string) => void;
  domainStatus: string;
  verificationToken: string;
  loading: boolean;
  verifyingDomain: boolean;
  disconnectingDomain: boolean;
  copiedToken: boolean;
  copiedRouting: boolean;
  onSaveDomain: () => void;
  onVerifyDomain: () => void;
  onDisconnectDomain: () => void;
  onCopyToken: () => void;
  onCopyRouting: (value: string) => void;
}

export function DomainTab({
  customDomain,
  setCustomDomain,
  domainStatus,
  verificationToken,
  loading,
  verifyingDomain,
  disconnectingDomain,
  copiedToken,
  copiedRouting,
  onSaveDomain,
  onVerifyDomain,
  onDisconnectDomain,
  onCopyToken,
  onCopyRouting,
}: DomainTabProps) {
  return (
    <div className="space-y-6">
      {/* Active Connected Domain Hero Banner */}
      {(domainStatus === "CONNECTED" || domainStatus === "VERIFIED") && customDomain && (
        <Card className="bg-emerald-50/60 border border-emerald-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Custom Domain Active &amp; Verified
                </span>
              </div>
              <p className="text-xl font-mono font-bold text-[#0F172A] tracking-tight">
                https://{customDomain}
              </p>
              <p className="text-xs text-[#64748B]">
                Your store catalog, cart, checkout, and themes are live on your custom domain.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://${customDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button type="button" variant="primary" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Visit Storefront
                </Button>
              </a>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                isLoading={disconnectingDomain}
                onClick={onDisconnectDomain}
              >
                <Unplug className="w-4 h-4 mr-1.5" />
                Disconnect
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Domain Configuration Form Card */}
      <Card className="space-y-6 bg-transparent sm:bg-white border-0 sm:border sm:border-slate-200/90 shadow-none sm:shadow-sm p-0 sm:p-6 rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/90 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Custom Domain Mapping</h2>
            <p className="text-xs text-[#64748B]">
              Connect your own custom root or subdomain (e.g. shop.yourbrand.com or yourbrand.com).
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              domainStatus === "CONNECTED" || domainStatus === "VERIFIED"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : domainStatus === "PENDING_VERIFICATION"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : domainStatus === "VERIFICATION_FAILED" || domainStatus === "FAILED"
                ? "bg-rose-50 text-rose-800 border border-rose-200"
                : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Status: {domainStatus.replace(/_/g, " ")}
          </span>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#0F172A]">Custom Domain Hostname</label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="Enter custom domain (e.g. store.yourbrand.com)"
              className="flex-1"
            />
            <Button type="button" variant="primary" onClick={onSaveDomain} isLoading={loading} className="w-full sm:w-auto h-11 sm:h-auto py-2.5 sm:py-2 text-sm font-bold">
              <Globe className="w-4 h-4 mr-1.5" />
              {domainStatus === "CONNECTED" || domainStatus === "VERIFIED" ? "Update Domain" : "Register Domain"}
            </Button>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Enter your domain name without <span className="font-mono text-slate-700">https://</span> or trailing slashes.
          </p>
        </div>

        {/* DNS Instructions Section */}
        {verificationToken && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                DNS Configuration Instructions
              </h4>
              <span className="text-[11px] text-[#64748B]">Hostinger, GoDaddy, Namecheap, Cloudflare</span>
            </div>

            <p className="text-xs text-[#0F172A] leading-relaxed">
              Log in to your domain registrar and create the following DNS records to verify ownership and route traffic:
            </p>

            <div className="space-y-3">
              {/* Record 1: Routing Record */}
              {customDomain.split(".").length > 2 ? (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                      Record 1: Traffic Routing (CNAME)
                    </span>
                    <span className="text-[10px] text-[#64748B]">Points subdomain to platform</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans font-medium">TYPE</span>
                      <span className="text-[#0F172A] font-bold">CNAME</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans font-medium">HOST / NAME</span>
                      <span className="text-[#0F172A] font-bold">{customDomain.split(".")[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans font-medium">TARGET / VALUE</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[#2563EB] font-bold break-all">cname.vercel-dns.com</span>
                        <button
                          type="button"
                          onClick={() => onCopyRouting("cname.vercel-dns.com")}
                          className="p-1 rounded hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                          title="Copy Value"
                        >
                          {copiedRouting ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                      Record 1: Traffic Routing (A Record)
                    </span>
                    <span className="text-[10px] text-[#64748B]">Points root domain to platform IP</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans font-medium">TYPE</span>
                      <span className="text-[#0F172A] font-bold">A</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans font-medium">HOST / NAME</span>
                      <span className="text-[#0F172A] font-bold">@</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans font-medium">TARGET / IP</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[#2563EB] font-bold break-all">76.76.21.21</span>
                        <button
                          type="button"
                          onClick={() => onCopyRouting("76.76.21.21")}
                          className="p-1 rounded hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                          title="Copy IP"
                        >
                          {copiedRouting ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Record 2: TXT Verification Record */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Record 2: Ownership Verification (TXT)
                  </span>
                  <span className="text-[10px] text-[#64748B]">Proves domain ownership</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans font-medium">TYPE</span>
                    <span className="text-[#0F172A] font-bold">TXT</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans font-medium">HOST / NAME</span>
                    <span className="text-[#0F172A] font-bold">@</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans font-medium">RECORD VALUE</span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-emerald-700 font-bold break-all text-[11px]">{verificationToken}</span>
                      <button
                        type="button"
                        onClick={onCopyToken}
                        className="p-1 rounded hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A]"
                        title="Copy Token"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] italic">
              Note: DNS records usually propagate within 5-30 minutes, but can occasionally take up to 24 hours depending on your registrar.
            </p>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={verifyingDomain}
                onClick={onVerifyDomain}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Verify DNS Configuration
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                isLoading={disconnectingDomain}
                onClick={onDisconnectDomain}
              >
                <Unplug className="w-4 h-4 mr-1.5" />
                Disconnect Domain
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

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
        <Card className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Custom Domain Active &amp; Verified
                </span>
              </div>
              <p className="text-xl font-mono font-bold text-white tracking-tight">
                https://{customDomain}
              </p>
              <p className="text-xs text-slate-400">
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
      <Card className="space-y-6">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Custom Domain Mapping</h2>
            <p className="text-xs text-slate-400">
              Connect your own custom root or subdomain (e.g. shop.yourbrand.com or yourbrand.com).
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              domainStatus === "CONNECTED" || domainStatus === "VERIFIED"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : domainStatus === "PENDING_VERIFICATION"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : domainStatus === "VERIFICATION_FAILED" || domainStatus === "FAILED"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            Status: {domainStatus.replace(/_/g, " ")}
          </span>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300">Custom Domain Hostname</label>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="e.g. store.yourbrand.com or yourbrand.com"
              className="flex-1"
            />
            <Button type="button" variant="primary" onClick={onSaveDomain} isLoading={loading}>
              <Globe className="w-4 h-4 mr-1.5" />
              {domainStatus === "CONNECTED" || domainStatus === "VERIFIED" ? "Update Domain" : "Register Domain"}
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">
            Enter your domain name without <span className="font-mono text-slate-400">https://</span> or trailing slashes.
          </p>
        </div>

        {/* DNS Instructions Section */}
        {verificationToken && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                DNS Configuration Instructions
              </h4>
              <span className="text-[11px] text-slate-400">Hostinger, GoDaddy, Namecheap, Cloudflare</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Log in to your domain registrar and create the following DNS records to verify ownership and route traffic:
            </p>

            <div className="space-y-3">
              {/* Record 1: Routing Record */}
              {customDomain.split(".").length > 2 ? (
                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Record 1: Traffic Routing (CNAME)
                    </span>
                    <span className="text-[10px] text-slate-400">Points subdomain to platform</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">TYPE</span>
                      <span className="text-white font-bold">CNAME</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                      <span className="text-white font-bold">{customDomain.split(".")[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TARGET / VALUE</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-blue-300 font-bold break-all">cname.vercel-dns.com</span>
                        <button
                          type="button"
                          onClick={() => onCopyRouting("cname.vercel-dns.com")}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Copy Value"
                        >
                          {copiedRouting ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Record 1: Traffic Routing (A Record)
                    </span>
                    <span className="text-[10px] text-slate-400">Points root domain to platform IP</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">TYPE</span>
                      <span className="text-white font-bold">A</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                      <span className="text-white font-bold">@</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TARGET / IP</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-blue-300 font-bold break-all">76.76.21.21</span>
                        <button
                          type="button"
                          onClick={() => onCopyRouting("76.76.21.21")}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Copy IP"
                        >
                          {copiedRouting ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Record 2: TXT Verification Record */}
              <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Record 2: Ownership Verification (TXT)
                  </span>
                  <span className="text-[10px] text-slate-400">Proves domain ownership</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">TYPE</span>
                    <span className="text-white font-bold">TXT</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">HOST / NAME</span>
                    <span className="text-white font-bold">@</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">RECORD VALUE</span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-emerald-400 font-bold break-all text-[11px]">{verificationToken}</span>
                      <button
                        type="button"
                        onClick={onCopyToken}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Copy Token"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
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
                className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
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

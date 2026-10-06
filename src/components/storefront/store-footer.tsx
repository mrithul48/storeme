import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ExternalLink } from "lucide-react";

interface StoreFooterProps {
  store: {
    name: string;
    slug: string;
    company?: {
      description?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      whatsapp?: string | null;
      socialLinks?: unknown;
    } | null;
    workingHours?: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      openTime?: string | null;
      closeTime?: string | null;
    }> | null;
    homePage?: {
      aboutEnabled?: boolean | null;
      contactEnabled?: boolean | null;
    } | null | unknown;
  };
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StoreFooter({ store }: StoreFooterProps) {
  const company = store.company;
  const hp = store.homePage as { aboutEnabled?: boolean | null; contactEnabled?: boolean | null } | null | undefined;
  const aboutEnabled = hp?.aboutEnabled ?? false;
  const contactEnabled = hp?.contactEnabled ?? false;

  // Parse social links
  let socialLinks: Record<string, string | null | undefined> = {};
  try {
    if (company?.socialLinks && typeof company.socialLinks === "object") {
      socialLinks = company.socialLinks as Record<string, string | null | undefined>;
    }
  } catch { /* ignore */ }

  const storePath = `/store/${store.slug}`;

  const navLinks = [
    { label: "Shop", href: `${storePath}/shop` },
    ...(aboutEnabled ? [{ label: "About Us", href: `${storePath}/about` }] : []),
    ...(contactEnabled ? [{ label: "Contact", href: `${storePath}/contact` }] : []),
  ];

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Store Info */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-white">{store.name}</h3>
            {company?.description && (
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                {company.description}
              </p>
            )}
            {company?.address && (
              <div className="flex items-start gap-2 text-xs text-slate-400 pt-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{company.address}</span>
              </div>
            )}
            {/* Social Links */}
            {(socialLinks.instagram || socialLinks.facebook || socialLinks.youtube || socialLinks.twitter) && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-slate-500 hover:text-pink-400 transition-colors" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                    className="text-slate-500 hover:text-blue-400 transition-colors" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                    className="text-slate-500 hover:text-red-400 transition-colors" aria-label="YouTube">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-300 transition-colors" aria-label="X / Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Details + Working Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Customer Support</h4>
            <div className="space-y-2 text-xs">
              {company?.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-blue-400" />
                  {company.email}
                </a>
              )}
              {company?.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-blue-400" />
                  {company.phone}
                </a>
              )}
              {store.workingHours && store.workingHours.length > 0 && (
                <div className="pt-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Store Hours
                  </div>
                  {store.workingHours.slice(0, 4).map((wh) => (
                    <div key={wh.dayOfWeek} className="flex justify-between max-w-xs">
                      <span className="text-slate-500">{dayNames[wh.dayOfWeek]}</span>
                      <span className={wh.isOpen ? "text-slate-300" : "text-rose-400"}>
                        {wh.isOpen ? `${wh.openTime || "09:00"} – ${wh.closeTime || "18:00"}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Powered by</span>
            <Link href="/" className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1">
              LaunchCommerce SaaS
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


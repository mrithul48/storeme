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
      socialLinks?: any;
    } | null;
    workingHours?: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      openTime?: string | null;
      closeTime?: string | null;
    }> | null;
  };
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function StoreFooter({ store }: StoreFooterProps) {
  const company = store.company;

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Info */}
          <div className="space-y-3">
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
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <div className="space-y-2 text-xs">
              {company?.email && (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  {company.email}
                </a>
              )}
              {company?.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  {company.phone}
                </a>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Store Hours
            </h4>
            {store.workingHours && store.workingHours.length > 0 ? (
              <div className="space-y-1 text-xs">
                {store.workingHours.map((wh) => (
                  <div key={wh.dayOfWeek} className="flex justify-between max-w-xs">
                    <span className="text-slate-400">{dayNames[wh.dayOfWeek]}</span>
                    <span className={wh.isOpen ? "text-slate-200" : "text-rose-400"}>
                      {wh.isOpen ? `${wh.openTime || "09:00"} - ${wh.closeTime || "18:00"}` : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Open 7 days a week, 24/7 online orders.</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} {store.name}. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Powered by</span>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
            >
              LaunchCommerce SaaS
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

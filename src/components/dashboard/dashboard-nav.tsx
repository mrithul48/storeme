"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  Paintbrush2,
  Settings,
  ShieldAlert,
  Users,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

interface DashboardNavProps {
  isPlatformAdmin?: boolean;
  onItemClick?: () => void;
}

export function DashboardNav({ isPlatformAdmin, onItemClick }: DashboardNavProps) {
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      title: "Main",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
      ],
    },
    {
      title: "Store Management",
      items: [
        { label: "Products", href: "/dashboard/products", icon: Package },
        { label: "Categories", href: "/dashboard/categories", icon: Layers },
        { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
        { label: "Customers", href: "/dashboard/customers", icon: Users },
      ],
    },
    {
      title: "Appearance & Settings",
      items: [
        { label: "Live Store Design", href: "/dashboard/store-design", icon: Paintbrush2 },
        { label: "Store Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
    ...(isPlatformAdmin
      ? [
          {
            title: "Administration",
            items: [{ label: "Super Admin", href: "/admin", icon: ShieldAlert }],
          },
        ]
      : []),
  ];

  return (
    <nav className="space-y-6">
      {navSections.map((section, idx) => (
        <div key={section.title || idx} className="space-y-1">
          {section.title && (
            <h3 className="px-3.5 mb-1.5 text-[11px] font-extrabold tracking-wider text-black uppercase select-none">
              {section.title}
            </h3>
          )}
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all group ${
                    isActive
                      ? "bg-blue-50 text-[#2563EB] font-bold border border-blue-200/80 shadow-sm shadow-blue-500/5"
                      : "text-black font-semibold hover:text-black hover:bg-slate-100/90"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-[#2563EB]"
                          : "text-black"
                      }`}
                    />
                    <span className={isActive ? "text-[#2563EB]" : "text-black"}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shadow-sm shadow-blue-500/40" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

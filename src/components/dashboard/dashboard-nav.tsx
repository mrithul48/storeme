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
        <div key={section.title || idx} className="space-y-1.5">
          {section.title && (
            <h3 className="px-3.5 mb-1.5 text-[11px] font-extrabold tracking-wider text-[#7181A8] uppercase select-none">
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
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                    isActive
                      ? "bg-[#172653] text-[#638BFF] font-bold border border-[#4169E1]/30 shadow-sm shadow-[#4169E1]/15"
                      : "text-[#A5B2D1] font-medium hover:text-[#F5F7FF] hover:bg-[#101A3D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isActive
                          ? "text-[#638BFF]"
                          : "text-[#7181A8] group-hover:text-[#F5F7FF]"
                      }`}
                    />
                    <span className={isActive ? "text-[#638BFF]" : "text-[#A5B2D1] group-hover:text-[#F5F7FF]"}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#638BFF] shadow-xs shadow-[#638BFF]/50" />
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

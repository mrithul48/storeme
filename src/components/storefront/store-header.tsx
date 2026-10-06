"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Store as StoreIcon,
  Menu,
  X,
} from "lucide-react";
import { getStoreLink } from "@/lib/store-url";

interface StoreHeaderProps {
  store: {
    slug: string;
    name: string;
    company?: {
      logoUrl?: string | null;
      whatsapp?: string | null;
      phone?: string | null;
      socialLinks?: unknown;
    } | null;
    theme?: {
      primaryColor?: string | null;
      navbarBg?: string | null;
      navbarText?: string | null;
    } | null;
    homePage?: unknown;
  };
  showAccountIcon?: boolean;
}

export function StoreHeader({ store, showAccountIcon }: StoreHeaderProps) {
  const router = useRouter();
  const { totalItems: cartCount, setIsOpen: setCartOpen } = useCart();
  const { totalItems: wishlistCount, setIsOpen: setWishlistOpen } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navbarBg = store.theme?.navbarBg || "#ffffff";
  const navbarText = store.theme?.navbarText || "#111827";

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Account visibility setting from props or homePage
  const hp = store.homePage as { showAccountIcon?: boolean } | null | undefined;
  const isAccountVisible = showAccountIcon !== undefined ? showAccountIcon : hp?.showAccountIcon !== false;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(getStoreLink(store.slug, `/shop?search=${encodeURIComponent(searchQuery.trim())}`));
    setSearchOpen(false);
  };

  const navLinks = [
    { label: "Home", href: getStoreLink(store.slug, "") },
    { label: "Shop All", href: getStoreLink(store.slug, "/shop") },
    { label: "New Arrival", href: getStoreLink(store.slug, "/shop?newArrival=true") },
    { label: "About Us", href: getStoreLink(store.slug, "/about") },
    { label: "Contact", href: getStoreLink(store.slug, "/contact") },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full border-b transition-colors duration-200 shadow-sm"
      style={{
        backgroundColor: navbarBg,
        color: navbarText,
        borderColor: "var(--store-border, rgba(0,0,0,0.08))",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* ── Left: Store Logo (No Business Name) ────────────────────── */}
        <Link
          href={getStoreLink(store.slug, "")}
          className="flex items-center group focus:outline-none flex-shrink-0 py-1"
          style={{ color: navbarText }}
        >
          {store.company?.logoUrl ? (
            <div className="relative h-9 sm:h-11 md:h-12 max-w-[170px] sm:max-w-[220px] flex items-center">
              <Image
                src={store.company.logoUrl}
                alt={store.name}
                width={220}
                height={48}
                className="h-8 sm:h-10 md:h-11 w-auto max-w-[160px] sm:max-w-[220px] object-contain object-left"
                unoptimized
                priority
              />
            </div>
          ) : (
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: store.theme?.primaryColor || "#3b82f6" }}
            >
              <StoreIcon className="w-5 h-5" />
            </div>
          )}
        </Link>

        {/* ── Center: Main Navigation Links (Desktop) ────────────────── */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs sm:text-sm font-semibold tracking-wide uppercase transition-opacity hover:opacity-70"
              style={{ color: navbarText }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right (Desktop): Action Icons ──────────────────────────── */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* 1. Search Icon */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search products"
            className="p-2.5 rounded-xl transition-all hover:bg-black/5 active:scale-95"
            style={{ color: navbarText }}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* 2. Wishlist Icon */}
          <button
            type="button"
            onClick={() => setWishlistOpen(true)}
            aria-label="View wishlist"
            className="relative p-2.5 rounded-xl transition-all hover:bg-black/5 active:scale-95"
            style={{ color: navbarText }}
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-red-500 text-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* 3. Cart Icon */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="View shopping cart"
            className="relative p-2.5 rounded-xl transition-all hover:bg-black/5 active:scale-95"
            style={{ color: navbarText }}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full text-white shadow-sm"
                style={{ backgroundColor: "var(--store-primary, #3b82f6)" }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* 4. Account Icon */}
          {isAccountVisible && (
            <Link
              href={getStoreLink(store.slug, "/account")}
              aria-label="My Account"
              className="p-2.5 rounded-xl transition-all hover:bg-black/5 active:scale-95 flex items-center"
              style={{ color: navbarText }}
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* ── Right (Mobile): Search, Cart, Menubar ───────────────────── */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          {/* Search Icon */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search products"
            className="p-2 rounded-xl transition-all hover:bg-black/5 active:scale-95"
            style={{ color: navbarText }}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Icon */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label="View shopping cart"
            className="relative p-2 rounded-xl transition-all hover:bg-black/5 active:scale-95"
            style={{ color: navbarText }}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full text-white shadow-sm"
                style={{ backgroundColor: "var(--store-primary, #3b82f6)" }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Menubar (Hamburger) Icon */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-xl transition-all hover:bg-black/5 active:scale-95"
            style={{ color: navbarText }}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Search Dropdown / Bar ───────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t px-4 py-3 shadow-md"
            style={{
              backgroundColor: navbarBg,
              borderColor: "var(--store-border, rgba(0,0,0,0.08))",
            }}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50"
                  style={{ color: navbarText }}
                />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products in this store…"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border bg-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  style={{
                    color: navbarText,
                    borderColor: "var(--store-border, rgba(0,0,0,0.15))",
                  }}
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--store-button-bg, #22c55e)",
                  color: "var(--store-button-text, #ffffff)",
                }}
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2.5 rounded-xl hover:bg-black/5 text-xs opacity-70"
                style={{ color: navbarText }}
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Fullscreen Navigation Drawer / Menubar ────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu-fullscreen"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed inset-0 z-50 lg:hidden flex flex-col w-full h-full"
            style={{
              backgroundColor: navbarBg,
              color: navbarText,
            }}
          >
            {/* Top Bar inside Fullscreen Menubar */}
            <div className="h-16 sm:h-20 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
              <Link
                href={getStoreLink(store.slug, "")}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center group focus:outline-none py-1"
                style={{ color: navbarText }}
              >
                {store.company?.logoUrl ? (
                  <div className="relative h-8 sm:h-10 max-w-[150px] sm:max-w-[180px] flex items-center">
                    <Image
                      src={store.company.logoUrl}
                      alt={store.name}
                      width={180}
                      height={40}
                      className="h-8 sm:h-10 w-auto max-w-[150px] sm:max-w-[180px] object-contain object-left"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                    style={{ backgroundColor: store.theme?.primaryColor || "#3b82f6" }}
                  >
                    <StoreIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2.5 rounded-xl transition-all hover:bg-black/5 active:scale-95"
                style={{ color: navbarText }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items Centered - All borders removed, smooth motion */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
              <motion.nav
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.05,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-7 w-full max-w-sm"
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.label}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.32, ease: "easeOut" },
                      },
                    }}
                    className="w-full text-center"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-block text-xl sm:text-2xl font-bold tracking-wide uppercase transition-transform hover:scale-105 active:scale-95"
                      style={{ color: navbarText }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Wishlist Inside Menubar */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.32, ease: "easeOut" },
                    },
                  }}
                  className="w-full flex justify-center pt-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setWishlistOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold tracking-wide uppercase transition-transform hover:scale-105 active:scale-95"
                    style={{ color: navbarText }}
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                </motion.div>

                {/* Customer Account Inside Menubar */}
                {isAccountVisible && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.32, ease: "easeOut" },
                      },
                    }}
                    className="w-full flex justify-center"
                  >
                    <Link
                      href={getStoreLink(store.slug, "/account")}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold tracking-wide uppercase transition-transform hover:scale-105 active:scale-95"
                      style={{ color: navbarText }}
                    >
                      <User className="w-5 h-5" />
                      <span>My Account</span>
                    </Link>
                  </motion.div>
                )}
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


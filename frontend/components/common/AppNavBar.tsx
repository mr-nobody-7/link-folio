"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const AppNavBar = () => {
  const pathname = usePathname();

  // Hide the navbar on dashboard and public profile pages
  if (
    pathname?.startsWith("/dashboard") ||
    /^\/[^/]+$/.test(pathname || "") // matches "/:username" profile routes
  ) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur bg-white/95 border-b border-[#888888]/10 shadow-sm px-4">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between">
        {/* Brand/Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold font-heading text-black tracking-tight"
        >
          <span>LinkFolio</span>
        </Link>
        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/auth/signup">
            <Button className="rounded-full px-6 py-2 font-bold text-base bg-[#ec5c33] hover:bg-[#d54a29] text-white shadow transition-all duration-200 transform hover:scale-105">
              Sign Up
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="rounded-full px-6 py-2 font-bold text-base"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AppNavBar;

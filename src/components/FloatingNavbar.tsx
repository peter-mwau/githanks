"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function FloatingNavbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
    { href: "/about", label: "About", icon: "ℹ️" },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/50"
          : "bg-white/70 backdrop-blur-sm shadow-md border border-gray-200/30"
      } rounded-full px-6 py-3`}
    >
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🙏</span>
          <span className="font-bold text-gray-900 hidden sm:block">
            GitThanks
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                pathname === item.href
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="font-medium text-sm hidden sm:block">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Action Button */}
        <Link
          href="/analytics"
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hidden md:block"
        >
          View Analytics
        </Link>
      </div>
    </nav>
  );
}

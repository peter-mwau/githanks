"use client";

// import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface FloatingNavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  darkMode: boolean;
}

export default function FloatingNavbar({
  currentPage,
  setCurrentPage,
}: FloatingNavbarProps) {
  // const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: "🏠", page: "home" },
    { href: "/analytics", label: "Analytics", icon: "📊", page: "analytics" },
    { href: "/about", label: "About", icon: "ℹ️", page: "about" },
  ];

  const handleNavigation = (page: string, href: string) => {
    setCurrentPage(page);
    // If you're using Next.js navigation, you might want to use router.push instead
    console.log(`Navigate to ${href}`);
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          : "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-md border border-gray-200/30 dark:border-gray-700/30"
      } rounded-full px-6 py-3`}
    >
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🙏</span>
          <span className="font-bold text-gray-900 dark:text-white hidden sm:block">
            GitThanks
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.page, item.href)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                currentPage === item.page
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="font-medium text-sm hidden sm:block">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleNavigation("analytics", "/analytics")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hidden md:block"
        >
          View Analytics
        </button>
      </div>
    </nav>
  );
}

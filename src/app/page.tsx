"use client";

import FloatingNavbar from "@/components/FloatingNavbar";
import { SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import AnalyticsPage from "./analytics/page";
import Home from "./home/page";
import VantaGlobeBG from "../components/VantaHero";
import AboutPage from "./about/page";

export default function Main() {
  const [currentPage, setCurrentPage] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("abya-dark-mode");
      if (stored) {
        setDarkMode(stored === "true");
      } else {
        setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    }
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("abya-dark-mode", String(darkMode));
  }, [darkMode]);

  const renderPage = () => {
    switch (currentPage) {
      case "analytics":
        return <AnalyticsPage setCurrentPage={setCurrentPage} />;
      case "about":
        return <AboutPage setCurrentPage={setCurrentPage} />;
      case "home":
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <>
      {/* Vanta Background */}
      <VantaGlobeBG darkMode={darkMode} />

      {/* Floating Navbar */}
      <FloatingNavbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <div className="pt-24 min-h-screen bg-transparent relative z-10">
        {renderPage()}
      </div>

      {/* Dark mode toggle button */}
      <button
        onClick={() => setDarkMode((d) => !d)}
        className="fixed right-6 bottom-6 z-50 p-3 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-r from-green-500 to-gray-600 hover:cursor-pointer text-white border-none transition-all duration-300 hover:from-gray-600 hover:to-green-500 hover:scale-110 backdrop-blur-sm"
        aria-label="Toggle dark mode"
      >
        {!darkMode ? (
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 0 1 12.79 3a1 1 0 0 0-1.13 1.13A7 7 0 1 0 20.87 13.92a1 1 0 0 0 1.13-1.13z" />
          </svg>
        ) : (
          <SunMedium className="w-5 h-5" />
        )}
      </button>
    </>
  );
}

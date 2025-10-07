"use client";

import { useRef, useEffect } from "react";

// Extend Window interface to include Vanta and THREE
declare global {
  interface Window {
    THREE: unknown;
    VANTA: {
      GLOBE?: (options: unknown) => {
        destroy: () => void;
      };
    };
  }
}

interface VantaGlobeBGProps {
  darkMode: boolean;
}

// Vanta Globe background using Three.js and Vanta.js
// Loads Vanta and Three.js dynamically to avoid global script tags
const VantaGlobeBG = ({ darkMode }: VantaGlobeBGProps) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let mounted = true;
    let vantaCleanup: (() => void) | null = null;
    let threeScript: HTMLScriptElement | null = null;
    let vantaScript: HTMLScriptElement | null = null;

    // Dynamically load Three.js and Vanta Globe
    const loadScripts = async (): Promise<boolean> => {
      if (window.THREE && window.VANTA && window.VANTA.GLOBE) return true;

      // Load Three.js
      if (!window.THREE) {
        threeScript = document.createElement("script");
        threeScript.src =
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js";
        threeScript.async = true;

        await new Promise<void>((resolve, reject) => {
          if (!threeScript) return;
          threeScript.onload = () => resolve();
          threeScript.onerror = reject;
          document.body.appendChild(threeScript);
        });
      }

      // Load Vanta Globe
      if (!window.VANTA || !window.VANTA.GLOBE) {
        vantaScript = document.createElement("script");
        vantaScript.src =
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js";
        vantaScript.async = true;

        await new Promise<void>((resolve, reject) => {
          if (!vantaScript) return;
          vantaScript.onload = () => resolve();
          vantaScript.onerror = reject;
          document.body.appendChild(vantaScript);
        });
      }

      return true;
    };

    const initializeVanta = async () => {
      try {
        await loadScripts();

        if (!mounted || !vantaRef.current || !window.VANTA?.GLOBE) return;

        // Clean up previous effect
        if (vantaEffect.current) {
          vantaEffect.current.destroy();
        }

        // Initialize Vanta Globe
        vantaEffect.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 0.85,
          scaleMobile: 0.85,
          size: 1.2,
          color: darkMode ? 0x20d42b : 0xf2b705, // globe color
          color2: darkMode ? 0x20d42b : 0xf2b705,
          backgroundColor: darkMode ? 0x1f3c5f : 0xf7f7f7,
          points: 6.0,
          maxDistance: 40.0,
          spacing: 48.0,
          showLines: true,
          lineColor: 0xf2b705, // bright gold for visibility
          lineAlpha: 0.85,
        });

        vantaCleanup = () => {
          if (vantaEffect.current) {
            vantaEffect.current.destroy();
          }
          vantaEffect.current = null;
        };
      } catch (error) {
        console.error("Failed to initialize Vanta Globe:", error);
      }
    };

    initializeVanta();

    // Cleanup function
    return () => {
      mounted = false;

      // Clean up Vanta effect
      if (vantaCleanup) {
        vantaCleanup();
      } else if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }

      // Remove scripts if they were added
      if (threeScript && document.body.contains(threeScript)) {
        document.body.removeChild(threeScript);
      }
      if (vantaScript && document.body.contains(vantaScript)) {
        document.body.removeChild(vantaScript);
      }
    };
  }, [darkMode]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: "fixed",
        zIndex: 0,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        transition: "background 0.5s",
      }}
      aria-hidden="true"
    />
  );
};

export default VantaGlobeBG;

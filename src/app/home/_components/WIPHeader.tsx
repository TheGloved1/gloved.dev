"use client";
import React, { useState, useEffect } from "react";

export function WIPHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timerFadeOut = setTimeout(() => {
      setIsFading(true);
      const timerDisappear = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      return () => clearTimeout(timerDisappear);
    }, 5000);

    return () => clearTimeout(timerFadeOut);
  }, []);

  const className = isFading ? "fadeOut" : "";

  return isVisible ? (
    <div
      className={`fixed top-[10vh] flex items-center justify-center p-1 text-center font-bold md:text-[0.75rem] lg:text-5xl ${className}`}
    >
      <div>{"gloved"}</div>
      <div className="text-[hsl(280,100%,40%)]">{"."}</div>
      <div>{"dev"}</div>
      <div className="text-[hsl(280,100%,40%)]">{"/"}</div>
      <div className="pr-2">{"home "}</div>
      <div className="p-2 bg-gray-700 rounded-xl text-slate-900">
        {"Work in progress..."}
      </div>
    </div>
  ) : null;
}

"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Shield, Timer } from "lucide-react";
import UpgradeButton from "../UpgradeButton";

function CountdownTimer() {
  // 30 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    // Check if we have a saved end time in localStorage to persist across reloads
    const savedEndTime = localStorage.getItem("kinetic_offer_end");
    if (savedEndTime) {
      const remaining = Math.max(0, Math.floor((parseInt(savedEndTime) - Date.now()) / 1000));
      setTimeLeft(remaining);
    } else {
      const endTime = Date.now() + 30 * 60 * 1000;
      localStorage.setItem("kinetic_offer_end", endTime.toString());
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (timeLeft === 0) return <span className="text-red-400 font-bold">Offer Expired</span>;

  return (
    <div className="flex items-center gap-1.5 text-gold font-bold bg-gold/10 px-3 py-1 rounded-full border border-gold/20 animate-pulse">
      <Timer className="w-4 h-4" />
      <span>{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Upgrade your <span className="text-gold font-serif italic font-normal">Kinetic</span> power.
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto px-4">
          Choose the plan that fits your channel's growth. Stop wasting hours on Photoshop and start generating high-CTR thumbnails instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
        
        {/* Pro Plan */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-charcoal border-2 border-gold flex flex-col shadow-2xl shadow-gold/5 overflow-hidden">
          {/* Limited Time Badge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gold text-black text-[10px] uppercase font-bold tracking-widest py-1 px-4 rounded-b-xl shadow-lg whitespace-nowrap">
            Limited Time Offer
          </div>

          <div className="mb-6 mt-4">
            <h3 className="text-2xl font-bold text-white mb-2">Kinetic Pro</h3>
            <p className="text-sm text-muted">Perfect for creators uploading 1-2 videos per week.</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">₹299</span>
                <span className="text-muted text-sm pb-1">/mo</span>
              </div>
              <div className="text-sm text-muted line-through decoration-red-500/50 decoration-2">₹999/mo</div>
            </div>
            <CountdownTimer />
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <Feature icon={<Check className="text-gold w-5 h-5" />} text="7 AI Thumbnails per week" />
            <Feature icon={<Zap className="text-gold w-5 h-5" />} text="Lightning Fast Generation (< 10s)" />
            <Feature icon={<Shield className="text-gold w-5 h-5" />} text="Perfect Face Preservation" />
            <Feature icon={<Check className="text-gold w-5 h-5" />} text="High CTR Format Library" />
          </div>

          <UpgradeButton tier="pro" className="w-full text-sm uppercase tracking-widest font-bold bg-gold text-black py-4 rounded-xl hover:bg-yellow-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold/20 flex items-center justify-center">
            Get Kinetic Pro
          </UpgradeButton>
        </div>

        {/* Elite Plan */}
        <div className="p-6 sm:p-8 rounded-3xl bg-black/40 border border-white/10 flex flex-col hover:border-purple-500/50 transition-colors group">
          <div className="mb-6 mt-4">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Kinetic Elite</h3>
            </div>
            <p className="text-sm text-muted">For serious agencies and daily uploaders.</p>
          </div>

          <div className="mb-8 space-y-1">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">₹999</span>
              <span className="text-muted text-sm pb-1">/mo</span>
            </div>
            <div className="text-sm text-muted opacity-0 select-none">Spacer</div>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="21 AI Thumbnails per week" />
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="A/B Testing Mode (3 Variants per run)" />
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="Everything in Pro" />
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="Priority Generation Queue" />
          </div>

          <UpgradeButton tier="elite" className="w-full text-sm uppercase tracking-widest font-bold bg-charcoal border border-purple-500/30 text-purple-400 py-4 rounded-xl hover:bg-purple-500/10 transition-all group-hover:border-purple-500 flex items-center justify-center">
            Get Kinetic Elite
          </UpgradeButton>
        </div>

      </div>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <span className="text-off-white text-sm">{text}</span>
    </div>
  );
}

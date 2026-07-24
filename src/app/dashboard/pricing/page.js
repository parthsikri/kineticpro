"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Shield, Crown } from "lucide-react";
import UpgradeButton from "../UpgradeButton";

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [interval, setIntervalState] = useState("monthly");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data.success && data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const isActive = user?.subscriptionStatus === "active";
  const currentTier = isActive ? user?.subscriptionTier : "free";

  // Tier checkers
  const isPro = currentTier === "pro";
  const isElite = currentTier === "elite";
  const isInfinity = currentTier === "infinity";

  const getButtonState = (tierName) => {
    if (currentTier === tierName) return { disabled: true, text: "Current Plan" };
    
    const hierarchy = { free: 0, pro: 1, elite: 2, infinity: 3 };
    if (hierarchy[currentTier] > hierarchy[tierName]) {
      return { disabled: true, text: "Included in Current Plan" };
    }
    
    return { disabled: false, text: `Upgrade to ${tierName.charAt(0).toUpperCase() + tierName.slice(1)}` };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-20">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Upgrade your <span className="text-gold font-serif italic font-normal">Kinetic</span> power.
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto px-4">
          Choose the plan that fits your channel&apos;s growth. Stop wasting hours on Photoshop and start generating high-CTR thumbnails instantly.
        </p>

        {/* Interval Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-semibold transition-colors ${interval === "monthly" ? "text-white" : "text-muted"}`}>Monthly</span>
          <button 
            onClick={() => setIntervalState(interval === "monthly" ? "yearly" : "monthly")}
            className="w-14 h-7 rounded-full bg-charcoal border border-border relative flex items-center px-1 transition-colors hover:border-gold/50"
          >
            <div className={`w-5 h-5 rounded-full bg-gold transition-transform ${interval === "yearly" ? "translate-x-7" : "translate-x-0"}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors flex items-center gap-2 ${interval === "yearly" ? "text-white" : "text-muted"}`}>
            Yearly <span className="text-[10px] bg-gold text-black px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Save up to 30%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 items-stretch">
        
        {/* Pro Plan */}
        <div className="p-6 sm:p-8 rounded-3xl bg-charcoal border border-white/10 flex flex-col hover:border-white/30 transition-colors group relative">
          <div className="mb-6 mt-2">
            <h3 className="text-2xl font-bold text-white mb-2">Kinetic Pro</h3>
            <p className="text-sm text-muted">Perfect for creators uploading 1-2 videos a week.</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="text-sm text-muted line-through decoration-red-500/50">
                ₹{interval === "monthly" ? "399" : "3,999"}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">₹{interval === "monthly" ? "199" : "1,499"}</span>
                <span className="text-muted text-sm pb-1">/{interval === "monthly" ? "mo" : "yr"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <Feature icon={<Check className="text-white w-5 h-5" />} text="10 AI Thumbnails per month" />
            <Feature icon={<Zap className="text-white w-5 h-5" />} text="Standard Quality Export" />
            <Feature icon={<Shield className="text-white w-5 h-5" />} text="Perfect Face Preservation" />
            <Feature icon={<Check className="text-white w-5 h-5" />} text="High CTR Format Library" />
          </div>

          {getButtonState("pro").disabled ? (
            <button disabled className="w-full text-sm uppercase tracking-widest font-bold bg-white/5 border border-white/10 text-white/50 py-4 rounded-xl cursor-not-allowed flex items-center justify-center">
              {getButtonState("pro").text}
            </button>
          ) : (
            <UpgradeButton tier="pro" interval={interval} className="w-full text-sm uppercase tracking-widest font-bold bg-white/10 border border-white/20 text-white py-4 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center">
              {getButtonState("pro").text}
            </UpgradeButton>
          )}
        </div>

        {/* Elite Plan */}
        <div className="p-6 sm:p-8 rounded-3xl bg-charcoal border-2 border-gold flex flex-col relative shadow-[0_0_30px_rgba(207,161,95,0.15)] transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gold text-black text-[10px] uppercase font-black tracking-widest py-1 px-4 rounded-b-xl shadow-lg whitespace-nowrap">
            Most Popular
          </div>

          <div className="mb-6 mt-4">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <h3 className="text-2xl font-bold text-gold">Kinetic Elite</h3>
            </div>
            <p className="text-sm text-muted">For serious agencies and daily uploaders.</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="text-sm text-muted line-through decoration-red-500/50">
                ₹{interval === "monthly" ? "599" : "5,999"}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">₹{interval === "monthly" ? "299" : "1,999"}</span>
                <span className="text-muted text-sm pb-1">/{interval === "monthly" ? "mo" : "yr"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <Feature icon={<Check className="text-gold w-5 h-5" />} text="30 AI Thumbnails per month" />
            <Feature icon={<Check className="text-gold w-5 h-5" />} text="A/B Testing Mode (2 Variants per run)" />
            <Feature icon={<Check className="text-gold w-5 h-5" />} text="Maximum Impact SEO Generator" />
            <Feature icon={<Check className="text-gold w-5 h-5" />} text="Auto-Scrape Related Videos/Playlists" />
            <Feature icon={<Check className="text-gold w-5 h-5" />} text="Everything in Pro" />
          </div>

          {getButtonState("elite").disabled ? (
            <button disabled className="w-full text-sm uppercase tracking-widest font-bold bg-white/5 border border-white/10 text-white/50 py-4 rounded-xl cursor-not-allowed flex items-center justify-center">
              {getButtonState("elite").text}
            </button>
          ) : (
            <UpgradeButton tier="elite" interval={interval} className="w-full text-sm uppercase tracking-widest font-bold bg-gold text-black py-4 rounded-xl hover:bg-gold-hover transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(207,161,95,0.3)] flex items-center justify-center">
              {getButtonState("elite").text}
            </UpgradeButton>
          )}
        </div>

        {/* Infinity Plan */}
        <div className="p-6 sm:p-8 rounded-3xl bg-charcoal border border-purple-500/50 flex flex-col hover:border-purple-500 transition-colors group relative shadow-2xl shadow-purple-500/5">
          <div className="mb-6 mt-2">
            <div className="inline-flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">Kinetic Infinity</h3>
            </div>
            <p className="text-sm text-muted">The ultimate unrestricted powerhouse.</p>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="text-sm text-muted line-through decoration-red-500/50">
                ₹{interval === "monthly" ? "799" : "7,999"}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">₹{interval === "monthly" ? "399" : "3,499"}</span>
                <span className="text-muted text-sm pb-1">/{interval === "monthly" ? "mo" : "yr"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="90 AI Thumbnails per month" />
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="Premium Quality Export (Best Model)" />
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="Automatic Chapter Maker (SEO)" />
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="A/B Testing Mode (3 Variants per run)" />
            <Feature icon={<Check className="text-purple-400 w-5 h-5" />} text="Everything in Elite" />
          </div>

          {getButtonState("infinity").disabled ? (
            <button disabled className="w-full text-sm uppercase tracking-widest font-bold bg-white/5 border border-white/10 text-white/50 py-4 rounded-xl cursor-not-allowed flex items-center justify-center">
              {getButtonState("infinity").text}
            </button>
          ) : (
            <UpgradeButton tier="infinity" interval={interval} className="w-full text-sm uppercase tracking-widest font-bold bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-500 transition-all flex items-center justify-center shadow-lg shadow-purple-600/30">
              {getButtonState("infinity").text}
            </UpgradeButton>
          )}
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

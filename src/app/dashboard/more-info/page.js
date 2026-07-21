"use client";

import React, { useState, useEffect } from "react";
import { Info, CheckCircle2, Sparkles, UserCheck, Video, GraduationCap, Laptop, Gamepad2, TrendingUp, Dumbbell, Save } from "lucide-react";

const CREATOR_TYPES = [
  {
    id: "education",
    title: "Education & EdTech",
    icon: GraduationCap,
    badge: "Physics Wallah & Exam Style",
    desc: "Optimized for exam updates, lectures, RGPV/university courses, Hinglish notice cards, and high-impact academic headlines.",
    color: "from-blue-600/20 to-blue-900/10 border-blue-500/30",
    accent: "text-blue-400",
  },
  {
    id: "vlogs",
    title: "Daily Vlogs & Lifestyle",
    icon: Video,
    badge: "Flying Beast & Story Style",
    desc: "Candid emotional expressions, real-world travel/family backgrounds, story props, location badges, and curiosity headlines.",
    color: "from-amber-600/20 to-orange-900/10 border-amber-500/30",
    accent: "text-amber-400",
  },
  {
    id: "tech",
    title: "Tech & Gadgets",
    icon: Laptop,
    badge: "Unboxing & Review Style",
    desc: "Neon dark accents, high-contrast device showcases, spec highlights, comparison callouts, and sleek tech typography.",
    color: "from-cyan-600/20 to-teal-900/10 border-cyan-500/30",
    accent: "text-cyan-400",
  },
  {
    id: "gaming",
    title: "Gaming & Esports",
    icon: Gamepad2,
    badge: "CarryMinati & Stream Style",
    desc: "High-energy reactions, glowing neon highlights, win/fail badges, epic moment callouts, and dramatic gaming atmospheres.",
    color: "from-purple-600/20 to-pink-900/10 border-purple-500/30",
    accent: "text-purple-400",
  },
  {
    id: "finance",
    title: "Finance & Business",
    icon: TrendingUp,
    badge: "Stock Market & Case Study",
    desc: "Clean professional aesthetic, chart trend popups, profit/loss badges, bold money callouts, and authoritative poses.",
    color: "from-emerald-600/20 to-green-900/10 border-emerald-500/30",
    accent: "text-emerald-400",
  },
  {
    id: "fitness",
    title: "Fitness & Health",
    icon: Dumbbell,
    badge: "Workout & Transformation",
    desc: "High-intensity athletic lighting, before/after badges, workout props, transformation banners, and motivational headlines.",
    color: "from-red-600/20 to-rose-900/10 border-red-500/30",
    accent: "text-rose-400",
  },
];

export default function MoreInfoPage() {
  const [selectedType, setSelectedType] = useState("education");
  const [savedType, setSavedType]       = useState("education");
  const [saving, setSaving]             = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading]           = useState(true);

  // Load initial creator type from DB / LocalStorage
  useEffect(() => {
    const fetchCreatorType = async () => {
      try {
        const local = localStorage.getItem("kinetic_creator_type");
        if (local) {
          setSelectedType(local);
          setSavedType(local);
        }

        const res = await fetch("/api/user/creator-type");
        const data = await res.json();
        if (data.success && data.creatorType) {
          setSelectedType(data.creatorType);
          setSavedType(data.creatorType);
          localStorage.setItem("kinetic_creator_type", data.creatorType);
        }
      } catch (err) {
        console.error("Failed to load creator profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorType();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      // Save locally instantly
      localStorage.setItem("kinetic_creator_type", selectedType);

      // Save to backend DB
      const res = await fetch("/api/user/creator-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorType: selectedType }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedType(selectedType);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        // Fallback: local save succeeded
        setSavedType(selectedType);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving creator type:", err);
      setSavedType(selectedType);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const activeModule = CREATOR_TYPES.find(t => t.id === savedType) || CREATOR_TYPES[0];

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Info className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              More Info <span className="text-xs bg-gold/10 text-gold border border-gold/20 py-0.5 px-2.5 rounded-full font-normal">Creator Profile</span>
            </h1>
            <p className="text-sm text-muted">Select your primary creator category to configure your kinetic AI strategy module.</p>
          </div>
        </div>
      </div>

      {/* Active Profile Status */}
      <div className="bg-charcoal border border-gold/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold font-semibold">Active Creator Category</p>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                {activeModule.title}
                <span className="text-[10px] bg-white/10 text-muted px-2 py-0.5 rounded-md font-medium">
                  {activeModule.badge}
                </span>
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Saved once for your account</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Category Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" /> Choose Your Creator Type
          </h2>
          <span className="text-xs text-muted">Select once · Change anytime</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CREATOR_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            const isSaved = savedType === type.id;

            return (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative bg-gradient-to-br ${type.color} ${
                  isSelected
                    ? "border-gold ring-2 ring-gold/30 shadow-lg shadow-gold/5"
                    : "border-border hover:border-white/20 bg-charcoal"
                }`}
              >
                {isSaved && (
                  <span className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Saved
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${type.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 pr-12">
                    <h3 className="text-base font-semibold text-white">{type.title}</h3>
                    <p className="text-[11px] text-gold/80 font-medium">{type.badge}</p>
                    <p className="text-xs text-muted leading-relaxed font-light pt-1">{type.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Action */}
      <div className="bg-dark-gray border border-border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Save Your Category Selection</p>
          <p className="text-xs text-muted">This sets your primary channel profile so Kinetic AI tunes strategies automatically.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="premium-btn py-3 px-8 text-xs flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-black" /> Saved Successfully!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Creator Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}

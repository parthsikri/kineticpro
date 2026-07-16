"use client";

import React, { useState, useRef } from "react";
import { Sparkles, Upload, X, Palette, Video } from "lucide-react";
import AssetSelector from "./AssetSelector";

const COLOR_PRESETS = [
  { id: "royal-blue",  hex: "#1a3fd4", label: "Blue"   },
  { id: "dark-navy",   hex: "#0a0a2e", label: "Navy"   },
  { id: "crimson",     hex: "#c0051e", label: "Red"    },
  { id: "purple",      hex: "#6b21a8", label: "Purple" },
  { id: "dark-green",  hex: "#064e3b", label: "Green"  },
  { id: "orange",      hex: "#c2410c", label: "Orange" },
  { id: "amber",       hex: "#b45309", label: "Gold"   },
  { id: "charcoal",    hex: "#111827", label: "Dark"   },
  { id: "custom",      hex: null,      label: "+"      },
];

export default function ThumbnailForm({ onSubmit, loading }) {
  const [photos, setPhotos]                 = useState([]); // Array of { id, preview, base64 }
  const [brandColor, setBrandColor]         = useState("#1a3fd4");
  const [highlightColor, setHighlightColor] = useState("#f5d800");
  const [colorPreset, setColorPreset]       = useState("royal-blue");
  const [customColor, setCustomColor]       = useState("#1a3fd4");
  const [videoTopic, setVideoTopic]         = useState("");
  const [poseMode, setPoseMode]             = useState("ai"); // "same" | "ai"
  const [dragging, setDragging]             = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const fileRef = useRef(null);

  /* ── file handling ─────────────────────────────────────────── */
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (photos.length >= 3) {
      alert("You can only add up to 3 people.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos(prev => [...prev, { id: Date.now(), preview: reader.result, base64: reader.result }]);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  /* ── color logic ────────────────────────────────────────────── */
  const getRecommendedHighlight = (hex) => {
    if (!hex) return "#f5d800";
    if (hex.indexOf('#') === 0) hex = hex.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    let r = parseInt(hex.slice(0, 2), 16) / 255;
    let g = parseInt(hex.slice(2, 4), 16) / 255;
    let b = parseInt(hex.slice(4, 6), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    // Invert hue and boost saturation/lightness for a good highlight
    h = (h + 0.5) % 1;
    s = Math.min(1, s + 0.4);
    l = Math.max(0.5, Math.min(0.8, l));
    
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let rNew = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    let gNew = Math.round(hue2rgb(p, q, h) * 255);
    let bNew = Math.round(hue2rgb(p, q, h - 1/3) * 255);
    return "#" + (1 << 24 | rNew << 16 | gNew << 8 | bNew).toString(16).slice(1).toUpperCase();
  };

  const handleColorPreset = (preset) => {
    setColorPreset(preset.id);
    if (preset.id !== "custom") setBrandColor(preset.hex);
  };

  /* ── submit ─────────────────────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!videoTopic.trim()) return;
    const subjectPhotos = photos.map(p => p.base64);
    onSubmit({ videoTopic, brandColor, highlightColor, subjectPhotos, poseMode });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-fadeIn">
      <div className="premium-card space-y-7">

        {/* ── Topic ────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="premium-label flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-gold" />
            What is your video about?
          </label>
          <textarea
            required
            rows={4}
            value={videoTopic}
            onChange={e => setVideoTopic(e.target.value)}
            placeholder="e.g. RGPV Maths-II exam postponed from 1st August 2024 — important update for B.Tech students&#10;&#10;AI will automatically decide the headline text, badges, banner, overlays and thumbnail style."
            className="premium-textarea resize-none text-base leading-relaxed"
          />
          <p className="text-[10px] text-muted tracking-wide">
            Just describe your video — AI handles everything else (title, overlays, style, layout)
          </p>
        </div>

        {/* ── Photo upload ─────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="premium-label">
              Subject Photos
              <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">
                Add up to 3 people (Host, Guest, etc.)
              </span>
            </label>
            <span className="text-xs text-muted font-medium">{photos.length}/3 added</span>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl transition-all duration-300 min-h-[172px] flex flex-col items-center justify-center overflow-hidden p-4
              ${dragging ? "border-gold bg-gold/5 cursor-copy"
                : photos.length >= 3 ? "border-border cursor-default"
                : "border-border hover:border-gold/50"}`}
          >
            {photos.length > 0 ? (
              <div className="w-full space-y-4">
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border border-white/10 shadow-lg group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.preview} alt="Subject" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setPhotos(prev => prev.filter(p => p.id !== photo.id)); }}
                        className="absolute top-2 right-2 bg-black/80 border border-border rounded-full p-1.5 hover:text-white hover:bg-red-500/20 text-muted z-10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  {photos.length < 3 && (
                    <button type="button" onClick={e => { e.stopPropagation(); setShowAssetModal(true); }}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-lg border-2 border-dashed border-border hover:border-gold/50 flex flex-col items-center justify-center text-muted hover:text-gold transition-colors">
                      <span className="text-2xl font-light mb-1">+</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold">Add Person</span>
                    </button>
                  )}
                </div>

                {/* Pose preference overlay - applies to all */}
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Group Pose:</span>
                  {[
                    { id: "ai",   label: "AI picks best" },
                    { id: "same", label: "Keep poses"  },
                  ].map(p => (
                    <button key={p.id} type="button"
                      onClick={e => { e.stopPropagation(); setPoseMode(p.id); }}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase border transition-all ${
                        poseMode === p.id
                          ? "bg-gold text-black border-gold"
                          : "border-white/20 text-muted bg-black/30 hover:border-white/50"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-10 cursor-pointer" onClick={e => { e.stopPropagation(); setShowAssetModal(true); }}>
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-charcoal border border-border flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted" />
                </div>
                <p className="text-sm font-semibold text-off-white">Click to Select or Upload Photos</p>
                <p className="text-xs text-muted mt-1.5">JPG PNG (Up to 3 people)</p>
                <p className="text-[10px] text-gold/80 mt-3 font-medium">
                  ✓ Upload via the library to save for reuse
                </p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*"
              onChange={e => { handleFile(e.target.files[0]); e.target.value = null; }} className="hidden" />
          </div>
          
          {/* Asset Modal Overlay */}
          {showAssetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-charcoal border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-white">Select Subject Photo</h3>
                  <button type="button" onClick={() => setShowAssetModal(false)} className="text-muted hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <AssetSelector 
                    onSelect={(base64) => {
                      setPhotos(prev => [...prev, { id: Date.now(), preview: base64, base64: base64 }]);
                      setShowAssetModal(false);
                    }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Brand color ───────────────────────────────────────── */}
        <div className="space-y-3">
          <label className="premium-label flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-gold" />
            Brand / Channel Color
          </label>

          <div className="flex flex-wrap gap-3">
            {COLOR_PRESETS.map(p => (
              <button key={p.id} type="button" onClick={() => handleColorPreset(p)} title={p.label}
                className="flex flex-col items-center gap-1 group transition-transform hover:-translate-y-0.5">
                <div className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center
                  ${colorPreset === p.id ? "border-gold ring-2 ring-gold/30 scale-110" : "border-white/10 hover:border-white/30"}`}
                  style={p.hex
                    ? { background: p.hex }
                    : { background: "conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}>
                  {p.id === "custom" && <span className="text-white font-bold text-sm drop-shadow">+</span>}
                </div>
                <span className={`text-[9px] font-semibold tracking-wide ${colorPreset === p.id ? "text-gold" : "text-muted"}`}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          {colorPreset === "custom" && (
            <div className="flex items-center gap-3 bg-dark-gray border border-border rounded-lg p-3 mt-1 animate-fadeIn">
              <input type="color" value={customColor}
                onChange={e => { setCustomColor(e.target.value); setBrandColor(e.target.value); }}
                className="w-12 h-8 rounded border-0 bg-transparent cursor-pointer" />
              <span className="text-xs font-mono text-off-white">{customColor.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* ── Highlight color ─────────────────────────────────────── */}
        <div className="space-y-3">
          <label className="premium-label flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            Highlight Color
            <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">
              For badges and text highlights
            </span>
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-dark-gray border border-border rounded-lg p-2 px-3">
              <input type="color" value={highlightColor}
                onChange={e => setHighlightColor(e.target.value)}
                className="w-10 h-8 rounded border-0 bg-transparent cursor-pointer" />
              <span className="text-xs font-mono text-off-white">{highlightColor.toUpperCase()}</span>
            </div>

            <button 
              type="button" 
              onClick={() => setHighlightColor(getRecommendedHighlight(brandColor))}
              className="flex items-center gap-2 px-3 py-2 bg-black/40 border border-white/10 hover:border-gold/50 hover:bg-gold/5 transition-colors rounded-lg group"
            >
              <div 
                className="w-4 h-4 rounded-full border border-white/20" 
                style={{ backgroundColor: getRecommendedHighlight(brandColor) }}
              />
              <span className="text-xs text-muted group-hover:text-gold transition-colors">Use Recommended</span>
            </button>
          </div>
        </div>

        {/* ── Submit ────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={loading || !videoTopic.trim()}
          className="premium-btn w-full py-4 text-sm tracking-[0.18em] relative overflow-hidden group"
        >
          {/* shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
          {loading ? (
            <><div className="loader mr-2" />AI is crafting your thumbnail...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />GENERATE MY THUMBNAIL</>
          )}
        </button>

      </div>
    </form>
  );
}

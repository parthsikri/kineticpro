"use client";

import React, { useState, useRef } from "react";
import { Sparkles, Upload, X, Palette, Video, Camera, CheckCircle2, Info, UserCheck, HelpCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
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
  const [uploadMode, setUploadMode]         = useState("3d-face"); // "3d-face" | "multi-person"
  const [faceSlots, setFaceSlots]           = useState({ front: null, left: null, right: null });
  const [photos, setPhotos]                 = useState([]); // Array of { id, preview, base64 } for multi-person mode
  const [brandColor, setBrandColor]         = useState("#1a3fd4");
  const [highlightColor, setHighlightColor] = useState("#f5d800");
  const [colorPreset, setColorPreset]       = useState("royal-blue");
  const [customColor, setCustomColor]       = useState("#1a3fd4");
  const [videoTopic, setVideoTopic]         = useState("");
  const [poseMode, setPoseMode]             = useState("ai"); // "same" | "ai"
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [activeSlot, setActiveSlot]         = useState("front"); // "front" | "left" | "right" | "custom"
  const [showExpectations, setShowExpectations] = useState(true);

  const fileRef = useRef(null);

  /* ── File Upload to Slot ─────────────────────────────────────── */
  const handleSlotFile = (file, slotKey) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = { preview: reader.result, base64: reader.result };
      if (uploadMode === "3d-face") {
        setFaceSlots(prev => ({ ...prev, [slotKey]: data }));
      } else {
        if (photos.length >= 3) {
          alert("You can only add up to 3 people.");
          return;
        }
        setPhotos(prev => [...prev, { id: Date.now(), preview: reader.result, base64: reader.result }]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSlotAssetSelect = (base64) => {
    const data = { preview: base64, base64: base64 };
    if (uploadMode === "3d-face" && activeSlot) {
      setFaceSlots(prev => ({ ...prev, [activeSlot]: data }));
    } else {
      if (photos.length < 3) {
        setPhotos(prev => [...prev, { id: Date.now(), preview: base64, base64: base64 }]);
      }
    }
    setShowAssetModal(false);
  };

  const removeSlotPhoto = (slotKey) => {
    setFaceSlots(prev => ({ ...prev, [slotKey]: null }));
  };

  /* ── Color calculation ────────────────────────────────────────── */
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
      h = s = 0;
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

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!videoTopic.trim()) return;

    let subjectPhotos = [];
    if (uploadMode === "3d-face") {
      subjectPhotos = [faceSlots.front?.base64, faceSlots.left?.base64, faceSlots.right?.base64].filter(Boolean);
    } else {
      subjectPhotos = photos.map(p => p.base64);
    }

    onSubmit({ videoTopic, brandColor, highlightColor, subjectPhotos, poseMode });
  };

  const totalFaceCount = uploadMode === "3d-face"
    ? [faceSlots.front, faceSlots.left, faceSlots.right].filter(Boolean).length
    : photos.length;

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

        {/* ── Photo upload & 3D Face Trainer ─────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <label className="premium-label flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-gold" />
                Subject Photo Training
              </label>
              <p className="text-[11px] text-muted font-light">
                Train AI with your face angles for 100% accurate thumbnail generation
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 shrink-0">
              <button
                type="button"
                onClick={() => setUploadMode("3d-face")}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  uploadMode === "3d-face" ? "bg-gold text-black shadow-md shadow-gold/20" : "text-muted hover:text-white"
                }`}
              >
                <UserCheck className="w-3 h-3" /> 3-Angle Face Trainer
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("multi-person")}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  uploadMode === "multi-person" ? "bg-gold text-black shadow-md shadow-gold/20" : "text-muted hover:text-white"
                }`}
              >
                👥 Multi-Person
              </button>
            </div>
          </div>

          {/* ── WHAT DO WE EXPECT? GUIDANCE CARD ────────────────── */}
          {uploadMode === "3d-face" && (
            <div className="bg-charcoal border border-gold/30 rounded-2xl p-4 md:p-5 space-y-4 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      What Do We Expect?
                      <span className="text-[9px] bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded-full font-normal">
                        3D Face Precision
                      </span>
                    </h4>
                    <p className="text-[10px] text-muted">Upload 3 different angles of the <strong>same creator</strong> for perfect facial likeness.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExpectations(!showExpectations)}
                  className="text-xs text-muted hover:text-gold flex items-center gap-1 transition-colors"
                >
                  {showExpectations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showExpectations && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-white/5 animate-fadeIn">
                  {/* Sample 1: Front */}
                  <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-center space-y-2 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl font-bold shadow-inner">
                      👤
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Angle 1</span>
                      <p className="text-xs font-bold text-white mt-0.5">Front View</p>
                      <p className="text-[10px] text-muted font-light mt-1 leading-tight">
                        Direct eye contact, facing camera straight with clear lighting
                      </p>
                    </div>
                  </div>

                  {/* Sample 2: Left Side */}
                  <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-center space-y-2 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-bold shadow-inner">
                      👈
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Angle 2</span>
                      <p className="text-xs font-bold text-white mt-0.5">Left Side Profile</p>
                      <p className="text-[10px] text-muted font-light mt-1 leading-tight">
                        Head turned ~35° to the left, showing left jaw &amp; cheek
                      </p>
                    </div>
                  </div>

                  {/* Sample 3: Right Side */}
                  <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-center space-y-2 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-2xl font-bold shadow-inner">
                      👉
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Angle 3</span>
                      <p className="text-xs font-bold text-white mt-0.5">Right Side Profile</p>
                      <p className="text-[10px] text-muted font-light mt-1 leading-tight">
                        Head turned ~35° to the right, showing right jaw &amp; cheek
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 3-SLOTS FACE UPLOADER GRID ──────────────────────── */}
          {uploadMode === "3d-face" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "front", title: "1. Front View", icon: "👤", desc: "Facing Camera", color: "border-blue-500/30 text-blue-400" },
                { key: "left",  title: "2. Left Angle", icon: "👈", desc: "Turned Left ~35°", color: "border-amber-500/30 text-amber-400" },
                { key: "right", title: "3. Right Angle", icon: "👉", desc: "Turned Right ~35°", color: "border-purple-500/30 text-purple-400" },
              ].map((slot) => {
                const photo = faceSlots[slot.key];

                return (
                  <div
                    key={slot.key}
                    className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 min-h-[170px] flex flex-col items-center justify-center overflow-hidden p-3 bg-charcoal/50 ${
                      photo ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
                    }`}
                  >
                    {photo ? (
                      <div className="w-full h-full flex flex-col items-center justify-between relative group">
                        <div className="w-full h-28 rounded-xl overflow-hidden border border-white/10 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.preview} alt={slot.title} className="w-full h-full object-cover object-top" />
                          <button
                            type="button"
                            onClick={() => removeSlotPhoto(slot.key)}
                            className="absolute top-1.5 right-1.5 bg-black/80 border border-border rounded-full p-1 text-muted hover:text-white hover:bg-red-500/20 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between w-full pt-2">
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {slot.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setActiveSlot(slot.key); setShowAssetModal(true); }}
                            className="text-[9px] text-muted hover:text-gold uppercase font-semibold underline"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 p-2 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full bg-black/40 border flex items-center justify-center text-xl ${slot.color}`}>
                          {slot.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{slot.title}</p>
                          <p className="text-[10px] text-muted">{slot.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSlot(slot.key);
                              fileRef.current?.click();
                            }}
                            className="px-2.5 py-1 bg-white/5 hover:bg-gold/10 border border-white/10 hover:border-gold/40 text-[10px] font-bold text-white hover:text-gold rounded-md transition-all flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" /> Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSlot(slot.key);
                              setShowAssetModal(true);
                            }}
                            className="px-2 py-1 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-[10px] font-bold text-gold rounded-md transition-all"
                          >
                            Library
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── MULTI-PERSON UPLOADER ─────────────────────────── */
            <div className="relative border-2 border-dashed border-border hover:border-gold/50 rounded-2xl p-4 min-h-[170px] flex flex-col items-center justify-center bg-charcoal/50">
              {photos.length > 0 ? (
                <div className="w-full space-y-4">
                  <div className="flex flex-wrap gap-4 justify-center items-center">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden border border-white/10 shadow-lg group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.preview} alt="Subject" className="w-full h-full object-cover object-top" />
                        <button
                          type="button"
                          onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                          className="absolute top-2 right-2 bg-black/80 border border-border rounded-full p-1.5 hover:text-white hover:bg-red-500/20 text-muted transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {photos.length < 3 && (
                      <button
                        type="button"
                        onClick={() => { setActiveSlot("custom"); setShowAssetModal(true); }}
                        className="w-32 h-32 md:w-36 md:h-36 rounded-xl border-2 border-dashed border-border hover:border-gold/50 flex flex-col items-center justify-center text-muted hover:text-gold transition-colors bg-black/30"
                      >
                        <span className="text-2xl font-light mb-1">+</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Add Person</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 cursor-pointer" onClick={() => { setActiveSlot("custom"); setShowAssetModal(true); }}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-charcoal border border-border flex items-center justify-center text-muted">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-white">Click to Select or Upload Photos</p>
                  <p className="text-[10px] text-muted mt-1">Upload photos of up to 3 people (Host, Guest, etc.)</p>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={e => {
              if (e.target.files?.[0]) {
                handleSlotFile(e.target.files[0], activeSlot);
              }
              e.target.value = null;
            }}
            className="hidden"
          />

          {/* Pose Mode Choice */}
          {totalFaceCount > 0 && (
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-white/5 animate-fadeIn">
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Group Pose Preference:</span>
              {[
                { id: "ai",   label: "AI picks dynamic pose" },
                { id: "same", label: "Keep reference pose"  },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPoseMode(p.id)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase border transition-all ${
                    poseMode === p.id
                      ? "bg-gold text-black border-gold shadow-md shadow-gold/10"
                      : "border-white/20 text-muted bg-black/30 hover:border-white/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Asset Selector Modal */}
          {showAssetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-charcoal border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gold" />
                    Select Photo for {uploadMode === "3d-face" ? activeSlot.toUpperCase() + " Angle" : "Subject"}
                  </h3>
                  <button type="button" onClick={() => setShowAssetModal(false)} className="text-muted hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <AssetSelector 
                    onSelect={handleSlotAssetSelect} 
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

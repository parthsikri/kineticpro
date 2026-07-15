"use client";

import React, { useState } from "react";
import { ArrowLeft, Play, TrendingUp, Layout, Image as ImageIcon, Type, Sparkles, ChevronDown } from "lucide-react";

export default function PlanPreview({ plan, onBack, onProceed, loading }) {
  const [showPrompt, setShowPrompt] = useState(false);
  if (!plan) return null;

  return (
    <div className="premium-card space-y-6 animate-fadeIn">
      <div className="border-b border-border pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold serif-font tracking-wide text-gold">
            {plan.conceptTitle || "CTR DESIGN BRIEF"}
          </h2>
          <p className="text-xs text-muted font-light uppercase tracking-widest mt-1">
            Step 2 of 3 · Review Strategy · Kinetic AI Creates Freely
          </p>
        </div>
        <button onClick={onBack} disabled={loading}
          className="premium-btn-secondary py-2 px-3 flex items-center text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Modify
        </button>
      </div>

      {/* CTR Analysis — most important section, shown first */}
      {plan.ctrAnalysis && (
        <div className="bg-gold/8 border border-gold/25 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold flex-shrink-0" />
            <p className="text-[10px] uppercase tracking-widest text-gold font-bold">CTR Psychology · Why This Will Get Clicks</p>
          </div>
          <p className="text-sm text-off-white leading-relaxed font-light">{plan.ctrAnalysis}</p>
        </div>
      )}

      {/* 3 brief cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-gray border border-border/60 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-gold" />
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-muted">Scene & Mood</h3>
          </div>
          <p className="text-sm text-off-white leading-relaxed font-light">{plan.backgroundDescription}</p>
        </div>
        <div className="bg-dark-gray border border-border/60 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gold" />
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-muted">Subject & Composition</h3>
          </div>
          <p className="text-sm text-off-white leading-relaxed font-light">{plan.compositionStrategy || plan.foregroundDescription}</p>
        </div>
        <div className="bg-dark-gray border border-border/60 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-gold" />
            <h3 className="text-[10px] font-bold tracking-wider uppercase text-muted">Text & Overlay Plan</h3>
          </div>
          <p className="text-sm text-off-white leading-relaxed font-light">{plan.textOverlayPlan || plan.textLayout}</p>
        </div>
      </div>

      {/* Creative autonomy notice */}
      <div className="bg-charcoal border border-border/50 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted leading-relaxed font-light">
          <span className="text-gold font-semibold">Creative Autonomy Mode</span> — The AI engine analyzed the CTR psychology above. Kinetic AI will now use its own artistic intelligence to compose the most visually impactful thumbnail it can from this brief. Only 3 hard constraints apply: no text in image, 16:9 widescreen, and negative space on the right for your text overlay.
        </p>
      </div>

      {/* Collapsible full prompt */}
      <div className="bg-dark-gray border border-border rounded-lg overflow-hidden">
        <button type="button" onClick={() => setShowPrompt(!showPrompt)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs font-semibold tracking-wider uppercase text-off-white">Full Prompt Sent to Kinetic AI</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showPrompt ? "rotate-180" : ""}`} />
        </button>
        {showPrompt && (
          <div className="px-4 pb-4 border-t border-border/40">
            <pre className="text-xs text-muted font-mono leading-relaxed select-all whitespace-pre-wrap mt-3 max-h-48 overflow-y-auto">
              {plan.imagePrompt}
            </pre>
          </div>
        )}
      </div>

      {/* Proceed */}
      <div className="border-t border-border pt-4 flex justify-end">
        <button onClick={onProceed} disabled={loading} className="premium-btn w-full md:w-auto px-10 py-3 text-sm">
          {loading ? (
            <><div className="loader mr-2" />Kinetic AI is painting your thumbnail...</>
          ) : (
            <><Play className="w-4 h-4 mr-2 fill-current" />GENERATE THUMBNAIL</>
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Download, RefreshCw, PlusCircle, TrendingUp } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   ImageResult — shows the COMPLETE AI-generated thumbnail.
   Kinetic AI bakes ALL text (headline, badge, banner, alert card,
   date callout) directly into the image — nothing is added here.
   ════════════════════════════════════════════════════════════════════ */
export default function ImageResult({ imageUrls = [], onRecreate, onNew, plan, brandColor = "#1a3fd4" }) {
  const [downloading, setDownloading] = useState(false);

  /* ── Direct download — the AI image IS the final thumbnail ─────── */
  const handleDownload = async (url) => {
    try {
      setDownloading(true);

      // If url is already a data URI (base64), download directly
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href     = url;
        link.download = `kineticpro_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Otherwise fetch it to ensure we get the full image
      const res    = await fetch(url);
      const blob   = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link   = document.createElement("a");
      link.href     = objectUrl;
      link.download = `kineticpro_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open in new tab
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const oc = plan?.overlayConfig || {};

  return (
    <div className="premium-card space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="border-b border-border pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold serif-font tracking-wide text-gold">PRODUCTION READY</h2>
          <p className="text-xs text-muted font-light uppercase tracking-widest mt-1">
            {plan?.conceptTitle || "AI-Generated Thumbnail"} · Full image from Kinetic AI
          </p>
        </div>
        <button onClick={onNew} className="premium-btn-secondary py-2 px-3 flex items-center text-xs">
          <PlusCircle className="w-3.5 h-3.5 mr-1" /> New
        </button>
      </div>

      {/* ── Thumbnails — pure AI output, no browser overlays ─────────── */}
      <div className={`grid gap-6 ${imageUrls.length > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {imageUrls.map((url, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="relative group overflow-hidden rounded-xl border border-border bg-dark-gray shadow-2xl hover:border-gold/30 transition-all duration-500">
              <div className="w-full aspect-video relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`AI-Generated Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.012]"
                />
                {/* Subtle hover watermark */}
                <div className="absolute bottom-2 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <span className="text-[9px] text-white/40 font-light tracking-wide">
                    Kinetic AI · KineticPro · 1792×1024
                  </span>
                </div>
              </div>
            </div>
            
            <button onClick={() => handleDownload(url)} disabled={downloading}
              className="premium-btn w-full py-2.5 text-xs flex justify-center items-center">
              {downloading
                ? <><div className="loader mr-2 w-3 h-3" />Downloading...</>
                : <><Download className="w-3.5 h-3.5 mr-1" />Download {imageUrls.length > 1 ? `Option ${index + 1}` : ''}</>
              }
            </button>
          </div>
        ))}
      </div>

      {/* CTR Analysis */}
      {plan?.ctrAnalysis && (
        <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 flex gap-3">
          <TrendingUp className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gold font-semibold mb-1.5">
              Why This Gets Clicks
            </p>
            <p className="text-sm text-off-white/80 font-light leading-relaxed">
              {plan.ctrAnalysis}
            </p>
          </div>
        </div>
      )}

      {/* What the AI included */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Headline",  value: [oc.headline1, oc.headline2].filter(Boolean).join(" / ") || "—" },
          { label: "Badge",     value: oc.topBadge || "—" },
          { label: "Banner",    value: oc.bannerText ? oc.bannerText.slice(0, 30) + "…" : "—" },
          { label: "Alert Card", value: oc.showAlertCard ? oc.alertTitle || "Yes" : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-dark-gray border border-border/60 rounded-lg p-3">
            <p className="text-[9px] uppercase tracking-widest text-muted mb-1">{label}</p>
            <p className="text-xs font-semibold text-gold truncate" title={value}>{value}</p>
          </div>
        ))}
      </div>

      {/* Footer controls */}
      <div className="bg-dark-gray/50 border border-border/50 rounded-lg p-4 flex flex-col md:flex-row
        justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted">Strategy</p>
          <p className="text-sm font-medium text-off-white mt-0.5">
            {plan?.conceptTitle || "AI-Generated Thumbnail"}
          </p>
          <p className="text-[10px] text-muted mt-0.5">{plan?.compositionStrategy}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={onRecreate} className="premium-btn-secondary flex-1 md:flex-none justify-center">
            <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

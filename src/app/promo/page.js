"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

// Using the generated thumbnails found in public/demo-thumbs/ (tracked by git)
const THUMBNAILS = [
  "/demo-thumbs/thumb_1784128050347_m876rt.png",
  "/demo-thumbs/thumb_1784128050406_c7w9wh.png",
  "/demo-thumbs/thumb_1784128050430_1xyyk5.png",
  "/demo-thumbs/thumb_1784128244614_kaw78v.png",
  "/demo-thumbs/thumb_1784128244640_f4w110e.png",
  "/demo-thumbs/thumb_1784128244686_vq58hn.png",
];

export default function PromoPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-center">
      
      {/* Background Animated Diagonal Marquee */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
        
        {/* Masking gradient so the edges fade to black smoothly */}
        <div 
          className="absolute inset-0 z-10" 
          style={{ 
            background: 'radial-gradient(circle at center, transparent 0%, black 75%)' 
          }} 
        />

        {/* Tilted Wrapper for Marquee */}
        <div 
          className="flex flex-col gap-4 sm:gap-6 w-[150vw] sm:w-[120vw] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: "translate(-50%, -50%) rotate(-12deg) scale(1.15)" }}
        >
          
          {/* Row 1 - Scrolling Left */}
          <div className="flex w-fit gap-4 sm:gap-6 animate-scroll-left">
            {[...THUMBNAILS, ...THUMBNAILS, ...THUMBNAILS].map((src, idx) => (
              <div key={`r1-${idx}`} className="w-[280px] sm:w-[400px] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={src} alt="Thumbnail" className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>

          {/* Row 2 - Scrolling Right */}
          <div className="flex w-fit gap-4 sm:gap-6 animate-scroll-right">
            {[...THUMBNAILS, ...THUMBNAILS, ...THUMBNAILS].reverse().map((src, idx) => (
              <div key={`r2-${idx}`} className="w-[280px] sm:w-[400px] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={src} alt="Thumbnail" className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>

          {/* Row 3 - Scrolling Left */}
          <div className="flex w-fit gap-4 sm:gap-6 animate-scroll-left">
            {[...THUMBNAILS, ...THUMBNAILS, ...THUMBNAILS].map((src, idx) => (
              <div key={`r3-${idx}`} className="w-[280px] sm:w-[400px] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={src} alt="Thumbnail" className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(207,161,95,0.2)]">
          <Sparkles className="w-4 h-4" />
          <span>The #1 AI Engine for Creators</span>
        </div>
        
        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl">
          Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-300 font-serif italic font-normal">Million-View</span><br />Thumbnails instantly.
        </h1>
        
        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-off-white font-medium max-w-2xl mx-auto mb-10 px-2 drop-shadow-lg leading-relaxed">
          Stop wasting hours editing or paying expensive designers. 
          Upload a selfie, describe your video, and let AI craft high-converting, viral thumbnails in seconds.
        </p>
        
        {/* Feature Checkmarks */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12 text-sm text-white/90">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" /> Exact Face Replication
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" /> Auto-Generated SEO
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" /> 10x Your CTR
          </div>
        </div>

        {/* Plan Comparison Section */}
        <div className="w-full max-w-6xl mx-auto mt-24 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">Choose your Kinetic Power.</h2>
            <p className="text-muted text-sm max-w-lg mx-auto">Stop leaving views on the table. Generate unlimited variations until you find the perfect viral thumbnail.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-left">
            
            {/* Pro Plan */}
            <div className="bg-charcoal/50 border border-white/5 rounded-3xl p-8 flex flex-col backdrop-blur-sm group hover:border-white/20 transition-colors">
              <h3 className="text-xl font-bold text-white mb-1">Kinetic Pro</h3>
              <p className="text-muted text-xs mb-6">Perfect for 1-2 videos a week.</p>
              
              <div className="flex items-end gap-2 mb-8">
                <span className="text-lg font-bold text-muted line-through decoration-red-500/50 mb-0.5">₹399</span>
                <span className="text-3xl font-bold text-white">₹199</span>
                <span className="text-muted text-sm pb-1">/ mo</span>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span><strong>10 AI Thumbnails</strong> per month</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span>Standard Quality Export</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <span>Perfect Face Preservation</span>
                </div>
              </div>
              
              <Link href="/register" className="mt-8 w-full block text-center bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm">
                Buy Now
              </Link>
            </div>

            {/* Elite Plan */}
            <div className="bg-gradient-to-b from-charcoal to-black border-2 border-gold/40 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(207,161,95,0.15)] transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full whitespace-nowrap">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-gold mb-1">Kinetic Elite</h3>
              <p className="text-muted text-xs mb-6">For serious daily uploaders.</p>
              
              <div className="flex items-end gap-2 mb-8">
                <span className="text-lg font-bold text-muted line-through decoration-red-500/50 mb-0.5">₹599</span>
                <span className="text-3xl font-bold text-white">₹299</span>
                <span className="text-muted text-sm pb-1">/ mo</span>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span><strong>30 AI Thumbnails</strong> per month</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span>A/B Testing Mode (2 Variants)</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span>Maximum Impact SEO Generator</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span>Auto-Scrape Related Videos</span>
                </div>
              </div>
              
              <Link href="/register" className="mt-8 w-full block text-center bg-gold hover:bg-gold-hover text-black font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(207,161,95,0.4)]">
                Buy Now
              </Link>
            </div>

            {/* Infinity Plan */}
            <div className="bg-charcoal/50 border border-purple-500/30 rounded-3xl p-8 flex flex-col backdrop-blur-sm group hover:border-purple-500 transition-colors shadow-2xl shadow-purple-500/10">
              <h3 className="text-xl font-bold text-purple-400 mb-1">Kinetic Infinity</h3>
              <p className="text-muted text-xs mb-6">The unrestricted powerhouse.</p>
              
              <div className="flex items-end gap-2 mb-8">
                <span className="text-lg font-bold text-muted line-through decoration-red-500/50 mb-0.5">₹799</span>
                <span className="text-3xl font-bold text-white">₹399</span>
                <span className="text-muted text-sm pb-1">/ mo</span>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>90 AI Thumbnails</strong> per month</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Premium Quality Export (Best Model)</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Automatic Chapter Maker (SEO)</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Everything in Elite</span>
                </div>
              </div>

              <Link href="/register" className="mt-8 w-full block text-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-lg shadow-purple-500/20">
                Buy Now
              </Link>
            </div>

          </div>
        </div>

        {/* Call to Action Box */}
        <div className="bg-black/70 border border-white/10 backdrop-blur-xl p-8 rounded-3xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center mt-8">
          <h2 className="text-2xl font-bold text-white mb-2">Unlock Kinetic Pro</h2>
          <p className="text-muted text-sm mb-6">Unleash AI Thumbnails & SEO Generation.</p>
          
          <div className="flex items-end gap-2 mb-8">
            <span className="text-muted text-lg line-through decoration-red-500/50 mb-1">₹399</span>
            <span className="text-5xl font-black text-white">₹199</span>
            <span className="text-muted font-medium mb-1">/ month</span>
          </div>

          <Link 
            href="/register" 
            className="w-full bg-gold hover:bg-gold-hover text-black font-bold py-4 rounded-xl text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(207,161,95,0.4)]"
          >
            Start Creating Now <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-[11px] text-muted mt-4 uppercase tracking-wider font-semibold">
            Cancel anytime · No hidden fees
          </p>
        </div>

      </div>

    </div>
  );
}

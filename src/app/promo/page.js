"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Star, Timer, Zap, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

// Using the generated thumbnails found in public/demo-thumbs/ (tracked by git)
const THUMBNAILS = [
  "/demo-thumbs/thumb_1784128050347_m876rt.png",
  "/demo-thumbs/thumb_1784128050406_c7w9wh.png",
  "/demo-thumbs/thumb_1784128050430_1xyyk5.png",
  "/demo-thumbs/thumb_1784128244614_kaw78v.png",
  "/demo-thumbs/thumb_1784128244640_f4w110e.png",
  "/demo-thumbs/thumb_1784128244686_vq58hn.png",
];

const FAQS = [
  {
    q: "Will the AI thumbnail look exactly like me?",
    a: "Yes. Our advanced Face Preservation technology ensures your facial structure, identity, and emotions are perfectly replicated. It won't look like a generic AI face—it will look exactly like you.",
  },
  {
    q: "Do I own full commercial rights to the thumbnails?",
    a: "100% Yes. You own full commercial rights to every single thumbnail you generate. There are no watermarks, and you can use them on any channel or platform.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. There are no contracts or hidden fees. You can cancel your subscription at any time with a single click from your dashboard.",
  },
  {
    q: "How does the SEO feature work?",
    a: "Our AI analyzes your video's topic or transcript to generate a high-CTR title (under 60 characters), highly indexed tags, a keyword-rich description, and (on Infinity tier) automatic YouTube chapters to maximize retention.",
  }
];

export default function PromoPage() {
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Simple countdown logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col pt-10">
      
      {/* Sticky Urgency Banner */}
      <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-2 px-4 shadow-lg flex items-center justify-center gap-3 sm:gap-6 text-sm font-bold tracking-wide">
        <span className="animate-pulse">🔥 LAUNCH SPECIAL</span>
        <span>Up to 50% OFF All Plans!</span>
        <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full">
          <Timer className="w-4 h-4" />
          <span>{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Background Animated Diagonal Marquee */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
        <div className="absolute inset-0 z-10" style={{ background: 'radial-gradient(circle at center, transparent 0%, black 75%)' }} />
        <div className="flex flex-col gap-4 sm:gap-6 w-[150vw] sm:w-[120vw] absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: "translate(-50%, -50%) rotate(-12deg) scale(1.15)" }}>
          <div className="flex w-fit gap-4 sm:gap-6 animate-scroll-left">
            {[...THUMBNAILS, ...THUMBNAILS, ...THUMBNAILS].map((src, idx) => (
              <div key={`r1-${idx}`} className="w-[280px] sm:w-[400px] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={src} alt="Thumbnail" className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
          <div className="flex w-fit gap-4 sm:gap-6 animate-scroll-right">
            {[...THUMBNAILS, ...THUMBNAILS, ...THUMBNAILS].reverse().map((src, idx) => (
              <div key={`r2-${idx}`} className="w-[280px] sm:w-[400px] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={src} alt="Thumbnail" className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
          <div className="flex w-fit gap-4 sm:gap-6 animate-scroll-left">
            {[...THUMBNAILS, ...THUMBNAILS, ...THUMBNAILS].map((src, idx) => (
              <div key={`r3-${idx}`} className="w-[280px] sm:w-[400px] shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={src} alt="Thumbnail" className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 pt-16 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(207,161,95,0.2)]">
          <Sparkles className="w-4 h-4" />
          <span>The #1 AI Engine for Creators</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl">
          Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-300 font-serif italic font-normal">Million-View</span><br />Thumbnails instantly.
        </h1>
        
        <p className="text-lg sm:text-xl text-off-white font-medium max-w-2xl mx-auto mb-10 px-2 drop-shadow-lg leading-relaxed">
          Stop wasting hours editing or paying expensive designers. 
          Upload a selfie, describe your video, and let AI craft high-converting, viral thumbnails in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12 text-sm text-white/90">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" /> Exact Face Replication</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" /> Auto-Generated SEO</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" /> 10x Your CTR</div>
        </div>
        
        <Link href="#pricing" className="bg-gold hover:bg-gold-hover text-black font-bold py-4 px-10 rounded-xl text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(207,161,95,0.4)]">
          Claim 50% Off Now <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Before & After Section (Problem vs Solution) */}
      <div className="relative z-20 w-full bg-black/80 backdrop-blur-xl border-y border-white/5 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Old Way vs. <span className="text-gold italic font-serif">Kinetic</span></h2>
            <p className="text-muted text-lg max-w-xl mx-auto">See why top creators are abandoning Photoshop.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* The Old Way */}
            <div className="bg-red-950/20 border border-red-500/20 rounded-3xl p-8 flex flex-col">
              <div className="text-red-400 font-bold text-xl mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">✕</div>
                Without Kinetic
              </div>
              <ul className="space-y-4 text-muted">
                <li className="flex gap-3"><span className="text-red-400 mt-1">✗</span> Spending 3+ hours per thumbnail in Photoshop</li>
                <li className="flex gap-3"><span className="text-red-400 mt-1">✗</span> Paying $20-$50 to unreliable freelance designers</li>
                <li className="flex gap-3"><span className="text-red-400 mt-1">✗</span> Guessing which SEO tags will rank your video</li>
                <li className="flex gap-3"><span className="text-red-400 mt-1">✗</span> Getting a 2% CTR because your thumbnail is boring</li>
              </ul>
            </div>

            {/* With Kinetic */}
            <div className="bg-green-950/20 border border-green-500/30 rounded-3xl p-8 flex flex-col shadow-[0_0_30px_rgba(34,197,94,0.1)] transform md:-translate-y-4">
              <div className="text-green-400 font-bold text-xl mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                With Kinetic
              </div>
              <ul className="space-y-4 text-white">
                <li className="flex gap-3"><span className="text-green-400 mt-1">✓</span> Generate 3 stunning variants in under 10 seconds</li>
                <li className="flex gap-3"><span className="text-green-400 mt-1">✓</span> Costs less than a single cup of coffee per month</li>
                <li className="flex gap-3"><span className="text-green-400 mt-1">✓</span> AI generates the exact tags, titles & chapters to rank #1</li>
                <li className="flex gap-3"><span className="text-green-400 mt-1">✓</span> Skyrocket your CTR to 10%+ with viral psychology built-in</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Testimonials */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Trusted by creators who want <span className="text-gold">results.</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Alex H.", subs: "124K Subs", text: "My CTR literally doubled in the first week. I used to spend 2 hours on Photoshop for every video. Now I just type a prompt and get a viral thumbnail instantly." },
            { name: "Sarah M.", subs: "45K Subs", text: "The face preservation is insane. It actually looks exactly like me. Plus, the auto-SEO generator saved me from having to buy VidIQ separately!" },
            { name: "David K.", subs: "890K Subs", text: "As a daily uploader, the Elite tier is a lifesaver. Being able to generate 3 variants and A/B test them has exploded my channel growth this month." }
          ].map((testimonial, i) => (
            <div key={i} className="bg-charcoal/40 border border-white/5 p-6 rounded-2xl flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-gold fill-gold" />)}
              </div>
              <p className="text-white/80 text-sm mb-6 flex-1 italic">&quot;{testimonial.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">{testimonial.name[0]}</div>
                <div>
                  <div className="text-white font-bold text-sm">{testimonial.name}</div>
                  <div className="text-muted text-xs">{testimonial.subs}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section (Anchor target) */}
      <div id="pricing" className="relative z-20 w-full max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Choose your Kinetic Power.</h2>
          <p className="text-muted text-sm max-w-lg mx-auto">Stop leaving views on the table. Generate unlimited variations until you find the perfect viral thumbnail.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch text-left">
          
          {/* Pro Plan */}
          <div className="bg-charcoal/50 border border-white/5 rounded-3xl p-8 flex flex-col backdrop-blur-sm group hover:border-white/20 transition-colors mt-4">
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
          <div className="bg-gradient-to-b from-charcoal to-black border-2 border-gold/40 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(207,161,95,0.15)] z-10">
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
          <div className="bg-charcoal/50 border border-purple-500/30 rounded-3xl p-8 flex flex-col backdrop-blur-sm group hover:border-purple-500 transition-colors shadow-2xl shadow-purple-500/10 mt-4">
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

      {/* FAQ Section */}
      <div className="relative z-20 w-full max-w-3xl mx-auto px-4 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-charcoal/50 border border-white/5 rounded-xl overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-6 py-4 font-bold text-white flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                {faq.q}
                {openFaq === idx ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 text-muted text-sm leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

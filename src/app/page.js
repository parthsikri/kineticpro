"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Zap, Shield, PlayCircle } from "lucide-react";

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center min-h-screen bg-black">
      
      {/* Navigation */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-semibold text-lg tracking-widest uppercase brand-title">
            KINETIC <span className="text-gold font-light">PRO</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-white hover:text-gold transition-colors mr-4">
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-white hover:text-gold transition-colors mr-4">
                Sign In
              </Link>
              <Link href="/register" className="premium-btn py-2 px-6">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 text-center mt-20 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest mb-8 animate-fadeIn">
          <Sparkles className="w-3 h-3" />
          <span>The #1 AI Thumbnail Engine</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
          Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 font-serif italic font-normal">million-view</span> thumbnails in seconds.
        </h1>
        
        <p className="text-lg md:text-xl text-muted font-light max-w-2xl mx-auto mb-12">
          Stop wasting hours on editing software. Describe your video, upload your face, and let our proprietary AI engine craft a high-converting masterpiece.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {loading ? (
            <div className="h-14 w-48 bg-white/5 animate-pulse rounded-lg"></div>
          ) : user ? (
            <Link href="/dashboard" className="premium-btn py-4 px-8 text-sm w-full sm:w-auto">
              Open Dashboard
            </Link>
          ) : (
            <Link href="/register" className="premium-btn py-4 px-8 text-sm w-full sm:w-auto">
              Start Creating Now
            </Link>
          )}
        </div>
        
        <p className="text-xs text-muted mt-6 uppercase tracking-widest font-semibold">
          ₹299/month · Cancel anytime
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-32 mb-20 text-left">
          <div className="p-6 rounded-2xl bg-charcoal border border-border">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
              <Zap className="w-5 h-5 text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted">Generate professional thumbnails in under 10 seconds. Focus on the video, we handle the click.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-charcoal border border-border">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Face Preservation</h3>
            <p className="text-sm text-muted">Our advanced AI engine perfectly retains your facial features, expressions, and likeness.</p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal border border-border">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
              <PlayCircle className="w-5 h-5 text-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">High CTR Formats</h3>
            <p className="text-sm text-muted">Trained on thousands of viral thumbnails across YouTube to ensure maximum Click-Through Rate.</p>
          </div>
        </div>
      </main>
      
      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

    </div>
  );
}

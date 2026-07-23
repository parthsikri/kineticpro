"use client";

import React, { useState } from "react";
import {
  Search, Sparkles, Check, ChevronDown, ChevronUp,
  Clock, AlignLeft, List, Zap,
  TrendingUp, Target, Lightbulb, Globe, Users, FileText, Award
} from "lucide-react";
import SeoResultPanel from "../components/SeoResultPanel";

const LANGUAGES = [
  { value: "Hindi",     label: "हिंदी (Hindi)"     },
  { value: "English",   label: "English"            },
  { value: "Hinglish",  label: "Hinglish (Mix)"     },
  { value: "Marathi",   label: "मराठी (Marathi)"    },
  { value: "Bengali",   label: "বাংলা (Bengali)"    },
  { value: "Tamil",     label: "தமிழ் (Tamil)"      },
  { value: "Telugu",    label: "తెలుగు (Telugu)"    },
];

/* ── generating animation ───────────────────────────────────── */
const GEN_STEPS = [
  { label: "Analysing your video topic…",        icon: Search   },
  { label: "Researching high-volume keywords…",  icon: TrendingUp },
  { label: "Crafting SEO-optimised titles…",     icon: FileText  },
  { label: "Writing power description…",         icon: AlignLeft },
  { label: "Building tag & hashtag library…",    icon: Target    },
  { label: "Generating chapter timestamps…",     icon: Clock     },
  { label: "Scoring your SEO package…",          icon: Award     },
];

function GeneratingScreen() {
  const [activeStep, setActiveStep] = useState(0);
  React.useEffect(() => {
    let s = 0;
    const interval = setInterval(() => {
      if (s < GEN_STEPS.length - 1) { s++; setActiveStep(s); }
      else clearInterval(interval);
    }, 950);
    return () => clearInterval(interval);
  }, []);
  const Icon = GEN_STEPS[activeStep]?.icon || Sparkles;
  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="premium-card text-center space-y-8 py-14">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="relative w-24 h-24 rounded-full bg-charcoal border border-gold/30 flex items-center justify-center">
            <Icon className="w-10 h-10 text-gold animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-off-white">Gemini AI is working…</h2>
          <p className="text-xs text-muted uppercase tracking-[0.2em] font-light">Crafting your complete SEO package</p>
        </div>
        <div className="space-y-3 text-left max-w-xs mx-auto">
          {GEN_STEPS.map((s, i) => {
            const done   = i < activeStep;
            const active = i === activeStep;
            const StepIcon = s.icon;
            return (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${active ? "opacity-100" : done ? "opacity-50" : "opacity-20"}`}>
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border transition-all ${done ? "bg-gold border-gold" : active ? "border-gold animate-pulse" : "border-border"}`}>
                  {done   && <Check className="w-3 h-3 text-black" />}
                  {active && <div className="w-2 h-2 bg-gold rounded-full" />}
                </div>
                <span className={`text-sm font-medium ${active ? "text-off-white" : "text-muted"}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── chapters feature ───────────────────────────────────── */
function ChaptersFeature() {
  const [step, setStep] = useState("INPUT");
  const [videoUrl, setVideoUrl] = useState("");
  const [pastedTranscript, setPastedTranscript] = useState("");
  const [chaptersResult, setChaptersResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim() && !pastedTranscript.trim()) return;
    setError("");
    setStep("GENERATING");
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, pastedTranscript })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Generation failed.");
      setChaptersResult(json.chapters);
      setStep("RESULT");
    } catch (err) {
      setError(err.message);
      setStep("INPUT");
    }
  };

  const handleNew = () => {
    setChaptersResult(null);
    setError("");
    setStep("INPUT");
    setVideoUrl("");
    setPastedTranscript("");
  };

  return (
    <div className="w-full animate-fadeIn">
      {error && (
        <div className="w-full max-w-2xl mx-auto mb-6 bg-red-950/30 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs underline hover:text-white ml-4">Dismiss</button>
        </div>
      )}

      {step === "INPUT" && (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
          <div className="premium-card space-y-6">
            <div className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gold" />
                YouTube Video Link
                <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">
                  Auto-transcribes to generate chapters
                </span>
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=GhsgJD1KjWc"
                className="premium-textarea py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="px-4 text-[10px] text-muted uppercase tracking-widest font-semibold">OR</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>

            <div className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gold" />
                Paste Video Transcript
                <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">
                  Guaranteed bypass if auto-fetch fails
                </span>
              </label>
              <textarea
                rows={6}
                value={pastedTranscript}
                onChange={e => setPastedTranscript(e.target.value)}
                placeholder="Paste the video transcript here. AI will extract logical timestamps and titles."
                className="premium-textarea resize-none text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!videoUrl.trim() && !pastedTranscript.trim()}
              className="premium-btn w-full py-4 text-sm tracking-[0.18em] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              <List className="w-4 h-4 mr-2" />
              GENERATE CHAPTERS
            </button>
          </div>
        </form>
      )}

      {step === "GENERATING" && (
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <div className="premium-card text-center space-y-8 py-14">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative w-24 h-24 rounded-full bg-charcoal border border-gold/30 flex items-center justify-center">
                <List className="w-10 h-10 text-gold animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-off-white">Gemini AI is analyzing…</h2>
              <p className="text-xs text-muted uppercase tracking-[0.2em] font-light">Extracting accurate video chapters</p>
            </div>
          </div>
        </div>
      )}

      {step === "RESULT" && chaptersResult && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleNew}
              className="premium-btn flex items-center gap-2 px-4 py-2.5 text-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              New Video
            </button>
          </div>
          <div className="premium-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-off-white">Video Chapters</h3>
                <p className="text-[10px] text-muted mt-0.5">Paste into description — YouTube auto-detects timestamps</p>
              </div>
              <CopyButton
                text={(chaptersResult || []).map(c => `${c.time} ${c.title}`).join("\n")}
                label="Copy All"
              />
            </div>
            <div className="space-y-2">
              {(chaptersResult || []).map((ch, i) => (
                <div key={i} className="flex items-center gap-4 p-3.5 bg-white/3 border border-white/8 rounded-xl group hover:border-gold/20 transition-all">
                  <span className="font-mono text-sm text-gold font-bold shrink-0 w-12">{ch.time}</span>
                  <span className="text-sm text-off-white flex-1">{ch.title}</span>
                  <CopyButton text={`${ch.time} ${ch.title}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────── */
export default function SEOStudioPage() {
  const [mode, setMode] = useState("SEO"); // "SEO" | "CHAPTERS"
  const [step, setStep]           = useState("INPUT");
  const [formData, setFormData]   = useState(null);
  const [seoResult, setSeoResult] = useState(null);
  const [error, setError]         = useState("");
  const [regenLoading, setRegenLoading] = useState(false);

  const [videoTopic,  setVideoTopic]  = useState("");
  const [audience,    setAudience]    = useState("");
  const [language,    setLanguage]    = useState("Hinglish");
  const [outline,     setOutline]     = useState("");
  const [channelUrl,  setChannelUrl]  = useState("");
  const [defaultLinks, setDefaultLinks] = useState("");
  const [pastedTranscript, setPastedTranscript] = useState("");

  React.useEffect(() => {
    const savedChannel = localStorage.getItem("kinetic_seo_channel_url");
    if (savedChannel) setChannelUrl(savedChannel);
    const savedLinks = localStorage.getItem("kinetic_seo_default_links");
    if (savedLinks) setDefaultLinks(savedLinks);
  }, []);

  const runGenerate = async (data) => {
    setError("");
    setStep("GENERATING");
    try {
      const res = await fetch("/api/seo", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Generation failed.");
      setSeoResult(json.seo);
      setStep("RESULT");
    } catch (err) {
      setError(err.message);
      setStep("INPUT");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!videoTopic.trim() && !pastedTranscript.trim()) return;
    localStorage.setItem("kinetic_seo_channel_url", channelUrl);
    localStorage.setItem("kinetic_seo_default_links", defaultLinks);
    const data = { videoTopic, audience, language, outline, channelUrl, defaultLinks, pastedTranscript };
    setFormData(data);
    runGenerate(data);
  };

  const handleRegenerate = async () => {
    if (!formData) return;
    setRegenLoading(true);
    await runGenerate(formData);
    setRegenLoading(false);
  };

  const handleNew = () => {
    setSeoResult(null); setError(""); setStep("INPUT");
    setVideoTopic(""); setAudience(""); setOutline(""); setPastedTranscript("");
    // Keep inputs populated for convenience
  };

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4 md:px-8 max-w-6xl mx-auto w-full">

      {/* header */}
      <header className="text-center mb-6 w-full">
        <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <Zap className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-green-400">Powered by Gemini AI</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-widest brand-title uppercase mb-3">
          {mode === "SEO" ? <>SEO <span className="text-gold font-light">Studio</span></> : <>Chapters <span className="text-gold font-light">Maker</span></>}
        </h1>
        <div className="h-[1px] w-24 bg-gold mx-auto mb-4" />
        <p className="text-xs text-muted uppercase tracking-[0.25em] font-light max-w-md mx-auto">
          {mode === "SEO" ? "Complete YouTube SEO Package · Titles · Description · Tags · Chapters" : "Instantly generate accurate chapters from your video transcript"}
        </p>
      </header>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-10 w-full">
        <div className="flex bg-white/5 border border-white/10 rounded-full p-1 w-full max-w-sm">
          <button
            onClick={() => setMode("SEO")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${mode === "SEO" ? "bg-gold text-black shadow-lg shadow-gold/20" : "text-muted hover:text-off-white"}`}
          >
            SEO Studio
          </button>
          <button
            onClick={() => setMode("CHAPTERS")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${mode === "CHAPTERS" ? "bg-gold text-black shadow-lg shadow-gold/20" : "text-muted hover:text-off-white"}`}
          >
            Chapters Maker
          </button>
        </div>
      </div>

      {mode === "CHAPTERS" ? (
        <ChaptersMakerPanel />
      ) : (
        <>
          {/* error */}
          {error && (
        <div className="w-full mb-6 bg-red-950/30 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs underline hover:text-white ml-4">Dismiss</button>
        </div>
      )}

      {/* INPUT */}
      {step === "INPUT" && (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto animate-fadeIn">
          <div className="premium-card space-y-6">

            {/* video topic */}
            <div className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gold" />
                Describe what your video is about (or video title idea)
              </label>
              <textarea
                rows={4}
                value={videoTopic}
                onChange={e => setVideoTopic(e.target.value)}
                placeholder="Enter your video title idea or describe what your video is about in detail.&#10;&#10;e.g. Most important topics for Engineering Drawing BTech sem 2 RGPV exam. Cover key projection of solids, isometric views, section of solids, and passing strategy.&#10;&#10;AI will generate ultra-high CTR titles under 60 characters, complete 350+ word SEO description, and 40 tags."
                className="premium-textarea resize-none text-base leading-relaxed"
              />
            </div>

            <div className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="px-4 text-[10px] text-muted uppercase tracking-widest font-semibold">AND / OR TRANSCRIPT</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>

            {/* Paste Video Transcript (Optional) */}
            <div className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gold" />
                Paste Video Transcript (Optional)
                <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">
                  Provides exact video dialogue for context-perfect SEO &amp; timestamps
                </span>
              </label>
              <textarea
                rows={4}
                value={pastedTranscript}
                onChange={e => setPastedTranscript(e.target.value)}
                placeholder="Paste the video transcript here (copy it in 2 clicks from YouTube's 'Show transcript' box).&#10;&#10;Gemini will analyze the transcript to build accurate titles, description, and chapters."
                className="premium-textarea resize-none text-sm leading-relaxed"
              />
            </div>

            {/* audience + language row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="premium-label flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gold" />
                  Target Audience
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. UPSC aspirants, college students"
                  className="premium-textarea py-2.5 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="premium-label flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-gold" />
                  Video Language
                </label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="premium-textarea py-2.5 text-sm font-medium"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* YouTube Channel URL/Handle (Optional) */}
            <div className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gold" />
                YouTube Channel URL / Handle (Optional)
                <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">
                  Loads recent uploads to dynamically recommend watch links in description
                </span>
              </label>
              <input
                type="text"
                value={channelUrl}
                onChange={e => setChannelUrl(e.target.value)}
                placeholder="e.g. @PhysicsWallah or https://youtube.com/@PhysicsWallah"
                className="premium-textarea py-2.5 text-sm"
              />
            </div>

            {/* Default Links (Optional) */}
            <div className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gold" />
                Default Links / Socials (Optional)
                <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">
                  Appended to the end of every description (WhatsApp, Telegram, socials, etc.)
                </span>
              </label>
              <textarea
                rows={3}
                value={defaultLinks}
                onChange={e => setDefaultLinks(e.target.value)}
                placeholder="📱 WhatsApp Group: https://chat.whatsapp.com/...&#10;💬 Join Telegram: https://t.me/...&#10;📸 Instagram: https://instagram.com/..."
                className="premium-textarea resize-none text-sm"
              />
            </div>

            {/* outline — optional */}
            <div className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <List className="w-3.5 h-3.5 text-gold" />
                Rough Chapter Outline
                <span className="ml-2 text-[10px] text-muted normal-case font-normal tracking-normal">Optional — for smarter chapters</span>
              </label>
              <textarea
                rows={3}
                value={outline}
                onChange={e => setOutline(e.target.value)}
                placeholder="e.g. Intro → What is UPSC → Syllabus overview → Study plan → Books → Mock tests → Mindset"
                className="premium-textarea resize-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!videoTopic.trim() && !pastedTranscript.trim()}
              className="premium-btn w-full py-4 text-sm tracking-[0.18em] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              <Sparkles className="w-4 h-4 mr-2" />
              GENERATE SEO PACKAGE
            </button>
          </div>
        </form>
      )}

      {/* GENERATING */}
      {step === "GENERATING" && <GeneratingScreen />}

      {/* RESULT */}
      {step === "RESULT" && seoResult && (
        <SeoResultPanel seo={seoResult} onNew={handleNew} onRegenerate={handleRegenerate} loading={regenLoading} />
      )}
        </>
      )}
    </div>
  );
}

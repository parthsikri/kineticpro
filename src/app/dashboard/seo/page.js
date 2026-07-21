"use client";

import React, { useState } from "react";
import {
  Search, Sparkles, Copy, Check, ChevronDown, ChevronUp,
  BarChart2, Clock, Tag, Hash, AlignLeft, List, Zap,
  TrendingUp, Target, Lightbulb, RefreshCw, PlusCircle,
  Globe, Users, FileText, Award
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────── */
function ScoreRing({ score, size = 96, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f5d800" : "#ef4444";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff10" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}

function CopyButton({ text, label = "" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
        copied
          ? "bg-green-500/20 border-green-500/40 text-green-400"
          : "bg-white/5 border-white/10 text-muted hover:border-gold/40 hover:text-gold hover:bg-gold/5"
      }`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label || "Copy"}
    </button>
  );
}

const LANGUAGES = [
  { value: "Hindi",     label: "हिंदी (Hindi)"     },
  { value: "English",   label: "English"            },
  { value: "Hinglish",  label: "Hinglish (Mix)"     },
  { value: "Marathi",   label: "मराठी (Marathi)"    },
  { value: "Bengali",   label: "বাংলা (Bengali)"    },
  { value: "Tamil",     label: "தமிழ் (Tamil)"      },
  { value: "Telugu",    label: "తెలుగు (Telugu)"    },
];

const TABS = [
  { id: "titles",       label: "Titles",      icon: FileText  },
  { id: "description",  label: "Description", icon: AlignLeft },
  { id: "tags",         label: "Tags",        icon: Tag       },
  { id: "hashtags",     label: "Hashtags",    icon: Hash      },
  { id: "chapters",     label: "Chapters",    icon: List      },
  { id: "analysis",     label: "SEO Score",   icon: BarChart2 },
];

/* ── generating animation ───────────────────────────────────── */
const GEN_STEPS = [
  { label: "Analysing your video topic…",        icon: Search   },
  { label: "Researching high-volume keywords…",  icon: TrendingUp },
  { label: "Crafting SEO-optimised titles…",     icon: FileText  },
  { label: "Writing power description…",         icon: AlignLeft },
  { label: "Building tag & hashtag library…",    icon: Tag       },
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

/* ── result panel ────────────────────────────────────────────── */
function ResultPanel({ seo, onNew, onRegenerate, loading }) {
  const [activeTab, setActiveTab] = useState("titles");
  const [selectedTitle, setSelectedTitle] = useState(0);
  const [expandedTip, setExpandedTip] = useState(null);

  const scoreColor = seo.seoScore >= 80 ? "text-green-400" : seo.seoScore >= 60 ? "text-yellow-400" : "text-red-400";
  const compColor  = seo.competitionLevel === "Low" ? "text-green-400" : seo.competitionLevel === "Medium" ? "text-yellow-400" : "text-red-400";

  return (
    <div className="max-w-5xl mx-auto w-full animate-fadeIn space-y-6">

      {/* ── top summary bar ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "SEO Score",      value: `${seo.seoScore}/100`,                    icon: Award,       color: scoreColor },
          { label: "Competition",    value: seo.competitionLevel || "—",              icon: BarChart2,   color: compColor  },
          { label: "Monthly Reach",  value: seo.estimatedMonthlySearches || "—",      icon: TrendingUp,  color: "text-gold" },
          { label: "Best Upload",    value: seo.bestUploadTime || "—",                icon: Clock,       color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="premium-card p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</div>
              <div className={`text-sm font-bold truncate ${color}`}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── action buttons ─────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={onRegenerate} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-gold/40 hover:text-gold text-muted rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
        <button onClick={onNew}
          className="premium-btn flex items-center gap-2 px-4 py-2.5 text-xs">
          <PlusCircle className="w-3.5 h-3.5" />
          New Video
        </button>
      </div>

      {/* ── tabs ───────────────────────────────────────────────── */}
      <div className="premium-card overflow-hidden p-0">
        <div className="flex overflow-x-auto border-b border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                activeTab === id
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-muted hover:text-white hover:bg-white/3"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* TITLES TAB */}
          {activeTab === "titles" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-off-white">Choose Your Best Title</h3>
                <CopyButton text={seo.titles?.[selectedTitle] || ""} label="Copy Selected" />
              </div>
              {(seo.titles || []).map((title, i) => (
                <div key={i} onClick={() => setSelectedTitle(i)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedTitle === i
                      ? "border-gold/60 bg-gold/5"
                      : "border-white/8 hover:border-white/20 bg-white/2"
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black mt-0.5 ${
                        selectedTitle === i ? "border-gold text-gold bg-gold/10" : "border-white/20 text-muted"
                      }`}>{i + 1}</span>
                      <p className="text-sm text-off-white leading-relaxed font-medium">{title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono ${title.length > 60 ? "text-red-400" : "text-green-400"}`}>
                        {title.length}/60
                      </span>
                      <CopyButton text={title} />
                    </div>
                  </div>
                </div>
              ))}
              {/* keywords */}
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Keyword Targets</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gold font-semibold block mb-2">Primary Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {(seo.primaryKeywords || []).map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-xs text-gold font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block mb-2">Secondary Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {(seo.secondaryKeywords || []).map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-muted">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DESCRIPTION TAB */}
          {activeTab === "description" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-off-white">YouTube Description</h3>
                  <p className="text-[10px] text-muted mt-0.5">{(seo.description || "").length} characters · optimised for search</p>
                </div>
                <CopyButton text={seo.description || ""} label="Copy All" />
              </div>
              <div className="relative bg-dark-gray border border-border rounded-xl p-5">
                <pre className="text-sm text-off-white whitespace-pre-wrap leading-relaxed font-sans">{seo.description}</pre>
              </div>
            </div>
          )}

          {/* TAGS TAB */}
          {activeTab === "tags" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-off-white">YouTube Tags</h3>
                  <p className="text-[10px] text-muted mt-0.5">{(seo.tags || []).length} tags generated</p>
                </div>
                <CopyButton text={(seo.tags || []).join(", ")} label="Copy All Tags" />
              </div>
              <div className="flex flex-wrap gap-2">
                {(seo.tags || []).map((tag, i) => (
                  <div key={i} onClick={() => navigator.clipboard.writeText(tag)}
                    className="group relative flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-gold/40 hover:bg-gold/5 rounded-lg text-xs text-muted hover:text-gold cursor-pointer transition-all">
                    <Tag className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HASHTAGS TAB */}
          {activeTab === "hashtags" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-off-white">Hashtags</h3>
                  <p className="text-[10px] text-muted mt-0.5">Paste these at the end of your description</p>
                </div>
                <CopyButton text={(seo.hashtags || []).join(" ")} label="Copy All" />
              </div>
              <div className="flex flex-wrap gap-3">
                {(seo.hashtags || []).map((tag, i) => (
                  <div key={i} onClick={() => navigator.clipboard.writeText(tag)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 border border-blue-500/30 hover:border-blue-400/60 rounded-full text-sm text-blue-300 hover:text-blue-200 cursor-pointer transition-all font-medium">
                    <Hash className="w-3 h-3" />
                    {tag.replace("#", "")}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAPTERS TAB */}
          {activeTab === "chapters" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-off-white">Video Chapters</h3>
                  <p className="text-[10px] text-muted mt-0.5">Paste into description — YouTube auto-detects timestamps</p>
                </div>
                <CopyButton
                  text={(seo.chapters || []).map(c => `${c.time} ${c.title}`).join("\n")}
                  label="Copy All"
                />
              </div>
              <div className="space-y-2">
                {(seo.chapters || []).map((ch, i) => (
                  <div key={i} className="flex items-center gap-4 p-3.5 bg-white/3 border border-white/8 rounded-xl group hover:border-gold/20 transition-all">
                    <span className="font-mono text-sm text-gold font-bold shrink-0 w-12">{ch.time}</span>
                    <span className="text-sm text-off-white flex-1">{ch.title}</span>
                    <CopyButton text={`${ch.time} ${ch.title}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO ANALYSIS TAB */}
          {activeTab === "analysis" && (
            <div className="space-y-8">
              {/* score ring */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative shrink-0">
                  <ScoreRing score={seo.seoScore || 0} size={120} stroke={10} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${scoreColor}`}>{seo.seoScore}</span>
                    <span className="text-[9px] uppercase tracking-wider text-muted font-semibold">SEO Score</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-3">
                  {Object.entries(seo.seoScoreBreakdown || {}).map(([key, val]) => {
                    const labels = { titleStrength: "Title Strength", descriptionDepth: "Description Depth", tagCoverage: "Tag Coverage", keywordDensity: "Keyword Density" };
                    const barColor = val >= 80 ? "bg-green-500" : val >= 60 ? "bg-yellow-400" : "bg-red-500";
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">{labels[key] || key}</span>
                          <span className="font-bold text-off-white">{val}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* tips */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-gold" /> Gemini's Recommendations
                </h4>
                {(seo.seoTips || []).map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white/3 border border-white/8 rounded-xl hover:border-gold/20 transition-all">
                    <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-black text-gold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-off-white leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChaptersMakerPanel() {
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
        <ResultPanel
          seo={seoResult}
          onNew={handleNew}
          onRegenerate={handleRegenerate}
          loading={regenLoading}
        />
      )}
        </>
      )}
    </div>
  );
}

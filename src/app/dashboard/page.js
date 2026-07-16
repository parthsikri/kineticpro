"use client";

import React, { useState, useEffect } from "react";
import ThumbnailForm from "../components/ThumbnailForm";
import ClarifyStep   from "../components/ClarifyStep";
import ImageResult   from "../components/ImageResult";
import { Cpu, Key, Sparkles } from "lucide-react";

/* -- Loading progress steps ----------------------------------------- */
const STEPS = [
  { id: 1, label: "Analysing your topic…",           duration: 1200 },
  { id: 2, label: "AI crafting design strategy…",    duration: 1800 },
  { id: 3, label: "Kinetic AI painting thumbnail…",  duration: 0    },
];

function GeneratingScreen() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    let step = 0;
    const advance = () => {
      if (step < STEPS.length - 1) {
        step++;
        setActiveStep(step);
        if (STEPS[step].duration) setTimeout(advance, STEPS[step].duration);
      }
    };
    if (STEPS[0].duration) setTimeout(advance, STEPS[0].duration);
  }, []);

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="premium-card text-center space-y-8 py-14">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="relative w-24 h-24 rounded-full bg-charcoal border border-gold/30 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-gold" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold serif-font text-off-white">Creating your thumbnail</h2>
          <p className="text-xs text-muted uppercase tracking-[0.2em]">Powered by Kinetic AI</p>
        </div>
        <div className="space-y-3 text-left max-w-xs mx-auto">
          {STEPS.map((s, i) => {
            const done   = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={s.id} className={`flex items-center gap-3 transition-all duration-500 ${active ? "opacity-100" : done ? "opacity-60" : "opacity-25"}`}>
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border transition-all ${done ? "bg-gold border-gold" : active ? "border-gold animate-pulse" : "border-border"}`}>
                  {done   && <span className="text-black text-[10px] font-black">✓</span>}
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

/* -- Helper: Combine multiple photos horizontally ------------------ */
const compositePhotos = async (photosArray) => {
  if (!photosArray || photosArray.length === 0) return null;
  if (photosArray.length === 1) return photosArray[0];

  return new Promise((resolve) => {
    const images = [];
    let loaded = 0;
    photosArray.forEach(b64 => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === photosArray.length) {
          const maxHeight = 1024;
          let totalWidth = 0;
          const scaledImages = images.map(img => {
            const scale = maxHeight / img.height;
            const width = img.width * scale;
            totalWidth += width;
            return { img, width, height: maxHeight };
          });
          const canvas = document.createElement("canvas");
          canvas.width = totalWidth;
          canvas.height = maxHeight;
          const ctx = canvas.getContext("2d");
          let currentX = 0;
          scaledImages.forEach(({ img, width, height }) => {
            ctx.drawImage(img, currentX, 0, width, height);
            currentX += width;
          });
          resolve(canvas.toDataURL("image/png"));
        }
      };
      img.src = b64;
      images.push(img);
    });
  });
};

/* ====================================================================
   MAIN PAGE
   Steps: INPUT -> GENERATING -> (optional) CLARIFY -> GENERATING -> RESULT
   ==================================================================== */
export default function Home() {
  const [step, setStep]               = useState("INPUT"); // INPUT | GENERATING | CLARIFY | RESULT
  const [formData, setFormData]       = useState(null);
  const [clarifyQuestions, setClarifyQuestions] = useState([]);
  const [plan, setPlan]               = useState(null);
  const [imageUrls, setImageUrls]       = useState([]);
  const [error, setError]             = useState("");
  const [isSandbox, setIsSandbox]     = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [clarifyLoading, setClarifyLoading]   = useState(false);

  /* -- Shared: call /api/plan with a topic string ---------------- */
  const callPlan = async (topicString, data) => {
    const planRes = await fetch("/api/plan", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoTopic:      topicString,
        brandColor:      data.brandColor,
        highlightColor:  data.highlightColor,
        hasSubjectPhoto: data.subjectPhotos?.length > 0,
        subjectCount:    data.subjectPhotos?.length || 0,
        poseMode:        data.poseMode || "ai",
      }),
    });
    const planData = await planRes.json();
    if (!planData.success) throw new Error(planData.error || "Failed to generate design plan.");
    if (planData.isMock) setIsSandbox(true);
    return planData;
  };

  /* -- Shared: call /api/generate with a plan ------------------- */
  const callGenerate = async (plan, data) => {
    const genRes = await fetch("/api/generate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imagePrompt:        plan.imagePrompt,
        subjectPhotoBase64: data.compositeBase64 || null,
        brandLogoBase64:    null,
        hasLogo:            false,
      }),
    });
    const genData = await genRes.json();
    if (!genData.success) throw new Error(genData.error || "Failed to generate image.");
    if (genData.isMock) setIsSandbox(true);
    return genData.imageUrls;
  };

  /* -- Step 1: Initial form submit ------------------------------- */
  const handleGenerate = async (data) => {
    setFormData(data);
    setError("");
    setStep("GENERATING");

    try {
      const planData = await callPlan(data.videoTopic, data);

      // AI needs more info — show clarify step
      if (planData.needsMoreInfo) {
        setClarifyQuestions(planData.questions);
        setStep("CLARIFY");
        return;
      }

      // Have everything — composite photos if needed, then generate
      setPlan(planData.plan);
      const compositeBase64 = await compositePhotos(data.subjectPhotos);
      const dataWithComposite = { ...data, compositeBase64 };
      setFormData(dataWithComposite);

      const urls = await callGenerate(planData.plan, dataWithComposite);
      setImageUrls(urls);
      setStep("RESULT");

    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setStep("INPUT");
    }
  };

  /* -- Step 2 (optional): User answered clarify questions -------- */
  const handleClarifySubmit = async (answersContext) => {
    setClarifyLoading(true);
    setError("");
    setStep("GENERATING");

    try {
      // Append user's answers to the original topic
      const enrichedTopic = `${formData.videoTopic}\n\nAdditional details provided by creator:\n${answersContext}`;
      const planData = await callPlan(enrichedTopic, formData);

      // Shouldn't ask again, but if it does just proceed with what we have
      if (planData.needsMoreInfo) {
        setClarifyQuestions(planData.questions);
        setStep("CLARIFY");
        setClarifyLoading(false);
        return;
      }

      setPlan(planData.plan);
      let dataWithComposite = formData;
      if (!formData.compositeBase64 && formData.subjectPhotos) {
        const compositeBase64 = await compositePhotos(formData.subjectPhotos);
        dataWithComposite = { ...formData, compositeBase64 };
        setFormData(dataWithComposite);
      }

      const urls = await callGenerate(planData.plan, dataWithComposite);
      setImageUrls(urls);
      setStep("RESULT");

    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setStep("CLARIFY"); // Go back to clarify form, not all the way to INPUT
    } finally {
      setClarifyLoading(false);
    }
  };

  /* -- Regenerate with same plan --------------------------------- */
  const handleRegenerate = async () => {
    if (!plan || !formData) return;
    setError("");
    setStep("GENERATING");
    try {
      const urls = await callGenerate(plan, formData);
      setImageUrls(urls);
      setStep("RESULT");
    } catch (err) {
      setError(err.message);
      setStep("RESULT");
    }
  };

  const handleNew = () => {
    setFormData(null); setPlan(null); setImageUrls([]); setError("");
    setClarifyQuestions([]); setStep("INPUT");
  };

  return (
    <div className="flex-1 flex flex-col items-center py-14 px-4 md:px-8 max-w-5xl mx-auto w-full">

      {/* Header */}
      <header className="text-center mb-12 w-full">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-widest brand-title uppercase mb-3">
          K I N E T I C <span className="text-gold font-light">P R O</span>
        </h1>
        <div className="h-[1px] w-24 bg-gold mx-auto mb-4" />
        <p className="text-xs text-muted uppercase tracking-[0.25em] font-light max-w-md mx-auto">
          AI Thumbnail Engine · Just describe your video · We handle the rest
        </p>
      </header>

      {/* Sandbox banner */}
      {isSandbox && step === "RESULT" && (
        <div className="w-full mb-6 bg-gold/10 border border-gold/20 rounded-lg p-3 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2 text-gold">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wider uppercase">Sandbox Mode — Add API keys for live generation</span>
          </div>
          <button onClick={() => setShowConfigGuide(!showConfigGuide)}
            className="text-[10px] text-gold uppercase underline tracking-wider">
            {showConfigGuide ? "Close" : "How to connect keys"}
          </button>
        </div>
      )}

      {showConfigGuide && (
        <div className="w-full mb-6 bg-charcoal border border-border rounded-lg p-5 text-left text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-off-white font-semibold">
            <Key className="w-3.5 h-3.5 text-gold" /><span>Connecting Live API Keys</span>
          </div>
          <p className="text-muted leading-relaxed font-light">
            Edit <code className="bg-black py-0.5 px-1 rounded text-gold">.env.local</code> in the project root:
          </p>
          <pre className="bg-black p-3 rounded font-mono text-[11px] text-muted overflow-x-auto select-all leading-normal">
{`DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key
IMAGE_MODEL_NAME=kinetic-image-engine`}
          </pre>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="w-full mb-6 bg-red-950/30 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-xs underline hover:text-white ml-4 flex-shrink-0">Dismiss</button>
        </div>
      )}

      {/* Main content */}
      <main className="w-full">
        {step === "INPUT"      && <ThumbnailForm onSubmit={handleGenerate} loading={false} />}
        {step === "GENERATING" && <GeneratingScreen />}
        {step === "CLARIFY"    && (
          <ClarifyStep
            questions={clarifyQuestions}
            onSubmit={handleClarifySubmit}
            onBack={() => setStep("INPUT")}
            loading={clarifyLoading}
          />
        )}
        {step === "RESULT"     && (
          <ImageResult
            imageUrls={imageUrls}
            onRecreate={handleRegenerate}
            onNew={handleNew}
            plan={plan}
            brandColor={formData?.brandColor || "#1a3fd4"}
          />
        )}
      </main>

      <footer className="mt-16 text-center text-[10px] text-muted tracking-widest uppercase font-light">
        © {new Date().getFullYear()} KineticPro · Kinetic AI Strategy
      </footer>
    </div>
  );
}

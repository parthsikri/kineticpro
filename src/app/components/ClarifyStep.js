"use client";

import React, { useState } from "react";
import { HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   ClarifyStep — shown when DeepSeek needs specific facts from the user
   before it can make accurate thumbnail text (dates, names, codes etc.)
   ════════════════════════════════════════════════════════════════════ */
export default function ClarifyStep({ questions, onSubmit, onBack, loading }) {
  const [answers, setAnswers] = useState(
    questions.reduce((acc, q, i) => ({ ...acc, [i]: "" }), {})
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // Combine Q&A into a supplemental context string
    const context = questions
      .map((q, i) => `${q} → ${answers[i] || "(not provided)"}`)
      .join("\n");
    onSubmit(context);
  };

  const allAnswered = questions.every((_, i) => answers[i]?.trim());

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-fadeIn">
      <div className="premium-card space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold serif-font text-off-white">
              Quick clarification needed
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              AI found your topic but needs a few specific details to make
              the thumbnail text accurate — so nothing gets made up.
            </p>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((question, i) => (
            <div key={i} className="space-y-2">
              <label className="premium-label flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {question}
              </label>
              <input
                type="text"
                required
                value={answers[i]}
                onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                placeholder="Type your answer…"
                className="premium-input"
                autoFocus={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="premium-btn-secondary py-2 px-4 flex items-center gap-2 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Edit topic
          </button>

          <button
            type="submit"
            disabled={loading || !allAnswered}
            className="premium-btn px-8 py-3 flex items-center gap-2"
          >
            {loading ? (
              <><div className="loader mr-1" />Generating…</>
            ) : (
              <>Generate Thumbnail <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

      </div>
    </form>
  );
}

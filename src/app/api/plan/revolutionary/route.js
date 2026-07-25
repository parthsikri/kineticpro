import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";
import { checkRateLimit } from "../../../../lib/rate-limit";

/* ═══════════════════════════════════════════════════════════════════
   REVOLUTIONARY MODE — Separate planning engine.
   This route is specifically designed to generate EXPLOSIVE,
   paradigm-shifting YouTube thumbnails with a completely different
   visual DNA from the standard mode.
   ═══════════════════════════════════════════════════════════════════ */

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, "plan", 30, 60 * 60 * 1000);
    if (!rateLimit.allowed)
      return NextResponse.json(
        { success: false, error: "Planning limit reached. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );

    const user = await getSessionUser();
    if (!user)
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { videoTopic, brandColor, highlightColor, hasSubjectPhoto, subjectCount, poseMode } = body;
    const creatorType = body.creatorType || user.creatorType || "education";

    if (typeof videoTopic !== "string" || videoTopic.trim().length === 0 || videoTopic.length > 8_000)
      return NextResponse.json(
        { success: false, error: "Video topic must be between 1 and 8,000 characters." },
        { status: 400 }
      );

    const apiKey = process.env.DEEPSEEK_API_KEY;

    /* ── Mock fallback ─────────────────────────────────────────────── */
    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1400));
      const plan = buildRevolutionaryFallbackPlan({ videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode });
      return NextResponse.json({ success: true, needsMoreInfo: false, plan, isMock: true });
    }

    /* ── Revolutionary DeepSeek call ────────────────────────────────── */
    const subjectInstruction = hasSubjectPhoto
      ? `Multi-angle reference photos (Front, Left, Right) of the creator have been provided. Pose mode: "${poseMode}" — ${
          poseMode === "ai"
            ? "Design the most EXPLOSIVE, physically-intense, emotionally-raw pose possible (mid-air leap, aggressive forward lean, arms erupting outward, screaming to the sky, chest-pounding victory)"
            : "Keep their exact pose but amp up the energy — dramatic lighting, particles, fire around them"
        }. Reconstruct their exact face and likeness with 100% precision.`
      : "No subject photo. Create an ultra-dramatic, almost superhuman Indian creator figure with intense, aggressive energy.";

    /* ── PASS 1: Always generate full plan directly (no clarification for revolutionary) */
    const systemPrompt = [
      "You are the world's most aggressive, high-impact YouTube thumbnail strategist.",
      "You specialize in thumbnails that feel like a cultural earthquake — thumbnails that creators who break the internet use.",
      "",
      "The creator has selected REVOLUTIONARY MODE. This means:",
      "- They are posting something that will CHANGE their niche FOREVER.",
      "- Standard thumbnails are FORBIDDEN. Every single element must scream urgency, revelation, and paradigm shift.",
      "- Think: What would MrBeast, CarryMinati, and PewDiePie do if they taught Indian education? That energy.",
      "",
      "TEXT STRATEGY — MANDATORY RULES:",
      "- HEADLINE LINE 1: Must use one of these power-word archetypes: EXPOSED / DESTROYED / IMPOSSIBLE / TRUTH / NEVER AGAIN / GAME OVER / CHANGED FOREVER / THEY LIED",
      "- HEADLINE LINE 2: The specific subject/topic — kept ultra short (2 words max), massive, italic, in the accent color",
      "- BANNER TEXT: Must be a Hinglish statement so shocking it feels like a WhatsApp forward that goes viral. Max 7 words. Should make the viewer feel they'll MISS OUT if they don't watch.",
      "- TOP BADGE: Must be one of: 'BOMBSHELL', 'EXPOSED', 'GAME OVER', 'TRUTH OUT', 'HISTORIC', 'THEY LIED', 'NO ONE TOLD YOU'",
      "- ALERT CARD: Always show an alert card for revolutionary mode. Make the title dramatic. Use 'warning' or 'error' type always.",
      "",
      "SUBJECT POSE — MANDATORY (THIS IS THE MOST IMPORTANT PART):",
      "- The pose MUST be physically explosive and intense. Weak poses are forbidden.",
      "- Choose ONE of these archetypes and build on it for the specific topic:",
      "  ARCHETYPE A — THE REVEALER: Both hands spreading wide open like they just exposed a secret, face in absolute shock/disbelief, eyes wide, mouth agape",
      "  ARCHETYPE B — THE CONQUEROR: One fist raised to the sky, head tilted back in a battle cry, body leaning aggressively forward",
      "  ARCHETYPE C — THE DISRUPTOR: Finger pointing DIRECTLY at camera lens like a challenge/accusation, intense eyes, slight lean forward, power stance",
      "  ARCHETYPE D — THE DESTROYER: Arms crossed powerfully over chest, dominant smirk, slightly looking down at camera (making viewer feel small), lit from below",
      "- CRITICAL: Describe a relevant physical prop the subject holds that relates to their topic (shattered book for syllabus topics, crumpled exam paper for exam topics, a burning/glowing formula sheet for maths/science, a trophy for results).",
      "- The prop should look DAMAGED, EXPLOSIVE, or GLOWING — not clean and academic.",
      "",
      "Respond ONLY with valid raw JSON — no markdown, no code blocks.",
    ].join("\n");

    const userPrompt = [
      `VIDEO TOPIC: "${videoTopic}"`,
      `BRAND COLOR: ${brandColor}`,
      `HIGHLIGHT COLOR: ${highlightColor || "#ff3300"}`,
      `SUBJECT: ${subjectInstruction}`,
      `CREATOR TYPE: ${creatorType}`,
      "",
      "Generate the full revolutionary plan:",
      "{",
      '  "needsMoreInfo": false,',
      '  "conceptTitle": "5-word explosive thumbnail concept name",',
      '  "ctrAnalysis": "2 sentences on why this will stop thumbs mid-scroll",',
      '  "compositionStrategy": "1 sentence on explosive visual layout",',
      '  "subjectPose": "Extremely detailed explosive pose description using one of the archetypes above, with specific prop that looks damaged/explosive/glowing",',
      '  "overlayConfig": {',
      `    "accentColor": "${highlightColor || "#ff3300"}",`,
      '    "topBadge": "one of: BOMBSHELL | EXPOSED | GAME OVER | TRUTH OUT | HISTORIC | THEY LIED | NO ONE TOLD YOU",',
      '    "topBadgeColor": "#cc0000",',
      '    "headline1": "POWER WORD — 1-2 words max (white text)",',
      '    "headline2": "TOPIC — 2 words max (accent color)",',
      '    "bannerText": "Viral Hinglish statement max 7 words",',
      '    "bannerAccentWord": "the most shocking word in the banner",',
      '    "showAlertCard": true,',
      '    "alertTitle": "EXPLOSIVE ALERT TITLE IN CAPS",',
      '    "alertBody": "1 shocking sentence",',
      '    "alertType": "error",',
      '    "showDateCallout": false,',
      '    "dateText": null,',
      '    "dateIcon": null',
      "  }",
      "}",
    ].join("\n");

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Engine API failed: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    let plan = JSON.parse(data.choices[0].message.content);

    // Build the revolutionary image prompt
    plan.imagePrompt = buildRevolutionaryImagePrompt(plan, {
      videoTopic, brandColor, highlightColor, hasSubjectPhoto, subjectCount, poseMode, creatorType,
    });

    return NextResponse.json({ success: true, needsMoreInfo: false, plan });
  } catch (error) {
    console.error("[REVOLUTIONARY_PLAN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Revolutionary planning failed: " + error.message },
      { status: 500 }
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════
   REVOLUTIONARY IMAGE PROMPT BUILDER
   Completely separate from the normal mode prompt.
   Designed specifically for explosive, cinematic, dark-energy thumbnails.
   ═══════════════════════════════════════════════════════════════════ */
function buildRevolutionaryImagePrompt(plan, { videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType }) {
  const oc = plan.overlayConfig || {};
  const accent = highlightColor || oc.accentColor || "#ff3300";
  const pose = plan.subjectPose || "arms exploding outward in pure shock revelation, face in awe, eyes wide, holding a crumpled burning exam paper";

  /* ── Subject block ─────────────────────────────────────────────── */
  const subjectBlock = hasSubjectPhoto
    ? `SUBJECT — MULTI-ANGLE FACE REFERENCE PROVIDED:
The reference images contain Front, Left, and Right profile shots of the creator.
Reconstruct their exact face: bone structure, skin tone, eye color, jawline — with 100% photorealistic precision.
${poseMode === "ai"
  ? `NOW place them in this EXPLOSIVE, physically-intense pose: "${pose}".
  CRITICAL POSE RULES:
  - Their body must look like it has KINETIC ENERGY — not static, not posed, like a frame frozen mid-action
  - Dramatic under-lighting OR split rim-lighting: one side in the brand color (${brandColor}), other side in the accent (${accent})
  - Their expression: absolute intensity — shock, rage, triumph, or revelation — pick the most fitting for the topic
  - The prop they hold must look SPECTACULAR: glowing, crumpled, burning, or shattered — never clean`
  : `Keep their exact reference pose. Dramatically enhance with: explosive cinematic lighting, ${brandColor} rim light, particle effects floating around them.`
}`
    : `SUBJECT — Create an ultra-dramatic Indian creator/presenter figure:
Pose: "${pose}"
Look: Black outfit, chiseled jawline, intense eyes — like a Bollywood action hero meets a revolutionary scientist
Lighting: Split dramatic lighting — ${brandColor} from one side, ${accent} from the other
Aura: They should look like someone who just discovered the secret the world was hiding`;

  /* ── Text elements ─────────────────────────────────────────────── */
  const textElements = [];

  if (oc.topBadge) {
    textElements.push(
      `TOP-LEFT CORNER — Aggressive pill badge:
  Bold white ALL CAPS text "${oc.topBadge}" on a BLOOD RED (#cc0000) background
  Badge has a subtle glow/halo effect, sharp rounded corners, feels like a warning label`
    );
  }

  if (oc.headline1 || oc.headline2) {
    const h1 = oc.headline1 ? `"${oc.headline1.toUpperCase()}"` : null;
    const h2 = oc.headline2 ? `"${oc.headline2.toUpperCase()}"` : null;
    textElements.push(
      `MAIN HEADLINE — Left-center, stacked, MASSIVE:
  ${h1 ? `Line 1: ${h1} — Impact/ultra-bold condensed font, pure WHITE, GIGANTIC (takes up 40% of height), 3D extrusion effect, strong red/orange drop-shadow, cracked or shattered texture on the letters` : ""}
  ${h2 ? `Line 2: ${h2} — same massive size, ITALIC, color ${accent}, feels like it's on fire or glowing neon` : ""}
  Both lines left-aligned, slightly overlapping each other for maximum impact`
    );
  }

  if (oc.showAlertCard && oc.alertTitle) {
    textElements.push(
      `RIGHT SIDE — Breaking news style ALERT CARD:
  Dark background with a thick red left-border stripe (like a BBC breaking news ticker)
  Bold header: "⚠ BREAKING" in red
  Main title: "${oc.alertTitle.toUpperCase()}" in white, large, bold
  Body: "${(oc.alertBody || "").slice(0, 80)}"
  Style: TV news BREAKING ALERT — urgent, serious, alarming`
    );
  }

  if (oc.bannerText) {
    const upper = oc.bannerText.toUpperCase();
    const accentWord = oc.bannerAccentWord ? oc.bannerAccentWord.toUpperCase() : null;
    const bannerDesc = accentWord
      ? `"${upper}" — the word "${accentWord}" in ${accent} (blazing fire orange/yellow), rest in pure white`
      : `"${upper}" in pure white`;
    textElements.push(
      `FULL-WIDTH BOTTOM BANNER STRIP:
  Black background with a thin ${accent} line at the top
  Impact condensed font: ${bannerDesc}
  The text should feel like it's vibrating with urgency`
    );
  }

  const textSection = textElements.length > 0
    ? textElements.map((el, i) => `${i + 1}. ${el}`).join("\n\n")
    : `Massive cracked white Impact text on the left with ${accent} glow effect, dark dramatic background`;

  /* ── Base environment ──────────────────────────────────────────── */
  const envByType = {
    gaming: `Explosive gaming battle scene: shattered game controllers, neon particle explosions in ${brandColor} and ${accent}, dark apocalyptic environment with fire and embers`,
    vlogs: `Dramatic cinematic real-world environment shattered/exploding into particles, the mundane world literally breaking apart around the subject`,
    education: `Dark abandoned lecture hall or library — books and papers exploding outward from a central energy burst, equations and formulas etched in glowing ${accent} fire across the background`,
  };
  const environment = envByType[creatorType] || envByType.education;

  return (
    `Generate a COMPLETE, EXPLOSIVE, REVOLUTIONARY YouTube thumbnail image that looks like a cultural earthquake. ` +
    `Every element below MUST appear in the final image — this is the finished thumbnail, not a background sketch.\n\n` +

    `REFERENCE STYLE: The most viral, shocking, paradigm-breaking thumbnails of all time. ` +
    `Think MrBeast's biggest videos. Think CarryMinati at peak intensity. Think the most aggressive Bollywood movie poster crossed with a breaking news alert. ` +
    `This thumbnail should make someone physically stop scrolling and feel their heart rate spike.\n\n` +

    `FORMAT: 16:9 landscape (1280x720)\n\n` +

    `TOPIC: ${videoTopic}\n\n` +

    `ATMOSPHERE & VISUAL MOOD (CRITICAL — THIS DEFINES EVERYTHING):\n` +
    `- Background: ${environment}\n` +
    `- Overall color temperature: DARK and INTENSE — deep blacks, shadow zones, with explosive ${brandColor} and ${accent} as the ONLY light sources\n` +
    `- Lighting style: Rim lighting from two angles — ${brandColor} from left, ${accent} from right — creating a dramatic split on the subject\n` +
    `- Particle effects: Glowing embers, sparks, or light dust floating in the scene\n` +
    `- Depth: Heavy cinematic depth of field — background slightly blurred, subject razor sharp\n` +
    `- Vignette: Strong dark vignette around the edges to draw the eye to the center\n\n` +

    `SUBJECT:\n${subjectBlock}\n\n` +

    `TEXT & OVERLAY ELEMENTS (render ALL with maximum crispness, 4K sharpness):\n` +
    textSection + `\n\n` +

    `TYPOGRAPHY RULES:\n` +
    `- Headlines: Impact or ultra-bold condensed sans-serif, ALL CAPS\n` +
    `- Headline letters should have a 3D extrusion or emboss effect — not flat\n` +
    `- Strong red/black drop shadow on all text for maximum legibility over dark backgrounds\n` +
    `- All text: perfectly spelled, razor sharp edges, feels PRINTED in the scene not overlaid\n\n` +

    `ANATOMY RULES (CRITICAL):\n` +
    `- Subject MUST have exactly two natural arms and hands\n` +
    `- Hands perfectly formed, anatomically correct\n` +
    `- ZERO extra limbs, ZERO extra fingers, ZERO floating hands\n\n` +

    `WHAT TO AVOID:\n` +
    `- NO clean academic backgrounds\n` +
    `- NO soft, pastel, or gentle colors\n` +
    `- NO calm or composed expression on the subject\n` +
    `- NO standard stock-photo poses\n` +
    `- NO generic "pointing at the camera" lazy pose\n\n` +

    `QUALITY: Ultra-photorealistic, 4K, magazine-cover level sharpness. ` +
    `The thumbnail must look like it cost ₹50,000 to produce. ` +
    `Every pixel must scream "THIS WILL CHANGE YOUR LIFE IF YOU DON'T WATCH IT."`
  );
}

/* ── Fallback plan (no API key) ────────────────────────────────────── */
function buildRevolutionaryFallbackPlan({ videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode }) {
  const plan = {
    needsMoreInfo: false,
    conceptTitle: "Game-Changing Revelation Thumbnail",
    ctrAnalysis:
      "The explosive visual language and provocative text creates instant FOMO, forcing viewers to stop scrolling. The dark cinematic aesthetic signals this is unlike anything they've seen.",
    compositionStrategy:
      "Subject in explosive mid-action pose LEFT, massive cracked headline CENTER-LEFT, breaking alert card RIGHT, full-width viral banner BOTTOM.",
    subjectPose:
      "arms spread wide in explosive revelation pose, face showing pure shock and disbelief, eyes wide open, mouth slightly open, holding a glowing crumpled exam paper that appears to be on fire",
    overlayConfig: {
      accentColor: highlightColor || "#ff3300",
      topBadge: "GAME OVER",
      topBadgeColor: "#cc0000",
      headline1: "EXPOSED",
      headline2: "TRUTH",
      bannerText: "Yeh sach duniya se chupaaya tha!",
      bannerAccentWord: "chupaaya",
      showAlertCard: true,
      alertTitle: "EVERYTHING CHANGED",
      alertBody: videoTopic.slice(0, 80),
      alertType: "error",
      showDateCallout: false,
      dateText: null,
      dateIcon: null,
    },
    imagePrompt: "",
  };

  plan.imagePrompt = buildRevolutionaryImagePrompt(plan, {
    videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType: "education",
  });

  return plan;
}

import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";
import { checkRateLimit } from "../../../../lib/rate-limit";

/* ═══════════════════════════════════════════════════════════════════
   REVOLUTIONARY MODE — Separate, context-intelligent planning engine.
   Picks the right revolution TYPE based on the actual video topic
   so a teaching video never gets "THEY LIED" nonsense.
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

    /* ── Subject instruction ─────────────────────────────────────── */
    const subjectInstruction = hasSubjectPhoto
      ? `Multi-angle reference photos (Front, Left, Right) of the creator have been provided. Pose mode: "${poseMode}" — ${
          poseMode === "ai"
            ? "Design the most expressive, high-energy, HIGH-CTR pose. It must look intense but BELIEVABLE for an education creator — not a superhero. Think: the most intense version of a confident, victorious teacher."
            : "Keep their exact reference pose but amp up the energy with dramatic lighting and particle effects around them."
        }. Reconstruct their exact face and likeness with 100% precision.`
      : "No subject photo. Create a confident, intense Indian educator/presenter — handsome, professional, extremely expressive.";

    /* ── System Prompt ─────────────────────────────────────────────── */
    const systemPrompt = [
      "You are the world's most high-impact YouTube thumbnail strategist, specializing in Indian education and creator channels.",
      "You specialize in thumbnails that feel like a cultural earthquake — the kind that make someone physically stop scrolling.",
      "",
      "The creator has selected REVOLUTIONARY MODE.",
      "REVOLUTIONARY does NOT automatically mean conspiracy or 'they lied'. It means the thumbnail must be dramatically more intense, higher-stakes, and more emotionally charged than a standard thumbnail.",
      "The revolution must be CONTEXTUALLY APPROPRIATE to the video topic.",
      "",
      "══════════════════════════════════════════════════",
      "STEP 1: IDENTIFY THE REVOLUTION TYPE",
      "══════════════════════════════════════════════════",
      "",
      "TYPE A — ACHIEVEMENT REVOLUTION (use for: teaching, full coverage, speed-run, syllabus videos):",
      "  Signal words in topic: 'complete', 'full', 'hours', 'mein', 'in X hours', '1 video', 'syllabus', 'poora', 'khatam'",
      "  Revolution angle: 'I compressed something that takes months into a tiny time box. Nobody has done this at this scale.'",
      "  HEADLINE options: IMPOSSIBLE / RECORD BROKEN / NEVER DONE / KHATAM / FIRST EVER",
      "  BADGE options: 'RECORD BROKEN', 'IMPOSSIBLE', 'FIRST EVER', 'HISTORIC', 'GAME CHANGER'",
      "  POSE: THE CHALLENGER or THE ACHIEVER",
      "",
      "TYPE B — ANNOUNCEMENT REVOLUTION (use for: exam updates, results, postponement, breaking news):",
      "  Signal words in topic: 'postponed', 'cancelled', 'result', 'breaking', 'update', 'change', 'notice'",
      "  Revolution angle: 'Everything just changed. If you miss this, you'll regret it.'",
      "  HEADLINE options: POSTPONED / CANCELLED / RESULT OUT / BREAKING / OFFICIAL",
      "  BADGE options: 'BREAKING', 'OFFICIAL UPDATE', 'JUST IN', 'RESULT OUT', 'URGENT'",
      "  POSE: THE REVEALER",
      "",
      "TYPE C — EXPOSÉ REVOLUTION (use ONLY for: myths busted, scam exposed, hidden truth, nobody told you):",
      "  Signal words in topic: 'exposed', 'scam', 'truth', 'nobody tells', 'myth', 'lied', 'fake', 'hidden'",
      "  Revolution angle: 'The industry has been hiding this. I'm the one brave enough to say it out loud.'",
      "  HEADLINE options: EXPOSED / THEY LIED / TRUTH / BOMBSHELL / HIDDEN",
      "  BADGE options: 'EXPOSED', 'THEY LIED', 'TRUTH OUT', 'BOMBSHELL', 'SECRET OUT'",
      "  POSE: THE DISRUPTOR or THE DESTROYER",
      "",
      "⚠ CRITICAL RULE: Match the type to the topic. NEVER use 'THEY LIED' or 'EXPOSED' for a teaching video. That is misleading and kills trust. Use the type that HONESTLY matches the video's content.",
      "",
      "══════════════════════════════════════════════════",
      "STEP 2: CHOOSE THE POSE ARCHETYPE",
      "══════════════════════════════════════════════════",
      "",
      "THE ACHIEVER (best for Type A — achievement/teaching):",
      "  Body: Standing tall, chest out, one arm raised with a confident thumbs-up OR bent elbow fist-pump at shoulder height (not over-the-top jump — grounded and powerful)",
      "  Face: Massive confident smile, eyes shining, looking directly at camera with pride",
      "  Energy: 'I just pulled off something nobody thought was possible. And I'm going to show you how.'",
      "  Prop: A glowing stopwatch showing the time OR a cracked-open textbook with golden light bursting from its pages",
      "",
      "THE CHALLENGER (best for Type A — when topic is a bold claim):",
      "  Body: Both hands flat on an invisible surface, leaning forward toward the camera, weight on hands",
      "  Face: Chin slightly down, eyes locked intensely at camera, slight smirk — 'I dare you to doubt me'",
      "  Energy: 'You think it's impossible? Watch me.'",
      "  Prop: A glowing holographic equation or formula floating beside them",
      "",
      "THE REVEALER (best for Type B — announcements/updates):",
      "  Body: Both arms spreading wide open to the sides, palms facing camera",
      "  Face: Eyes wide in dramatic disbelief, mouth open — like they're unveiling something massive",
      "  Energy: 'I can't believe this is actually happening. You NEED to see this.'",
      "  Prop: A glowing official document/notice they're presenting to the camera",
      "",
      "THE DISRUPTOR (best for Type C — exposé/controversy):",
      "  Body: One finger pointing DIRECTLY at the camera lens, slight forward lean, feet shoulder-width apart",
      "  Face: Intense eyes, serious expression, jaw slightly set — a direct personal challenge",
      "  Energy: 'I see what's happening. And I'm calling it out. Directly.'",
      "  Prop: Holding a glowing/burning document that reveals the truth in their other hand",
      "",
      "THE DESTROYER (best for Type C — when creator has total confidence):",
      "  Body: Arms crossed over chest, feet slightly apart, slight downward tilt of head — looking at camera from above",
      "  Face: Dominant half-smirk, completely relaxed — they've already won",
      "  Energy: 'I've already figured this out. The question is — have you?'",
      "  Prop: A shattered textbook at their feet OR holding a glowing 'truth document'",
      "",
      "PROP RULES: Props MUST be topic-specific and look EPIC:",
      "  Physics/Science: Glowing equation sheet, stopwatch, cracked textbook with light inside, burning formula",
      "  Maths: Equation-covered blackboard fragment, glowing calculator",
      "  Exam update: Glowing/crumpled official notice or circular",
      "  Results: Glowing result sheet, golden trophy",
      "  Exposé: Burning document, shattered logo",
      "",
      "══════════════════════════════════════════════════",
      "STEP 3: TEXT RULES",
      "══════════════════════════════════════════════════",
      "",
      "HEADLINE LINE 1: The power word — 1-2 words only, chosen from the TYPE-APPROPRIATE list above. Gigantic, white, cracked/3D font.",
      "HEADLINE LINE 2: The topic/subject in 2 words, italic, in accent color, equally massive.",
      "BANNER: A Hinglish statement that communicates the achievement or revelation. Should feel like a WhatsApp forward going viral. Max 7 words.",
      "ALERT CARD: Always include. Title = the single most dramatic claim of the video. Type = 'error' for exposé, 'success' for achievement, 'warning' for announcement.",
      "",
      "Respond ONLY with valid raw JSON — no markdown, no code blocks.",
    ].join("\n");

    const userPrompt = [
      `VIDEO TOPIC: "${videoTopic}"`,
      `BRAND COLOR: ${brandColor}`,
      `HIGHLIGHT COLOR: ${highlightColor || "#ff6600"}`,
      `SUBJECT: ${subjectInstruction}`,
      `CREATOR TYPE: ${creatorType}`,
      "",
      "Think carefully. Which TYPE (A/B/C) does this topic belong to?",
      "Then choose the right pose archetype for that type.",
      "Then generate the full plan:",
      "{",
      '  "needsMoreInfo": false,',
      '  "revolutionType": "A or B or C",',
      '  "poseArchetype": "THE ACHIEVER / THE CHALLENGER / THE REVEALER / THE DISRUPTOR / THE DESTROYER",',
      '  "conceptTitle": "5-word explosive thumbnail concept",',
      '  "ctrAnalysis": "2 sentences on why this thumbnail will stop thumbs mid-scroll",',
      '  "compositionStrategy": "1 sentence on layout",',
      '  "subjectPose": "VERY DETAILED pose — body position, face expression, exact prop description, lighting direction, energy description — minimum 40 words",',
      '  "overlayConfig": {',
      `    "accentColor": "${highlightColor || "#ff6600"}",`,
      '    "topBadge": "TYPE-APPROPRIATE badge text",',
      '    "topBadgeColor": "#cc0000",',
      '    "headline1": "POWER WORD 1-2 words",',
      '    "headline2": "TOPIC 2 words",',
      '    "bannerText": "viral Hinglish statement max 7 words",',
      '    "bannerAccentWord": "the most impactful word in the banner",',
      '    "showAlertCard": true,',
      '    "alertTitle": "dramatic claim title",',
      '    "alertBody": "1 punchy sentence that makes viewer afraid to miss out",',
      '    "alertType": "success or error or warning",',
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
        temperature: 1.0,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Engine API failed: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    let plan = JSON.parse(data.choices[0].message.content);

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
   Completely separate from normal mode. Designed for explosive,
   cinematic, emotionally-charged thumbnails.
   ═══════════════════════════════════════════════════════════════════ */
function buildRevolutionaryImagePrompt(plan, { videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType }) {
  const oc = plan.overlayConfig || {};
  const accent = highlightColor || oc.accentColor || "#ff6600";
  const pose = plan.subjectPose || "standing tall with one arm raised in a confident fist-pump, beaming smile, holding a glowing stopwatch, looking directly at camera with intense pride";

  /* ── Subject block ─────────────────────────────────────────────── */
  const subjectBlock = hasSubjectPhoto
    ? `SUBJECT — MULTI-ANGLE FACE REFERENCE PROVIDED:
The reference images contain Front, Left, and Right profile shots of the creator.
Reconstruct their EXACT face: bone structure, skin tone, eye color, jawline, hair — with 100% photorealistic precision.
${poseMode === "ai"
  ? `Place them in this specific pose: "${pose}"
  CRITICAL POSE RENDERING RULES:
  - This must look like a REAL PHOTO, not CGI — the body must be anatomically grounded and natural
  - The pose must feel INTENSE but BELIEVABLE for an education creator — not a superhero or an action movie character
  - Lighting: Split cinematic rim lighting — ${brandColor} from left side, ${accent} from right side, creating a dramatic glow on their face and shoulders
  - Their expression must be the central emotional anchor of the thumbnail — the viewer must feel the energy from their face alone`
  : `Keep their exact reference pose. Apply dramatic split lighting: ${brandColor} from left, ${accent} from right. Add floating particle effects and depth.`
}`
    : `SUBJECT — Create a confident, handsome Indian educator/presenter:
Pose: "${pose}"
Look: Well-groomed, professional, between 20-35 years old, dark clothing that pops against the background
Lighting: Split dramatic lighting — ${brandColor} from left, ${accent} from right — cinematic rim light effect
Expression: The core emotional anchor — must be immediately readable and intensely engaging`;

  /* ── Text elements ─────────────────────────────────────────────── */
  const textElements = [];

  if (oc.topBadge) {
    const badgeColor = oc.alertType === "success" ? "#16a34a" : "#cc0000";
    textElements.push(
      `TOP-LEFT CORNER — Bold pill-shaped badge:
  ALL CAPS text "${oc.topBadge}" in pure white, on solid ${badgeColor} background
  Badge has a subtle glow halo, sharp rounded corners — looks like an urgent broadcast label`
    );
  }

  if (oc.headline1 || oc.headline2) {
    const h1 = oc.headline1 ? `"${oc.headline1.toUpperCase()}"` : null;
    const h2 = oc.headline2 ? `"${oc.headline2.toUpperCase()}"` : null;
    textElements.push(
      `MAIN HEADLINE — Left-center of frame, MASSIVE, stacked:
  ${h1 ? `Line 1: ${h1} — Impact/ultra-bold condensed font, pure WHITE, takes up 35-40% of the frame height, 3D emboss with slight shadow, NOT flat` : ""}
  ${h2 ? `Line 2: ${h2} — same massive size, ITALIC, glowing ${accent} color, feels like it is lit from within` : ""}
  Both lines flush left, slightly overlapping — massive scale is the key`
    );
  }

  if (oc.showAlertCard && oc.alertTitle) {
    const alertBg = oc.alertType === "error" ? "#cc0000" : oc.alertType === "success" ? "#16a34a" : "#d97706";
    textElements.push(
      `RIGHT SIDE — Breaking broadcast style card:
  Dark semi-transparent background with a thick ${alertBg} left-border stripe (like a news ticker)
  Red "⚠ BREAKING" label at top
  Main title: "${oc.alertTitle.toUpperCase()}" in white, bold, large
  Body: "${(oc.alertBody || "").slice(0, 80)}"
  Feels urgent, official, TV broadcast quality`
    );
  }

  if (oc.bannerText) {
    const upper = oc.bannerText.toUpperCase();
    const accentWord = oc.bannerAccentWord ? oc.bannerAccentWord.toUpperCase() : null;
    const bannerDesc = accentWord
      ? `"${upper}" — the word "${accentWord}" blazing in ${accent}, the rest in pure white`
      : `"${upper}" in white`;
    textElements.push(
      `FULL-WIDTH BOTTOM BANNER:
  Pure black background with a 2px ${accent} line at the top edge
  Impact bold condensed font: ${bannerDesc}
  Text large enough to read at thumbnail size`
    );
  }

  const textSection = textElements.length > 0
    ? textElements.map((el, i) => `${i + 1}. ${el}`).join("\n\n")
    : `Massive white 3D-emboss Impact text left-aligned, ${accent} glow on secondary text`;

  /* ── Environment ───────────────────────────────────────────────── */
  const envByCreatorType = {
    gaming: `Explosive battle arena with neon particle explosions in ${brandColor} and ${accent}, dark apocalyptic scene, embers and sparks floating`,
    vlogs: `Dramatic location that is literally shattering into light particles around the subject — cinematic slow-motion explosion of the mundane world`,
    education: `Dark, dramatic academic environment transformed into an energy field — books, papers, equations and physics diagrams exploding outward in slow motion from a central light burst point directly behind the subject, forming a halo of flying pages and glowing formulas around them`,
  };
  const environment = envByCreatorType[creatorType] || envByCreatorType.education;

  return (
    `Generate a COMPLETE, ultra-cinematic, HIGH-CTR YouTube thumbnail that feels like a cultural earthquake. ` +
    `Every element below MUST appear in the final image. This is the finished, upload-ready thumbnail.\n\n` +

    `REFERENCE AESTHETIC: The best Indian education thumbnails (Physics Wallah, Vedantu) crossed with the most explosive international creator thumbnails (MrBeast's biggest milestones). ` +
    `High production value, intensely dramatic, but BELIEVABLE for an education context.\n\n` +

    `FORMAT: 16:9 landscape (1280x720)\n\n` +

    `TOPIC: ${videoTopic}\n\n` +

    `ATMOSPHERE (defines everything):\n` +
    `- Background: ${environment}\n` +
    `- Color temperature: DARK and INTENSE — deep blacks dominate, with ${brandColor} and ${accent} as the primary light sources\n` +
    `- Lighting: Dramatic split rim lighting — ${brandColor} from left, ${accent} from right\n` +
    `- Particles: Glowing embers, sparks, floating light dust in the air\n` +
    `- Vignette: Strong dark edge vignette pulling focus to center\n` +
    `- Depth of field: Background slightly bokeh, subject razor sharp\n\n` +

    `SUBJECT:\n${subjectBlock}\n\n` +

    `TEXT & OVERLAY ELEMENTS (all must be crisp, clear, readable at small sizes):\n` +
    textSection + `\n\n` +

    `TYPOGRAPHY:\n` +
    `- Impact / ultra-bold condensed sans-serif for headlines\n` +
    `- Headlines have 3D emboss or extrude effect — NOT flat\n` +
    `- Strong dark drop shadow on all text for contrast\n` +
    `- Every character perfectly spelled and sharp\n\n` +

    `ANATOMY (CRITICAL):\n` +
    `- Subject has EXACTLY two natural arms and hands\n` +
    `- Hands are anatomically perfect — no extra fingers\n` +
    `- ZERO extra limbs or floating hands\n\n` +

    `AVOID:\n` +
    `- Soft pastel backgrounds\n` +
    `- Calm or neutral expressions\n` +
    `- Stock photo poses (basic pointing, standing straight)\n` +
    `- Superhero or over-the-top action movie poses that look unrealistic for an educator\n` +
    `- Generic lecture hall background without dramatic transformation\n\n` +

    `QUALITY: Photorealistic, cinematic, 4K level detail. ` +
    `The thumbnail must feel like it was shot by a professional film crew AND designed by a top-tier creative agency. ` +
    `The viewer must feel a physical urge to click it.`
  );
}

/* ── Fallback plan (no API key) ────────────────────────────────────── */
function buildRevolutionaryFallbackPlan({ videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode }) {
  const t = (videoTopic || "").toLowerCase();
  const isAchievement = t.includes("hour") || t.includes("complete") || t.includes("full") || t.includes("mein") || t.includes("poora") || t.includes("khatam");
  const isAnnouncement = t.includes("postpone") || t.includes("result") || t.includes("cancel") || t.includes("breaking");

  const plan = {
    needsMoreInfo: false,
    revolutionType: isAnnouncement ? "B" : "A",
    poseArchetype: isAnnouncement ? "THE REVEALER" : "THE ACHIEVER",
    conceptTitle: isAchievement ? "Record-Breaking Achievement Unlocked" : "Game-Changing Announcement",
    ctrAnalysis:
      "The explosive visual achievement angle creates instant curiosity and FOMO — viewers feel they're about to miss the most efficient study session ever made. The dramatic cinematic environment signals premium, high-value content.",
    compositionStrategy:
      "Subject ACHIEVER pose LEFT with epic prop, massive achievement headline CENTER-LEFT, breaking alert card RIGHT, viral Hinglish banner BOTTOM.",
    subjectPose: isAchievement
      ? "standing confidently, one arm raised in a triumphant fist-pump at shoulder height, massive beaming smile, eyes bright and locked on camera, holding a glowing stopwatch in the other hand showing a 6-hour countdown, dramatic ${brandColor} rim light from left and ${accent} from right, extremely proud and victorious energy"
      : "both arms spread wide open to the sides with palms facing camera, eyes wide in dramatic shock/excitement, mouth open in awe, holding a glowing official document, dramatic split lighting",
    overlayConfig: {
      accentColor: highlightColor || "#ff6600",
      topBadge: isAchievement ? "RECORD BROKEN" : "BREAKING",
      topBadgeColor: isAchievement ? "#16a34a" : "#cc0000",
      headline1: isAchievement ? "IMPOSSIBLE" : "BREAKING",
      headline2: "ACHIEVEMENT",
      bannerText: isAchievement ? "Poora syllabus khatam kar do aaj!" : "Yeh news miss mat karna!",
      bannerAccentWord: isAchievement ? "khatam" : "miss",
      showAlertCard: true,
      alertTitle: isAchievement ? "RECORD BROKEN" : "OFFICIAL UPDATE",
      alertBody: videoTopic.slice(0, 80),
      alertType: isAchievement ? "success" : "error",
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

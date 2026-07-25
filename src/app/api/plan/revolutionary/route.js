import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";
import { checkRateLimit } from "../../../../lib/rate-limit";

/* ═══════════════════════════════════════════════════════════════════
   REVOLUTIONARY MODE — Education Creator Edition.
   
   The revolution here is:
   1. FREE premium content — giving away what others charge thousands for
   2. Unprecedented scale — doing something that has never been done before
   3. Student champion — genuinely fighting for students when nobody else does
   
   Energy: Not conspiracy. Not drama. 
   It's the feeling of a hero arriving to save the day for students.
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
      const plan = buildRevolutionaryFallbackPlan({ videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType });
      return NextResponse.json({ success: true, needsMoreInfo: false, plan, isMock: true });
    }

    /* ── Subject instruction ─────────────────────────────────────── */
    const subjectInstruction = hasSubjectPhoto
      ? `Multi-angle reference photos (Front, Left, Right) of the creator have been provided. Pose mode: "${poseMode}" — ${
          poseMode === "ai"
            ? "Design a HIGH-CTR pose that communicates the creator as a STUDENT CHAMPION — someone who just did something incredible for students. The pose should feel generous, victorious, and deeply authentic. Think: the most inspiring version of a passionate educator who genuinely cares about students."
            : "Keep their reference pose. Apply dramatic cinematic lighting and energy around them."
        }. Reconstruct their exact face and likeness with 100% precision.`
      : "No subject photo. Create a passionate, warm yet intense Indian educator — someone who looks like they genuinely care about students and just pulled off something remarkable.";

    /* ── System Prompt ─────────────────────────────────────────────── */
    const systemPrompt = [
      "You are the world's most high-impact YouTube thumbnail strategist, specializing in Indian education content.",
      "",
      "CRITICAL CONTEXT — Read this before designing anything:",
      "This creator has chosen REVOLUTIONARY MODE. The revolution is genuine:",
      "  1. Giving PREMIUM quality content completely FREE — when coaching institutes charge thousands for the same",
      "  2. Covering entire subjects in record time with high quality",
      "  3. Being a STUDENT CHAMPION — fighting for students when nobody else does",
      "",
      "The emotional core: GRATITUDE + DISBELIEF + URGENCY",
      "The student feels: 'This creator just gave me something PRICELESS. How is this real?'",
      "",
      "══════════════════════════════════════════════════",
      "⚠ ANTI-FAKE-FACTS RULE — READ THIS FIRST",
      "══════════════════════════════════════════════════",
      "NEVER invent superlative claims that cannot be verified. FORBIDDEN phrases:",
      "- 'India ka pehla' (unless the topic explicitly says first ever)",
      "- 'World's first', 'Never done before in history'",
      "- Any date, number, or statistic not mentioned in the video topic",
      "Instead, use SUBJECTIVE power words that feel truthful: 'COMPLETE', 'POORA', 'FULL', 'KHATAM', 'FREE', 'EK VIDEO MEIN'",
      "",
      "══════════════════════════════════════════════════",
      "⭐ CONTEXT RULE — MOST IMPORTANT FOR RELEVANCE",
      "══════════════════════════════════════════════════",
      "The video topic ALWAYS contains specific context: university name, board, semester, subject, time frame.",
      "This specific context MUST be the star of the thumbnail. It is what makes students stop scrolling.",
      "RGPV students scroll past generic 'PHYSICS' thumbnails — they stop for 'RGPV PHYSICS SEM 2'.",
      "RULE: If topic mentions a university/board/exam (RGPV, AKTU, GTU, VTU, CBSE etc.) → it MUST appear in headline2 or topBadge prominently.",
      "RULE: If topic mentions a semester/year/subject → include it in the headline or badge.",
      "RULE: Never make the headline generic when specific context is available.",
      "Example: Topic = 'RGPV Physics Sem 2 full in 6 hours free' → headline2 = 'RGPV SEM 2' NOT just 'PHYSICS'",
      "",
      "═══════════════════════════════════════",
      "REVOLUTION TYPE — Based on the topic:",
      "═══════════════════════════════════════",
      "",
      "TYPE 1 — FREE PREMIUM (topic is about teaching/covering content for free):",
      "  HEADLINE LINE 1: BILKUL FREE / PURA FREE / ZERO COST / FREE MEIN",
      "  HEADLINE LINE 2: The SPECIFIC subject + context (e.g. RGPV PHYSICS, AKTU MATHS)",
      "  TOP BADGE: 'FREE FOR ALL' / 'ZERO COST' / 'SABKA BHAI' / 'COACHING SE AZAAD'",
      "  BANNER: e.g. '[Subject] coaching ka kharch bachao — yeh FREE hai!'",
      "  ALERT CARD title: e.g. 'COACHING KI ZAROORAT NAHI' or '100% FREE'",
      "",
      "TYPE 2 — COMPLETE COVERAGE (topic is about covering full syllabus/subject):",
      "  HEADLINE LINE 1: POORA KHATAM / COMPLETE / EK VIDEO / FULL SYLLABUS",
      "  HEADLINE LINE 2: The SPECIFIC subject + context (e.g. RGPV PHYSICS, SEM 2 MATHS)",
      "  TOP BADGE: 'FULL SYLLABUS' / 'EK VIDEO MEIN' / 'ONE SHOT' / 'COMPLETE'",
      "  BANNER: e.g. '[Subject] poora khatam — ek hi video mein FREE!'",
      "  ALERT CARD title: e.g. 'COMPLETE [SUBJECT] FREE' or 'POORA SYLLABUS EK VIDEO'",
      "",
      "TYPE 3 — STUDENT SAVIOR (topic is about helping students at a critical moment):",
      "  HEADLINE LINE 1: SIRF TUMHARE LIYE / STUDENTS KE LIYE / TUMHARA BHAI",
      "  HEADLINE LINE 2: The SPECIFIC subject + context",
      "  TOP BADGE: 'STUDENT FIRST' / 'SIRF TUMHARE LIYE' / 'TUMHARA BHAI'",
      "  BANNER: e.g. 'Coaching loot raha tha — yeh FREE de raha hai!'",
      "  ALERT CARD title: e.g. 'YEH SIRF [SPECIFIC SUBJECT] STUDENTS KE LIYE'",
      "",
      "Pick the TYPE that best matches the video topic.",
      "",
      "═══════════════════════════════════════",
      "SUBJECT POSE — SERIOUS OVER CELEBRATORY",
      "═══════════════════════════════════════",
      "",
      "IMPORTANT: Serious, intense, sincere poses perform BETTER in this mode than celebratory ones.",
      "The student should feel the creator is COMMITTED and SERIOUS about helping them — not just excited.",
      "",
      "POSE A — HAATH JODNA / NAMASTE (PRIMARY RECOMMENDATION — most authentic for Indian education):",
      "  Body: Both hands folded together at chest level in a respectful namaste gesture, head slightly bowed forward in humility",
      "  Face: Sincere, warm, serious smile — not a big grin, a genuine grateful look — eyes soft but intense",
      "  Energy: 'I am doing this for you with all my heart. Please take this gift.' — humble commitment",
      "  Prop: A glowing textbook or formula sheet held between the folded hands, or floating beside them",
      "",
      "POSE B — THE COMMITMENT (hand on heart, direct gaze):",
      "  Body: One hand flat on chest over heart, other hand relaxed at side or holding prop",
      "  Face: Deeply serious, sincere, direct eye contact — a solemn promise",
      "  Energy: 'I swear on my students — this is real. I am here for you.'",
      "  Prop: Holding a glowing book or syllabus in the free hand, or a glowing FREE badge",
      "",
      "POSE C — THE ACHIEVER (grounded, not jumping):",
      "  Body: Standing straight, chin slightly lifted, arms relaxed but confident — like someone who just finished something massive",
      "  Face: Proud, calm, direct eye contact — the quiet confidence of someone who already won",
      "  Energy: 'I said I would do it. I did it. Here it is.'",
      "  Prop: Holding a glowing stopwatch showing the time, or a shining completed textbook",
      "",
      "CRITICAL POSE RULES:",
      "- AVOID big jumping/fist-pumping action hero poses — they look fake for education content",
      "- AVOID excited/hyped-up celebrity expressions — this creator is SINCERE, not a showman",
      "- The expression must make a student think: 'This creator genuinely cares about me'",
      "- Prop must GLOW or have light-burst effect — never look plain or clean-academic",
      "",
      "TEXT RULES:",
      "- HEADLINE LINE 2 MUST include the specific university/board/subject from the video topic — NOT generic",
      "- BANNER must feel urgent, student-first, Hinglish — like the most important WhatsApp forward",
      "- NO invented facts or fake superlatives",
      "",
      "Respond ONLY with valid raw JSON — no markdown, no code blocks.",
    ].join("\n");

    const userPrompt = [
      `VIDEO TOPIC: "${videoTopic}"`,
      `BRAND COLOR: ${brandColor}`,
      `HIGHLIGHT COLOR: ${highlightColor || "#f5d800"}`,
      `SUBJECT: ${subjectInstruction}`,
      `CREATOR TYPE: ${creatorType}`,
      "",
      "STEP 1: Extract SPECIFIC context from the video topic (university name, board, semester, subject, time). This context is the most important part.",
      "STEP 2: Determine which TYPE (1/2/3) fits the topic.",
      "STEP 3: Choose the pose. Prefer HAATH JODNA or COMMITMENT over celebratory poses.",
      "STEP 4: Generate the plan. HEADLINE LINE 2 MUST include the specific context (e.g. RGPV SEM 2, not just PHYSICS).",
      "",
      "IMPORTANT: Do NOT invent claims like 'India ka pehla' or 'World record'. Only use claims directly supported by the topic text.",
      "",
      "Generate the complete plan:",
      "{",
      '  "needsMoreInfo": false,',
      '  "revolutionType": "1 or 2 or 3",',
      '  "poseArchetype": "HAATH JODNA / THE COMMITMENT / THE ACHIEVER",',
      '  "conceptTitle": "5-word concept capturing the student champion energy",',
      '  "ctrAnalysis": "2 sentences on why THESE SPECIFIC students will immediately click",',
      '  "compositionStrategy": "1 sentence on layout",',
      '  "subjectPose": "VERY DETAILED pose — exact body position, face expression, specific prop with glow description, eye direction, emotional energy — minimum 50 words",',
      '  "overlayConfig": {',
      `    "accentColor": "${highlightColor || "#f5d800"}",`,
      '    "topBadge": "TYPE-APPROPRIATE badge — can include specific subject/university e.g. RGPV FREE",',
      '    "topBadgeColor": "#16a34a",',
      '    "headline1": "Power word — FREE or POORA or COMPLETE or KHATAM — 1-3 words",',
      '    "headline2": "MUST include the specific subject+context from topic (e.g. RGPV PHYSICS, SEM 2 MATHS) — 2-3 words",',
      '    "bannerText": "Viral Hinglish statement using the specific subject/context — max 7 words",',
      '    "bannerAccentWord": "the single most impactful word",',
      '    "showAlertCard": true,',
      '    "alertTitle": "What is the creator specifically giving students? Include subject/context.",',
      '    "alertBody": "1 sentence — specific, believable, no fake claims",',
      '    "alertType": "success",',
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
        temperature: 0.95,
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
   REVOLUTIONARY IMAGE PROMPT BUILDER — Student Champion Edition
   Cinematic, warm-yet-intense, generous energy
   ═══════════════════════════════════════════════════════════════════ */
function buildRevolutionaryImagePrompt(plan, { videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType }) {
  const oc = plan.overlayConfig || {};
  const accent = highlightColor || oc.accentColor || "#f5d800";
  const pose = plan.subjectPose || "standing in a respectful haath jodna namaste pose, both hands folded at chest level, sincere warm smile, eyes looking directly at camera with humble intensity, holding a glowing textbook near the folded hands, warm golden rim light from behind";
  const isNamaste = (plan.poseArchetype || "").toLowerCase().includes("haath") || pose.toLowerCase().includes("namaste") || pose.toLowerCase().includes("haath");

  /* ── Subject block ─────────────────────────────────────────────── */
  const subjectBlock = hasSubjectPhoto
    ? `SUBJECT — MULTI-ANGLE FACE REFERENCE PROVIDED:
The reference images contain Front, Left, and Right profile shots of the creator.
CRITICAL: Reconstruct their EXACT face — every feature, skin tone, jawline, hair, eye shape — with absolute photorealistic precision. The face must be identical to the reference.
${poseMode === "ai"
  ? `Now place them in this specific pose: "${pose}"
  POSE RENDERING RULES:
  - The body must look NATURAL and GROUNDED — this is a real person, a genuine educator
  - AVOID: jumping, mid-air poses, exaggerated action-hero fist-pumps above the head
  ${ isNamaste ? `- HAATH JODNA SPECIFIC: Both palms pressed firmly together at chest height, fingers pointing upward — the classic Indian namaste. Head with a slight humble forward bow. Render this gesture with full dignity and care.` : "" }
  - Their expression is the HEART of this thumbnail — sincere, committed, genuinely caring for students
  - Lighting: Warm golden-hour glow from above-right creating a halo effect, ${brandColor} subtle rim light from the left`
  : `Keep their exact reference pose. Apply warm cinematic lighting — golden from right, ${brandColor} rim from left. Floating light particles.`
}`
    : `SUBJECT — Create a passionate, handsome Indian educator/presenter:
Pose: "${pose}"
${ isNamaste ? `HAATH JODNA RENDERING: Both palms pressed together at chest level, fingers upward — classic Indian namaste. Head slightly bowed in humility. Expression: warm, sincere, deeply committed. NOT performative.` : "" }
Look: Well-groomed, professional, 22-32 years old, smart dark shirt or jacket
Expression: Sincere, committed, warm — the look of someone genuinely here for students, not for fame
Lighting: Warm golden rim light from behind creating a subtle hero halo, ${brandColor} subtle rim from left — cinematic and warm`;

  /* ── Text elements ─────────────────────────────────────────────── */
  const textElements = [];

  if (oc.topBadge) {
    textElements.push(
      `TOP-LEFT CORNER — Bold, positive pill badge:
  ALL CAPS text "${oc.topBadge}" in pure white on a rich GREEN (#16a34a) background
  Badge has a warm glow halo — signals good news, not danger
  Sharp rounded corners, like a "VERIFIED" or "GIFT" label`
    );
  }

  if (oc.headline1 || oc.headline2) {
    const h1 = oc.headline1 ? `"${oc.headline1.toUpperCase()}"` : null;
    const h2 = oc.headline2 ? `"${oc.headline2.toUpperCase()}"` : null;
    textElements.push(
      `MAIN HEADLINE — Left-center, MASSIVE, stacked:
  ${h1 ? `Line 1: ${h1} — Impact/ultra-bold condensed font, pure BRIGHT WHITE, takes up 35% of frame height, 3D emboss effect, golden drop-shadow (not red — warm and triumphant)` : ""}
  ${h2 ? `Line 2: ${h2} — same massive size, ITALIC, glowing ${accent} yellow/orange — feels like it is lit by fire or sunlight from within` : ""}
  Both lines flush left — MASSIVE scale is essential`
    );
  }

  if (oc.showAlertCard && oc.alertTitle) {
    textElements.push(
      `RIGHT SIDE — Positive achievement card (like a prize reveal or good news card):
  Dark semi-transparent background with a thick GREEN (#16a34a) left-border stripe
  Green "✅ OFFICIAL" or "🎁 FREE" label at top
  Main title: "${oc.alertTitle.toUpperCase()}" in white, bold, large
  Body: "${(oc.alertBody || "").slice(0, 80)}"
  IMPORTANT: This card must feel like GOOD NEWS — like a gift announcement, not a warning or danger signal`
    );
  }

  if (oc.bannerText) {
    const upper = oc.bannerText.toUpperCase();
    const accentWord = oc.bannerAccentWord ? oc.bannerAccentWord.toUpperCase() : null;
    const bannerDesc = accentWord
      ? `"${upper}" — the word "${accentWord}" blazing in ${accent} yellow, the rest in pure white`
      : `"${upper}" in white`;
    textElements.push(
      `FULL-WIDTH BOTTOM BANNER:
  Very dark (near black) background with a 2px ${accent} line at the top
  Impact bold condensed font: ${bannerDesc}
  This is the final emotional hook — the banner must feel like the most important thing a student could read today`
    );
  }

  const textSection = textElements.length > 0
    ? textElements.map((el, i) => `${i + 1}. ${el}`).join("\n\n")
    : `Massive white Impact text left-aligned, ${accent} glow on secondary text, green badge top-left`;

  /* ── Environment ───────────────────────────────────────────────── */
  const environment = creatorType === "gaming"
    ? `Epic gaming arena with golden particle explosions, confetti raining down — a victory celebration scene`
    : creatorType === "vlogs"
    ? `Cinematic location with warm golden-hour lighting, depth of field — feels like a movie poster moment`
    : `Dark-to-golden gradient environment: bottom is deep dark (near black with ${brandColor} tint), but ERUPTING upward into warm golden light rays from behind the subject — like a sunrise breaking through darkness. Flying pages, equations, and physics diagrams float in the golden light around the subject. It should look like KNOWLEDGE breaking free and being given away. The background communicates: 'Something unprecedented is happening here.'`;

  return (
    `Generate a COMPLETE, ultra-cinematic, HIGH-CTR YouTube thumbnail that communicates one thing above all else: ` +
    `this creator just did something GENUINELY UNPRECEDENTED and GENUINELY GOOD for students. ` +
    `Every element below MUST appear in the final image. This is the finished, upload-ready thumbnail.\n\n` +

    `CORE EMOTIONAL MESSAGE: A student seeing this thumbnail must feel: ` +
    `"This creator is on MY side. They just gave me something PRICELESS for FREE that I desperately needed. I have to watch this RIGHT NOW."\n\n` +

    `REFERENCE AESTHETIC: The best Physics Wallah thumbnails (genuine, warm, student-first) but elevated to ` +
    `a cinematic level — like a Bollywood climax scene where the hero arrives to save students.\n\n` +

    `FORMAT: 16:9 landscape (1280x720)\n\n` +

    `TOPIC: ${videoTopic}\n\n` +

    `ATMOSPHERE (defines everything — READ CAREFULLY):\n` +
    `- Background: ${environment}\n` +
    `- Overall mood: TRIUMPHANT and WARM — NOT dark, NOT cold, NOT horror. This is a VICTORY scene.\n` +
    `- Color temperature: Deep darks at edges transitioning to warm golden light at center-top\n` +
    `- ${brandColor} used as a subtle atmospheric rim light on the subject from the left\n` +
    `- ${accent} used as the warm accent glow — sunlight, achievement, triumph\n` +
    `- Particles: Warm golden light dust, floating pages, sparkles — NEVER embers or fire sparks (this isn't danger)\n` +
    `- Depth of field: Background slightly bokeh, subject razor sharp\n` +
    `- Vignette: Subtle dark vignette at the very edges only\n\n` +

    `SUBJECT:\n${subjectBlock}\n\n` +

    `TEXT & OVERLAY ELEMENTS:\n` +
    textSection + `\n\n` +

    `TYPOGRAPHY:\n` +
    `- Impact / ultra-bold condensed sans-serif for headlines\n` +
    `- 3D emboss with GOLDEN drop shadow (not red — this is triumph, not danger)\n` +
    `- All text sharp, perfectly spelled, readable at thumbnail size\n\n` +

    `ANATOMY (CRITICAL):\n` +
    `- Subject has EXACTLY two natural arms and hands\n` +
    `- Hands anatomically perfect — no extra fingers\n` +
    `- ZERO extra limbs or floating body parts\n\n` +

    `CRITICALLY AVOID:\n` +
    `- Dark horror-movie lighting\n` +
    `- Cold blue or grey color palettes\n` +
    `- Conspiracy/exposé vibes — no evil-looking expressions\n` +
    `- Superhero CGI poses — keep it real and grounded\n` +
    `- Generic, calm, stock-photo educator poses\n` +
    `- Fire, explosions, destruction — this is a GIFT, not a weapon\n\n` +

    `QUALITY: Photorealistic, 4K, cinematic. ` +
    `The thumbnail must look like it was shot by a Bollywood film crew and designed by the best creative agency in India. ` +
    `A student scrolling at 11pm before their exam must physically stop and feel hope when they see it.`
  );
}

/* ── Fallback plan (no API key) ────────────────────────────────────── */
function buildRevolutionaryFallbackPlan({ videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType }) {
  const t = (videoTopic || "").toLowerCase();
  const hasFree = t.includes("free") || t.includes("bilkul");
  const hasRecord = t.includes("hour") || t.includes("ghante") || t.includes("complete") || t.includes("full") || t.includes("poora") || t.includes("khatam");
  const type = hasFree ? "1" : hasRecord ? "2" : "3";

  const plan = {
    needsMoreInfo: false,
    revolutionType: type,
    poseArchetype: type === "1" ? "THE GIFT GIVER" : "THE ACHIEVER",
    conceptTitle: type === "1" ? "Unprecedented Free Gift For Students" : "Record-Breaking Student Miracle",
    ctrAnalysis:
      "Students immediately recognize this creator as a champion who gives them what coaching institutes charge lakhs for. The warm cinematic energy and triumphant achievement messaging creates instant emotional connection and FOMO.",
    compositionStrategy:
      "Subject in triumphant pose LEFT with glowing prop, massive FREE/RECORD headline CENTER-LEFT, achievement card RIGHT, viral Hinglish banner BOTTOM.",
    subjectPose: type === "1"
      ? "standing tall with both arms spread slightly open and forward in a generous offering gesture, massive warm beaming smile, eyes shining with genuine joy, holding a glowing golden badge that says FREE in one hand, warm golden rim light from behind and soft brand-color light from left, looking directly at camera with the expression of someone who just gave students the best gift of their life"
      : "standing confident and proud, one arm raised in a triumphant fist-pump at shoulder height (not above head — grounded and powerful), other hand holding a glowing stopwatch showing the achievement time, massive proud smile, direct eye contact, chin slightly lifted, warm golden cinematic lighting from behind creating a halo effect",
    overlayConfig: {
      accentColor: highlightColor || "#f5d800",
      topBadge: type === "1" ? "FREE FOR ALL" : "RECORD BROKEN",
      topBadgeColor: "#16a34a",
      headline1: type === "1" ? "BILKUL FREE" : "RECORD BROKEN",
      headline2: "PHYSICS",
      bannerText: type === "1" ? "Jo coaching mein ₹50,000 tha — aaj FREE!" : "6 ghante mein poori physics khatam!",
      bannerAccentWord: type === "1" ? "FREE" : "khatam",
      showAlertCard: true,
      alertTitle: type === "1" ? "100% FREE — NO CATCH" : "INDIA KA PEHLA RECORD",
      alertBody: videoTopic.slice(0, 80),
      alertType: "success",
      showDateCallout: false,
      dateText: null,
      dateIcon: null,
    },
    imagePrompt: "",
  };

  plan.imagePrompt = buildRevolutionaryImagePrompt(plan, {
    videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType: creatorType || "education",
  });

  return plan;
}

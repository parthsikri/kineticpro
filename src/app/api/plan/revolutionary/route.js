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
      "This creator has chosen REVOLUTIONARY MODE. For THIS creator, 'revolutionary' does NOT mean conspiracy, drama, or 'they lied'.",
      "It means they are doing something GENUINELY UNPRECEDENTED for students:",
      "  1. Giving away PREMIUM quality content completely FREE — when coaching institutes charge ₹5,000-₹50,000 for the same thing",
      "  2. Doing something at a SCALE that has never been done before — covering entire syllabi in hours, not weeks",
      "  3. Being a STUDENT CHAMPION — fighting for students when nobody else does",
      "",
      "The emotional core of this thumbnail is: GRATITUDE + DISBELIEF + URGENCY",
      "The student viewer should feel: 'This creator just gave me something PRICELESS for free. How is this real?'",
      "",
      "═══════════════════════════════════════",
      "REVOLUTION TYPE — Based on the topic:",
      "═══════════════════════════════════════",
      "",
      "TYPE 1 — FREE PREMIUM (when content is about teaching/covering content):",
      "  The revolution: 'Coaching institutes charge lakhs. This creator gives it FREE.'",
      "  HEADLINE LINE 1: BILKUL FREE / ABSOLUTELY FREE / ZERO COST / PURA FREE",
      "  HEADLINE LINE 2: The subject (e.g. PHYSICS, MATHS) in accent color",
      "  TOP BADGE: 'FREE FOR ALL' / 'ZERO COST' / 'SABKA BHAI' / 'GIFT FOR STUDENTS'",
      "  BANNER: e.g. 'Jo ₹50,000 mein milta tha — aaj FREE hai!'",
      "  ALERT CARD title: e.g. '100% FREE — NO CATCH' or 'COACHING KI ZAROORAT NAHI'",
      "  ALERT TYPE: success (green — this is good news for students)",
      "",
      "TYPE 2 — RECORD-BREAKING COVERAGE (when the topic is about covering a subject in record time):",
      "  The revolution: 'Nobody has ever made content this comprehensive, this fast, this good, and this FREE.'",
      "  HEADLINE LINE 1: RECORD BROKEN / NEVER DONE / PEHLI BAAR / FIRST EVER",
      "  HEADLINE LINE 2: The subject in accent color",
      "  TOP BADGE: 'RECORD BROKEN' / 'HISTORIC' / 'FIRST EVER' / 'PEHLI BAAR'",
      "  BANNER: e.g. '6 ghante mein poori physics — pehli baar India mein!'",
      "  ALERT CARD title: e.g. 'INDIA KA PEHLA 6-HOUR PHYSICS' or 'RECORD BROKEN'",
      "  ALERT TYPE: success (green)",
      "",
      "TYPE 3 — STUDENT SAVIOR (when topic is about helping students in a critical moment):",
      "  The revolution: 'When everyone was charging money and gatekeeping — this creator showed up for students.'",
      "  HEADLINE LINE 1: SIRF STUDENTS / FOR STUDENTS / STUDENT FIRST / TUMHARE LIYE",
      "  HEADLINE LINE 2: The subject in accent color",
      "  TOP BADGE: 'STUDENT FIRST' / 'SIRF TUMHARE LIYE' / '100% FOR YOU'",
      "  BANNER: e.g. 'Coaching wale loot rahe the — yeh FREE mein de raha hai!'",
      "  ALERT CARD title: e.g. 'YEH SIRF STUDENTS KE LIYE' or 'COACHING KO JAWAB'",
      "  ALERT TYPE: success (green)",
      "",
      "Pick the TYPE that best matches the video topic. If topic mentions time (hours/ghante) → TYPE 2. If FREE is the main point → TYPE 1. If it is about being there for students → TYPE 3.",
      "",
      "═══════════════════════════════════════",
      "SUBJECT POSE — HIGH CTR FOR EDUCATION",
      "═══════════════════════════════════════",
      "",
      "The pose must communicate the STUDENT CHAMPION energy — authentic, warm, passionate, and intense. Choose ONE:",
      "",
      "POSE A — THE GIFT GIVER (best for Free Premium content):",
      "  Body: Both arms spread slightly open and forward — like offering something generously to the viewer",
      "  Face: Massive warm beaming smile, eyes crinkled with genuine joy — the expression of someone who just gave their best",
      "  Energy: 'I worked incredibly hard to make this and I'm giving it to you. This is my gift.'",
      "  Prop: Holding a glowing 'FREE' badge or a shining textbook that radiates golden light",
      "",
      "POSE B — THE ACHIEVER (best for Record-Breaking content):",
      "  Body: Standing tall and proud, one arm raised with a confident closed fist at shoulder height, not above head",
      "  Face: Triumphant smile, direct eye contact, chin slightly lifted — pure pride",
      "  Energy: 'I just did something nobody thought was possible. And I did it for YOU.'",
      "  Prop: A glowing stopwatch showing the record time, or a glowing textbook/syllabus with light bursting from it",
      "",
      "POSE C — THE CHAMPION (best for Student Savior content):",
      "  Body: Leaning slightly forward, one hand on chest (over heart), other hand pointing at camera",
      "  Face: Serious, intense, emotionally sincere — like making a solemn promise to the viewer",
      "  Energy: 'I am here for you. Not for money. Not for fame. For you specifically.'",
      "  Prop: Holding a glowing shield or a star — symbolic of protection/championing students",
      "",
      "CRITICAL POSE RULES:",
      "- The pose must look AUTHENTIC for an Indian education creator — warm, passionate, real",
      "- NOT an action movie hero. NOT a Bollywood villain. NOT a conspiracy theorist.",
      "- The expression should make a student think: 'This creator is on MY side'",
      "- Prop must GLOW or have a light-burst effect — never look plain or academic",
      "",
      "TEXT RULES:",
      "- HEADLINE must communicate the revolutionary gift or achievement — make the FREE aspect or record aspect impossible to miss",
      "- BANNER must feel like the most important WhatsApp forward a student will ever receive",
      "- All text: SHORT, PUNCHY, uses Hinglish naturally",
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
      "Determine: which revolution TYPE (1=Free Premium / 2=Record Breaking / 3=Student Savior) best fits this topic?",
      "Then pick the best pose (A/B/C) for that type.",
      "Generate the complete plan:",
      "{",
      '  "needsMoreInfo": false,',
      '  "revolutionType": "1 or 2 or 3",',
      '  "poseArchetype": "THE GIFT GIVER / THE ACHIEVER / THE CHAMPION",',
      '  "conceptTitle": "5-word concept that captures the student champion energy",',
      '  "ctrAnalysis": "2 sentences on why students will immediately click",',
      '  "compositionStrategy": "1 sentence on layout",',
      '  "subjectPose": "VERY DETAILED pose — exact body position, face expression, precise prop with glow/light description, eye direction, energy feeling — minimum 50 words",',
      '  "overlayConfig": {',
      `    "accentColor": "${highlightColor || "#f5d800"}",`,
      '    "topBadge": "TYPE-APPROPRIATE badge text from the options above",',
      '    "topBadgeColor": "#16a34a",',
      '    "headline1": "POWER WORD that communicates FREE or RECORD or CHAMPION — 1-3 words",',
      '    "headline2": "Subject/topic in 2 words",',
      '    "bannerText": "Most viral Hinglish statement a student could receive — max 7 words",',
      '    "bannerAccentWord": "the single most impactful word in the banner",',
      '    "showAlertCard": true,',
      '    "alertTitle": "The headline of the good news — what is the creator giving students?",',
      '    "alertBody": "1 sentence that makes the student feel this is exactly what they needed",',
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
  const pose = plan.subjectPose || "standing tall with a massive warm smile, one arm raised in a triumphant fist-pump at shoulder height, holding a glowing stopwatch in the other hand showing the record time, eyes looking directly at camera with intense pride and joy, dramatic golden rim light from behind";

  /* ── Subject block ─────────────────────────────────────────────── */
  const subjectBlock = hasSubjectPhoto
    ? `SUBJECT — MULTI-ANGLE FACE REFERENCE PROVIDED:
The reference images contain Front, Left, and Right profile shots of the creator.
CRITICAL: Reconstruct their EXACT face — every feature, skin tone, jawline, hair, eye shape — with absolute photorealistic precision. The face must be identical to the reference.
${poseMode === "ai"
  ? `Now place them in this specific pose: "${pose}"
  POSE RENDERING RULES:
  - The body must look NATURAL and GROUNDED — this is a real person, not a superhero or CGI character
  - Their expression is the HEART of the thumbnail — it must communicate warmth, triumph, and genuine care for students
  - Lighting: Warm golden-hour light from slightly above-right, PLUS the brand color ${brandColor} as a subtle rim light from the left — cinematic but warm
  - They should look like the most inspiring teacher a student has ever had, having just done something incredible`
  : `Keep their exact reference pose. Apply warm cinematic lighting — golden from right, ${brandColor} rim from left. Add floating light particles.`
}`
    : `SUBJECT — Create a passionate, handsome Indian educator/presenter:
Pose: "${pose}"
Look: Well-groomed, professional, between 22-32 years old, wearing a smart dark shirt or jacket
Expression: The MOST important element — warm, triumphant, genuinely caring — the look of someone who just gave students the best gift of their life
Lighting: Warm golden rim light from behind, ${brandColor} subtle rim from left — cinematic and warm, not cold or horror-movie dark`;

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

import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";
import { checkRateLimit } from "../../../../lib/rate-limit";

/* ═══════════════════════════════════════════════════════════════════
   REVOLUTIONARY MODE — Exam Panic CTR Edition
   Powered by MrBeast-level thumbnail psychology:
   - 0.5 second test
   - Mobile-first (180px readable)
   - Exam panic emotional triggers
   - Visual hierarchy: Face → Subject → Benefit → Badge
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
            ? "Design a HIGH-CTR pose optimised for exam-panicking students. The pose must communicate SERIOUS AUTHORITY and TRUST — not excitement. Preferred: HAATH JODNA (namaste) with a solemn, intense, unsmiling expression."
            : "Keep their reference pose. Apply dramatic cinematic lighting."
        }. Reconstruct their exact face and likeness with 100% precision.`
      : "No subject photo. Create a confident, serious, intense Indian educator — well-groomed, professional, 22-32 years old, unsmiling.";

    /* ── System Prompt ─────────────────────────────────────────────── */
    const systemPrompt = [
      "You are MrBeast's thumbnail strategist, a YouTube CTR expert, and a senior graphic designer who has worked on thumbnails generating over 100 million views.",
      "You specialise in Indian education content — specifically engineering students preparing for exams.",
      "Your ONLY job is to design a thumbnail plan that maximises CTR, stopping power, and conversion.",
      "You do NOT compliment. You do NOT play it safe. You design for maximum psychological impact.",
      "",
      "===============================================",
      "THE AUDIENCE — UNDERSTAND THIS BEFORE ANYTHING",
      "===============================================",
      "- Indian Engineering Students (B.Tech), age 18-24, mostly mobile users",
      "- Scrolling YouTube 2-5 days BEFORE their exam — they are in EXAM PANIC MODE",
      "- Internal monologue: 'I am behind. I need ONE video that saves everything. RIGHT NOW.'",
      "- Competing against: Physics Wallah, Unacademy, Adda247, Vedantu thumbnails",
      "- To win, the thumbnail must INSTANTLY communicate one of these 4 survival messages:",
      "  (a) I can still pass.",
      "  (b) This is the only video I need.",
      "  (c) This will save my exam.",
      "  (d) I don't need coaching anymore.",
      "",
      "============================================",
      "THE 0.5 SECOND TEST — DESIGN RULE #1",
      "============================================",
      "A panicking student on mobile sees this thumbnail for 0.5 seconds.",
      "In those 0.5 seconds, they must register: FACE -> SUBJECT -> BENEFIT.",
      "Visual hierarchy MUST follow this exact order:",
      "  1. FACE (expression — human brain processes faces in 33ms before reading any text)",
      "  2. HEADLINE (specific subject — RGPV PHYSICS SEM 2, never generic PHYSICS)",
      "  3. BENEFIT (FREE / KHATAM / COMPLETE — what they gain from watching)",
      "  4. BADGE or BANNER (confirmation + urgency signal)",
      "Any element disrupting this hierarchy kills CTR.",
      "",
      "============================================",
      "MOBILE FIRST — DESIGN RULE #2",
      "============================================",
      "Thumbnail seen at 180px wide on mobile. At 180px:",
      "- Only 2 text lines are readable. Everything else is visual noise.",
      "- Face must occupy at least 40% of the frame.",
      "- MAXIMUM 4 visual text regions: Badge | Headline | Alert Card Title | Banner.",
      "- More than 4 text regions = cognitive overload = no click.",
      "",
      "============================================",
      "EMOTIONAL TRIGGER HIERARCHY — DESIGN RULE #3",
      "============================================",
      "For exam panic students, triggers ranked by psychological power:",
      "  1. RELIEF — 'I can still save my exam' (most powerful trigger for panicking students)",
      "  2. URGENCY — 'This is available NOW and I need it NOW'",
      "  3. FEAR OF MISSING OUT — 'If I skip this I will regret it in the exam hall'",
      "  4. TRUST — 'This creator is genuinely for me, not trying to sell me'",
      "  5. ACHIEVEMENT — 'I will actually pass if I watch this'",
      "Design every element to trigger these emotions in this exact order.",
      "",
      "============================================",
      "EXAM PANIC OPTIMIZATION — DESIGN RULE #4",
      "============================================",
      "Students 2-3 days before exam must instantly feel:",
      "  - 'This is specifically made for MY exam (RGPV / AKTU / GTU etc.)'",
      "  - 'This creator understands exactly what I am going through'",
      "  - 'I can finish this subject in time if I watch this now'",
      "  - 'This is FREE so I have nothing to lose by clicking'",
      "Every text and visual element must reinforce at least one of these feelings.",
      "",
      "ANTI-FAKE-FACTS RULE: NEVER invent unverifiable claims.",
      "FORBIDDEN: 'India ka pehla', 'world record', 'never done before in history'.",
      "Use EMOTIONALLY TRUE words instead: COMPLETE / POORA / KHATAM / FREE / EK VIDEO MEIN / COACHING SE AZAAD",
      "",
      "CONTEXT RULE — SPECIFICITY = CTR:",
      "RGPV students scroll past 'PHYSICS'. They stop for 'RGPV PHYSICS SEM 2'.",
      "If topic mentions university/board/semester -> MUST appear in headline2. NEVER generic.",
      "Example: topic 'RGPV Physics Sem 2 in 6 hours free' -> headline2 = 'RGPV SEM 2'",
      "",
      "============================================",
      "REVOLUTION TYPE — Pick based on video topic",
      "============================================",
      "",
      "TYPE 1 — EXAM RESCUE / FREE PREMIUM (topic is about teaching for free):",
      "  Core survival message: 'Coaching charges Rs 50,000. This saves your exam for FREE.'",
      "  HEADLINE 1: BILKUL FREE / PURA FREE / FREE MEIN",
      "  HEADLINE 2: SPECIFIC subject+context (e.g. RGPV PHYSICS SEM 2)",
      "  BADGE: 'COACHING SE AZAAD' / 'FREE FOR ALL' / 'ZERO COST'",
      "  BANNER (max 5 words): e.g. 'Exam bacha lo — bilkul FREE!'",
      "  ALERT (max 4 words): '100% FREE' or 'COACHING NAHI CHAHIYE'",
      "",
      "TYPE 2 — SPEED COMPLETE / FULL COVERAGE (full syllabus in record time):",
      "  Core survival message: 'In X hours your ENTIRE exam is covered. Nothing else needed.'",
      "  HEADLINE 1: POORA KHATAM / EK VIDEO / COMPLETE",
      "  HEADLINE 2: SPECIFIC subject+context",
      "  BADGE: 'ONE SHOT' / 'FULL SYLLABUS' / 'EK VIDEO MEIN'",
      "  BANNER (max 5 words): e.g. 'Poori physics ek video mein!'",
      "  ALERT (max 4 words): 'FULL SYLLABUS FREE' or 'EXAM READY'",
      "",
      "TYPE 3 — STUDENT SAVIOR (creator as hero in student's moment of crisis):",
      "  Core survival message: 'When coaching failed you — this creator showed up.'",
      "  HEADLINE 1: TUMHARE LIYE / STUDENT FIRST",
      "  HEADLINE 2: SPECIFIC subject+context",
      "  BADGE: 'SIRF TUMHARE LIYE' / 'TUMHARA BHAI'",
      "  BANNER (max 5 words): e.g. 'Coaching chodo — yeh FREE hai!'",
      "  ALERT (max 4 words): 'SIRF [SUBJECT] STUDENTS KE LIYE'",
      "",
      "============================================",
      "FACE & EXPRESSION — THE SINGLE MOST IMPORTANT ELEMENT",
      "============================================",
      "Human brains process faces in 33ms — before reading ANY text.",
      "The expression IS the first message the student receives.",
      "For exam panic students: optimal expression = SERIOUS AUTHORITY + TRUST (NOT happiness).",
      "Think: a doctor who walks in and says 'I've got you. You're going to be fine.' — calm, intense, certain.",
      "",
      "POSE A — HAATH JODNA / NAMASTE (HIGHEST CTR — PRIMARY RECOMMENDATION):",
      "  Body: Both palms pressed together at chest level, fingers pointing upward — classic Indian namaste. Head with slight forward bow.",
      "  Face: SERIOUS and INTENSE — NOT smiling. Eyes looking directly at camera with quiet burning determination. Jaw set. Lips neutral. Brow slightly furrowed. The expression of someone making an UNBREAKABLE PROMISE to help students.",
      "  CTR psychology: Namaste = highest trust signal in Indian culture. Serious expression = 'I am doing this for you with my whole heart. Not for money.'",
      "  Prop: Glowing textbook or formula sheet near the folded hands, radiating warm golden light.",
      "",
      "POSE B — THE COMMITMENT (hand on heart, piercing direct gaze):",
      "  Body: One hand flat on chest over heart. Other hand holding glowing prop.",
      "  Face: DEEPLY SERIOUS — NOT smiling. Direct unblinking eye contact into lens. Slight furrowed brow. Jaw set. Warrior-level solemn vow.",
      "  CTR psychology: Hand-on-heart = universal 'I am being completely honest' signal. Serious gaze eliminates any doubt about sincerity.",
      "  Prop: Glowing syllabus or physics book.",
      "",
      "POSE C — THE QUIET CHAMPION (stoic grounded power):",
      "  Body: Standing straight, chin slightly lifted, arms relaxed — like someone who just completed a massive mission.",
      "  Face: PROUD but NOT smiling. Stoic, calm, intense. Eyes locked directly at camera. The face of someone who already won and is completely at peace with it.",
      "  CTR psychology: Stoic confidence + direct gaze = extreme authority and trust.",
      "  Prop: Glowing stopwatch or completed textbook.",
      "",
      "EXPRESSION RULES — NON-NEGOTIABLE:",
      "- REVOLUTIONARY MODE = SERIOUS. Zero smiling. Zero grinning. Zero excitement face.",
      "- Student must think: 'This person is DEAD SERIOUS about helping me. This is real.'",
      "- Eyes: intense and locked at camera — not looking away, not soft, not happy",
      "- Jaw: set and composed — not open in excitement",
      "- Prop: MUST GLOW — never look plain or academic",
      "",
      "TEXT / COGNITIVE LOAD RULES:",
      "- MAXIMUM 4 text regions: (1) badge top-left, (2) main headline, (3) alert card TITLE ONLY, (4) bottom banner",
      "- NO floating time callouts, NO timer icons, NO clock badges, NO extra text regions",
      "- HEADLINE 2 MUST include specific university/board from topic — NEVER generic subject name only",
      "- BANNER: max 5 words — must fit on one line at 180px thumbnail size",
      "- ALERT CARD: title ONLY, max 4 words — absolutely NO body paragraph text inside",
      "- No invented facts. No unverifiable superlatives.",
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
      "THINK LIKE A CTR EXPERT FOR EXAM-PANICKING STUDENTS:",
      "STEP 1: What is the SPECIFIC context? (university, board, semester, subject, time duration) — extract exactly.",
      "STEP 2: Which SURVIVAL MESSAGE does this topic communicate? (I can still pass / Only video I need / Will save my exam / No coaching needed)",
      "STEP 3: Which REVOLUTION TYPE (1/2/3) delivers that survival message best?",
      "STEP 4: Which POSE creates maximum TRUST for exam-panicking students? (HAATH JODNA strongly preferred)",
      "STEP 5: Plan the visual hierarchy — Face -> Headline (with specific context) -> Benefit -> Badge.",
      "",
      "STRICT RULES: No invented superlatives. headline2 MUST include specific university/subject. Banner max 5 words. Alert title max 4 words. Alert = title ONLY.",
      "",
      "Generate the complete plan:",
      "{",
      '  "needsMoreInfo": false,',
      '  "revolutionType": "1 or 2 or 3",',
      '  "survivalMessage": "which of the 4 survival messages this thumbnail communicates",',
      '  "emotionalTriggers": "which 2-3 triggers (Relief/Urgency/FOMO/Trust/Achievement) this activates",',
      '  "poseArchetype": "HAATH JODNA / THE COMMITMENT / THE QUIET CHAMPION",',
      '  "conceptTitle": "5-word concept that makes a panicking student stop scrolling",',
      '  "ctrAnalysis": "2 sentences — what specific psychological triggers make THIS student click in 0.5 seconds",',
      '  "visualHierarchy": "Face -> [element2] -> [element3] -> [element4]",',
      '  "compositionStrategy": "1 sentence on layout and placement",',
      '  "subjectPose": "VERY DETAILED: exact body position, SERIOUS face expression (NOT smiling), precise prop with glow description, eye direction, jaw/brow state, emotional energy — minimum 60 words",',
      '  "overlayConfig": {',
      `    "accentColor": "${highlightColor || "#f5d800"}",`,
      '    "topBadge": "TYPE-APPROPRIATE badge — include university/subject if possible (e.g. RGPV FREE)",',
      '    "topBadgeColor": "#16a34a",',
      '    "headline1": "Power word for benefit — FREE or POORA or KHATAM or COMPLETE — max 3 words",',
      '    "headline2": "MUST include specific subject+university/board context (e.g. RGPV PHYSICS SEM 2) — 2-3 words",',
      '    "bannerText": "Hinglish exam rescue statement — MAX 5 WORDS — readable at 180px",',
      '    "bannerAccentWord": "the single most emotionally charged word in the banner",',
      '    "showAlertCard": true,',
      '    "alertTitle": "Max 4 words — good news with subject/university context",',
      '    "alertBody": "Max 6 words — one ultra-short punchy line",',
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
   IMAGE PROMPT BUILDER — Exam Panic CTR Edition
   ═══════════════════════════════════════════════════════════════════ */
function buildRevolutionaryImagePrompt(plan, { videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode, creatorType }) {
  const oc = plan.overlayConfig || {};
  const accent = highlightColor || oc.accentColor || "#f5d800";
  const pose = plan.subjectPose || "standing in a haath jodna namaste pose, both palms pressed together at chest level, head slightly bowed, serious intense expression, eyes looking directly at camera with burning quiet determination, jaw set, not smiling, glowing physics textbook beside the folded hands, warm golden rim light from behind";
  const isNamaste = (plan.poseArchetype || "").toLowerCase().includes("haath") || pose.toLowerCase().includes("namaste") || pose.toLowerCase().includes("haath");

  /* ── Subject block ─────────────────────────────────────────────── */
  const subjectBlock = hasSubjectPhoto
    ? `SUBJECT — MULTI-ANGLE FACE REFERENCE PROVIDED:
The reference images contain Front, Left, and Right profile shots of the creator.
CRITICAL: Reconstruct their EXACT face — every feature, skin tone, jawline, hair, eye shape — with absolute photorealistic precision.
${poseMode === "ai"
  ? `Now place them in this specific pose: "${pose}"
  EXPRESSION RULES (MOST IMPORTANT — READ CAREFULLY):
  - The creator must look SERIOUS, INTENSE, and DETERMINED — NOT smiling, NOT laughing, NOT excited
  - Think: a doctor who walks in and says 'I've got you. You're going to be fine.' — calm authority, quiet power, certain
  - Eyes: intense, locked directly into the camera lens — narrowed slightly, looking at every student personally
  - Jaw: set and composed. Lips neutral or very slight pressed line — NOT a grin, NOT open
  - Eyebrows: slightly furrowed or neutral — communicating weight and commitment, not joy
  ${ isNamaste ? `- HAATH JODNA / NAMASTE SPECIFIC: Both palms pressed firmly together at chest height, fingers pointing upward — the classic Indian namaste. Head with a slight humble forward bow. The serious expression + namaste = a SOLEMN VOW to students. It must look sacred and sincere, not like a casual greeting.` : "" }
  - Lighting: Warm golden-hour glow from above-right creating a halo effect, ${brandColor} subtle cinematic rim light from the left`
  : `Keep their exact reference pose. Apply dramatic cinematic lighting — golden from right, ${brandColor} rim from left. Expression: serious and intense.`
}`
    : `SUBJECT — Create a confident, intense Indian educator/presenter:
Pose: "${pose}"
${ isNamaste ? `HAATH JODNA RENDERING: Both palms pressed together at chest level, fingers pointing upward — classic Indian namaste. Head slightly bowed in humility. This must feel like a SOLEMN VOW to students — sacred, sincere, powerful. NOT a casual greeting.` : "" }
Look: Well-groomed, professional, 22-32 years old, wearing a smart dark shirt or jacket
EXPRESSION (CRITICAL — MOST IMPORTANT): SERIOUS and INTENSE — NOT smiling, NOT grinning, NOT excited. Eyes locked into camera lens with burning, quiet determination. Jaw set and composed. Brow slightly furrowed. This is the face of someone who has made an unbreakable decision to help students.
Lighting: Warm golden rim light from above-right creating a subtle hero halo, ${brandColor} cinematic rim from left`;

  /* ── Text elements ─────────────────────────────────────────────── */
  const textElements = [];

  if (oc.topBadge) {
    textElements.push(
      `TOP-LEFT CORNER — Bold pill badge:
  ALL CAPS "${oc.topBadge}" in pure white on solid GREEN (#16a34a)
  Subtle warm glow halo around badge. Sharp rounded corners. Signals good news, not danger.`
    );
  }

  if (oc.headline1 || oc.headline2) {
    const h1 = oc.headline1 ? `"${oc.headline1.toUpperCase()}"` : null;
    const h2 = oc.headline2 ? `"${oc.headline2.toUpperCase()}"` : null;
    textElements.push(
      `MAIN HEADLINE — Left-center, MASSIVE stacked text:
  ${h1 ? `Line 1: ${h1} — Impact/ultra-bold condensed, pure BRIGHT WHITE, takes up 30-35% of frame height, 3D emboss with golden drop-shadow` : ""}
  ${h2 ? `Line 2: ${h2} — same massive size, ITALIC, glowing ${accent} — like lit from golden sunlight within` : ""}
  Both lines flush left. Scale is the weapon — must be readable at 180px.`
    );
  }

  if (oc.showAlertCard && oc.alertTitle) {
    textElements.push(
      `RIGHT SIDE — Clean, minimal good-news card:
  Dark semi-transparent background with thick GREEN (#16a34a) left-border stripe
  Small green "FREE" or "OFFICIAL" label at top
  TITLE ONLY: "${oc.alertTitle.toUpperCase()}" in white, bold, large
  IMPORTANT: NO body paragraph text inside this card. Title only. Clean. Uncluttered.`
    );
  }

  if (oc.bannerText) {
    const upper = oc.bannerText.toUpperCase();
    const accentWord = oc.bannerAccentWord ? oc.bannerAccentWord.toUpperCase() : null;
    const bannerDesc = accentWord
      ? `"${upper}" — word "${accentWord}" blazing in ${accent} yellow, rest in pure white`
      : `"${upper}" in pure white`;
    textElements.push(
      `FULL-WIDTH BOTTOM BANNER:
  Near-black background with 2px ${accent} top line
  Impact bold condensed: ${bannerDesc}
  Must be readable at 180px. This is the final emotional hook.`
    );
  }

  const textSection = textElements.length > 0
    ? textElements.map((el, i) => `${i + 1}. ${el}`).join("\n\n")
    : `Massive white Impact headline left-aligned, ${accent} glow on secondary text, green badge top-left`;

  /* ── Environment ───────────────────────────────────────────────── */
  const environment = creatorType === "gaming"
    ? `Epic arena with golden particle explosions — victory celebration`
    : creatorType === "vlogs"
    ? `Cinematic location with warm golden-hour lighting — movie poster moment`
    : `Dark-to-golden gradient: deep dark at the bottom edges (with a subtle ${brandColor} atmospheric tint), erupting upward into warm golden light rays from directly behind the subject — like a sunrise breaking through darkness. Physics equations, pages, and diagrams float in the golden light around the subject. The background communicates: 'Knowledge is being freed and given away.'`;

  return (
    `Generate a COMPLETE, ultra-cinematic, HIGH-CTR YouTube thumbnail. ` +
    `This thumbnail must communicate one thing above all else: an exam-panicking student sees this and immediately thinks 'This is exactly what I need. Right now.'\n\n` +

    `CORE EMOTION TO TRIGGER: RELIEF + URGENCY. The student must feel: 'I can still save my exam. This creator is doing this for ME.'\n\n` +

    `REFERENCE: Physics Wallah's most trusted thumbnails crossed with MrBeast's stopping power. ` +
    `Cinematic, serious, student-first — not flashy or hype-driven.\n\n` +

    `FORMAT: 16:9 landscape (1280x720). MOBILE PRIORITY: must be readable at 180px wide.\n\n` +

    `TOPIC: ${videoTopic}\n\n` +

    `ATMOSPHERE:\n` +
    `- Background: ${environment}\n` +
    `- Mood: Serious, cinematic, authoritative — NOT celebratory or party-like\n` +
    `- Color: Deep dark edges -> warm golden center. ${brandColor} as rim light. ${accent} as accent glow.\n` +
    `- Particles: Warm golden light dust, floating pages, equation fragments — NEVER fire sparks or explosions\n` +
    `- Depth: Background slightly bokeh, subject razor sharp\n` +
    `- Vignette: Subtle dark vignette at very edges only\n\n` +

    `SUBJECT:\n${subjectBlock}\n\n` +

    `TEXT & OVERLAY ELEMENTS (MAXIMUM 4 REGIONS):\n` +
    textSection + `\n\n` +

    `TYPOGRAPHY:\n` +
    `- Impact / ultra-bold condensed sans-serif for headlines\n` +
    `- 3D emboss with golden drop shadow — NOT red (this is trust and triumph, not danger)\n` +
    `- All text perfectly spelled, sharp, readable at 180px\n\n` +

    `ANATOMY (CRITICAL):\n` +
    `- Subject has EXACTLY two natural arms and two hands\n` +
    `- Hands anatomically perfect — correct number of fingers\n` +
    `- ZERO extra limbs or floating body parts\n\n` +

    `CRITICALLY AVOID:\n` +
    `- ANY smiling or happy expression — this mode requires serious, intense, determined\n` +
    `- Jumping, leaping, mid-air action hero poses\n` +
    `- Dark horror-movie lighting or cold blue/grey palettes\n` +
    `- Fire, explosions, or destruction imagery\n` +
    `- TEXT CLUTTER: No floating timer badges, clock callouts, or extra text beyond the 4 regions listed\n` +
    `- Alert card body paragraph text — TITLE ONLY inside the card\n\n` +

    `READABILITY LAW: Maximum 4 distinct text regions. At 180px, a student must instantly read: subject name and main benefit. Less text = more impact = higher CTR.\n\n` +

    `QUALITY: Photorealistic, 4K, cinematic. ` +
    `This thumbnail must make a student scrolling at 11pm the night before their exam physically stop and feel: 'This person is going to save me.'`
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
    survivalMessage: type === "1" ? "I don't need coaching anymore" : type === "2" ? "This is the only video I need" : "I can still pass",
    emotionalTriggers: "Relief, FOMO, Trust",
    poseArchetype: "HAATH JODNA",
    conceptTitle: type === "1" ? "Free Exam Rescue For Students" : "Complete Exam Coverage Free",
    ctrAnalysis: "An RGPV student 3 days before exam sees their specific university name + FREE and immediately feels relief. The serious namaste pose communicates this creator is genuinely doing this for them, not for money.",
    visualHierarchy: "Face (namaste, serious) -> RGPV PHYSICS headline -> FREE benefit -> badge",
    compositionStrategy: "Subject with namaste pose LEFT, massive specific headline CENTER-LEFT, clean alert card RIGHT, short banner BOTTOM.",
    subjectPose: "both palms pressed firmly together at chest height in a classic Indian namaste gesture, head with a slight humble forward bow, eyes looking directly and intensely at camera with quiet burning determination — NOT smiling, jaw set and composed, brow slightly furrowed in sincere commitment, expression communicates an unbreakable promise to help students, warm golden rim light from behind creating a halo effect, a glowing physics textbook positioned near the folded hands radiating warm light",
    overlayConfig: {
      accentColor: highlightColor || "#f5d800",
      topBadge: type === "1" ? "COACHING SE AZAAD" : "ONE SHOT",
      topBadgeColor: "#16a34a",
      headline1: type === "1" ? "BILKUL FREE" : "POORA KHATAM",
      headline2: "RGPV PHYSICS",
      bannerText: type === "1" ? "Exam bacha lo FREE mein!" : "Poori physics ek video!",
      bannerAccentWord: type === "1" ? "FREE" : "physics",
      showAlertCard: true,
      alertTitle: type === "1" ? "COACHING NAHI CHAHIYE" : "FULL SYLLABUS FREE",
      alertBody: videoTopic.slice(0, 60),
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

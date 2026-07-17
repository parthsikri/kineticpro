import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth";
import { checkRateLimit } from "../../../lib/rate-limit";

/* ────────────────────────────────────────────────────────────────
   AI decides EVERYTHING from minimal input.
   Kinetic AI then generates the COMPLETE final thumbnail —
   background + person + all text baked into one image.
   ──────────────────────────────────────────────────────────────── */

export async function POST(request) {
  try {
    const rateLimit = checkRateLimit(request, "plan", 30, 60 * 60 * 1000);
    if (!rateLimit.allowed) return NextResponse.json({ success: false, error: "Planning limit reached. Please try again later." }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } });
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoTopic, brandColor, highlightColor, hasSubjectPhoto, subjectCount, poseMode } = body;
    if (typeof videoTopic !== "string" || videoTopic.trim().length === 0 || videoTopic.length > 8_000) {
      return NextResponse.json({ success: false, error: "Video topic must be between 1 and 8,000 characters." }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    /* ── Mock fallback (no key) ─────────────────────────────────── */
    if (!apiKey) {
      console.log("DeepSeek key missing — returning smart fallback plan");
      await new Promise(r => setTimeout(r, 1400));
      const plan = buildFallbackPlan({ videoTopic, brandColor, highlightColor, hasSubjectPhoto, poseMode });
      return NextResponse.json({ success: true, plan, isMock: true });
    }

    /* ── Live DeepSeek call ─────────────────────────────────────── */
    const subjectInstruction = hasSubjectPhoto
      ? `Real reference photo(s) of ${subjectCount > 1 ? subjectCount + " creators" : "the creator"} will be sent to the image model. Pose mode: "${poseMode}" — ${
          poseMode === "ai"
            ? "choose the most impactful pose (pointing up, shocked, excited, authoritative)"
            : "keep their exact pose from the reference photo(s)"
        }.`
      : "No subject photo. Image model will create a compelling Indian educator/presenter character.";

    const isSecondPass = videoTopic.includes("Additional details provided by creator:");

    let systemPrompt, userPrompt;

    if (!isSecondPass) {
      // Mandatory First Pass: Ask Questions
      systemPrompt = [
        "You are the world's sharpest YouTube thumbnail strategist, specialising in Indian education channels.",
        "A creator just told you their video topic. Your ONLY job right now is to identify the 1 or 2 hard facts that are MISSING — facts you cannot invent, like specific exam dates, university names, exact headline text, or roll numbers.",
        "If all critical facts can be inferred from the topic, ask only ONE question: the exact short headline text they want on the thumbnail (max 3 words per line).",
        "NEVER ask about design, colors, layout, style, emotion, or any creative choice. You decide all of that.",
        "NEVER ask more than 2 questions total.",
        "For each question, give 2–3 plausible preset options that match the topic context. Always include 'Other (please specify)' as the last option.",
        "Respond ONLY with raw JSON — no markdown, no explanation:",
        '{ "needsMoreInfo": true, "questions": [ { "question": "<question>", "options": ["<opt1>", "<opt2>", "Other (please specify)"] } ] }',
      ].join("\n");

      userPrompt = `VIDEO TOPIC: "${videoTopic}"\n\nIdentify missing hard facts and generate 1–2 clarification questions now. Remember: design decisions are YOURS — only ask what you genuinely cannot infer.`;
    } else {
      systemPrompt = [
        "You are the world's #1 YouTube thumbnail strategist for Indian education and news channels.",
        "You have deep knowledge of what makes students STOP SCROLLING and click — urgency, bold Hinglish, high-emotion faces, dramatic overlays.",
        "",
        "YOUR TASK: Analyse the topic + creator answers and produce a complete, precise thumbnail plan. You own every creative decision.",
        "",
        "CHANNEL ARCHETYPES you must match:",
        "- EXAM/ANNOUNCEMENT video → Alert card (official notice style) + Date callout + urgent red/orange banner + shocked subject",
        "- RESULT video → Success/error card + celebratory or tense subject + date callout if relevant",
        "- LECTURE/REVISION video → Punchy 2-line headline + badge with subject code + confident pointing subject. NO alert card.",
        "- CRASH COURSE video → Bold 'FREE' or 'COMPLETE' badge + excited/energetic subject + bottom banner with course name",
        "- MOTIVATIONAL/NEWS video → Impactful Hinglish headline + dramatic subject expression + bottom banner",
        "",
        "HEADLINE RULES (most important):",
        "- Max 3 words per line, ALL CAPS. Make them punchy, Hinglish if it fits, highly emotional.",
        "- headline1 = the power word/hook (e.g. EXAM, RESULT, BIGGEST, FREE)",
        "- headline2 = the payoff or contrasting word (e.g. CANCELLED, OUT!, MISTAKE, DOBARA)",
        "- Together they must create an instant emotional reaction in under 0.5 seconds.",
        "",
        "SUBJECT POSE: Write a vivid, specific, cinematic pose description. Think: Hollywood movie poster energy.",
        "- Announcement: wide-eyed shock, hands gripping face or hair, mouth open",
        "- Result: fist pump or tense forward lean with fingers crossed",
        "- Lecture: authoritative side-glance at camera, one finger raised, confident smirk",
        "- Motivational: arms wide open, big grin, eyes alive",
        "",
        "CRITICAL: DO NOT invent or hallucinate any fact, date, institution name, or number not provided by the creator.",
        "Respond ONLY with raw JSON — no markdown, no code blocks.",
      ].join("\n");

      userPrompt = [
        `VIDEO TOPIC + CREATOR ANSWERS: "${videoTopic}"`,
        `BRAND COLOR: ${brandColor}`,
        `HIGHLIGHT/ACCENT COLOR: ${highlightColor || "#f5d800"}`,
        `SUBJECT: ${subjectInstruction}`,
        "",
        "Now return the complete thumbnail plan as JSON:",
        "{",
        '  "needsMoreInfo": false,',
        '  "conceptTitle": "4–6 word evocative thumbnail concept title",',
        '  "ctrAnalysis": "2 sharp sentences on why this thumbnail will get a high CTR",',
        '  "compositionStrategy": "1 sentence on the overall visual layout and energy",',
        '  "subjectPose": "Vivid, specific, cinematic pose — describe the exact expression, body language, and hand position. Reference a film-still or movie-poster energy level.",',
        '  "overlayConfig": {',
        '    "accentColor": "use the exact HIGHLIGHT COLOR provided — do not change it",',
        "    \"topBadge\": \"short pill label e.g. 'RGPV | MATHS-II' or 'RESULT 2024' or null — only if it adds factual context\",",
        '    "topBadgeColor": "hex for badge background (usually the brand color)",',
        '    "headline1": "POWER HOOK — uppercase, max 3 words, white text, creates instant hook",',
        '    "headline2": "PAYOFF — uppercase, max 3 words, accent color, completes the hook — or null",',
        '    "bannerText": "FULL-WIDTH BOTTOM BANNER — max 8 words, Hinglish OK — or null",',
        '    "bannerAccentWord": "single word in accent color inside the banner — or null",',
        '    "showAlertCard": "true ONLY for official announcements, postponements, or breaking news — false for lectures",',
        '    "alertTitle": "short all-caps alert title e.g. EXAM POSTPONED — or null",',
        '    "alertBody": "1–2 sentence factual body using ONLY creator-provided details — or null",',
        '    "alertType": "error | success | info | warning",',
        '    "showDateCallout": "true ONLY if a specific date is known and relevant — false otherwise",',
        '    "dateText": "e.g. 15 AUG — or null",',
        '    "dateIcon": "cross | check | fire | warning — or null"',
        "  }",
        "}",
      ].filter(Boolean).join("\n");
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
        ],
        temperature: 0.82,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Engine API failed: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    const plan = JSON.parse(data.choices[0].message.content);

    // If DeepSeek needs more info from the user — return questions, don't generate yet
    if (plan.needsMoreInfo === true && Array.isArray(plan.questions) && plan.questions.length > 0) {
      return NextResponse.json({ success: true, needsMoreInfo: true, questions: plan.questions });
    }

    // Build the COMPLETE thumbnail prompt — text fully included, nothing added in browser
    plan.imagePrompt = buildCompleteThumbnailPrompt(plan, {
      brandColor, highlightColor, hasSubjectPhoto, subjectCount, poseMode, videoTopic,
    });

    return NextResponse.json({ success: true, needsMoreInfo: false, plan });

  } catch (error) {
    console.error("Plan Route Error:", error);
    return NextResponse.json({ success: false, error: "Planning failed. Please try again." }, { status: 500 });
  }
}

/* ══════════════════════════════════════════════════════════════════
   Build the COMPLETE final thumbnail prompt for Kinetic AI.
   ALL text, badges, banners, overlays are specified here so they
   get BAKED INTO the generated image — nothing added in the browser.
   ══════════════════════════════════════════════════════════════════ */
function buildCompleteThumbnailPrompt(plan, { brandColor, highlightColor, hasSubjectPhoto, subjectCount, poseMode, videoTopic }) {
  const oc     = plan.overlayConfig || {};
  const accent = highlightColor || oc.accentColor || "#f5d800";
  const dynamicPose = plan.subjectPose || "pointing upward confidently or open-mouth shock";

  const subjectNote = hasSubjectPhoto
    ? `SUBJECT — REAL PERSON (photo provided):\n` +
      `Integrate the provided photo of the ${subjectCount > 1 ? subjectCount + " creators" : "creator"} into the scene. ` +
      `Preserve their exact face, skin tone, hair, and identity with 100% accuracy — this is non-negotiable. ` +
      (poseMode === "ai"
        ? `Apply the following pose/expression to them: "${dynamicPose}". ` +
          `Re-render their body dynamically while keeping the face a perfect likeness. ` +
          `Apply cinematic rim lighting using ${brandColor} as the key color — strong backlight halo, studio-grade. ` +
          `Their clothing should look sharp and professional. Place them against the composite background seamlessly.`
        : `Keep their exact pose from the reference photo. ` +
          `Replace the background with the designed scene. Dramatically enhance lighting, add depth-of-field, ` +
          `cinematic colour grading with ${brandColor} tones. Make them look like they're in a high-production set.`)
    : `SUBJECT — AI-GENERATED PRESENTER:\n` +
      `Create a confident, expressive South Asian/Indian male or female educator in their late 20s to mid-30s. ` +
      `Pose: "${dynamicPose}". ` +
      `Clothing: smart-casual — collared shirt or branded hoodie, clean and professional. ` +
      `Lighting: powerful three-point studio lighting with ${brandColor} as the rim/backlight color. ` +
      `Expression must be highly readable at thumbnail size — exaggerated but authentic.`;

  const textElements = [];

  if (oc.topBadge) {
    if (oc.topBadge.includes("|")) {
      const [p1, p2] = oc.topBadge.split("|").map(s => s.trim());
      textElements.push(
        "TOP-LEFT CORNER — Two pill-shaped label badges side by side:\n" +
        `  Badge 1: Bold white text "${p1}" on solid ${oc.topBadgeColor} background, tightly rounded corners, slight drop-shadow\n` +
        `  Badge 2: Bold dark text "${p2}" on solid white background, tightly rounded corners`
      );
    } else {
      textElements.push(
        `TOP-LEFT CORNER — Pill badge: Bold white text "${oc.topBadge}" on solid ${oc.topBadgeColor} background, rounded corners, slight drop-shadow`
      );
    }
  }

  if (oc.headline1 || oc.headline2) {
    const h1 = oc.headline1 ? `"${oc.headline1.toUpperCase()}"` : null;
    const h2 = oc.headline2 ? `"${oc.headline2.toUpperCase()}"` : null;
    textElements.push(
      "MAIN HEADLINE — Positioned left-of-center, vertically centered in the frame:\n" +
      (h1 ? `  Line 1: ${h1} — Ultra-massive Impact or Anton font, pure WHITE (#FFFFFF), enormous scale (fills ~30% frame height), heavy black outline stroke, dense drop-shadow for maximum legibility\n` : "") +
      (h2 ? `  Line 2: ${h2} — Same enormous scale, BOLD ITALIC, solid ${accent} color fill, black outline stroke, drop-shadow\n` : "") +
      "  Both lines strictly left-aligned. No letter-spacing. Tight leading. The text should feel like it's SHOUTING."
    );
  }

  if (oc.showAlertCard && oc.alertTitle) {
    const alertBg = oc.alertType === "error" ? "#dc2626" : oc.alertType === "success" ? "#16a34a" : oc.alertType === "warning" ? "#d97706" : "#1d4ed8";
    textElements.push(
      "TOP-RIGHT CORNER — Official government/university notice card (like a WhatsApp forwarded circular):\n" +
      `  - Card background: white, slightly tilted 2–3° clockwise, subtle drop-shadow\n` +
      `  - Top section: small grey text 'Examination Notice' with a university crest icon\n` +
      `  - Coloured title bar (${alertBg}): bold white ALL-CAPS text "${oc.alertTitle}"\n` +
      `  - Body text section: "${(oc.alertBody || "").slice(0, 100)}" in small dark grey text\n` +
      `  - Bottom: an official-looking red stamp or seal overlay\n` +
      `  Style: hyper-realistic printed document, not a digital card`
    );
  }

  if (oc.showDateCallout && oc.dateText) {
    const iconMap = { cross: "bold red X mark", check: "bold green checkmark", fire: "fire emoji", warning: "yellow warning triangle" };
    const iconDesc = iconMap[oc.dateIcon] || "warning symbol";
    textElements.push(
      "CENTER-RIGHT AREA — Tear-off calendar widget:\n" +
      `  - Bright red top strip (like a physical calendar header) with small white text 'EXAM DATE'\n` +
      `  - Large bold date: "${oc.dateText.toUpperCase()}" — massive font, dark text on white\n` +
      `  - Bottom-right corner of the calendar: a circular badge with a ${iconDesc}\n` +
      `  - Slight drop-shadow, realistic paper texture on the calendar`
    );
  }

  if (oc.bannerText) {
    const upper = oc.bannerText.toUpperCase();
    const accentWord = oc.bannerAccentWord ? oc.bannerAccentWord.toUpperCase() : null;
    const bannerDesc = accentWord
      ? `"${upper}" — the word "${accentWord}" in bold ${accent} color, the rest in bold white`
      : `"${upper}" in bold white`;
    textElements.push(
      "FULL-WIDTH BOTTOM BANNER (spans 100% of frame width, bottom 12–15% of image):\n" +
      `  - Background: very dark navy or ${brandColor} at 95% opacity\n` +
      `  - Top edge: a 3px solid ${accent} accent line (like a neon trim)\n` +
      `  - Text: ${bannerDesc} — Impact/Anton font, ALL CAPS, very large, centered vertically in strip\n` +
      (oc.dateIcon === "cross" ? `  - Left side of banner: a red circle with bold white X icon before the text\n` : "") +
      `  The banner must feel like a TV news ticker — bold, urgent, undeniable`
    );
  }

  const textSection = textElements.length > 0
    ? textElements.map((el, i) => `${i + 1}. ${el}`).join("\n\n")
    : `Bold impactful 2-line headline centered-left in the frame. Line 1: white Impact font. Line 2: ${accent} bold italic. Massive scale.`;

  return (
    `Generate a COMPLETE, ultra-high-production YouTube thumbnail. ` +
    `This is the FINAL, ready-to-upload image — every text element, overlay, badge, and graphic listed below MUST appear exactly as described. Do not omit any element.\n\n` +

    `REFERENCE AESTHETIC: Top-tier Indian YouTube education channels — Physics Wallah, Vedantu, Unacademy, Adda247. ` +
    `Think: dramatic, high-contrast, emotion-driven, information-dense. ` +
    `The kind of thumbnail that gets 5M+ views in 24 hours.\n\n` +

    `FORMAT: 16:9 landscape, 1280×720px equivalent\n\n` +

    `COMPOSITION — THREE-ZONE LAYOUT:\n` +
    `  LEFT 35–45%  → Subject/presenter with dramatic lighting and expressive pose\n` +
    `  CENTER 20%   → Supporting graphic (calendar callout, alert card edge, or empty atmospheric space)\n` +
    `  RIGHT 40–50% → Headline text, badge, overlays\n` +
    `  BOTTOM STRIP → Full-width banner (if specified)\n` +
    `  TOP-RIGHT    → Alert/notice card (if specified)\n\n` +

    `SUBJECT:\n${subjectNote}\n\n` +

    `BACKGROUND & ATMOSPHERE:\n` +
    `  Create a deep, cinematic background environment. Use ${brandColor} as the dominant atmospheric tone — ` +
    `applied as volumetric light rays, gradient fog, or environmental glow emanating from behind the subject. ` +
    `Dark and moody with strong depth-of-field blur on background elements. ` +
    `Add subtle texture — could be a dark studio, abstract geometric shapes, a blurred classroom or stage. ` +
    `The background must feel premium, not flat.\n\n` +

    `TEXT & OVERLAY ELEMENTS — RENDER ALL OF THESE EXACTLY:\n${textSection}\n\n` +

    `TYPOGRAPHY MASTER RULES:\n` +
    `  - All text must be 100% legible at 320×180px (thumbnail preview size)\n` +
    `  - Headlines: Impact, Anton, or equivalent ultra-bold condensed sans-serif — ALL CAPS only\n` +
    `  - Every text element: strong black outline stroke (2–4px) + hard drop-shadow for legibility on any background\n` +
    `  - Badges/pills: rounded rectangle, bold sans-serif, tight padding\n` +
    `  - Banner text: Impact/Anton, ALL CAPS, maximum size that fits the strip\n` +
    `  - Zero spelling errors. Render each word with pixel-perfect sharpness.\n\n` +

    `HUMAN ANATOMY RULES (CRITICAL — no exceptions):\n` +
    `  - Subject must have EXACTLY two arms and two hands — no more, no less\n` +
    `  - Each hand: exactly five fingers, naturally proportioned, anatomically correct\n` +
    `  - No floating limbs, no extra fingers, no distorted joints\n` +
    `  - If hands cannot be rendered perfectly at this angle, crop them out of frame — never show broken anatomy\n\n` +

    `COLOR SYSTEM:\n` +
    `  Primary brand color: ${brandColor} (dominant — backgrounds, lighting, badges)\n` +
    `  Accent/highlight: ${accent} (pops — headline line 2, banner accent word, accent lines)\n` +
    `  Headline color: #FFFFFF white (line 1 always white)\n` +
    `  Never use flat, unshadowed colors — everything must have depth and luminosity\n\n` +

    `FINAL QUALITY BAR:\n` +
    `  Photorealistic. Cinema-grade colour grading. Ultra-sharp at every pixel. ` +
    `This thumbnail must look like it was produced by a full-time professional design team. ` +
    `If someone scrolled past it at 200px wide, they should feel compelled to stop and click. ` +
    `Absolutely zero AI artifacts, blurry text, or muddy colors. ` +
    `Render it like your reputation depends on it.`
  );
}

/* ── Smart fallback (no API key) ──────────────────────────────────── */
function buildFallbackPlan({ videoTopic, brandColor, highlightColor, hasSubjectPhoto, subjectCount, poseMode }) {
  const isSecondPass = videoTopic.includes("Additional details provided by creator:");

  if (!isSecondPass) {
    return {
      needsMoreInfo: true,
      questions: [
        {
          question: "Are there any specific dates or numbers to include in the design?",
          options: ["No dates", "Today's date", "Tomorrow", "Other (please specify)"]
        },
        {
          question: "What is the exact short text/headline you want to highlight?",
          options: ["Let AI decide", "Keep it minimal", "Match the video title", "Other (please specify)"]
        }
      ]
    };
  }

  const t           = (videoTopic || "").toLowerCase();
  const hasExam     = t.includes("exam") || t.includes("paper") || t.includes("test");
  const hasPostpone = t.includes("postpone") || t.includes("cancel") || t.includes("change") || t.includes("update");
  const hasResult   = t.includes("result") || t.includes("merit") || t.includes("rank");
  const dateMatch   = t.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
  const dateText    = dateMatch ? (dateMatch[1] + " " + dateMatch[2].toUpperCase()) : "SOON";

  let headline1 = "BIG", headline2 = "UPDATE!";
  let bannerText = "YEH VIDEO ZAROOR DEKHO!", bannerAccentWord = "ZAROOR";
  let alertTitle = null, alertBody = null, alertType = "info";
  let showAlertCard = false, showDateCallout = false, dateIcon = "warning";
  let topBadge = null;

  const isAnnouncement = hasExam && hasPostpone;
  const isResult       = hasResult;

  if (isAnnouncement) {
    headline1 = "BIGGEST"; headline2 = "CHANGE!";
    bannerText = "AB EXAM DATE CHANGE HO GAYI!"; bannerAccentWord = "EXAM DATE";
    showAlertCard = true; alertTitle = "EXAM POSTPONED";
    alertBody = videoTopic.slice(0, 120); alertType = "error";
    showDateCallout = !!dateMatch; dateIcon = "cross"; topBadge = "EXAM UPDATE";
  } else if (isResult) {
    headline1 = "RESULT"; headline2 = "OUT!";
    bannerText = "CHECK YOUR RESULT ABHI!"; bannerAccentWord = "RESULT";
    showAlertCard = true; alertTitle = "RESULT DECLARED";
    alertBody = videoTopic.slice(0, 100); alertType = "success";
    topBadge = "RESULT 2024";
  } else {
    headline1 = "IMP"; headline2 = "TOPICS";
    bannerText = null; bannerAccentWord = null;
    showAlertCard = false; showDateCallout = false;
    topBadge = "MUST WATCH";
  }

  const overlayConfig = {
    accentColor: highlightColor || "#f5d800", topBadge, topBadgeColor: brandColor,
    headline1, headline2, bannerText, bannerAccentWord,
    showAlertCard, alertTitle, alertBody, alertType,
    showDateCallout, dateText, dateIcon,
  };

  const plan = {
    conceptTitle: isAnnouncement ? "High-Impact Breaking Announcement" : isResult ? "Result Reveal Thumbnail" : "High-Energy Lecture Thumbnail",
    ctrAnalysis: isAnnouncement
      ? "This topic carries high urgency — triggering immediate FOMO. Bold Hinglish text + official notice card creates maximum attention in under 1 second."
      : "Bold, punchy headline with energetic subject creates an instant watch reaction from students scrolling through their feed.",
    compositionStrategy: "Subject LEFT with expressive pose. Text RIGHT. Dramatic brand-color lighting. Clean, impactful layout.",
    subjectPose: isAnnouncement ? "looking shocked with hands on head" : isResult ? "celebrating with fist pump" : "pointing at the text confidently",
    overlayConfig,
    imagePrompt: "",
  };

  plan.imagePrompt = buildCompleteThumbnailPrompt(plan, { brandColor, highlightColor, hasSubjectPhoto, subjectCount, poseMode });
  return plan;
}

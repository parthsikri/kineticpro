import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoTopic, audience, language, outline } = body;

    if (!videoTopic?.trim()) {
      return NextResponse.json({ success: false, error: "Video topic is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    /* ── Mock fallback when no Gemini key ───────────────────────── */
    if (!apiKey) {
      await new Promise(r => setTimeout(r, 1800));
      return NextResponse.json({
        success: true,
        isMock: true,
        seo: buildMockSEO(videoTopic, language),
      });
    }

    const systemInstruction = [
      "You are the world's #1 YouTube SEO strategist specializing in Indian education, news, tech, and entertainment channels.",
      "You have deep knowledge of YouTube's search algorithm, click-through rate optimization, and Hindi/English/Hinglish content strategy.",
      "Your job is to generate a COMPLETE, publish-ready YouTube SEO package for a long-format video.",
      "IMPORTANT: The creator will describe what their video is ABOUT — they are NOT giving you the final title.",
      "You must deeply understand the topic from their description and craft the most powerful, click-worthy, SEO-optimised titles yourself.",
      "Think like a top Indian YouTuber — what title would make 1 million people stop scrolling and click?",
      "Every field must be optimized for maximum discoverability, watch time, and subscriber growth.",
      "Respond ONLY with valid raw JSON — no markdown, no code blocks, no explanation outside the JSON.",
    ].join("\n");

    const lang = language || "Hinglish";
    const chapterInstruction = outline?.trim()
      ? `Generate chapters based on this outline: "${outline.trim()}"`
      : "Generate 7-9 logical chapters that make sense for this topic. Space them realistically (first at 0:00, rest 2-5 minutes apart).";

    const userPrompt = [
      `VIDEO DESCRIPTION (what the video is about): "${videoTopic.trim()}"`,
      `TARGET AUDIENCE: "${audience?.trim() || "General YouTube viewers in India"}"`,
      "NOTE: The creator described their video content — you must generate the best possible titles from this description, not just reword it.",
      `LANGUAGE: "${lang}"`,
      `CHAPTERS INSTRUCTION: ${chapterInstruction}`,
      "",
      "Generate a complete, maximum-impact YouTube SEO package. Return ONLY this exact JSON:",
      "{",
      '  "titles": [',
      '    "Title 1: Primary keyword at front, high curiosity, 50-60 chars, in ' + lang + '",',
      '    "Title 2: Different emotional angle or controversy hook",',
      '    "Title 3: Number/listicle or question format — triggers curiosity"',
      "  ],",
      '  "description": "Full 5-paragraph SEO description (minimum 350 words). Para 1: Powerful hook + what viewers will learn. Para 2-3: Dense keyword-rich body covering all subtopics naturally. Para 4: Strong CTA (like, subscribe, comment). Para 5: Social links / chapter note placeholder. Use \\n\\n between paragraphs. Include 3-4 relevant emojis naturally. Language: ' + lang + '",',
      '  "tags": ["tag1", "tag2", "...EXACTLY 40 tags — 10 broad, 15 specific, 15 long-tail. Mix English + transliterated Hindi where topic is Indian"],',
      '  "hashtags": ["#hashtag1", "...exactly 8 hashtags — trending, topic-relevant, mix of English and Hindi"],',
      '  "chapters": [',
      '    { "time": "0:00", "title": "Introduction" },',
      '    { "time": "2:30", "title": "Next chapter..." }',
      "  ],",
      '  "primaryKeywords": ["top 3 highest-volume keywords for this topic"],',
      '  "secondaryKeywords": ["8 supporting keywords and LSI terms"],',
      '  "seoScore": 85,',
      '  "seoScoreBreakdown": {',
      '    "titleStrength": 90,',
      '    "descriptionDepth": 85,',
      '    "tagCoverage": 80,',
      '    "keywordDensity": 82',
      "  },",
      '  "seoTips": [',
      '    "Specific tip 1 — actionable improvement for this exact topic",',
      '    "Specific tip 2 — what to pin in comments for ranking",',
      '    "Specific tip 3 — thumbnail/card strategy for watch time"',
      "  ],",
      '  "bestUploadTime": "e.g. Tuesday or Thursday, 6 PM - 9 PM IST",',
      '  "competitionLevel": "Low | Medium | High",',
      '  "estimatedMonthlySearches": "e.g. 50K - 200K"',
      "}",
      "",
      "STRICT RULES:",
      "- titles must be in " + lang + " — natural, not forced",
      "- tags: mix keyword variants, avoid pure duplicates. If topic is Hindi/Hinglish, include both Hindi and English forms",
      "- seoScore: be honest 1-100 based on actual keyword competition and topic specificity",
      "- seoTips: be ultra-specific to THIS video topic, not generic advice",
      "- chapters: realistic timings, engaging titles that make viewers want to jump to sections",
      "- description: MUST be minimum 350 words, rich with natural keyword placement",
    ].join("\n");

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API failed: ${geminiRes.status} — ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip any accidental markdown code fences
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const seo = JSON.parse(cleaned);
    return NextResponse.json({ success: true, seo });

  } catch (error) {
    console.error("[SEO_ROUTE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "SEO generation failed. Please try again." },
      { status: 500 }
    );
  }
}

function buildMockSEO(topic, language) {
  return {
    titles: [
      `${topic} — Complete Guide 2024 | Everything You Need to Know`,
      `${topic} | Shocking Facts Most People Don't Know 😱`,
      `Top 10 Things About ${topic} That Will Change Your Life`,
    ],
    description: `🎯 In this video, we dive deep into ${topic} — covering everything from basics to advanced strategies that most creators miss.\n\n📌 Whether you're a beginner or already familiar with the topic, this video will give you a complete roadmap to understand and apply everything related to ${topic}.\n\nWe cover the most searched questions, trending keywords, and practical steps you can take starting today. This is the most comprehensive guide on ${topic} available on YouTube right now.\n\n👉 Don't forget to LIKE this video if you found it helpful, SUBSCRIBE for weekly content, and hit the BELL icon so you never miss an update!\n\n📲 Follow us on Instagram | Telegram | Twitter\n📧 For business inquiries: contact@example.com`,
    tags: Array.from({ length: 40 }, (_, i) => `${topic.toLowerCase()} ${["guide", "tutorial", "tips", "2024", "explained", "hindi", "full video", "complete", "for beginners", "advanced", "strategy", "how to", "best", "top 10", "secrets", "facts", "update", "news", "review", "course", "free", "online", "india", "students", "exam", "preparation", "study", "learn", "knowledge", "career"][i % 30]}`),
    hashtags: [`#${topic.replace(/\s/g, "")}`, "#YouTube", "#India", "#Trending", "#Viral", "#Education", "#HindiContent", "#MustWatch"],
    chapters: [
      { time: "0:00", title: "Introduction" },
      { time: "2:00", title: `What is ${topic}?` },
      { time: "5:30", title: "Key Points You Must Know" },
      { time: "10:00", title: "Common Mistakes to Avoid" },
      { time: "15:30", title: "Expert Tips & Strategies" },
      { time: "20:00", title: "Real-World Examples" },
      { time: "25:00", title: "Final Thoughts & Next Steps" },
    ],
    primaryKeywords: [topic, `${topic} guide`, `${topic} 2024`],
    secondaryKeywords: [`${topic} tips`, `${topic} tutorial`, `${topic} explained`, `how to ${topic}`, `${topic} in hindi`, `${topic} for beginners`, `${topic} complete`, `${topic} full video`],
    seoScore: 78,
    seoScoreBreakdown: { titleStrength: 80, descriptionDepth: 75, tagCoverage: 82, keywordDensity: 76 },
    seoTips: [
      "Pin a comment with your primary keyword and a question to boost engagement signals.",
      "Add your top 3 tags in the first 100 characters of the description for stronger indexing.",
      "Create a custom thumbnail with the primary keyword text to improve click-through rate.",
    ],
    bestUploadTime: "Tuesday or Thursday, 6 PM – 9 PM IST",
    competitionLevel: "Medium",
    estimatedMonthlySearches: "50K – 200K",
  };
}

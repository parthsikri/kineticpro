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
    const { videoTopic, audience, language, outline, channelUrl, defaultLinks, videoUrl } = body;

    if (!videoTopic?.trim() && !videoUrl?.trim()) {
      return NextResponse.json({ success: false, error: "Either video description or YouTube video URL is required." }, { status: 400 });
    }

    // Fetch YouTube Video Transcript if URL is provided
    let transcriptText = "";
    if (videoUrl?.trim()) {
      try {
        const transcript = await getYoutubeTranscriptInnerTube(videoUrl);
        if (transcript) {
          transcriptText = transcript.slice(0, 40000); // Limit to ~8,000 words
        }
      } catch (err) {
        console.error("Failed to fetch transcript, continuing without it:", err);
      }
    }

    let transcriptSection = "";
    if (transcriptText) {
      transcriptSection = [
        "",
        "VIDEO TRANSCRIPT (Parsed directly from the video):",
        transcriptText,
        "",
        "INSTRUCTIONS FOR TRANSCRIPT:",
        "- Analyze the video transcript above to understand the main topic, subtopics, and exact flow of information.",
        "- Generate highly relevant, click-worthy titles, search-optimized description, tags, hashtags, and exact chapters based on this transcript.",
      ].join("\n");
    }

    const apiKey = process.env.GEMINI_API_KEY;

    /* ── Mock fallback when no Gemini key ───────────────────────── */
    if (!apiKey) {
      await new Promise(r => setTimeout(r, 1800));
      return NextResponse.json({
        success: true,
        isMock: true,
        seo: buildMockSEO(videoTopic || "YouTube Video", language),
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

    let videosSection = "";
    if (channelUrl?.trim()) {
      try {
        const channelId = await getChannelId(channelUrl);
        if (channelId) {
          const videos = await getRecentVideos(channelId);
          if (videos.length > 0) {
            videosSection = [
              "",
              "RELATED VIDEOS FROM THE CREATOR'S CHANNEL:",
              JSON.stringify(videos.slice(0, 10)),
              "",
              "INSTRUCTION FOR RELATED VIDEOS:",
              "- Select 2 to 3 most relevant or contextually helpful videos from the list above.",
              "- Embed them under a dedicated section inside the description called 'Recommended Videos to Watch next:'.",
              "- Show each selected video's exact title and its exact watch link (url) from the list above. Do NOT modify or hallucinate the URLs.",
              "- Place this section right before the CTA/social links at the bottom.",
            ].join("\n");
          }
        }
      } catch (err) {
        console.error("YouTube scraping failed, proceeding without channel videos:", err);
      }
    }

    let defaultLinksSection = "";
    if (defaultLinks?.trim()) {
      defaultLinksSection = [
        "",
        "DEFAULT PROMOTIONAL LINKS / SOCIALS TO APPEND:",
        defaultLinks.trim(),
        "",
        "INSTRUCTION FOR DEFAULT PROMOTIONAL LINKS:",
        "- You MUST append this exact promotional/social text block at the very end of the video description.",
        "- Do NOT translate, modify, or omit any links or text from this block.",
      ].join("\n");
    }

    const userPrompt = [
      `VIDEO DESCRIPTION (what the video is about): "${(videoTopic || "").trim()}"`,
      `TARGET AUDIENCE: "${audience?.trim() || "General YouTube viewers in India"}"`,
      "NOTE: The creator described their video content — you must generate the best possible titles from this description, not just reword it.",
      `LANGUAGE: "${lang}"`,
      `CHAPTERS INSTRUCTION: ${chapterInstruction}`,
      videosSection,
      defaultLinksSection,
      transcriptSection,
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

async function getChannelId(channelUrlOrHandle) {
  let handle = channelUrlOrHandle.trim();
  if (handle.includes("youtube.com/")) {
    const parts = handle.split("youtube.com/");
    handle = parts[1].split("/")[0].split("?")[0];
  }
  if (!handle.startsWith("@")) {
    handle = "@" + handle;
  }
  
  const response = await fetch(`https://www.youtube.com/${handle}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!response.ok) return null;
  const html = await response.text();
  
  const match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
  if (match) return match[1];
  
  const match2 = html.match(/channel\/([a-zA-Z0-9_-]{24})/);
  if (match2) return match2[1];
  
  return null;
}

async function getRecentVideos(channelId) {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  if (!response.ok) return [];
  const xml = await response.text();
  
  const videos = [];
  const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  for (const entry of entryMatches) {
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = entry.match(/<link[^>]*?href="([^"]+?)"/);
    if (titleMatch && linkMatch) {
      videos.push({
        title: titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim(),
        url: linkMatch[1].trim()
      });
    }
  }
  return videos;
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

async function getYoutubeTranscriptInnerTube(videoUrl) {
  try {
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      return null;
    }

    const response = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)"
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "20.10.38"
          }
        },
        videoId: videoId
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!Array.isArray(captionTracks) || captionTracks.length === 0) return null;

    const track = captionTracks.find(t => t.languageCode === "en") || captionTracks.find(t => t.languageCode === "hi") || captionTracks[0];
    const transcriptUrl = track.baseUrl;

    const transcriptResponse = await fetch(transcriptUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)"
      }
    });

    if (!transcriptResponse.ok) return null;

    const xml = await transcriptResponse.text();

    const textMatches = xml.match(/<text[^>]*?>([\s\S]*?)<\/text>/g) || [];
    if (textMatches.length === 0) {
      const pMatches = xml.match(/<p[^>]*?>([\s\S]*?)<\/p>/g) || [];
      const lines = pMatches.map(p => {
        const sMatches = p.match(/<s[^>]*?>([^<]*?)<\/s>/g) || [];
        if (sMatches.length > 0) {
          return sMatches.map(s => s.replace(/<s[^>]*?>/, "").replace(/<\/s>/, "")).join("");
        }
        return p.replace(/<[^>]+>/g, "");
      });
      return lines.map(decodeEntities).join(" ");
    }

    const lines = textMatches.map(t => {
      return t
        .replace(/<text[^>]*?>/, "")
        .replace(/<\/text>/, "")
        .replace(/[\r\n]+/g, " ")
        .trim();
    });

    return lines.map(decodeEntities).join(" ");

  } catch (err) {
    console.error("Error in getYoutubeTranscriptInnerTube:", err);
    return null;
  }
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

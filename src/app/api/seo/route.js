import { NextResponse } from "next/server";
import { getSessionUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { extractTextFromDocument } from "../../../lib/visionExtraction";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoTopic, audience, language, outline, channelUrl, defaultLinks: bodyDefaultLinks, pastedTranscript, syllabusFile } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { defaultLinks: true, youtubeChannelUrl: true },
    });
    
    const defaultLinks = bodyDefaultLinks || dbUser?.defaultLinks || "";
    const activeChannelUrl = channelUrl?.trim() || dbUser?.youtubeChannelUrl || "";

    const transcriptText = pastedTranscript?.trim() || "";

    if (!videoTopic?.trim() && !transcriptText) {
      return NextResponse.json({ success: false, error: "Please describe your video topic or paste a transcript." }, { status: 400 });
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

    const apiKey = process.env.DEEPSEEK_API_KEY;

    /* ── Mock fallback when no DeepSeek key ───────────────────────── */
    if (!apiKey) {
      await new Promise(r => setTimeout(r, 1800));
      return NextResponse.json({
        success: true,
        isMock: true,
        seo: buildMockSEO(videoTopic || "YouTube Video", language),
      });
    }

    const systemInstruction = [
      "You are the world's #1 YouTube SEO & CTR Strategist.",
      "You have deep knowledge of YouTube's search and recommendation algorithm, keyword indexing, and high-CTR title formulas.",
      "Your job is to generate a publishing-ready, maximum-reach YouTube SEO package.",
      "CRITICAL TITLE RULE: Each generated title MUST BE SHORT, CONCISE, AND STRICTLY UNDER 60 CHARACTERS (and under 12 words). YouTube truncates long titles on mobile devices — short, punchy titles perform 3x better.",
      "Front-load the primary search keyword at the very beginning of the title.",
      "Respond ONLY with valid raw JSON — no markdown, no code blocks, no explanation outside the JSON.",
    ].join("\n");

    const lang = language || "Hinglish";
    const chapterInstruction = outline?.trim()
      ? `Generate chapters based on this outline: "${outline.trim()}"`
      : "Generate 7-9 logical chapters that make sense for this topic. Space them realistically (first at 0:00, rest 2-5 minutes apart).";

    let videosSection = "";
    if (activeChannelUrl) {
      try {
        const channelId = await getChannelId(activeChannelUrl);
        if (channelId) {
          const videos = await getRecentVideos(channelId);
          const playlists = await getPlaylists(activeChannelUrl);
          
          if (videos.length > 0 || playlists.length > 0) {
            videosSection = [
              "",
              "RELATED VIDEOS & PLAYLISTS FROM THE CREATOR'S CHANNEL:",
              "Videos: " + JSON.stringify(videos.slice(0, 10)),
              "Playlists: " + JSON.stringify(playlists.slice(0, 10)),
              "",
              "INSTRUCTION FOR RELATED CONTENT:",
              "- Select 2 to 3 most relevant or contextually helpful videos OR playlists from the lists above.",
              "- Embed them under a dedicated section inside the description called 'Recommended to Watch next:'.",
              "- Show each selected item's exact title and its exact watch/playlist link (url) from the list above. Do NOT modify or hallucinate the URLs.",
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

    let syllabusSection = "";
    if (syllabusFile) {
      const extractedText = await extractTextFromDocument(syllabusFile);
      if (extractedText) {
        syllabusSection = [
          "",
          "SYLLABUS / CURRICULUM TEXT EXTRACTED FROM UPLOADED DOCUMENT:",
          extractedText,
          "",
          "INSTRUCTIONS FOR SYLLABUS:",
          "- The creator uploaded a syllabus document for this educational video.",
          "- Use specific topics, chapters, subject codes, and keywords from this syllabus to inform the SEO tags, title, and description.",
        ].join("\n");
      }
    }

    const userPrompt = [
      `VIDEO TOPIC / DESCRIPTION: "${(videoTopic || "").trim()}"`,
      `TARGET AUDIENCE: "${audience?.trim() || "General YouTube viewers in India"}"`,
      `LANGUAGE: "${lang}"`,
      `CHAPTERS INSTRUCTION: ${chapterInstruction}`,
      videosSection,
      defaultLinksSection,
      transcriptSection,
      syllabusSection,
      "",
      "Generate a complete, maximum-impact YouTube SEO package. Return ONLY this exact JSON:",
      "{",
      '  "titles": [',
      '    "Title 1: Under 60 characters — primary keyword front-loaded, ultra-punchy, high CTR in ' + lang + '",',
      '    "Title 2: Under 60 characters — high curiosity or emotional hook",',
      '    "Title 3: Under 60 characters — question or listicle format"' +
      "  ],",
      '  "description": "Full 5-paragraph SEO description (minimum 350 words). Para 1: Powerful 2-sentence hook with primary keywords. Para 2-3: Detailed value breakdown covering key concepts and search intent naturally. Para 4: Strong CTA (like, subscribe, comment). Para 5: Social links / chapter note placeholder. Use \\n\\n between paragraphs. Include 3-4 relevant emojis. Language: ' + lang + '",',
      '  "tags": ["tag1", "tag2", "...EXACTLY 40 high-volume search tags — mix of broad, specific, long-tail, and transliterated Hinglish/English terms"],',
      '  "hashtags": ["#hashtag1", "...exactly 8 trending hashtags"],',
      '  "chapters": [',
      '    { "time": "0:00", "title": "Introduction" },',
      '    { "time": "2:30", "title": "Next chapter..." }',
      "  ],",
      '  "primaryKeywords": ["top 3 highest-volume keywords for this topic"],',
      '  "secondaryKeywords": ["8 supporting keywords and LSI terms"],',
      '  "seoScore": 92,',
      '  "seoScoreBreakdown": {',
      '    "titleStrength": 95,',
      '    "descriptionDepth": 90,',
      '    "tagCoverage": 92,',
      '    "keywordDensity": 88',
      "  },",
      '  "seoTips": [',
      '    "Specific tip 1 — actionable comment pin strategy for this topic",',
      '    "Specific tip 2 — description keyword placement optimization",',
      '    "Specific tip 3 — card & end screen strategy for watch time"',
      "  ],",
      '  "bestUploadTime": "e.g. Tuesday or Thursday, 6 PM - 9 PM IST",',
      '  "competitionLevel": "Low | Medium | High",',
      '  "estimatedMonthlySearches": "e.g. 50K - 200K"',
      "}",
      "",
      "STRICT RULES:",
      "- EVERY title in the 'titles' array MUST BE STRICTLY UNDER 60 CHARACTERS.",
      "- titles must be in " + lang + " — highly engaging and natural",
      "- tags: exactly 40 distinct tags, no plain duplicates",
      "- description: MUST be minimum 350 words, rich with natural search keywords",
    ].join("\n");

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user",   content: userPrompt   },
        ],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API failed: ${response.status} — ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    // Strip any accidental markdown code fences
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error(`No valid JSON block found in DeepSeek output: ${rawText}`);
    }
    const cleaned = rawText.substring(firstBrace, lastBrace + 1);

    const seo = JSON.parse(cleaned);
    return NextResponse.json({ success: true, seo });

  } catch (error) {
    console.error("[SEO_ROUTE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "SEO generation failed. Please try again." },
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
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const linkMatch = entry.match(/<link rel="alternate" href="(.*?)"\/>/);
    if (titleMatch && linkMatch) {
      videos.push({
        title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        url: linkMatch[1],
      });
    }
  }
  return videos;
}

async function getPlaylists(channelUrl) {
  let handle = channelUrl.trim();
  if (handle.includes("youtube.com/")) {
    const parts = handle.split("youtube.com/");
    handle = parts[1].split("/")[0].split("?")[0];
  }
  if (!handle.startsWith("@")) {
    handle = "@" + handle;
  }

  const response = await fetch(`https://www.youtube.com/${handle}/playlists`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!response.ok) return [];
  const html = await response.text();

  const playlists = [];
  // Regex to extract playlists from ytInitialData
  const regex = /"playlistId":"([^"]+)","title":\{"runs":\[\{"text":"([^"]+)"\}\]\}/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    // Avoid duplicates
    if (!playlists.find(p => p.id === match[1])) {
      playlists.push({
        id: match[1],
        title: match[2],
        url: `https://www.youtube.com/playlist?list=${match[1]}`
      });
    }
  }
  return playlists;
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

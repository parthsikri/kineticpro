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
    const { videoUrl, pastedTranscript } = body;

    if (!videoUrl?.trim() && !pastedTranscript?.trim()) {
      return NextResponse.json({ success: false, error: "Please provide either a YouTube URL or a pasted transcript." }, { status: 400 });
    }

    // Fetch or use pasted YouTube Video Transcript
    let transcriptText = pastedTranscript?.trim() || "";
    let transcriptFetchError = "";
    if (!transcriptText && videoUrl?.trim()) {
      try {
        const transcript = await getYoutubeTranscriptInnerTube(videoUrl);
        if (transcript) {
          transcriptText = transcript.slice(0, 40000); // Limit to ~8,000 words
        } else {
          transcriptFetchError = "Could not auto-retrieve transcript from the video URL. This is common on Vercel deployments due to YouTube firewall blocks. Please copy-paste the transcript directly below.";
        }
      } catch (err) {
        console.error("Failed to fetch transcript:", err);
        transcriptFetchError = "Failed to load video transcript due to a network connection issue. Try copy-pasting the transcript directly instead.";
      }
    }

    if (!transcriptText) {
      return NextResponse.json({
        success: false,
        error: transcriptFetchError || "Could not retrieve transcript. Please paste the transcript directly."
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      await new Promise(r => setTimeout(r, 1500));
      return NextResponse.json({
        success: true,
        isMock: true,
        chapters: [
          { time: "0:00", title: "Introduction" },
          { time: "1:15", title: "Key Concept Explained" },
          { time: "4:30", title: "Deep Dive Analysis" },
          { time: "8:45", title: "Practical Examples" },
          { time: "12:00", title: "Conclusion & Summary" }
        ]
      });
    }

    const systemInstruction = [
      "You are a professional YouTube Video Editor and Content Strategist.",
      "Your task is to analyze a video transcript and generate highly accurate, engaging YouTube video chapters.",
      "Rules for generating chapters:",
      "- Ensure logical spacing between chapters (e.g., every 1-5 minutes, depending on topic changes).",
      "- Always start the first chapter at '0:00'.",
      "- The titles should be engaging and accurate based on the text.",
      "- Output ONLY raw JSON. No markdown fences. No extra text."
    ].join("\n");

    const userPrompt = [
      "VIDEO TRANSCRIPT (Parsed directly from the video):",
      transcriptText,
      "",
      "Generate YouTube chapters based on this transcript. Return ONLY this exact JSON format:",
      "{",
      '  "chapters": [',
      '    { "time": "0:00", "title": "Introduction" },',
      '    { "time": "2:15", "title": "The Next Important Topic" }',
      "  ]",
      "}"
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
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2048,
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
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error(`No valid JSON block found in Gemini output: ${rawText}`);
    }
    const cleaned = rawText.substring(firstBrace, lastBrace + 1);

    const result = JSON.parse(cleaned);
    return NextResponse.json({ success: true, chapters: result.chapters || [] });

  } catch (error) {
    console.error("[CHAPTERS_ROUTE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Chapters generation failed. Please try again." },
      { status: 500 }
    );
  }
}

// Reused from seo route
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

/**
 * Helper to extract text from PDFs or Images using Gemini 2.5 Flash
 */
export async function extractTextFromDocument(fileData) {
  if (!fileData || !fileData.data) return null;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing, skipping text extraction.");
      return "Syllabus uploaded but text extraction disabled due to missing Gemini API Key.";
    }

    // fileData.data is something like: "data:application/pdf;base64,JVBERi0xLjQK..."
    const parts = fileData.data.split(",");
    const mimeType = parts[0].split(":")[1].split(";")[0];
    const base64Data = parts[1];

    const prompt = "Please read this document carefully and extract all the text, topics, syllabus details, and keywords. Format it cleanly as plain text. Do not summarize, just extract the text.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini Vision API failed: ${response.status} - ${errText}`);
      return null;
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return extractedText.trim();
  } catch (error) {
    console.error("Error extracting text from document:", error);
    return null;
  }
}

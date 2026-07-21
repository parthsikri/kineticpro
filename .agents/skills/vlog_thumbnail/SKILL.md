---
name: vlog-thumbnail-module
description: Specialized prompt and strategy module for Vlog and Lifestyle YouTubers (Daily Vlogs, Travel, Family, Challenge, and Cinematic Lifestyle Content).
---

# Vlog YouTuber Thumbnail Strategy Module

This module defines a high-impact, story-driven thumbnail strategy tailored specifically for **Vlog & Lifestyle Creators** (e.g., Daily Vlogs, Travel Vlogs, Family Vlogs, Car/Bike Vlogs, and Challenge Vlogs).

---

## 1. Module Overview & Aesthetic

Unlike academic or news thumbnails, Vlog thumbnails rely heavily on **storytelling, raw emotional curiosity, and vibrant real-world environments**.

- **Tone & Style**: High-energy, emotional, candid yet cinematic, story-focused, and click-worthy.
- **Reference Aesthetics**: Top Indian & Global Vlog Channels (e.g. Flying Beast, Sourav Joshi Vlogs, Casey Neistat). Warm golden-hour or vibrant cinematic color grading, dramatic depth of field, natural yet punchy lighting.
- **Color Palette**: Warm tones (Golden Orange `#f97316`, Deep Amber `#b45309`, Crimson Red `#ef4444`) paired with crisp white text (`#FFFFFF`) and yellow accent highlights (`#f5d800`).

---

## 2. Layout Structure

- **LEFT / CENTER (50%)**: Vlogger(s) showing strong, expressive emotions (excitement, shock, joy, exhaustion, intrigue). The subject holds a story-relevant prop (e.g. holding a vlog camera/tripod, car keys, boarding pass, mystery gift box, or pointing at an event behind them).
- **RIGHT / TOP**: Stacked story-driven headline text and event location pill.
- **BACKGROUND**: Immersive real-world setting (e.g. airport terminal, highway drive, mountain viewpoint, festive home setup, luxury resort) with natural bokeh and dynamic lighting.

---

## 3. Dedicated Vlog Prompt Template System

### A. Topic & Story Context Rule
> "The image MUST depict a candid, high-production vlog scene representing: '[VLOG_TOPIC_HERE]'. The background environment, subject action, props, and overall emotion must convey a dramatic moment in the vlogger's day. Include real-life props (e.g. travel bags, camera rig, car interior, gift box) and realistic ambient lighting matching the location."

### B. Vlog Overlay Rules
1. **Location / VLOG Badge**: Top-Left pill tag with location or vlog series (e.g., `GOA TRIP | DAY 3` or `SURPRISE VLOG`).
2. **Story Headline**: Short, high-curiosity phrase in bold ALL-CAPS (max 2-3 words per line).
   - Line 1: Pure White (`#FFFFFF`) with heavy drop shadow.
   - Line 2: Vibrant Accent Yellow (`#f5d800`) or Crimson (`#ef4444`) with dark stroke.
3. **Curiosity Elements**: Optional story badge (e.g. "CONFIDENTIAL", "UNFILTERED", or "SURPRISE").
4. **NO ACADEMIC OVERLAYS**: Strictly NO exam notices, marksheets, date callouts, or lecture pills.

---

## 4. Complete Image Generation Prompt Template (Vlog Engine)

```text
Generate a COMPLETE, cinematic Vlog YouTube thumbnail image. 

REFERENCE STYLE: Premium Indian & Global Lifestyle Vlogger thumbnails (Flying Beast, Sourav Joshi Vlogs). Candid storytelling, ultra-expressive presenter, warm cinematic lighting, bold headline text.

FORMAT: 16:9 landscape (2560x1440)

VLOG STORY/TOPIC: [VLOG_TOPIC_HERE]
This image must visually capture the climax or most intriguing moment of this vlog. The environment, subject expression, and props must immediately tell a story. Include realistic props matching the story (e.g. vlog camera on gorilla pod, suitcases, luxury car keys, gift wrapping).

LAYOUT ZONES:
- LEFT/CENTER (50%) — Expressive Vlogger / Subjects with high-emotion facial expression and natural rim lighting.
- RIGHT / TOP — High-contrast stacked headline text and location pill badge.
- BACKGROUND — Real-world immersive location (e.g., airport lounge, scenic road trip, home surprise setup) with shallow depth of field and warm ambient glow.

TYPOGRAPHY & OVERLAYS:
- Top Badge: Pill-shaped label with bold white text on dark semi-transparent background (e.g., "DAILY VLOG" or "ROAD TRIP").
- Main Headline: Ultra-bold Impact font, ALL CAPS, short intriguing 2-line phrase. Line 1 in white (#FFFFFF), Line 2 in bright yellow (#F5D800). Heavy drop shadows for maximum readability over busy real-world backgrounds.

COLOR & LIGHTING:
- Warm cinematic color grading (gold, warm amber, vibrant blues).
- Realistic, high-end camera feel (35mm lens effect, soft background bokeh).

QUALITY: Photorealistic, 4K magazine-cover grade, hyper-engaging. Make it visually irresistible so viewers instantly want to click and see what happened.
```

---

## 5. Usage Note

This module exists alongside the Education module in `.agents/skills/vlog_thumbnail/SKILL.md` as an isolated prompt specification for Vlog Creators without modifying any active application source code.

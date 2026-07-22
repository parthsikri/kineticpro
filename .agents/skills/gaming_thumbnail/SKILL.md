---
name: gaming-thumbnail-module
description: Specialized high-CTR prompt and strategy module for Gaming YouTubers (BGMI, GTA 5, Minecraft, Valorant, Free Fire, Live Streams, Challenges, and Esports).
---

# Gaming YouTuber Thumbnail Strategy Module

This module defines an explosive, maximum-CTR thumbnail strategy designed for **Gaming Creators & Streamers** (e.g., Techno Gamerz, Total Gaming, CarryMinati, BeastBoysShub, Ninja, and Esports Channels).

---

## 1. Module Overview & Aesthetic

Gaming thumbnails thrive on **hyper-expressive gamer reactions, high-stakes game moments, volumetric particle effects, and high-contrast atmospheric lighting**.

- **No Hardcoded Color Constraints**: Color palettes are **dynamically determined by the game world itself** (e.g., fiery orange/gold embers for battle royales, cybernetic neon cyan/purple for Valorant/Sci-Fi, vibrant green/blue for Minecraft, dark dramatic atmosphere for horror/story games).
- **Reference Aesthetics**: Top Indian & Global Gaming Channels (Techno Gamerz, CarryMinati, Total Gaming, MrBeast Gaming).
- **Core Focus**: Maximum visual chaos, epic game metaphors, high-clarity 3D text, and intense gamer emotion.

---

## 2. Layout Structure

- **LEFT / CENTER (40-50%)**: Hyper-expressive gamer wearing a sleek gaming headset. Expressing peak emotion (screaming victory, jaw-dropping shock, intense focus, or hands on head in disbelief). Holding a gaming controller or keyboard.
- **RIGHT / BACKGROUND**: Epic 3D in-game scene or climax moment (air-drop crate, boss fight, mega mansion, 1v4 clutch situation, rare secret loot).
- **OVERLAYS & GRAPHICS**: High-contrast 3D text, rank badge/kill-counter pill, energy aura, or red circle/arrow highlighting an in-game secret.

---

## 3. Dedicated Gaming Prompt Template System

### A. Game World & Moment Rule
> "The image MUST depict an epic, high-stakes gaming scenario for: '[GAMING_TOPIC_HERE]'. Dynamically generate the color grading, rim lighting, atmospheric embers, and game-specific environment matching this game world (e.g. GTA 5 heist, BGMI battleground, Minecraft survival, Valorant clutch, Horror boss fight). Make the atmosphere feel alive with particle effects, volumetric light rays, and cinematic depth."

### B. Gaming Overlay Rules
1. **Top Badge / Counter**: Game rank emblem, kill counter, or challenge tag (e.g., `1v4 CLUTCH` or `WORLD FIRST`).
2. **Main Headline**: Massive 3D-effect Impact font (max 2-3 words per line) with strong outer glow and drop shadow for 100% legibility over busy game backgrounds.
3. **NO ACADEMIC / NOTICE OVERLAYS**: Strictly NO exam notices, marksheets, date callouts, or lecture pills.

---

## 4. Complete Image Generation Prompt Template (Gaming Engine)

```text
Generate a COMPLETE, explosive Gaming YouTube thumbnail image.

REFERENCE STYLE: Top-tier Esports & Gaming Creator thumbnails (Techno Gamerz, Total Gaming, CarryMinati, MrBeast Gaming). Hyper-expressive gamer reaction, 3D game environment, volumetric lighting, epic particle effects, high-CTR 3D text.

FORMAT: 16:9 landscape (2560x1440)

GAMING TOPIC / CHALLENGE: [GAMING_TOPIC_HERE]
Visually capture the most intense, jaw-dropping moment of this game or challenge. The game world, props, and environment must immediately tell the story (e.g. holding a glowing game controller, surrounded by loot crates, explosive battle royale background, or rare secret room).

COLOR & LIGHTING (DYNAMIC ADAPTIVE):
- Do NOT restrict to a single color. Dynamically choose the best high-contrast color palette matching the specific game world (e.g., glowing neon cyan, fiery orange/yellow sparks, intense purple energy, or dark cinematic moody atmospheric lighting).
- Dramatic volumetric light rays and rim lighting on the subject.

LAYOUT ZONES:
- LEFT 45% — Gamer/Presenter wearing a gaming headset with extreme, expressive facial reaction (jaw-dropped shock, shouting victory, or intense focus).
- RIGHT 55% — Immersive 3D game action environment with cinematic depth of field, embers, and action effects.
- OVERLAYS — High-contrast 3D headline text and game badge overlay.

TYPOGRAPHY & OVERLAYS:
- Headline: Ultra-bold Impact font with 3D bevel effect, ALL CAPS, short intriguing 2-line phrase (e.g. "INSANE CLUTCH!" or "SECRET ROOM!"). Strong text shadow and glowing border for perfect readability.
- Badges: Game rank emblem or 1v4 survivor pill tag.

QUALITY: Photorealistic, 4K render quality, hyper-engaging, maximum CTR. Make it visually thrilling so gamers scroll-stoppingly click.
```

---

## 5. Usage Note

This module is saved in `.agents/skills/gaming_thumbnail/SKILL.md` and dynamically executed in `src/app/api/plan/route.js` whenever `creatorType === 'gaming'`.

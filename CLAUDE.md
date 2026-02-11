# Oxygy AI Upskilling Website

## Project Overview
Interactive multi-section website for Oxygy's AI Center of Excellence. Showcases a five-level AI upskilling framework. Dual audience: external clients (showcase) + internal participants (learning hub).

## Site Sections
1. Homepage / Hero
2. Five Levels (L1-L5, progressive complexity)
3. Cross-Functional Use Cases (8 functions)
4. Learning Formats
5. Skills-Based Competency Gaps
6. Using AI to Learn Better
7. Footer CTA

## Brand & Visual Guidelines

### Colors
- Dark Navy: #1A202C to #2D3748 (headings, hero bg, nav, primary text)
- Oxygy Blue: #1E3A5F to #2B4C7E (icon circles, accents)
- Teal: #38B2AC to #4FD1C5 (primary CTAs, accent borders, links)
- Lavender: #C3D0F5 to #B8C9F0
- Pale Yellow: #F7E8A4 to #FBE8A6
- Soft Peach: #F5B8A0 to #FBCEB1
- Mint: #A8F0E0 to #B2F5EA
- Ice Blue bg: #E6FFFA to #F0FFF4
- White: #FFFFFF (dominant bg)
- Light Gray: #F7FAFC to #EDF2F7 (alt section bg)
- Medium Gray: #A0AEC0 (body text)
- Body Text Gray: #4A5568 to #718096
- Border Gray: #E2E8F0

### Typography
- Font: Geometric/humanist sans-serif from Google Fonts (DM Sans, Outfit, Plus Jakarta Sans, Manrope)
- NEVER: Inter, Roboto, Arial
- Headings: Bold 700-800, dark navy #1A202C. Hero ~48-56px, section ~32-40px, card ~18-20px
- Body: Regular 400, 14-16px, gray #4A5568-#718096, line-height 1.6-1.8, max ~500-600px columns
- Teal underline decoration on key heading words (NOT colored text)

### Components
- Cards: white bg, 1px solid #E2E8F0, no shadow
- Buttons Primary: solid teal #38B2AC, white text, pill shape (border-radius 24-30px)
- Buttons Secondary: white/transparent, 1px solid dark navy, pill/rounded rect
- Card CTA: bordered rect, navy text + arrow, NOT filled

### Layout
- Alternating white / light gray section backgrounds
- 80-120px vertical padding between sections
- ~1100-1200px max-width centered
- Two-column splits: text ~45% + visual ~55%
- Full-width teal CTA band with subtle watermark

### Avoid
- No purple gradients, glassmorphism, floating abstract shapes
- No Inter/Roboto/Arial
- No drop shadows on cards
- No colored heading text (always dark navy, teal underline only)
- No heavy gradients
- No center-aligned body text
- No oversized buttons

## Git Workflow

**Repository:** https://github.com/Josephkthomas/oxygy-ai-upskilling
**Branch:** `main`

After completing any feature, bug fix, or meaningful change:
1. Stage the changed files with `git add` (specific files, not `git add .`)
2. Commit with a clear message describing the change
3. Push to `origin main` with `git push`

Do this automatically at the end of every task — do not wait for the user to ask. If a task involves multiple related changes, commit them together as one logical unit. If a task involves unrelated changes, use separate commits.

Never commit `.env.local`, credentials, or large binary files.

## Reference
- Full content spec: OXYGY_AI_UPSKILLING_SYSTEM_PROMPT.md
- PDF content source: OXYGY_AI_Upskilling.pdf

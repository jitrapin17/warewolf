# Warewolf Design System

> Source: Figma file `lOwNSYgupZrmcUcEekXOkC` (POC-TEST-FIGMA-CLAUDE)  
> Fonts: Cinzel, Cinzel Decorative, Cormorant Garamond, Inter (via Google Fonts)

---

## Color Styles

### Solid Colors

| Style Name | Hex | CSS Var | Usage |
|---|---|---|---|
| Woft/BG/Dark Grey | `#181715` | `--color-bg-dark` | Page background, screen bg |
| Woft/BG/BG Grey | `#303030` | `--color-bg-grey` | Card backgrounds |
| Woft/Brand/Red | `#900904` | `--color-brand-red` | Buttons, deco diamond, accent |
| Woft/Drak Cream | `#BAB7AC` | `--color-cream` | Body text, label text |
| Woft/Cream | `#FFF9E2` | `--color-cream-light` | Info label text |
| Woft/White | `#FFFFFF` | `--color-white` | Button text |
| Woft/Brand/Cyan | `#B9EAE8` | — | Gradient stop in BG Gradient |

### Gradient Styles

| Style Name | Definition | CSS Var | Usage |
|---|---|---|---|
| Woft/Gradient/BG Gradient | `134.999deg, #900904 0%, rgba(185,234,232,0.3) 66.667%, rgba(144,9,4,0.6) 100%` | `--gradient-bg` | Role card border |
| Woft/Gradient/Gradient | `to right, #900904, #212121` | `--gradient-icon` | Icon button background |
| Woft/Gradient/Grey Gradient | `to bottom, rgba(48,48,48,0) 0%, #303030 85%` | `--gradient-card-bg` | Info card background |
| Woft/Gradient/Linear | `90deg, rgb(146,5,3) 0%, rgb(181,234,232) 100%` | `--gradient-title` | Role title text fill |
| Woft/Gradient/White-Gray-Black | `to right, transparent, rgba(0,51,51,0.3), transparent` | `--gradient-deco-bottom` | Deco bottom line |
| *(no style)* Deco gold left | `to right, transparent, rgba(232,165,48,0.5)` | `--gradient-deco-gold-l` | Deco top bar left line |
| *(no style)* Deco gold right | `to left, transparent, rgba(232,165,48,0.5)` | `--gradient-deco-gold-r` | Deco top bar right line |

---

## Effect Styles

| Style Name | Value | CSS Var | Usage |
|---|---|---|---|
| Title | `drop-shadow(0px 2px 8px rgba(185,48,50,0.5))` | `--effect-title-shadow` | Role title wrapper |

---

## Text Styles

### Display

| Style Name | Font | Weight | Size | Usage |
|---|---|---|---|---|
| text/display/h1 | Cinzel Decorative | 700 | 33px | Role title (h1) |
| text/display/h1-small | Cinzel Decorative | 700 | 28px | — |

### Heading

| Style Name | Font | Weight | Size | Usage |
|---|---|---|---|---|
| text/heading/h2 | Cinzel | 700 | 28px | — |
| text/heading/h3 | Cinzel | 700 | 24px | — |

### Title

| Style Name | Font | Weight | Size | Usage |
|---|---|---|---|---|
| text/title/large | Cinzel | 700 | 20px | — |
| text/title/medium | Cinzel | 700 | 18px | — |
| text/title/small | Cinzel | 700 | 16px | — |

### Label

| Style Name | Font | Weight | Size | Usage |
|---|---|---|---|---|
| text/label/large | Cinzel | 700 | 14px | Reveal title, button text |
| text/label/medium | Cinzel | 700 | 12px | Info label, icon area |
| text/label/small | Cinzel | 700 | 11px | — |

### Body

| Style Name | Font | Weight | Size | Usage |
|---|---|---|---|---|
| text/body/large | Cormorant Garamond | 400 | 14px | Subtitle, info description |
| text/body/medium | Cormorant Garamond | 400 | 12px | — |
| text/body/small | Cormorant Garamond | 400 | 11px | — |

### Caption

| Style Name | Font | Weight | Size | Usage |
|---|---|---|---|---|
| text/caption | Inter | 400 | 11px | — |
| text/caption/small | Inter | 400 | 10px | — |

---

## Components

### Icon Button (`96:82` — Component Set)

Variants controlled by `Property 1`:

| Variant | Node ID | Used in |
|---|---|---|
| Ability | `96:81` | Info row — ability |
| Win Condition | `96:80` | Info row — win condition |
| Daed | — | — |
| Moon | — | — |

Size: 36×36px, border-radius: 8px, padding: 0 9px  
Background: Woft/Gradient/Gradient

### Button (`315:39` — Component)

Full-width button, border-radius: 16px, padding: 16px  
Background: Woft/Brand/Red (`#900904`)  
Text: Woft/White, text/label/large  
Text override via: `instance.findOne(n => n.type === 'TEXT').characters`

### Icon (`96:66` — Component)

Inner icon inside Icon Button, exported as SVG.  
Sub-nodes: `96:67` (Ability icon), `96:76` (Win icon)

---

## Assets

| Asset | Node ID | Format | File |
|---|---|---|---|
| Werewolf image | `411:59` | PNG (IMAGE fill) | `assets/werewolf.png` |
| Wolfcub image | `430:50` | PNG (IMAGE fill) | `assets/wolfcub.png` |
| Ability icon | `96:67` | SVG export | `assets/icon-ability.svg` |
| Win icon | `96:76` | SVG export | `assets/icon-win.svg` |

> **Note:** Use direct node IDs only. Instance IDs (prefix `I`) are not accessible cross-page via `figma.getNodeById()`.

---

## Screens

| File | Figma Frame | Role | Height |
|---|---|---|---|
| `index.html` | `index` on [Dev Change] page | Werewolf | 888px |
| `handmade.html` | `handmade` on [Dev Change] page | Wolf Cub | 844px |

Screen width: 390px (iPhone 14 base)

# Figma Styles Export

> Source: `lOwNSYgupZrmcUcEekXOkC` (POC-TEST-FIGMA-CLAUDE)  
> Exported: 16/05/26  
> Note: ชื่อซ้ำ → ใช้ first occurrence เท่านั้น (ตาม plugin rule)

---

## Text Styles

> ⚠️ มี duplicate styles ชื่อเดิมแต่ font เป็น Inter Regular 12px — ควรลบทิ้ง

### Display

| Style Name | Font Family | Style | Size | Line Height |
|---|---|---|---|---|
| `text/display/h1` | Cinzel Decorative | Bold | 33px | AUTO |
| `text/display/h1-small` | Cinzel Decorative | Bold | 28px | AUTO |

### Heading

| Style Name | Font Family | Style | Size | Line Height |
|---|---|---|---|---|
| `text/heading/h2` | Cinzel | Bold | 28px | AUTO |
| `text/heading/h3` | Cinzel | Bold | 24px | AUTO |

### Title

| Style Name | Font Family | Style | Size | Line Height |
|---|---|---|---|---|
| `text/title/large` | Cinzel | Bold | 20px | AUTO |
| `text/title/medium` | Cinzel | Bold | 18px | AUTO |
| `text/title/small` | Cinzel | Bold | 16px | AUTO |

### Label

| Style Name | Font Family | Style | Size | Line Height |
|---|---|---|---|---|
| `text/label/large` | Cinzel | Bold | 14px | AUTO |
| `text/label/medium` | Cinzel | Bold | 12px | AUTO |
| `text/label/small` | Cinzel | Bold | 11px | AUTO |

### Body

| Style Name | Font Family | Style | Size | Line Height |
|---|---|---|---|---|
| `text/body/large` | Cormorant Garamond | Regular | 14px | AUTO |
| `text/body/medium` | Cormorant Garamond | Regular | 12px | AUTO |
| `text/body/small` | Cormorant Garamond | Regular | 11px | AUTO |

### Caption

| Style Name | Font Family | Style | Size | Line Height |
|---|---|---|---|---|
| `text/caption` | Inter | Regular | 11px | AUTO |
| `text/caption/small` | Inter | Regular | 10px | AUTO |

### Other (legacy)

| Style Name | Font Family | Style | Size | Note |
|---|---|---|---|---|
| `heading/werewolf` | Inter | Regular | 12px | ไม่ได้ใช้ใน project |
| `heading/section` | Inter | Regular | 12px | ไม่ได้ใช้ใน project |
| `body/card-label` | Inter | Regular | 12px | ไม่ได้ใช้ใน project |
| `body/card-description` | Inter | Regular | 12px | ไม่ได้ใช้ใน project |
| `button/primary` | Inter | Regular | 12px | ไม่ได้ใช้ใน project |

---

## Color Styles

### Solid Colors

| Style Name | Hex | Opacity | CSS Var |
|---|---|---|---|
| `Woft/Drak Cream` | `#BAB7AC` | 100% | `--color-cream` |
| `Woft/Cream` | `#FFF9E2` | 100% | `--color-cream-light` |
| `Woft/White` | `#FFFFFF` | 100% | `--color-white` |
| `Woft/BG/Dark Grey` | `#181715` | 100% | `--color-bg-dark` |
| `Woft/Brand/Red` | `#900904` | 100% | `--color-brand-red` |
| `Woft/Brand/Cyan` | `#B5EAE8` | 91.8% | `--color-icon-dark` *(approx)* |

> ⚠️ `Woft/BG/BG Grey` ถูก save เป็น GRADIENT ใน Figma (ไม่ใช่ SOLID) — ดูหัวข้อ Gradient

### Gradient Styles

| Style Name | Direction | Stops | CSS Var | Usage |
|---|---|---|---|---|
| `Woft/Gradient/BG Gradient` | Linear | `#900904` 0% → `#B9EAE8` 30% (a=0.3) → `#900904` 60% (a=0.6) → 100% | `--gradient-bg` | Role card border |
| `Woft/Gradient/Icon Gradient` | Linear | `#900904` 0% → `#212121` 100% | `--gradient-icon` | Icon button bg |
| `Woft/Gradient/Grey Gradient` | Linear | `#303030` 0% (a=0) → `#303030` 85% (a=1) | `--gradient-card-bg` | Info card bg |
| `Woft/Gradient/Text Linear` | Linear | `#900904` 0% → `#B9EAE8` 100% | `--gradient-title` | Role title text fill |
| `Woft/BG/BG Grey` | Linear | `#303030` 0% (a=0) → `#303030` 85% (a=1) | — | ซ้ำกับ Grey Gradient |
| `Woft/Gradient/White-Gray-Black` | Linear | `#FFFFFF` 0% → `#474A50` 59% → `#1D1D1D` 100% | — | ไม่ได้ใช้ใน project |

---

## Effect Styles

| Style Name | Type | Offset | Blur | Color | Usage |
|---|---|---|---|---|---|
| `Title` | DROP_SHADOW | x:0, y:2 | 8px | `rgba(185,48,50,0.5)` | Role title wrapper |

---

## Style ID Reference (สำหรับ Plugin)

### Text Styles (first occurrence เท่านั้น)

```
text/display/h1          → S:c237eedc...
text/display/h1-small    → S:c1575df5...
text/heading/h2          → S:51f3ed24...
text/heading/h3          → S:cfcfe08c...
text/title/large         → S:7456c14e...
text/title/medium        → S:dab0a87b...
text/title/small         → S:34287a05...
text/label/large         → S:76021031...
text/label/medium        → S:ef85d5ca...
text/label/small         → S:873f453c...
text/body/large          → S:1d0d69bb...
text/body/medium         → S:24fc7963...
text/body/small          → S:81a13f5e...
text/caption             → S:067c1a22...
text/caption/small       → S:3eb1f4a7...
```

### Paint Styles

```
Woft/Drak Cream              → S:e3627fb4...
Woft/Cream                   → S:9cc2a132...
Woft/White                   → S:ad040d50...
Woft/BG/Dark Grey            → S:d32892a4...
Woft/Brand/Red               → S:ede8f193...
Woft/Brand/Cyan              → S:870cc445...
Woft/Gradient/Grey Gradient  → S:96d0f514...
Woft/Gradient/Text Linear    → S:fe674e40...
Woft/Gradient/BG Gradient    → S:fec492a5...
Woft/Gradient/Icon Gradient  → S:7f2e0109...
```

### Effect Styles

```
Title  → S:8b29f08f...
```

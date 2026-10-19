# Edrealm Design System & Theme Specification

> Reverse-engineered from [edrealm.in](https://edrealm.in/) for MVP and product development.
> Reference screenshot captured at: `output/theme-capture.png`

---

## 1. Aesthetic Archetype & Design Language

The site embodies a **Neo-Clean Glassmorphic SaaS** visual language:
- **Tone**: High-contrast, sleek, developer-focused, technical yet approachable (reminiscent of Vercel, Linear, and modern Apple interface design).
- **Surface Layering**: Frosted glassmorphism (`backdrop-filter: blur(12px - 16px)`) set on top of an ultra-subtle cool-slate tinted background (`#FAFBFF`).
- **Depth & Atmosphere**: Radial ambient light orbs (Indigo, Violet, Pink, Cyan) with 80px blur combined with a 60px × 60px technical grid line overlay.
- **Accents**: Indigo (`#6366F1`) as the primary interactive accent, Emerald (`#10B981`) for live telemetry/indicators, and stark Black/White (`#000000` / `#FFFFFF`) for primary call-to-actions.

---

## 2. Complete Color Palette

### 2.1 Brand & Accent Colors

| Token | Hex | RGBA Equivalent | Usage & Role |
| :--- | :--- | :--- | :--- |
| `--primary` | `#6366F1` | `rgb(99, 102, 241)` | Primary accent (Indigo 500) — active links, badge borders, section labels |
| `--primary-glow` | `#6366F133` | `rgba(99, 102, 241, 0.20)` | Glow box-shadows behind primary buttons and badges |
| `--secondary` | `#8B5CF6` | `rgb(139, 92, 246)` | Secondary accent (Violet 500) — ambient mesh gradients, secondary orbs |
| `--accent` | `#10B981` | `rgb(16, 185, 129)` | Status & success green (Emerald 500) — live status dots, card hover borders |
| CTA Primary Fill | `#000000` | `rgb(0, 0, 0)` | High-contrast black button backgrounds |
| CTA Primary Text | `#FFFFFF` | `rgb(255, 255, 255)` | Primary button text |

### 2.2 Backgrounds, Surfaces & Glass

| Token | Hex / Value | RGBA Equivalent | Usage & Role |
| :--- | :--- | :--- | :--- |
| `--bg-primary` | `#FFFFFF` | `rgb(255, 255, 255)` | Pure white canvas |
| `--bg-secondary` | `#FAFBFF` | `rgb(250, 251, 255)` | Default page and section background (cool off-white) |
| `--surface` | `#F1F5F9` | `rgb(241, 245, 249)` | Slate 100 — subtle surface fill |
| `--surface-hover` | `#E2E8F0` | `rgb(226, 232, 240)` | Slate 200 — surface hover fill |
| Card Glass Surface | `rgba(255, 255, 255, 0.80)` | `rgba(255, 255, 255, 0.80)` | Standard frosted glass card surface |
| Card Inner Gradient | `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.85))` | White gradient with `backdrop-filter: blur(10px)` |
| Featured Card Surface | `#000000` | `rgba(0, 0, 0, 0.95)` | Dark inverted card fill for hero/featured items |
| Floating Nav Surface | `rgba(255, 255, 255, 0.80)` | `rgba(255, 255, 255, 0.80)` | Scrolled pill navbar with backdrop blur |

### 2.3 Typography & Text Colors

| Token | Hex | RGBA Equivalent | Usage & Role |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#0F172A` | `rgb(15, 23, 42)` | Slate 900 — primary text, high-contrast headings |
| Display Headings | `#000000` | `rgb(0, 0, 0)` | Pure black for H1 and H2 display headers |
| `--text-secondary` | `#475569` | `rgb(71, 85, 105)` | Slate 600 — paragraph descriptions, body copy, card body |
| `--text-muted` | `#94A3B8` | `rgb(148, 163, 184)` | Slate 400 — placeholders, tertiary text |
| Card Body Subtext | `#64748B` | `rgb(100, 116, 139)` | Slate 500 — course card descriptions |
| Watermark Number | `rgba(0, 0, 0, 0.03)` | `rgba(0, 0, 0, 0.03)` | Oversized index watermark in cards (`01`, `02`, etc.) |

### 2.4 Borders & Dividers

| Token | Hex / Value | Usage & Role |
| :--- | :--- | :--- |
| `--border` | `#0F172A0F` (`rgba(15, 23, 42, 0.059)`) | Ultra-subtle border for general containers |
| `--border-hover` | `#0F172A1F` (`rgba(15, 23, 42, 0.12)`) | Active and hover state borders |
| Glass Card Border | `rgba(255, 255, 255, 0.60)` | 1px border for glassmorphic cards |
| Subtle Element Border| `rgba(0, 0, 0, 0.04)` to `rgba(0, 0, 0, 0.08)` | Circular close buttons, secondary button borders |
| Dark Card Border | `rgba(255, 255, 255, 0.10)` | 1px border for inverted black cards |

---

## 3. Gradients, Ambient Lighting & Textures

### 3.1 Hero Background Mesh Orbs
```css
/* Ambient radial orbs floating with filter: blur(80px) and opacity: 0.4 */
.orb-1 {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5), rgba(0, 0, 0, 0) 70%); /* Indigo */
  width: 500px;
  height: 500px;
}
.orb-2 {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4), rgba(0, 0, 0, 0) 70%); /* Violet */
  width: 400px;
  height: 400px;
}
.orb-3 {
  background: radial-gradient(circle, rgba(236, 72, 153, 0.3), rgba(0, 0, 0, 0) 70%); /* Pink */
  width: 300px;
  height: 300px;
}
.orb-4 {
  background: radial-gradient(circle, rgba(6, 182, 212, 0.3), rgba(0, 0, 0, 0) 70%);  /* Cyan */
  width: 250px;
  height: 250px;
}
```

### 3.2 Technical Grid Background
```css
background-image: linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
                  linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px);
background-size: 60px 60px;
mask-image: radial-gradient(#000000 30%, rgba(0, 0, 0, 0) 80%);
```

### 3.3 Card Shimmer Sweep
```css
background: linear-gradient(
  135deg,
  rgba(0, 0, 0, 0) 40%,
  rgba(255, 255, 255, 0.4) 50%,
  rgba(0, 0, 0, 0) 60%
);
```

---

## 4. Typography Specification

### 4.1 Font Family
- **Primary Typeface**: `Inter`
- **Fallback Stack**: `"Inter Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **CSS Variable**: `--font-inter: "Inter", "Inter Fallback"`

### 4.2 Type Scale Hierarchy

| Element | Font Size | Weight | Line Height | Letter Spacing | Case / Transform | Color |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display (H1)** | `clamp(2rem, 5.5vw, 3.8rem)` (~56px) | `800` (Extra Bold) | `1.1` | `-0.03em` | None | `#000000` |
| **Section Title (H2)** | `clamp(2.5rem, 6vw, 4rem)` (~62px) | `800` (Extra Bold) | `1.1` | `-0.03em` | None | `#000000` |
| **Card Title (H3)** | `1.65rem` - `1.75rem` (~26-28px) | `800` (Extra Bold) | `1.2` | `-0.02em` | None | `#0C0C0E` / `#0F172A` |
| **Section Kicker / Label**| `0.85rem` (~13.6px) | `700` (Bold) | `1.0` | `+0.20em` to `+0.25em` | **UPPERCASE** | `#6366F1` (`--primary`) |
| **Stat Big Value** | `2.5rem` (~40px) | `800` (Extra Bold) | `1.0` | Normal | None | `#000000` |
| **Hero Lead Paragraph** | `1.15rem` (~18.4px) | `400` (Regular) | `1.7` (~31px) | Normal | None | `#475569` |
| **Standard Body Text** | `1.00rem` - `1.05rem` (~16px) | `400` (Regular) | `1.6` - `1.7` | Normal | None | `#475569` |
| **Buttons / CTAs** | `0.90rem` - `0.95rem` (~14-15px) | `600` - `700` | Normal | Normal | None | `#FFFFFF` / `#0F172A` |
| **Nav Links** | `0.92rem` (~14.7px) | `400` (Regular) | Normal | Normal | None | `#000000` (opacity 0.9) |
| **Badge / Pill Tag** | `0.80rem` (~12.8px) | `600` (Semi Bold) | Normal | `+0.08em` | **UPPERCASE** | `#6366F1` |

---

## 5. Elevation, Shadows & Glassmorphism

```css
/* Glass Blur */
--glass-blur: blur(16px);
--glass-shadow: 0 4px 24px 0 rgba(15, 23, 42, 0.04);

/* Floating Navbar Scrolled State */
box-shadow: rgba(0, 0, 0, 0.06) 0px 8px 32px;

/* Primary CTA Button */
box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 16px;
/* Primary CTA Button Hover */
box-shadow: rgba(0, 0, 0, 0.12) 0px 8px 24px;

/* Cards Default State */
box-shadow: rgba(0, 0, 0, 0.04) 0px 1px 3px, rgba(0, 0, 0, 0.03) 0px 4px 12px;

/* Cards Hover State */
box-shadow: rgba(0, 0, 0, 0.08) 0px 20px 40px -10px, 
            rgba(0, 0, 0, 0.04) 0px 4px 12px, 
            rgba(255, 255, 255, 0.4) 0px 0px 0px 1px inset;

/* Testimonial Card Hover */
box-shadow: rgba(99, 102, 241, 0.1) 0px 20px 50px -10px;
```

---

## 6. Border Radii & Layout Tokens

| Token / Element | Value | Purpose |
| :--- | :--- | :--- |
| `Pill / Full Round` | `100px` | Buttons, navbar capsule, badges, nav links |
| `Card Standard` | `24px` | Standard differential and feature cards |
| `Card Large` | `28px` | Course cards, carousel cards |
| `Circular Button` | `50%` | Close button, icon navigation buttons (`44px × 44px`) |
| `Input / Form Button` | `3px` / `8px` | Contact form submit button |
| `--container-max-width` | `1280px` | Main content container max-width |
| `--nav-height` | `80px` | Header offset height |
| `--section-padding` | `40px` | Section vertical padding |

---

## 7. Transitions & Micro-Interactions

### 7.1 Timing Functions
```css
/* Snappy Apple-style spring easing */
--transition-spring: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

/* Smooth deceleration */
--transition-smooth: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
```

### 7.2 Hover Interactions
- **Primary Buttons**: `transform: translateY(-1px)` with elevation shadow jump.
- **Button Arrow Icons**: `transform: translate(2px, -2px)` on hover.
- **Cards**: `transform: translateY(-6px) scale(1.02)` on hover with accent border glow.
- **Card Icon Wrapper**: `transform: scale(1.1) rotate(5deg)` on card hover.
- **Card Watermark Number**: `transform: translateY(-5px) scale(1.05)` with color shifting from `0.03` to `0.06` opacity.
- **Pill Nav Links**: Background transitions from `transparent` to `rgba(0, 0, 0, 0.04)` on hover.

---

## 8. Implementation Code Snippets

### 8.1 Pure CSS `:root` Theme Variables
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #fafbff;
  --surface: #f1f5f9;
  --surface-hover: #e2e8f0;

  /* Borders */
  --border: #0f172a0f;
  --border-hover: #0f172a1f;

  /* Brand Accents */
  --primary: #6366f1;
  --primary-glow: #6366f133;
  --secondary: #8b5cf6;
  --accent: #10b981;

  /* Typography */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --font-inter: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Glassmorphism & Layout */
  --glass-blur: blur(16px);
  --glass-shadow: 0 4px 24px 0 #0f172a0a;
  --nav-height: 80px;
  --container-max-width: 1280px;
  --section-padding: 40px;

  /* Transitions */
  --transition-smooth: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  --transition-spring: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 8.2 Tailwind CSS Configuration (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          secondary: '#FAFBFF',
        },
        surface: {
          DEFAULT: '#F1F5F9',
          hover: '#E2E8F0',
          glass: 'rgba(255, 255, 255, 0.80)',
        },
        primary: {
          DEFAULT: '#6366F1',
          glow: 'rgba(99, 102, 241, 0.20)',
        },
        secondary: '#8B5CF6',
        accent: '#10B981',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        border: {
          subtle: 'rgba(15, 23, 42, 0.059)',
          subtleHover: 'rgba(15, 23, 42, 0.12)',
          glass: 'rgba(255, 255, 255, 0.60)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'pill': '100px',
        'card': '24px',
        'card-lg': '28px',
      },
      boxShadow: {
        'glass': '0 4px 24px 0 rgba(15, 23, 42, 0.04)',
        'nav-scrolled': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'card-subtle': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'btn': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'btn-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.20)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      }
    }
  }
}
```

### 8.3 Key Component Patterns

#### Primary Pill CTA Button
```html
<a href="#" class="inline-flex items-center gap-2.5 px-9 py-4 bg-black text-white text-[0.95rem] font-bold rounded-pill shadow-btn transition-all duration-300 hover:shadow-btn-hover hover:-translate-y-0.5 group">
  <span>Explore Curriculum</span>
  <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" ...></svg>
</a>
```

#### Pill Badge with Pulsing Live Dot
```html
<div class="inline-flex items-center gap-2.5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#6366F1] bg-[#6366F1]/[0.06] border border-[#6366F1]/[0.12] rounded-pill">
  <span class="w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.5)] animate-pulse"></span>
  <span>DSA & System Design Mastery</span>
</div>
```

#### Glassmorphism Feature Card
```html
<div class="relative overflow-hidden p-10 flex flex-col gap-5 rounded-card bg-white/80 border border-white/60 shadow-card-subtle backdrop-blur-md transition-all duration-400 ease-spring hover:shadow-card-hover hover:-translate-y-1.5 group">
  <!-- Watermark Index -->
  <span class="absolute top-4 right-6 text-6xl font-extrabold text-black/[0.03] select-none transition-all duration-500 ease-smooth group-hover:text-black/[0.06] group-hover:-translate-y-1 group-hover:scale-105">
    01
  </span>

  <!-- Icon -->
  <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-[#6366F1]/[0.08] text-[#6366F1] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
    <!-- Icon SVG -->
  </div>

  <!-- Content -->
  <h3 class="text-[1.65rem] font-extrabold tracking-tight text-[#0C0C0E]">
    Production Systems
  </h3>
  <p class="text-[1.05rem] leading-[1.7] text-[#475569]">
    Learn directly from engineers who build distributed microservices handling millions of queries per second.
  </p>
</div>
```

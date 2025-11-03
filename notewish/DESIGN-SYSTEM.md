# NoteWish Design System

This document defines all design tokens, styles, and guidelines for the NoteWish application to ensure consistency across all pages and components.

---

## 🎨 Brand Identity

**Theme:** Emotional, magical, and joyful  
**Style:** Clean, rounded, with pastel gradients  
**Vibe:** Warm, friendly, and celebratory

---

## 🔤 Typography

### Font Families

```css
Primary (Headings): var(--font-poppins) - Poppins (Google Fonts)
Secondary (Body): var(--font-inter) - Inter (Google Fonts)
```

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

### Typography Scale

```jsx
// Headings - Use Poppins
<h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-poppins)]">
<h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-poppins)]">
<h3 className="text-2xl font-semibold font-[family-name:var(--font-poppins)]">
<h4 className="text-xl font-semibold font-[family-name:var(--font-poppins)]">

// Body Text - Use Inter
<p className="text-base font-[family-name:var(--font-inter)]">
<p className="text-lg font-[family-name:var(--font-inter)]"> // Larger body text
<p className="text-sm font-[family-name:var(--font-inter)]"> // Smaller text
```

---

## 🎨 Color Palette

### Brand Colors

```css
Pink: #ec4899 (rgb(236, 72, 153))
Purple: #a855f7 (rgb(168, 85, 247))
Blue: #3b82f6 (rgb(59, 130, 246))
```

**Tailwind Classes:**
```jsx
text-pink-500, bg-pink-500, border-pink-500
text-purple-500, bg-purple-500, border-purple-500
text-blue-500, bg-blue-500, border-blue-500
```

### Pastel Backgrounds

```css
Pink: #fce7f3
Purple: #f3e8ff
Blue: #dbeafe
Green: #d1fae5
Yellow: #fef3c7
Orange: #fed7aa
```

**Tailwind Classes:**
```jsx
bg-pink-50, bg-pink-100
bg-purple-50, bg-purple-100
bg-blue-50, bg-blue-100
```

### Gradients

**Brand Gradient (Primary):**
```jsx
className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
```

**Pastel Gradient (Background):**
```jsx
className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
```

**Category Card Gradients:**
```jsx
Birthday: "from-pink-400 to-rose-400"
Anniversary: "from-red-400 to-pink-400"
Get Well Soon: "from-green-400 to-teal-400"
Congratulations: "from-yellow-400 to-orange-400"
Thank You: "from-purple-400 to-indigo-400"
Friendship: "from-blue-400 to-cyan-400"
```

### Text Colors

```jsx
Primary: text-gray-800, text-gray-900
Secondary: text-gray-600
Tertiary: text-gray-500
Muted: text-gray-400
```

### UI Colors

```css
Success: #10b981 (green-500)
Error: #ef4444 (red-500)
Warning: #f59e0b (amber-500)
Info: #3b82f6 (blue-500)
```

---

## 📐 Spacing & Layout

### Spacing Scale (Tailwind)

```jsx
xs: p-2, m-2, gap-2     // 0.5rem (8px)
sm: p-4, m-4, gap-4     // 1rem (16px)
md: p-6, m-6, gap-6     // 1.5rem (24px)
lg: p-8, m-8, gap-8     // 2rem (32px)
xl: p-12, m-12, gap-12  // 3rem (48px)
2xl: p-16, m-16, gap-16 // 4rem (64px)
```

### Container Widths

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  // Standard page container
</div>
```

---

## 🔘 Border Radius

```jsx
Small: rounded-lg      // 0.5rem
Medium: rounded-xl     // 0.75rem
Large: rounded-2xl     // 1rem
Extra Large: rounded-3xl // 1.5rem
Full: rounded-full     // 9999px (perfect circle)
```

**Usage:**
- Buttons: `rounded-full`
- Cards: `rounded-2xl` or `rounded-3xl`
- Images: `rounded-xl`
- Inputs: `rounded-lg`

---

## ✨ Shadows

```jsx
Small: shadow-sm
Medium: shadow-md
Large: shadow-lg
Extra Large: shadow-xl
2XL: shadow-2xl

// Colored shadow for brand elements
hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.5)]
```

---

## 🎭 Effects & Transitions

### Transitions

```jsx
Fast: transition-all duration-150
Base: transition-all duration-200
Slow: transition-all duration-300
```

### Hover Effects

**Cards:**
```jsx
className="hover:scale-105 hover:shadow-2xl transition-all duration-300"
```

**Buttons:**
```jsx
className="hover:scale-110 transition-all duration-300"
```

**Interactive Elements:**
```jsx
className="hover:bg-pink-100 transition-colors"
```

### Backdrop Blur

```jsx
className="backdrop-blur-md" // For glass-morphism effect
className="backdrop-blur-sm" // Lighter blur
```

---

## 🧩 Component Patterns

### Navigation Bar

```jsx
<nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Content */}
    </div>
  </div>
</nav>
```

### Card Component

```jsx
<div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-pink-100">
  {/* Card content */}
</div>
```

### Primary Button

```jsx
<button className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-full px-6 py-3 font-bold hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.5)] font-[family-name:var(--font-poppins)]">
  Button Text
</button>
```

### Category Card (Interactive)

```jsx
<button className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-400 opacity-90" />
  <div className="relative z-10 text-center">
    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
      🎂
    </div>
    <h3 className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)]">
      Category Name
    </h3>
  </div>
</button>
```

### Gradient Text

```jsx
<h1 className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

---

## 📱 Responsive Breakpoints

```jsx
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
2xl: 1536px // 2X large devices
```

**Usage:**
```jsx
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  Responsive text
</div>
```

---

## ♿ Accessibility

### ARIA Labels

```jsx
<button aria-label="Settings">⚙️</button>
<button aria-label="Profile">👤</button>
```

### Focus States

```jsx
className="focus:ring-4 focus:ring-purple-400 focus:outline-none"
```

---

## 🎯 Usage Guidelines

### DO's ✅

- Use Tailwind utility classes for all styling
- Follow the defined color palette
- Use Poppins for headings, Inter for body text
- Apply smooth transitions to interactive elements
- Use pastel backgrounds for softness
- Add emoji decorations for playfulness
- Maintain consistent spacing

### DON'Ts ❌

- Don't add global CSS style overrides in globals.css
- Don't use arbitrary colors outside the palette
- Don't mix font families inconsistently
- Don't create heavy shadows on everything
- Don't use sharp corners (prefer rounded)

---

## 📦 File Structure

```
notewish/
├── src/
│   ├── app/
│   │   ├── globals.css         // Only CSS variables/tokens
│   │   ├── layout.tsx          // Font configuration
│   │   └── page.tsx            // Homepage
│   └── components/             // Reusable components (future)
├── DESIGN-SYSTEM.md            // This file
└── package.json
```

---

## 🔄 Version History

- **v1.0** (Jan 2025) - Initial design system with Poppins/Inter fonts, pastel gradient theme

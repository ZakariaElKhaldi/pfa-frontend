# CrowdSignal Frontend — "The Sentient Terminal"

CrowdSignal is an advanced, AI-powered financial sentiment intelligence platform. This frontend implements a sophisticated, editorial-style design philosophy called **"The Quantified Pulse,"** moving away from classic heavy-dashboard aesthetics to focus on depth, ambient shadows, and a "no-line" structural philosophy.

---

## 🏗️ Architecture & Tech Stack

This project is built using a modern, deeply optimized React stack:

- **Core:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Custom Vanilla CSS Design System + **Tailwind CSS v4** (`@tailwindcss/vite`)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Headless Radix UI + Tailwind)
- **Data Visualization:** D3.js (`d3`)
- **Component Workbench & Testing:** Storybook v10 (Integrated with Vitest & Playwright)
- **Routing & State:** *(To be implemented based on PRD)*

---

## 🎨 Design System: "The Quantified Pulse"

The custom design system logic overrides default boilerplate and establishes a premium, data-heavy terminal interface with the following rules:

1. **The No-Line Rule:** Boundaries are created through background color shifts in a 6-level tonal stack (`surface-container-lowest` to `surface-bright`), not borders.
2. **Ghost Borders:** Occasional subtle separation using 15%-opacity `outline-variant`.
3. **Dual Typography:**
   - **Inter:** For editorial UI text, nav, and body.
   - **JetBrains Mono:** Exclusively for quantitative financial data, numbers, timestamps, and percentages.
4. **Sentiment & Signal Colors:** Semantic color mappings designed for light mode:
   - `Primary`: Luminous Indigo
   - `Secondary / Bullish / Buy`: Deep Green (`hsl(158, 60%, 35%)`)
   - `Tertiary / Bearish / Sell`: Crimson Red (`hsl(4, 68%, 50%)`)
   - `Warning / Neutral / Hold`: Amber (`hsl(38, 88%, 46%)`)
5. **Glassmorphism:** Contextual menus and tooltips use deeply blurred, semi-transparent surfaces.

*(See the living design system showcase by spinning up the app).*

---

## 📦 What's Been Built So Far (Project History)

### Phase 1: Foundation & Specs
- Exhaustive backend audit and feature alignment to create a comprehensive Frontend PRD.
- Defined the "Sentient Terminal" design system, token scale, and motion curves.

### Phase 2: Design Token & Global Styles Engine
- Built a massive `src/index.css` serving custom variables (spacing, typography scale, radii, motion) for 32 component classes including: sentiment-bars, gauges, accuracy rings, social-feed cards, and badges.
- Mirrored all CSS variables into a strongly-typed TypeScript structure (`src/design-system/tokens.ts`).
- Created a fully responsive **Kitchen Sink Showcase** inside `App.tsx` displaying every UI primitive and metric chart.

### Phase 3: Toolchain Integration
Seamlessly integrated necessary libraries on top of the generic Vite/React setup:
1. **Tailwind CSS v4:** Integrated via Vite plugin, configured precisely within PostCSS rules to coexist dynamically with the custom vanilla CSS variables.
2. **shadcn/ui:** Resolved TypeScript path aliases (`@/*`) and installed essential interactive components: `card`, `button`, `input`, `badge`, `dialog`, `dropdown-menu`, `sonner`.
3. **D3.js:** Added full D3 library and TypeScript typings to prepare for complex financial indicator rendering.
4. **Storybook v10:** Initialized Storybook to act as an isolated component workbench, fully wired with Vitest runner and Playwright headless browser automation.

---

## 🚀 Development Scripts

Start the local vite dev server (App Kitchen Sink):
```bash
npm run dev
```

Build the project for production:
```bash
npm run build
```

Run the Storybook interactive component workbench:
```bash
npm run storybook
```

Lint the codebase:
```bash
npm run lint
```

## 📂 Directory Structure

```text
/src
 ├── /components
 │    └── /ui             # shadcn interactive components
 ├── /design-system       # TypeScript design tokens (mirrors CSS)
 ├── App.tsx              # Sentient Terminal Kitchen Sink Showcase
 ├── index.css            # Tailwind import + Custom Design Variables
 └── main.tsx             # React DOM root
```

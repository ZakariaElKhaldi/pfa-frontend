# Design System: CrowdSignal
**Project ID:** CrowdSignal Frontend

## 1. Visual Theme & Atmosphere
**"Obsidian Lens"**
The atmosphere aims to be a high-contrast, data-dense, and highly institutional trading terminal. It is intensely dark ("void") with strictly hierarchical tonal surfaces that draw the eye only to dynamic market changes. The vibe is ultra-modern, utilitarian, and unmistakably technical.

## 2. Color Palette & Roles
* **Void** (`#080D18`) - The deepest background layer. Used for the Page Canvas and main screen boundaries.
* **Surface** (`#0F172A`) - Mildly elevated background. Used for the unified App Layout background and major page content areas.
* **Surface Low** (`#1F2937`) - Subtle elevation. Used for large structural divisions like the Sidebar, Headers, and broader sections.
* **Container** (`#334155`) - Stronger visual grouping. Used as the default background for isolated Cards, Widgets, and interactive active states.
* **Container High** (`#475569`) - The highest generic elevation. Used for floating elements like Tooltips, Dropdowns, and nested high-priority cards.
* **Glass** (`rgba(31, 41, 55, 0.72)`) - Translucent glassmorphism overlay with backdrop blur. Used strictly for modal overlays and sticky live-feed headers to retain context density.

### Signal Semantics (Strictly Financial)
* **Signal Buy** (`#00E676`) - Intense neon green. Strictly reserved for positive market actions (BUY, Long). 
* **Signal Sell** (`#FF5252`) - Vibrant alert red. Strictly reserved for negative market actions (SELL, Short).
* **Signal Hold** (`#FFB300`) - Cautionary bright amber. Reserved for neutral market holding positions.

### UI Semantics (State Communication)
* **Action Primary** (`#2979FF`) - Electric Blue. Used for core brand actions and primary user interactions (e.g., executing a trade).

## 3. Typography Rules
* **Standard Text:** `Inter` (sans-serif) for all interface text, labels, and paragraph content. Weights are typically 400 (Regular) for body and 600 (Semibold) for headers.
* **Data Text:** `JetBrains Mono` for all prices, percentages, IDs, and tabular financial data. This ensures rigid column alignments and readable financial density.

## 4. Component Stylings
* **Badges/Tags:** Pill-shaped (fully rounded). In the case of signals, they utilize high contrast neon colors on top of a low-opacity container wrapper with a subtle border in the same hue.
* **Cards/Containers:** Subtly rounded corners (`rounded-xl` / `rounded-lg`). Instead of relying on heavy drop shadows, cards differentiate themselves using tonal contrasts (moving from `surface` to `container` backgrounds). 
* **Inputs/Forms:** Squared-off inputs with a muted stroke (`#334155`). Background matches the `container` or `surface-low` they reside on.

## 5. Layout Principles
* **Density:** Information-dense, utilizing tight internal paddings inside cards. 
* **Separation:** Tonal elevation is used over borders or shadows. When an interactive element like a card floats over the base app body, it uses background color to distinguish itself (`#0F172A` vs `#334155`).

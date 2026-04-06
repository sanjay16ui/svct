# Design System: High-End Cinematic Minimal

## 1. Overview & Creative North Star: "The Digital Curator"

This design system is built for an experience that feels less like a website and more like a high-end gallery or a cinematic title sequence. We are moving away from the "template" look of the modern web toward an editorial aesthetic we call **"The Digital Curator."**

The North Star is the intersection of **absolute void** (pure black) and **ethereal light** (liquid glass). We achieve a premium feel by prioritizing intentional asymmetry, generous white space (breathing room), and a hierarchy driven by sophisticated typography rather than structural lines. The goal is to create a sense of "quiet luxury"—where the interface is so refined it feels invisible, allowing the content to take center stage.

## 2. Colors & Surface Philosophy

The palette is strictly monochromatic, leveraging the depth of pure black (#000000) against the purity of white.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. We define boundaries through **surface-container nesting** or the transition between the void and "Liquid Glass" elements.

### Surface Hierarchy
We treat the UI as a series of physical layers of light.
*   **Background (#000000):** The infinite void. Everything emerges from here.
*   **Surface-Container-Lowest (#0E0E0E):** Subtle differentiation for large section blocks.
*   **Liquid Glass (Bespoke):** Reserved for floating cards and navigation. 
    *   **Fill:** White at 2% - 5% opacity.
    *   **Backdrop Blur:** 20px to 40px.
    *   **Blend Mode:** Use `luminosity` or `overlay` for child elements to interact with the background.

### The "Liquid Glass" Border
Where a container requires definition, use the **Signature Border**:
*   **Width:** 1.4px.
*   **Stroke:** A linear gradient (Top-Left to Bottom-Right) from `White (20% opacity)` to `White (0% opacity)`. This mimics a catch-light on the edge of a physical glass pane.

## 3. Typography: Editorial Authority

We pair the dramatic, high-contrast **Instrument Serif** with the functional precision of **Inter**.

*   **Display & Headlines (Instrument Serif):** Use these to set the tone. Do not be afraid of massive scale. Use the *Italic* variant for emphasis in headlines to create a rhythmic, poetic flow.
    *   *Display-LG (3.5rem):* Tight letter spacing (-0.02em).
*   **Body & Labels (Inter):** These are secondary actors. They must be clean, legible, and spaced generously.
    *   *Body-MD (0.875rem):* Increased line height (1.6) for maximum breathability.
*   **Hierarchy Note:** Brand identity is conveyed through "The Contrast Gap"—pairing very large Serif headlines with very small, tracked-out (0.1em) Sans-Serif labels.

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are replaced by **Ambient Luminosity**.

*   **The Layering Principle:** To lift a card, do not use a black shadow. Instead, use a `surface-container-high` background color or the Liquid Glass effect.
*   **Ambient Glow:** For "floating" interactive elements, use a white glow: 0px 20px 40px with 4% opacity. It should feel like light reflecting off a surface, not a shadow cast upon it.
*   **Ghost Borders:** For buttons or inputs, if a border is necessary, use `outline_variant` at 10% opacity. Never use 100% opaque lines.

## 5. Components

### Pill-Shaped Navigation
Floating at the top or bottom of the viewport.
*   **Style:** Liquid Glass container (20px blur).
*   **Shape:** `9999px` (Full) roundedness.
*   **Interaction:** Active states should be indicated by a subtle shift in opacity (e.g., from 5% to 12% white fill), never a solid color.

### Circular Buttons
*   **Primary:** A perfect circle containing a refined icon.
*   **Fill:** `Primary` (White).
*   **Icon:** `On-Primary` (Black).
*   **Size:** 64px x 64px for Hero actions; 48px x 48px for UI actions.

### Liquid-Glass Cards
*   **Border:** 1.4px white gradient.
*   **Content:** No dividers. Use `title-md` for headers and `body-sm` for descriptions, separated by 24px of vertical white space.
*   **Nesting:** Cards should appear to "float" over the background void.

### Input Fields
*   **Style:** Minimalist underline or Ghost Border.
*   **Typography:** `label-md` for floating labels that shrink when active.
*   **State:** On focus, the 1.4px border gradient increases in opacity from 20% to 50%.

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place text in the left third and an image in the right two-thirds to create a cinematic composition.
*   **Embrace the Void:** Leave large areas of `#000000` untouched to create a sense of scale.
*   **Use Italic Sparingly:** Use *Instrument Serif Italic* for exactly one or two words in a headline to create a "Signature" look.

### Don’t:
*   **Don't use 1px Solid Borders:** It breaks the "Liquid" illusion and looks like a standard bootstrap template.
*   **Don't use Pure Grey Shadows:** They muddy the pure black background. Use low-opacity white glows instead.
*   **Don't Over-Clutter:** If a component doesn't serve a direct purpose, remove it. Minimalism is the primary driver of this system.
*   **Don't use standard Dividers:** Use vertical spacing or a 10% opacity Liquid Glass "break" if separation is mandatory.
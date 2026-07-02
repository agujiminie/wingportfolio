# port-codex-upload

React 19 + Vite project. UI is built to match Figma designs and reference sites pixel-for-pixel.

## Figma Fidelity Policy (always on)

Goal: every UI I build or change should match its Figma reference as closely as possible, and I should verify this **automatically** — the user should not have to ask for a review each time.

### When this applies
Any time UI source changes (`*.tsx`, `*.jsx`, `*.css/scss/sass/less`, `*.vue`, `*.svelte`, `*.html`) and a Figma reference exists for that screen/component.

### The fidelity walkthrough (run before finishing a UI task)
1. **Render the result.** Use Claude Preview — `preview_start` if no server is running, then `preview_screenshot` at the relevant breakpoint(s).
2. **Pull the Figma reference.** `mcp__figma__get_screenshot` for the frame, and `mcp__figma__get_design_context` for exact specs (spacing, type, color, radius, tokens).
3. **Compare section by section** and report a **similarity walkthrough** covering: layout & structure, spacing/padding, typography (family, size, weight, line-height), color, border-radius & shadows, and interactive states (hover/focus/active/disabled).
4. **Deviation rule (important).** For **every** place the implementation differs from Figma, state the difference AND the reason. A deviation is only acceptable if it is justified by a specific rule from a skill or project convention — name it explicitly, e.g.:
   - "Used the design token `--space-4` instead of Figma's raw 15px because the `design-tokens` skill enforces the spacing scale."
   - "Added `prefers-reduced-motion` fallback per the `design-review` accessibility checklist."
   - A deviation with **no** such justification is a bug — fix it to match Figma.
5. **No Figma reference?** If changed UI has no Figma frame on record, say so and ask the user for the frame/URL before claiming fidelity.

### Reference skills
- `design-review` — structured visual checklist (hierarchy, consistency, responsive, a11y, typography). Use its checklist during the walkthrough.
- `interface-design` — craft-first product UI (layout hierarchy, tokens, states).
- `design-tokens` — establish/enforce the token system; cite it when deviating from raw Figma values.
- `gsap-*` — animation; `shadcn` — components.

### Enforcement (how "automatic" is guaranteed)
A **Stop hook** (`.claude/hooks/figma-fidelity-check.sh`) blocks finishing a turn when UI source files have uncommitted changes that haven't been reviewed against Figma yet. It is baselined, so it only fires for UI edited **after** it was installed (pre-existing uncommitted files are exempt).

Clear the gate after the walkthrough by either:
- committing the reviewed files, or
- running `touch .claude/.figma-reviewed`

To pause enforcement, remove the `Stop` hook from `.claude/settings.local.json`.

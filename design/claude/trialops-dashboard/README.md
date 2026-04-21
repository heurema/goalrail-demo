# TrialOps Claude Design handoff notes

## Source
- Original handoff URL: `https://api.anthropic.com/v1/design/h/65w8w1pDY75mrLGo_I3T_A?open_file=TrialOps+Dashboard.html`
- Served HTML fetched from the Claude Design preview iframe and saved here as `TrialOps Dashboard.html`.
- Project: `TrialOps Demo Redesign`

## What was available
The direct handoff URL did not return a downloadable archive from shell without the in-app context, so the implementation guidance was taken from the Claude Design handoff UI and the generated HTML itself.

## Implementation guidance extracted from Claude Design

### Visual direction
- Light, airy, simple, modern B2B dashboard
- Warm off-white surfaces
- Near-black ink
- A single quiet slate accent, no electric blue
- Hairline borders, generous whitespace, soft shadows only
- Calm premium product feel
- Clean dashboard, not flashy

### Readability refinement
- Reduce visual noise further
- Simplify the left sidebar
- Reduce density in the top toolbar/header
- Make metric cards calmer and quieter
- Give the main table more breathing room and more visible area
- Make the selected detail panel simpler and easier to scan
- Reduce decorative elements that compete with the data
- Keep the UI premium, but less busy

### Story constraints
- This is the baseline before-state
- Direct approval is still possible
- Do not add `manual_review`
- Keep the direct-approval weakness understandable, but understated

## Relevant implemented aspects to carry over
- Narrow light sidebar with minimal nav chrome
- Search-first top bar
- Quiet baseline-flow chip near the page title
- Low-noise metrics strip
- Table-first layout with more visible data area
- Simpler request detail panel
- Inline direct-approval notice in the status form
- Lighter audit panel styling

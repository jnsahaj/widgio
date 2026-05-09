# widgio — mockup module

For HTML widgets that present bounded UI: comparison grids, data records, metric cards, mockups of screens or components.
**Read `core` first.** This module assumes the universal rules from there.

## When to use

- **Compare options** — pricing tiers, framework choices, plan tiers, side-by-side feature grids.
- **Data record** — a single bounded UI object (contact card, receipt, order, notification).
- **Metric cards / stat callouts** — summary numbers, KPIs, dashboard headers.
- **Screen / component mockups** — chat threads, login forms, modals, mobile screens, settings pages.

For *interactive* explainers with controls (sliders, charts, live state), use the `interactive` module. For *data* visualizations with axes, use `chart`. For *diagrams*, use `diagram`.

## Layout width

The widget container is ~680px wide. Use `repeat(auto-fit, minmax(160px, 1fr))` for responsive columns — auto-fit picks column count by available width.

**Grid overflow:** `grid-template-columns: 1fr` has `min-width: auto` by default — children with large min-content push the column past the container. Use `minmax(0, 1fr)` to clamp.

**Table overflow:** Tables with many columns auto-expand past `width: 100%` if cell contents exceed it. In constrained layouts, use `table-layout: fixed` with explicit column widths, or reduce columns, or allow horizontal scroll on a wrapper.

## Aesthetic

Flat, clean surfaces. Minimal 0.5px borders. Generous whitespace. No gradients, no shadows (except functional focus rings on inputs). Everything should feel native to widgio's dark theme.

## Tokens

- **Borders:** always `0.5px solid var(--color-border-tertiary)` (or `-secondary` for emphasis).
- **Corner radius:** `var(--border-radius-md)` for most elements, `var(--border-radius-lg)` for cards.
- **Cards:** `background: var(--color-background-primary)`, 0.5px border, `radius-lg`, padding `1rem 1.25rem`.
- **Form elements** (input, select, textarea, button, range slider) are pre-styled in widgio's iframe shell — write bare tags. Inputs are 36px tall with hover/focus built in; range sliders have a 4px track + 18px thumb; buttons have outline style with hover/active. Add inline styles only to override (e.g., width).
- **Buttons:** transparent bg, 0.5px secondary border, hover bg-secondary, active scale(0.98). If a button triggers `sendPrompt`, append a `↗` arrow to the label.
- **Spacing:** rem for vertical rhythm (1rem, 1.5rem, 2rem), px for component-internal gaps (8px, 12px, 16px).
- **Box-shadows:** none, except functional focus rings (`box-shadow: 0 0 0 3px var(--color-background-info)` already on inputs).

## Layout patterns

- **Editorial** (explanatory content): no card wrapper, content flows naturally.
- **Card** (bounded objects like a contact record, receipt): single raised card wraps the whole thing.
- **Don't put tables here** — output them as markdown in your response text. Use HTML tables only as part of a card or comparison grid where layout matters.

### Mockup presentation

Contained mockups — mobile screens, chat threads, single cards, modals, small UI components — should sit on a background surface (`var(--color-background-secondary)` container with `border-radius: var(--border-radius-lg)` and padding, or a device frame) so they don't float naked on the widget canvas. Full-width mockups like dashboards, settings pages, or data tables that naturally fill the viewport do not need an extra wrapper.

**Avoid `position: fixed`** — the iframe sizes itself to your in-flow content height, so fixed-positioned elements (modals, overlays, tooltips) collapse it. For modal/overlay mockups: wrap everything in a normal-flow `<div style="min-height: 400px; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;">` and put the modal inside — a faux viewport that contributes layout height.

## Metric cards

For summary numbers (revenue, count, percentage) — surface card with muted 13px label above, 24px/500 number below. `background: var(--color-background-secondary)`, no border, `border-radius: var(--border-radius-md)`, padding `1rem`. Use in grids of 2–4 with `gap: 12px`.

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 0 0 1.5rem;">
  <div style="background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 1rem;">
    <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Revenue</div>
    <div style="font-size: 24px; font-weight: 500;">$48,200</div>
  </div>
  <div style="background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 1rem;">
    <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Customers</div>
    <div style="font-size: 24px; font-weight: 500;">312</div>
  </div>
</div>
```

## Compare options — decision making

*"Compare pricing and features of these products" / "Help me choose between React and Vue"*

Side-by-side card grid for options. Highlight differences with semantic colors. Each option in a card with badges for key differentiators. A leading Tabler icon (`<i class="ti ti-NAME">` at 20px, `aria-hidden`) anchors each option visually — pick the most apt name per option.

- Don't put comparison tables inside this widget — output them as markdown tables in your response text. The widget is for the visual card grid only.
- When one option is recommended or "most popular", accent its card with `border: 2px solid var(--color-border-info)` only (2px is deliberate — the only exception to the 0.5px rule). Keep the same background as the other cards. Add a small badge (e.g. "Most popular") inside the card header using `background: var(--color-background-info); color: var(--color-text-info); font-size: 12px; padding: 4px 12px; border-radius: var(--border-radius-md); display: inline-block;`.
- Add `sendPrompt()` buttons for drill-downs: `<button onclick="sendPrompt('Tell me more about the Pro plan')">Learn more ↗</button>`.

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
  <div style="background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 1.25rem;">
    <i class="ti ti-rocket" style="font-size: 20px; color: var(--color-text-secondary);" aria-hidden="true"></i>
    <h3 style="font-size: 16px; font-weight: 500; margin: 8px 0 4px;">Starter</h3>
    <p style="font-size: 24px; font-weight: 500; margin: 0 0 8px;">$9 <span style="font-size: 13px; color: var(--color-text-secondary); font-weight: 400;">/ mo</span></p>
    <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">Up to 1,000 requests / day</p>
  </div>
  <div style="background: var(--color-background-primary); border: 2px solid var(--color-border-info); border-radius: var(--border-radius-lg); padding: 1.25rem;">
    <span style="background: var(--color-background-info); color: var(--color-text-info); font-size: 12px; padding: 4px 10px; border-radius: var(--border-radius-md); display: inline-block; margin-bottom: 8px;">Most popular</span>
    <i class="ti ti-bolt" style="font-size: 20px; color: var(--color-text-info);" aria-hidden="true"></i>
    <h3 style="font-size: 16px; font-weight: 500; margin: 8px 0 4px;">Pro</h3>
    <p style="font-size: 24px; font-weight: 500; margin: 0 0 8px;">$29 <span style="font-size: 13px; color: var(--color-text-secondary); font-weight: 400;">/ mo</span></p>
    <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">Up to 50,000 requests / day</p>
  </div>
</div>
```

### Streaming a comparison grid

Comparison grids stream cleanly chunk-by-chunk:

1. **`grid container`** — opening `<div>` with grid styling.
2. **`option 1`** — first card.
3. **`option 2`** — second card. (Featured option in its own chunk — the accent border lands deliberately.)
4. *(...more cards...)*

Each card is a complete top-level element (a `<div>`), so chunk boundaries are clean.

## Data record — bounded UI object

*"Show me a Salesforce contact card" / "Create a receipt for this order"*

Wrap the entire thing in a single raised card. All content sans-serif. Use an avatar/initials circle for people.

```html
<div style="background: var(--color-background-primary); border-radius: var(--border-radius-lg); border: 0.5px solid var(--color-border-tertiary); padding: 1rem 1.25rem;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
    <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--color-background-info); display: flex; align-items: center; justify-content: center; font-weight: 500; font-size: 14px; color: var(--color-text-info);">MR</div>
    <div>
      <p style="font-weight: 500; font-size: 15px; margin: 0;">Maya Rodriguez</p>
      <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">VP of Engineering</p>
    </div>
  </div>
  <div style="border-top: 0.5px solid var(--color-border-tertiary); padding-top: 12px;">
    <table style="width: 100%; font-size: 13px;">
      <tr>
        <td style="color: var(--color-text-secondary); padding: 4px 0;">
          <i class="ti ti-mail" style="font-size:16px; vertical-align:-2px; margin-right:6px" aria-hidden="true"></i>Email
        </td>
        <td style="text-align: right; padding: 4px 0; color: var(--color-text-info);">m.rodriguez@acme.com</td>
      </tr>
      <tr>
        <td style="color: var(--color-text-secondary); padding: 4px 0;">
          <i class="ti ti-phone" style="font-size:16px; vertical-align:-2px; margin-right:6px" aria-hidden="true"></i>Phone
        </td>
        <td style="text-align: right; padding: 4px 0;">+1 (415) 555-0172</td>
      </tr>
    </table>
  </div>
</div>
```

## Badges, pills, status chips

For status indicators within cards. Use semantic backgrounds with matching text colors:

```html
<span style="background: var(--color-background-success); color: var(--color-text-success); font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px;">Active</span>
<span style="background: var(--color-background-warning); color: var(--color-text-warning); font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px;">Pending</span>
<span style="background: var(--color-background-danger); color: var(--color-text-danger); font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px;">Failed</span>
```

For categorical (non-semantic) badges, use the SVG color ramps' 100/200 stops as background and 100 stop as text — applied via inline `style="background: #3C3489; color: #CECBF6;"`.

## When nothing fits

Pick the closest pattern above and adapt:

- Default to **editorial** layout if the content is explanatory.
- Default to **card** layout if the content is a bounded object.
- All core design system rules still apply.
- Use `sendPrompt()` for any action that benefits from the agent thinking.

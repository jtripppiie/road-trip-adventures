# Road Trip Adventures AGENT Manifest

This document is the **constitution** for any contributor, human or artificial, working on Road Trip Adventures.  It captures the core mission, non‑negotiable principles, technical constraints and style guidelines.  Before making any change, read this file.  If a proposed modification violates any of the rules below, rethink it or ask for guidance.

## Mission

Road Trip Adventures exists to help people **notice the journey**.  It is not a distraction designed to maximise screen time.  Every feature should encourage passengers to look outside, laugh together, learn something new and connect with one another.  Drivers should never be encouraged to interact with the app while driving.

## Core Principles

1. **Passengers only.** Road Trip Adventures is for passengers.  Drivers drive.
2. **No accounts.** No sign‑ups, logins or authentication.
3. **No databases.** All state lives in the browser.  There is no backend.
4. **No ads.** Revenue models must not compromise the user experience.
5. **No tracking or analytics.** We do not collect personal data or usage metrics.
6. **No manipulative engagement mechanics.** Avoid infinite scrolls, streaks, FOMO notifications or anything that tries to make people use the app longer than they want to.
7. **Accessibility first.** The app should exceed WCAG 2.1 AA guidelines.  W3C’s four principles — perceivable, operable, understandable and robust【438321965630628†L303-L335】 — are the foundation for all UI decisions.
8. **Family friendly.** Content must be appropriate for all ages.  Avoid profanity, adult themes, hate speech, political persuasion or graphic violence.
9. **Privacy by design.** The site does not collect or transmit personal information, and it must not use GPS, browser geolocation or location sensors.  Region‑specific trivia is selected manually by the user.
10. **Fun beats complexity.** Simplicity, charm and delight are more important than feature bloat.

## Technical Constraints

- The application must be a **static website**.  Use only HTML, CSS and vanilla JavaScript.
- It must run without a build step.  Developers may use build tools internally, but the output must be consumable as plain files in a browser.
- Host on GitHub Pages or any other static host.
- Use no server‑side code, databases or third‑party analytics libraries.
- User preferences may be stored in `localStorage` and session state may be stored in `sessionStorage`.  Clear them on “Start Over.”
- All question data lives in a JSON structure in the client.  Do not fetch external data or call remote APIs.
- Support offline play via a service worker if feasible.  The first version may omit offline caching but must not break when offline after load.

## Accessibility Requirements

Road Trip Adventures should strive to exceed the success criteria defined in WCAG 2.1.  The guidelines are organised around four principles — content must be **perceivable, operable, understandable and robust**【438321965630628†L303-L335】.  Key requirements include:

- **Keyboard navigation:** All functionality must be available via keyboard alone.  Provide visible focus indicators.
- **Screen reader compatibility:** Use semantic HTML elements, ARIA labels and live regions to announce dynamic content.  Provide descriptive `<title>` and `<desc>` in SVGs.
- **Colour contrast:** Provide a high‑contrast mode and ensure default colours meet contrast ratios.
- **Flexible typography:** Support a large text mode.  Avoid fixed heights that could cause overflow when the text size increases.
- **Reduce motion:** Respect the user’s `prefers-reduced-motion` setting and provide a toggle to disable animations.
- **Time controls:** Time‑limited tasks must provide an option to disable or extend timers.

When modifying or extending the UI, test with screen readers (e.g. NVDA, VoiceOver), keyboard only, and high‑contrast modes to ensure compliance.

## Design Language

The visual style is inspired by vintage travel postcards, National Park passport books and Nintendo charm.  The palette uses warm creams, deep teals, sunset oranges and golden yellows.  Avoid flat, corporate iconography or overstimulating gradients.  Each UI element should feel friendly and approachable.

### Illustration Standards

All icons and logos must be high‑quality SVGs.  They should be:

* Highly detailed and cohesive.
* Playful, with personality.  Hidden easter eggs (like tiny animals or travel stickers) are encouraged.
* Provided with `<title>` and `<desc>` for accessibility.
* Designed to work on light and dark backgrounds (monochrome variants recommended).

## Experience Flow

The user journey should be simple and linear.  The core steps are:

1. **Loading Screen** — A friendly quote encourages users to stop doom scrolling and prepares them for the adventure.
2. **Choose Players** — Select age group.
3. **Choose Time** — Select ride duration.
4. **Choose Adventure Type** — Look Outside, Laugh Together, Learn Something, Competition, Local Explorer or Mystery Mix.
5. **Play Adventure** — Display one challenge at a time.  Provide a timer only when necessary.
6. **Summary** — Show results and a breakdown of discoveries, laughs, facts and wins.  Offer “Play Again” (same configuration) and “Start Over” (new configuration).

## Adventure Composition

The mix of activities should follow these target ratios:

- 40 % **Look Outside** — Encourages observation of the environment.
- 30 % **Laugh Together** — Prompts creative, silly conversations.
- 20 % **Learn Something** — Trivia and facts appropriate to the selected ages and, optionally, region.
- 10 % **Competition** — Lightly competitive challenges that pit players against each other in a fun, safe way.

“Local Explorer” content may replace some Learn and Look questions when the user opts into location.  “Mystery Mix” pulls randomly from all categories.

### Question Format

Questions are defined as objects with the following fields:

| Field | Description |
|------|-------------|
| `id` | A unique identifier. |
| `category` | `look`, `laugh`, `learn`, `compete` or `local`. |
| `ageGroups` | Array of age tags (`kids`, `teens`, `adults`, `mixed`) or `['*']` for all. |
| `regions` | Array of region codes or `['*']` for global.  Only used for `local` questions. |
| `requiresTimer` | If `true`, display a 15 second countdown. |
| `text` | The question or prompt shown to the user.  Keep it short and conversational. |
| `points` | Reserved for future scoring. |

Adding a new category requires updating the selection UI, scoring summary and composition ratios.

### Regional Support

Local trivia must be selected manually by the user. Do not use GPS, browser geolocation, IP lookup, location sensors or third-party geolocation services.

To support additional regions, add manual region choices in the UI and matching region codes in the local trivia data.

## Scoring Philosophy

Road Trip Adventures is not a competitive league.  Instead of leaderboards or global rankings, we use **passport stamps**: players earn a stamp for each completed challenge.  At the end of an adventure, a simple summary tells them how many discoveries, laughs, facts and wins they achieved.  This encourages celebration without comparison.

## Loading Screen Guidelines

Loading screens are a rare opportunity to set the tone.  Keep them short and purposeful.  They should remind users that the app exists to help them connect, not to distract.  Examples:

* “The world outside your window is the original screen.”
* “Pause the doom scrolling.  Adventure is loading…”
* “Look up.  Someone beside you might tell the best joke of the trip.”

The messaging should be friendly, never condescending.  It’s a gentle nudge, not a scolding.

## Delight and Easter Eggs

Every release should include at least one **unexpected moment of joy**.  This could be a hidden animal in an illustration, a rare bonus quest, seasonal themes (e.g. Halloween or Holiday packs) or a playful loading message.  These small surprises create memorable experiences.

## Success Metrics

Traditional analytics are forbidden.  Success is measured qualitatively:

* **People laugh.**
* **Passengers look out the window.**
* **Someone learns something new.**
* **Someone notices a detail they would have missed.**
* **A parent saves the QR code for future trips.**

If we hear “Can we do another one?” or “This made our trip better,” we succeeded.

## Family‑Friendly Promise

All content should be safe for children and adults to enjoy together.  Avoid:

* Profanity, sexual content or adult humour.
* Graphic violence or horror.
* Hate speech or discriminatory stereotypes.
* Political persuasion or polarising topics.
* Dangerous dares or challenges that could put passengers or drivers at risk.

If a parent wouldn’t feel comfortable explaining the prompt from the front seat, don’t include it.

## Privacy by Design

**We do not collect personal information.** Scores, preferences and adventure data are stored locally in the browser.  Local trivia is selected manually; the app does not use GPS, browser geolocation, IP lookup or location sensors.  There are no cookies (beyond localStorage), no analytics and no third‑party scripts.  The app should work offline after the first load.

## The Road Trip Adventures Test

Before adding any feature or question, ask:

1. Does it bring people together?
2. Does it encourage noticing the world around them?
3. Is it safe for passengers?  Does it avoid distracting drivers?
4. Is it family friendly?
5. Does it respect the user’s privacy?
6. Would we proudly let our own family use it?

If the answer isn’t a confident **yes**, rethink or refine the idea.

# Hide & Seek Asset Pipeline

The current Hide & Seek mode draws its rooms and objects with canvas code. If future versions add bitmap sprites, backgrounds, music or effects, keep assets organized by gameplay purpose and level theme.

## Suggested Structure

```text
assets/
  hide-seek/
    backgrounds/
      roadside-lodge/
      alaska-train/
      campground/
      rest-stop/
    sprites/
      players/
      costumes/
      npcs/
    objects/
      furniture/
      outdoor/
      obstacles/
      interactive/
    effects/
      reveal/
      dust/
      countdown/
    audio/
      ambience/
      footsteps/
      ui/
      music/
    ui/
      buttons/
      timers/
      scoreboards/
```

## Naming

Use descriptive lowercase filenames:

```text
alaska_train_object_luggage_stack_01.png
campground_tree_pine_large_01.png
rest_stop_ui_search_button_01.png
roadside_lodge_player_walk_down_01.png
```

Avoid vague names like `tree-final-v2.png`.

## Sprite Standards

Player sprites should share:

- transparent PNG backgrounds
- consistent pixel density
- the same anchor point
- the same collision-box standard
- matching animation states: idle, walk up/down/left/right, hide, search, found, celebrate

## Object Data

Objects should stay data-driven. A future bitmap object should still map to the same gameplay fields:

```js
{
  id: 'campground-tree-pine-large',
  label: 'pine tree',
  kind: 'tree',
  asset: 'campground_tree_pine_large_01',
  x: 590,
  y: 110,
  width: 110,
  height: 220,
  difficulty: 5,
  solid: true
}
```

The rule of thumb: adding a new level should mostly mean adding data and assets, not rewriting the movement, scoring or search systems.
Here's the prompt I would give to a senior-level AI coding agent (Claude Code, OpenAI Codex, Cursor, Gemini CLI, etc.). It is designed to **reorganize the project without changing its philosophy or breaking functionality.**

---

```text
You are a senior staff engineer and product designer conducting a restructuring of an existing JavaScript application.

Your objective is NOT to add features.

Your objective is to simplify the experience, improve maintainability, and preserve the original mission of the product.

PROJECT CONTEXT

The application is called "Road Trip Adventures."

It is a static web application built entirely with:

- HTML
- CSS
- Vanilla JavaScript

There is:

- no backend
- no database
- no authentication
- no analytics
- no build process

It runs directly from static files and is intended for GitHub Pages.

The app philosophy is:

- Passengers play.
- Drivers drive.
- Encourage people to notice the journey.
- Encourage conversation.
- Encourage laughter.
- Respect privacy.
- Avoid screen addiction.
- Family friendly.
- Accessibility first.

DO NOT VIOLATE THESE PRINCIPLES.

==================================================
PRIMARY OBJECTIVE
==================================================

Reorganize the application to reduce cognitive overload while preserving all functionality.

Do NOT remove games.

Do NOT change scoring.

Do NOT change data structures unless absolutely necessary.

Do NOT add dependencies.

The goal is to make the app easier for first-time users.

==================================================
PHASE 1: REORGANIZE THE USER EXPERIENCE
==================================================

Redesign the menu hierarchy.

Current menus expose too many choices simultaneously.

Create the following structure:

Road Trip Adventures

1. Start Road Trip
2. Trivia & Learning
3. Scavenger Hunt
4. More Games
5. Roadside Arcade

==================================================
START ROAD TRIP
==================================================

This should be the primary call-to-action.

It should require the fewest taps possible.

Flow:

Passenger confirmation
→ Player initials
→ Quick Start
→ Begin

The app automatically mixes activities.

Use existing game composition logic.

No additional configuration.

==================================================
TRIVIA & LEARNING
==================================================

Move these modes into this section:

- Trivia Run
- Learn Something
- Pi Digits
- Trip Calculator

Group trivia categories into larger buckets:

Geography
Science
Entertainment
Sports
Food
Mixed

Preserve all existing questions.

Do NOT delete categories.

Only improve organization.

==================================================
SCAVENGER HUNT
==================================================

Leave this largely unchanged.

Treat it as a flagship experience.

Preserve:

- themes
- side games
- scoring
- player claiming
- route indicators

Make minimal modifications.

==================================================
MORE GAMES
==================================================

Move these into More Games:

- Joke Vote
- Emoji Face-Off
- Quick Challenges

Keep functionality unchanged.

Reduce their prominence.

==================================================
ROADSIDE ARCADE
==================================================

Create a dedicated bonus section.

Move these modes into it:

- Road Pong
- Banana Towers
- Hide & Seek Adventure

The Arcade should clearly communicate:

"Bonus passenger games."

Do NOT change gameplay.

Only reorganize navigation.

==================================================
PHASE 2: ARCHITECTURE IMPROVEMENTS
==================================================

Preserve behavior.

Improve maintainability.

Refactor script.js into logical modules.

Suggested structure:

js/
    core/
        app.js
        navigation.js
        scoring.js
        storage.js
        accessibility.js

    modes/
        adventure.js
        scavenger.js
        trivia.js
        learn.js
        jokes.js
        emoji.js
        pi.js
        calculator.js
        pong.js
        gorillas.js
        hide-seek.js
        secret.js

Keep everything vanilla JavaScript.

No bundlers.

No npm dependencies.

No transpilation.

The application must still work by opening index.html.

==================================================
PHASE 3: RESILIENCE
==================================================

Add graceful recovery mechanisms.

Implement:

window.onerror

window.onunhandledrejection

If an error occurs:

Display a friendly message:

"Something went wrong. Return Home?"

Provide a Home button.

The application must never strand the user.

==================================================
PHASE 4: SESSION RECOVERY
==================================================

Use sessionStorage.

If the page refreshes unexpectedly:

Offer:

"Resume your adventure?"

Restore:

- current mode
- players
- scores
- current challenge
- active scavenger targets

Do NOT persist indefinitely.

Clear everything on Start Over.

==================================================
PHASE 5: ACCESSIBILITY AUDIT
==================================================

Preserve all existing accessibility features.

Verify:

- keyboard navigation
- skip links
- focus states
- ARIA labels
- live regions
- reduced motion
- large text
- high contrast

Add missing improvements:

Modal focus trapping.

Escape closes modal.

Return focus to triggering element.

Canvas games should expose text status updates for screen readers.

==================================================
PHASE 6: OFFLINE SUPPORT
==================================================

Implement a service worker.

Cache:

- index.html
- style.css
- script.js
- all JS data files
- all game assets

The app should function offline after first load.

Do not introduce remote dependencies.

==================================================
CONSTRAINTS
==================================================

DO NOT:

- add analytics
- add accounts
- add ads
- add databases
- add APIs
- add location tracking
- add geolocation
- add push notifications
- add streak mechanics
- add infinite engagement loops

DO:

- preserve charm
- preserve delight
- preserve family friendliness
- preserve privacy
- simplify onboarding
- improve maintainability

==================================================
OUTPUT REQUIREMENTS
==================================================

Provide:

1. A restructuring plan.
2. A file-by-file change list.
3. Updated navigation flow diagrams.
4. Proposed code architecture.
5. Any migration concerns.
6. Exact code modifications.
7. Diffs where appropriate.
8. An implementation order that minimizes regressions.
9. A QA checklist covering desktop, mobile, accessibility, and offline scenarios.

Before making changes, identify anything that could break existing functionality.

Prioritize preserving behavior over elegance.

The final result should feel like the same beloved road trip app—just simpler, more focused, and easier to maintain.
```

I think this prompt would give you a very high-quality refactor without losing the personality of the project. It tells the AI exactly what to preserve, what to reorganize, and what not to touch.

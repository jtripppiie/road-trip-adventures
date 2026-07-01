# Road Trip Adventures

**Tiny adventures for passengers.**

Road Trip Adventures is a lightweight, static web application designed to make road trips more fun for passengers. Scan a QR code, add player initials, pick a mode, and play quick games that encourage people to look outside, laugh together, learn something new, explore local trivia, and compete gently.

This project was built with **no backend**, **no user accounts** and **no data collection**.  It is intended to run on [GitHub Pages](https://www.wikiwand.com/en/GitHub_Pages) or any static web host.  All game state lives only in the browser’s memory.  When you close the tab, the adventure disappears and nothing is saved on a server.

## Features

- **Passenger only:** The app explicitly tells drivers not to play while driving.
- **Players:** Add 2 to 8 player initials and optionally choose a car judge for games that need a human call.
- **Organized modes:** Pick from **Look Outside**, **Trivia & Brain**, **Party Games**, and **Bonus** sections.
- **Adventure types:** Play categories like **Look Outside**, **Learn Something**, **Quick Challenges**, **Local Explorer**, **Trip Calculator**, **Road Pong**, **Banana Towers**, or **Hide & Seek Adventure**.
- **Scavenger Hunt:** Play an any-route hunt where 2 to 8 players tap real-world sightings to claim points.
- **Trivia Run:** Play broad road-trip trivia across state capitals, license plates, national parks, roadside landmarks, road food, science, animals, sports, music, TV, and decade trivia. Runtime cleanup removes duplicate imported questions, adds difficulty labels, and keeps answer choices exact.
- **Joke Vote:** Let each player tell clean jokes and award Dad Joke or Mom Joke honors.
- **Emoji Face-Off:** Copy emoji expressions with an optional local camera snap, then vote for the closest match. Photos are not uploaded or saved by the app.
- **Pi Digits:** See who can recite the most digits of pi and track scores for every player.
- **Hide & Seek Adventure:** Play a local pass-and-play canvas game on a responsive 1200x675 board with a 1-minute hiding scramble, limited inspection-based searches, best-of-5 default match, sprint stamina, clearer exact-spot feedback, stealth bonuses, real hiding spot states, listen clues, particles, lighting, cover quality, obstacles, room transitions and role swaps.
- **20 Questions:** Play app-guesses or computer-hides rounds with a visible 20-question count, role prompts, optional category ideas, yes/no/sometimes answers, and reveal/play-again flow.
- **Banana Towers and Road Pong:** Passenger-safe arcade games with local-only scoring, touch controls, clearer round feedback, and lightweight difficulty tuning.
- **Dynamic adventures:** The app builds an adventure from a pool of questions and prompts.  Timed challenges show a 15 second countdown.
- **Progress bar:** See how far along your adventure you are.
- **Summary:** At the end, get a breakdown of how many discoveries, laughs, facts and wins you achieved.
- **Accessibility options:** Toggle large text, high contrast and reduced motion.  All interactive elements have clear focus styles, ARIA labels and live region announcements.
- **Privacy friendly:** No tracking, analytics, data collection, or location sensors. Local trivia is selected manually by region.

## Project Layout

The app is intentionally vanilla JavaScript and static-host friendly. The main file still owns the overall app state machine, while large content and game-specific art/data are moving into smaller files:

```text
index.html
style.css
script.js
js/
  data/
    questions.js          # learn prompts and extra adventure prompts
    scavenger.js          # scavenger, lightning, alphabet, and mini-bet data
    trivia.js             # curated offline trivia packs
    community-trivia.js   # larger imported/community trivia pack
    trivia-cleanup.js     # runtime duplicate cleanup, difficulty tags, small curated additions
  games/
    hide-seek-art.js      # canvas renderers for Hide & Seek objects and rooms
    hide-seek-data.js     # Hide & Seek maps, rooms, exits, objects, obstacles
    pong-art.js           # Road Pong canvas renderer/state helpers
    pong-data.js          # Road Pong settings and difficulty data
scripts/
  audit-all.js            # runs every local content/game audit
  audit-content.js        # prompt/scavenger required-field checks
  audit-trivia.js         # trivia required-field and answer-choice checks
  audit-game-quality.js   # broader mobile, category, and map quality checks
```

## Running Locally

1. Clone or download this repository.
2. Open `index.html` in your browser.  Because the site is fully static there is no build step.
3. To serve the site locally and mimic a production environment, you can run a simple HTTP server:
   ```bash
   cd roadside-quest
   python3 -m http.server 8000
   # then visit http://localhost:8000 in your browser
   ```

## Deploying to GitHub Pages

1. Create a new repository on GitHub (for example `yourname/roadside-quest`).
2. Copy all files in the `roadside-quest` directory into your repository.
3. Commit and push.
4. In the repository settings, enable GitHub Pages and choose the branch (typically `main`) and folder (root) to publish.  After a few moments, your site will be live at `https://yourname.github.io/roadside-quest/`.
5. Generate a QR code pointing at your GitHub Pages URL and place it somewhere fun (like on the back of your truck!).

## Customisation

### Adding more adventure prompts

Prefer adding new adventure and learning prompts in `js/data/questions.js`. The small `questions` array in `script.js` is now only the seed deck. Each prompt has:

| Field | Description |
|------|-------------|
| `id` | A unique identifier. |
| `category` | One of `look`, `laugh`, `learn`, `compete` or `local`. |
| `ageGroups` | Keep `['*']` unless you are intentionally preserving older compatibility tags. |
| `regions` | Array of manual region codes (e.g. `CA`, `AZ`, `NV`, `UT`, `CO`, `NM`, `TX`, `AR`) or `['*']` for global.  Used by the **Local Explorer** category. |
| `requiresTimer` | If `true`, a 15 second countdown is shown. |
| `text` | The prompt/question displayed to the user. |
| `points` | Reserved for scoring (not used in this version). |

To support additional regions, add manual region buttons in `index.html` and matching region codes in the local trivia data. Do not add browser geolocation or location sensor logic.

### Adding trivia and scavenger content

Add curated trivia to `js/data/trivia.js` or larger/community packs to `js/data/community-trivia.js`. Every trivia item should include `id`, `category`, `question`, `answer`, and `choices`, and the exact `answer` string must appear in `choices`.

Add scavenger content to `js/data/scavenger.js`. Keep labels short enough for mobile cards, and make every target verifiable by the group. Avoid prompts that ask players to silently count something no one else can confirm.

Run the audits before pushing content:

```bash
node scripts/audit-all.js
```

### Adding Hide & Seek maps

Hide & Seek Adventure maps live in `js/games/hide-seek-data.js`. Each map defines a start room, palette, room exits, cover objects and optional obstacles. Cover objects are real hiding spots with round states such as empty, suspicious, searched and found. The hider enters one valid spot when they tap **Hide Here** or the 1-minute hide timer expires. The game now renders on a larger `1200x675` canvas, but map data is still authored in the original `800x450` coordinate space and scaled automatically at runtime.

```js
const hideSeekMaps = {
  'my-map': {
    id: 'my-map',
    name: 'My Map',
    startRoom: 'room_one',
    palette: { wall: '#28405c', floor: '#d8a85d', trim: '#09233f', accent: '#f58220' },
    rooms: {
      room_one: {
        id: 'room_one',
        name: 'Room One',
        exits: [
          { label: 'Room Two', targetRoom: 'room_two', x: 748, y: 180, width: 28, height: 92, spawnX: 60, spawnY: 232 },
        ],
        spots: [
          { id: 'room-one-closet', label: 'closet', kind: 'closet', x: 610, y: 95, width: 100, height: 175, difficulty: 4 },
        ],
        obstacles: [
          { id: 'slow-rug', type: 'slow', x: 250, y: 328, width: 300, height: 52, speedMultiplier: 0.65 },
        ],
      },
    },
  },
};
```

Every cover object needs a unique `id`, a short `label`, a `kind`, position, size and `difficulty` from 1 to 5. Supported visual kinds include `bed`, `closet`, `curtain`, `box`, `luggage`, `tree`, `bush`, `car`, `fountain`, `bench`, `desk`, `locker` and `shelf`. Objects are solid by default so players must walk around them; set `solid: false` for decorative-only objects. Add a matching `<option>` in `index.html` so players can select the new map.

Future bitmap assets should follow the folder and naming guidelines in [docs/asset-pipeline.md](docs/asset-pipeline.md).

### Changing the look and feel

The design is defined in `style.css`.  Colour variables are declared at the top of the file and can be modified to change the palette.  The layout is responsive and uses CSS grid for option cards.  If you wish to add your own illustrations or icons, place them in an `assets` directory and reference them in the HTML or CSS.  For decorative images, please ensure they include `alt` text or are marked with `aria-hidden="true"` for screen reader users.

### Accessibility considerations

This project aims to exceed WCAG 2.1 AA guidelines.  The guidelines are organised around four principles — content should be **perceivable, operable, understandable and robust**【438321965630628†L303-L335】.  Under these principles there are testable success criteria to support people with different disabilities.  For example, providing text alternatives for non‑text content, ensuring sufficient colour contrast, making all functionality operable via a keyboard and providing enough time to read and use content.  A high‑contrast mode and large text option are built in, and all controls are accessible via keyboard.

If you modify the UI, refer to the official [Web Content Accessibility Guidelines 2.1](https://www.w3.org/TR/WCAG21/) and the “Four Principles of Accessibility”【438321965630628†L303-L335】 to ensure that new elements remain accessible.  Consider testing with screen readers and high‑contrast browser modes.

### Privacy and safety

Road Trip Adventures does not collect or store any personal information. Scores, preferences and temporary game state are stored in your browser’s localStorage or sessionStorage. Local trivia is based only on the region a player chooses manually. The app does not use GPS, browser geolocation, or location sensors.

All content should remain family friendly: avoid profanity, sexual or violent themes, hate speech or political persuasion.  Activities should be safe for passengers and should never encourage drivers to look at a screen or perform a dangerous action.  Parents should feel comfortable with any prompt being read aloud in the car.  See `AGENT.md` for more details on content guidelines.

## License

This project is provided as‑is under the MIT License.  See [LICENSE](../LICENSE) for details.

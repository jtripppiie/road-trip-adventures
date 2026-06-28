/*
 * Road Trip Adventures client script
 *
 * This script drives the simple state machine for the Road Trip Adventures web app.
 * No external dependencies are required, and all state is stored in memory
 * or, in the case of user preferences, in localStorage.  The code is
 * intentionally vanilla JS to remain lightweight and easy to audit.  See
 * README.md for instructions on extending the data set and behaviour.
 */

(() => {
  // Visible build version. Bump this (and CACHE_VERSION in sw.js) on every
  // deploy so the on-screen badge confirms which build is actually live.
  const APP_VERSION = 'v25 · 2026-06-28';
  const versionBadge = document.getElementById('app-version');
  if (versionBadge) {
    versionBadge.textContent = APP_VERSION;
  }

  // Utility functions
  /**
   * Shuffle an array in place using Fisher–Yates.  Returns the same array.
   * @param {Array} array
   */
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Retrieve a preference from localStorage, returning the default if not set.
   * @param {string} key
   * @param {boolean} defaultValue
   */
  function getPreference(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;
      return stored === 'true';
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Save a boolean preference to localStorage.
   * @param {string} key
   * @param {boolean} value
   */
  function setPreference(key, value) {
    try {
      localStorage.setItem(key, value ? 'true' : 'false');
    } catch (error) {
      // Preferences are optional; keep the current session usable if storage is blocked.
    }
  }

  function getStoredJson(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function setStoredJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // localStorage can fail in private browsing; the game still works in memory.
    }
  }

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 72);
  }

  // Seed prompt set. Most new prompts should live in js/data/questions.js so
  // this app shell stays easier to reason about. Each entry has:
  // - id: unique identifier
  // - category: look | laugh | learn | compete | local
  // - ageGroups: array of strings (kids, teens, adults, mixed) or
  //   ['*'] to match all
  // - regions: array of region codes (e.g. 'CA', 'AZ') or ['*'] for all
  // - requiresTimer: boolean indicating whether to display a 15 second timer
  // - text: challenge question or prompt
  // - points: not used in this version but could be used for scoring
  const questions = [
    {
      id: 'look-palm-tree',
      category: 'look',
      ageGroups: ['*'],
      regions: ['CA'],
      requiresTimer: false,
      text: 'Palm Tree Press Conference: Spot a palm tree, then explain what important roadside announcement it is about to make.',
      tags: ['observation', 'story', 'quick'],
      quality: 'strong',
      points: 1,
    },
    {
      id: 'look-alaska-evergreen',
      category: 'look',
      ageGroups: ['*'],
      regions: ['AK'],
      requiresTimer: false,
      text: 'Alaska Survival Briefing: Spot a snowy peak, evergreen forest, or glacier, then give one real survival tip and one ridiculous fake tip.',
      tags: ['observation', 'creative', 'local'],
      quality: 'strong',
      points: 1,
    },
    {
      id: 'look-license-plate',
      category: 'look',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Out-of-State Mission: Find a license plate from another state. Invent the driver’s secret mission in one sentence.',
      tags: ['observation', 'story', 'vote'],
      quality: 'strong',
      points: 1,
    },
    {
      id: 'look-cloud-creature',
      category: 'look',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Find a cloud, hill, tree, or shadow that looks like something else. Everyone guesses what it is.',
      points: 1,
    },
    {
      id: 'look-color-hunt',
      category: 'look',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Color Evidence: Spot red, yellow, green, blue, and white outside. The car votes which color object is most suspicious.',
      tags: ['observation', 'vote', 'quick'],
      quality: 'okay',
      points: 1,
    },
    {
      id: 'look-tiny-detail',
      category: 'look',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Window detective: one passenger picks a tiny visible detail outside. Everyone else asks yes-or-no questions until they find it.',
      points: 1,
    },
    {
      id: 'look-sign-story',
      category: 'look',
      ageGroups: ['kids', 'teens', 'adults', 'mixed'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Pick the next interesting sign you see. Make up the backstory behind it.',
      points: 1,
    },
    {
      id: 'laugh-superpower',
      category: 'laugh',
      ageGroups: ['mixed', 'kids', 'teens', 'adults'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Invent a superhero whose power is useless.  Vote for the funniest.',
      points: 1,
    },
    {
      id: 'laugh-pirate',
      category: 'laugh',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Everyone must speak like a pirate for two minutes.',
      points: 1,
    },
    {
      id: 'laugh-roadside-commercial',
      category: 'laugh',
      ageGroups: ['kids', 'teens', 'adults', 'mixed'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Make a dramatic 10-second commercial for the next ordinary object you see.',
      points: 1,
    },
    {
      id: 'laugh-silly-weather',
      category: 'laugh',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Give a weather report for the inside of the car using your most serious news voice.',
      points: 1,
    },
    {
      id: 'laugh-wrong-name',
      category: 'laugh',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Rename three normal roadside things as if nobody had ever seen them before.',
      points: 1,
    },
    {
      id: 'laugh-quiet-giggle',
      category: 'laugh',
      ageGroups: ['kids', 'mixed'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Silent giggle challenge: try to make someone smile without making a sound.',
      points: 1,
    },
    {
      id: 'learn-grand-canyon',
      category: 'learn',
      learnTopic: 'states',
      ageGroups: ['*'],
      regions: ['AZ'],
      requiresTimer: false,
      text: 'Which giant natural wonder stretches 277 miles? (Grand Canyon)',
      points: 1,
    },
    {
      id: 'learn-planets',
      category: 'learn',
      learnTopic: 'solar',
      ageGroups: ['kids'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Which planet is known as the Red Planet? (Mars)',
      points: 1,
    },
    {
      id: 'learn-mile-marker',
      category: 'learn',
      learnTopic: 'cars',
      ageGroups: ['kids', 'teens', 'adults', 'mixed'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Mile markers usually show distance from a state border or route start. Can you spot one?',
      points: 1,
    },
    {
      id: 'learn-clouds',
      category: 'learn',
      learnTopic: 'science',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Cloud trivia: fluffy fair-weather clouds are called cumulus clouds.',
      points: 1,
    },
    {
      id: 'learn-road-reflectors',
      category: 'learn',
      learnTopic: 'cars',
      ageGroups: ['kids', 'teens', 'adults', 'mixed'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Road reflectors are called raised pavement markers. Look for how they guide lanes at night.',
      points: 1,
    },
    {
      id: 'learn-birds',
      category: 'learn',
      learnTopic: 'animals',
      ageGroups: ['kids', 'mixed'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Birds often perch on signs and wires because they make great lookout spots. Can you find one?',
      points: 1,
    },
    {
      id: 'compete-animals',
      category: 'compete',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Animal Casting Call: Name five animals, then pick which one should narrate this road trip and why.',
      tags: ['creative', 'quick'],
      quality: 'okay',
      points: 1,
    },
    {
      id: 'compete-alphabet',
      category: 'compete',
      ageGroups: ['kids', 'teens', 'adults', 'mixed'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Alphabet game: find something outside starting with A, then B, then C…',
      points: 1,
    },
    {
      id: 'compete-first-to-five',
      category: 'compete',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Dream Trip Bag Check: Name five things you would pack, then defend the weirdest item like it is absolutely essential.',
      tags: ['creative', 'conversation'],
      quality: 'strong',
      points: 1,
    },
    {
      id: 'compete-rhyme-chain',
      category: 'compete',
      ageGroups: ['kids', 'teens', 'adults', 'mixed'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Rhyme chain: start with "road" and keep going until someone gets stuck.',
      points: 1,
    },
    {
      id: 'compete-countdown',
      category: 'compete',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Count how many blue things you can spot before the timer ends.',
      points: 1,
    },
    {
      id: 'local-california-prison',
      category: 'local',
      ageGroups: ['*'],
      regions: ['CA'],
      requiresTimer: false,
      text: 'Which famous California prison sits on an island in San Francisco Bay? (Alcatraz)',
      points: 1,
    },
    {
      id: 'local-nevada-area51',
      category: 'local',
      ageGroups: ['*'],
      regions: ['NV'],
      requiresTimer: false,
      text: 'Nevada is home to Area ____. (51)',
      points: 1,
    },
    {
      id: 'local-arizona-cactus',
      category: 'local',
      ageGroups: ['*'],
      regions: ['AZ'],
      requiresTimer: false,
      text: 'Arizona is famous for the saguaro cactus, which can live for more than 150 years.',
      points: 1,
    },
    {
      id: 'local-california-redwoods',
      category: 'local',
      ageGroups: ['*'],
      regions: ['CA'],
      requiresTimer: false,
      text: 'California has coast redwoods, some of the tallest trees on Earth.',
      points: 1,
    },
    {
      id: 'local-nevada-silver',
      category: 'local',
      ageGroups: ['kids', 'teens', 'adults', 'mixed'],
      regions: ['NV'],
      requiresTimer: false,
      text: 'Nevada is nicknamed the Silver State because of its mining history.',
      points: 1,
    },
    {
      id: 'local-utah-mighty-five',
      category: 'local',
      ageGroups: ['*'],
      regions: ['UT'],
      requiresTimer: false,
      text: 'Utah has five famous national parks sometimes called the Mighty 5.',
      points: 1,
    },
    {
      id: 'local-utah-red-rock',
      category: 'local',
      ageGroups: ['*'],
      regions: ['UT'],
      requiresTimer: false,
      text: 'Utah explorer challenge: spot red rock, a canyon sign, or a landscape that looks like another planet.',
      points: 1,
    },
    {
      id: 'local-colorado-mile-high',
      category: 'local',
      ageGroups: ['*'],
      regions: ['CO'],
      requiresTimer: false,
      text: 'Denver is nicknamed the Mile High City because its elevation is about one mile above sea level.',
      points: 1,
    },
    {
      id: 'local-colorado-mountains',
      category: 'local',
      ageGroups: ['*'],
      regions: ['CO'],
      requiresTimer: false,
      text: 'Colorado explorer challenge: spot a mountain peak, ski-town clue, river, or outdoor adventure sign.',
      points: 1,
    },
    {
      id: 'local-newmexico-white-sands',
      category: 'local',
      ageGroups: ['*'],
      regions: ['NM'],
      requiresTimer: false,
      text: 'New Mexico is home to White Sands, famous for bright white gypsum dunes.',
      points: 1,
    },
    {
      id: 'local-newmexico-chile',
      category: 'local',
      ageGroups: ['*'],
      regions: ['NM'],
      requiresTimer: false,
      text: 'New Mexico explorer challenge: find a chile pepper, adobe-style building, art sign, or desert mountain view.',
      points: 1,
    },
    {
      id: 'local-texas-lone-star',
      category: 'local',
      ageGroups: ['*'],
      regions: ['TX'],
      requiresTimer: false,
      text: 'Texas is nicknamed the Lone Star State.',
      points: 1,
    },
    {
      id: 'local-texas-roadside',
      category: 'local',
      ageGroups: ['*'],
      regions: ['TX'],
      requiresTimer: false,
      text: 'Texas explorer challenge: spot a star, barbecue sign, cowboy hat, longhorn, or giant highway flag.',
      points: 1,
    },
    {
      id: 'local-arkansas-natural-state',
      category: 'local',
      ageGroups: ['*'],
      regions: ['AR'],
      requiresTimer: false,
      text: 'Arkansas is nicknamed The Natural State.',
      points: 1,
    },
    {
      id: 'local-arkansas-diamonds',
      category: 'local',
      ageGroups: ['*'],
      regions: ['AR'],
      requiresTimer: false,
      text: 'Arkansas is home to Crater of Diamonds State Park, where visitors can search for real diamonds.',
      points: 1,
    },
    {
      id: 'local-alaska-last-frontier',
      category: 'local',
      ageGroups: ['*'],
      regions: ['AK'],
      requiresTimer: false,
      text: 'Alaska is nicknamed The Last Frontier and is the largest state in the U.S. by area.',
      points: 1,
    },
    {
      id: 'local-alaska-denali',
      category: 'local',
      ageGroups: ['*'],
      regions: ['AK'],
      requiresTimer: false,
      text: 'Alaska explorer challenge: spot a snowy peak, glacier, evergreen forest, river, or wildlife-crossing sign.',
      points: 1,
    },
    {
      id: 'local-anywhere-town-name',
      category: 'local',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Fake Local Legend: Find a town, exit, or street name. Invent the totally unofficial legend for how it got that name.',
      tags: ['observation', 'story', 'local'],
      quality: 'strong',
      points: 1,
    },
    {
      id: 'local-anywhere-landmark',
      category: 'local',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Local Explorer: spot something that seems unique to this area and give it a tour-guide introduction.',
      points: 1,
    },
  ];

  function normalizeAdventurePrompt(prompt, index) {
    const category = prompt.category || 'look';
    const text = prompt.text || 'Look outside and make up a quick road-trip challenge.';
    return {
      id: prompt.id || `external-${category}-${slugify(text || index)}`,
      category,
      ageGroups: Array.isArray(prompt.ageGroups) && prompt.ageGroups.length ? prompt.ageGroups : ['*'],
      regions: Array.isArray(prompt.regions) && prompt.regions.length ? prompt.regions : ['*'],
      learnTopic: prompt.learnTopic || (category === 'learn' ? 'facts' : 'mixed'),
      requiresTimer: Boolean(prompt.requiresTimer),
      text,
      points: Number.isFinite(prompt.points) ? prompt.points : 1,
      quality: prompt.quality || 'okay',
      tags: Array.isArray(prompt.tags) ? prompt.tags.slice() : [],
    };
  }

  const adventurePromptDenylist = new Set([
    'look-cloud-creature',
    'learn-birds',
    'compete-countdown',
  ]);

  const adventurePromptDatabase = questions
    .concat(window.RTA_ADVENTURE_PROMPTS || [])
    .map(normalizeAdventurePrompt)
    .filter(prompt => !adventurePromptDenylist.has(prompt.id));
  const learnTopics = window.RTA_LEARN_TOPICS || [
    { id: 'all', label: 'All Topics', emoji: '🎲' },
  ];

  const scavengerItems = [
    { id: 'plate-delaware', emoji: '🚘', label: 'Delaware license plate', hint: 'Tiny state, huge points.' },
    { id: 'orange-vw', emoji: '🧡', label: 'Orange VW Bug', hint: 'Classic road-trip jackpot.' },
    { id: 'meese', emoji: '🫎', label: 'Meese', hint: 'Anything moose-like counts: sign, sticker, plush, mascot.' },
    { id: 'weird-town-name', emoji: '🪧', label: 'Unusual town or exit name', hint: 'Anything that makes the car say, "Wait, what?"' },
    { id: 'giant-roadside-attraction', emoji: '🌡️', label: 'Giant roadside attraction', hint: 'Oversized object, statue, sign, or landmark.' },
    { id: 'alien', emoji: '👽', label: 'Alien or UFO', hint: 'Billboard, sticker, shirt, anything.' },
    { id: 'joshua-tree', emoji: '🌵', label: 'Joshua tree', hint: 'Pointy desert silhouette.' },
    { id: 'vacation-billboard', emoji: '🎰', label: 'Vacation billboard', hint: 'Theme park, casino, beach, mountain, museum, or hotel.' },
    { id: 'solar-farm', emoji: '☀️', label: 'Solar panels', hint: 'A field of shiny rectangles.' },
    { id: 'freight-train', emoji: '🚂', label: 'Freight train', hint: 'Bonus respect for counting cars.' },
    { id: 'road-runner', emoji: '💨', label: 'Roadrunner reference', hint: 'A sign, mural, mascot, or the real deal.' },
    { id: 'state-welcome-sign', emoji: '⭐', label: 'State welcome sign', hint: 'Border crossing moment.' },
    { id: 'desert-mountain', emoji: '⛰️', label: 'Striped desert mountain', hint: 'Look for layers of color.' },
    { id: 'license-plate-nickname', emoji: '🏷️', label: 'State nickname plate', hint: 'A plate with a slogan or nickname.' },
    { id: 'weird-load', emoji: '📦', label: 'Weird truck cargo', hint: 'Something that makes everyone ask questions.' },
    { id: 'limo-party-bus', emoji: '🚌', label: 'Limo, party bus, or shuttle', hint: 'Celebration energy on wheels.' },
    { id: 'neon-anything', emoji: '💡', label: 'Neon or glowing sign', hint: 'Any bright sign with nighttime energy.' },
    { id: 'mountain-shadow', emoji: '🌄', label: 'Big mountain shadow', hint: 'A dramatic desert shape.' },
    { id: 'rest-stop-sticker', emoji: '🥤', label: 'Funny bumper sticker', hint: 'Read it aloud only if family-friendly.' },
    { id: 'plane-overhead', emoji: '✈️', label: 'Plane overhead', hint: 'Bonus if someone spots it first by sound.' },
    { id: 'bridge', emoji: '🌉', label: 'Bridge or overpass', hint: 'Count it when you go under or over.' },
    { id: 'water-tower', emoji: '💧', label: 'Water tower', hint: 'A town name on it is a bonus.' },
    { id: 'school-bus', emoji: '🚌', label: 'School bus', hint: 'Parked or moving both count.' },
    { id: 'dog-in-car', emoji: '🐾', label: 'Pet in another car', hint: 'Only passengers should look.' },
    { id: 'cool-cloud', emoji: '☁️', label: 'Cloud shaped like something', hint: 'The player must name what it looks like.' },
    { id: 'historic-marker', emoji: '📜', label: 'Historic marker', hint: 'A plaque, marker, old building, or heritage sign.' },
    { id: 'out-of-state-plate', emoji: '🗺️', label: 'Out-of-state plate', hint: 'Any state different from your current one.' },
    { id: 'food-truck', emoji: '🌮', label: 'Food truck', hint: 'Or a roadside food stand.' },
    { id: 'rv-camper', emoji: '🏕️', label: 'RV or camper', hint: 'Tiny home on wheels.' },
  ];

  (window.RTA_SCAVENGER_ITEMS || []).forEach(item => {
    if (!scavengerItems.some(entry => entry.id === item.id)) {
      scavengerItems.push(item);
    }
  });

  const scavengerItemDenylist = new Set([
    'cool-cloud',
    'mountain-shadow',
    'road-runner',
    'plate-delaware',
    'joshua-tree',
    'meese',
    'orange-vw',
    'solar-farm',
  ]);

  const activeScavengerItems = scavengerItems.filter(item => !scavengerItemDenylist.has(item.id));

  const stateFacts = [
    ['Alabama', 'Montgomery', 'Yellowhammer State'], ['Alaska', 'Juneau', 'The Last Frontier'],
    ['Arizona', 'Phoenix', 'Grand Canyon State'], ['Arkansas', 'Little Rock', 'The Natural State'],
    ['California', 'Sacramento', 'Golden State'], ['Colorado', 'Denver', 'Centennial State'],
    ['Connecticut', 'Hartford', 'Constitution State'], ['Delaware', 'Dover', 'First State'],
    ['Florida', 'Tallahassee', 'Sunshine State'], ['Georgia', 'Atlanta', 'Peach State'],
    ['Hawaii', 'Honolulu', 'Aloha State'], ['Idaho', 'Boise', 'Gem State'],
    ['Illinois', 'Springfield', 'Prairie State'], ['Indiana', 'Indianapolis', 'Hoosier State'],
    ['Iowa', 'Des Moines', 'Hawkeye State'], ['Kansas', 'Topeka', 'Sunflower State'],
    ['Kentucky', 'Frankfort', 'Bluegrass State'], ['Louisiana', 'Baton Rouge', 'Pelican State'],
    ['Maine', 'Augusta', 'Pine Tree State'], ['Maryland', 'Annapolis', 'Old Line State'],
    ['Massachusetts', 'Boston', 'Bay State'], ['Michigan', 'Lansing', 'Great Lakes State'],
    ['Minnesota', 'Saint Paul', 'North Star State'], ['Mississippi', 'Jackson', 'Magnolia State'],
    ['Missouri', 'Jefferson City', 'Show-Me State'], ['Montana', 'Helena', 'Treasure State'],
    ['Nebraska', 'Lincoln', 'Cornhusker State'], ['Nevada', 'Carson City', 'Silver State'],
    ['New Hampshire', 'Concord', 'Granite State'], ['New Jersey', 'Trenton', 'Garden State'],
    ['New Mexico', 'Santa Fe', 'Land of Enchantment'], ['New York', 'Albany', 'Empire State'],
    ['North Carolina', 'Raleigh', 'Tar Heel State'], ['North Dakota', 'Bismarck', 'Peace Garden State'],
    ['Ohio', 'Columbus', 'Buckeye State'], ['Oklahoma', 'Oklahoma City', 'Sooner State'],
    ['Oregon', 'Salem', 'Beaver State'], ['Pennsylvania', 'Harrisburg', 'Keystone State'],
    ['Rhode Island', 'Providence', 'Ocean State'], ['South Carolina', 'Columbia', 'Palmetto State'],
    ['South Dakota', 'Pierre', 'Mount Rushmore State'], ['Tennessee', 'Nashville', 'Volunteer State'],
    ['Texas', 'Austin', 'Lone Star State'], ['Utah', 'Salt Lake City', 'Beehive State'],
    ['Vermont', 'Montpelier', 'Green Mountain State'], ['Virginia', 'Richmond', 'Old Dominion'],
    ['Washington', 'Olympia', 'Evergreen State'], ['West Virginia', 'Charleston', 'Mountain State'],
    ['Wisconsin', 'Madison', 'Badger State'], ['Wyoming', 'Cheyenne', 'Equality State'],
  ];

  const triviaCategories = [
    { id: 'capitals', label: 'All 50 Capitals', emoji: '🏛️' },
    { id: 'nicknames', label: 'State Nicknames', emoji: '🏷️' },
    { id: 'plates', label: 'License Plate States', emoji: '🚘' },
    { id: 'geography', label: 'Rivers & Remote Places', emoji: '🗺️' },
    { id: 'math', label: 'Road Math', emoji: '➗' },
    { id: 'science', label: 'Science', emoji: '🔬' },
    { id: 'biology', label: 'Biology', emoji: '🧬' },
    { id: 'facts', label: 'Random Facts', emoji: '💡' },
    { id: 'food', label: 'Food Facts', emoji: '🍕' },
    { id: 'music', label: 'Music Clues', emoji: '🎵' },
    { id: 'tv', label: 'Popular TV', emoji: '📺' },
    { id: 'southpark', label: 'South Park', emoji: '🏔️' },
    { id: 'rickmorty', label: 'Rick and Morty', emoji: '🛸' },
    { id: 'seinfeld', label: 'Seinfeld', emoji: '🥨' },
    { id: 'friends', label: 'Friends', emoji: '☕' },
    { id: 'kpop', label: 'K-pop', emoji: '🎧' },
    { id: 'taylorswift', label: 'Taylor Swift', emoji: '🪩' },
    { id: 'eighties', label: '80s Trivia', emoji: '📼' },
    { id: 'nineties', label: '90s Trivia', emoji: '💿' },
    { id: 'twothousands', label: '2000s Trivia', emoji: '📱' },
    { id: 'twentytens', label: '2010s Trivia', emoji: '🔁' },
    { id: 'twentytwenties', label: '2020s Trivia', emoji: '📲' },
    { id: 'nba', label: 'NBA', emoji: '🏀' },
    { id: 'nfl', label: 'NFL', emoji: '🏈' },
    { id: 'soccer', label: 'Soccer', emoji: '⚽' },
    { id: 'baseball', label: 'Baseball', emoji: '⚾' },
    { id: 'mixed', label: 'Big Mixed Bag', emoji: '🎲' },
  ];

  (window.RTA_TRIVIA_CATEGORIES || []).forEach(category => {
    if (!triviaCategories.some(entry => entry.id === category.id)) {
      triviaCategories.push(category);
    }
  });

  const triviaBaseQuestions = [
    { category: 'geography', question: 'What is generally considered the longest river in the United States?', answer: 'The Missouri River.', choices: ['The Missouri River.', 'The Mississippi River.', 'The Colorado River.', 'The Columbia River.'] },
    { category: 'geography', question: 'Which U.S. state is home to the most national parks?', answer: 'California.', choices: ['California.', 'Alaska.', 'Utah.', 'Colorado.'] },
    { category: 'geography', question: 'Which river carved the Grand Canyon?', answer: 'The Colorado River.', choices: ['The Colorado River.', 'The Missouri River.', 'The Rio Grande.', 'The Snake River.'] },
    { category: 'geography', question: 'Which U.S. river is famous for forming much of the border between Texas and Mexico?', answer: 'The Rio Grande.', choices: ['The Rio Grande.', 'The Colorado River.', 'The Arkansas River.', 'The Red River.'] },
    { category: 'geography', question: 'Which U.S. desert includes parts of California, Nevada, Arizona, and Utah?', answer: 'The Mojave Desert.', choices: ['The Mojave Desert.', 'The Sonoran Desert.', 'The Chihuahuan Desert.', 'The Great Basin Desert.'] },
    { category: 'geography', question: 'What is the highest mountain in the contiguous United States?', answer: 'Mount Whitney.', choices: ['Mount Whitney.', 'Mount Rainier.', 'Mount Elbert.', 'Mount Shasta.'] },
    { category: 'geography', question: 'Which Great Lake is the largest by surface area?', answer: 'Lake Superior.', choices: ['Lake Superior.', 'Lake Michigan.', 'Lake Huron.', 'Lake Erie.'] },
    { category: 'math', question: 'Road math: If you drive 60 miles per hour for 2 hours, how far do you go?', answer: '120 miles.', choices: ['120 miles.', '60 miles.', '90 miles.', '180 miles.'] },
    { category: 'math', question: 'Road math: A car gets 30 miles per gallon. How many gallons for 150 miles?', answer: '5 gallons.', choices: ['5 gallons.', '3 gallons.', '6 gallons.', '10 gallons.'] },
    { category: 'math', question: 'Road math: If lunch costs $48 and four people split it evenly, what does each person pay before tip?', answer: '$12.', choices: ['$12.', '$10.', '$14.', '$16.'] },
    { category: 'math', question: 'Road math: You have 3 hours left and stop for 20 minutes. How much travel time remains after the stop?', answer: '2 hours and 40 minutes.', choices: ['2 hours and 40 minutes.', '2 hours and 20 minutes.', '3 hours and 20 minutes.', '1 hour and 40 minutes.'] },
    { category: 'math', question: 'Road math: What is 15% of 40?', answer: '6.', choices: ['6.', '4.', '8.', '10.'] },
    { category: 'math', question: 'Road math: If you see mile marker 112 and need exit 148, how many miles remain?', answer: '36 miles.', choices: ['36 miles.', '26 miles.', '34 miles.', '46 miles.'] },
    { category: 'science', question: 'What force keeps planets moving around the sun?', answer: 'Gravity.', choices: ['Gravity.', 'Friction.', 'Magnetism.', 'Sound.'] },
    { category: 'science', question: 'What gas do plants take in during photosynthesis?', answer: 'Carbon dioxide.', choices: ['Carbon dioxide.', 'Oxygen.', 'Nitrogen.', 'Helium.'] },
    { category: 'science', question: 'What is the chemical formula for water?', answer: 'H2O.', choices: ['H2O.', 'CO2.', 'O2.', 'NaCl.'] },
    { category: 'science', question: 'What part of the electromagnetic spectrum lets us see colors?', answer: 'Visible light.', choices: ['Visible light.', 'Radio waves.', 'X-rays.', 'Microwaves.'] },
    { category: 'science', question: 'What type of energy does a moving car have?', answer: 'Kinetic energy.', choices: ['Kinetic energy.', 'Thermal energy.', 'Chemical energy.', 'Elastic energy.'] },
    { category: 'science', question: 'Why do distant mountains often look blue?', answer: 'Air scatters shorter blue wavelengths of light.', choices: ['Air scatters shorter blue wavelengths of light.', 'Mountains are covered in blue minerals.', 'Clouds reflect ocean water onto them.', 'The sun removes red light from rocks.'] },
    { category: 'biology', question: 'What organ pumps blood through the body?', answer: 'The heart.', choices: ['The heart.', 'The lungs.', 'The liver.', 'The stomach.'] },
    { category: 'biology', question: 'What do bees collect from flowers to make honey?', answer: 'Nectar.', choices: ['Nectar.', 'Pollen only.', 'Sap.', 'Seeds.'] },
    { category: 'biology', question: 'What is the largest organ of the human body?', answer: 'The skin.', choices: ['The skin.', 'The heart.', 'The brain.', 'The liver.'] },
    { category: 'biology', question: 'What pigment makes plants green?', answer: 'Chlorophyll.', choices: ['Chlorophyll.', 'Melanin.', 'Hemoglobin.', 'Keratin.'] },
    { category: 'biology', question: 'What do you call animals that are active at night?', answer: 'Nocturnal.', choices: ['Nocturnal.', 'Migratory.', 'Domesticated.', 'Herbivorous.'] },
    { category: 'biology', question: 'What part of a bird helps it steer while flying?', answer: 'Its tail feathers.', choices: ['Its tail feathers.', 'Its beak.', 'Its feet.', 'Its eyes.'] },
    { category: 'facts', question: 'Random fact: What is the only U.S. state made entirely of islands?', answer: 'Hawaii.', choices: ['Hawaii.', 'Rhode Island.', 'Maine.', 'Alaska.'] },
    { category: 'facts', question: 'Random fact: What is the smallest U.S. state by area?', answer: 'Rhode Island.', choices: ['Rhode Island.', 'Delaware.', 'Connecticut.', 'New Jersey.'] },
    { category: 'facts', question: 'Random fact: What is the fastest land animal?', answer: 'The cheetah.', choices: ['The cheetah.', 'The pronghorn.', 'The lion.', 'The greyhound.'] },
    { category: 'facts', question: 'Random fact: Which planet has the most obvious ring system?', answer: 'Saturn.', choices: ['Saturn.', 'Mars.', 'Venus.', 'Mercury.'] },
    { category: 'facts', question: 'Random fact: What is the tallest animal on Earth?', answer: 'The giraffe.', choices: ['The giraffe.', 'The elephant.', 'The ostrich.', 'The moose.'] },
    { category: 'facts', question: 'Random fact: Which ocean is the largest?', answer: 'The Pacific Ocean.', choices: ['The Pacific Ocean.', 'The Atlantic Ocean.', 'The Indian Ocean.', 'The Arctic Ocean.'] },
    { category: 'food', question: 'Food fact: What fruit is known for having its seeds on the outside?', answer: 'Strawberry.', choices: ['Strawberry.', 'Blueberry.', 'Peach.', 'Watermelon.'] },
    { category: 'food', question: 'Food fact: What country is usually credited as the birthplace of pizza?', answer: 'Italy.', choices: ['Italy.', 'France.', 'Greece.', 'Mexico.'] },
    { category: 'food', question: 'Food fact: What bean is used to make traditional hummus?', answer: 'Chickpea.', choices: ['Chickpea.', 'Black bean.', 'Kidney bean.', 'Lima bean.'] },
    { category: 'food', question: 'Food fact: What spice gives many curries their yellow color?', answer: 'Turmeric.', choices: ['Turmeric.', 'Cinnamon.', 'Paprika.', 'Nutmeg.'] },
    { category: 'food', question: 'Food fact: What frozen dessert is made by churning cream, sugar, and flavoring?', answer: 'Ice cream.', choices: ['Ice cream.', 'Sorbet.', 'Gelatin.', 'Pudding.'] },
    { category: 'food', question: 'Food fact: What is sushi rice seasoned with?', answer: 'Vinegar, usually rice vinegar.', choices: ['Vinegar, usually rice vinegar.', 'Soy sauce.', 'Sesame oil.', 'Miso paste.'] },
    { category: 'music', question: 'Music clue: A Queen song about a champion who keeps going, often played after victories.', answer: 'We Are the Champions.', choices: ['We Are the Champions.', 'Bohemian Rhapsody.', 'Another One Bites the Dust.', 'We Will Rock You.'] },
    { category: 'music', question: 'Music clue: A Journey song about holding onto a feeling, popular for group singalongs.', answer: 'Don’t Stop Believin’.', choices: ['Don’t Stop Believin’.', 'Any Way You Want It.', 'Faithfully.', 'Open Arms.'] },
    { category: 'music', question: 'Music clue: A Dolly Parton song named after a woman with flaming locks of auburn hair.', answer: 'Jolene.', choices: ['Jolene.', '9 to 5.', 'I Will Always Love You.', 'Coat of Many Colors.'] },
    { category: 'music', question: 'Music clue: A Beatles song asking for assistance.', answer: 'Help!', choices: ['Help!', 'Hey Jude.', 'Let It Be.', 'Yesterday.'] },
    { category: 'music', question: 'Music clue: A road-trip classic by Willie Nelson about traveling again.', answer: 'On the Road Again.', choices: ['On the Road Again.', 'Always on My Mind.', 'Blue Eyes Crying in the Rain.', 'Crazy.'] },
    { category: 'music', question: 'Music clue: A Pharrell song whose title is a feeling and became a giant singalong hit.', answer: 'Happy.', choices: ['Happy.', 'Get Lucky.', 'Blurred Lines.', 'Freedom.'] },
    { category: 'music', question: 'Music clue: A Toto song named after a continent.', answer: 'Africa.', choices: ['Africa.', 'Rosanna.', 'Hold the Line.', 'Pamela.'] },
    { category: 'music', question: 'Music clue: A Taylor Swift song encouraging people to ignore criticism through movement.', answer: 'Shake It Off.', choices: ['Shake It Off.', 'Blank Space.', 'Anti-Hero.', 'Love Story.'] },
    { category: 'music', question: 'Music clue: A-ha had a famous 1980s hit with a sketch-style music video.', answer: 'Take On Me.', choices: ['Take On Me.', 'The Sun Always Shines on T.V.', 'Hunting High and Low.', 'Stay on These Roads.'] },
    { category: 'music', question: 'Music clue: A classic road song by Steppenwolf about heading out on the highway.', answer: 'Born to Be Wild.', choices: ['Born to Be Wild.', 'Magic Carpet Ride.', 'The Pusher.', 'Rock Me.'] },
    { category: 'nba', question: 'Which NBA team plays home games at Madison Square Garden?', answer: 'New York Knicks.', choices: ['New York Knicks.', 'Brooklyn Nets.', 'Boston Celtics.', 'Philadelphia 76ers.'] },
    { category: 'nba', question: 'Which NBA team has a shamrock-heavy identity and plays in Boston?', answer: 'Boston Celtics.', choices: ['Boston Celtics.', 'Milwaukee Bucks.', 'New York Knicks.', 'Chicago Bulls.'] },
    { category: 'nba', question: 'Which NBA team is associated with Showtime and purple and gold?', answer: 'Los Angeles Lakers.', choices: ['Los Angeles Lakers.', 'Phoenix Suns.', 'Sacramento Kings.', 'Golden State Warriors.'] },
    { category: 'nba', question: 'In basketball, how many points is a shot worth from beyond the arc?', answer: 'Three points.', choices: ['Three points.', 'One point.', 'Two points.', 'Four points.'] },
    { category: 'nba', question: 'Which NBA team plays in San Francisco and has a bridge-themed logo history?', answer: 'Golden State Warriors.', choices: ['Golden State Warriors.', 'Los Angeles Clippers.', 'Sacramento Kings.', 'Portland Trail Blazers.'] },
    { category: 'nba', question: 'What is it called when a player gets double digits in three stat categories?', answer: 'A triple-double.', choices: ['A triple-double.', 'A double-double.', 'A hat trick.', 'A grand slam.'] },
    { category: 'nfl', question: 'Which NFL team is nicknamed America’s Team?', answer: 'Dallas Cowboys.', choices: ['Dallas Cowboys.', 'Pittsburgh Steelers.', 'Green Bay Packers.', 'San Francisco 49ers.'] },
    { category: 'nfl', question: 'How many points is a touchdown worth before the extra point or two-point try?', answer: 'Six points.', choices: ['Six points.', 'Three points.', 'Seven points.', 'Two points.'] },
    { category: 'nfl', question: 'Which NFL team plays home games at Lambeau Field?', answer: 'Green Bay Packers.', choices: ['Green Bay Packers.', 'Chicago Bears.', 'Minnesota Vikings.', 'Detroit Lions.'] },
    { category: 'nfl', question: 'What is the championship game of the NFL called?', answer: 'The Super Bowl.', choices: ['The Super Bowl.', 'The World Series.', 'The Stanley Cup Final.', 'The Final Four.'] },
    { category: 'nfl', question: 'How many points is a field goal worth?', answer: 'Three points.', choices: ['Three points.', 'Two points.', 'Six points.', 'One point.'] },
    { category: 'nfl', question: 'Which NFL team has a lightning bolt logo?', answer: 'Los Angeles Chargers.', choices: ['Los Angeles Chargers.', 'Tennessee Titans.', 'Los Angeles Rams.', 'Seattle Seahawks.'] },
    { category: 'soccer', question: 'In soccer, what is it called when one player scores three goals in a game?', answer: 'A hat trick.', choices: ['A hat trick.', 'A clean sheet.', 'A brace.', 'A nutmeg.'] },
    { category: 'soccer', question: 'How many players does each soccer team usually have on the field, including the goalkeeper?', answer: 'Eleven.', choices: ['Eleven.', 'Nine.', 'Ten.', 'Twelve.'] },
    { category: 'soccer', question: 'What country has won the most men’s FIFA World Cups?', answer: 'Brazil.', choices: ['Brazil.', 'Germany.', 'Argentina.', 'Italy.'] },
    { category: 'soccer', question: 'What is the global governing body of soccer called?', answer: 'FIFA.', choices: ['FIFA.', 'UEFA.', 'CONCACAF.', 'IOC.'] },
    { category: 'soccer', question: 'What card is shown for a player being sent off?', answer: 'A red card.', choices: ['A red card.', 'A yellow card.', 'A blue card.', 'A green card.'] },
    { category: 'soccer', question: 'What position is allowed to use hands inside the penalty area?', answer: 'The goalkeeper.', choices: ['The goalkeeper.', 'The striker.', 'The winger.', 'The referee.'] },
    { category: 'baseball', question: 'How many strikes make an out in baseball?', answer: 'Three.', choices: ['Three.', 'Two.', 'Four.', 'Five.'] },
    { category: 'baseball', question: 'Which MLB team is known as the Bronx Bombers?', answer: 'New York Yankees.', choices: ['New York Yankees.', 'New York Mets.', 'Boston Red Sox.', 'Philadelphia Phillies.'] },
    { category: 'baseball', question: 'How many innings are in a standard MLB game?', answer: 'Nine innings.', choices: ['Nine innings.', 'Seven innings.', 'Eight innings.', 'Ten innings.'] },
    { category: 'baseball', question: 'What is it called when a batter hits the ball over the outfield fence in fair territory?', answer: 'A home run.', choices: ['A home run.', 'A groundout.', 'A bunt.', 'A stolen base.'] },
    { category: 'baseball', question: 'How many bases are on a baseball field?', answer: 'Four, counting home plate.', choices: ['Four, counting home plate.', 'Three, not counting home plate.', 'Five, counting the pitcher’s mound.', 'Six, counting foul poles.'] },
    { category: 'baseball', question: 'What is it called when a pitcher throws a game with no hits allowed?', answer: 'A no-hitter.', choices: ['A no-hitter.', 'A shutout.', 'A save.', 'A cycle.'] },
    { category: 'tv', question: 'Popular TV: Which animated family lives in Springfield?', answer: 'The Simpsons.', choices: ['The Simpsons.', 'The Griffins.', 'The Belchers.', 'The Flintstones.'] },
    { category: 'tv', question: 'Popular TV: Which show follows a chemistry teacher who becomes involved in the drug trade?', answer: 'Breaking Bad.', choices: ['Breaking Bad.', 'Better Call Saul.', 'The Wire.', 'Ozark.'] },
    { category: 'tv', question: 'Popular TV: Which fantasy series features houses like Stark, Lannister, and Targaryen?', answer: 'Game of Thrones.', choices: ['Game of Thrones.', 'The Witcher.', 'The Rings of Power.', 'House of Cards.'] },
    { category: 'tv', question: 'Popular TV: Which mockumentary sitcom is set mostly at Dunder Mifflin?', answer: 'The Office.', choices: ['The Office.', 'Parks and Recreation.', 'Modern Family.', 'Abbott Elementary.'] },
    { category: 'tv', question: 'Popular TV: Which streaming series made the Upside Down famous?', answer: 'Stranger Things.', choices: ['Stranger Things.', 'Wednesday.', 'The Mandalorian.', 'Lost.'] },
    { category: 'tv', question: 'Popular TV: Which medical drama is named after a brilliant but difficult doctor?', answer: 'House.', choices: ['House.', 'Grey’s Anatomy.', 'ER.', 'Scrubs.'] },
    { category: 'southpark', question: 'South Park: What Colorado town is the show named after?', answer: 'South Park.', choices: ['South Park.', 'Boulder.', 'Aspen.', 'Denver.'] },
    { category: 'southpark', question: 'South Park: Which character is known for wearing an orange parka?', answer: 'Kenny.', choices: ['Kenny.', 'Stan.', 'Kyle.', 'Cartman.'] },
    { category: 'southpark', question: 'South Park: What is Cartman’s first name?', answer: 'Eric.', choices: ['Eric.', 'Stan.', 'Kenny.', 'Kyle.'] },
    { category: 'southpark', question: 'South Park: Which character often wears a green ushanka hat?', answer: 'Kyle.', choices: ['Kyle.', 'Stan.', 'Kenny.', 'Butters.'] },
    { category: 'southpark', question: 'South Park: Which character is Stan’s best friend and often argues with Cartman?', answer: 'Kyle.', choices: ['Kyle.', 'Kenny.', 'Butters.', 'Token.'] },
    { category: 'rickmorty', question: 'Rick and Morty: What is Rick’s relationship to Morty?', answer: 'Rick is Morty’s grandfather.', choices: ['Rick is Morty’s grandfather.', 'Rick is Morty’s uncle.', 'Rick is Morty’s teacher.', 'Rick is Morty’s brother.'] },
    { category: 'rickmorty', question: 'Rick and Morty: What device does Rick often use to travel between dimensions?', answer: 'A portal gun.', choices: ['A portal gun.', 'A sonic screwdriver.', 'A time-turner.', 'A hoverboard.'] },
    { category: 'rickmorty', question: 'Rick and Morty: What color are many of Rick’s portals?', answer: 'Green.', choices: ['Green.', 'Blue.', 'Purple.', 'Red.'] },
    { category: 'rickmorty', question: 'Rick and Morty: What is the family’s last name?', answer: 'Smith.', choices: ['Smith.', 'Sanchez.', 'Johnson.', 'Brown.'] },
    { category: 'rickmorty', question: 'Rick and Morty: Which character turns himself into a pickle in a famous episode?', answer: 'Rick.', choices: ['Rick.', 'Morty.', 'Jerry.', 'Summer.'] },
    { category: 'seinfeld', question: 'Seinfeld: What city is the show primarily set in?', answer: 'New York City.', choices: ['New York City.', 'Los Angeles.', 'Chicago.', 'Boston.'] },
    { category: 'seinfeld', question: 'Seinfeld: What is Kramer’s first name?', answer: 'Cosmo.', choices: ['Cosmo.', 'Newman.', 'Morty.', 'Frank.'] },
    { category: 'seinfeld', question: 'Seinfeld: What is Jerry’s profession?', answer: 'Stand-up comedian.', choices: ['Stand-up comedian.', 'Sports writer.', 'Architect.', 'Radio host.'] },
    { category: 'seinfeld', question: 'Seinfeld: Which character works for the Yankees for part of the series?', answer: 'George Costanza.', choices: ['George Costanza.', 'Jerry Seinfeld.', 'Elaine Benes.', 'Cosmo Kramer.'] },
    { category: 'seinfeld', question: 'Seinfeld: What café do the main characters often visit?', answer: 'Monk’s Café.', choices: ['Monk’s Café.', 'Central Perk.', 'Luke’s Diner.', 'The Max.'] },
    { category: 'friends', question: 'Friends: What coffee shop do the friends often visit?', answer: 'Central Perk.', choices: ['Central Perk.', 'Monk’s Café.', 'Luke’s Diner.', 'The Peach Pit.'] },
    { category: 'friends', question: 'Friends: Which character says they were “on a break”?', answer: 'Ross.', choices: ['Ross.', 'Chandler.', 'Joey.', 'Rachel.'] },
    { category: 'friends', question: 'Friends: What is Phoebe’s famous silly song about a cat?', answer: 'Smelly Cat.', choices: ['Smelly Cat.', 'Soft Kitty.', 'Cat Scratch Fever.', 'Cool Cat.'] },
    { category: 'friends', question: 'Friends: Which two friends are siblings?', answer: 'Ross and Monica.', choices: ['Ross and Monica.', 'Rachel and Joey.', 'Phoebe and Chandler.', 'Monica and Joey.'] },
    { category: 'friends', question: 'Friends: What city is Friends set in?', answer: 'New York City.', choices: ['New York City.', 'Los Angeles.', 'Chicago.', 'Seattle.'] },
    { category: 'kpop', question: 'K-pop: Which group released the global hit “Dynamite”?', answer: 'BTS.', choices: ['BTS.', 'BLACKPINK.', 'EXO.', 'TWICE.'] },
    { category: 'kpop', question: 'K-pop: Which four-member girl group is known for “DDU-DU DDU-DU”?', answer: 'BLACKPINK.', choices: ['BLACKPINK.', 'NewJeans.', 'TWICE.', 'Red Velvet.'] },
    { category: 'kpop', question: 'K-pop: What does the “K” in K-pop stand for?', answer: 'Korean.', choices: ['Korean.', 'Karaoke.', 'Kinetic.', 'Kingdom.'] },
    { category: 'kpop', question: 'K-pop: Which entertainment company formed aespa?', answer: 'SM Entertainment.', choices: ['SM Entertainment.', 'YG Entertainment.', 'JYP Entertainment.', 'HYBE.'] },
    { category: 'kpop', question: 'K-pop: Which group has members named RM, Jin, SUGA, j-hope, Jimin, V, and Jung Kook?', answer: 'BTS.', choices: ['BTS.', 'SEVENTEEN.', 'Stray Kids.', 'NCT.'] },
    { category: 'kpop', question: 'K-pop: Which girl group is known for the fandom name BLINK?', answer: 'BLACKPINK.', choices: ['BLACKPINK.', 'TWICE.', 'IVE.', 'LE SSERAFIM.'] },
    { category: 'taylorswift', question: 'Taylor Swift: Which album includes the song “Shake It Off”?', answer: '1989.', choices: ['1989.', 'Red.', 'folklore.', 'Midnights.'] },
    { category: 'taylorswift', question: 'Taylor Swift: What is the name of her 2023 concert film tour?', answer: 'The Eras Tour.', choices: ['The Eras Tour.', 'The Reputation Tour.', 'The Red Tour.', 'The Speak Now Tour.'] },
    { category: 'taylorswift', question: 'Taylor Swift: Which album has a cottagecore/indie-folk style and was released in 2020?', answer: 'folklore.', choices: ['folklore.', 'Lover.', '1989.', 'Fearless.'] },
    { category: 'taylorswift', question: 'Taylor Swift: Which album title is also a color often associated with heartbreak?', answer: 'Red.', choices: ['Red.', 'Blue.', 'Gold.', 'Green.'] },
    { category: 'taylorswift', question: 'Taylor Swift: Which album includes the song “Anti-Hero”?', answer: 'Midnights.', choices: ['Midnights.', 'evermore.', 'Speak Now.', 'Reputation.'] },
    { category: 'taylorswift', question: 'Taylor Swift: What are Taylor Swift fans commonly called?', answer: 'Swifties.', choices: ['Swifties.', 'Beliebers.', 'Directioners.', 'Little Monsters.'] },
    { category: 'eighties', question: '80s Trivia: Which video game character became famous for eating dots and avoiding ghosts?', answer: 'Pac-Man.', choices: ['Pac-Man.', 'Mario.', 'Sonic.', 'Donkey Kong.'] },
    { category: 'eighties', question: '80s Trivia: Which movie features a DeLorean time machine?', answer: 'Back to the Future.', choices: ['Back to the Future.', 'The Terminator.', 'E.T.', 'The Goonies.'] },
    { category: 'eighties', question: '80s Trivia: Which music channel launched in 1981?', answer: 'MTV.', choices: ['MTV.', 'VH1.', 'BET.', 'CMT.'] },
    { category: 'eighties', question: '80s Trivia: Which handheld puzzle cube became a huge craze?', answer: 'Rubik’s Cube.', choices: ['Rubik’s Cube.', 'Tamagotchi.', 'Bop It.', 'Game Boy.'] },
    { category: 'eighties', question: '80s Trivia: Which movie asks, “Who you gonna call?” without needing the lyric?', answer: 'Ghostbusters.', choices: ['Ghostbusters.', 'Beetlejuice.', 'Gremlins.', 'The Lost Boys.'] },
    { category: 'nineties', question: '90s Trivia: Which handheld virtual pet became a playground craze?', answer: 'Tamagotchi.', choices: ['Tamagotchi.', 'Game Boy Color.', 'Skip-It.', 'Pogs.'] },
    { category: 'nineties', question: '90s Trivia: Which sitcom featured six friends in New York?', answer: 'Friends.', choices: ['Friends.', 'Seinfeld.', 'Frasier.', 'The Fresh Prince of Bel-Air.'] },
    { category: 'nineties', question: '90s Trivia: Which video game franchise features Pikachu?', answer: 'Pokémon.', choices: ['Pokémon.', 'Digimon.', 'Sonic the Hedgehog.', 'Super Mario.'] },
    { category: 'nineties', question: '90s Trivia: Which movie had the famous line about being king of the world?', answer: 'Titanic.', choices: ['Titanic.', 'Jurassic Park.', 'Forrest Gump.', 'The Matrix.'] },
    { category: 'nineties', question: '90s Trivia: Which search company was founded in 1998?', answer: 'Google.', choices: ['Google.', 'Yahoo.', 'Ask Jeeves.', 'AOL.'] },
    { category: 'twothousands', question: '2000s Trivia: Which social network launched first for college students in 2004?', answer: 'Facebook.', choices: ['Facebook.', 'Instagram.', 'Myspace.', 'Twitter.'] },
    { category: 'twothousands', question: '2000s Trivia: Which Apple phone launched in 2007?', answer: 'iPhone.', choices: ['iPhone.', 'iPod.', 'BlackBerry Pearl.', 'Motorola Razr.'] },
    { category: 'twothousands', question: '2000s Trivia: Which movie franchise featured a young wizard at Hogwarts?', answer: 'Harry Potter.', choices: ['Harry Potter.', 'Twilight.', 'The Hunger Games.', 'Percy Jackson.'] },
    { category: 'twothousands', question: '2000s Trivia: Which video platform launched in 2005?', answer: 'YouTube.', choices: ['YouTube.', 'TikTok.', 'Vimeo.', 'Twitch.'] },
    { category: 'twothousands', question: '2000s Trivia: Which singing competition made Kelly Clarkson its first winner?', answer: 'American Idol.', choices: ['American Idol.', 'The Voice.', 'The X Factor.', 'Star Search.'] },
    { category: 'twentytens', question: '2010s Trivia: Which app popularized disappearing photo and video messages?', answer: 'Snapchat.', choices: ['Snapchat.', 'Instagram.', 'Vine.', 'WhatsApp.'] },
    { category: 'twentytens', question: '2010s Trivia: Which battle royale game became famous for dances and building?', answer: 'Fortnite.', choices: ['Fortnite.', 'Minecraft.', 'Roblox.', 'Among Us.'] },
    { category: 'twentytens', question: '2010s Trivia: Which Marvel movie concluded the Infinity Saga in 2019?', answer: 'Avengers: Endgame.', choices: ['Avengers: Endgame.', 'Black Panther.', 'Captain Marvel.', 'Spider-Man: Homecoming.'] },
    { category: 'twentytens', question: '2010s Trivia: Which song and dance craze by PSY became a global viral hit?', answer: 'Gangnam Style.', choices: ['Gangnam Style.', 'Harlem Shake.', 'Watch Me.', 'Despacito.'] },
    { category: 'twentytens', question: '2010s Trivia: Which streaming series introduced Eleven and the Upside Down?', answer: 'Stranger Things.', choices: ['Stranger Things.', 'Black Mirror.', 'The Walking Dead.', 'Riverdale.'] },
    { category: 'twentytwenties', question: '2020s Trivia: Which word game became a daily online habit for many players?', answer: 'Wordle.', choices: ['Wordle.', 'Sudoku.', 'Crossy Road.', 'HQ Trivia.'] },
    { category: 'twentytwenties', question: '2020s Trivia: Which movie paired a fashion doll with a major pink-themed blockbuster?', answer: 'Barbie.', choices: ['Barbie.', 'Mean Girls.', 'Legally Blonde.', 'Clueless.'] },
    { category: 'twentytwenties', question: '2020s Trivia: Which Korean drama became a massive Netflix hit with childhood games turned deadly?', answer: 'Squid Game.', choices: ['Squid Game.', 'All of Us Are Dead.', 'Kingdom.', 'Crash Landing on You.'] },
    { category: 'twentytwenties', question: '2020s Trivia: Which short-form video app shaped many music and dance trends?', answer: 'TikTok.', choices: ['TikTok.', 'Vine.', 'Snapchat.', 'Twitch.'] },
    { category: 'twentytwenties', question: '2020s Trivia: Which NASA rover landed on Mars in 2021?', answer: 'Perseverance.', choices: ['Perseverance.', 'Curiosity.', 'Opportunity.', 'Spirit.'] },
  ];

  function inferTriviaDifficulty(item) {
    if (item.difficulty) return item.difficulty;
    const category = item.category || 'mixed';
    if (['capitals', 'nicknames', 'plates', 'math', 'facts', 'food'].includes(category)) return 'easy';
    if (['weirdlaws', 'nationalparks', 'alaska', 'ballet', 'hockey', 'inventions', 'space'].includes(category)) return 'hard';
    if (/hard|remote|largest|highest|formula|spectrum|founded|capital of|nickname/i.test(item.question || '')) return 'medium';
    return 'medium';
  }

  const triviaQuestionDenylist = new Set([
    // Keep generated packs intact, but hide items that are awkward, hard to verify,
    // or too urban-legend-ish for a family road trip game.
    'weirdlaws-in-alabama-it-was-once-illegal-to-wear-what-kind-of-fake-mustache-in-c',
    'weirdlaws-in-alabama-fake-mustaches-in-church-were-prohibited-if-they-caused-wha',
    'weirdlaws-in-alaska-waking-a-sleeping-bear-for-a-photograph-was-once-prohibited-',
    'weirdlaws-exit-signs',
    'weirdlaws-in-georgia-what-animal-is-famously-not-allowed-to-be-tied-to-a-telepho',
    'weirdlaws-in-georgia-what-animal-was-once-prohibited-from-being-tied-to-a-teleph',
    'weirdlaws-in-idaho-what-is-it-illegal-to-fish-from-according-to-a-famous-weird-l',
    'weirdlaws-in-maine-what-holiday-decoration-could-technically-violate-an-old-ordi',
    'weirdlaws-in-maine-what-holiday-decoration-was-once-restricted',
    'weirdlaws-in-maine-what-holiday-decoration-was-once-restricted-by-local-ordinanc',
    'weirdlaws-in-minnesota-what-bird-is-often-cited-in-a-bizarre-border-crossing-law',
    'weirdlaws-in-missouri-what-wild-animal-is-often-cited-as-illegal-to-drive-with-u',
    'weirdlaws-in-nevada-what-desert-animal-is-often-cited-in-a-strange-sidewalk-law',
    'weirdlaws-in-new-jersey-what-sound-related-act-is-often-cited-as-illegal-in-publ',
    'weirdlaws-in-new-mexico-what-activity-involving-lunch-boxes-is-often-cited-as-re',
    'weirdlaws-in-new-mexico-lunch-boxes-could-not-be-sold-without-what',
    'weirdlaws-in-north-dakota-what-is-often-cited-as-illegal',
    'weirdlaws-in-ohio-what-animal-is-commonly-cited-as-illegal-to-get-drunk',
    'weirdlaws-in-oklahoma-it-is-often-cited-as-illegal-to-make-what-kind-of-face-at-',
    'weirdlaws-oklahoma-christmas',
    'weirdlaws-in-oregon-what-kind-of-container-is-often-cited-in-a-weird-fishing-res',
    'weirdlaws-in-pennsylvania-what-appliance-is-often-cited-in-a-law-about-sleeping-',
    'weirdlaws-in-west-virginia-what-animal-is-commonly-cited-in-a-law-about-roadkill',
    'weirdlaws-in-west-virginia-what-can-legally-become-dinner-if-reported',
    'weirdlaws-in-wyoming-what-animal-is-often-cited-in-a-law-about-photographing-wil',
    'weirdlaws-in-california-what-animal-is-often-cited-as-being-prohibited-from-lick',
    'general-cloned-animal',
    'general-cynophobia',
    'general-roulette-sum',
    'general-funambulist',
    'general-saffron',
    'food-avocado-varieties',
    'food-carne-asada',
    'food-dos-equis',
    'food-guinness-origin',
    'food-kosher-meaning',
    'food-new-york-fruit',
    'food-pina-colada',
    'food-bond-drink',
    'food-mageirocophobia',
    'food-fancy-sauce',
    'food-tim-tam-slam',
    'nationalparks-which-park-is-often-called-the-american-alps',
  ]);

  const hiddenTriviaCategories = new Set([
    'weirdlaws',
  ]);

  function buildTriviaDatabase() {
    const stateQuestions = [];
    stateFacts.forEach(([state, capital, nickname]) => {
      const stateId = slugify(state);
      stateQuestions.push({
        id: `state-capital-${stateId}`,
        category: 'capitals',
        question: `What is the capital of ${state}?`,
        answer: `${capital}.`,
      });
      stateQuestions.push({
        id: `state-nickname-${stateId}`,
        category: 'nicknames',
        question: `Which state is nicknamed the ${nickname}?`,
        answer: `${state}.`,
      });
      stateQuestions.push({
        id: `state-plate-${stateId}`,
        category: 'plates',
        question: `License plate game: if you spot a plate from ${state}, what is its capital?`,
        answer: `${capital}.`,
      });
    });

    const externalQuestions = window.RTA_TRIVIA_QUESTIONS || [];
    return stateQuestions.concat(triviaBaseQuestions, externalQuestions).filter(item => {
      return !triviaQuestionDenylist.has(item.id);
    }).map((item, index) => {
      const answer = String(item.answer || '').trim();
      const normalizedAnswer = answer.endsWith('.') || answer.endsWith('!') || answer.endsWith('?') ? answer : `${answer}.`;
      return {
        id: item.id || `${item.category || 'trivia'}-${slugify(item.question || index)}`,
        category: item.category || 'mixed',
        question: item.question || 'Trivia question missing.',
        answer: normalizedAnswer,
        choices: Array.isArray(item.choices) ? item.choices.slice() : null,
        difficulty: inferTriviaDifficulty(item),
      };
    });
  }

  const emojiPrompts = ['😜', '😮', '🤨', '😎', '😭', '😡', '🤯', '🥳', '😴', '😬', '🤠', '😇'];
  const triviaDatabase = buildTriviaDatabase();
  let triviaHistory = getStoredJson('rtaTriviaHistory', {});
  let scavengerHistory = getStoredJson('rtaScavengerHistory', {});
  let adventureHistory = getStoredJson('rtaAdventureHistory', {});
  const defaultTripSettings = {
    gameLength: 'long',
    tripPreset: 'any',
    ageGroup: 'mixed',
    quietCar: false,
    noCameraGames: false,
    noPopCulture: false,
    hardTrivia: false,
  };
  const tripPresets = {
    any: { label: 'Any Route', themes: ['mixed'] },
    city: { label: 'City Drive', themes: ['places', 'signs', 'easy'] },
    highway: { label: 'Highway', themes: ['vehicles', 'signs', 'easy'] },
    desert: { label: 'Desert', themes: ['nature', 'signs', 'weird'] },
    mountains: { label: 'Mountains', themes: ['nature', 'signs', 'jackpot'] },
    smalltown: { label: 'Small Towns', themes: ['places', 'weird', 'signs'] },
    'alaska-train': { label: 'Alaska Train', themes: ['alaska-train', 'nature', 'signs'] },
    rainy: { label: 'Rainy Day', themes: ['signs', 'vehicles', 'easy'] },
    night: { label: 'Night Drive', themes: ['signs', 'places', 'easy'] },
  };
  let tripSettings = Object.assign({}, defaultTripSettings, getStoredJson('rtaTripSettings', {}));

  // Application state
  let selectedAge = tripSettings.ageGroup || 'mixed';
  let selectedCategory = null;
  let selectedLearnTopic = getStoredJson('rtaLastLearnTopic', 'all');
  let regionCode = null; // Optional region code for local questions
  let currentSectionKey = null;
  let sectionHistory = [];
  let syncingBrowserHistory = false;
  let players = [
    { id: 'p1', name: 'P1' },
    { id: 'p2', name: 'P2' },
  ];
  let carJudgeId = getStoredJson('rtaCarJudgeId', '');
  let adventureQuestions = [];
  let currentIndex = 0;
  let timerInterval = null;
  let timerRemaining = 0;
  let triviaDeck = [];
  let triviaIndex = 0;
  let triviaScore = {};
  let activeTriviaCategory = getStoredJson('rtaLastTriviaCategory', 'mixed');
  let activeTriviaDifficulty = getStoredJson('rtaLastTriviaDifficulty', 'medium');
  let triviaQuestionAwarded = false;
  let jokeAwards = { dad: 0, mom: 0, brother: 0, sister: 0 };
  let jokeRound = 1;
  let jokeDecks = { dad: [], mom: [], brother: [], sister: [] };
  let twentyGuessAnswers = {};
  let twentyGuessAsked = new Set();
  let twentyGuessLog = [];
  let twentyGuessTurns = 0;
  let twentyGuessRejected = [];
  let twentyComputerObject = null;
  let twentyComputerTurns = 0;
  let twentyComputerAsked = [];
  let lightningDeck = [];
  let alphabetTheme = null;
  let alphabetIndex = 0;
  let hideSeekRound = 0;
  let hideSeekTimerInterval = null;
  let hideSeekAnimationFrame = null;
  let hideSeekLastFrame = 0;
  let hideSeekAudioContext = null;
  let hideSeekDebugEnabled = getStoredJson('rtaHideSeekDebug', false);
  // Computer Mode / Debug Mode working data (kept module-scoped so round resets
  // do not wipe it; cleared explicitly on navigation or via "Clear Debug").
  let hideSeekSelectedSpotId = null;
  let hideSeekRevealHidden = false;
  const hideSeekDebug = { lastTapRaw: null, lastTapCanvas: null, cycleIndex: -1, lastInspect: null, log: [] };
  // Solo vs Computer (single-player AI). The human is always player index 0; the
  // computer plays whichever role the human is not, alternating each round.
  let hideSeekSoloEnabled = getStoredJson('rtaHideSeekSolo', false);
  const HIDE_SEEK_HUMAN_INDEX = 0;
  const hideSeekAI = { thinkTimer: 0, lastRoom: null };
  let hideSeekLastCanvasTap = null;
  let hideSeekActiveCanvasPointerId = null;
  const HIDE_SEEK_HIDE_SECONDS = 60;
  const HIDE_SEEK_SEARCH_COUNTS = {
    easy: 10,
    normal: 8,
    hard: 6,
  };
  const HIDE_SEEK_AI_PROFILES = {
    easy: {
      thinkDelay: 1.1,
      prefersNoise: 0.25,
      prefersDifficulty: 0.2,
      mistakeChance: 0.25,
      roomDistance: 0.15,
    },
    normal: {
      thinkDelay: 0.75,
      prefersNoise: 0.45,
      prefersDifficulty: 0.45,
      mistakeChance: 0.12,
      roomDistance: 0.35,
    },
    hard: {
      thinkDelay: 0.45,
      prefersNoise: 0.75,
      prefersDifficulty: 0.75,
      mistakeChance: 0.04,
      roomDistance: 0.62,
    },
  };
  const HIDE_SEEK_DEFAULT_DIFFICULTY = 'normal';
  const HIDE_SEEK_SEARCH_TOLERANCE = 51;
  const HIDE_SEEK_INSPECT_SECONDS = 1.1;
  const HIDE_SEEK_MAX_STAMINA = 100;
  const HIDE_SEEK_SPRINT_SPEED_MULTIPLIER = 1.45;
  const HIDE_SEEK_DOUBLE_TAP_MS = 360;
  const HIDE_SEEK_DOUBLE_TAP_RADIUS = 44;

  function getHideSeekSearchCount(difficulty) {
    return HIDE_SEEK_SEARCH_COUNTS[difficulty] || HIDE_SEEK_SEARCH_COUNTS[HIDE_SEEK_DEFAULT_DIFFICULTY];
  }

  let hideSeekState = {
    mode: 'roadside-lodge',
    difficulty: HIDE_SEEK_DEFAULT_DIFFICULTY,
    winnerGoal: '5',
    hiderIndex: 0,
    seekerIndex: 1,
    phase: 'TITLE',
    hiddenSpotId: null,
    hiddenSpotLabel: '',
    hiddenPosition: null,
    hiddenCoverQuality: 1,
    hiddenCoverLabel: 'Risky',
    spotStates: {},
    noiseLevel: 0,
    stamina: HIDE_SEEK_MAX_STAMINA,
    inspectedSpotId: null,
    inspectTime: 0,
    inspectionCount: 0,
    repeatInspectionCount: 0,
    peekCount: 0,
    activeRoomId: 'lobby',
    searchesRemaining: getHideSeekSearchCount(HIDE_SEEK_DEFAULT_DIFFICULTY),
    hiderTimeRemaining: HIDE_SEEK_HIDE_SECONDS,
    wrongGuesses: 0,
    listenUsed: false,
    roundMedal: '',
    lastClue: '',
    roundHiderScore: 0,
    roundSeekerScore: 0,
    lastRoundText: '',
    message: '',
    hideScore: {},
    actors: {
      hider: { x: 180, y: 458, width: 36, height: 48, speed: 225, roomId: 'lobby', visible: true, color: '#2ec7d3' },
      seeker: { x: 180, y: 458, width: 36, height: 48, speed: 225, roomId: 'lobby', visible: false, color: '#f58220' },
    },
    input: { up: false, down: false, left: false, right: false, sprint: false },
    revealPulse: 0,
    searchPulse: null,
    roomTrail: [],
    particles: [],
    cameraShake: 0,
    coverGlowPulse: 0,
    lastUrgentSecond: null,
  };
  let huntDeck = [];
  let activeHuntIds = [];
  let activeHuntTheme = getStoredJson('rtaHuntTheme', 'mixed');
  let emojiIndex = 0;
  let emojiScore = {};
  let emojiFaceAwarded = false;
  let emojiStream = null;
  let piScore = {};
  const pongData = window.RTA_PONG_DATA || {};
  const defaultPongSettings = pongData.defaultSettings || {
    opponentMode: 'computer',
    difficulty: 'normal',
  };
  let pongSettings = Object.assign({}, defaultPongSettings, getStoredJson('rtaPongSettings', {}));
  let pongAnimationFrame = null;
  let pongRunning = false;
  let pongKeys = {};
  let pongState = null;
  let pongPointerSides = {};
  let pongDebugEnabled = getStoredJson('rtaPongDebug', false);
  let pongPointerDebug = null;
  let gorillasAnimationFrame = null;
  let gorillasRunning = false;
  let gorillasState = null;
  let gorillasTurn = 0;
  let gorillasLastFrameTs = 0;
  let gorillasBuildingLayer = null;
  let gorillasSettings = Object.assign({
    opponent: 'local',
    match: '3',
    difficulty: 'normal',
    debug: false,
  }, getStoredJson('rtaGorillasSettings', {}));
  let gorillasComputerTimer = null;
  let logoClickCount = 0;
  let logoClickTimer = null;
  let secretUnlockStep = 0;
  let activeSecretUnlockQuestions = [];
  let activeSecretMode = 'default';
  const secretUnlockQuestionPool = [
    'The car council must choose a secret password from something visible inside the car right now. What password did you choose?',
    'Find the next readable sign outside. Type the weirdest word on it, then have the car repeat it dramatically.',
    'Everyone points to the most suspicious loose object in the car. What object won the vote?',
    'Create a fake band name using the color of something nearby and the last thing you passed outside. What is the band name?',
    'One passenger makes a silent face that matches the current mood of the car. What emotion did the group guess?',
    'Name the next thing outside that looks like it has a secret backstory. What did the group call it?',
    'Everyone predicts the next vehicle color before looking too hard. What color did the first clear vehicle turn out to be?',
    'Choose the passenger most likely to survive a snack shortage. Type their initials and have the group approve.',
  ];
  const secretModeConfigs = {
    default: {
      title: 'Secret Mode',
      intro: 'Unlock requires answers only this car can know. No searching, no AI, no driver help.',
      badge: 'Locked',
      questions: secretUnlockQuestionPool,
      unlockTitle: 'The vault opens.',
      unlockText: 'Your reward is ready. Play it loud enough for the passengers, not the driver.',
      videoSrc: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0',
    },
  };
  let score = {
    look: 0,
    laugh: 0,
    learn: 0,
    compete: 0,
    local: 0,
  };

  // DOM references
  const body = document.body;
  const loadingScreen = document.getElementById('loading-screen');
  const driverCheckText = document.getElementById('driver-check-text');
  const passengerConfirmButton = document.getElementById('passenger-confirm');
  const accessibilityToggle = document.getElementById('accessibility-toggle');
  const backButton = document.getElementById('back-button');
  const homeButton = document.getElementById('home-button');
  const accessibilityPanel = document.getElementById('accessibility-panel');
  const closeAccessibility = document.getElementById('close-accessibility');
  const optionLargeText = document.getElementById('option-large-text');
  const optionHighContrast = document.getElementById('option-high-contrast');
  const optionReduceMotion = document.getElementById('option-reduce-motion');
  const sections = {
    players: document.getElementById('setup-teams'),
    category: document.getElementById('setup-category'),
    rules: document.getElementById('mode-rules'),
    settings: document.getElementById('trip-settings'),
    learnTopics: document.getElementById('learn-topics'),
    region: document.getElementById('setup-region'),
    adventure: document.getElementById('adventure'),
    scavenger: document.getElementById('scavenger'),
    trivia: document.getElementById('trivia'),
    jokes: document.getElementById('jokes'),
    emoji: document.getElementById('emoji-game'),
    hideSeek: document.getElementById('hide-seek-game'),
    calculator: document.getElementById('trip-calculator'),
    pi: document.getElementById('pi-game'),
    pong: document.getElementById('pong-game'),
    gorillas: document.getElementById('gorillas-game'),
    puns: document.getElementById('pun-game'),
    mentalist: document.getElementById('mentalist'),
    admin: document.getElementById('admin-mode'),
    secret: document.getElementById('secret-mode'),
    summary: document.getElementById('summary'),
  };
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const stampTrail = document.getElementById('stamp-trail');
  const challengeContainer = document.getElementById('challenge-container');
  const timerElement = document.getElementById('timer');
  const nextButton = document.getElementById('next-challenge');
  const extendTimerButton = document.getElementById('extend-timer');
  const skipTimerButton = document.getElementById('skip-timer');
  const summaryText = document.getElementById('summary-text');
  const summaryList = document.getElementById('summary-list');
  const playerFields = document.getElementById('player-fields');
  const carJudgeSelect = document.getElementById('car-judge');
  const addPlayerButton = document.getElementById('add-player');
  const removePlayerButton = document.getElementById('remove-player');
  const saveTeamsButton = document.getElementById('save-teams');
  const openTripSettingsButton = document.getElementById('open-trip-settings');
  const modeRulesType = document.getElementById('mode-rules-type');
  const modeRulesHeading = document.getElementById('mode-rules-heading');
  const modeRulesSummary = document.getElementById('mode-rules-summary');
  const modeRulesList = document.getElementById('mode-rules-list');
  const modeRulesStartButton = document.getElementById('mode-rules-start');
  const modeRulesBackButton = document.getElementById('mode-rules-back');
  const settingGameLength = document.getElementById('setting-game-length');
  const settingTripPreset = document.getElementById('setting-trip-preset');
  const settingAgeGroup = document.getElementById('setting-age-group');
  const settingQuietCar = document.getElementById('setting-quiet-car');
  const settingNoCamera = document.getElementById('setting-no-camera');
  const settingNoPopCulture = document.getElementById('setting-no-pop-culture');
  const settingHardTrivia = document.getElementById('setting-hard-trivia');
  const saveTripSettingsButton = document.getElementById('save-trip-settings');
  const closeTripSettingsButton = document.getElementById('close-trip-settings');
  const learnTopicGrid = document.getElementById('learn-topic-grid');
  const huntGrid = document.getElementById('hunt-grid');
  const huntStatus = document.getElementById('hunt-status');
  const huntScoreboard = document.getElementById('hunt-scoreboard');
  const huntRoute = document.getElementById('hunt-route');
  const huntThemeButtons = document.getElementById('hunt-theme-buttons');
  const drawHuntTargetsButton = document.getElementById('draw-hunt-targets');
  const resetHuntButton = document.getElementById('reset-hunt');
  const finishHuntButton = document.getElementById('finish-hunt');
  const huntLightningButton = document.getElementById('hunt-lightning');
  const huntTwentyButton = document.getElementById('hunt-twenty');
  const huntAlphabetButton = document.getElementById('hunt-alphabet');
  const huntEtaButton = document.getElementById('hunt-eta');
  const huntSideGame = document.getElementById('hunt-side-game');
  const sideGameLabel = document.getElementById('side-game-label');
  const sideGameTitle = document.getElementById('side-game-title');
  const sideGameText = document.getElementById('side-game-text');
  const sideGameActions = document.getElementById('side-game-actions');
  const triviaDifficultyButtons = document.getElementById('trivia-difficulty-buttons');
  const triviaIntro = document.getElementById('trivia-intro');
  const triviaCategoryGrid = document.getElementById('trivia-category-grid');
  const triviaPlay = document.getElementById('trivia-play');
  const triviaScoreboard = document.getElementById('trivia-scoreboard');
  const triviaCategoryLabel = document.getElementById('trivia-category-label');
  const triviaHandoff = document.getElementById('trivia-handoff');
  const triviaQuestion = document.getElementById('trivia-question');
  const triviaChoices = document.getElementById('trivia-choices');
  const triviaAnswer = document.getElementById('trivia-answer');
  const showTriviaAnswerButton = document.getElementById('show-trivia-answer');
  const triviaAwardButtons = document.getElementById('trivia-award-buttons');
  const nextTriviaButton = document.getElementById('next-trivia');
  const finishTriviaButton = document.getElementById('finish-trivia');
  const jokeRoundElement = document.getElementById('joke-round');
  const jokeDad = document.getElementById('joke-dad');
  const jokeMom = document.getElementById('joke-mom');
  const jokeBrother = document.getElementById('joke-brother');
  const jokeSister = document.getElementById('joke-sister');
  const jokeAward = document.getElementById('joke-award');
  const dadJokeAwardButton = document.getElementById('dad-joke-award');
  const momJokeAwardButton = document.getElementById('mom-joke-award');
  const brotherJokeAwardButton = document.getElementById('brother-joke-award');
  const sisterJokeAwardButton = document.getElementById('sister-joke-award');
  const nextJokesButton = document.getElementById('next-jokes');
  const finishJokesButton = document.getElementById('finish-jokes');
  const punInput = document.getElementById('pun-input');
  const punGenerateButton = document.getElementById('pun-generate');
  const punMoreButton = document.getElementById('pun-more');
  const punOutput = document.getElementById('pun-output');
  const mentalistStage = document.getElementById('mentalist-stage');
  const emojiIntro = document.getElementById('emoji-intro');
  const emojiTarget = document.getElementById('emoji-target');
  const emojiVideo = document.getElementById('emoji-video');
  const emojiCanvas = document.getElementById('emoji-canvas');
  const emojiCameraMessage = document.getElementById('emoji-camera-message');
  const emojiScoreboard = document.getElementById('emoji-scoreboard');
  const startCameraButton = document.getElementById('start-camera');
  const captureEmojiButton = document.getElementById('capture-emoji');
  const emojiAwardButtons = document.getElementById('emoji-award-buttons');
  const nextEmojiButton = document.getElementById('next-emoji');
  const finishEmojiButton = document.getElementById('finish-emoji');
  const hideSeekScoreboard = document.getElementById('hide-seek-scoreboard');
  const hideSeekBadge = document.getElementById('hide-seek-badge');
  const hideSeekStatus = document.getElementById('hide-seek-status');
  const hideSeekMode = document.getElementById('hide-seek-mode');
  const hideSeekCountdown = document.getElementById('hide-seek-countdown');
  const hideSeekWinner = document.getElementById('hide-seek-winner');
  const hideSeekPhase = document.getElementById('hide-seek-phase');
  const hideSeekRoundTitle = document.getElementById('hide-seek-round-title');
  const hideSeekRoundText = document.getElementById('hide-seek-round-text');
  const hideSeekCountdownText = document.getElementById('hide-seek-countdown-text');
  const hideSeekMeta = document.getElementById('hide-seek-meta');
  const hideSeekCanvas = document.getElementById('hide-seek-canvas');
  const hideSeekCanvasContext = hideSeekCanvas ? hideSeekCanvas.getContext('2d') : null;
  const hideSeekOverlay = document.getElementById('hide-seek-overlay');
  const hideSeekStartButton = document.getElementById('hide-seek-start');
  const hideSeekFoundButton = document.getElementById('hide-seek-found');
  const hideSeekSpecialButton = document.getElementById('hide-seek-special');
  const hideSeekSprintButton = document.getElementById('hide-seek-sprint');
  const hideSeekNextButton = document.getElementById('hide-seek-next');
  const hideSeekDebugButton = document.getElementById('hide-seek-debug');
  const hideSeekSoloButton = document.getElementById('hide-seek-solo');
  const hideSeekControls = document.querySelector('.hide-seek-controls');
  const hideSeekDebugPanel = document.getElementById('hide-seek-debug-panel');
  const hideSeekDebugReadout = document.getElementById('hide-seek-debug-readout');
  const hideSeekDebugLogEl = document.getElementById('hide-seek-debug-log');
  const hideSeekAutoHideButton = document.getElementById('hide-seek-auto-hide');
  const hideSeekRevealButton = document.getElementById('hide-seek-reveal');
  const hideSeekNextSpotButton = document.getElementById('hide-seek-next-spot');
  const hideSeekTestSpotsButton = document.getElementById('hide-seek-test-spots');
  const hideSeekClearDebugButton = document.getElementById('hide-seek-clear-debug');
  const hideSeekFullscreenButton = document.getElementById('hide-seek-fullscreen');
  const hideSeekRotateOverlay = document.getElementById('hide-seek-rotate');
  const hideSeekResetButton = document.getElementById('hide-seek-reset');
  const hideSeekFinishButton = document.getElementById('hide-seek-finish');
  const calcMiles = document.getElementById('calc-miles');
  const calcSpeedA = document.getElementById('calc-speed-a');
  const calcSpeedB = document.getElementById('calc-speed-b');
  const calculatorResult = document.getElementById('calculator-result');
  const calculateTripButton = document.getElementById('calculate-trip');
  const calculatorSwapButton = document.getElementById('calculator-swap');
  const piScoreboard = document.getElementById('pi-scoreboard');
  const piIntro = document.getElementById('pi-intro');
  const piEntryGrid = document.getElementById('pi-entry-grid');
  const savePiScoresButton = document.getElementById('save-pi-scores');
  const finishPiButton = document.getElementById('finish-pi');
  const pongCanvas = document.getElementById('pong-canvas');
  const pongScore = document.getElementById('pong-score');
  const pongStatus = document.getElementById('pong-status');
  const pongOpponentButtons = document.getElementById('pong-opponent-buttons');
  const pongDifficultyButtons = document.getElementById('pong-difficulty-buttons');
  const pongStartButton = document.getElementById('pong-start');
  const pongFullscreenButton = document.getElementById('pong-fullscreen');
  const pongImmersiveExitButton = document.getElementById('pong-immersive-exit');
  const pongDebugButton = document.getElementById('pong-debug');
  const pongResetButton = document.getElementById('pong-reset');
  const pongFinishButton = document.getElementById('pong-finish');
  const gorillasCanvas = document.getElementById('gorillas-canvas');
  const gorillasScore = document.getElementById('gorillas-score');
  const gorillasStatus = document.getElementById('gorillas-status');
  const gorillasAngle = document.getElementById('gorillas-angle');
  const gorillasPower = document.getElementById('gorillas-power');
  const gorillasOpponent = document.getElementById('gorillas-opponent');
  const gorillasMatch = document.getElementById('gorillas-match');
  const gorillasDifficulty = document.getElementById('gorillas-difficulty');
  const gorillasShotSummary = document.getElementById('gorillas-shot-summary');
  const gorillasShotHistory = document.getElementById('gorillas-shot-history');
  const gorillasFireButton = document.getElementById('gorillas-fire');
  const gorillasQuickShotButton = document.getElementById('gorillas-quick-shot');
  const gorillasFullscreenButton = document.getElementById('gorillas-fullscreen');
  const gorillasDebugButton = document.getElementById('gorillas-debug');
  const gorillasImmersiveExitButton = document.getElementById('gorillas-immersive-exit');
  const gorillasResetButton = document.getElementById('gorillas-reset');
  const gorillasFinishButton = document.getElementById('gorillas-finish');
  const appLogo = document.querySelector('.app-logo');
  const adminCounts = document.getElementById('admin-counts');
  const logoPrank = document.getElementById('logo-prank');
  const closeLogoPrankButton = document.getElementById('close-logo-prank');
  const secretProgress = document.getElementById('secret-progress');
  const secretHeading = document.getElementById('secret-heading');
  const secretIntro = document.getElementById('secret-intro');
  const secretHandoff = document.getElementById('secret-handoff');
  const secretQuestion = document.getElementById('secret-question');
  const secretInstructions = document.getElementById('secret-instructions');
  const secretAnswerField = document.getElementById('secret-answer-field');
  const secretAnswer = document.getElementById('secret-answer');
  const secretStatus = document.getElementById('secret-status');
  const secretVideoWrap = document.getElementById('secret-video-wrap');
  const secretVideo = document.getElementById('secret-video');
  const secretSubmitButton = document.getElementById('secret-submit');
  const secretSkipButton = document.getElementById('secret-skip');
  const secretResetButton = document.getElementById('secret-reset');
  const playAgainButton = document.getElementById('play-again');
  const startOverButton = document.getElementById('start-over');
  const aboutButton = document.getElementById('about-button');
  const aboutModal = document.getElementById('about-modal');
  const closeAbout = document.getElementById('close-about');
  const feedbackButton = document.getElementById('feedback-button');
  const feedbackModal = document.getElementById('feedback-modal');
  const feedbackText = document.getElementById('feedback-text');
  const feedbackDeviceInfo = document.getElementById('feedback-device-info');
  const feedbackStatus = document.getElementById('feedback-status');
  const copyFeedbackButton = document.getElementById('copy-feedback');
  const closeFeedbackButton = document.getElementById('close-feedback');

  function getDefaultPlayerInitials(index) {
    return `P${index + 1}`;
  }

  function normalizePlayerInitials(value, index) {
    const rawValue = String(value || '').trim();
    if (/^player\s+\d+$/i.test(rawValue)) {
      return getDefaultPlayerInitials(index);
    }
    const initials = rawValue.replace(/\s+/g, '').toUpperCase().slice(0, 4);
    return initials || getDefaultPlayerInitials(index);
  }

  function normalizeCategoryKey(category) {
    const value = String(category || '').trim();
    if (['hideSeek', 'hideseek', 'hide-seek', 'hide_seek'].includes(value)) return 'hideSeek';
    if (['banana-towers', 'bananaTowers', 'gorilla', 'gorillas'].includes(value)) return 'gorillas';
    return value;
  }

  const modeRuleCards = {
    look: {
      title: 'Window Quests',
      type: 'Just for fun',
      scored: false,
      summary: 'Quick prompts that get everyone looking outside instead of staring down.',
      bestWhen: 'Best when everyone can safely see outside.',
      rules: [
        'Read each prompt aloud.',
        'Everyone looks outside or answers together.',
        'Tap Stamp It when the car has tried it. No winner needed.',
      ],
    },
    local: {
      title: 'Local Explorer',
      type: 'Just for fun',
      scored: false,
      summary: 'Manual region prompts. No GPS, no location sensors, no tracking.',
      bestWhen: 'Best when someone wants to read a fact or challenge aloud.',
      rules: [
        'Choose the region yourself.',
        'Read each local prompt aloud.',
        'Complete prompts together and move on when the car is ready.',
      ],
    },
    scavenger: {
      title: 'Scavenger Hunt',
      type: 'Scored Game',
      scored: true,
      summary: 'Keep a tight target list active and call real finds before someone else does.',
      bestWhen: 'Best when passengers want an active scored game.',
      rules: [
        'The app shows 4 or 5 targets at a time.',
        'First player to clearly spot a target gets 1 point.',
        'Call only things the whole car can verify quickly.',
        'A judge can settle close calls. First to the milestone unlocks karaoke power.',
      ],
    },
    learn: {
      title: 'Learn Something',
      type: 'Just for fun',
      scored: false,
      summary: 'Short facts and mini-lessons to pass around the car.',
      bestWhen: 'Best for quiet cars, night drives, and curious readers.',
      rules: [
        'Pick a topic lane.',
        'Pass the phone and read the fact aloud.',
        'No points. The goal is to make the next mile a little smarter.',
      ],
    },
    trivia: {
      title: 'Trivia Run',
      type: 'Scored Game',
      scored: true,
      summary: 'Turn-based multiple choice trivia with a cleaner category lane and automatic scoring.',
      bestWhen: 'Best when someone wants to read questions aloud.',
      rules: [
        'The app names whose turn it is.',
        'That player chooses an answer. Correct picks score automatically.',
        'Use difficulty to control how deep the deck gets, not just how obscure the topic sounds.',
        'Use override points only when the car judge needs to fix a mistake.',
      ],
    },
    pi: {
      title: 'Pi Digits',
      type: 'Scored Game',
      scored: true,
      summary: 'Players recite pi and enter how many digits they got right.',
      rules: [
        'Take turns reciting digits after 3.14.',
        'Use the starter line as the judge key.',
        'Highest correct digit count wins.',
      ],
    },
    calculator: {
      title: 'Trip Calculator',
      type: 'Tool',
      scored: false,
      summary: 'Compare how long the same distance takes at two steady speeds.',
      rules: [
        'Enter miles left.',
        'Compare two speeds.',
        'Use it as road math, not a driving recommendation.',
      ],
    },
    jokes: {
      title: 'Family Joke Vote',
      type: 'Just for fun',
      scored: false,
      summary: 'Read a Dad, Mom, Brother, and Sister joke each round and rate the laughs.',
      bestWhen: 'Best when the car wants quick laughs.',
      rules: [
        'Read each joke out loud.',
        'Tap whoever got the bigger laugh.',
        'It always ends in a tie \u2014 everybody wins the laugh.',
      ],
    },
    puns: {
      title: 'Pun Generator',
      type: 'Tool',
      scored: false,
      summary: 'Type any word and get a batch of silly puns to read aloud.',
      rules: [
        'Type a word into the box.',
        'Tap Make Puns to get a fresh batch.',
        'Tap More Puns for another round of groaners.',
      ],
    },
    twenty: {
      title: '20 Questions',
      type: 'Just for fun',
      scored: false,
      summary: 'Think of any thing and the app tries to guess it, or let the computer hide a secret for you to guess.',
      bestWhen: 'Best when one passenger can hold the secret and everyone else can look away.',
      rules: [
        'Pass the phone to the secret keeper. Only they should look until guessing starts.',
        'Pick who hides the secret thing.',
        'Answer each question Yes, No, Sometimes, Maybe, or Unknown.',
        'The guesser gets up to 20 questions to figure it out.',
      ],
    },
    mentalist: {
      title: 'Road Trip Mentalist',
      type: 'Just for fun',
      scored: false,
      summary: 'Magic-style mind tricks powered by sneaky math, not real psychic powers.',
      rules: [
        'Pick a trick and follow the steps.',
        'Think of your secret number, card, or choice.',
        'Let the app reveal what is in your head.',
      ],
    },
    emoji: {
      title: 'Emoji Face-Off',
      type: 'Scored Game',
      scored: true,
      summary: 'Players copy an emoji face and the car votes for the closest match.',
      bestWhen: 'Best when passengers are settled and camera play feels comfortable.',
      rules: [
        'Camera is optional and stays on this device.',
        'Snap a face or just act it out.',
        'Tap the player who wins each face-off.',
      ],
    },
    hideSeek: {
      title: 'Hide & Seek',
      type: 'Scored Party Game',
      scored: true,
      summary: 'A local room-search game where hiders choose secret spots and seekers inspect the map.',
      bestWhen: 'Best when two players can safely pass the phone.',
      rules: [
        'Choose a map, search timer, and match length.',
        'Pass the phone to the hider first. Only the hider should look.',
        'Then pass the phone to the seeker. Everyone else looks away from the secret.',
        'The seeker inspects hiding spots. Wrong guesses cost time.',
        'Roles rotate each round and both hiding and seeking earn points.',
      ],
    },
    random: {
      title: 'Surprise Me',
      type: 'Mixed',
      scored: false,
      summary: 'A mixed prompt run for when nobody wants to pick a mode.',
      bestWhen: 'Best when the car needs instant momentum.',
      rules: [
        'The app mixes looking, laughing, learning, and quick challenges.',
        'Prompts are completed, not scored.',
        'Use this when the car needs instant momentum.',
      ],
    },
    pong: {
      title: 'Road Pong',
      type: 'Scored Game',
      scored: true,
      summary: 'Quick arcade break with touch controls on the canvas and optional keyboard backup.',
      bestWhen: 'Best when one or two passengers want a fast arcade round.',
      rules: [
        'Choose local player or computer before starting.',
        'Pick a difficulty from easy to death match.',
        'Move paddles by dragging on the canvas. Keyboard backup works too.',
        'First side to the target score wins.',
        'Death Match AI is meant to be nearly impossible to beat.',
      ],
    },
    gorillas: {
      title: 'Banana Towers',
      type: 'Scored Game',
      scored: true,
      summary: 'A turn-based banana toss duel where angle, wind, and skyline all matter.',
      bestWhen: 'Best in landscape with two passengers sharing turns.',
      rules: [
        'Each player chooses an angle and power on their turn.',
        'The banana arcs over the buildings and can hit the opponent.',
        'Wait for the banana to land before the next player throws.',
        'Bananas blast a crater out of a building and can fly through gaps they made.',
        'Clip your own tower and your opponent wins.',
        'Hit the other gorilla directly to win the match instantly.',
      ],
    },
  };

  // Initialise preferences and UI
  function initPreferences() {
    // Apply saved preferences
    const large = getPreference('largeText', false);
    const contrast = getPreference('highContrast', false);
    const reduce = getPreference('reduceMotion', false);
    if (large) body.classList.add('large-text');
    if (contrast) body.classList.add('high-contrast');
    if (reduce) body.classList.add('reduce-motion');
    optionLargeText.checked = large;
    optionHighContrast.checked = contrast;
    optionReduceMotion.checked = reduce;
  }

  function normalizeTripSettings(settings) {
    const merged = Object.assign({}, defaultTripSettings, settings || {});
    merged.gameLength = merged.gameLength === 'short' ? 'short' : 'long';
    merged.tripPreset = tripPresets[merged.tripPreset] ? merged.tripPreset : 'any';
    merged.ageGroup = ['kids', 'mixed', 'teens'].includes(merged.ageGroup) ? merged.ageGroup : 'mixed';
    merged.quietCar = Boolean(merged.quietCar);
    merged.noCameraGames = Boolean(merged.noCameraGames);
    merged.noPopCulture = Boolean(merged.noPopCulture);
    merged.hardTrivia = Boolean(merged.hardTrivia);
    return merged;
  }

  function populateTripSettingsForm() {
    tripSettings = normalizeTripSettings(tripSettings);
    settingGameLength.value = tripSettings.gameLength;
    settingTripPreset.value = tripSettings.tripPreset;
    settingAgeGroup.value = tripSettings.ageGroup;
    settingQuietCar.checked = tripSettings.quietCar;
    settingNoCamera.checked = tripSettings.noCameraGames;
    settingNoPopCulture.checked = tripSettings.noPopCulture;
    settingHardTrivia.checked = tripSettings.hardTrivia;
  }

  function saveTripSettings() {
    tripSettings = normalizeTripSettings({
      gameLength: settingGameLength.value,
      tripPreset: settingTripPreset.value,
      ageGroup: settingAgeGroup.value,
      quietCar: settingQuietCar.checked,
      noCameraGames: settingNoCamera.checked,
      noPopCulture: settingNoPopCulture.checked,
      hardTrivia: settingHardTrivia.checked,
    });
    setStoredJson('rtaTripSettings', tripSettings);
    applyTripSettings();
    showSection('category');
  }

  function applyTripSettings() {
    tripSettings = normalizeTripSettings(tripSettings);
    selectedAge = tripSettings.ageGroup;
    const emojiButton = document.querySelector('[data-category="emoji"]');
    if (emojiButton) {
      emojiButton.hidden = tripSettings.noCameraGames || tripSettings.quietCar;
      emojiButton.disabled = tripSettings.noCameraGames || tripSettings.quietCar;
    }
    if (tripSettings.hardTrivia) {
      activeTriviaDifficulty = 'hard';
      setStoredJson('rtaLastTriviaDifficulty', activeTriviaDifficulty);
    } else if (activeTriviaDifficulty === 'hard' && getStoredJson('rtaLastTriviaDifficulty', 'medium') === 'hard') {
      activeTriviaDifficulty = 'medium';
      setStoredJson('rtaLastTriviaDifficulty', activeTriviaDifficulty);
    }
    renderTriviaDifficultyButtons();
  }

  function initSavedUserData() {
    const savedPlayers = getStoredJson('rtaPlayers', null);
    if (Array.isArray(savedPlayers) && savedPlayers.length >= 2) {
      players = savedPlayers.slice(0, 8).map((player, index) => ({
        id: `p${index + 1}`,
        name: normalizePlayerInitials(player.name, index),
      }));
    }
    if (carJudgeId && !players.some(player => player.id === carJudgeId)) {
      carJudgeId = '';
      setStoredJson('rtaCarJudgeId', carJudgeId);
    }
  }

  let passengerConfirmStep = 0;

  function confirmPassengerStatus() {
    passengerConfirmStep++;
    if (passengerConfirmStep === 1) {
      driverCheckText.textContent = 'Are you sure you are not the driver? Drivers get road, passengers get buttons.';
      passengerConfirmButton.textContent = 'Yes, I am definitely not driving';
      passengerConfirmButton.focus();
      return;
    }

    loadingScreen.style.display = 'none';
    showSection('players');
  }

  function updateNavigationControls() {
    backButton.hidden = sectionHistory.length === 0;
  }

  function syncBrowserHistory(key, replace = false) {
    if (syncingBrowserHistory || !key || !window.history || !window.history.pushState) return;
    const state = {
      rta: true,
      sectionKey: key,
      sectionHistory: sectionHistory.slice(),
    };
    if (replace || !window.history.state || !window.history.state.rta) {
      window.history.replaceState(state, '', window.location.href);
    } else {
      window.history.pushState(state, '', window.location.href);
    }
  }

  function showSection(key, options = {}) {
    if (currentSectionKey === 'adventure' && key !== 'adventure') stopTimer();
    if (currentSectionKey === 'emoji' && key !== 'emoji') stopEmojiCamera();
    if (currentSectionKey === 'pong' && key !== 'pong') stopPong();
    if (currentSectionKey === 'gorillas' && key !== 'gorillas') stopGorillas();
    if (currentSectionKey === 'hideSeek' && key !== 'hideSeek') stopHideSeekTimer();
    if (currentSectionKey && currentSectionKey !== key) clearPseudoFullscreen();
    if (!options.replace && currentSectionKey && currentSectionKey !== key) {
      sectionHistory.push(currentSectionKey);
    }
    Object.values(sections).forEach(sec => {
      sec.hidden = true;
    });
    const section = sections[key];
    if (section) {
      currentSectionKey = key;
      section.hidden = false;
      updateNavigationControls();
      // Move focus to the new section heading for screen readers
      const heading = section.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
      if (!options.skipBrowserHistory) {
        syncBrowserHistory(key, Boolean(options.replace));
      }
    }
  }

  function goBack() {
    if (!sectionHistory.length) return;
    if (window.history && window.history.state && window.history.state.rta) {
      window.history.back();
      return;
    }
    const previous = sectionHistory.pop();
    showSection(previous, { replace: true });
  }

  function goHome() {
    stopEmojiCamera();
    stopPong();
    stopGorillas();
    stopHideSeekTimer();
    resetGame();
    resetHideSeek();
    resetHunt();
    triviaDeck = [];
    triviaIndex = 0;
    sectionHistory = [];
    showSection('players', { replace: true });
  }

  function renderPlayerFields() {
    playerFields.innerHTML = '';
    players.forEach((player, index) => {
      const label = document.createElement('label');
      label.className = 'team-name-field';
      label.setAttribute('for', `player-name-${index + 1}`);

      const span = document.createElement('span');
      span.textContent = `Player ${index + 1} initials`;

      const input = document.createElement('input');
      input.id = `player-name-${index + 1}`;
      input.type = 'text';
      input.maxLength = 4;
      input.placeholder = getDefaultPlayerInitials(index);
      input.autocomplete = 'off';
      input.autocapitalize = 'characters';
      input.setAttribute('aria-label', `Player ${index + 1} initials for scorekeeping`);
      input.value = normalizePlayerInitials(player.name, index);

      label.appendChild(span);
      label.appendChild(input);
      playerFields.appendChild(label);
    });
    renderCarJudgeOptions();
    addPlayerButton.disabled = players.length >= 8;
    removePlayerButton.disabled = players.length <= 2;
  }

  function renderCarJudgeOptions() {
    carJudgeSelect.innerHTML = '';
    const noJudgeOption = document.createElement('option');
    noJudgeOption.value = '';
    noJudgeOption.textContent = 'No judge';
    carJudgeSelect.appendChild(noJudgeOption);

    players.forEach(player => {
      const option = document.createElement('option');
      option.value = player.id;
      option.textContent = `${player.name} verifies answers`;
      carJudgeSelect.appendChild(option);
    });

    if (!players.some(player => player.id === carJudgeId)) carJudgeId = '';
    carJudgeSelect.value = carJudgeId;
  }

  function savePlayers() {
    const inputs = Array.from(playerFields.querySelectorAll('input'));
    players = inputs.slice(0, 8).map((input, index) => ({
      id: `p${index + 1}`,
      name: normalizePlayerInitials(input.value, index),
    }));
    if (players.length < 2) {
      players.push({ id: 'p2', name: 'P2' });
    }
    carJudgeId = players.some(player => player.id === carJudgeSelect.value) ? carJudgeSelect.value : '';
    setStoredJson('rtaPlayers', players);
    setStoredJson('rtaCarJudgeId', carJudgeId);
    renderCarJudgeOptions();
  }

  function createScoreMap() {
    return players.reduce((scores, player) => {
      scores[player.id] = 0;
      return scores;
    }, {});
  }

  function getPlayerName(playerId) {
    const player = players.find(entry => entry.id === playerId);
    return player ? player.name : 'P?';
  }

  function getTurnPlayerName(turnIndex) {
    if (!players.length) return 'next passenger';
    const player = players[turnIndex % players.length];
    return player ? player.name : 'next passenger';
  }

  function getTurnPlayerId(turnIndex) {
    if (!players.length) return '';
    const player = players[turnIndex % players.length];
    return player ? player.id : '';
  }

  function getCarJudgeNote() {
    if (!carJudgeId) return '';
    return `${getPlayerName(carJudgeId)} verifies answers.`;
  }

  function getHuntMilestone() {
    return tripSettings.gameLength === 'short' ? 6 : 10;
  }

  function getAdventurePromptCount() {
    return tripSettings.gameLength === 'short' ? 6 : 12;
  }

  function getTriviaQuestionLimit() {
    return tripSettings.gameLength === 'short' ? 8 : 15;
  }

  function getJokeRoundLimit() {
    return tripSettings.gameLength === 'short' ? Math.max(2, players.length) : Math.max(5, players.length * 2);
  }

  function getEmojiRoundLimit() {
    return tripSettings.gameLength === 'short' ? Math.max(4, players.length) : Math.max(8, players.length * 2);
  }

  function getTopPlayers(scores) {
    if (!players.length) return [];
    const highScore = Math.max(...players.map(player => scores[player.id] || 0));
    return players.filter(player => (scores[player.id] || 0) === highScore);
  }

  function getWinningPlayers(scores) {
    if (!players.length) return [];
    const highScore = Math.max(...players.map(player => scores[player.id] || 0));
    if (highScore <= 0) return [];
    return players.filter(player => (scores[player.id] || 0) === highScore);
  }

  function formatWinner(leaders, singleWinnerText, tieText) {
    if (!leaders.length) return 'No winner yet';
    return leaders.length > 1 ? tieText : singleWinnerText(leaders[0]);
  }

  function renderScoreboard(container, scores) {
    container.innerHTML = '';
    players.forEach((player, index) => {
      const card = document.createElement('div');
      card.className = `team-score player-score player-${(index % 8) + 1}`;

      const label = document.createElement('span');
      label.className = 'team-label';
      label.textContent = player.name;

      const value = document.createElement('strong');
      value.textContent = scores[player.id] || 0;

      card.appendChild(label);
      card.appendChild(value);
      container.appendChild(card);
    });
  }

  function renderAwardButtons(container, labelSuffix, onAward, disabled = false) {
    container.innerHTML = '';
    players.forEach((player, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `claim-button player-${(index % 8) + 1}`;
      button.textContent = `${player.name} ${labelSuffix}`;
      button.disabled = disabled;
      button.addEventListener('click', () => onAward(player.id));
      container.appendChild(button);
    });
  }

  function matchesAge(question) {
    return question.ageGroups.indexOf('*') !== -1
      || question.ageGroups.indexOf(selectedAge) !== -1
      || (selectedAge === 'teens' && question.ageGroups.indexOf('adults') !== -1)
      || question.ageGroups.indexOf('mixed') !== -1;
  }

  function adventurePromptAllowedBySettings(question) {
    if (!tripSettings.quietCar) return true;
    if (question.category === 'laugh' || question.category === 'compete') return false;
    if (question.requiresTimer) return false;
    return !/(shout|loud|speed|race|fast|speak like|karaoke|commercial|face|perform)/i.test(question.text || '');
  }

  function matchesRegion(question) {
    if (question.regions.indexOf('*') !== -1) return true;
    if (!regionCode || regionCode === '*') return false;
    return question.regions.indexOf(regionCode) !== -1;
  }

  function matchesLearnTopic(question) {
    if (!learnTopics.some(topic => topic.id === selectedLearnTopic)) selectedLearnTopic = 'all';
    return selectedLearnTopic === 'all' || question.learnTopic === selectedLearnTopic;
  }

  function getAdventureHistoryKey(category, topic = '') {
    return `${category || 'mixed'}:${topic || 'all'}:${regionCode || '*'}`;
  }

  function selectAdventurePrompts(pool, count, historyKey) {
    if (!pool.length) return [];
    const used = new Set(adventureHistory[historyKey] || []);
    let available = pool.filter(prompt => !used.has(prompt.id));
    if (!available.length) {
      adventureHistory[historyKey] = [];
      setStoredJson('rtaAdventureHistory', adventureHistory);
      available = pool.slice();
    }
    const selected = shuffle(available.slice()).slice(0, count);
    adventureHistory[historyKey] = adventureHistory[historyKey] || [];
    selected.forEach(prompt => {
      if (!adventureHistory[historyKey].includes(prompt.id)) {
        adventureHistory[historyKey].push(prompt.id);
      }
    });
    setStoredJson('rtaAdventureHistory', adventureHistory);
    return selected;
  }

  function renderLearnTopics() {
    if (!learnTopics.some(topic => topic.id === selectedLearnTopic)) selectedLearnTopic = 'all';
    learnTopicGrid.innerHTML = '';
    learnTopics.forEach(topic => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card trivia-category-card';
      button.dataset.learnTopic = topic.id;

      const icon = document.createElement('span');
      icon.className = 'option-emoji';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = topic.emoji;

      const title = document.createElement('span');
      title.className = 'option-title';
      title.textContent = topic.label;

      button.appendChild(icon);
      button.appendChild(title);
      button.addEventListener('click', () => {
        selectedCategory = 'learn';
        selectedLearnTopic = topic.id;
        setStoredJson('rtaLastLearnTopic', selectedLearnTopic);
        regionCode = '*';
        startAdventure();
      });
      learnTopicGrid.appendChild(button);
    });
  }

  function buildMysteryMix(count) {
    const targets = [
      { category: 'look', count: Math.ceil(count * 0.6) },
      { category: 'learn', count: Math.max(1, Math.floor(count * 0.4)) },
    ];
    const selected = [];
    targets.forEach(target => {
      const pool = shuffle(adventurePromptDatabase.filter(q => matchesAge(q) && adventurePromptAllowedBySettings(q) && q.category === target.category && matchesRegion(q)));
      selected.push(...selectAdventurePrompts(pool, target.count, getAdventureHistoryKey('random', target.category)));
    });
    const selectedIds = selected.map(q => q.id);
    const refill = shuffle(adventurePromptDatabase.filter(q => matchesAge(q) && adventurePromptAllowedBySettings(q) && matchesRegion(q) && selectedIds.indexOf(q.id) === -1));
    const refillCount = Math.max(0, count - selected.length);
    const refillSelected = selectAdventurePrompts(refill, refillCount, getAdventureHistoryKey('random', 'refill'));
    return shuffle(selected.concat(refillSelected)).slice(0, count);
  }

  // Build adventure questions based on selections
  function buildAdventure() {
    const count = getAdventurePromptCount();
    if (selectedCategory === 'random') {
      adventureQuestions = buildMysteryMix(count);
      return;
    }

    let filtered = adventurePromptDatabase.filter(q => (
      matchesAge(q)
      && adventurePromptAllowedBySettings(q)
      && q.category === selectedCategory
      && matchesRegion(q)
      && (selectedCategory !== 'learn' || matchesLearnTopic(q))
    ));

    adventureQuestions = selectAdventurePrompts(
      filtered,
      count,
      getAdventureHistoryKey(selectedCategory, selectedCategory === 'learn' ? selectedLearnTopic : '')
    );
  }

  function updateProgress() {
    const percent = adventureQuestions.length > 0 ? ((currentIndex) / adventureQuestions.length) * 100 : 0;
    progressFill.style.width = `${percent}%`;
    stampTrail.innerHTML = '';
    adventureQuestions.forEach((question, index) => {
      const stamp = document.createElement('span');
      stamp.className = 'stamp';
      if (index < currentIndex) stamp.classList.add('earned');
      stamp.textContent = question.category.charAt(0).toUpperCase();
      stamp.setAttribute('aria-label', `${question.category} quest ${index < currentIndex ? 'complete' : 'not complete'}`);
      stampTrail.appendChild(stamp);
    });
  }

  function hideTimerControls() {
    timerElement.hidden = true;
    extendTimerButton.hidden = true;
    skipTimerButton.hidden = true;
  }

  function stopTimer(message) {
    clearInterval(timerInterval);
    timerInterval = null;
    if (message) timerElement.textContent = message;
  }

  function renderTimer() {
    timerElement.textContent = `${timerRemaining}s`;
  }

  function getChallengeBadgeText(question) {
    if (question.category === 'look') return 'Look Outside';
    if (question.category === 'laugh') return 'Laugh Together';
    if (question.category === 'learn') {
      const topic = learnTopics.find(entry => entry.id === question.learnTopic);
      return topic ? `Learn: ${topic.label}` : 'Learn Something';
    }
    if (question.category === 'compete') return 'Friendly Challenge';
    if (question.category === 'local') {
      return /challenge|spot|find|invent|introduce|give/i.test(question.text || '') ? 'Local Challenge' : 'Local Fact';
    }
    return 'Local Explorer';
  }

  function showChallenge() {
    if (currentIndex >= adventureQuestions.length) {
      // Completed adventure
      showSummary();
      return;
    }
    const q = adventureQuestions[currentIndex];
    challengeContainer.innerHTML = '';
    const badge = document.createElement('span');
    badge.className = `challenge-badge ${q.category}`;
    badge.textContent = getChallengeBadgeText(q);
    const p = document.createElement('p');
    p.textContent = q.text;
    const nextHint = document.createElement('small');
    nextHint.className = 'challenge-next-hint';
    nextHint.textContent = q.requiresTimer
      ? 'Try it together, then tap Stamp It when the timer feels done.'
      : 'Read it aloud, look up, play it out, then tap Stamp It.';
    challengeContainer.appendChild(badge);
    challengeContainer.appendChild(p);
    challengeContainer.appendChild(nextHint);
    // Timer
    if (q.requiresTimer) {
      timerElement.hidden = false;
      extendTimerButton.hidden = false;
      skipTimerButton.hidden = false;
      timerRemaining = 15;
      renderTimer();
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timerRemaining -= 1;
        if (timerRemaining <= 0) {
          stopTimer('Time’s up!');
        } else {
          renderTimer();
        }
      }, 1000);
    } else {
      stopTimer();
      hideTimerControls();
    }
    nextButton.hidden = false;
    updateProgress();
  }

  function showSummary() {
    showSection('summary');
    const completed = Math.min(currentIndex, adventureQuestions.length);
    summaryText.textContent = `You completed ${completed} prompt${completed === 1 ? '' : 's'}.`;
    summaryList.innerHTML = '';
    const modeLabels = {
      look: 'Window Quests',
      laugh: 'Car Laughs',
      learn: 'Learn Something',
      compete: 'Quick Challenges',
      local: 'Local Explorer',
    };
    const seenModes = [];
    adventureQuestions.forEach(item => {
      const label = modeLabels[item.category];
      if (label && !seenModes.includes(label)) seenModes.push(label);
    });
    if (seenModes.length) {
      const li = document.createElement('li');
      li.textContent = `Prompt games played: ${seenModes.join(', ')}.`;
      summaryList.appendChild(li);
    }
    const completedPrompts = adventureQuestions.slice(0, completed);
    if (completedPrompts.length) {
      const best = completedPrompts.find(item => item.quality === 'strong') || completedPrompts[0];
      const li = document.createElement('li');
      li.textContent = `Best moment to remember: ${best.text}`;
      summaryList.appendChild(li);
    }
    const prize = document.createElement('li');
    prize.textContent = 'Prize idea: the next reader chooses the next mode, or the funniest answer gets snack naming rights.';
    summaryList.appendChild(prize);
    const note = document.createElement('li');
    note.textContent = 'Short recap: no tracking, no scores here, just passengers noticing the ride together.';
    summaryList.appendChild(note);
    progressFill.style.width = '100%';
  }

  function getHuntClaims() {
    return activeScavengerItems.filter(item => item.claimedBy);
  }

  function getActiveHuntItems() {
    return activeHuntIds
      .map(itemId => activeScavengerItems.find(item => item.id === itemId))
      .filter(Boolean);
  }

  function getHuntItemSearchText(item) {
    return `${item.id || ''} ${item.label || ''} ${item.hint || ''}`.toLowerCase();
  }

  function huntItemHasThemeTag(item, theme) {
    return Array.isArray(item.themes) && item.themes.includes(theme);
  }

  function huntItemMatchesTheme(item, theme) {
    if (theme === 'mixed') return true;
    if (huntItemHasThemeTag(item, theme)) return true;
    const text = getHuntItemSearchText(item);
    if (theme === 'vehicles') {
      return /car|vehicle|truck|plate|motorcycle|camper|rv|trailer|tire|bike|bus|van|semi|tow|fuel|gas/.test(text);
    }
    if (theme === 'signs') {
      return /sign|billboard|exit|mile|route|highway|road|street|logo|slogan|marker|license plate|plate/.test(text);
    }
    if (theme === 'places') {
      return /business|restaurant|diner|coffee|bakery|gas|station|museum|library|school|park|stadium|motel|hotel|visitor|post office|fire station|building|church|chapel|playground|rest area|car wash|drive-thru|market/.test(text);
    }
    if (theme === 'nature') {
      return /animal|bird|tree|cloud|sky|mountain|hill|river|lake|water|desert|flower|plant|farm|horse|cow|dog|wildlife|sun|moon/.test(text);
    }
    if (theme === 'alaska-train') {
      return /alaska|train|rail|railroad|track|station|depot|bridge|river|mountain|snow|glacier|moose|bear|eagle|forest|tunnel|signal|conductor|caboose/.test(text);
    }
    if (theme === 'weird') {
      return /weird|funny|unusual|odd|giant|tiny|strange|mystery|mascot|superhero|batmobile|eyelash|flame|sticker|homemade|expensive|never own|named/.test(text);
    }
    if (theme === 'jackpot') {
      return /rare|jackpot|giant|tiny|classic|convertible|dinosaur|dragon|alien|bigfoot|unicorn|tunnel|waterfall|rainbow|mural|retro|world famous|vanity|palindrome|purple|monster|decorated|odd-shaped|futuristic/.test(text);
    }
    if (theme === 'easy') {
      return /car|truck|sign|billboard|gas|flag|bridge|tree|cloud|animal|trailer|bus|food|restaurant|water|construction|emergency/.test(text);
    }
    return true;
  }

  function getHuntThemeLabel() {
    const activeButton = huntThemeButtons.querySelector(`button[data-hunt-theme="${activeHuntTheme}"]`);
    return activeButton ? activeButton.textContent : 'Mixed';
  }

  function renderHuntThemeButtons() {
    Array.from(huntThemeButtons.querySelectorAll('button[data-hunt-theme]')).forEach(button => {
      const isActive = button.dataset.huntTheme === activeHuntTheme;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function getTripPreset() {
    return tripPresets[tripSettings.tripPreset] || tripPresets.any;
  }

  function huntItemMatchesTripPreset(item) {
    const preset = getTripPreset();
    if (!preset || preset.themes.includes('mixed')) return true;
    return preset.themes.some(theme => huntItemMatchesTheme(item, theme));
  }

  function getScavengerTrackingKey() {
    const theme = activeHuntTheme || 'mixed';
    const preset = tripSettings.tripPreset || 'any';
    return `${preset}:${theme}`;
  }

  function isScavengerItemSeen(item) {
    const key = getScavengerTrackingKey();
    return Array.isArray(scavengerHistory[key]) && scavengerHistory[key].includes(item.id);
  }

  function clearScavengerHistoryForCandidates(candidates) {
    const key = getScavengerTrackingKey();
    if (!Array.isArray(scavengerHistory[key]) || !scavengerHistory[key].length) return;
    const candidateIds = new Set(candidates.map(item => item.id));
    scavengerHistory[key] = scavengerHistory[key].filter(id => !candidateIds.has(id));
    setStoredJson('rtaScavengerHistory', scavengerHistory);
  }

  function markScavengerSeen(item) {
    if (!item || !item.id) return;
    const key = getScavengerTrackingKey();
    if (!scavengerHistory[key]) scavengerHistory[key] = [];
    if (scavengerHistory[key].includes(item.id)) return;
    scavengerHistory[key].push(item.id);
    setStoredJson('rtaScavengerHistory', scavengerHistory);
  }

  function buildHuntDeck() {
    const currentActiveIds = new Set(activeHuntIds);
    const unclaimedItems = activeScavengerItems.filter(item => !item.claimedBy && !currentActiveIds.has(item.id));
    const themedItems = activeHuntTheme === 'mixed'
      ? unclaimedItems.filter(huntItemMatchesTripPreset)
      : unclaimedItems.filter(item => huntItemMatchesTheme(item, activeHuntTheme) && huntItemMatchesTripPreset(item));
    const deckItems = themedItems.length ? themedItems : unclaimedItems;
    let availableItems = deckItems.filter(item => !isScavengerItemSeen(item));
    if (!availableItems.length) {
      clearScavengerHistoryForCandidates(deckItems);
      availableItems = deckItems.slice();
    }
    huntDeck = shuffle(availableItems.map(item => item.id));
  }

  function getHuntBatchSize() {
    return tripSettings.gameLength === 'short' ? 4 : 5;
  }

  function fillActiveHuntTargets(count = getHuntBatchSize()) {
    while (activeHuntIds.length < count) {
      if (!huntDeck.length) buildHuntDeck();
      if (!huntDeck.length) break;
      const nextId = huntDeck.pop();
      const item = activeScavengerItems.find(entry => entry.id === nextId);
      if (item && !item.claimedBy && !activeHuntIds.includes(nextId)) {
        activeHuntIds.push(nextId);
        markScavengerSeen(item);
      }
    }
  }

  function drawHuntTargets(count = getHuntBatchSize()) {
    if (!huntDeck.length) buildHuntDeck();
    activeHuntIds.forEach(itemId => {
      const item = activeScavengerItems.find(entry => entry.id === itemId);
      if (item && !item.claimedBy && !huntDeck.includes(itemId)) {
        huntDeck.unshift(itemId);
      }
    });
    activeHuntIds = [];
    fillActiveHuntTargets(count);
    renderHunt();
  }

  function updateHuntScores() {
    const scores = createScoreMap();
    getHuntClaims().forEach(item => {
      scores[item.claimedBy] = (scores[item.claimedBy] || 0) + 1;
    });
    renderScoreboard(huntScoreboard, scores);

    const leaderScore = players.length ? Math.max(...players.map(player => scores[player.id] || 0)) : 0;
    const activeCount = getActiveHuntItems().length;
    const claimedCount = getHuntClaims().length;
    const judgeNote = getCarJudgeNote();
    const themeLabel = getHuntThemeLabel();
    const presetLabel = getTripPreset().label;
    const milestone = getHuntMilestone();
    const remainingFinds = Math.max(0, milestone - leaderScore);
    if (leaderScore >= milestone) {
      const leaders = getTopPlayers(scores).map(player => player.name).join(', ');
      huntStatus.textContent = `${leaders} hit the ${milestone}-find milestone. Karaoke power unlocked: choose the song everyone else sings.${judgeNote ? ` ${judgeNote}` : ''}`;
    } else if (!activeCount) {
      huntStatus.textContent = claimedCount
        ? `${claimedCount} total find${claimedCount === 1 ? '' : 's'} claimed. Draw ${themeLabel} targets for ${presetLabel}.${judgeNote ? ` ${judgeNote}` : ''}`
        : `Draw ${themeLabel} targets for ${presetLabel}.${judgeNote ? ` ${judgeNote}` : ''}`;
    } else {
      huntStatus.textContent = `${presetLabel} • ${themeLabel}: keep these ${activeCount} target${activeCount === 1 ? '' : 's'} in mind. ${remainingFinds} more find${remainingFinds === 1 ? '' : 's'} to reach the milestone.${judgeNote ? ` ${judgeNote}` : ''}`;
    }
  }

  function renderHunt() {
    renderHuntThemeButtons();
    if (huntRoute) huntRoute.textContent = getTripPreset().label;
    huntGrid.innerHTML = '';
    const activeItems = getActiveHuntItems();
    activeItems.forEach(item => {
      const card = document.createElement('article');
      card.className = 'hunt-card';
      if (item.claimedBy) card.classList.add('claimed');

      const icon = document.createElement('span');
      icon.className = 'hunt-emoji';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = item.emoji;

      const title = document.createElement('h3');
      title.textContent = item.label;

      const hint = document.createElement('p');
      hint.textContent = item.hint;

      const actions = document.createElement('div');
      actions.className = 'hunt-claim-actions';

      renderAwardButtons(actions, 'Claims It', playerId => claimHuntItem(item.id, playerId), Boolean(item.claimedBy));

      if (item.claimedBy) {
        const claimed = document.createElement('strong');
        claimed.className = 'claimed-label';
        claimed.textContent = `Claimed by ${getPlayerName(item.claimedBy)}`;
        card.appendChild(claimed);
      }

      card.appendChild(icon);
      card.appendChild(title);
      card.appendChild(hint);
      card.appendChild(actions);
      huntGrid.appendChild(card);
    });
    if (!activeItems.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-hunt-message';
      empty.textContent = 'No active targets yet. Draw a new batch to start looking.';
      huntGrid.appendChild(empty);
    }
    updateHuntScores();
  }

  function claimHuntItem(itemId, playerId) {
    const item = activeScavengerItems.find(entry => entry.id === itemId);
    if (!item || item.claimedBy) return;
    item.claimedBy = playerId;
    activeHuntIds = activeHuntIds.filter(id => id !== itemId);
    fillActiveHuntTargets();
    renderHunt();
  }

  function resetHunt() {
    activeScavengerItems.forEach(item => {
      delete item.claimedBy;
    });
    activeHuntIds = [];
    buildHuntDeck();
    drawHuntTargets();
  }

  function drawFreshHuntTargets() {
    drawHuntTargets();
  }

  function setHuntTheme(theme) {
    activeHuntTheme = theme || 'mixed';
    setStoredJson('rtaHuntTheme', activeHuntTheme);
    huntDeck = [];
    activeHuntIds = [];
    drawHuntTargets();
  }

  function startScavengerHunt() {
    resetGame();
    resetHunt();
    hideHuntSideGame();
    showSection('scavenger');
  }

  function showHuntSummary() {
    const claims = getHuntClaims();
    const scores = createScoreMap();
    claims.forEach(item => {
      scores[item.claimedBy] = (scores[item.claimedBy] || 0) + 1;
    });
    const leaders = getWinningPlayers(scores);
    showSection('summary');
    const winner = formatWinner(leaders, leader => `${leader.name} wins`, 'It was a tie');
    const scoreText = players.map(player => `${player.name}: ${scores[player.id] || 0}`).join(', ');
    summaryText.textContent = leaders.length
      ? `${winner}. ${scoreText}. Winner chooses the car karaoke song for everyone else.`
      : `No scavenger finds were claimed yet. ${scoreText}.`;
    summaryList.innerHTML = '';
    claims.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.label}: ${getPlayerName(item.claimedBy)}`;
      summaryList.appendChild(li);
    });
  }

  function hideHuntSideGame() {
    huntSideGame.hidden = true;
    sideGameActions.innerHTML = '';
  }

  function showHuntSideGame(label, title, text, actions = []) {
    sideGameLabel.textContent = label;
    sideGameTitle.textContent = title;
    sideGameText.textContent = text;
    sideGameActions.innerHTML = '';
    actions.forEach(action => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = action.primary ? 'primary-button' : 'secondary-button';
      button.textContent = action.label;
      button.addEventListener('click', action.onClick);
      sideGameActions.appendChild(button);
    });
    huntSideGame.hidden = false;
  }

  function startAlphabetGame() {
    const themes = window.RTA_ALPHABET_THEMES || [];
    if (!themes.length) return;
    showHuntSideGame(
      'Alphabet Game',
      'Choose A Theme',
      'Work through A to Z. Take turns naming something that starts with each letter.',
      themes.map(theme => ({
        label: theme.label,
        onClick: () => startAlphabetTheme(theme.id),
      })).concat([{ label: 'Close', onClick: hideHuntSideGame }])
    );
  }

  function startAlphabetTheme(themeId) {
    const themes = window.RTA_ALPHABET_THEMES || [];
    alphabetTheme = themes.find(theme => theme.id === themeId) || themes[0];
    alphabetIndex = 0;
    showAlphabetPrompt();
  }

  function showAlphabetPrompt() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    if (!alphabetTheme) {
      startAlphabetGame();
      return;
    }
    if (alphabetIndex >= letters.length) {
      showHuntSideGame('Alphabet Game', 'A to Z Complete', `${alphabetTheme.label} conquered. Winner chooses a car karaoke song or gets first snack pick.`, [
        { label: 'Play Again', primary: true, onClick: startAlphabetGame },
        { label: 'Close', onClick: hideHuntSideGame },
      ]);
      return;
    }
    const letter = letters[alphabetIndex];
    showHuntSideGame(
      'Alphabet Game',
      `${alphabetTheme.label}: Letter ${letter}`,
      `${alphabetTheme.prompt} ${letter}. If nobody can answer in 10 seconds, skip or let the other side steal.`,
      [
        { label: 'Got One', primary: true, onClick: () => { alphabetIndex++; showAlphabetPrompt(); } },
        { label: 'Skip Letter', onClick: () => { alphabetIndex++; showAlphabetPrompt(); } },
        { label: 'Change Theme', onClick: startAlphabetGame },
        { label: 'Close', onClick: hideHuntSideGame },
      ]
    );
  }

  function startLightningRound() {
    const prompts = window.RTA_LIGHTNING_ROUNDS || [];
    if (!prompts.length) return;
    if (!lightningDeck.length) lightningDeck = shuffle(prompts.slice());
    const prompt = lightningDeck.pop();
    showHuntSideGame('Lightning Round', 'Fast Find', prompt, [
      { label: 'Another Lightning Round', onClick: startLightningRound },
      { label: 'Close', onClick: hideHuntSideGame },
    ]);
  }

  const TWENTY_QUESTIONS_LIST = [
    { tag: 'alive', question: 'Is it alive?' },
    { tag: 'holdable', question: 'Can a person hold it?' },
    { tag: 'indoors', question: 'Is it usually found indoors?' },
    { tag: 'biggerThanBackpack', question: 'Is it bigger than a backpack?' },
    { tag: 'manmade', question: 'Is it made by humans?' },
    { tag: 'fun', question: 'Is it used for fun?' },
    { tag: 'food', question: 'Is it connected to food or drinks?' },
    { tag: 'movesSelf', question: 'Can it move by itself?' },
    { tag: 'famous', question: 'Is it famous or well known?' },
    { tag: 'roadtrip', question: 'Would you see it on a road trip?' },
    { tag: 'place', question: 'Is it a place?' },
    { tag: 'person', question: 'Is it a person or character?' },
    { tag: 'electricity', question: 'Does it use electricity?' },
    { tag: 'oneColor', question: 'Is it mostly one color?' },
    { tag: 'kidsKnow', question: 'Would most kids know it?' },
    { tag: 'nature', question: 'Is it something from nature?' },
    { tag: 'expensive', question: 'Is it expensive?' },
    { tag: 'sound', question: 'Can it make sound?' },
    { tag: 'everyday', question: 'Is it used every day?' },
    { tag: 'smallerThanPhone', question: 'Is it smaller than a phone?' },
  ];

  const TWENTY_QUESTIONS_OBJECTS = [
    { name: 'a dog', attrs: { alive: 'yes', holdable: 'sometimes', indoors: 'sometimes', biggerThanBackpack: 'sometimes', manmade: 'no', fun: 'yes', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'yes', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a cat', attrs: { alive: 'yes', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'no', fun: 'yes', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'yes', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a banana', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'no', fun: 'no', food: 'yes', movesSelf: 'no', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'no', oneColor: 'yes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a car', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'yes', fun: 'sometimes', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'sometimes', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'yes', sound: 'yes', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a smartphone', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'yes', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'yes', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'yes', sound: 'yes', everyday: 'yes', smallerThanPhone: 'yes' } },
    { name: 'a mountain', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'sometimes', food: 'no', movesSelf: 'no', famous: 'sometimes', roadtrip: 'yes', place: 'yes', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'the Sun', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'no', famous: 'yes', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'yes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a pizza', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'yes', food: 'yes', movesSelf: 'no', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'no', everyday: 'sometimes', smallerThanPhone: 'no' } },
    { name: 'an airplane', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'yes', fun: 'sometimes', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'yes', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'yes', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a tree', attrs: { alive: 'yes', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a guitar', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'yes', manmade: 'yes', fun: 'yes', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'sometimes', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'sometimes', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a snowman', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'yes', fun: 'yes', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'no', oneColor: 'yes', kidsKnow: 'yes', nature: 'sometimes', expensive: 'no', sound: 'no', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a book', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'sometimes', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'an elephant', attrs: { alive: 'yes', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'sometimes', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'no', oneColor: 'yes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'ice cream', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'yes', food: 'yes', movesSelf: 'no', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'no', everyday: 'sometimes', smallerThanPhone: 'yes' } },
    { name: 'a river', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'sometimes', food: 'no', movesSelf: 'yes', famous: 'sometimes', roadtrip: 'yes', place: 'yes', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a horse', attrs: { alive: 'yes', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'sometimes', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'yes', expensive: 'sometimes', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a bird', attrs: { alive: 'yes', holdable: 'sometimes', indoors: 'sometimes', biggerThanBackpack: 'no', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'yes', everyday: 'yes', smallerThanPhone: 'sometimes' } },
    { name: 'a fish', attrs: { alive: 'yes', holdable: 'sometimes', indoors: 'sometimes', biggerThanBackpack: 'no', manmade: 'no', fun: 'no', food: 'sometimes', movesSelf: 'yes', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'no', smallerThanPhone: 'sometimes' } },
    { name: 'a spider', attrs: { alive: 'yes', holdable: 'no', indoors: 'sometimes', biggerThanBackpack: 'no', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'sometimes', smallerThanPhone: 'yes' } },
    { name: 'an apple', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'no', fun: 'no', food: 'yes', movesSelf: 'no', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a chair', attrs: { alive: 'no', holdable: 'sometimes', indoors: 'yes', biggerThanBackpack: 'yes', manmade: 'yes', fun: 'no', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a toothbrush', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'no', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'sometimes', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'yes' } },
    { name: 'a television', attrs: { alive: 'no', holdable: 'no', indoors: 'yes', biggerThanBackpack: 'yes', manmade: 'yes', fun: 'yes', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'yes', oneColor: 'yes', kidsKnow: 'yes', nature: 'no', expensive: 'sometimes', sound: 'yes', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a bicycle', attrs: { alive: 'no', holdable: 'no', indoors: 'sometimes', biggerThanBackpack: 'yes', manmade: 'yes', fun: 'yes', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'no', expensive: 'sometimes', sound: 'no', everyday: 'sometimes', smallerThanPhone: 'no' } },
    { name: 'a clock', attrs: { alive: 'no', holdable: 'sometimes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'no', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'sometimes', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'yes', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a shoe', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'no', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'no', expensive: 'sometimes', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'the Moon', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'no', famous: 'yes', roadtrip: 'yes', place: 'sometimes', person: 'no', electricity: 'no', oneColor: 'yes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'sometimes', smallerThanPhone: 'no' } },
    { name: 'a beach', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'yes', food: 'no', movesSelf: 'no', famous: 'sometimes', roadtrip: 'yes', place: 'yes', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a robot', attrs: { alive: 'no', holdable: 'sometimes', indoors: 'sometimes', biggerThanBackpack: 'sometimes', manmade: 'yes', fun: 'yes', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'yes', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'no', expensive: 'yes', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a butterfly', attrs: { alive: 'yes', holdable: 'no', indoors: 'no', biggerThanBackpack: 'no', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'sometimes', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'no', smallerThanPhone: 'yes' } },
    { name: 'a soccer ball', attrs: { alive: 'no', holdable: 'yes', indoors: 'sometimes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'yes', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'no', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'no', everyday: 'sometimes', smallerThanPhone: 'no' } },
    { name: 'a cloud', attrs: { alive: 'no', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'yes', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
    { name: 'a cow', attrs: { alive: 'yes', holdable: 'no', indoors: 'no', biggerThanBackpack: 'yes', manmade: 'no', fun: 'no', food: 'no', movesSelf: 'yes', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'no', kidsKnow: 'yes', nature: 'yes', expensive: 'no', sound: 'yes', everyday: 'no', smallerThanPhone: 'no' } },
    { name: 'a backpack', attrs: { alive: 'no', holdable: 'yes', indoors: 'yes', biggerThanBackpack: 'no', manmade: 'yes', fun: 'no', food: 'no', movesSelf: 'no', famous: 'no', roadtrip: 'yes', place: 'no', person: 'no', electricity: 'no', oneColor: 'sometimes', kidsKnow: 'yes', nature: 'no', expensive: 'no', sound: 'no', everyday: 'yes', smallerThanPhone: 'no' } },
  ];

  function twentyComputerAnswer(object, tag) {
    const value = object && object.attrs ? object.attrs[tag] : null;
    if (value === 'yes') return 'Yes';
    if (value === 'no') return 'No';
    return 'Sometimes';
  }

  function formatTwentyComputerHistory() {
    if (!twentyComputerAsked.length) return '';
    const start = Math.max(0, twentyComputerAsked.length - 5);
    const recent = twentyComputerAsked.slice(start).map((entry, index) => (
      `${start + index + 1}. ${entry.question} ${entry.answer}`
    ));
    return `\n\nAnswers so far:\n${recent.join('\n')}`;
  }

  function startTwentyQuestionsChooser() {
    showHuntSideGame(
      '20 Questions',
      'Who Hides the Secret?',
      'Pick who thinks of the secret thing. The other side gets 20 questions to figure it out.',
      [
        { label: 'We think of it (app guesses)', primary: true, onClick: startTwentyQuestions },
        { label: 'Computer thinks of it (we guess)', onClick: startTwentyQuestionsComputer },
        { label: 'Close', onClick: hideHuntSideGame },
      ]
    );
  }

  function startTwentyQuestionsComputer() {
    twentyComputerObject = TWENTY_QUESTIONS_OBJECTS[Math.floor(Math.random() * TWENTY_QUESTIONS_OBJECTS.length)];
    twentyComputerTurns = 0;
    twentyComputerAsked = [];
    renderTwentyComputer('The computer is thinking of a person, place, or thing. Ask yes-or-no questions to figure it out!');
  }

  function renderTwentyComputer(resultLine) {
    const askedTags = new Set(twentyComputerAsked.map(entry => entry.tag));
    const remaining = TWENTY_QUESTIONS_LIST.filter(item => !askedTags.has(item.tag));
    const history = formatTwentyComputerHistory();
    const intro = `${resultLine}\n\nTurn ${Math.min(twentyComputerTurns + 1, 20)}/20. Tap a question to ask, then guess when ready.${history}`;
    if (twentyComputerTurns >= 20 || !remaining.length) {
      showHuntSideGame('20 Questions', 'Time to Guess', `${intro}\n\nNo more questions left. Make your final guess.`, [
        { label: 'Reveal Answer', primary: true, onClick: () => revealTwentyComputer(false) },
        { label: 'Start Over', onClick: startTwentyQuestionsComputer },
        { label: 'Close', onClick: hideHuntSideGame },
      ]);
      return;
    }
    const offered = shuffle(remaining.slice()).slice(0, 6);
    const actions = offered.map(item => ({
      label: item.question,
      onClick: () => {
        const answer = twentyComputerAnswer(twentyComputerObject, item.tag);
        twentyComputerAsked.push({ question: item.question, tag: item.tag, answer });
        twentyComputerTurns++;
        renderTwentyComputer(`You asked: ${item.question}  Computer says: ${answer}.`);
      },
    }));
    actions.push({ label: 'Make a Guess', primary: true, onClick: showTwentyComputerGuess });
    actions.push({ label: 'Different Questions', onClick: () => renderTwentyComputer(resultLine) });
    actions.push({ label: 'Reveal Answer', onClick: () => revealTwentyComputer(false) });
    actions.push({ label: 'Close', onClick: hideHuntSideGame });
    showHuntSideGame('20 Questions', 'Computer Picked Something', intro, actions);
  }

  function showTwentyComputerGuess() {
    showHuntSideGame(
      '20 Questions',
      'Make a Guess',
      `Say one guess out loud, then check it.${formatTwentyComputerHistory()}`,
      [
        { label: 'We Guessed Right', primary: true, onClick: () => revealTwentyComputer(true) },
        { label: 'Wrong, Keep Asking', onClick: () => { twentyComputerTurns++; renderTwentyComputer('That guess was off. Keep narrowing it down.'); } },
        { label: 'Reveal Answer', onClick: () => revealTwentyComputer(false) },
      ]
    );
  }

  function revealTwentyComputer(solved) {
    const name = twentyComputerObject ? twentyComputerObject.name : 'its secret';
    showHuntSideGame(
      '20 Questions',
      solved ? 'You Got It!' : 'The Answer',
      `The computer was thinking of ${name}.${formatTwentyComputerHistory()}`,
      [
        { label: 'Play Again', primary: true, onClick: startTwentyQuestionsComputer },
        { label: 'Switch Mode', onClick: startTwentyQuestionsChooser },
        { label: 'Close', onClick: hideHuntSideGame },
      ]
    );
  }

  function twentyTraitValue(trait) {
    if (trait === 'yes') return 1;
    if (trait === 'no') return -1;
    if (trait === 'sometimes') return 0.5;
    return 0;
  }

  function twentyPlayerValue(answer) {
    switch (answer) {
      case 'Yes': return 1;
      case 'No': return -1;
      case 'Sometimes': return 0.5;
      case 'Maybe': return 0.25;
      default: return 0;
    }
  }

  function twentyGuessPool() {
    const learned = getStoredJson('rtaTwentyLearned', []) || [];
    const pool = TWENTY_QUESTIONS_OBJECTS.concat(Array.isArray(learned) ? learned : []);
    return pool.filter(object => !twentyGuessRejected.includes(object.name));
  }

  function twentyScoreCandidate(object) {
    let score = 0;
    Object.keys(twentyGuessAnswers).forEach(tag => {
      const playerValue = twentyGuessAnswers[tag];
      const traitValue = twentyTraitValue(object.attrs ? object.attrs[tag] : undefined);
      score += 1 - Math.abs(playerValue - traitValue);
    });
    return score;
  }

  function twentyRankCandidates() {
    return twentyGuessPool()
      .map(object => ({ object, score: twentyScoreCandidate(object) }))
      .sort((a, b) => b.score - a.score);
  }

  function twentyPickQuestion(topCandidates) {
    const unasked = TWENTY_QUESTIONS_LIST.filter(item => !twentyGuessAsked.has(item.tag));
    if (!unasked.length) return null;
    if (!topCandidates.length) return unasked[0];
    let best = unasked[0];
    let bestSplit = Infinity;
    unasked.forEach(item => {
      const average = topCandidates.reduce((sum, entry) => (
        sum + twentyTraitValue(entry.object.attrs ? entry.object.attrs[item.tag] : undefined)
      ), 0) / topCandidates.length;
      const split = Math.abs(average);
      if (split < bestSplit) {
        bestSplit = split;
        best = item;
      }
    });
    return best;
  }

  function twentyGuessReady(ranked, unaskedCount) {
    if (!ranked.length) return false;
    if (twentyGuessTurns >= 20 || unaskedCount === 0) return true;
    if (ranked.length === 1) return true;
    if (twentyGuessTurns >= 6 && (ranked[0].score - ranked[1].score) >= 2) return true;
    if (twentyGuessTurns >= 14) return true;
    return false;
  }

  function formatTwentyGuessHistory() {
    if (!twentyGuessLog.length) return '';
    const start = Math.max(0, twentyGuessLog.length - 5);
    const recent = twentyGuessLog.slice(start).map((entry, index) => (
      `${start + index + 1}. ${entry.question} ${entry.answer}`
    ));
    return `\n\nWhat I know:\n${recent.join('\n')}`;
  }

  function startTwentyQuestions() {
    twentyGuessAnswers = {};
    twentyGuessAsked = new Set();
    twentyGuessLog = [];
    twentyGuessTurns = 0;
    twentyGuessRejected = [];
    twentyGuessStep('Think of any person, place, animal, food, or object. Do not tell me what it is, and I will try to guess it.');
  }

  function twentyGuessStep(resultLine) {
    const ranked = twentyRankCandidates();
    const unasked = TWENTY_QUESTIONS_LIST.filter(item => !twentyGuessAsked.has(item.tag));
    if (twentyGuessReady(ranked, unasked.length)) {
      twentyShowGuess(ranked[0].object, resultLine);
      return;
    }
    const next = twentyPickQuestion(ranked.slice(0, 6));
    if (!next) {
      if (ranked.length) twentyShowGuess(ranked[0].object, resultLine);
      else twentyGuessStumped(resultLine);
      return;
    }
    twentyAskGuessQuestion(next, resultLine);
  }

  function twentyAskGuessQuestion(item, resultLine) {
    const intro = `${resultLine}\n\nTurn ${Math.min(twentyGuessTurns + 1, 20)}/20\nQuestion: ${item.question}${formatTwentyGuessHistory()}`;
    const actions = ['Yes', 'No', 'Sometimes', 'Maybe', 'Unknown'].map(answer => ({
      label: answer,
      onClick: () => {
        twentyGuessAnswers[item.tag] = twentyPlayerValue(answer);
        twentyGuessAsked.add(item.tag);
        twentyGuessLog.push({ question: item.question, answer });
        twentyGuessTurns++;
        twentyGuessStep('Got it.');
      },
    }));
    actions.push({ label: 'Start Over', onClick: startTwentyQuestions });
    actions.push({ label: 'Close', onClick: hideHuntSideGame });
    showHuntSideGame('20 Questions', 'I am Guessing', intro, actions);
  }

  function twentyShowGuess(object, resultLine) {
    const name = object ? object.name : 'something';
    twentyGuessTurns++;
    showHuntSideGame(
      '20 Questions',
      'My Guess',
      `${resultLine}\n\nI think you are thinking of ${name}. Am I right?${formatTwentyGuessHistory()}`,
      [
        { label: 'Yes, you got it!', primary: true, onClick: () => twentyGuessWin(object) },
        { label: 'No, keep going', onClick: () => {
          if (object) twentyGuessRejected.push(object.name);
          twentyGuessStep('Hmm, not that. Let me narrow it down more.');
        } },
        { label: 'Start Over', onClick: startTwentyQuestions },
      ]
    );
  }

  function twentyGuessWin(object) {
    const name = object ? object.name : 'it';
    const turns = Math.min(20, twentyGuessTurns);
    showHuntSideGame('20 Questions', 'I Got It!', `I guessed it: ${name}! That took ${turns} turn${turns === 1 ? '' : 's'}.`, [
      { label: 'Play Again', primary: true, onClick: startTwentyQuestions },
      { label: 'Switch Mode', onClick: startTwentyQuestionsChooser },
      { label: 'Close', onClick: hideHuntSideGame },
    ]);
  }

  function twentyGuessStumped(resultLine) {
    showHuntSideGame(
      '20 Questions',
      'You Stumped Me!',
      `${resultLine}\n\nYou win this round. Want to teach me so I can guess it next time?${formatTwentyGuessHistory()}`,
      [
        { label: 'Teach Me', primary: true, onClick: twentyTeachAnswer },
        { label: 'Play Again', onClick: startTwentyQuestions },
        { label: 'Close', onClick: hideHuntSideGame },
      ]
    );
  }

  function twentyTeachAnswer() {
    let name = '';
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
      name = (window.prompt('What were you thinking of?') || '').trim();
    }
    if (!name) {
      twentyGuessStumped('No worries.');
      return;
    }
    const attrs = {};
    Object.keys(twentyGuessAnswers).forEach(tag => {
      const value = twentyGuessAnswers[tag];
      if (value >= 0.75) attrs[tag] = 'yes';
      else if (value <= -0.75) attrs[tag] = 'no';
      else if (value > 0) attrs[tag] = 'sometimes';
    });
    const learned = getStoredJson('rtaTwentyLearned', []) || [];
    const list = Array.isArray(learned) ? learned : [];
    const existingIndex = list.findIndex(entry => entry.name && entry.name.toLowerCase() === name.toLowerCase());
    const record = { name, attrs };
    if (existingIndex >= 0) list[existingIndex] = record;
    else list.push(record);
    setStoredJson('rtaTwentyLearned', list.slice(-50));
    showHuntSideGame('20 Questions', 'Thanks!', `Good one. I will remember ${name} for next time by linking it with your clues.`, [
      { label: 'Play Again', primary: true, onClick: startTwentyQuestions },
      { label: 'Close', onClick: hideHuntSideGame },
    ]);
  }

  function startEtaGuess() {
    const ideas = window.RTA_ETA_CHALLENGES || [];
    if (!ideas.length) return;
    showHuntSideGame('ETA Guess', 'Destination Prediction', shuffle(ideas.slice())[0], [
      { label: 'New ETA Challenge', onClick: startEtaGuess },
      { label: 'Close', onClick: hideHuntSideGame },
    ]);
  }

  const HideSeekGameState = {
    TITLE: 'TITLE',
    ROUND_START: 'ROUND_START',
    HIDER_TURN: 'HIDER_TURN',
    SEEKER_LOOK_AWAY: 'SEEKER_LOOK_AWAY',
    SEEKER_TURN: 'SEEKER_TURN',
    FOUND: 'FOUND',
    ROUND_RESULTS: 'ROUND_RESULTS',
    GAME_OVER: 'GAME_OVER',
  };

  const HIDE_SEEK_BASE_WIDTH = 800;
  const HIDE_SEEK_BASE_HEIGHT = 450;
  const HIDE_SEEK_SCALE = 1.5;
  const HIDE_SEEK_CANVAS_WIDTH = Math.round(HIDE_SEEK_BASE_WIDTH * HIDE_SEEK_SCALE);
  const HIDE_SEEK_CANVAS_HEIGHT = Math.round(HIDE_SEEK_BASE_HEIGHT * HIDE_SEEK_SCALE);
  const HIDE_SEEK_GEOMETRY_KEYS = new Set([
    'x',
    'y',
    'width',
    'height',
    'spawnX',
    'spawnY',
    'interactionRadius',
    'offsetX',
    'offsetY',
  ]);

  function scaleHideSeekGeometry(value) {
    if (Array.isArray(value)) return value.map(scaleHideSeekGeometry);
    if (!value || typeof value !== 'object') return value;
    return Object.entries(value).reduce((scaled, [key, entryValue]) => {
      if (typeof entryValue === 'number' && HIDE_SEEK_GEOMETRY_KEYS.has(key)) {
        scaled[key] = Math.round(entryValue * HIDE_SEEK_SCALE);
      } else {
        scaled[key] = scaleHideSeekGeometry(entryValue);
      }
      return scaled;
    }, {});
  }

  const hideSeekMaps = scaleHideSeekGeometry(window.RTA_HIDE_SEEK_MAPS || {});

  function createHideSeekActor(roomId, visible, color) {
    return {
      x: Math.round(120 * HIDE_SEEK_SCALE),
      y: Math.round(305 * HIDE_SEEK_SCALE),
      width: Math.round(24 * HIDE_SEEK_SCALE),
      height: Math.round(32 * HIDE_SEEK_SCALE),
      speed: Math.round(150 * HIDE_SEEK_SCALE),
      roomId,
      visible,
      color,
    };
  }

  function getHideSeekCanvasSize() {
    return {
      width: hideSeekCanvas ? hideSeekCanvas.width : HIDE_SEEK_CANVAS_WIDTH,
      height: hideSeekCanvas ? hideSeekCanvas.height : HIDE_SEEK_CANVAS_HEIGHT,
    };
  }

  function getHideSeekFloorRect() {
    const { width, height } = getHideSeekCanvasSize();
    return {
      x: Math.round(width * 0.0475),
      y: Math.round(height * 0.1378),
      width: Math.round(width * 0.905),
      height: Math.round(height * 0.7511),
    };
  }

  function withHideSeekBaseScale(ctx, callback) {
    const { width, height } = getHideSeekCanvasSize();
    ctx.save();
    ctx.scale(width / HIDE_SEEK_BASE_WIDTH, height / HIDE_SEEK_BASE_HEIGHT);
    callback();
    ctx.restore();
  }

  function getHideSeekMap() {
    return hideSeekMaps[hideSeekState.mode] || hideSeekMaps['roadside-lodge'] || Object.values(hideSeekMaps)[0] || null;
  }

  function getHideSeekRoom(roomId) {
    const map = getHideSeekMap();
    if (!map || !map.rooms) return null;
    return map.rooms[roomId] || map.rooms[map.startRoom];
  }

  function getHideSeekRoster() {
    if (players.length >= 2) return players.slice(0, 8);
    if (players.length === 1) return [players[0], { id: 'p2', name: 'P2' }];
    return [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }];
  }

  function getHideSeekPlayer(index) {
    const roster = getHideSeekRoster();
    return roster[index % roster.length] || roster[0];
  }

  function getHideSeekPlayerName(index) {
    return getHideSeekPlayer(index).name || `P${index + 1}`;
  }

  function getHideSeekMaxRounds() {
    return Number(hideSeekState.winnerGoal) || 5;
  }

  function getHideSeekActiveActor() {
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) return hideSeekState.actors.hider;
    if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) return hideSeekState.actors.seeker;
    return null;
  }

  function getHideSeekSpotById(spotId) {
    const map = getHideSeekMap();
    for (const room of Object.values(map.rooms)) {
      const spot = room.spots.find(item => item.id === spotId);
      if (spot) return Object.assign({ roomId: room.id }, spot);
    }
    return null;
  }

  function buildHideSeekSpotStates() {
    const map = getHideSeekMap();
    return Object.values(map.rooms).reduce((states, room) => {
      (room.spots || []).forEach(spot => {
        states[spot.id] = shouldDisableHideSeekSpot(room, spot) ? 'disabled' : 'empty';
      });
      return states;
    }, {});
  }

  function shouldDisableHideSeekSpot(room, spot) {
    return false;
  }

  function setHideSeekSpotState(spotId, state) {
    if (!spotId) return;
    hideSeekState.spotStates[spotId] = state;
  }

  function getHideSeekSpotState(spotId) {
    return hideSeekState.spotStates[spotId] || 'empty';
  }

  function getHideSeekSpotCenter(spot) {
    return {
      x: spot.x + spot.width / 2,
      y: spot.y + spot.height / 2,
    };
  }

  function placeHideSeekActorAtSpot(actor, spot) {
    actor.roomId = spot.roomId || actor.roomId;
    const bounds = getHideSeekRoomBounds(actor);
    actor.x = Math.max(bounds.minX, Math.min(bounds.maxX, spot.x + spot.width / 2 - actor.width / 2));
    actor.y = Math.max(bounds.minY, Math.min(bounds.maxY, spot.y + spot.height / 2 - actor.height / 2));
  }

  function getFallbackHideSeekSpot(actor) {
    const room = getHideSeekRoom(actor.roomId);
    return (room.spots || []).reduce((closest, spot) => {
      if (getHideSeekSpotState(spot.id) === 'disabled') return closest;
      const distance = getHideSeekDistanceToRect(actor, spot);
      if (!closest || distance < closest.distance) return Object.assign({ distance, roomId: room.id }, spot);
      return closest;
    }, null);
  }

  function getNearbyHideSeekSpot(actor) {
    if (!actor) return null;
    const room = getHideSeekRoom(actor.roomId);
    return room.spots.reduce((closest, spot) => {
      if (getHideSeekSpotState(spot.id) === 'disabled') return closest;
      const radius = spot.interactionRadius || Math.round(56 * HIDE_SEEK_SCALE);
      const distance = getHideSeekDistanceToRect(actor, spot);
      if (distance > radius) return closest;
      if (!closest || distance < closest.distance) return Object.assign({ distance, roomId: room.id }, spot);
      return closest;
    }, null);
  }

  function getHideSeekActorCenter(actor) {
    return {
      x: actor.x + actor.width / 2,
      y: actor.y + actor.height / 2,
    };
  }

  function getHideSeekCoverQuality(actor) {
    const nearbySpot = getNearbyHideSeekSpot(actor);
    if (!nearbySpot) {
      return {
        spot: null,
        score: 1,
        label: 'Risky',
        detail: 'Open floor. Bold choice, but easier to find.',
      };
    }
    const radius = nearbySpot.interactionRadius || Math.round(42 * HIDE_SEEK_SCALE);
    const closeness = Math.max(0, 1 - (nearbySpot.distance || 0) / radius);
    const score = Math.max(1, Math.min(5, Math.round((nearbySpot.difficulty || 3) * 0.72 + closeness * 2.1)));
    const label = score >= 5 ? 'Legendary cover' : score >= 4 ? 'Great cover' : score >= 3 ? 'Solid cover' : 'Risky cover';
    const qualityNote = score >= 5
      ? 'Hard to clear fast.'
      : score >= 4
        ? 'Strong line-of-sight break.'
        : score >= 3
          ? 'Decent, but not airtight.'
          : 'Easy to check if the seeker gets close.';
    return {
      spot: nearbySpot,
      score,
      label,
      detail: `${label} near the ${nearbySpot.label}. ${qualityNote}`,
    };
  }

  function noteHideSeekRoomVisit(roomId) {
    if (!roomId) return;
    const trail = Array.isArray(hideSeekState.roomTrail) ? hideSeekState.roomTrail.slice(-5) : [];
    if (trail[trail.length - 1] !== roomId) trail.push(roomId);
    hideSeekState.roomTrail = trail.slice(-5);
  }

  function getHideSeekSpotSearchText(spot, key, fallback) {
    if (!spot || !spot.searchText) return fallback;
    return spot.searchText[key] || fallback;
  }

  function getHideSeekSearchFeedback(sameRoom, distance, inspectedSpot) {
    if (sameRoom && distance <= HIDE_SEEK_SEARCH_TOLERANCE) {
      return {
        text: getHideSeekSpotSearchText(inspectedSpot, 'found', 'Found! Someone was squeezed into that cover.'),
        tone: 'found',
        result: 'found',
      };
    }
    const hiddenSpot = getHideSeekSpotById(hideSeekState.hiddenSpotId);
    const hiddenCenter = hiddenSpot ? getHideSeekSpotCenter(hiddenSpot) : null;
    const inspectedCenter = inspectedSpot ? getHideSeekSpotCenter(inspectedSpot) : null;
    const spotDistance = hiddenCenter && inspectedCenter
      ? Math.hypot(inspectedCenter.x - hiddenCenter.x, inspectedCenter.y - hiddenCenter.y)
      : distance;
    const noisy = hideSeekState.noiseLevel >= 0.55;
    const lowSearches = hideSeekState.searchesRemaining <= 2;
    if (sameRoom && spotDistance <= HIDE_SEEK_SEARCH_TOLERANCE * 2.15) {
      return {
        text: noisy || lowSearches
          ? 'Same room. Very close - something rustled near cover.'
          : 'Same room. Very close, but not this exact spot.',
        tone: 'hot',
        result: 'very close',
      };
    }
    if (sameRoom) {
      return {
        text: getHideSeekSpotSearchText(inspectedSpot, 'empty', noisy
          ? 'Same room. You hear something nearby, but this cover is empty.'
          : 'Same room, wrong cover. The room still feels suspicious.'),
        tone: noisy ? 'warm' : 'cold',
        result: 'same room',
      };
    }
    if (noisy && Math.random() < 0.55) {
      return {
        text: 'Different room. A tiny sound carries from somewhere else.',
        tone: 'warm',
        result: 'different room',
      };
    }
    return {
      text: getHideSeekSpotSearchText(inspectedSpot, 'empty', lowSearches
        ? 'Cold check. This room feels clear enough to move on.'
        : 'Cold check. That spot is empty.'),
      tone: 'cold',
      result: 'cold',
    };
  }

  function setHideSeekRoundMedal(found) {
    const coverScore = Number(hideSeekState.hiddenCoverQuality) || 1;
    const searchesUsed = hideSeekState.inspectionCount;
    let medal = '';
    if (found) {
      if (searchesUsed <= 1) medal = 'Lucky Guess';
      else if (hideSeekState.searchesRemaining <= 1) medal = 'Panic Search';
      else if (hideSeekState.wrongGuesses >= 3) medal = 'Room Sweeper';
    } else if (hideSeekState.peekCount === 0 && hideSeekState.noiseLevel < 0.35) {
      medal = 'Ghost Mode';
    } else if (hideSeekState.noiseLevel >= 0.65) {
      medal = 'Noisy Hider';
    } else if (coverScore >= 5) {
      medal = 'Perfect Cover';
    }
    hideSeekState.roundMedal = medal;
    return medal;
  }

  function setHideSeekSearchPulse(actor, tone) {
    const center = getHideSeekActorCenter(actor);
    hideSeekState.searchPulse = {
      x: center.x,
      y: center.y,
      roomId: actor.roomId,
      time: 0.9,
      maxTime: 0.9,
      tone,
    };
  }

  function spawnHideSeekParticles(x, y, roomId, options) {
    const settings = Object.assign({
      color: 'rgba(255,255,255,0.78)',
      count: 8,
      speed: 38,
      size: 3,
      life: 0.7,
      spread: Math.PI * 2,
      angle: -Math.PI / 2,
      gravity: 0,
    }, options || {});
    for (let index = 0; index < settings.count; index += 1) {
      const angle = settings.angle + (Math.random() - 0.5) * settings.spread;
      const speed = settings.speed * (0.45 + Math.random() * 0.75);
      hideSeekState.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        roomId,
        color: settings.color,
        size: settings.size * (0.75 + Math.random() * 0.8),
        life: settings.life,
        maxLife: settings.life,
        gravity: settings.gravity,
      });
    }
  }

  function updateHideSeekParticles(delta) {
    hideSeekState.particles = (hideSeekState.particles || []).filter(particle => {
      particle.life -= delta;
      particle.vy += particle.gravity * delta;
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      return particle.life > 0;
    });
  }

  function useHideSeekSpecialAction() {
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      peekHideSeekHider();
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      listenHideSeekSeeker();
    }
  }

  function listenHideSeekSeeker() {
    if (hideSeekState.listenUsed || hideSeekState.phase !== HideSeekGameState.SEEKER_TURN) return;
    hideSeekState.listenUsed = true;
    const seeker = hideSeekState.actors.seeker;
    const hiddenPosition = hideSeekState.hiddenPosition;
    const sameRoom = hiddenPosition && seeker.roomId === hiddenPosition.roomId;
    const hiddenSpot = getHideSeekSpotById(hideSeekState.hiddenSpotId);
    const noisy = hideSeekState.noiseLevel >= 0.55;
    let message = 'Listen used. The hider was very quiet.';
    let tone = 'cold';
    if (sameRoom && noisy) {
      message = `Listen used. A tiny rustle comes from cover in this room.`;
      tone = 'warm';
    } else if (sameRoom) {
      message = `Listen used. This room feels suspicious, but the exact spot stays hidden.`;
      tone = 'warm';
    } else if (noisy) {
      message = 'Listen used. You hear something from another room.';
      tone = 'warm';
    } else if (hideSeekState.searchesRemaining <= 2 && hiddenSpot) {
      message = `Listen used. Nothing clear, but ${hiddenSpot.label} would be a sneaky kind of cover.`;
    }
    setHideSeekSearchPulse(seeker, tone);
    setHideSeekMessage(message);
    hideSeekState.lastClue = message;
    playHideSeekTone('listen');
    renderHideSeek();
    setHideSeekMessage(message);
  }

  function peekHideSeekHider() {
    const actor = hideSeekState.actors.hider;
    const coverQuality = getHideSeekCoverQuality(actor);
    if (!coverQuality.spot) {
      setHideSeekMessage('Peek from cover. Out in the open, you are already visible.');
      playHideSeekTone('wrong');
      return;
    }
    addHideSeekNoise(actor, coverQuality.spot.noisy ? 0.38 : 0.22);
    hideSeekState.peekCount += 1;
    hideSeekState.hiderTimeRemaining = Math.max(0, hideSeekState.hiderTimeRemaining - 2);
    hideSeekState.shakingSpotId = coverQuality.spot.id;
    hideSeekState.shakeTime = 0.45;
    setHideSeekSearchPulse(actor, hideSeekState.noiseLevel >= 0.5 ? 'warm' : 'cold');
    spawnHideSeekParticles(actor.x + actor.width / 2, actor.y + actor.height / 2, actor.roomId, {
      color: 'rgba(255, 209, 102, 0.85)',
      count: 7,
      speed: 32,
      size: 3,
      life: 0.55,
    });
    setHideSeekMessage(`Peeked near the ${coverQuality.spot.label}. Noise risk is ${Math.round(hideSeekState.noiseLevel * 100)}%.`);
    playHideSeekTone('listen');
    renderHideSeek();
  }

  function addHideSeekNoise(actor, amount) {
    hideSeekState.noiseLevel = Math.min(1, hideSeekState.noiseLevel + amount);
    const nearbySpot = getNearbyHideSeekSpot(actor);
    if (!nearbySpot) return;
    if (hideSeekState.noiseLevel >= 0.55) {
      hideSeekState.shakingSpotId = nearbySpot.id;
      hideSeekState.shakeTime = Math.max(hideSeekState.shakeTime || 0, 0.28);
      spawnHideSeekParticles(nearbySpot.x + nearbySpot.width / 2, nearbySpot.y + nearbySpot.height / 2, nearbySpot.roomId || actor.roomId, {
        color: 'rgba(255, 220, 181, 0.7)',
        count: 4,
        speed: 22,
        size: 2,
        life: 0.45,
      });
    }
  }

  function setHideSeekMessage(message) {
    hideSeekState.message = message;
    if (hideSeekStatus) hideSeekStatus.textContent = message;
  }

  function playHideSeekTone(type) {
    try {
      hideSeekAudioContext = hideSeekAudioContext || new (window.AudioContext || window.webkitAudioContext)();
      const audio = hideSeekAudioContext;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const now = audio.currentTime;
      const tones = {
        hide: [440, 0.08],
        listen: [520, 0.1],
        wrong: [160, 0.12],
        found: [660, 0.18],
        door: [280, 0.07],
        tick: [820, 0.045],
      };
      const [frequency, duration] = tones[type] || tones.door;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.type = type === 'wrong' ? 'sawtooth' : 'square';
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch (error) {
      // Audio is optional; browsers may block or omit Web Audio.
    }
  }

  function stopHideSeekTimer() {
    if (hideSeekTimerInterval) {
      clearInterval(hideSeekTimerInterval);
      hideSeekTimerInterval = null;
    }
    if (hideSeekAnimationFrame) {
      cancelAnimationFrame(hideSeekAnimationFrame);
      hideSeekAnimationFrame = null;
    }
    hideSeekLastFrame = 0;
    if (hideSeekState.input) {
      hideSeekState.input.up = false;
      hideSeekState.input.down = false;
      hideSeekState.input.left = false;
      hideSeekState.input.right = false;
      hideSeekState.input.sprint = false;
    }
  }

  function getHideSeekScoreMap() {
    return getHideSeekRoster().reduce((scores, player) => {
      scores[player.id] = Math.max(0, Number(hideSeekState.hideScore[player.id]) || 0);
      return scores;
    }, {});
  }

  function renderHideSeekScoreboard() {
    renderScoreboard(hideSeekScoreboard, getHideSeekScoreMap());
  }

  function renderHideSeekMeta() {
    if (!hideSeekMeta) return;
    const room = getHideSeekRoom(hideSeekState.activeRoomId);
    if (!room) {
      hideSeekMeta.innerHTML = '';
      return;
    }
    const map = getHideSeekMap();
    const hiderName = getHideSeekPlayerName(hideSeekState.hiderIndex);
    const seekerName = getHideSeekPlayerName(hideSeekState.seekerIndex);
    const coverQuality = getHideSeekCoverQuality(hideSeekState.actors.hider);
    const isHiderTurn = hideSeekState.phase === HideSeekGameState.HIDER_TURN;
    const isSeekerTurn = hideSeekState.phase === HideSeekGameState.SEEKER_TURN;
    const counterValue = isHiderTurn
      ? `${Math.ceil(hideSeekState.hiderTimeRemaining)}s`
      : `${hideSeekState.searchesRemaining}`;
    const counterLabel = isHiderTurn ? 'Hide Timer' : 'Searches Left';
    const counterUrgent = (isHiderTurn && hideSeekState.hiderTimeRemaining <= 10)
      || (isSeekerTurn && hideSeekState.searchesRemaining <= 2);

    const cards = [
      ['Map', map.name],
      ['Room', room.name],
      ['Roles', `${hiderName} hides · ${seekerName} seeks`],
      [counterLabel, counterValue, counterUrgent],
    ];

    if (isHiderTurn) {
      cards.push(['Cover', coverQuality.label]);
      cards.push(['Noise', `${Math.round(hideSeekState.noiseLevel * 100)}%`]);
      cards.push(['Sprint', `${Math.round(hideSeekState.stamina)}%`]);
    } else if (isSeekerTurn) {
      cards.push(['Wrong Checks', String(hideSeekState.wrongGuesses)]);
      cards.push(['Sprint', `${Math.round(hideSeekState.stamina)}%`]);
    }

    hideSeekMeta.innerHTML = '';
    cards.forEach(([label, value, urgent]) => {
      const card = document.createElement('div');
      card.className = 'hide-seek-meta-card';
      if (urgent) card.classList.add('is-urgent');

      const title = document.createElement('strong');
      title.textContent = label;
      const detail = document.createElement('span');
      detail.textContent = value;

      card.appendChild(title);
      card.appendChild(detail);
      hideSeekMeta.appendChild(card);
    });
  }

  function resetHideSeekActors() {
    const map = getHideSeekMap();
    const startRoom = map.startRoom;
    hideSeekState.actors = {
      hider: createHideSeekActor(startRoom, true, '#2ec7d3'),
      seeker: createHideSeekActor(startRoom, false, '#f58220'),
    };
    hideSeekState.activeRoomId = startRoom;
    hideSeekState.roomTrail = [startRoom];
  }

  function resetHideSeekRoundState(phase) {
    resetHideSeekActors();
    hideSeekState.phase = phase || HideSeekGameState.ROUND_START;
    hideSeekState.hiddenSpotId = null;
    hideSeekState.hiddenSpotLabel = '';
    hideSeekState.hiddenPosition = null;
    hideSeekState.hiddenCoverQuality = 1;
    hideSeekState.hiddenCoverLabel = 'Risky';
    hideSeekState.spotStates = buildHideSeekSpotStates();
    hideSeekState.noiseLevel = 0;
    hideSeekState.stamina = HIDE_SEEK_MAX_STAMINA;
    hideSeekState.inspectedSpotId = null;
    hideSeekState.inspectTime = 0;
    hideSeekState.inspectionCount = 0;
    hideSeekState.repeatInspectionCount = 0;
    hideSeekState.peekCount = 0;
    hideSeekState.searchesRemaining = getHideSeekSearchCount(hideSeekState.difficulty);
    hideSeekState.hiderTimeRemaining = HIDE_SEEK_HIDE_SECONDS;
    hideSeekState.wrongGuesses = 0;
    hideSeekState.listenUsed = false;
    hideSeekState.roundMedal = '';
    hideSeekState.lastClue = '';
    hideSeekState.roundHiderScore = 0;
    hideSeekState.roundSeekerScore = 0;
    hideSeekState.revealPulse = 0;
    hideSeekState.searchPulse = null;
    hideSeekState.roomTrail = [hideSeekState.activeRoomId];
    hideSeekState.particles = [];
    hideSeekState.cameraShake = 0;
    hideSeekState.coverGlowPulse = 0;
    hideSeekState.lastUrgentSecond = null;
  }

  function renderHideSeek() {
    const hiderName = getHideSeekDisplayName(hideSeekState.hiderIndex);
    const seekerName = getHideSeekDisplayName(hideSeekState.seekerIndex);
    const maxRounds = getHideSeekMaxRounds();
    const nearbySpot = getNearbyHideSeekSpot(getHideSeekActiveActor());
    const room = getHideSeekRoom(hideSeekState.activeRoomId);
    const phaseLabel = {
      TITLE: 'Setup',
      ROUND_START: 'Ready',
      HIDER_TURN: 'Hide',
      SEEKER_LOOK_AWAY: 'Pass',
      SEEKER_TURN: 'Seek',
      FOUND: 'Found',
      ROUND_RESULTS: 'Results',
      GAME_OVER: 'Game Over',
    }[hideSeekState.phase] || 'Ready';

    renderHideSeekScoreboard();
    renderHideSeekMeta();
    hideSeekMode.value = hideSeekState.mode;
    hideSeekCountdown.value = String(hideSeekState.difficulty);
    hideSeekWinner.value = String(hideSeekState.winnerGoal);
    hideSeekBadge.textContent = phaseLabel;
    hideSeekPhase.textContent = phaseLabel;
    hideSeekCountdownText.hidden = ![HideSeekGameState.HIDER_TURN, HideSeekGameState.SEEKER_TURN, HideSeekGameState.FOUND, HideSeekGameState.ROUND_RESULTS].includes(hideSeekState.phase);
    hideSeekCountdownText.textContent = getHideSeekTimerLabel();

    hideSeekStartButton.hidden = ![HideSeekGameState.TITLE, HideSeekGameState.ROUND_START, HideSeekGameState.GAME_OVER].includes(hideSeekState.phase);
    hideSeekFoundButton.hidden = ![HideSeekGameState.HIDER_TURN, HideSeekGameState.SEEKER_LOOK_AWAY, HideSeekGameState.SEEKER_TURN].includes(hideSeekState.phase);
    hideSeekSpecialButton.hidden = ![HideSeekGameState.HIDER_TURN, HideSeekGameState.SEEKER_TURN].includes(hideSeekState.phase);
    hideSeekSprintButton.hidden = ![HideSeekGameState.HIDER_TURN, HideSeekGameState.SEEKER_TURN].includes(hideSeekState.phase);
    hideSeekNextButton.hidden = ![HideSeekGameState.FOUND, HideSeekGameState.ROUND_RESULTS].includes(hideSeekState.phase);
    hideSeekFoundButton.disabled = false;
    hideSeekSpecialButton.disabled = false;
    hideSeekSprintButton.disabled = hideSeekState.stamina <= 1 || hideSeekState.inspectTime > 0;
    hideSeekSprintButton.textContent = `Sprint ${Math.round(hideSeekState.stamina)}%`;
    hideSeekDebugButton.textContent = hideSeekDebugEnabled ? 'Debug: On' : 'Debug: Off';
    hideSeekDebugButton.setAttribute('aria-pressed', hideSeekDebugEnabled ? 'true' : 'false');
    hideSeekDebugButton.classList.toggle('is-active', hideSeekDebugEnabled);
    hideSeekNextButton.textContent = hideSeekRound >= maxRounds ? 'See Winner' : 'Next Round';
    renderHideSeekDebugPanel();

    if (hideSeekState.phase === HideSeekGameState.TITLE || hideSeekState.phase === HideSeekGameState.GAME_OVER) {
      hideSeekStartButton.textContent = hideSeekState.phase === HideSeekGameState.GAME_OVER ? 'Play Again' : 'Start Match';
    } else {
      hideSeekStartButton.textContent = 'Start Hider Turn';
    }

    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      hideSeekFoundButton.textContent = nearbySpot ? 'Hide Here' : 'Move Closer to Cover';
      hideSeekFoundButton.setAttribute('aria-label', nearbySpot ? 'Hide here' : 'Move closer to cover');
      hideSeekFoundButton.disabled = false;
      hideSeekSpecialButton.textContent = 'Peek';
      hideSeekSpecialButton.setAttribute('aria-label', 'Peek and risk making noise');
      const coverQuality = getHideSeekCoverQuality(hideSeekState.actors.hider);
      hideSeekRoundTitle.textContent = `${hiderName}, you have ${Math.ceil(hideSeekState.hiderTimeRemaining)} seconds to hide.`;
      hideSeekRoundText.textContent = coverQuality.spot
        ? `${coverQuality.detail} Hide Here locks it in. Peek helps you scout, but it raises your noise.`
        : `Move next to a glowing hiding spot. The Hide Here button turns on when cover is in reach.`;
      setHideSeekMessage(coverQuality.spot ? coverQuality.detail : `${hiderName} is looking for cover.`);
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_LOOK_AWAY) {
      hideSeekFoundButton.textContent = 'Start Seeking';
      hideSeekFoundButton.setAttribute('aria-label', `${seekerName} starts searching`);
      hideSeekRoundTitle.textContent = `${hiderName} is hidden.`;
      hideSeekRoundText.textContent = `Pass the phone to ${seekerName}. The map resets to the start room, and each wrong unique inspection uses one search.`;
      setHideSeekMessage(`${seekerName}, no peeking until you tap start searching.`);
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      hideSeekFoundButton.textContent = nearbySpot ? 'Inspect Spot' : 'Move Closer to Inspect';
      hideSeekFoundButton.setAttribute('aria-label', nearbySpot ? 'Inspect this hiding spot' : 'Move closer to inspect');
      hideSeekFoundButton.disabled = hideSeekState.inspectTime > 0;
      hideSeekSpecialButton.textContent = hideSeekState.listenUsed ? 'Listen Used' : 'Listen';
      hideSeekSpecialButton.disabled = hideSeekState.listenUsed || hideSeekState.inspectTime > 0;
      hideSeekSpecialButton.setAttribute('aria-label', 'Listen for a vague clue');
      hideSeekRoundTitle.textContent = `${seekerName}, find the hider.`;
      hideSeekRoundText.textContent = nearbySpot
        ? `You are close to the ${nearbySpot.label}. Inspect it when you are ready.`
        : `Move beside a glowing cover spot to inspect it. Listen gives one vague clue and does not spend a search.`;
      setHideSeekMessage(hideSeekState.lastClue || `${seekerName} is searching ${room.name}. Searches left: ${hideSeekState.searchesRemaining}.`);
    } else if (hideSeekState.phase === HideSeekGameState.FOUND || hideSeekState.phase === HideSeekGameState.ROUND_RESULTS) {
      hideSeekRoundTitle.textContent = hideSeekState.phase === HideSeekGameState.FOUND
        ? `Found near the ${hideSeekState.hiddenSpotLabel.replace(/^near the /, '')}!`
        : `${hiderName} survived!`;
      hideSeekRoundText.textContent = hideSeekState.lastRoundText || `${hiderName} was hidden ${hideSeekState.hiddenSpotLabel}.`;
      setHideSeekMessage(hideSeekState.lastRoundText || 'Round complete.');
    } else if (hideSeekState.phase === HideSeekGameState.GAME_OVER) {
      hideSeekRoundTitle.textContent = 'Hide & Seek is complete.';
      hideSeekRoundText.textContent = 'Check the scoreboard, play again, or finish to the summary screen.';
      setHideSeekMessage('Match complete.');
    } else {
      hideSeekRoundTitle.textContent = `Round ${hideSeekRound + 1}: ${hiderName} hides, ${seekerName} seeks.`;
      hideSeekRoundText.textContent = `Use ${getHideSeekMap().name}. Hider moves first, then passes the phone to the seeker.`;
      setHideSeekMessage(`Ready for round ${hideSeekRound + 1}.`);
    }

    applyHideSeekAIControlVisibility();
    renderHideSeekOverlay();
    drawHideSeek();
  }

  // Hides the human movement pad and action buttons while the computer is
  // driving the current turn, and shows a short status instead.
  function applyHideSeekAIControlVisibility() {
    const aiControlling = isHideSeekAIControlling();
    if (hideSeekControls) hideSeekControls.hidden = aiControlling;
    if (aiControlling) {
      hideSeekFoundButton.hidden = true;
      hideSeekSpecialButton.hidden = true;
      hideSeekSprintButton.hidden = true;
      if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
        setHideSeekMessage(`Computer is searching… Searches left: ${hideSeekState.searchesRemaining}.`);
      }
    }
  }

  function renderHideSeekOverlay() {
    if (!hideSeekOverlay) return;
    const hiderName = getHideSeekPlayerName(hideSeekState.hiderIndex);
    const seekerName = getHideSeekPlayerName(hideSeekState.seekerIndex);
    const overlayText = {
      TITLE: ['Hide & Seek Adventure', 'Start a match, enter a hiding spot, then pass the phone between hider and seeker.'],
      ROUND_START: [`${seekerName}, look away`, `${hiderName} gets the next hiding turn.`],
      SEEKER_LOOK_AWAY: [`${seekerName}, your turn`, 'The hider is locked in. Tap start searching when the phone is yours.'],
      GAME_OVER: ['Match complete', 'Play again or finish to see the final summary.'],
    }[hideSeekState.phase];
    hideSeekOverlay.hidden = !overlayText;
    if (overlayText) {
      hideSeekOverlay.innerHTML = '';
      const title = document.createElement('strong');
      title.textContent = overlayText[0];
      const detail = document.createElement('span');
      detail.textContent = overlayText[1];
      hideSeekOverlay.appendChild(title);
      hideSeekOverlay.appendChild(detail);
    }
  }

  function hideSeekAdvancePlayers() {
    const roster = getHideSeekRoster();
    const nextHider = (hideSeekState.hiderIndex + 1) % roster.length;
    hideSeekState.hiderIndex = nextHider;
    hideSeekState.seekerIndex = (nextHider + 1) % roster.length;
  }

  function startHideSeekLoop() {
    if (!hideSeekCanvas || hideSeekAnimationFrame) return;
    hideSeekLastFrame = 0;
    hideSeekAnimationFrame = requestAnimationFrame(updateHideSeekLoop);
  }

  function updateHideSeekLoop(timestamp) {
    if (!hideSeekCanvas) return;
    const delta = hideSeekLastFrame ? Math.min(0.05, (timestamp - hideSeekLastFrame) / 1000) : 0;
    hideSeekLastFrame = timestamp;
    updateHideSeek(delta);
    drawHideSeek();
    hideSeekAnimationFrame = requestAnimationFrame(updateHideSeekLoop);
  }

  function startHideSeekRound() {
    if (hideSeekState.phase === HideSeekGameState.GAME_OVER) {
      resetHideSeek();
    }
    hideSeekState.mode = hideSeekMode.value || 'roadside-lodge';
    hideSeekState.difficulty = hideSeekCountdown.value || HIDE_SEEK_DEFAULT_DIFFICULTY;
    hideSeekState.winnerGoal = hideSeekWinner.value || '5';
    resetHideSeekRoundState(HideSeekGameState.HIDER_TURN);
    startHideSeekLoop();
    playHideSeekTone('door');
    renderHideSeek();
    maybeStartHideSeekComputerTurn();
  }

  function beginHideSeekSeekerTurn() {
    const map = getHideSeekMap();
    hideSeekState.phase = HideSeekGameState.SEEKER_TURN;
    hideSeekState.searchesRemaining = getHideSeekSearchCount(hideSeekState.difficulty);
    hideSeekState.listenUsed = false;
    hideSeekState.lastClue = '';
    hideSeekState.lastUrgentSecond = null;
    hideSeekState.actors.seeker = createHideSeekActor(map.startRoom, true, '#f58220');
    hideSeekState.activeRoomId = map.startRoom;
    playHideSeekTone('door');
    renderHideSeek();
  }

  function markHideSeekFound() {
    const actor = getHideSeekActiveActor();
    if (hideSeekState.phase === HideSeekGameState.SEEKER_LOOK_AWAY) {
      beginHideSeekSeekerTurn();
      return;
    }
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      lockHideSeekHiderPosition('button', getNearbyHideSeekSpot(actor));
      return;
    }
    if (hideSeekState.phase !== HideSeekGameState.SEEKER_TURN) return;
    searchHideSeekPosition();
  }

  function lockHideSeekHiderPosition(source, preferredSpot = null) {
    if (hideSeekState.phase !== HideSeekGameState.HIDER_TURN) return;
    const actor = hideSeekState.actors.hider;
    let nearbySpot = preferredSpot || getNearbyHideSeekSpot(actor);
    let coverQuality = getHideSeekCoverQuality(actor);
    if (nearbySpot && (!coverQuality.spot || coverQuality.spot.id !== nearbySpot.id)) {
      const radius = nearbySpot.interactionRadius || Math.round(42 * HIDE_SEEK_SCALE);
      const closeness = Math.max(0, 1 - (nearbySpot.distance || 0) / radius);
      const score = Math.max(1, Math.min(5, Math.round((nearbySpot.difficulty || 3) * 0.72 + closeness * 2.1)));
      const label = score >= 5 ? 'Legendary cover' : score >= 4 ? 'Great cover' : score >= 3 ? 'Solid cover' : 'Risky cover';
      const qualityNote = score >= 5
        ? 'Hard to clear fast.'
        : score >= 4
          ? 'Strong line-of-sight break.'
          : score >= 3
            ? 'Decent, but not airtight.'
            : 'Easy to check if the seeker gets close.';
      coverQuality = {
        spot: nearbySpot,
        score,
        label,
        detail: `${label} near the ${nearbySpot.label}. ${qualityNote}`,
      };
    } else {
      nearbySpot = coverQuality.spot;
    }
    if (!nearbySpot && source !== 'timer') {
      // Mirror the inspect warning: do NOT re-render here, or the default
      // hider-turn status text overwrites this warning.
      playHideSeekTone('wrong');
      setHideSeekMessage('Not a hiding spot — move right next to cover. Spots glow when you are close enough to hide.');
      return;
    }
    if (!nearbySpot) {
      nearbySpot = getFallbackHideSeekSpot(actor);
      if (nearbySpot) {
        placeHideSeekActorAtSpot(actor, nearbySpot);
        coverQuality = getHideSeekCoverQuality(actor);
        nearbySpot = coverQuality.spot || nearbySpot;
      }
    }
    if (!nearbySpot) return;
    hideSeekState.hiddenSpotId = nearbySpot ? nearbySpot.id : null;
    hideSeekState.hiddenSpotLabel = nearbySpot ? `near the ${nearbySpot.label}` : 'somewhere sneaky';
    hideSeekState.hiddenCoverQuality = coverQuality.score;
    hideSeekState.hiddenCoverLabel = coverQuality.label;
    hideSeekState.hiddenRoomId = actor.roomId;
    setHideSeekSpotState(nearbySpot.id, 'occupied');
    addHideSeekNoise(actor, nearbySpot.noisy ? 0.45 : 0.18);
    spawnHideSeekParticles(actor.x + actor.width / 2, actor.y + actor.height / 2, actor.roomId, {
      color: 'rgba(46, 199, 211, 0.82)',
      count: 14,
      speed: 44,
      size: 3,
      life: 0.7,
    });
    hideSeekState.cameraShake = Math.max(hideSeekState.cameraShake, 0.18);
    hideSeekState.hiddenPosition = {
      x: actor.x,
      y: actor.y,
      roomId: actor.roomId,
    };
    hideSeekState.actors.hider.visible = false;
    hideSeekState.phase = HideSeekGameState.SEEKER_LOOK_AWAY;
    hideSeekState.hiderTimeRemaining = source === 'timer' ? 0 : hideSeekState.hiderTimeRemaining;
    playHideSeekTone('hide');
    setHideSeekMessage(`${coverQuality.label}. Phone pass time.`);
    renderHideSeek();
    // Solo: when the computer is the seeker, no phone pass is needed — let the
    // AI start searching right away.
    if (hideSeekSoloEnabled && isHideSeekComputerSeeker()) {
      hideSeekAI.lastRoom = null;
      beginHideSeekSeekerTurn();
    }
  }

  function searchHideSeekPosition() {
    const hider = getHideSeekPlayer(hideSeekState.hiderIndex);
    const seeker = getHideSeekPlayer(hideSeekState.seekerIndex);
    const actor = hideSeekState.actors.seeker;
    const inspectedSpot = getNearbyHideSeekSpot(actor);
    const hiddenPosition = hideSeekState.hiddenPosition;
    if (!hiddenPosition) return;
    if (!inspectedSpot) {
      setHideSeekMessage('No hiding spot in reach — move right next to cover, then inspect. Spots glow when you are close enough.');
      playHideSeekTone('wrong');
      return;
    }
    const inspectedState = getHideSeekSpotState(inspectedSpot.id);
    const isDuplicateWrongSearch = inspectedSpot.id !== hideSeekState.hiddenSpotId && inspectedState === 'searched';
    if (isDuplicateWrongSearch) {
      setHideSeekMessage('You already checked there.');
      playHideSeekTone('wrong');
      renderHideSeek();
      return;
    }
    hideSeekState.inspectedSpotId = inspectedSpot.id;
    hideSeekState.inspectTime = HIDE_SEEK_INSPECT_SECONDS;
    hideSeekState.inspectionCount += 1;
    const sameRoom = inspectedSpot.roomId ? inspectedSpot.roomId === hiddenPosition.roomId : actor.roomId === hiddenPosition.roomId;
    const inspectedCenter = getHideSeekSpotCenter(inspectedSpot);
    const hiddenCenter = {
      x: hiddenPosition.x + hideSeekState.actors.hider.width / 2,
      y: hiddenPosition.y + hideSeekState.actors.hider.height / 2,
    };
    const distance = Math.hypot(inspectedCenter.x - hiddenCenter.x, inspectedCenter.y - hiddenCenter.y);
    hideSeekDebug.lastInspect = {
      inspectedId: inspectedSpot.id,
      hiddenId: hideSeekState.hiddenSpotId,
      distance,
      match: inspectedSpot.id === hideSeekState.hiddenSpotId,
    };
    if (hideSeekDebugEnabled) {
      hideSeekDebugLog(
        `Inspect ${inspectedSpot.id}: ` +
        `${inspectedSpot.id === hideSeekState.hiddenSpotId ? 'FOUND (exact spot match)' : 'not there'} ` +
        `dist=${Math.round(distance)} tol=${HIDE_SEEK_SEARCH_TOLERANCE}`
      );
    }
    const feedback = getHideSeekSearchFeedback(sameRoom, distance, inspectedSpot);
    setHideSeekSearchPulse(actor, feedback.tone);
    if (inspectedSpot.id !== hideSeekState.hiddenSpotId) {
      hideSeekState.wrongGuesses += 1;
      hideSeekState.searchesRemaining = Math.max(0, hideSeekState.searchesRemaining - 1);
      setHideSeekSpotState(inspectedSpot.id, 'searched');
      hideSeekState.shakingSpotId = inspectedSpot.id;
      hideSeekState.shakeTime = 0.55;
      spawnHideSeekParticles(inspectedCenter.x, inspectedCenter.y, actor.roomId, {
        color: 'rgba(154, 164, 178, 0.75)',
        count: 9,
        speed: 34,
        size: 3,
        life: 0.62,
      });
      hideSeekState.cameraShake = Math.max(hideSeekState.cameraShake, 0.12);
      hideSeekState.lastClue = `${feedback.text} ${hideSeekState.searchesRemaining} searches left.`;
      setHideSeekMessage(hideSeekState.lastClue);
      playHideSeekTone('wrong');
      renderHideSeek();
      if (hideSeekState.searchesRemaining <= 0) {
        hideSeekSeekerFailed();
      } else {
        setHideSeekMessage(hideSeekState.lastClue);
      }
      return;
    }

    setHideSeekSpotState(inspectedSpot.id, 'found');
    const foundSpot = getHideSeekSpotById(hideSeekState.hiddenSpotId) || {
      label: hideSeekState.hiddenSpotLabel || 'hiding place',
      difficulty: 3,
      x: hiddenPosition.x,
      y: hiddenPosition.y,
      width: 24,
      height: 32,
    };
    const searchesUsed = hideSeekState.inspectionCount;
    const coverScore = Number(hideSeekState.hiddenCoverQuality) || foundSpot.difficulty || 3;
    const cleanInspectBonus = Math.max(0, 160 - hideSeekState.inspectionCount * 22);
    const stealthBonus = Math.max(0, 120 - hideSeekState.peekCount * 35 - Math.round(hideSeekState.noiseLevel * 70));
    hideSeekState.roundSeekerScore = Math.max(0, Math.round(1200 - searchesUsed * 70 - hideSeekState.wrongGuesses * 90 + coverScore * 55 + cleanInspectBonus));
    hideSeekState.roundHiderScore = Math.max(0, Math.round((searchesUsed - 1) * 35 + coverScore * 125 + (HIDE_SEEK_HIDE_SECONDS - hideSeekState.hiderTimeRemaining) * 3 + stealthBonus));
    hideSeekState.hideScore[seeker.id] = (hideSeekState.hideScore[seeker.id] || 0) + hideSeekState.roundSeekerScore;
    hideSeekState.hideScore[hider.id] = (hideSeekState.hideScore[hider.id] || 0) + hideSeekState.roundHiderScore;
    hideSeekState.phase = HideSeekGameState.FOUND;
    hideSeekState.revealPulse = 1.4;
    hideSeekState.cameraShake = Math.max(hideSeekState.cameraShake, 0.45);
    revealHideSeekHider(foundSpot);
    hideSeekRound += 1;
    const medal = setHideSeekRoundMedal(true);
    hideSeekState.lastRoundText = `${getHideSeekDisplayName(hideSeekState.seekerIndex)} found ${getHideSeekDisplayName(hideSeekState.hiderIndex)} ${hideSeekState.hiddenSpotLabel}. ${feedback.text} Cover: ${hideSeekState.hiddenCoverLabel}. Searches used: ${hideSeekState.inspectionCount}. ${getHideSeekDisplayName(hideSeekState.seekerIndex)}: +${hideSeekState.roundSeekerScore}. ${getHideSeekDisplayName(hideSeekState.hiderIndex)}: +${hideSeekState.roundHiderScore}.${medal ? ` Medal: ${medal}.` : ''}`;
    playHideSeekTone('found');
    renderHideSeek();
  }

  function revealHideSeekHider(spot) {
    const hiddenPosition = hideSeekState.hiddenPosition;
    const roomId = hiddenPosition ? hiddenPosition.roomId : hideSeekState.hiddenRoomId || hideSeekState.activeRoomId;
    if (hideSeekState.hiddenSpotId) setHideSeekSpotState(hideSeekState.hiddenSpotId, 'found');
    hideSeekState.actors.hider.visible = true;
    hideSeekState.actors.hider.roomId = roomId;
    hideSeekState.actors.hider.x = hiddenPosition ? hiddenPosition.x : Math.min(760, spot.x + spot.width / 2);
    hideSeekState.actors.hider.y = hiddenPosition ? hiddenPosition.y : Math.min(390, spot.y + spot.height / 2);
    hideSeekState.actors.seeker.roomId = roomId;
    hideSeekState.activeRoomId = roomId;
    spawnHideSeekParticles(
      hideSeekState.actors.hider.x + hideSeekState.actors.hider.width / 2,
      hideSeekState.actors.hider.y + hideSeekState.actors.hider.height / 2,
      roomId,
      {
        color: 'rgba(245, 130, 32, 0.92)',
        count: 22,
        speed: 82,
        size: 4,
        life: 0.95,
        gravity: 34,
      }
    );
  }

  function hideSeekSeekerFailed() {
    if (hideSeekState.phase !== HideSeekGameState.SEEKER_TURN) return;
    const hider = getHideSeekPlayer(hideSeekState.hiderIndex);
    const spot = getHideSeekSpotById(hideSeekState.hiddenSpotId);
    const difficulty = Number(hideSeekState.hiddenCoverQuality) || (spot ? spot.difficulty : 3);
    const stealthBonus = Math.max(0, 180 - hideSeekState.peekCount * 35 - Math.round(hideSeekState.noiseLevel * 90));
    hideSeekState.roundSeekerScore = 0;
    hideSeekState.roundHiderScore = 1000 + difficulty * 150 + Math.round(hideSeekState.hiderTimeRemaining * 8) + stealthBonus;
    hideSeekState.hideScore[hider.id] = (hideSeekState.hideScore[hider.id] || 0) + hideSeekState.roundHiderScore;
    hideSeekState.phase = HideSeekGameState.ROUND_RESULTS;
    hideSeekState.cameraShake = Math.max(hideSeekState.cameraShake, 0.25);
    revealHideSeekHider(spot || createHideSeekActor(hideSeekState.activeRoomId, true, '#2ec7d3'));
    hideSeekRound += 1;
    const medal = setHideSeekRoundMedal(false);
    hideSeekState.lastRoundText = `${getHideSeekDisplayName(hideSeekState.hiderIndex)} vanished ${hideSeekState.hiddenSpotLabel}. The seeker ran out of searches before clearing the right cover. Cover: ${hideSeekState.hiddenCoverLabel}. Peeks: ${hideSeekState.peekCount}. ${getHideSeekDisplayName(hideSeekState.hiderIndex)}: +${hideSeekState.roundHiderScore}.${medal ? ` Medal: ${medal}.` : ''}`;
    playHideSeekTone('wrong');
    renderHideSeek();
  }

  function nextHideSeekRound() {
    if (hideSeekRound >= getHideSeekMaxRounds()) {
      hideSeekState.phase = HideSeekGameState.GAME_OVER;
      renderHideSeek();
      showHideSeekSummary();
      return;
    }
    hideSeekAdvancePlayers();
    resetHideSeekRoundState(HideSeekGameState.HIDER_TURN);
    playHideSeekTone('door');
    renderHideSeek();
    maybeStartHideSeekComputerTurn();
  }

  // ---- Solo vs Computer (single-player AI) ----------------------------------

  function isHideSeekComputerHider() {
    return hideSeekSoloEnabled && hideSeekState.hiderIndex !== HIDE_SEEK_HUMAN_INDEX;
  }

  function isHideSeekComputerSeeker() {
    return hideSeekSoloEnabled && hideSeekState.seekerIndex !== HIDE_SEEK_HUMAN_INDEX;
  }

  // True while the computer is actively driving the current turn (used to hide
  // the human controls so the player does not fight the AI).
  function isHideSeekAIControlling() {
    return (hideSeekState.phase === HideSeekGameState.HIDER_TURN && isHideSeekComputerHider())
      || (hideSeekState.phase === HideSeekGameState.SEEKER_TURN && isHideSeekComputerSeeker());
  }

  function getHideSeekDisplayName(index) {
    if (hideSeekSoloEnabled && index !== HIDE_SEEK_HUMAN_INDEX) return 'Computer';
    return getHideSeekPlayerName(index);
  }

  function getHideSeekAIProfile() {
    return HIDE_SEEK_AI_PROFILES[hideSeekState.difficulty] || HIDE_SEEK_AI_PROFILES[HIDE_SEEK_DEFAULT_DIFFICULTY];
  }

  function chooseWeightedHideSeekItem(items, getWeight) {
    const weighted = items.map(item => ({ item, weight: Math.max(0.01, Number(getWeight(item)) || 0.01) }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let marker = Math.random() * total;
    for (const entry of weighted) {
      marker -= entry.weight;
      if (marker <= 0) return entry.item;
    }
    return weighted[weighted.length - 1] ? weighted[weighted.length - 1].item : null;
  }

  // If it is the computer's turn to hide, pick a weighted valid spot anywhere on
  // the map and lock it in, then hand the seeker turn to the human.
  function maybeStartHideSeekComputerTurn() {
    if (!hideSeekSoloEnabled) return;
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN && isHideSeekComputerHider()) {
      hideSeekComputerHide();
    }
  }

  function hideSeekComputerHide() {
    if (hideSeekState.phase !== HideSeekGameState.HIDER_TURN) return;
    const hider = hideSeekState.actors.hider;
    const profile = getHideSeekAIProfile();
    const spots = getAllHideSeekSpots().filter(spot => getHideSeekSpotState(spot.id) !== 'disabled');
    if (!spots.length) return;
    const spot = chooseWeightedHideSeekItem(spots, item => {
      const difficulty = Number(item.difficulty) || 3;
      const difficultyWeight = hideSeekState.difficulty === 'easy'
        ? Math.pow(6 - difficulty, 1.6)
        : Math.pow(difficulty, hideSeekState.difficulty === 'hard' ? 2.1 : 1.35);
      const startRoomPenalty = item.roomId === getHideSeekMap().startRoom ? 0.82 : 1.18;
      const noisyPenalty = item.noisy && hideSeekState.difficulty === 'hard' ? 0.7 : 1;
      return difficultyWeight * startRoomPenalty * noisyPenalty * (0.75 + Math.random() * 0.7);
    });
    if (!spot) return;
    hider.roomId = spot.roomId;
    hideSeekState.activeRoomId = spot.roomId;
    placeHideSeekActorAtSpot(hider, spot);
    hideSeekSelectedSpotId = spot.id;
    if (hideSeekDebugEnabled) hideSeekDebugLog(`Computer hid at ${spot.id} (${spot.label}).`);
    lockHideSeekHiderPosition('button', spot);
    // Single player: no phone pass needed — start the human's seeker turn.
    if (hideSeekState.phase === HideSeekGameState.SEEKER_LOOK_AWAY) {
      beginHideSeekSeekerTurn();
    }
  }

  // Fair AI seeker: inspect plausible nearby cover, then steer room to room.
  function roomHasUnsearchedHideSeekSpots(roomId) {
    const room = getHideSeekRoom(roomId);
    return ((room && room.spots) || []).some(spot => {
      const state = getHideSeekSpotState(spot.id);
      return state !== 'disabled' && state !== 'searched' && state !== 'found';
    });
  }

  function chooseHideSeekAISeekerTarget(seeker, room, profile) {
    const hiddenSpot = getHideSeekSpotById(hideSeekState.hiddenSpotId);
    const noisy = hideSeekState.noiseLevel >= 0.55;
    const candidates = (room.spots || [])
      .filter(spot => {
        const state = getHideSeekSpotState(spot.id);
        return state !== 'disabled' && state !== 'searched' && state !== 'found';
      })
      .map(spot => {
        const distance = getHideSeekDistanceToRect(seeker, spot);
        const difficulty = Number(spot.difficulty) || 3;
        const hiddenSignal = hiddenSpot && hiddenSpot.roomId === room.id && spot.id === hiddenSpot.id
          ? profile.prefersNoise * (noisy ? 130 : 45)
          : 0;
        const spotNoiseSignal = spot.noisy ? profile.prefersNoise * 28 : 0;
        const difficultySignal = difficulty * profile.prefersDifficulty * 15;
        const mistakeNoise = Math.random() < profile.mistakeChance ? Math.random() * 190 : 0;
        return {
          spot,
          distance,
          score: distance - hiddenSignal - spotNoiseSignal - difficultySignal + mistakeNoise,
        };
      })
      .sort((a, b) => a.score - b.score);
    if (!candidates.length) return null;
    if (Math.random() < profile.mistakeChance) {
      return candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))];
    }
    return candidates[0];
  }

  function chooseHideSeekAIExit(room, profile) {
    const exits = room.exits || [];
    if (!exits.length) return null;
    const hiddenSpot = getHideSeekSpotById(hideSeekState.hiddenSpotId);
    const noisy = hideSeekState.noiseLevel >= 0.55;
    const usefulExits = exits.filter(exit => roomHasUnsearchedHideSeekSpots(exit.targetRoom));
    const candidates = usefulExits.length ? usefulExits : exits;
    return chooseWeightedHideSeekItem(candidates, exit => {
      const revisitPenalty = exit.targetRoom === hideSeekAI.lastRoom ? 0.55 : 1;
      const hiddenRoomSignal = hiddenSpot && hiddenSpot.roomId === exit.targetRoom
        ? 1 + profile.roomDistance + (noisy ? profile.prefersNoise : 0)
        : 1;
      return revisitPenalty * hiddenRoomSignal * (0.8 + Math.random() * 0.45);
    });
  }

  function updateHideSeekAISeeker(delta) {
    const seeker = hideSeekState.actors.seeker;
    const room = getHideSeekRoom(seeker.roomId);
    if (!room) return;
    const profile = getHideSeekAIProfile();
    hideSeekAI.thinkTimer = Math.max(0, hideSeekAI.thinkTimer - delta);

    const target = chooseHideSeekAISeekerTarget(seeker, room, profile);

    if (target) {
      const near = getNearbyHideSeekSpot(seeker);
      if (near && near.id === target.spot.id) {
        hideSeekState.touchTarget = null;
        if (hideSeekState.inspectTime <= 0 && hideSeekAI.thinkTimer <= 0) {
          searchHideSeekPosition();
          hideSeekAI.thinkTimer = profile.thinkDelay;
        }
      } else {
        const center = getHideSeekSpotCenter(target.spot);
        hideSeekState.touchTarget = { x: center.x, y: center.y };
      }
      return;
    }

    // Room cleared — steer toward an exit leading somewhere still worth checking.
    const chosen = chooseHideSeekAIExit(room, profile);
    if (!chosen) return;
    const trigger = getHideSeekExitTriggerRect(chosen);
    hideSeekState.touchTarget = { x: trigger.x + trigger.width / 2, y: trigger.y + trigger.height / 2 };
    hideSeekAI.lastRoom = room.id;
  }

  function toggleHideSeekSolo() {
    hideSeekSoloEnabled = !hideSeekSoloEnabled;
    setStoredJson('rtaHideSeekSolo', hideSeekSoloEnabled);
    hideSeekAI.lastRoom = null;
    updateHideSeekSoloButton();
    renderHideSeek();
    maybeStartHideSeekComputerTurn();
  }

  function updateHideSeekSoloButton() {
    if (!hideSeekSoloButton) return;
    hideSeekSoloButton.textContent = hideSeekSoloEnabled ? 'Solo vs Computer: On' : 'Solo vs Computer: Off';
    hideSeekSoloButton.setAttribute('aria-pressed', hideSeekSoloEnabled ? 'true' : 'false');
    hideSeekSoloButton.classList.toggle('is-active', hideSeekSoloEnabled);
  }

  function resetHideSeek() {
    stopHideSeekTimer();
    hideSeekRound = 0;
    hideSeekState = {
      mode: hideSeekMode.value || 'roadside-lodge',
      difficulty: hideSeekCountdown.value || HIDE_SEEK_DEFAULT_DIFFICULTY,
      winnerGoal: hideSeekWinner.value || '5',
      hiderIndex: 0,
      seekerIndex: 1,
      phase: HideSeekGameState.TITLE,
      hiddenSpotId: null,
      hiddenSpotLabel: '',
      hiddenPosition: null,
      hiddenCoverQuality: 1,
      hiddenCoverLabel: 'Risky',
      spotStates: buildHideSeekSpotStates(),
      noiseLevel: 0,
      stamina: HIDE_SEEK_MAX_STAMINA,
      inspectedSpotId: null,
      inspectTime: 0,
      inspectionCount: 0,
      repeatInspectionCount: 0,
      peekCount: 0,
      hiddenRoomId: null,
      activeRoomId: (hideSeekMaps[hideSeekMode.value] || hideSeekMaps['roadside-lodge']).startRoom,
      searchesRemaining: getHideSeekSearchCount(hideSeekCountdown.value || HIDE_SEEK_DEFAULT_DIFFICULTY),
      hiderTimeRemaining: HIDE_SEEK_HIDE_SECONDS,
      wrongGuesses: 0,
      listenUsed: false,
      roundMedal: '',
      lastClue: '',
      roundHiderScore: 0,
      roundSeekerScore: 0,
      lastRoundText: '',
      message: '',
      hideScore: {},
      actors: {
        hider: createHideSeekActor((hideSeekMaps[hideSeekMode.value] || hideSeekMaps['roadside-lodge']).startRoom, true, '#2ec7d3'),
        seeker: createHideSeekActor((hideSeekMaps[hideSeekMode.value] || hideSeekMaps['roadside-lodge']).startRoom, false, '#f58220'),
      },
      input: { up: false, down: false, left: false, right: false, sprint: false },
      revealPulse: 0,
      searchPulse: null,
      roomTrail: [((hideSeekMaps[hideSeekMode.value] || hideSeekMaps['roadside-lodge']).startRoom)],
      particles: [],
      cameraShake: 0,
      coverGlowPulse: 0,
      lastUrgentSecond: null,
      shakeTime: 0,
      shakingSpotId: null,
    };
    renderHideSeek();
  }

  function startHideSeekGame() {
    resetGame();
    resetHideSeek();
    showSection('hideSeek');
    startHideSeekLoop();
  }

  function updateHideSeek(delta) {
    if (!delta) return;
    if (!isHideSeekMovementPhase() && hideSeekState.touchTarget) {
      hideSeekState.touchTarget = null;
    }
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      updateHideSeekActor(hideSeekState.actors.hider, delta);
      hideSeekState.hiderTimeRemaining = Math.max(0, hideSeekState.hiderTimeRemaining - delta);
      if (hideSeekState.hiderTimeRemaining <= 0) lockHideSeekHiderPosition('timer');
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      if (isHideSeekComputerSeeker()) updateHideSeekAISeeker(delta);
      if (hideSeekState.inspectTime <= 0) updateHideSeekActor(hideSeekState.actors.seeker, delta);
      // Searches are discrete; seeker phase no longer drains continuously over time.
    }
    if (hideSeekState.revealPulse > 0) hideSeekState.revealPulse = Math.max(0, hideSeekState.revealPulse - delta);
    if (hideSeekState.searchPulse) {
      hideSeekState.searchPulse.time = Math.max(0, hideSeekState.searchPulse.time - delta);
      if (hideSeekState.searchPulse.time <= 0) hideSeekState.searchPulse = null;
    }
    if (hideSeekState.cameraShake > 0) hideSeekState.cameraShake = Math.max(0, hideSeekState.cameraShake - delta * 1.8);
    updateHideSeekParticles(delta);
    if (hideSeekState.inspectTime > 0) hideSeekState.inspectTime = Math.max(0, hideSeekState.inspectTime - delta);
    if (hideSeekState.noiseLevel > 0) hideSeekState.noiseLevel = Math.max(0, hideSeekState.noiseLevel - delta * 0.025);
    hideSeekState.coverGlowPulse = (hideSeekState.coverGlowPulse + delta * 2.2) % (Math.PI * 2);
    if (hideSeekState.shakeTime > 0) hideSeekState.shakeTime = Math.max(0, hideSeekState.shakeTime - delta);
    updateHideSeekTimerText();
  }

  function updateHideSeekTimerText() {
    if (!hideSeekCountdownText || hideSeekCountdownText.hidden) return;
    hideSeekCountdownText.textContent = getHideSeekTimerLabel();
  }

  function getHideSeekTimerLabel() {
    const room = getHideSeekRoom(hideSeekState.activeRoomId);
    const roundText = `Round ${Math.min(hideSeekRound + 1, getHideSeekMaxRounds())} of ${getHideSeekMaxRounds()}`;
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      return `${roundText} · Hide: ${Math.ceil(hideSeekState.hiderTimeRemaining)}s · ${room.name}`;
    }
    return `${roundText} · Searches: ${hideSeekState.searchesRemaining} · ${room.name}`;
  }

  function updateHideSeekActor(actor, delta) {
    const input = hideSeekState.input;
    actor.exitCooldown = Math.max(0, (actor.exitCooldown || 0) - delta);
    let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const target = hideSeekState.touchTarget;
    if (target && !dx && !dy) {
      const actorCenterX = actor.x + actor.width / 2;
      const actorCenterY = actor.y + actor.height / 2;
      const tdx = target.x - actorCenterX;
      const tdy = target.y - actorCenterY;
      const targetDistance = Math.hypot(tdx, tdy);
      const deadzone = Math.max(actor.width, actor.height) * 0.45;
      if (targetDistance > deadzone) {
        dx = tdx / targetDistance;
        dy = tdy / targetDistance;
      }
    }
    if (!dx && !dy) {
      hideSeekState.stamina = Math.min(HIDE_SEEK_MAX_STAMINA, hideSeekState.stamina + delta * 24);
      hideSeekState.activeRoomId = actor.roomId;
      return;
    }
    const length = Math.hypot(dx, dy) || 1;
    const room = getHideSeekRoom(actor.roomId);
    const speedMultiplier = getHideSeekSpeedMultiplier(actor, room);
    const canSprint = hideSeekState.input.sprint && hideSeekState.stamina > 2 && hideSeekState.inspectTime <= 0;
    const sprintMultiplier = canSprint ? HIDE_SEEK_SPRINT_SPEED_MULTIPLIER : 1;
    const moveX = (dx / length) * actor.speed * speedMultiplier * sprintMultiplier * delta;
    const moveY = (dy / length) * actor.speed * speedMultiplier * sprintMultiplier * delta;
    if (canSprint) {
      hideSeekState.stamina = Math.max(0, hideSeekState.stamina - delta * 34);
      if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) addHideSeekNoise(actor, delta * 0.34);
    } else {
      hideSeekState.stamina = Math.min(HIDE_SEEK_MAX_STAMINA, hideSeekState.stamina + delta * 18);
    }
    const roomBounds = getHideSeekRoomBounds(actor);
    const nextXActor = Object.assign({}, actor, {
      x: Math.max(roomBounds.minX, Math.min(roomBounds.maxX, actor.x + moveX)),
    });
    if (!wouldHitHideSeekBlock(nextXActor, room)) {
      actor.x = nextXActor.x;
    }
    const nextYActor = Object.assign({}, actor, {
      y: Math.max(roomBounds.minY, Math.min(roomBounds.maxY, actor.y + moveY)),
    });
    if (!wouldHitHideSeekBlock(nextYActor, room)) {
      actor.y = nextYActor.y;
    }
    checkHideSeekExits(actor, room, dx, dy);
    hideSeekState.activeRoomId = actor.roomId;
  }

  function getHideSeekSpeedMultiplier(actor, room) {
    const zone = (room.obstacles || []).find(obstacle => obstacle.type === 'slow' && isHideSeekOverlapping(actor, obstacle));
    return zone ? zone.speedMultiplier || 0.65 : 1;
  }

  function getHideSeekRoomBounds(actor) {
    // Constrain the whole sprite to the visible play-area floor so players can
    // neither move nor hide in the wall band around the room. Exits sit at the
    // floor edges and use generously padded trigger rects, so they remain
    // reachable from within these bounds.
    const floor = getHideSeekFloorRect();
    const margin = Math.round(2 * HIDE_SEEK_SCALE);
    return {
      minX: floor.x + margin,
      maxX: floor.x + floor.width - actor.width - margin,
      minY: floor.y + margin,
      maxY: floor.y + floor.height - actor.height - margin,
    };
  }

  function wouldHitHideSeekBlock(actor, room) {
    const collider = getHideSeekActorCollider(actor);
    const activeExitTrigger = (room.exits || [])
      .map(exit => getHideSeekExitTriggerRect(exit))
      .find(trigger => isHideSeekOverlapping(collider, trigger));
    const isDoorwayOverlap = rect => activeExitTrigger && isHideSeekOverlapping(rect, activeExitTrigger);
    const hitsObstacle = (room.obstacles || []).some((obstacle) => {
      if (obstacle.type !== 'block') return false;
      if (!isHideSeekOverlapping(collider, obstacle)) return false;
      return !isDoorwayOverlap(obstacle);
    });
    const hitsSpot = (room.spots || []).some((spot) => {
      const collisionRect = getHideSeekSpotCollisionRect(spot);
      return collisionRect && isHideSeekOverlapping(collider, collisionRect) && !isDoorwayOverlap(collisionRect);
    });
    return hitsObstacle || hitsSpot;
  }

  function doesHideSeekActorTouchExit(actor, exit, dx, dy) {
    const collider = getHideSeekActorCollider(actor);
    const spanPad = Math.round(18 * HIDE_SEEK_SCALE);
    const topThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const bottomThreshold = Math.round(360 * HIDE_SEEK_SCALE);
    const topActorThreshold = Math.round(76 * HIDE_SEEK_SCALE);
    const bottomActorThreshold = Math.round(374 * HIDE_SEEK_SCALE);
    const leftThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const rightThreshold = Math.round(700 * HIDE_SEEK_SCALE);
    const leftActorThreshold = Math.round(52 * HIDE_SEEK_SCALE);
    const rightActorThreshold = Math.round(748 * HIDE_SEEK_SCALE);
    if (exit.y <= topThreshold && dy < 0) {
      return actor.y <= topActorThreshold
        && collider.x + collider.width >= exit.x - spanPad
        && collider.x <= exit.x + exit.width + spanPad;
    }
    if (exit.y >= bottomThreshold && dy > 0) {
      return actor.y + actor.height >= bottomActorThreshold
        && collider.x + collider.width >= exit.x - spanPad
        && collider.x <= exit.x + exit.width + spanPad;
    }
    if (exit.x <= leftThreshold && dx < 0) {
      return actor.x <= leftActorThreshold
        && collider.y + collider.height >= exit.y - spanPad
        && collider.y <= exit.y + exit.height + spanPad;
    }
    if (exit.x >= rightThreshold && dx > 0) {
      return actor.x + actor.width >= rightActorThreshold
        && collider.y + collider.height >= exit.y - spanPad
        && collider.y <= exit.y + exit.height + spanPad;
    }
    return false;
  }

  function isHideSeekMovingTowardExit(exit, dx, dy) {
    const topThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const bottomThreshold = Math.round(360 * HIDE_SEEK_SCALE);
    const leftThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const rightThreshold = Math.round(700 * HIDE_SEEK_SCALE);
    if (exit.y <= topThreshold) return dy < 0;
    if (exit.y >= bottomThreshold) return dy > 0;
    if (exit.x <= leftThreshold) return dx < 0;
    if (exit.x >= rightThreshold) return dx > 0;
    return false;
  }

  function checkHideSeekExits(actor, room, dx = 0, dy = 0) {
    const actorCenter = getHideSeekActorCenter(actor);
    const actorCollider = getHideSeekActorCollider(actor);
    const isInsideExit = item => {
      const triggerRect = getHideSeekExitTriggerRect(item);
      return doesHideSeekActorTouchExit(actor, item, dx, dy)
        || isHideSeekPointInsideRect(actorCenter, triggerRect)
        || isHideSeekOverlapping(actorCollider, triggerRect);
    };
    if (actor.exitIgnoreRoom) {
      const ignoredExit = room.exits.find(item => item.targetRoom === actor.exitIgnoreRoom);
      if (!ignoredExit || !isInsideExit(ignoredExit) || isHideSeekMovingTowardExit(ignoredExit, dx, dy)) {
        actor.exitIgnoreRoom = '';
      }
    }
    if ((actor.exitCooldown || 0) > 0) return;
    const exit = room.exits.find(item => {
      if (actor.exitIgnoreRoom && item.targetRoom === actor.exitIgnoreRoom) return false;
      return isInsideExit(item);
    });
    if (!exit) return;
    const previousRoomId = actor.roomId;
    actor.roomId = exit.targetRoom;
    const spawn = resolveHideSeekExitSpawn(actor, exit);
    actor.x = spawn.x;
    actor.y = spawn.y;
    actor.exitCooldown = 0.55;
    actor.exitIgnoreRoom = previousRoomId;
    hideSeekState.activeRoomId = exit.targetRoom;
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN && actor === hideSeekState.actors.hider) {
      noteHideSeekRoomVisit(exit.targetRoom);
      addHideSeekNoise(actor, 0.08);
    }
    playHideSeekTone('door');
    renderHideSeek();
  }

  function isHideSeekOverlapping(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function isHideSeekPointInsideRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  function getHideSeekExitTriggerRect(exit) {
    const pad = Math.round(38 * HIDE_SEEK_SCALE);
    const reach = Math.round(26 * HIDE_SEEK_SCALE);
    const topThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const bottomThreshold = Math.round(360 * HIDE_SEEK_SCALE);
    const leftThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const rightThreshold = Math.round(700 * HIDE_SEEK_SCALE);
    if (exit.y <= topThreshold) {
      return {
        x: exit.x - pad,
        y: exit.y - pad,
        width: exit.width + pad * 2,
        height: exit.height + pad * 2 + reach,
      };
    }
    if (exit.y >= bottomThreshold) {
      return {
        x: exit.x - pad,
        y: exit.y - pad - reach,
        width: exit.width + pad * 2,
        height: exit.height + pad * 2 + reach,
      };
    }
    if (exit.x <= leftThreshold) {
      return {
        x: exit.x - pad,
        y: exit.y - pad,
        width: exit.width + pad * 2 + reach,
        height: exit.height + pad * 2,
      };
    }
    if (exit.x >= rightThreshold) {
      return {
        x: exit.x - pad - reach,
        y: exit.y - pad,
        width: exit.width + pad * 2 + reach,
        height: exit.height + pad * 2,
      };
    }
    return {
      x: exit.x - pad,
      y: exit.y - pad,
      width: exit.width + pad * 2,
      height: exit.height + pad * 2,
    };
  }

  function resolveHideSeekExitSpawn(actor, exit) {
    const targetRoom = getHideSeekRoom(exit.targetRoom);
    const spawnActor = Object.assign({}, actor, { roomId: exit.targetRoom });
    const bounds = getHideSeekRoomBounds(spawnActor);
    const base = {
      x: typeof exit.spawnX === 'number' ? exit.spawnX : Math.round(HIDE_SEEK_CANVAS_WIDTH / 2),
      y: typeof exit.spawnY === 'number' ? exit.spawnY : Math.round(HIDE_SEEK_CANVAS_HEIGHT / 2),
    };
    const nudges = [];
    const edgeStep = Math.round(18 * HIDE_SEEK_SCALE);
    const sideNudge = Math.round(24 * HIDE_SEEK_SCALE);
    const topThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const bottomThreshold = Math.round(360 * HIDE_SEEK_SCALE);
    const leftThreshold = Math.round(62 * HIDE_SEEK_SCALE);
    const rightThreshold = Math.round(700 * HIDE_SEEK_SCALE);
    if (exit.y <= topThreshold) {
      for (let step = 0; step < 7; step += 1) nudges.push({ x: 0, y: step * edgeStep });
    } else if (exit.y >= bottomThreshold) {
      for (let step = 0; step < 7; step += 1) nudges.push({ x: 0, y: -step * edgeStep });
    } else if (exit.x <= leftThreshold) {
      for (let step = 0; step < 7; step += 1) nudges.push({ x: step * edgeStep, y: 0 });
    } else if (exit.x >= rightThreshold) {
      for (let step = 0; step < 7; step += 1) nudges.push({ x: -step * edgeStep, y: 0 });
    } else {
      nudges.push({ x: 0, y: 0 });
    }
    const candidates = nudges.flatMap(offset => ([
      { x: base.x + offset.x, y: base.y + offset.y },
      { x: base.x + offset.x + sideNudge, y: base.y + offset.y },
      { x: base.x + offset.x - sideNudge, y: base.y + offset.y },
    ]));
    const safe = candidates.find(candidate => {
      const positioned = Object.assign({}, spawnActor, {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, candidate.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, candidate.y)),
      });
      return !wouldHitHideSeekBlock(positioned, targetRoom);
    });
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, safe ? safe.x : base.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, safe ? safe.y : base.y)),
    };
  }

  function getHideSeekActorCollider(actor) {
    return {
      x: actor.x + Math.round(4 * HIDE_SEEK_SCALE),
      y: actor.y + Math.round(12 * HIDE_SEEK_SCALE),
      width: Math.max(Math.round(8 * HIDE_SEEK_SCALE), actor.width - Math.round(8 * HIDE_SEEK_SCALE)),
      height: Math.max(Math.round(8 * HIDE_SEEK_SCALE), actor.height - Math.round(8 * HIDE_SEEK_SCALE)),
    };
  }

  function getHideSeekSpotCollisionRect(spot) {
    const blockingKinds = new Set(['bed', 'bench', 'box', 'bush', 'car', 'closet', 'couch', 'curtain', 'desk', 'fountain', 'locker', 'luggage', 'shelf', 'tree']);
    if (spot.solid === false) return null;
    if (spot.solid !== true && !blockingKinds.has(spot.kind)) return null;
    const insets = {
      bed: { x: 6, y: 16, width: -12, height: -18 },
      bench: { x: 8, y: 18, width: -16, height: -24 },
      box: { x: 8, y: 10, width: -16, height: -14 },
      bush: { x: 10, y: 20, width: -20, height: -26 },
      car: { x: 26, y: 40, width: -52, height: -46 },
      closet: { x: 8, y: 10, width: -16, height: -14 },
      couch: { x: 8, y: 14, width: -16, height: -18 },
      curtain: { x: 8, y: 12, width: -16, height: -18 },
      desk: { x: 10, y: 18, width: -20, height: -24 },
      fountain: { x: 12, y: 14, width: -24, height: -22 },
      luggage: { x: 8, y: 12, width: -16, height: -16 },
      shelf: { x: 10, y: 12, width: -20, height: -18 },
      tree: { x: 12, y: 24, width: -24, height: -28 },
    }[spot.kind] || { x: 6, y: 8, width: -12, height: -12 };
    return {
      x: spot.x + insets.x,
      y: spot.y + insets.y,
      width: Math.max(18, spot.width + insets.width),
      height: Math.max(18, spot.height + insets.height),
    };
  }

  function getHideSeekDistanceToRect(actor, rect) {
    const actorCenterX = actor.x + actor.width / 2;
    const actorCenterY = actor.y + actor.height / 2;
    const nearestX = Math.max(rect.x, Math.min(actorCenterX, rect.x + rect.width));
    const nearestY = Math.max(rect.y, Math.min(actorCenterY, rect.y + rect.height));
    return Math.hypot(actorCenterX - nearestX, actorCenterY - nearestY);
  }

  function drawHideSeek() {
    if (!hideSeekCanvasContext || !hideSeekCanvas) return;
    const ctx = hideSeekCanvasContext;
    const map = getHideSeekMap();
    const room = getHideSeekRoom(hideSeekState.activeRoomId);
    const palette = map.palette;
    ctx.clearRect(0, 0, hideSeekCanvas.width, hideSeekCanvas.height);
    ctx.save();
    if (hideSeekState.cameraShake > 0) {
      const shake = hideSeekState.cameraShake * 8;
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    drawHideSeekRoom(ctx, room, palette);
    drawHideSeekSpots(ctx, room);
    drawHideSeekActors(ctx, room);
    drawHideSeekTouchTarget(ctx);
    drawHideSeekActionEffects(ctx, room);
    drawHideSeekParticles(ctx, room);
    drawHideSeekAtmosphere(ctx, room, map);
    ctx.restore();
    if (hideSeekDebugEnabled) drawHideSeekDebug(ctx, room, map);
  }

  function drawHideSeekTouchTarget(ctx) {
    const target = hideSeekState.touchTarget;
    if (!target || !isHideSeekMovementPhase()) return;
    const actor = getHideSeekActiveActor();
    ctx.save();
    ctx.strokeStyle = '#ffd74a';
    ctx.lineWidth = 2;
    if (actor) {
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(actor.x + actor.width / 2, actor.y + actor.height / 2);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const pulse = 4 + Math.sin(Date.now() / 150) * 2.5;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(target.x, target.y, 9 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffd74a';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function fillHideSeekRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  function strokeHideSeekRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
  }

  function shadeHideSeekColor(hex, percent) {
    const value = hex.replace('#', '');
    const num = parseInt(value.length === 3 ? value.split('').map(char => char + char).join('') : value, 16);
    const amount = Math.round(2.55 * percent);
    const red = Math.max(0, Math.min(255, (num >> 16) + amount));
    const green = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
    const blue = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
    return `rgb(${red}, ${green}, ${blue})`;
  }

  function drawHideSeekTexture(ctx, color, alpha, spacing) {
    withHideSeekBaseScale(ctx, () => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let x = -450; x < 900; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 64);
        ctx.lineTo(x + 450, 402);
        ctx.stroke();
      }
    });
  }

  function getHideSeekArtTools() {
    return {
      fillRoundedRect: fillHideSeekRoundedRect,
      strokeRoundedRect: strokeHideSeekRoundedRect,
      shadeColor: shadeHideSeekColor,
    };
  }

  function drawHideSeekCouch(ctx, x, y, w, h) {
    if (window.RTA_HIDE_SEEK_ART && window.RTA_HIDE_SEEK_ART.drawCouch) {
      window.RTA_HIDE_SEEK_ART.drawCouch(ctx, x, y, w, h, getHideSeekArtTools());
    }
  }

  function drawHideSeekPickupTruck(ctx, x, y, w, h) {
    if (window.RTA_HIDE_SEEK_ART && window.RTA_HIDE_SEEK_ART.drawPickupTruck) {
      window.RTA_HIDE_SEEK_ART.drawPickupTruck(ctx, x, y, w, h, getHideSeekArtTools());
    }
  }

  function drawHideSeekRichObject(ctx, spot) {
    if (!window.RTA_HIDE_SEEK_ART || !window.RTA_HIDE_SEEK_ART.drawObject) return false;
    return window.RTA_HIDE_SEEK_ART.drawObject(ctx, spot, getHideSeekArtTools());
  }

  function drawHideSeekRoomBackdrop(ctx, map, room, palette) {
    if (window.RTA_HIDE_SEEK_ART && window.RTA_HIDE_SEEK_ART.drawRoomBackdrop) {
      withHideSeekBaseScale(ctx, () => {
        window.RTA_HIDE_SEEK_ART.drawRoomBackdrop(ctx, map, room, palette, getHideSeekArtTools());
      });
      return;
    }
    ctx.fillStyle = palette.wall;
    const { width, height } = getHideSeekCanvasSize();
    ctx.fillRect(0, 0, width, height);
  }

  function drawHideSeekExitArrow(ctx, exit, isActive) {
    const centerX = exit.x + exit.width / 2;
    const centerY = exit.y + exit.height / 2;
    const size = isActive ? 14 : 10;
    const direction = exit.y <= 62
      ? 'up'
      : exit.y >= 360
        ? 'down'
        : exit.x <= 62
          ? 'left'
          : 'right';

    ctx.save();
    ctx.fillStyle = isActive ? '#fff2d8' : 'rgba(255,255,255,0.86)';
    ctx.strokeStyle = 'rgba(6,21,36,0.36)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (direction === 'up') {
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX - size * 0.72, centerY + size * 0.42);
      ctx.lineTo(centerX + size * 0.72, centerY + size * 0.42);
    } else if (direction === 'down') {
      ctx.moveTo(centerX, centerY + size);
      ctx.lineTo(centerX - size * 0.72, centerY - size * 0.42);
      ctx.lineTo(centerX + size * 0.72, centerY - size * 0.42);
    } else if (direction === 'left') {
      ctx.moveTo(centerX - size, centerY);
      ctx.lineTo(centerX + size * 0.42, centerY - size * 0.72);
      ctx.lineTo(centerX + size * 0.42, centerY + size * 0.72);
    } else {
      ctx.moveTo(centerX + size, centerY);
      ctx.lineTo(centerX - size * 0.42, centerY - size * 0.72);
      ctx.lineTo(centerX - size * 0.42, centerY + size * 0.72);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawHideSeekRoom(ctx, room, palette) {
    const map = getHideSeekMap();
    const floorRect = getHideSeekFloorRect();
    drawHideSeekRoomBackdrop(ctx, map, room, palette);

    const floorGradient = ctx.createLinearGradient(0, floorRect.y, 0, floorRect.y + floorRect.height);
    floorGradient.addColorStop(0, shadeHideSeekColor(palette.floor, 12));
    floorGradient.addColorStop(1, shadeHideSeekColor(palette.floor, -12));
    ctx.fillStyle = floorGradient;
    fillHideSeekRoundedRect(ctx, floorRect.x, floorRect.y, floorRect.width, floorRect.height, Math.round(18 * HIDE_SEEK_SCALE));
    drawHideSeekTexture(ctx, 'rgba(6,21,36,0.28)', 0.25, Math.round(38 * HIDE_SEEK_SCALE));

    if (window.RTA_HIDE_SEEK_ART && window.RTA_HIDE_SEEK_ART.drawFloorDetail) {
      withHideSeekBaseScale(ctx, () => {
        window.RTA_HIDE_SEEK_ART.drawFloorDetail(ctx, map, room, getHideSeekArtTools());
      });
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 1;
    for (let y = floorRect.y + Math.round(32 * HIDE_SEEK_SCALE); y < floorRect.y + floorRect.height - Math.round(18 * HIDE_SEEK_SCALE); y += Math.round(36 * HIDE_SEEK_SCALE)) {
      ctx.beginPath();
      ctx.moveTo(floorRect.x + Math.round(20 * HIDE_SEEK_SCALE), y);
      ctx.lineTo(floorRect.x + floorRect.width - Math.round(20 * HIDE_SEEK_SCALE), y);
      ctx.stroke();
    }

    ctx.fillStyle = palette.trim;
    fillHideSeekRoundedRect(ctx, floorRect.x - Math.round(4 * HIDE_SEEK_SCALE), floorRect.y - Math.round(4 * HIDE_SEEK_SCALE), floorRect.width + Math.round(8 * HIDE_SEEK_SCALE), Math.round(18 * HIDE_SEEK_SCALE), Math.round(8 * HIDE_SEEK_SCALE));
    fillHideSeekRoundedRect(ctx, floorRect.x - Math.round(4 * HIDE_SEEK_SCALE), floorRect.y + floorRect.height - Math.round(14 * HIDE_SEEK_SCALE), floorRect.width + Math.round(8 * HIDE_SEEK_SCALE), Math.round(18 * HIDE_SEEK_SCALE), Math.round(8 * HIDE_SEEK_SCALE));
    fillHideSeekRoundedRect(ctx, floorRect.x - Math.round(4 * HIDE_SEEK_SCALE), floorRect.y - Math.round(4 * HIDE_SEEK_SCALE), Math.round(18 * HIDE_SEEK_SCALE), floorRect.height + Math.round(8 * HIDE_SEEK_SCALE), Math.round(8 * HIDE_SEEK_SCALE));
    fillHideSeekRoundedRect(ctx, floorRect.x + floorRect.width - Math.round(14 * HIDE_SEEK_SCALE), floorRect.y - Math.round(4 * HIDE_SEEK_SCALE), Math.round(18 * HIDE_SEEK_SCALE), floorRect.height + Math.round(8 * HIDE_SEEK_SCALE), Math.round(8 * HIDE_SEEK_SCALE));

    const activeActor = getHideSeekActiveActor();
    const activeActorCenter = activeActor && activeActor.roomId === room.id ? getHideSeekActorCenter(activeActor) : null;
    (room.exits || []).forEach(exit => {
      const nearExit = activeActorCenter && isHideSeekPointInsideRect(activeActorCenter, getHideSeekExitTriggerRect(exit));
      ctx.fillStyle = 'rgba(0,0,0,0.26)';
      fillHideSeekRoundedRect(ctx, exit.x + 3, exit.y + 3, exit.width, exit.height, 8);
      const doorGradient = ctx.createLinearGradient(exit.x, exit.y, exit.x + exit.width, exit.y + exit.height);
      doorGradient.addColorStop(0, shadeHideSeekColor(palette.accent, 12));
      doorGradient.addColorStop(1, shadeHideSeekColor(palette.accent, -12));
      ctx.fillStyle = doorGradient;
      fillHideSeekRoundedRect(ctx, exit.x, exit.y, exit.width, exit.height, 8);
      ctx.strokeStyle = nearExit ? '#ffd166' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = nearExit ? 4 : 2;
      strokeHideSeekRoundedRect(ctx, exit.x + 2, exit.y + 2, exit.width - 4, exit.height - 4, 6);
      drawHideSeekExitArrow(ctx, exit, nearExit);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(exit.label, exit.x + exit.width / 2, Math.max(46, exit.y - 8));
    });

    (room.obstacles || []).forEach(obstacle => {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      fillHideSeekRoundedRect(ctx, obstacle.x + 4, obstacle.y + 6, obstacle.width, obstacle.height, 8);
      ctx.fillStyle = obstacle.type === 'slow' ? 'rgba(9, 35, 63, 0.24)' : '#6b4b35';
      fillHideSeekRoundedRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 8);
      if (obstacle.type === 'slow') {
        ctx.strokeStyle = 'rgba(255,255,255,0.38)';
        ctx.lineWidth = 2;
        for (let x = obstacle.x + 14; x < obstacle.x + obstacle.width - 10; x += 18) {
          ctx.beginPath();
          ctx.moveTo(x, obstacle.y + 8);
          ctx.lineTo(x - 12, obstacle.y + obstacle.height - 8);
          ctx.stroke();
        }
      }
    });

    const { width: canvasWidth, height: canvasHeight } = getHideSeekCanvasSize();
    const vignette = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, Math.round(80 * HIDE_SEEK_SCALE), canvasWidth / 2, canvasHeight / 2, Math.round(430 * HIDE_SEEK_SCALE));
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  function drawHideSeekSpots(ctx, room) {
    const actor = getHideSeekActiveActor();
    const nearbySpot = getNearbyHideSeekSpot(actor);
    room.spots.forEach(spot => {
      const isNearby = nearbySpot && nearbySpot.id === spot.id;
      const state = getHideSeekSpotState(spot.id);
      const shake = hideSeekState.shakingSpotId === spot.id && hideSeekState.shakeTime > 0 ? Math.sin(hideSeekState.shakeTime * 48) * 4 : 0;
      ctx.save();
      ctx.translate(shake, 0);
      drawHideSeekObject(ctx, spot, isNearby, state);
      ctx.restore();
    });
  }

  function drawHideSeekActionEffects(ctx, room) {
    const pulse = hideSeekState.searchPulse;
    if (pulse && pulse.roomId === room.id) {
      const progress = 1 - (pulse.time / pulse.maxTime);
      const colors = {
        found: '46, 199, 211',
        hot: '245, 130, 32',
        warm: '255, 209, 102',
        cold: '123, 78, 230',
      };
      const color = colors[pulse.tone] || colors.cold;
      ctx.save();
      ctx.strokeStyle = `rgba(${color}, ${Math.max(0, 0.86 - progress * 0.72)})`;
      ctx.lineWidth = Math.max(2, 8 - progress * 5);
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, HIDE_SEEK_SEARCH_TOLERANCE + progress * 46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(${color}, ${Math.max(0, 0.16 - progress * 0.12)})`;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, 18 + progress * 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      const actor = hideSeekState.actors.hider;
      const quality = getHideSeekCoverQuality(actor);
      const glow = 0.45 + Math.sin(hideSeekState.coverGlowPulse) * 0.12;
      ctx.save();
      ctx.strokeStyle = quality.spot ? `rgba(46, 199, 211, ${glow})` : `rgba(245, 130, 32, ${glow})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(actor.x + actor.width / 2, actor.y + actor.height / 2, HIDE_SEEK_SEARCH_TOLERANCE + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Seeker gets the same "in range" ring so they know when Inspect will work:
    // green when standing next to a spot, dim orange when not.
    if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      const actor = hideSeekState.actors.seeker;
      const inRange = !!getNearbyHideSeekSpot(actor);
      const glow = 0.42 + Math.sin(hideSeekState.coverGlowPulse) * 0.12;
      ctx.save();
      ctx.strokeStyle = inRange ? `rgba(140, 255, 102, ${glow + 0.18})` : `rgba(245, 130, 32, ${glow})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(actor.x + actor.width / 2, actor.y + actor.height / 2, HIDE_SEEK_SEARCH_TOLERANCE + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  function drawHideSeekParticles(ctx, room) {
    (hideSeekState.particles || []).forEach(particle => {
      if (particle.roomId !== room.id) return;
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawHideSeekAtmosphere(ctx, room, map) {
    if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      const actor = hideSeekState.actors.seeker;
      if (actor.roomId === room.id) {
        const floorRect = getHideSeekFloorRect();
        ctx.save();
        ctx.fillStyle = map.id === 'school-night' ? 'rgba(6, 21, 36, 0.34)' : 'rgba(6, 21, 36, 0.22)';
        ctx.fillRect(floorRect.x, floorRect.y, floorRect.width, floorRect.height);
        const light = ctx.createRadialGradient(
          actor.x + actor.width / 2,
          actor.y + actor.height / 2,
          24,
          actor.x + actor.width / 2,
          actor.y + actor.height / 2,
          170
        );
        light.addColorStop(0, 'rgba(255,255,255,0.28)');
        light.addColorStop(0.48, 'rgba(255,255,255,0.12)');
        light.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = light;
        ctx.beginPath();
        ctx.arc(actor.x + actor.width / 2, actor.y + actor.height / 2, 170, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (map.id === 'alaska-train') {
      withHideSeekBaseScale(ctx, () => {
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 9; i += 1) {
          const x = (performance.now() / 28 + i * 92) % 850 - 40;
          ctx.beginPath();
          ctx.moveTo(x, 86);
          ctx.lineTo(x + 28, 63);
          ctx.stroke();
        }
      });
    } else if (map.id === 'campground') {
      withHideSeekBaseScale(ctx, () => {
        for (let i = 0; i < 9; i += 1) {
          const offset = (performance.now() / 42 + i * 61) % 760;
          const fx = 40 + offset;
          const fy = 88 + (i % 4) * 56 + Math.sin((performance.now() / 480) + i) * 10;
          ctx.fillStyle = 'rgba(255, 241, 170, 0.52)';
          ctx.beginPath();
          ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (map.id === 'roadside-lodge' && room.id === 'courtyard') {
      withHideSeekBaseScale(ctx, () => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        for (let i = 0; i < 8; i += 1) {
          ctx.beginPath();
          ctx.arc(84 + i * 86, 80 + (i % 3) * 10, i % 2 ? 1.2 : 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }

  function drawHideSeekObject(ctx, spot, isNearby, state) {
    const x = spot.x;
    const y = spot.y;
    const w = spot.width;
    const h = spot.height;
    const visibleState = hideSeekState.phase === HideSeekGameState.FOUND || hideSeekState.phase === HideSeekGameState.ROUND_RESULTS
      ? state
      : state === 'occupied'
        ? 'empty'
        : state;
    const stateColors = {
      disabled: '#4b5563',
      searched: '#9aa4b2',
      found: '#2ec7d3',
    };
    const highlight = isNearby ? '#f58220' : stateColors[visibleState] || 'rgba(255,255,255,0.26)';
    ctx.lineWidth = isNearby ? 4 : 2;
    ctx.strokeStyle = highlight;
    ctx.fillStyle = '#ffffff';
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 2, Math.max(20, w * 0.48), Math.max(8, h * 0.1), 0, 0, Math.PI * 2);
    ctx.fill();

    if (drawHideSeekRichObject(ctx, spot)) {
      // Detailed object art is drawn by js/games/hide-seek-art.js.
    } else if (spot.kind === 'locker') {
      const locker = ctx.createLinearGradient(x, y, x, y + h);
      locker.addColorStop(0, '#46627f');
      locker.addColorStop(1, '#1f3146');
      ctx.fillStyle = locker;
      fillHideSeekRoundedRect(ctx, x, y, w, h, 8);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      for (let door = x + w / 3; door < x + w; door += w / 3) {
        ctx.beginPath();
        ctx.moveTo(door, y + 8);
        ctx.lineTo(door, y + h - 8);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd166';
      for (let handle = x + 18; handle < x + w - 8; handle += w / 3) {
        ctx.fillRect(handle, y + h * 0.45, 5, 18);
      }
    } else if (spot.kind === 'couch') {
      drawHideSeekCouch(ctx, x, y, w, h);
    } else if (spot.kind === 'bench') {
      ctx.fillStyle = '#6b3f2a';
      fillHideSeekRoundedRect(ctx, x + 8, y + h * 0.4, w - 16, h * 0.2, 8);
      ctx.fillStyle = '#8f5a36';
      fillHideSeekRoundedRect(ctx, x + 16, y + h * 0.18, w - 32, h * 0.22, 8);
      ctx.fillStyle = '#4a2b1d';
      fillHideSeekRoundedRect(ctx, x + 28, y + h * 0.58, 12, h * 0.34, 4);
      fillHideSeekRoundedRect(ctx, x + w - 40, y + h * 0.58, 12, h * 0.34, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x + 24, y + h * 0.26, w - 48, 4);
    } else if (spot.kind === 'desk') {
      const deskTop = ctx.createLinearGradient(x, y, x, y + h);
      deskTop.addColorStop(0, '#c47b32');
      deskTop.addColorStop(1, '#744523');
      ctx.fillStyle = deskTop;
      fillHideSeekRoundedRect(ctx, x, y + h * 0.28, w, h * 0.62, 9);
      ctx.fillStyle = '#f7dca1';
      fillHideSeekRoundedRect(ctx, x + 14, y + h * 0.12, w - 28, h * 0.24, 8);
      ctx.fillStyle = 'rgba(9,35,63,0.3)';
      ctx.fillRect(x + 18, y + h * 0.48, w - 36, 6);
      ctx.fillStyle = '#09233f';
      fillHideSeekRoundedRect(ctx, x + w * 0.68, y + h * 0.42, w * 0.18, h * 0.34, 5);
    } else if (spot.kind === 'shelf') {
      const shelf = ctx.createLinearGradient(x, y, x, y + h);
      shelf.addColorStop(0, '#7a8794');
      shelf.addColorStop(1, '#3f4b58');
      ctx.fillStyle = shelf;
      fillHideSeekRoundedRect(ctx, x, y, w, h, 8);
      ctx.fillStyle = '#09233f';
      for (let row = 0; row < 3; row += 1) {
        const rowY = y + 18 + row * ((h - 28) / 3);
        ctx.fillRect(x + 10, rowY, w - 20, 5);
      }
      ['#f58220', '#2ec7d3', '#fff2d8', '#7b4ee6'].forEach((color, index) => {
        ctx.fillStyle = color;
        fillHideSeekRoundedRect(ctx, x + 18 + index * Math.max(20, w / 5), y + 18 + (index % 2) * 26, 18, 22, 4);
      });
    } else if (spot.kind === 'bed') {
      const blanket = ctx.createLinearGradient(x, y, x, y + h);
      blanket.addColorStop(0, '#9b75ff');
      blanket.addColorStop(1, '#5c34bf');
      ctx.fillStyle = '#5b3a2e';
      fillHideSeekRoundedRect(ctx, x, y + h * 0.42, w, h * 0.56, 10);
      ctx.fillStyle = blanket;
      fillHideSeekRoundedRect(ctx, x + 8, y + h * 0.26, w - 16, h * 0.62, 12);
      ctx.fillStyle = '#fff2d8';
      fillHideSeekRoundedRect(ctx, x + 14, y + 10, w * 0.34, h * 0.35, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x + 20, y + h * 0.48, w - 40, 5);
    } else if (spot.kind === 'closet' || spot.kind === 'curtain') {
      const base = spot.kind === 'closet' ? '#5b3a2e' : '#7b4ee6';
      const fabric = ctx.createLinearGradient(x, y, x + w, y);
      fabric.addColorStop(0, shadeHideSeekColor(base, -12));
      fabric.addColorStop(0.5, shadeHideSeekColor(base, 14));
      fabric.addColorStop(1, shadeHideSeekColor(base, -16));
      ctx.fillStyle = fabric;
      fillHideSeekRoundedRect(ctx, x, y, w, h, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      for (let fold = x + 14; fold < x + w; fold += 22) {
        ctx.fillRect(fold, y + 10, 4, h - 20);
      }
      ctx.fillStyle = '#f7dca1';
      ctx.beginPath();
      ctx.arc(x + w * 0.5 + 8, y + h * 0.52, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.kind === 'box' || spot.kind === 'luggage') {
      const color = spot.kind === 'box' ? '#c47b32' : '#2ec7d3';
      ctx.fillStyle = shadeHideSeekColor(color, -14);
      fillHideSeekRoundedRect(ctx, x, y + 8, w, h - 8, 8);
      ctx.fillStyle = color;
      fillHideSeekRoundedRect(ctx, x + 8, y, w - 16, h - 10, 8);
      ctx.fillStyle = 'rgba(9,35,63,0.24)';
      ctx.fillRect(x + 15, y + 12, w - 30, 8);
      ctx.fillRect(x + w / 2 - 3, y + 8, 6, h - 20);
    } else if (spot.kind === 'tree' || spot.kind === 'bush') {
      ctx.fillStyle = '#6b3f2a';
      fillHideSeekRoundedRect(ctx, x + w * 0.42, y + h * 0.42, w * 0.18, h * 0.58, 5);
      const leafColor = spot.kind === 'tree' ? '#1f9f68' : '#2fa86f';
      [[0.5, 0.28, 0.46, 0.26], [0.34, 0.44, 0.34, 0.22], [0.66, 0.44, 0.34, 0.22], [0.5, 0.52, 0.42, 0.25]].forEach((blob, index) => {
        ctx.fillStyle = shadeHideSeekColor(leafColor, index === 0 ? 16 : -index * 5);
        ctx.beginPath();
        ctx.ellipse(x + w * blob[0], y + h * blob[1], w * blob[2], h * blob[3], 0, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (spot.kind === 'car') {
      drawHideSeekPickupTruck(ctx, x, y, w, h);
    } else if (spot.kind === 'fountain') {
      ctx.fillStyle = '#587c8b';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dff8ff';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 3, h / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(46,199,211,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 5, 0, Math.PI * 1.6);
      ctx.stroke();
    } else {
      const utility = ctx.createLinearGradient(x, y, x, y + h);
      utility.addColorStop(0, '#7a8794');
      utility.addColorStop(1, '#3f4b58');
      ctx.fillStyle = utility;
      fillHideSeekRoundedRect(ctx, x, y, w, h, 8);
    }
    ctx.strokeStyle = highlight;
    strokeHideSeekRoundedRect(ctx, x, y, w, h, 9);
    if (visibleState === 'disabled') {
      ctx.fillStyle = 'rgba(6,21,36,0.42)';
      fillHideSeekRoundedRect(ctx, x, y, w, h, 9);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 12);
      ctx.lineTo(x + w - 12, y + h - 12);
      ctx.moveTo(x + w - 12, y + 12);
      ctx.lineTo(x + 12, y + h - 12);
      ctx.stroke();
    }
    if (visibleState === 'disabled' || visibleState === 'searched' || visibleState === 'found') {
      ctx.fillStyle = visibleState === 'searched' ? 'rgba(6,21,36,0.78)' : 'rgba(6,21,36,0.88)';
      fillHideSeekRoundedRect(ctx, x + 8, y + 8, 86, 20, 10);
      ctx.fillStyle = visibleState === 'searched' ? '#d7dce4' : visibleState === 'found' ? '#bdeff4' : '#fff2d8';
      ctx.font = '900 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(visibleState.toUpperCase(), x + 16, y + 22);
    }
    if (hideSeekState.inspectedSpotId === spot.id && hideSeekState.inspectTime > 0) {
      const progress = 1 - hideSeekState.inspectTime / HIDE_SEEK_INSPECT_SECONDS;
      ctx.strokeStyle = 'rgba(255,255,255,0.86)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.max(w, h) * 0.42 + progress * 22, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (isNearby) {
      ctx.fillStyle = 'rgba(6, 21, 36, 0.82)';
      fillHideSeekRoundedRect(ctx, x + w / 2 - 58, y - 27, 116, 20, 10);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(spot.label, x + w / 2, y - 13);
      const quality = getHideSeekCoverQuality(getHideSeekActiveActor());
      if (hideSeekState.phase === HideSeekGameState.HIDER_TURN && quality.spot && quality.spot.id === spot.id) {
        ctx.fillStyle = 'rgba(6, 21, 36, 0.82)';
        fillHideSeekRoundedRect(ctx, x + w / 2 - 64, y + h + 8, 128, 22, 11);
        ctx.fillStyle = '#fff2d8';
        ctx.font = '900 11px Arial';
        ctx.fillText(`${quality.label} ${'*'.repeat(quality.score)}`, x + w / 2, y + h + 23);
      }
    }
    if (isNearby) {
      ctx.fillStyle = '#f58220';
      ctx.beginPath();
      ctx.arc(x + w - 12, y + 12, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawHideSeekActors(ctx, room) {
    const actors = [hideSeekState.actors.hider, hideSeekState.actors.seeker];
    actors.forEach(actor => {
      if (!actor.visible || actor.roomId !== room.id) return;
      if (actor === getHideSeekActiveActor() && hideSeekState.input.sprint && hideSeekState.stamina > 0) {
        drawHideSeekSprintTrail(ctx, actor);
      }
      drawHideSeekActor(ctx, actor);
    });
    if (hideSeekState.revealPulse > 0) {
      ctx.strokeStyle = `rgba(245, 130, 32, ${Math.min(1, hideSeekState.revealPulse)})`;
      ctx.lineWidth = 8;
      const actor = hideSeekState.actors.hider;
      ctx.beginPath();
      ctx.arc(actor.x + actor.width / 2, actor.y + actor.height / 2, 52 - hideSeekState.revealPulse * 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawHideSeekSprintTrail(ctx, actor) {
    ctx.save();
    ctx.strokeStyle = 'rgba(189, 239, 244, 0.58)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i += 1) {
      const offset = i * 8;
      ctx.beginPath();
      ctx.moveTo(actor.x - 10 - offset, actor.y + actor.height - 4 + i);
      ctx.lineTo(actor.x - 24 - offset, actor.y + actor.height + 4 + i);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHideSeekActor(ctx, actor) {
    const bob = Math.sin(performance.now() / 130) * 1.5;
    const isSeeker = actor === hideSeekState.actors.seeker;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(actor.x + actor.width / 2, actor.y + actor.height + 5, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyGradient = ctx.createLinearGradient(actor.x, actor.y, actor.x, actor.y + actor.height);
    bodyGradient.addColorStop(0, shadeHideSeekColor(actor.color, 18));
    bodyGradient.addColorStop(1, shadeHideSeekColor(actor.color, -16));
    ctx.fillStyle = bodyGradient;
    fillHideSeekRoundedRect(ctx, actor.x, actor.y + 12 + bob, actor.width, actor.height - 6, 7);

    ctx.fillStyle = shadeHideSeekColor(actor.color, -20);
    fillHideSeekRoundedRect(ctx, actor.x - 5, actor.y + 18 + bob, 7, 16, 4);
    fillHideSeekRoundedRect(ctx, actor.x + actor.width - 2, actor.y + 18 - bob, 7, 16, 4);

    ctx.fillStyle = '#fff2d8';
    fillHideSeekRoundedRect(ctx, actor.x + 2, actor.y + bob, actor.width - 4, 17, 8);
    ctx.fillStyle = '#5b3a2e';
    fillHideSeekRoundedRect(ctx, actor.x + 3, actor.y - 2 + bob, actor.width - 6, 7, 5);
    ctx.fillStyle = isSeeker ? '#ffd166' : '#2ec7d3';
    ctx.fillRect(actor.x + 5, actor.y - 4 + bob, actor.width - 10, 4);
    ctx.fillStyle = '#061524';
    ctx.fillRect(actor.x + 7, actor.y + 7 + bob, 4, 4);
    ctx.fillRect(actor.x + actor.width - 11, actor.y + 7 + bob, 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(actor.x + 5, actor.y + 15 + bob, actor.width - 10, 2);
    ctx.fillStyle = isSeeker ? 'rgba(255, 209, 102, 0.8)' : 'rgba(189, 239, 244, 0.7)';
    ctx.fillRect(actor.x + actor.width - 4, actor.y + 16 + bob, 6, 8);
    ctx.fillStyle = isSeeker ? '#fff2d8' : '#ffd166';
    ctx.beginPath();
    ctx.arc(actor.x + actor.width / 2, actor.y + 4 + bob, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#061524';
    fillHideSeekRoundedRect(ctx, actor.x + 2, actor.y + actor.height + 2, 8, 5, 3);
    fillHideSeekRoundedRect(ctx, actor.x + actor.width - 10, actor.y + actor.height + 2, 8, 5, 3);
  }

  function drawHideSeekMeter(ctx, x, y, width, value, color, label) {
    const clamped = Math.max(0, Math.min(100, value));
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    fillHideSeekRoundedRect(ctx, x, y, width, 7, 4);
    ctx.fillStyle = color;
    fillHideSeekRoundedRect(ctx, x, y, width * (clamped / 100), 7, 4);
    ctx.fillStyle = '#bdeff4';
    ctx.font = '800 9px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(label, x, y - 2);
  }

  function drawHideSeekHud(ctx, room, map) {
    const hiderName = getHideSeekPlayerName(hideSeekState.hiderIndex);
    const seekerName = getHideSeekPlayerName(hideSeekState.seekerIndex);
    const displayValue = hideSeekState.phase === HideSeekGameState.HIDER_TURN
      ? hideSeekState.hiderTimeRemaining
      : hideSeekState.searchesRemaining;
    const isUrgent = hideSeekState.phase === HideSeekGameState.SEEKER_TURN && displayValue <= 2;

    const hudGradient = ctx.createLinearGradient(0, 0, 0, 58);
    hudGradient.addColorStop(0, 'rgba(6,21,36,0.96)');
    hudGradient.addColorStop(1, 'rgba(9,35,63,0.84)');
    ctx.fillStyle = hudGradient;
    ctx.fillRect(0, 0, 800, 58);
    ctx.fillStyle = 'rgba(46,199,211,0.28)';
    ctx.fillRect(0, 56, 800, 2);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    fillHideSeekRoundedRect(ctx, 14, 10, 270, 36, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${map.name}`, 26, 25);
    ctx.fillStyle = '#bdeff4';
    ctx.font = '800 12px Arial';
    ctx.fillText(room.name, 26, 42);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    fillHideSeekRoundedRect(ctx, 305, 10, 286, 36, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px Arial';
    ctx.fillText(`Hider: ${hiderName}`, 318, 25);
    ctx.fillStyle = '#ffdcb5';
    ctx.fillText(`Seeker: ${seekerName}  Wrong: ${hideSeekState.wrongGuesses}`, 318, 42);

    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      const quality = getHideSeekCoverQuality(hideSeekState.actors.hider);
      ctx.fillStyle = quality.score >= 4 ? '#bdeff4' : '#fff2d8';
      ctx.font = '900 10px Arial';
      ctx.fillText(`Cover: ${quality.label}`, 472, 25);
      ctx.fillText(`Noise: ${Math.round(hideSeekState.noiseLevel * 100)}%`, 472, 42);
      drawHideSeekMeter(ctx, 544, 39, 38, hideSeekState.stamina, '#2ec7d3', '');
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      ctx.fillStyle = '#fff2d8';
      ctx.font = '900 10px Arial';
      ctx.fillText(`Miss: -1 search`, 472, 25);
      ctx.fillText(`Inspect cover`, 472, 42);
      drawHideSeekMeter(ctx, 544, 31, 38, hideSeekState.stamina, '#2ec7d3', '');
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = isUrgent ? '#ff4d4d' : '#f58220';
    fillHideSeekRoundedRect(ctx, 650, 8, 132, 40, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px Arial';
    ctx.fillText(hideSeekState.phase === HideSeekGameState.HIDER_TURN ? `${Math.ceil(displayValue)}s` : `${displayValue}`, 778, 31);
    ctx.fillStyle = isUrgent ? '#fff2d8' : '#09233f';
    ctx.font = '900 10px Arial';
    ctx.fillText(hideSeekState.phase === HideSeekGameState.HIDER_TURN ? 'HIDE' : 'SEARCHES', 778, 44);

    if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      const actor = hideSeekState.actors.seeker;
      ctx.strokeStyle = 'rgba(245,130,32,0.38)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(actor.x + actor.width / 2, actor.y + actor.height / 2, HIDE_SEEK_SEARCH_TOLERANCE, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(actor.x + actor.width / 2 - 10, actor.y + actor.height / 2);
      ctx.lineTo(actor.x + actor.width / 2 + 10, actor.y + actor.height / 2);
      ctx.moveTo(actor.x + actor.width / 2, actor.y + actor.height / 2 - 10);
      ctx.lineTo(actor.x + actor.width / 2, actor.y + actor.height / 2 + 10);
      ctx.stroke();
    }
  }

  function drawHideSeekDebugRect(ctx, rect, color, label) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.setLineDash([]);
    if (label) {
      ctx.fillStyle = 'rgba(6, 21, 36, 0.86)';
      fillHideSeekRoundedRect(ctx, rect.x, Math.max(60, rect.y - 18), Math.min(210, Math.max(58, label.length * 7)), 16, 5);
      ctx.fillStyle = color;
      ctx.font = '800 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(label, rect.x + 5, Math.max(72, rect.y - 6));
    }
    ctx.restore();
  }

  function drawHideSeekDebugPoint(ctx, x, y, color, label) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.fillStyle = 'rgba(6, 21, 36, 0.86)';
      fillHideSeekRoundedRect(ctx, x + 8, y - 18, Math.min(240, Math.max(70, label.length * 7)), 18, 5);
      ctx.fillStyle = color;
      ctx.font = '800 10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 13, y - 6);
    }
    ctx.restore();
  }

  function drawHideSeekDebug(ctx, room, map) {
    const actor = getHideSeekActiveActor();
    ctx.save();
    ctx.font = '800 10px Arial';
    ctx.textAlign = 'left';

    drawHideSeekDebugRect(ctx, getHideSeekFloorRect(), '#ffffff', 'playable floor');

    (room.exits || []).forEach(exit => {
      drawHideSeekDebugRect(ctx, getHideSeekExitTriggerRect(exit), 'rgba(46, 199, 211, 0.48)', `trigger:${exit.label}`);
      drawHideSeekDebugRect(ctx, exit, '#2ec7d3', `exit:${exit.label}->${exit.targetRoom}`);
    });

    (room.obstacles || []).forEach(obstacle => {
      const color = obstacle.type === 'slow' ? '#ffd166' : '#ff4d4d';
      drawHideSeekDebugRect(ctx, obstacle, color, `${obstacle.type}:${obstacle.id}`);
    });

    (room.spots || []).forEach(spot => {
      const collision = getHideSeekSpotCollisionRect(spot);
      const centerX = spot.x + spot.width / 2;
      const centerY = spot.y + spot.height / 2;
      drawHideSeekDebugRect(ctx, spot, '#f58220', `spot:${spot.id}`);
      drawHideSeekDebugRect(ctx, collision, '#ff4d4d', `solid:${spot.kind}`);
      ctx.strokeStyle = 'rgba(46, 199, 211, 0.72)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, spot.interactionRadius || Math.round(42 * HIDE_SEEK_SCALE), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    [
      ['hider', hideSeekState.actors.hider, '#2ec7d3'],
      ['seeker', hideSeekState.actors.seeker, '#f58220'],
    ].forEach(([name, item, color]) => {
      if (item.roomId !== room.id) return;
      drawHideSeekDebugRect(ctx, item, color, `${name} sprite ${Math.round(item.x)},${Math.round(item.y)}`);
      drawHideSeekDebugRect(ctx, getHideSeekActorCollider(item), '#8cff66', `${name} collider`);
    });

    if (actor && actor.roomId === room.id) {
      ctx.strokeStyle = '#f7fbff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(actor.x + actor.width / 2, actor.y + actor.height / 2, HIDE_SEEK_SEARCH_TOLERANCE, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (hideSeekState.hiddenPosition && hideSeekState.hiddenPosition.roomId === room.id) {
      drawHideSeekDebugPoint(
        ctx,
        hideSeekState.hiddenPosition.x + hideSeekState.actors.hider.width / 2,
        hideSeekState.hiddenPosition.y + hideSeekState.actors.hider.height / 2,
        '#ff4df0',
        `hidden:${Math.round(hideSeekState.hiddenPosition.x)},${Math.round(hideSeekState.hiddenPosition.y)}`
      );
    }

    // Highlight the currently selected hide spot (tap / cycle / auto-hide).
    if (hideSeekSelectedSpotId) {
      const selected = getHideSeekSpotById(hideSeekSelectedSpotId);
      if (selected && selected.roomId === room.id) {
        ctx.save();
        ctx.strokeStyle = '#ffe066';
        ctx.lineWidth = 3;
        ctx.strokeRect(selected.x, selected.y, selected.width, selected.height);
        ctx.restore();
        drawHideSeekDebugPoint(ctx, selected.x + selected.width / 2, selected.y + selected.height / 2, '#ffe066', `selected:${selected.id}`);
      }
    }

    // Emphasise the actual hidden spot when "Reveal Hidden Spot" is toggled.
    if (hideSeekRevealHidden && hideSeekState.hiddenSpotId) {
      const hiddenSpot = getHideSeekSpotById(hideSeekState.hiddenSpotId);
      if (hiddenSpot && hiddenSpot.roomId === room.id) {
        ctx.save();
        ctx.strokeStyle = '#ff4df0';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(hiddenSpot.x - 4, hiddenSpot.y - 4, hiddenSpot.width + 8, hiddenSpot.height + 8);
        ctx.restore();
      }
    }

    // Last tapped point in canvas coordinates.
    if (hideSeekDebug.lastTapCanvas) {
      drawHideSeekDebugPoint(ctx, hideSeekDebug.lastTapCanvas.x, hideSeekDebug.lastTapCanvas.y, '#9af0ff', 'last tap');
    }

    ctx.fillStyle = 'rgba(6, 21, 36, 0.9)';
    fillHideSeekRoundedRect(ctx, 14, 64, 300, 92, 8);
    ctx.fillStyle = '#f7fbff';
    ctx.font = '900 12px Arial';
    ctx.fillText('DEBUG', 26, 82);
    ctx.font = '800 10px Arial';
    ctx.fillStyle = '#bdeff4';
    ctx.fillText(`map=${map.id} room=${room.id} phase=${hideSeekState.phase}`, 26, 99);
    ctx.fillText(`spots=${room.spots.length} exits=${room.exits.length} obstacles=${(room.obstacles || []).length}`, 26, 114);
    ctx.fillText(`selected=${hideSeekSelectedSpotId || '-'}  hidden=${hideSeekState.hiddenSpotId || '-'}`, 26, 129);
    ctx.fillText(`inspected=${hideSeekState.inspectedSpotId || '-'}`, 26, 144);
    ctx.restore();
  }

  function setHideSeekInput(direction, active) {
    if (!hideSeekState.input || !direction) return;
    hideSeekState.input[direction] = active;
  }

  function isHideSeekMovementPhase() {
    return hideSeekState.phase === HideSeekGameState.HIDER_TURN
      || hideSeekState.phase === HideSeekGameState.SEEKER_TURN;
  }

  function getHideSeekCanvasPoint(event) {
    const rect = hideSeekCanvas.getBoundingClientRect();
    const { width, height } = getHideSeekCanvasSize();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height,
    };
  }

  function handleHideSeekPointer(event, options = {}) {
    if (!hideSeekCanvas || !hideSeekState.input) return;
    if (!isHideSeekMovementPhase()) return;
    if (!options.start && event.pointerId !== hideSeekActiveCanvasPointerId) return;
    const point = getHideSeekCanvasPoint(event);
    if (!point) return;
    event.preventDefault();
    hideSeekState.touchTarget = point;
    if (hideSeekDebugEnabled) {
      hideSeekDebug.lastTapRaw = { x: event.clientX, y: event.clientY };
      hideSeekDebug.lastTapCanvas = point;
      const spot = getHideSeekSpotAtPoint(point);
      if (spot) {
        hideSeekSelectedSpotId = spot.id;
        hideSeekDebugLog(`Tap hit spot ${spot.id} (${spot.label}) @cvs ${Math.round(point.x)},${Math.round(point.y)}`);
      } else {
        hideSeekDebugLog(`Tap on floor @cvs ${Math.round(point.x)},${Math.round(point.y)} (no spot)`);
      }
      renderHideSeekDebugPanel();
    }
  }

  function handleHideSeekCanvasDoubleTap(event) {
    if (hideSeekState.phase !== HideSeekGameState.HIDER_TURN) {
      hideSeekLastCanvasTap = null;
      return;
    }
    const point = getHideSeekCanvasPoint(event);
    if (!point) return;
    const now = event.timeStamp || performance.now();
    const previous = hideSeekLastCanvasTap;
    const isDoubleTap = previous
      && now - previous.time <= HIDE_SEEK_DOUBLE_TAP_MS
      && Math.hypot(point.x - previous.x, point.y - previous.y) <= HIDE_SEEK_DOUBLE_TAP_RADIUS;
    hideSeekLastCanvasTap = { time: now, x: point.x, y: point.y };
    if (!isDoubleTap) return;
    hideSeekLastCanvasTap = null;
    hideSeekState.touchTarget = null;
    lockHideSeekHiderPosition('button', getNearbyHideSeekSpot(hideSeekState.actors.hider));
  }

  function releaseHideSeekPointer() {
    hideSeekActiveCanvasPointerId = null;
    hideSeekState.touchTarget = null;
  }

  function toggleHideSeekDebug() {
    hideSeekDebugEnabled = !hideSeekDebugEnabled;
    setStoredJson('rtaHideSeekDebug', hideSeekDebugEnabled);
    hideSeekDebugLog(`Debug overlay ${hideSeekDebugEnabled ? 'ON' : 'OFF'}.`);
    renderHideSeekDebugPanel();
    renderHideSeek();
  }

  // ---- Computer Mode / Debug Mode helpers -----------------------------------

  function getAllHideSeekSpots() {
    const map = getHideSeekMap();
    const out = [];
    if (map && map.rooms) {
      Object.values(map.rooms).forEach(room => {
        (room.spots || []).forEach(spot => out.push(Object.assign({ roomId: room.id }, spot)));
      });
    }
    return out;
  }

  // Returns the visible hide spot whose drawn rectangle contains the given
  // canvas-space point (small padding so the tap hitbox matches the art).
  function getHideSeekSpotAtPoint(point) {
    if (!point) return null;
    const room = getHideSeekRoom(hideSeekState.activeRoomId);
    if (!room) return null;
    const pad = Math.round(6 * HIDE_SEEK_SCALE);
    let best = null;
    (room.spots || []).forEach(spot => {
      if (
        point.x >= spot.x - pad && point.x <= spot.x + spot.width + pad &&
        point.y >= spot.y - pad && point.y <= spot.y + spot.height + pad
      ) {
        const center = getHideSeekSpotCenter(spot);
        const distance = Math.hypot(point.x - center.x, point.y - center.y);
        if (!best || distance < best.distance) {
          best = { spot: Object.assign({ roomId: room.id }, spot), distance };
        }
      }
    });
    return best ? best.spot : null;
  }

  function hideSeekDebugLog(message) {
    const stamp = new Date().toLocaleTimeString();
    hideSeekDebug.log.unshift(`[${stamp}] ${message}`);
    if (hideSeekDebug.log.length > 8) hideSeekDebug.log.length = 8;
    if (typeof console !== 'undefined' && console.log) console.log('[HideSeek] ' + message);
    renderHideSeekDebugPanel();
  }

  function renderHideSeekDebugPanel() {
    if (!hideSeekDebugPanel) return;
    hideSeekDebugPanel.hidden = !hideSeekDebugEnabled;
    if (!hideSeekDebugEnabled) return;
    const tapRaw = hideSeekDebug.lastTapRaw
      ? `${Math.round(hideSeekDebug.lastTapRaw.x)}, ${Math.round(hideSeekDebug.lastTapRaw.y)}`
      : '—';
    const tapCanvas = hideSeekDebug.lastTapCanvas
      ? `${Math.round(hideSeekDebug.lastTapCanvas.x)}, ${Math.round(hideSeekDebug.lastTapCanvas.y)}`
      : '—';
    const lines = [
      `phase:     ${hideSeekState.phase}`,
      `selected:  ${hideSeekSelectedSpotId || '(none)'}`,
      `hidden:    ${hideSeekState.hiddenSpotId || '(none)'}`,
      `inspected: ${hideSeekState.inspectedSpotId || '(none)'}`,
      `tap (css): ${tapRaw}`,
      `tap (cvs): ${tapCanvas}`,
    ];
    if (hideSeekDebug.lastInspect) {
      const li = hideSeekDebug.lastInspect;
      lines.push(`find: ${li.match ? 'EXACT MATCH' : 'no match'} dist=${Math.round(li.distance)} tol=${HIDE_SEEK_SEARCH_TOLERANCE}`);
    }
    if (hideSeekDebugReadout) hideSeekDebugReadout.textContent = lines.join('\n');
    if (hideSeekDebugLogEl) hideSeekDebugLogEl.textContent = hideSeekDebug.log.join('\n');
  }

  // Auto-hide the hider in a random valid spot in the current room.
  function hideSeekAutoHide() {
    if (hideSeekState.phase !== HideSeekGameState.HIDER_TURN) {
      hideSeekDebugLog('Auto Hide ignored — not the hider movement turn.');
      return;
    }
    const room = getHideSeekRoom(hideSeekState.actors.hider.roomId);
    const spots = ((room && room.spots) || []).filter(spot => getHideSeekSpotState(spot.id) !== 'disabled');
    if (!spots.length) {
      hideSeekDebugLog('Auto Hide: no valid spots in this room.');
      return;
    }
    const picked = spots[Math.floor(Math.random() * spots.length)];
    const spot = Object.assign({ roomId: room.id }, picked);
    placeHideSeekActorAtSpot(hideSeekState.actors.hider, spot);
    hideSeekSelectedSpotId = spot.id;
    hideSeekDebugLog(`Auto Hide → ${spot.id} (${spot.label}).`);
    lockHideSeekHiderPosition('button', spot);
  }

  function hideSeekRevealHiddenSpot() {
    hideSeekRevealHidden = !hideSeekRevealHidden;
    if (hideSeekState.hiddenSpotId) {
      const p = hideSeekState.hiddenPosition;
      hideSeekDebugLog(
        `Hidden spot: ${hideSeekState.hiddenSpotId} @ ${p ? Math.round(p.x) + ',' + Math.round(p.y) : '?'} ` +
        `(reveal ${hideSeekRevealHidden ? 'ON' : 'OFF'}).`
      );
    } else {
      hideSeekDebugLog('No hider hidden yet — nothing to reveal.');
    }
    renderHideSeek();
  }

  // Cycle through every defined hide spot, moving the active actor onto it so
  // each spot can be visually verified one by one.
  function hideSeekCycleSpot() {
    const spots = getAllHideSeekSpots();
    if (!spots.length) {
      hideSeekDebugLog('Next Spot: no spots defined.');
      return;
    }
    hideSeekDebug.cycleIndex = (hideSeekDebug.cycleIndex + 1) % spots.length;
    const spot = spots[hideSeekDebug.cycleIndex];
    hideSeekSelectedSpotId = spot.id;
    const actor = getHideSeekActiveActor() || hideSeekState.actors.hider;
    if (actor && isHideSeekMovementPhase()) {
      hideSeekState.activeRoomId = spot.roomId;
      actor.roomId = spot.roomId;
      placeHideSeekActorAtSpot(actor, spot);
    }
    hideSeekDebugLog(
      `Next spot [${hideSeekDebug.cycleIndex + 1}/${spots.length}]: ${spot.id} ` +
      `room=${spot.roomId} @${spot.x},${spot.y} ${spot.width}x${spot.height}`
    );
    renderHideSeek();
  }

  // Validate every defined hide spot: id, numeric geometry, usable collider,
  // and on-canvas placement. Reports a pass/fail summary to the debug log.
  function hideSeekTestAllSpots() {
    const spots = getAllHideSeekSpots();
    const size = getHideSeekCanvasSize();
    let pass = 0;
    const fails = [];
    spots.forEach(spot => {
      const problems = [];
      if (!spot.id) problems.push('missing id');
      ['x', 'y', 'width', 'height'].forEach(key => {
        if (typeof spot[key] !== 'number' || Number.isNaN(spot[key])) problems.push('bad ' + key);
      });
      const collision = getHideSeekSpotCollisionRect(spot);
      if (!collision || collision.width <= 0 || collision.height <= 0) problems.push('bad collider');
      const center = getHideSeekSpotCenter(spot);
      if (center.x < 0 || center.x > size.width || center.y < 0 || center.y > size.height) {
        problems.push('off-canvas');
      }
      if (problems.length) fails.push(`${spot.id || '???'} (${spot.roomId}): ${problems.join(', ')}`);
      else pass += 1;
    });
    hideSeekDebugLog(
      `Test All Spots: ${pass}/${spots.length} OK` +
      (fails.length ? ` — issues: ${fails.join(' | ')}` : ' — every spot is valid.')
    );
  }

  function hideSeekClearDebug() {
    hideSeekDebug.log.length = 0;
    hideSeekDebug.lastTapRaw = null;
    hideSeekDebug.lastTapCanvas = null;
    hideSeekDebug.lastInspect = null;
    hideSeekSelectedSpotId = null;
    hideSeekRevealHidden = false;
    renderHideSeekDebugPanel();
    renderHideSeek();
  }

  async function toggleHideSeekFullscreen() {
    const target = sections.hideSeek || hideSeekCanvas;
    try {
      if (!isImmersive(target)) {
        await enterImmersive(target);
      } else {
        await exitImmersive(target);
      }
    } catch (error) {
      setHideSeekMessage('Full screen is not available in this browser.');
    }
    updateHideSeekFullscreenButton();
    updateHideSeekOrientationOverlay();
  }

  function updateHideSeekFullscreenButton() {
    if (!hideSeekFullscreenButton) return;
    hideSeekFullscreenButton.textContent = isImmersive(sections.hideSeek) ? 'Exit Full Screen' : 'Full Screen';
  }

  // Shows a "rotate your device" nudge when playing Hide & Seek full screen in
  // portrait, where the wide room map is cramped.
  function updateHideSeekOrientationOverlay() {
    if (!hideSeekRotateOverlay) return;
    const immersive = isImmersive(sections.hideSeek);
    const portrait = window.matchMedia ? window.matchMedia('(orientation: portrait)').matches : false;
    const show = immersive && portrait && currentSectionKey === 'hideSeek';
    hideSeekRotateOverlay.hidden = !show;
  }

  function handleHideSeekKey(event, active) {
    if (currentSectionKey !== 'hideSeek') return;
    if (active && event.key === '`') {
      event.preventDefault();
      toggleHideSeekDebug();
      return;
    }
    const keyMap = {
      ArrowUp: 'up',
      w: 'up',
      W: 'up',
      ArrowDown: 'down',
      s: 'down',
      S: 'down',
      ArrowLeft: 'left',
      a: 'left',
      A: 'left',
      ArrowRight: 'right',
      d: 'right',
      D: 'right',
    };
    if (keyMap[event.key]) {
      event.preventDefault();
      setHideSeekInput(keyMap[event.key], active);
      return;
    }
    if (event.key === 'Shift') {
      event.preventDefault();
      setHideSeekInput('sprint', active);
      return;
    }
    if (active && ['e', 'E', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault();
      markHideSeekFound();
      return;
    }
    if (active && ['q', 'Q'].includes(event.key)) {
      event.preventDefault();
      useHideSeekSpecialAction();
    }
  }

  function showHideSeekSummary() {
    stopHideSeekTimer();
    showSection('summary');
    const scores = getHideSeekScoreMap();
    const leaders = getWinningPlayers(scores);
    const winner = formatWinner(leaders, leader => `${leader.name} wins Hide & Seek`, 'Hide & Seek ends in a tie');
    const scoreText = getHideSeekRoster().map(player => `${player.name}: ${scores[player.id] || 0}`).join(', ');
    summaryText.textContent = `${winner}. ${scoreText}.`;
    summaryList.innerHTML = '';
    [
      `Map: ${getHideSeekMap().name}.`,
      `Rounds completed: ${hideSeekRound} of ${getHideSeekMaxRounds()}.`,
      hideSeekState.lastRoundText || 'No completed round yet.',
    ].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      summaryList.appendChild(li);
    });
  }

  function getDeviceFeedbackInfo() {
    return [
      '',
      '--- Device info (optional) ---',
      `Browser: ${navigator.userAgent}`,
      `Platform: ${navigator.platform || 'Unknown'}`,
      `Screen: ${window.screen ? `${window.screen.width}x${window.screen.height}` : 'Unknown'}`,
      `Viewport: ${window.innerWidth}x${window.innerHeight}`,
      `Language: ${navigator.language || 'Unknown'}`,
    ].join('\n');
  }

  function buildTriviaQuestions(categoryId) {
    const baseCandidates = categoryId === 'mixed'
      ? triviaDatabase
      : triviaDatabase.filter(item => item.category === categoryId);
    const qualityCandidates = baseCandidates.filter(item => !hiddenTriviaCategories.has(item.category));
    const settingsCandidates = qualityCandidates.filter(triviaItemAllowedBySettings);
    const candidatePool = settingsCandidates.length ? settingsCandidates : qualityCandidates;
    if (!candidatePool.length) return [];

    const filteredCandidates = candidatePool.filter(item => item.difficulty === activeTriviaDifficulty);
    const candidates = filteredCandidates.length ? filteredCandidates : candidatePool;
    let available = candidates.filter(item => !isTriviaQuestionSeen(item));

    if (!available.length) {
      clearTriviaHistoryForCandidates(candidates);
      available = candidates.slice();
    }
    return shuffle(available.slice()).slice(0, getTriviaQuestionLimit());
  }

  function isPopCultureTriviaCategory(categoryId) {
    return [
      'movies',
      'music',
      'tv',
      'southpark',
      'rickmorty',
      'seinfeld',
      'friends',
      'kpop',
      'taylorswift',
      'eighties',
      'nineties',
      'twothousands',
      'twentytens',
      'twentytwenties',
    ].includes(categoryId);
  }

  function triviaItemAllowedBySettings(item) {
    if (!tripSettings.noPopCulture) return true;
    return !isPopCultureTriviaCategory(item.category);
  }

  function getTriviaTrackingKeys(item, categoryId) {
    const difficulty = activeTriviaDifficulty || 'easy';
    const keys = new Set([`mixed:${difficulty}`]);
    const itemCategory = item && item.category ? item.category : categoryId;
    if (itemCategory) keys.add(`${itemCategory}:${difficulty}`);
    if (categoryId && categoryId !== 'mixed') keys.add(`${categoryId}:${difficulty}`);
    return Array.from(keys);
  }

  function isTriviaQuestionSeen(item) {
    return getTriviaTrackingKeys(item, activeTriviaCategory)
      .some(key => Array.isArray(triviaHistory[key]) && triviaHistory[key].includes(item.id));
  }

  function clearTriviaHistoryForCandidates(candidates) {
    if (!Array.isArray(candidates) || !candidates.length) return;
    const touchedKeys = new Set();
    candidates.forEach((item) => {
      getTriviaTrackingKeys(item, activeTriviaCategory).forEach(key => touchedKeys.add(key));
    });
    touchedKeys.forEach((key) => {
      if (!Array.isArray(triviaHistory[key]) || !triviaHistory[key].length) return;
      const candidateIds = new Set(candidates
        .filter(item => getTriviaTrackingKeys(item, activeTriviaCategory).includes(key))
        .map(item => item.id));
      triviaHistory[key] = triviaHistory[key].filter(id => !candidateIds.has(id));
    });
    setStoredJson('rtaTriviaHistory', triviaHistory);
  }

  function markTriviaSeen(item) {
    if (!item || !item.id) return;
    let didChange = false;
    getTriviaTrackingKeys(item, activeTriviaCategory).forEach((key) => {
      if (!triviaHistory[key]) triviaHistory[key] = [];
      if (!triviaHistory[key].includes(item.id)) {
        triviaHistory[key].push(item.id);
        didChange = true;
      }
    });
    if (didChange) setStoredJson('rtaTriviaHistory', triviaHistory);
  }

  function getTriviaChoices(item) {
    if (Array.isArray(item.choices) && item.choices.length) {
      return shuffle(item.choices.slice());
    }
    const sameCategoryAnswers = triviaDatabase
      .filter(entry => entry.id !== item.id && entry.category === item.category && entry.answer !== item.answer)
      .map(entry => entry.answer);
    const backupAnswers = triviaDatabase
      .filter(entry => entry.id !== item.id && entry.category !== item.category && entry.answer !== item.answer)
      .map(entry => entry.answer);
    const wrongAnswers = uniqueList(shuffle(sameCategoryAnswers).concat(shuffle(backupAnswers)));
    return shuffle([item.answer].concat(wrongAnswers.slice(0, 3)));
  }

  function uniqueList(items) {
    return items.filter((item, index) => items.indexOf(item) === index);
  }

  function renderTriviaChoices(item) {
    triviaChoices.innerHTML = '';
    const turnPlayerId = getTurnPlayerId(triviaIndex);
    const feedback = {
      correct: [
        'Direct hit. The car brain just got one point stronger.',
        'Clean answer. Give that passenger the tiny scholar nod.',
        'Correct. That one deserves a dashboard drumroll.',
      ],
      wrong: [
        'Close call, but the road signs disagree.',
        'Wrong exit. The right answer was hiding in the next lane.',
        'Not quite. Same road, different mile marker.',
      ],
    };
    getTriviaChoices(item).forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.textContent = choice;
      button.addEventListener('click', () => {
        const isCorrect = choice === item.answer;
        button.classList.add(isCorrect ? 'correct' : 'incorrect');
        Array.from(triviaChoices.querySelectorAll('button')).forEach(choiceButton => {
          choiceButton.disabled = true;
          if (choiceButton.textContent === item.answer) choiceButton.classList.add('correct');
        });
        triviaAnswer.hidden = false;
        if (isCorrect && turnPlayerId) {
          triviaAnswer.textContent = `${feedback.correct[Math.floor(Math.random() * feedback.correct.length)]} Answer: ${item.answer}`;
          awardTrivia(turnPlayerId);
        } else {
          triviaAnswer.textContent = `${feedback.wrong[Math.floor(Math.random() * feedback.wrong.length)]} Answer: ${item.answer}`;
          renderAwardButtons(triviaAwardButtons, 'Gets Override Point', awardTrivia, false);
        }
      });
      triviaChoices.appendChild(button);
    });
  }

  function renderTriviaCategories() {
    triviaCategoryGrid.innerHTML = '';
    const visibleCategories = triviaCategories.filter(category => (
      !hiddenTriviaCategories.has(category.id)
      && (!tripSettings.noPopCulture || !isPopCultureTriviaCategory(category.id))
    ));
    visibleCategories.forEach(category => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card trivia-category-card';
      button.dataset.triviaCategory = category.id;

      const icon = document.createElement('span');
      icon.className = 'option-emoji';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = category.emoji;

      const title = document.createElement('span');
      title.className = 'option-title';
      title.textContent = category.label;

      button.appendChild(icon);
      button.appendChild(title);
      button.addEventListener('click', () => startTriviaCategory(category.id));
      triviaCategoryGrid.appendChild(button);
    });
  }

  function renderTriviaDifficultyButtons() {
    if (!triviaDifficultyButtons) return;
    Array.from(triviaDifficultyButtons.querySelectorAll('button[data-difficulty]')).forEach(button => {
      const isActive = button.dataset.difficulty === activeTriviaDifficulty;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function startTriviaRun() {
    resetGame();
    if (tripSettings.hardTrivia) {
      activeTriviaDifficulty = 'hard';
      setStoredJson('rtaLastTriviaDifficulty', activeTriviaDifficulty);
    }
    triviaDeck = [];
    triviaIndex = 0;
    triviaScore = createScoreMap();
    triviaQuestionAwarded = false;
    renderScoreboard(triviaScoreboard, triviaScore);
    triviaPlay.hidden = true;
    finishTriviaButton.hidden = true;
    triviaIntro.textContent = `Pick a category and a difficulty. The app names whose turn it is, scores correct answers automatically, and runs up to ${getTriviaQuestionLimit()} questions.`;
    renderTriviaCategories();
    renderTriviaDifficultyButtons();
    showSection('trivia');
  }

  function startTriviaCategory(categoryId) {
    activeTriviaCategory = categoryId;
    setStoredJson('rtaLastTriviaCategory', categoryId);
    renderTriviaDifficultyButtons();
    triviaDeck = buildTriviaQuestions(categoryId);
    triviaIndex = 0;
    triviaScore = createScoreMap();
    triviaQuestionAwarded = false;
    renderScoreboard(triviaScoreboard, triviaScore);
    renderAwardButtons(triviaAwardButtons, 'Gets Override Point', awardTrivia, true);
    triviaPlay.hidden = false;
    finishTriviaButton.hidden = false;
    showTriviaQuestion();
  }

  function showTriviaQuestion() {
    if (triviaIndex >= triviaDeck.length) {
      showTriviaSummary();
      return;
    }

    const item = triviaDeck[triviaIndex];
    if (!item) {
      showTriviaSummary();
      return;
    }
    markTriviaSeen(item);
    const category = triviaCategories.find(entry => entry.id === item.category);
    const difficultyLabel = activeTriviaDifficulty.charAt(0).toUpperCase() + activeTriviaDifficulty.slice(1);
    triviaCategoryLabel.textContent = category ? `${category.label} · ${difficultyLabel}` : `Trivia · ${difficultyLabel}`;
    const judgeNote = getCarJudgeNote();
    triviaHandoff.textContent = `${getTurnPlayerName(triviaIndex)} answers this one.${judgeNote ? ` ${judgeNote}` : ''}`;
    triviaQuestion.textContent = item.question;
    triviaAnswer.textContent = item.answer;
    triviaAnswer.dataset.answer = item.answer;
    triviaAnswer.hidden = true;
    renderTriviaChoices(item);
    triviaQuestionAwarded = false;
    renderAwardButtons(triviaAwardButtons, 'Gets Override Point', awardTrivia, true);
  }

  function awardTrivia(playerId) {
    if (triviaQuestionAwarded) return;
    triviaQuestionAwarded = true;
    triviaScore[playerId] = (triviaScore[playerId] || 0) + 1;
    renderScoreboard(triviaScoreboard, triviaScore);
    triviaAnswer.hidden = false;
    renderAwardButtons(triviaAwardButtons, 'Got It', awardTrivia, true);
  }

  function showTriviaSummary() {
    showSection('summary');
    const leaders = getWinningPlayers(triviaScore);
    const winner = formatWinner(leaders, leader => `${leader.name} wins Trivia Run`, 'Trivia ends in a tie');
    const scoreText = players.map(player => `${player.name}: ${triviaScore[player.id] || 0}`).join(', ');
    const playedCount = triviaPlay.hidden ? 0 : Math.min(triviaIndex + 1, triviaDeck.length);
    summaryText.textContent = leaders.length
      ? `${winner}. ${scoreText}.`
      : `No trivia points were awarded yet. ${scoreText}.`;
    summaryList.innerHTML = '';
    triviaDeck.slice(0, playedCount).forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.question} Answer: ${item.answer}`;
      summaryList.appendChild(li);
    });
  }

  const dadJokesFallback = [
    'I\u2019m afraid for the calendar. Its days are numbered.',
    'Why did the scarecrow win an award? He was outstanding in his field.',
    'I only know 25 letters of the alphabet. I don\u2019t know y.',
    'What do you call a fake noodle? An impasta.',
    'Why don\u2019t eggs tell jokes? They\u2019d crack each other up.',
    'I used to hate facial hair, but then it grew on me.',
    'What do you call cheese that isn\u2019t yours? Nacho cheese.',
    'Why did the bicycle fall over? It was two tired.',
  ];

  const momJokesFallback = [
    'Why did the cookie go to the doctor? Because it was feeling crumby.',
    'What do you call a bear with no teeth? A gummy bear.',
    'Why did the banana go to the party? Because it was a-peeling.',
    'What did the ocean say to the beach? Nothing, it just waved.',
    'Why don\u2019t scientists trust atoms? Because they make up everything.',
    'What do you call a sleeping dinosaur? A dino-snore.',
    'Why did the math book look sad? It had too many problems.',
    'What do you call a pile of cats? A meow-ntain.',
  ];

  const brotherJokesFallback = [
    'My brother thinks cleaning means moving things from the floor to the bed.',
    'My brother has two moods: hungry and somehow still hungry.',
    'My brother can hear a chip bag open from three rooms away.',
    'Brothers don\u2019t grow up. They just get taller and louder.',
  ];

  const sisterJokesFallback = [
    'Brothers are why sisters develop patience, sarcasm, and strong door locks.',
    'My brother\u2019s laundry pile has its own climate system.',
    'My brother is brave until there\u2019s a spider.',
    'Having a brother is like owning a dog that talks back.',
  ];

  const dadJokesPack = Array.isArray(window.RTA_DAD_JOKES) && window.RTA_DAD_JOKES.length
    ? window.RTA_DAD_JOKES
    : dadJokesFallback;
  const momJokesPack = Array.isArray(window.RTA_MOM_JOKES) && window.RTA_MOM_JOKES.length
    ? window.RTA_MOM_JOKES
    : momJokesFallback;
  const brotherJokesPack = Array.isArray(window.RTA_BROTHER_JOKES) && window.RTA_BROTHER_JOKES.length
    ? window.RTA_BROTHER_JOKES
    : brotherJokesFallback;
  const sisterJokesPack = Array.isArray(window.RTA_SISTER_JOKES) && window.RTA_SISTER_JOKES.length
    ? window.RTA_SISTER_JOKES
    : sisterJokesFallback;

  function startJokeVote() {
    resetGame();
    jokeAwards = { dad: 0, mom: 0, brother: 0, sister: 0 };
    jokeRound = 1;
    jokeDecks = {
      dad: shuffle(dadJokesPack.slice()),
      mom: shuffle(momJokesPack.slice()),
      brother: shuffle(brotherJokesPack.slice()),
      sister: shuffle(sisterJokesPack.slice()),
    };
    renderJokeVote();
    showSection('jokes');
  }

  function getJokeForRound(deck) {
    if (!deck || !deck.length) return '';
    return deck[(jokeRound - 1) % deck.length];
  }

  function renderJokeVote() {
    jokeRoundElement.textContent = String(jokeRound);
    jokeDad.textContent = getJokeForRound(jokeDecks.dad);
    jokeMom.textContent = getJokeForRound(jokeDecks.mom);
    jokeBrother.textContent = getJokeForRound(jokeDecks.brother);
    jokeSister.textContent = getJokeForRound(jokeDecks.sister);
    jokeAward.textContent = `Laughs so far: Dad ${jokeAwards.dad}, Mom ${jokeAwards.mom}, Brother ${jokeAwards.brother}, Sister ${jokeAwards.sister}.`;
  }

  function nextJokeRound() {
    jokeRound++;
    renderJokeVote();
  }

  function showJokeSummary() {
    showSection('summary');
    summaryText.textContent = `It\u2019s a tie! Dad, Mom, Brother, and Sister jokes are all equally great.`;
    summaryList.innerHTML = '';
    [
      `Dad laughs: ${jokeAwards.dad}`,
      `Mom laughs: ${jokeAwards.mom}`,
      `Brother laughs: ${jokeAwards.brother}`,
      `Sister laughs: ${jokeAwards.sister}`,
      'Official ruling: always a tie \u2014 everybody wins the laugh.',
    ].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      summaryList.appendChild(li);
    });
  }

  const punTemplates = [
    word => `When in doubt, just add more ${word}.`,
    word => `I\u2019m ${word}-believably good at road trips.`,
    word => `That idea is ${word}-tastic!`,
    word => `Let\u2019s taco \u2019bout ${word}.`,
    word => `You had me at ${word}.`,
    word => `Can you ${word}-lieve how fun this is?`,
    word => `This trip is ${word}-solutely the best.`,
    word => `Stay ${word}-some out there, everyone.`,
    word => `We\u2019re totally ${word}-ward bound!`,
    word => `Don\u2019t ${word}-er around, let\u2019s roll.`,
    word => `I\u2019m a big ${word}-thusiast, honestly.`,
    word => `Keep calm and ${word} on.`,
    word => `That\u2019s how I ${word} and roll.`,
    word => `Sorry, I\u2019m too ${word} to function.`,
    word => `Every road leads back to ${word}.`,
    word => `Wherever you go, there you ${word}.`,
    word => `I\u2019m ${word}-mitted to this bit.`,
    word => `Let\u2019s ${word} and roll, baby.`,
    word => `That\u2019s a ${word}-derful idea.`,
    word => `I\u2019ve got a ${word}-derlust for adventure.`,
    word => `Hold on to your ${word}, it\u2019s gonna be wild.`,
    word => `You\u2019re ${word}-ing me crazy, in a good way.`,
    word => `Resistance is ${word}-tile.`,
    word => `It\u2019s all fun and ${word} until someone naps.`,
    word => `Frankly, my dear, I don\u2019t give a ${word}.`,
    word => `${word}? In this economy?`,
    word => `One does not simply ${word} into a road trip.`,
    word => `May the ${word} be with you.`,
    word => `Life is short, eat the ${word}.`,
    word => `Born to ${word}, forced to navigate.`,
    word => `I came, I saw, I ${word}-quered.`,
  ];

  function startPunGenerator() {
    resetGame();
    punInput.value = '';
    punOutput.innerHTML = '';
    punMoreButton.hidden = true;
    showSection('puns');
    punInput.focus();
  }

  function renderPuns() {
    const raw = (punInput.value || '').trim();
    const word = raw || 'road trip';
    const safeWord = word.replace(/\s+/g, ' ');
    const picks = shuffle(punTemplates.slice()).slice(0, 5);
    punOutput.innerHTML = '';
    picks.forEach(template => {
      const li = document.createElement('li');
      li.textContent = template(safeWord);
      punOutput.appendChild(li);
    });
    punMoreButton.hidden = false;
  }

  const MENTALIST_SYMBOLS = ['\u2605', '\u2663', '\u263c', '\u273f', '\u263e', '\u26a1', '\u2618', '\u266b', '\u272a', '\u2744', '\u263b', '\u2693', '\u271a', '\u2726'];
  const MENTALIST_STATUS = [
    'Scanning brain waves...',
    'Checking snack energy...',
    'Aligning the crystal ball...',
    'Reading your road-trip vibes...',
    'Counting invisible sheep...',
    'Tuning the mind antenna...',
  ];
  const MENTALIST_CARDS = ['A\u2660', '7\u2665', 'Q\u2663', '9\u2666', 'K\u2660', '3\u2665', 'J\u2663', '5\u2666', '10\u2660', '2\u2665', '8\u2663', '6\u2666', '4\u2660', 'Q\u2665'];
  const MENTALIST_PREDICTIONS = {
    Moose: 'My sealed envelope says: MOOSE. I even drew it wearing tiny sunglasses. Classic road-trip moose energy.',
    Pizza: 'My sealed envelope says: PIZZA. My crystal ball is 90 percent mozzarella, so we are basically related.',
    UFO: 'My sealed envelope says: UFO. I predicted you would think big. Beam me up a snack while you are out there.',
    'Giant Peanut': 'My sealed envelope says: GIANT PEANUT. Bold. Legendary. I wrote it down before you were even hungry.',
    Bigfoot: 'My sealed envelope says: BIGFOOT. Blurry, mysterious, and somehow always nearby. Just like my predictions.',
    Taco: 'My sealed envelope says: TACO. The universe folds toward deliciousness, and so did your brain.',
  };

  function mentalistShow(title, lines, actions, extraNode) {
    if (!mentalistStage) return;
    mentalistStage.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = title;
    mentalistStage.appendChild(heading);
    (Array.isArray(lines) ? lines : [lines]).forEach(line => {
      if (!line) return;
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      mentalistStage.appendChild(paragraph);
    });
    if (extraNode) mentalistStage.appendChild(extraNode);
    const wrap = document.createElement('div');
    wrap.className = 'adventure-actions';
    (actions || []).forEach(action => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = action.primary ? 'primary-button' : 'secondary-button';
      button.textContent = action.label;
      button.addEventListener('click', action.onClick);
      wrap.appendChild(button);
    });
    mentalistStage.appendChild(wrap);
  }

  function mentalistThinking(onDone) {
    const message = MENTALIST_STATUS[Math.floor(Math.random() * MENTALIST_STATUS.length)];
    mentalistShow(message, ['Hold very still and think hard...'], []);
    window.setTimeout(onDone, 1100);
  }

  function startMentalist() {
    resetGame();
    showSection('mentalist');
    mentalistMenu();
  }

  function mentalistMenu() {
    mentalistShow('Road Trip Mentalist', ['Pick a mind trick. Remember: it is magic-style fun, not real mind reading.'], [
      { label: 'Symbol Mind Reader', primary: true, onClick: mentalistSymbolStart },
      { label: 'Birthday Mind Reader', onClick: mentalistBirthdayStart },
      { label: 'Missing Card Trick', onClick: mentalistMissingStart },
      { label: 'Magic Number 1089', onClick: mentalistMagic1089Start },
      { label: 'Gray Elephant Trick', onClick: mentalistElephantStart },
      { label: 'Always Lands on 5', onClick: mentalistForceFiveStart },
      { label: 'Crystal Ball Number', onClick: mentalistCrystalNumberStart },
      { label: 'Lucky 37', onClick: mentalistLucky37Start },
      { label: 'Quick Seven', onClick: mentalistQuickSevenStart },
      { label: 'Shape in a Shape', onClick: mentalistShapeStart },
      { label: 'Red Hammer Guess', onClick: mentalistRedHammerStart },
      { label: 'Road Trip Prediction', onClick: mentalistPredictionStart },
    ]);
  }

  function mentalistRevealValue(title, lines, value, restart) {
    const big = document.createElement('p');
    big.className = 'mentalist-reveal';
    big.textContent = value;
    mentalistShow(title, lines, [
      { label: 'Do It Again', primary: true, onClick: restart || mentalistMenu },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ], big);
  }

  function mentalistGuessConfirm(options) {
    const node = document.createElement('p');
    node.className = options.isBig ? 'mentalist-reveal' : 'mentalist-guess';
    node.textContent = options.guess;
    mentalistShow(options.title, options.setup || ['I am locking in my guess...'], [
      {
        label: 'Yes! How?!',
        primary: true,
        onClick: () => mentalistShow(options.title, options.hitLines, [
          { label: 'Do It Again', primary: true, onClick: options.restart },
          { label: 'Back to Tricks', onClick: mentalistMenu },
        ]),
      },
      {
        label: 'Nope, missed it',
        onClick: () => mentalistShow(options.title, options.missLines, [
          { label: 'Try Again', primary: true, onClick: options.restart },
          { label: 'Back to Tricks', onClick: mentalistMenu },
        ]),
      },
    ], node);
  }

  function mentalistSymbolStart() {
    mentalistShow('Symbol Mind Reader', [
      'Think of any two-digit number, like 10 to 99.',
      'Add its two digits together.',
      'Subtract that total from your original number.',
      'Remember the answer.',
    ], [
      { label: 'I have my answer', primary: true, onClick: () => mentalistThinking(mentalistSymbolChart) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistSymbolChart() {
    const secret = MENTALIST_SYMBOLS[Math.floor(Math.random() * MENTALIST_SYMBOLS.length)];
    const others = MENTALIST_SYMBOLS.filter(symbol => symbol !== secret);
    const grid = document.createElement('div');
    grid.className = 'mentalist-grid';
    for (let number = 1; number <= 99; number++) {
      const symbol = number % 9 === 0 ? secret : others[Math.floor(Math.random() * others.length)];
      const cell = document.createElement('span');
      cell.className = 'mentalist-cell';
      cell.textContent = `${number} ${symbol}`;
      grid.appendChild(cell);
    }
    mentalistShow('Find Your Number', ['Find your answer in the chart and stare at the symbol next to it.'], [
      { label: 'Read my mind', primary: true, onClick: () => mentalistThinking(() => mentalistSymbolReveal(secret)) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ], grid);
  }

  function mentalistSymbolReveal(secret) {
    const big = document.createElement('p');
    big.className = 'mentalist-reveal';
    big.textContent = secret;
    mentalistShow('Your Symbol Is...', ['I see it clearly in your mind. It is this one:'], [
      { label: 'Do It Again', primary: true, onClick: mentalistSymbolStart },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ], big);
  }

  function mentalistBirthdayStart() {
    mentalistShow('Birthday Mind Reader', [
      'Think of the day of the month you were born, from 1 to 31.',
      'I will show five cards. Just tell me if your day is on each one.',
    ], [
      { label: 'Start', primary: true, onClick: () => mentalistBirthdayCard(0, 0) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistBirthdayCard(index, total) {
    const values = [1, 2, 4, 8, 16];
    if (index >= values.length) {
      mentalistThinking(() => mentalistBirthdayReveal(total));
      return;
    }
    const value = values[index];
    const grid = document.createElement('div');
    grid.className = 'mentalist-grid';
    for (let number = 1; number <= 31; number++) {
      if (number & value) {
        const cell = document.createElement('span');
        cell.className = 'mentalist-cell';
        cell.textContent = String(number);
        grid.appendChild(cell);
      }
    }
    mentalistShow(`Card ${index + 1} of 5`, ['Is your birthday day somewhere on this card?'], [
      { label: 'Yes', primary: true, onClick: () => mentalistBirthdayCard(index + 1, total + value) },
      { label: 'No', onClick: () => mentalistBirthdayCard(index + 1, total) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ], grid);
  }

  function mentalistBirthdayReveal(total) {
    const valid = total >= 1 && total <= 31;
    const big = document.createElement('p');
    big.className = 'mentalist-reveal';
    big.textContent = valid ? String(total) : '???';
    mentalistShow('Your Birthday Day', [valid ? 'You were born on the...' : 'The brain waves got fuzzy. Try again and answer carefully.'], [
      { label: 'Do It Again', primary: true, onClick: mentalistBirthdayStart },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ], valid ? big : null);
  }

  function mentalistCardGrid(cards) {
    const grid = document.createElement('div');
    grid.className = 'mentalist-cards';
    cards.forEach(card => {
      const cell = document.createElement('span');
      cell.className = 'mentalist-card';
      cell.textContent = card;
      grid.appendChild(cell);
    });
    return grid;
  }

  function mentalistMissingStart() {
    const deck = shuffle(MENTALIST_CARDS.slice());
    const firstSet = deck.slice(0, 5);
    const secondSet = deck.slice(5, 10);
    mentalistShow('Missing Card Trick', [
      'Look at these five cards and silently pick one.',
      'Stare at it. Burn it into your memory. Do not say it out loud.',
    ], [
      { label: 'Make it vanish', primary: true, onClick: () => mentalistThinking(() => mentalistMissingReveal(secondSet)) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ], mentalistCardGrid(firstSet));
  }

  function mentalistMissingReveal(secondSet) {
    mentalistShow('Your Card Is Gone!', [
      'I reached into your mind and pulled your card right out of the deck.',
      'See? Your card is not here anymore. Spooky.',
    ], [
      { label: 'Do It Again', primary: true, onClick: mentalistMissingStart },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ], mentalistCardGrid(secondSet));
  }

  function mentalistPredictionStart() {
    mentalistShow('Road Trip Prediction', ['I already sealed my prediction in an envelope. Now pick one:'], [
      { label: '\ud83e\udd8c Moose', primary: true, onClick: () => mentalistPredictionReveal('Moose') },
      { label: '\ud83c\udf55 Pizza', onClick: () => mentalistPredictionReveal('Pizza') },
      { label: '\ud83d\udef8 UFO', onClick: () => mentalistPredictionReveal('UFO') },
      { label: '\ud83e\udd5c Giant Peanut', onClick: () => mentalistPredictionReveal('Giant Peanut') },
      { label: '\ud83e\uddb6 Bigfoot', onClick: () => mentalistPredictionReveal('Bigfoot') },
      { label: '\ud83c\udf2e Taco', onClick: () => mentalistPredictionReveal('Taco') },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistPredictionReveal(choice) {
    mentalistThinking(() => {
      mentalistShow('My Prediction Said...', [MENTALIST_PREDICTIONS[choice] || 'I knew it all along.'], [
        { label: 'Do It Again', primary: true, onClick: mentalistPredictionStart },
        { label: 'Back to Tricks', onClick: mentalistMenu },
      ]);
    });
  }

  function mentalistMagic1089Start() {
    mentalistShow('Magic Number 1089', [
      'Think of a three-digit number whose first and last digits differ by at least 2, like 532.',
      'Reverse your number and subtract the smaller from the larger.',
      'Reverse that answer, then add those two numbers together.',
      'Remember your final total.',
    ], [
      { label: 'I have my total', primary: true, onClick: () => mentalistThinking(() => mentalistRevealValue('Magic Number 1089', ['It does not matter which number you started with...', 'the answer is ALWAYS the same. Behold:'], '1089', mentalistMagic1089Start)) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistForceFiveStart() {
    mentalistShow('Always Lands on 5', [
      'Think of any number.',
      'Double it.',
      'Add 10.',
      'Divide the answer by 2.',
      'Subtract the number you started with.',
      'Remember your answer.',
    ], [
      { label: 'Read my mind', primary: true, onClick: () => mentalistThinking(() => mentalistRevealValue('Always Lands on 5', ['Any number, any time, same ending.', 'Your answer is...'], '5', mentalistForceFiveStart)) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistElephantStart() {
    mentalistShow('Gray Elephant Trick', [
      'Think of a number from 1 to 10.',
      'Multiply it by 9.',
      'If you get two digits, add them together.',
      'Subtract 5.',
      'Turn it into a letter: 1 is A, 2 is B, 3 is C, 4 is D, and so on.',
      'Think of a country that starts with your letter.',
      'Take the last letter of that country and think of an animal that starts with it.',
      'Now picture that animal\u2019s color.',
    ], [
      { label: 'Reveal my thought', primary: true, onClick: () => mentalistThinking(mentalistElephantReveal) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistElephantReveal() {
    mentalistShow('I See It...', [
      'You are picturing a gray elephant from Denmark!',
      'There are not many elephants in Denmark, so keep yours warm.',
    ], [
      { label: 'Do It Again', primary: true, onClick: mentalistElephantStart },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistRedHammerStart() {
    mentalistShow('Red Hammer Guess', [
      'Quick, do not overthink it!',
      'Picture a simple hand tool.',
      'Now picture a bright, bold color.',
      'Hold both clearly in your mind.',
    ], [
      { label: 'Guess my thought', primary: true, onClick: () => mentalistThinking(mentalistRedHammerReveal) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistRedHammerReveal() {
    mentalistGuessConfirm({
      title: 'Red Hammer Guess',
      guess: 'a red hammer',
      setup: ['A simple tool and a bold color... most minds smash them into one picture. I see...'],
      hitLines: ['A red hammer! Called it. Brains love that exact combo.', 'You are gloriously normal, and I respect it completely.'],
      missLines: ['No red hammer? You magnificent weirdo.', 'A green wrench? A blue saw? Whatever it was, you beat me this round.'],
      restart: mentalistRedHammerStart,
    });
  }

  function mentalistCrystalNumberStart() {
    mentalistShow('Crystal Ball Number', [
      'Think of any number.',
      'Add 5.',
      'Double the answer.',
      'Subtract 4.',
      'Divide by 2.',
      'Subtract the number you started with.',
      'Remember your answer.',
    ], [
      { label: 'Gaze into the ball', primary: true, onClick: () => mentalistThinking(() => mentalistRevealValue('Crystal Ball Number', ['The mist swirls in my crystal ball...', 'and a single number glows:'], '3', mentalistCrystalNumberStart)) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistLucky37Start() {
    mentalistShow('Lucky 37', [
      'Think of a two-digit number between 1 and 50.',
      'Make both digits odd.',
      'The two digits must be different from each other.',
      'Lock it in your mind.',
    ], [
      { label: 'Read my mind', primary: true, onClick: () => mentalistThinking(() => mentalistGuessConfirm({
        title: 'Lucky 37',
        guess: '37',
        isBig: true,
        setup: ['Two odd digits, both different... the brain almost always sprints to one spot. I see...'],
        hitLines: ['37! The number people choose when they try to be random but cannot.', 'You walked right into my trap. Beautifully done.'],
        missLines: ['Ooh, you dodged it! Most folks land on 37 (or 35).', 'Your brain refused to be ordinary. I tip my top hat to you.'],
        restart: mentalistLucky37Start,
      })) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistQuickSevenStart() {
    mentalistShow('Quick Seven', [
      'Quick, do not think too hard!',
      'Pick a number between 1 and 10.',
      'Picture it glowing in your mind.',
    ], [
      { label: 'Guess my number', primary: true, onClick: () => mentalistThinking(() => mentalistGuessConfirm({
        title: 'Quick Seven',
        guess: '7',
        isBig: true,
        setup: ['You picked fast, so I read fast. The number burning in your mind is...'],
        hitLines: ['Seven! I knew it. It is the number almost everyone grabs when they hurry.', 'Your brain is wonderfully predictable. I mean that as a compliment.'],
        missLines: ['Whoa, a true original! Most people blurt out 7 without thinking.', 'You broke the pattern. Are you sure you are not the mentalist here?'],
        restart: mentalistQuickSevenStart,
      })) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistShapeStart() {
    mentalistShow('Shape in a Shape', [
      'Picture one simple shape.',
      'Now picture a different simple shape inside the first one.',
      'Hold the whole picture in your mind.',
    ], [
      { label: 'Reveal my shapes', primary: true, onClick: () => mentalistThinking(mentalistShapeReveal) },
      { label: 'Back to Tricks', onClick: mentalistMenu },
    ]);
  }

  function mentalistShapeReveal() {
    mentalistGuessConfirm({
      title: 'Shape in a Shape',
      guess: 'a triangle inside a circle',
      setup: ['One shape hugging another... the mind has a clear favorite. I see...'],
      hitLines: ['A triangle inside a circle! The all-time most-picked combo.', 'Your imagination runs on the house special.'],
      missLines: ['Not the classic triangle-in-a-circle? Bold artist!', 'You colored outside the lines, and honestly, I love that for you.'],
      restart: mentalistShapeStart,
    });
  }

  function renderEmojiGame() {
    emojiIntro.textContent = `Copy the emoji face, snap an attempt, then vote for the closest match. Round ${emojiIndex + 1}/${getEmojiRoundLimit()}.`;
    emojiTarget.textContent = emojiPrompts[emojiIndex % emojiPrompts.length];
    renderScoreboard(emojiScoreboard, emojiScore);
    renderAwardButtons(emojiAwardButtons, 'Wins Face', awardEmojiFace, emojiFaceAwarded);
  }

  function startEmojiGame() {
    resetGame();
    stopEmojiCamera();
    emojiIndex = 0;
    emojiScore = createScoreMap();
    emojiFaceAwarded = false;
    emojiCanvas.hidden = true;
    emojiVideo.hidden = true;
    captureEmojiButton.disabled = true;
    emojiCameraMessage.textContent = 'Start the camera when everyone is ready, or just act the face out and vote live.';
    renderEmojiGame();
    showSection('emoji');
  }

  async function startEmojiCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      emojiCameraMessage.textContent = 'Camera is not available in this browser. You can still play by posing and voting without photos.';
      return;
    }

    try {
      emojiStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      emojiVideo.srcObject = emojiStream;
      emojiVideo.hidden = false;
      emojiCanvas.hidden = true;
      captureEmojiButton.disabled = false;
      emojiCameraMessage.textContent = 'Match the emoji, then snap the face.';
    } catch (error) {
      emojiCameraMessage.textContent = 'Camera permission was not granted. You can still play by posing and voting without photos.';
    }
  }

  function stopEmojiCamera() {
    if (!emojiStream) return;
    emojiStream.getTracks().forEach(track => track.stop());
    emojiStream = null;
    if (emojiVideo) emojiVideo.srcObject = null;
  }

  function captureEmojiFace() {
    const width = emojiVideo.videoWidth || 640;
    const height = emojiVideo.videoHeight || 480;
    emojiCanvas.width = width;
    emojiCanvas.height = height;
    const context = emojiCanvas.getContext('2d');
    context.drawImage(emojiVideo, 0, 0, width, height);
    emojiCanvas.hidden = false;
    emojiVideo.hidden = true;
    emojiCameraMessage.textContent = 'Vote for the closest emoji face, or snap again.';
  }

  function awardEmojiFace(playerId) {
    if (emojiFaceAwarded) return;
    emojiFaceAwarded = true;
    emojiScore[playerId] = (emojiScore[playerId] || 0) + 1;
    renderEmojiGame();
  }

  function nextEmojiPrompt() {
    if (emojiIndex + 1 >= getEmojiRoundLimit()) {
      showEmojiSummary();
      return;
    }
    emojiIndex++;
    emojiFaceAwarded = false;
    emojiCanvas.hidden = true;
    if (emojiStream) {
      emojiVideo.hidden = false;
      emojiCameraMessage.textContent = 'New emoji. Match it, then snap the face.';
    } else {
      emojiCameraMessage.textContent = 'New emoji. Start the camera or play by posing.';
    }
    renderEmojiGame();
  }

  function showEmojiSummary() {
    stopEmojiCamera();
    showSection('summary');
    const leaders = getWinningPlayers(emojiScore);
    const winner = formatWinner(leaders, leader => `${leader.name} wins Emoji Face-Off`, 'Emoji Face-Off ends in a tie');
    const scoreText = players.map(player => `${player.name}: ${emojiScore[player.id] || 0}`).join(', ');
    summaryText.textContent = leaders.length
      ? `${winner}. ${scoreText}.`
      : `No emoji faces were awarded yet. ${scoreText}.`;
    summaryList.innerHTML = '';
    [
      'Best face prize: winner chooses a car karaoke song.',
      'Privacy note: photos were only shown on this device and were not saved by the app.',
    ].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      summaryList.appendChild(li);
    });
  }

  function formatTravelTime(hours) {
    const totalMinutes = Math.round(hours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (wholeHours <= 0) return `${minutes} min`;
    if (minutes === 0) return `${wholeHours} hr`;
    return `${wholeHours} hr ${minutes} min`;
  }

  function startTripCalculator() {
    resetGame();
    calculateTripTime();
    showSection('calculator');
  }

  function calculateTripTime() {
    const miles = Number.parseFloat(calcMiles.value);
    const speedA = Number.parseFloat(calcSpeedA.value);
    const speedB = Number.parseFloat(calcSpeedB.value);
    if (!Number.isFinite(miles) || miles <= 0 || !Number.isFinite(speedA) || speedA <= 0 || !Number.isFinite(speedB) || speedB <= 0) {
      calculatorResult.textContent = 'Enter miles left and two speeds greater than zero.';
      return;
    }

    const timeA = miles / speedA;
    const timeB = miles / speedB;
    const differenceMinutes = Math.abs(Math.round((timeA - timeB) * 60));
    const fasterSpeed = speedA > speedB ? speedA : speedB;
    const slowerSpeed = speedA > speedB ? speedB : speedA;
    const lesson = differenceMinutes <= 5
      ? 'Lesson: on this distance, the faster speed barely changes arrival time.'
      : 'Lesson: compare the time saved with safety, speed limits, traffic, and fuel use.';

    calculatorResult.textContent = [
      `${miles} miles at ${speedA} mph: ${formatTravelTime(timeA)}.`,
      `${miles} miles at ${speedB} mph: ${formatTravelTime(timeB)}.`,
      `${fasterSpeed} mph is about ${differenceMinutes} minute${differenceMinutes === 1 ? '' : 's'} faster than ${slowerSpeed} mph.`,
      lesson,
    ].join('\n');
  }

  function swapCalculatorSpeeds() {
    const oldA = calcSpeedA.value;
    calcSpeedA.value = calcSpeedB.value;
    calcSpeedB.value = oldA;
    calculateTripTime();
  }

  function renderPiEntries() {
    piEntryGrid.innerHTML = '';
    players.forEach(player => {
      const label = document.createElement('label');
      label.className = 'team-name-field';
      label.setAttribute('for', `pi-${player.id}`);

      const span = document.createElement('span');
      span.textContent = player.name;

      const input = document.createElement('input');
      input.id = `pi-${player.id}`;
      input.type = 'number';
      input.min = '0';
      input.max = '1000';
      input.inputMode = 'numeric';
      input.placeholder = 'Digits';
      input.value = piScore[player.id] || 0;

      label.appendChild(span);
      label.appendChild(input);
      piEntryGrid.appendChild(label);
    });
  }

  function startPiChallenge() {
    resetGame();
    piScore = createScoreMap();
    piIntro.textContent = tripSettings.gameLength === 'short'
      ? 'Quick round: each player gets one attempt. Enter correct digits after 3.14.'
      : 'Long round: each player gets two attempts. Enter each player\'s best correct digit count after 3.14.';
    renderScoreboard(piScoreboard, piScore);
    renderPiEntries();
    showSection('pi');
  }

  function savePiScores() {
    players.forEach(player => {
      const input = document.getElementById(`pi-${player.id}`);
      const value = input ? Number.parseInt(input.value, 10) : 0;
      piScore[player.id] = Number.isFinite(value) && value > 0 ? value : 0;
    });
    renderScoreboard(piScoreboard, piScore);
  }

  function showPiSummary() {
    savePiScores();
    showSection('summary');
    const leaders = getWinningPlayers(piScore);
    const winner = formatWinner(leaders, leader => `${leader.name} wins Pi Digits`, 'Pi Challenge ends in a tie');
    const scoreText = players.map(player => `${player.name}: ${piScore[player.id] || 0}`).join(', ');
    summaryText.textContent = leaders.length
      ? `${winner}. ${scoreText}.`
      : `No pi digits were entered yet. ${scoreText}.`;
    summaryList.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = 'Prize idea: winner chooses a snack stop or the next car karaoke song.';
    summaryList.appendChild(li);
  }

  function normalizePongSettings(settings) {
    if (pongData.normalizeSettings) return pongData.normalizeSettings(settings);
    const merged = Object.assign({}, defaultPongSettings, settings || {});
    merged.opponentMode = merged.opponentMode === 'local' ? 'local' : 'computer';
    merged.difficulty = ['easy', 'normal', 'hard', 'deathmatch'].includes(merged.difficulty) ? merged.difficulty : 'normal';
    return merged;
  }

  function getPongDifficultyConfig() {
    if (pongData.getDifficultyConfig) return pongData.getDifficultyConfig(pongSettings.difficulty);
    return { targetScore: 7, paddleHeight: 92, humanSpeed: 7, aiSpeed: 5.6, aiError: 16, reaction: 0.08, ballSpeed: 4.5, aiPerfect: false };
  }

  function renderPongSettings() {
    pongSettings = normalizePongSettings(pongSettings);
    setStoredJson('rtaPongSettings', pongSettings);
    if (pongOpponentButtons) {
      Array.from(pongOpponentButtons.querySelectorAll('button[data-pong-opponent]')).forEach(button => {
        const active = button.dataset.pongOpponent === pongSettings.opponentMode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }
    if (pongDifficultyButtons) {
      Array.from(pongDifficultyButtons.querySelectorAll('button[data-pong-difficulty]')).forEach(button => {
        const active = button.dataset.pongDifficulty === pongSettings.difficulty;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }
    if (pongStatus && !pongRunning) {
      pongStatus.textContent = pongSettings.opponentMode === 'computer'
        ? `Choose your setup, then start the round. You will control the left paddle against ${pongSettings.difficulty} AI.`
        : 'Choose your setup, then start the round. Player 1 controls the left paddle and Player 2 controls the right paddle.';
    }
  }

  function createPongState() {
    const config = getPongDifficultyConfig();
    if (window.RTA_PONG_ART && window.RTA_PONG_ART.createGameState) {
      return window.RTA_PONG_ART.createGameState(pongCanvas, config);
    }
    const width = pongCanvas.width;
    const height = pongCanvas.height;
    return {
      width,
      height,
      paddleWidth: 14,
      paddleHeight: config.paddleHeight,
      leftPaddle: {
        y: height / 2 - config.paddleHeight / 2,
        score: 0,
        flashFrames: 0,
      },
      rightPaddle: {
        y: height / 2 - config.paddleHeight / 2,
        score: 0,
        flashFrames: 0,
      },
      ball: {
        x: width / 2,
        y: height / 2,
        vx: config.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
        vy: (config.ballSpeed * 0.55) * (Math.random() > 0.5 ? 1 : -1),
        size: 12,
      },
      ballTrail: [],
      shakeFrames: 0,
      targetScore: config.targetScore,
    };
  }

  function resetPongBall(direction = Math.random() > 0.5 ? 1 : -1) {
    if (!pongState) return;
    const config = getPongDifficultyConfig();
    if (window.RTA_PONG_ART && window.RTA_PONG_ART.resetBall) {
      window.RTA_PONG_ART.resetBall(pongState, config, direction);
      return;
    }
    pongState.ball.x = pongState.width / 2;
    pongState.ball.y = pongState.height / 2;
    pongState.ball.vx = config.ballSpeed * direction;
    pongState.ball.vy = (config.ballSpeed * 0.55) * (Math.random() > 0.5 ? 1 : -1);
  }

  function drawPong() {
    if (!pongCanvas || !pongState) return;
    if (window.RTA_PONG_ART && window.RTA_PONG_ART.draw) {
      window.RTA_PONG_ART.draw(pongState);
      if (pongDebugEnabled) drawPongDebug();
      return;
    }
    const ctx = pongCanvas.getContext('2d');
    ctx.clearRect(0, 0, pongState.width, pongState.height);
    ctx.fillStyle = '#08284a';
    ctx.fillRect(0, 0, pongState.width, pongState.height);
    ctx.fillStyle = '#f58220';
    ctx.fillRect(22, pongState.leftPaddle.y, pongState.paddleWidth, pongState.paddleHeight);
    ctx.fillStyle = '#7c4dff';
    ctx.fillRect(pongState.width - 36, pongState.rightPaddle.y, pongState.paddleWidth, pongState.paddleHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      pongState.ball.x - pongState.ball.size / 2,
      pongState.ball.y - pongState.ball.size / 2,
      pongState.ball.size,
      pongState.ball.size
    );
    if (pongDebugEnabled) drawPongDebug();
  }

  // Debug / "computer mode" overlay: shows paddle hitboxes, the ball collider,
  // the collision planes used by tickPong, the live canvas coordinates, and the
  // last touch/drag point — so hitboxes and coordinates can be verified without
  // guessing (especially handy for checking pointer mapping in full screen).
  function drawPongDebug() {
    if (!pongState) return;
    const ctx = pongState.ctx || pongCanvas.getContext('2d');
    const w = pongState.width;
    const h = pongState.height;
    const pw = pongState.paddleWidth;
    const ph = pongState.paddleHeight;
    const r = pongState.ball.size / 2;

    ctx.save();

    // Paddle hitboxes (must match the collision maths in tickPong).
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#8cff66';
    ctx.strokeRect(22, pongState.leftPaddle.y, pw, ph);
    ctx.strokeRect(w - 36, pongState.rightPaddle.y, pw, ph);

    // Collision planes the ball is tested against.
    ctx.strokeStyle = 'rgba(255, 77, 77, 0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(36 + r, 0);
    ctx.lineTo(36 + r, h);
    ctx.moveTo(w - 36 - r, 0);
    ctx.lineTo(w - 36 - r, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball collider.
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(pongState.ball.x - r, pongState.ball.y - r, pongState.ball.size, pongState.ball.size);

    // Last pointer position in canvas coordinates.
    if (pongPointerDebug) {
      ctx.fillStyle = '#ff4df0';
      ctx.beginPath();
      ctx.arc(pongPointerDebug.x, pongPointerDebug.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 77, 240, 0.5)';
      ctx.beginPath();
      ctx.moveTo(pongPointerDebug.x, 0);
      ctx.lineTo(pongPointerDebug.x, h);
      ctx.moveTo(0, pongPointerDebug.y);
      ctx.lineTo(w, pongPointerDebug.y);
      ctx.stroke();
    }

    const lines = [
      'DEBUG MODE  ( ` toggles )',
      `canvas ${w}x${h}  dpr=${pongState.dpr || 1}`,
      `ball x=${Math.round(pongState.ball.x)} y=${Math.round(pongState.ball.y)} vx=${pongState.ball.vx.toFixed(2)} vy=${pongState.ball.vy.toFixed(2)}`,
      `paddle L y=${Math.round(pongState.leftPaddle.y)}  R y=${Math.round(pongState.rightPaddle.y)}`,
      pongPointerDebug
        ? `pointer ${pongPointerDebug.side} x=${Math.round(pongPointerDebug.x)} y=${Math.round(pongPointerDebug.y)}`
        : 'pointer: (none)',
    ];

    ctx.fillStyle = 'rgba(6, 21, 36, 0.86)';
    ctx.fillRect(12, 12, 286, lines.length * 14 + 12);
    ctx.fillStyle = '#bdeff4';
    ctx.font = '800 11px monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    lines.forEach((line, index) => {
      ctx.fillStyle = index === 0 ? '#f7fbff' : '#bdeff4';
      ctx.fillText(line, 22, 20 + index * 14);
    });

    ctx.restore();
  }

  function updatePongDebugButton() {
    if (!pongDebugButton) return;
    pongDebugButton.textContent = pongDebugEnabled ? 'Debug: On' : 'Debug: Off';
    pongDebugButton.setAttribute('aria-pressed', pongDebugEnabled ? 'true' : 'false');
    pongDebugButton.classList.toggle('is-active', pongDebugEnabled);
  }

  function togglePongDebug() {
    pongDebugEnabled = !pongDebugEnabled;
    setStoredJson('rtaPongDebug', pongDebugEnabled);
    updatePongDebugButton();
    if (!pongDebugEnabled) pongPointerDebug = null;
    drawPong();
  }

  function updatePongScore() {
    if (!pongState) return;
    const leftName = players[0] ? players[0].name : 'P1';
    const rightName = pongSettings.opponentMode === 'computer'
      ? (pongSettings.difficulty === 'deathmatch' ? 'Death Match AI' : 'Computer')
      : (players[1] ? players[1].name : 'P2');
    const modeLabel = pongSettings.opponentMode === 'computer'
      ? `${pongSettings.difficulty} AI`
      : 'local match';
    if (pongScore) {
      pongScore.textContent = `${pongState.leftPaddle.score} : ${pongState.rightPaddle.score}`;
    }
    pongStatus.textContent = `${leftName} controls the left paddle, ${rightName} controls the right paddle. ${modeLabel}. First to ${pongState.targetScore} wins.`;
  }

  function movePongPaddleTo(side, clientY) {
    if (!pongState || !pongCanvas) return;
    const rect = pongCanvas.getBoundingClientRect();
    const yRatio = (clientY - rect.top) / rect.height;
    const centerY = Math.max(0, Math.min(1, yRatio)) * pongState.height;
    const nextY = centerY - pongState.paddleHeight / 2;
    const maxY = pongState.height - pongState.paddleHeight;
    if (side === 'left') {
      pongState.leftPaddle.y = Math.max(0, Math.min(maxY, nextY));
    } else {
      pongState.rightPaddle.y = Math.max(0, Math.min(maxY, nextY));
    }
    drawPong();
  }

  function getPongPointerSide(clientX) {
    const rect = pongCanvas.getBoundingClientRect();
    return clientX - rect.left < rect.width / 2 ? 'left' : 'right';
  }

  function handlePongPointer(event) {
    if (!pongCanvas) return;
    event.preventDefault();
    const side = pongPointerSides[event.pointerId] || getPongPointerSide(event.clientX);
    if (pongDebugEnabled) {
      const rect = pongCanvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        pongPointerDebug = {
          side,
          x: ((event.clientX - rect.left) / rect.width) * pongState.width,
          y: ((event.clientY - rect.top) / rect.height) * pongState.height,
        };
      }
    }
    if (pongSettings.opponentMode === 'computer' && side === 'right') return;
    pongPointerSides[event.pointerId] = side;
    movePongPaddleTo(side, event.clientY);
  }

  function releasePongPointer(event) {
    delete pongPointerSides[event.pointerId];
  }

  // Immersive ("full screen means full screen") helper. Uses the native
  // Fullscreen API where available (Android Chrome, desktop). iOS Safari does
  // not support the Fullscreen API for non-video elements, so we fall back to a
  // CSS class that fills the entire viewport edge to edge. We also attempt to
  // lock to landscape, which is a best-effort no-op on platforms that disallow
  // it (such as iOS).
  const PSEUDO_FULLSCREEN_CLASS = 'is-immersive';

  function nativeFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function isImmersive(el) {
    if (!el) return false;
    return nativeFullscreenElement() === el || el.classList.contains(PSEUDO_FULLSCREEN_CLASS);
  }

  async function lockLandscapeOrientation() {
    try {
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        await screen.orientation.lock('landscape');
      }
    } catch (error) {
      // Orientation lock is unsupported or blocked (e.g. iOS) — safe to ignore.
    }
  }

  function unlockOrientation() {
    try {
      if (screen.orientation && typeof screen.orientation.unlock === 'function') {
        screen.orientation.unlock();
      }
    } catch (error) {
      // Ignore — not all browsers expose unlock.
    }
  }

  async function enterImmersive(el) {
    if (!el) return;
    if (typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen();
    } else if (typeof el.webkitRequestFullscreen === 'function') {
      el.webkitRequestFullscreen();
    } else {
      // No Fullscreen API (notably iPhone Safari): fill the viewport with CSS.
      el.classList.add(PSEUDO_FULLSCREEN_CLASS);
      document.body.classList.add('immersive-lock');
    }
    await lockLandscapeOrientation();
  }

  async function exitImmersive(el) {
    unlockOrientation();
    if (nativeFullscreenElement()) {
      if (typeof document.exitFullscreen === 'function') {
        await document.exitFullscreen();
      } else if (typeof document.webkitExitFullscreen === 'function') {
        document.webkitExitFullscreen();
      }
      return;
    }
    if (el && el.classList.contains(PSEUDO_FULLSCREEN_CLASS)) {
      el.classList.remove(PSEUDO_FULLSCREEN_CLASS);
      document.body.classList.remove('immersive-lock');
    }
  }

  // Clears any CSS-based immersive state (used when navigating away from a game).
  function clearPseudoFullscreen() {
    document.querySelectorAll('.' + PSEUDO_FULLSCREEN_CLASS).forEach(el => {
      el.classList.remove(PSEUDO_FULLSCREEN_CLASS);
    });
    document.body.classList.remove('immersive-lock');
    unlockOrientation();
    if (hideSeekRotateOverlay) hideSeekRotateOverlay.hidden = true;
  }

  async function togglePongFullscreen() {
    const target = sections.pong || pongCanvas;
    try {
      if (!isImmersive(target)) {
        await enterImmersive(target);
      } else {
        await exitImmersive(target);
      }
    } catch (error) {
      pongStatus.textContent = 'Full screen is not available in this browser.';
    }
    updatePongFullscreenButton();
  }

  function updatePongFullscreenButton() {
    if (!pongFullscreenButton) return;
    pongFullscreenButton.textContent = isImmersive(sections.pong) ? 'Exit Full Screen' : 'Full Screen';
  }

  function movePongPaddles() {
    const config = getPongDifficultyConfig();
    const speed = config.humanSpeed;
    const maxY = pongState.height - pongState.paddleHeight;
    if (pongKeys.leftUp) pongState.leftPaddle.y -= speed;
    if (pongKeys.leftDown) pongState.leftPaddle.y += speed;
    if (pongSettings.opponentMode === 'local') {
      if (pongKeys.rightUp) pongState.rightPaddle.y -= speed;
      if (pongKeys.rightDown) pongState.rightPaddle.y += speed;
    } else {
      const targetY = predictPongInterceptY() - pongState.paddleHeight / 2;
      const delta = targetY - pongState.rightPaddle.y;
      if (config.aiPerfect) {
        pongState.rightPaddle.y = targetY;
      } else if (Math.abs(delta) > config.aiError) {
        pongState.rightPaddle.y += Math.sign(delta) * Math.min(config.aiSpeed, Math.abs(delta));
      } else {
        pongState.rightPaddle.y += Math.sign(delta) * Math.min(2.5, Math.abs(delta));
      }
    }

    pongState.leftPaddle.y = Math.max(0, Math.min(maxY, pongState.leftPaddle.y));
    pongState.rightPaddle.y = Math.max(0, Math.min(maxY, pongState.rightPaddle.y));
  }

  function predictPongInterceptY() {
    if (!pongState) return 0;
    if (pongState.ball.vx <= 0) return pongState.height / 2;
    const boundsMin = pongState.ball.size / 2;
    const boundsMax = pongState.height - pongState.ball.size / 2;
    const targetX = pongState.width - 36 - pongState.ball.size / 2;
    const timeToTarget = (targetX - pongState.ball.x) / pongState.ball.vx;
    if (!Number.isFinite(timeToTarget) || timeToTarget < 0) return pongState.ball.y;
    let predicted = pongState.ball.y + pongState.ball.vy * timeToTarget;
    while (predicted < boundsMin || predicted > boundsMax) {
      if (predicted < boundsMin) {
        predicted = boundsMin + (boundsMin - predicted);
      } else if (predicted > boundsMax) {
        predicted = boundsMax - (predicted - boundsMax);
      }
    }
    return predicted;
  }

  function tickPong() {
    if (!pongRunning || !pongState) return;
    movePongPaddles();
    pongState.ball.x += pongState.ball.vx;
    pongState.ball.y += pongState.ball.vy;

    if (pongState.ball.y <= pongState.ball.size / 2 || pongState.ball.y >= pongState.height - pongState.ball.size / 2) {
      pongState.ball.vy *= -1;
    }

    const leftHit = pongState.ball.vx < 0
      && pongState.ball.x <= 36 + pongState.ball.size / 2
      && pongState.ball.y >= pongState.leftPaddle.y
      && pongState.ball.y <= pongState.leftPaddle.y + pongState.paddleHeight;
    const rightHit = pongState.ball.vx > 0
      && pongState.ball.x >= pongState.width - 36 - pongState.ball.size / 2
      && pongState.ball.y >= pongState.rightPaddle.y
      && pongState.ball.y <= pongState.rightPaddle.y + pongState.paddleHeight;
    if (leftHit || rightHit) {
      const paddle = leftHit ? pongState.leftPaddle : pongState.rightPaddle;
      const paddleY = paddle.y;
      const offset = (pongState.ball.y - (paddleY + pongState.paddleHeight / 2)) / (pongState.paddleHeight / 2);
      pongState.ball.vx *= -1.06;
      pongState.ball.vy = offset * 5;
      paddle.flashFrames = 8;
      pongState.shakeFrames = 4;
    }

    if (pongState.ball.x < 0) {
      pongState.rightPaddle.score++;
      resetPongBall(-1);
      updatePongScore();
    } else if (pongState.ball.x > pongState.width) {
      pongState.leftPaddle.score++;
      resetPongBall(1);
      updatePongScore();
    }

    if (window.RTA_PONG_ART && window.RTA_PONG_ART.updateEffects) {
      window.RTA_PONG_ART.updateEffects(pongState);
    }

    if (pongState.leftPaddle.score >= pongState.targetScore || pongState.rightPaddle.score >= pongState.targetScore) {
      stopPong();
      const rightName = pongSettings.opponentMode === 'computer'
        ? (pongSettings.difficulty === 'deathmatch' ? 'Death Match AI' : 'Computer')
        : (players[1] ? players[1].name : 'Right player');
      const winner = pongState.leftPaddle.score > pongState.rightPaddle.score
        ? (players[0] ? players[0].name : 'Left player')
        : rightName;
      pongStatus.textContent = `${winner} wins Road Pong. Winner gets first pick in the next road-trip game.`;
      drawPong();
      return;
    }

    drawPong();
    pongAnimationFrame = window.requestAnimationFrame(tickPong);
  }

  function startPongRound() {
    if (!pongState) pongState = createPongState();
    if (pongRunning) return;
    pongRunning = true;
    pongStatus.textContent = pongSettings.opponentMode === 'computer'
      ? `Pong is live. You control the left paddle. ${pongSettings.difficulty === 'deathmatch' ? 'Death Match AI is locked in.' : 'Computer on ' + pongSettings.difficulty + ' mode.'}`
      : 'Pong is live. Player 1 controls the left paddle and Player 2 controls the right paddle.';
    tickPong();
  }

  function stopPong() {
    pongRunning = false;
    if (pongAnimationFrame) {
      window.cancelAnimationFrame(pongAnimationFrame);
      pongAnimationFrame = null;
    }
  }

  function stopGorillas() {
    gorillasRunning = false;
    if (gorillasComputerTimer) {
      window.clearTimeout(gorillasComputerTimer);
      gorillasComputerTimer = null;
    }
    if (gorillasAnimationFrame) {
      window.cancelAnimationFrame(gorillasAnimationFrame);
      gorillasAnimationFrame = null;
    }
  }

  function createGorillasState() {
    const width = gorillasCanvas.width;
    const height = gorillasCanvas.height;
    const buildings = [];
    const count = 7;
    const buildingWidth = width / count;
    const details = ['antenna', 'vent', 'water', 'hotel', 'neon', 'plain'];
    for (let i = 0; i < count; i++) {
      const buildingBase = height * (0.22 + Math.random() * 0.28);
      buildings.push({
        x: i * buildingWidth,
        width: buildingWidth - 8,
        height: buildingBase,
        roofY: height - buildingBase - 36,
        detail: details[i % details.length],
        litOffset: Math.floor(Math.random() * 3),
      });
    }
    return {
      width,
      height,
      buildings,
      craters: [],
      scoreLeft: 0,
      scoreRight: 0,
      projectile: null,
      winner: null,
      gravity: 860,
      wind: Math.round((Math.random() * 2 - 1) * 22),
      trail: [],
      lastTrail: [],
      shotHistory: [],
      lastImpact: null,
      lastDebugTrajectory: [],
      computerMemory: {
        angle: 45,
        power: 70,
        lastResult: '',
      },
      explosion: null,
      sparks: [],
    };
  }

  function normalizeGorillasSettings(settings = gorillasSettings) {
    const merged = Object.assign({ opponent: 'local', match: '3', difficulty: 'normal', debug: false }, settings || {});
    merged.opponent = merged.opponent === 'computer' ? 'computer' : 'local';
    merged.match = ['sudden', '3', '5'].includes(merged.match) ? merged.match : '3';
    merged.difficulty = ['easy', 'normal', 'hard'].includes(merged.difficulty) ? merged.difficulty : 'normal';
    merged.debug = Boolean(merged.debug);
    return merged;
  }

  function saveGorillasSettings() {
    gorillasSettings = normalizeGorillasSettings({
      opponent: gorillasOpponent ? gorillasOpponent.value : gorillasSettings.opponent,
      match: gorillasMatch ? gorillasMatch.value : gorillasSettings.match,
      difficulty: gorillasDifficulty ? gorillasDifficulty.value : gorillasSettings.difficulty,
      debug: gorillasSettings.debug,
    });
    setStoredJson('rtaGorillasSettings', gorillasSettings);
  }

  function populateGorillasSettings() {
    gorillasSettings = normalizeGorillasSettings(gorillasSettings);
    if (gorillasOpponent) gorillasOpponent.value = gorillasSettings.opponent;
    if (gorillasMatch) gorillasMatch.value = gorillasSettings.match;
    if (gorillasDifficulty) gorillasDifficulty.value = gorillasSettings.difficulty;
    if (gorillasDebugButton) {
      gorillasDebugButton.textContent = gorillasSettings.debug ? 'Debug: On' : 'Debug: Off';
      gorillasDebugButton.setAttribute('aria-pressed', String(gorillasSettings.debug));
    }
  }

  function getGorillasTargetScore() {
    if (gorillasSettings.match === 'sudden') return 1;
    return Number(gorillasSettings.match) || 3;
  }

  function normalizeGorillasInputs() {
    const angle = Math.max(10, Math.min(80, Number(gorillasAngle.value) || 45));
    const power = Math.max(20, Math.min(100, Number(gorillasPower.value) || 70));
    gorillasAngle.value = String(angle);
    gorillasPower.value = String(power);
    return { angle, power };
  }

  function renderGorillasScore() {
    if (!gorillasState) return;
    gorillasScore.textContent = `${gorillasState.scoreLeft} : ${gorillasState.scoreRight}`;
  }

  function getGorillasPlayerName(turnIndex) {
    const sideIndex = getGorillasSide(turnIndex) === 'left' ? 0 : 1;
    const player = players[sideIndex];
    return player ? player.name : `P${sideIndex + 1}`;
  }

  function getGorillasSide(turnIndex) {
    return turnIndex % 2 === 0 ? 'left' : 'right';
  }

  function isGorillasComputerTurn() {
    return gorillasSettings.opponent === 'computer' && getGorillasSide(gorillasTurn) === 'right';
  }

  function getGorillasWindLabel() {
    if (!gorillasState || gorillasState.wind === 0) return 'Calm wind';
    return `Wind pushes ${gorillasState.wind > 0 ? 'right' : 'left'} · ${Math.abs(gorillasState.wind)}`;
  }

  function getGorillasWindHudLabel() {
    if (!gorillasState || gorillasState.wind === 0) return 'Wind: Calm';
    return `Wind: ${Math.abs(gorillasState.wind)} ${gorillasState.wind > 0 ? '→' : '←'}`;
  }

  function getGorillasShotSummary() {
    if (!gorillasState) return 'Preview shows the first part of your banana path. Wind may still push it.';
    const { angle, power } = normalizeGorillasInputs();
    return `${getGorillasPlayerName(gorillasTurn)} aiming · ${angle}° · ${power} power · ${getGorillasWindLabel()}. Preview shows the first part of the path; wind may still push it.`;
  }

  function renderGorillasControls() {
    if (!gorillasFireButton) return;
    const locked = !gorillasState || Boolean(gorillasState.projectile) || Boolean(gorillasState.winner) || isGorillasComputerTurn();
    gorillasFireButton.disabled = locked;
    if (gorillasQuickShotButton) gorillasQuickShotButton.disabled = locked;
    if (gorillasShotSummary && gorillasState && !gorillasState.projectile) {
      gorillasShotSummary.textContent = gorillasState.winner
        ? 'Match complete. Reset for a new skyline or finish for the summary.'
        : getGorillasShotSummary();
    }
    renderGorillasShotHistory();
  }

  function renderGorillasShotHistory() {
    if (!gorillasShotHistory || !gorillasState) return;
    gorillasShotHistory.innerHTML = '';
    gorillasState.shotHistory.slice(-5).reverse().forEach(shot => {
      const li = document.createElement('li');
      li.textContent = `${shot.playerName}: ${shot.angle}° / ${shot.power} · ${shot.result}`;
      gorillasShotHistory.appendChild(li);
    });
  }

  async function toggleGorillasFullscreen() {
    const target = sections.gorillas || gorillasCanvas;
    try {
      if (!isImmersive(target)) {
        await enterImmersive(target);
      } else {
        await exitImmersive(target);
      }
    } catch (error) {
      gorillasStatus.textContent = 'Full screen is not available in this browser.';
    }
    updateGorillasFullscreenButton();
  }

  function updateGorillasFullscreenButton() {
    if (!gorillasFullscreenButton) return;
    gorillasFullscreenButton.textContent = isImmersive(sections.gorillas) ? 'Exit Full Screen' : 'Full Screen';
  }

  function drawPixelGorilla(ctx, x, y, facing) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);
    ctx.fillStyle = '#1a1620';
    ctx.fillRect(-10, -20, 20, 18);
    ctx.fillRect(-13, -10, 26, 16);
    ctx.fillRect(-17, -7, 8, 18);
    ctx.fillRect(9, -7, 8, 18);
    ctx.fillRect(-8, 5, 6, 12);
    ctx.fillRect(2, 5, 6, 12);
    ctx.fillStyle = '#f7d8b5';
    ctx.fillRect(-5, -16, 10, 7);
    ctx.fillStyle = '#f58220';
    ctx.fillRect(9, -27, 6, 11);
    ctx.restore();
  }

  function drawBananaSprite(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#ffd74a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 4, -0.35, 0.2, Math.PI * 1.75);
    ctx.strokeStyle = '#6b3f00';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }

  function drawGorillasBackdrop(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, gorillasState.height);
    sky.addColorStop(0, '#73d7ff');
    sky.addColorStop(0.5, '#d8f6ff');
    sky.addColorStop(1, '#f7fbff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, gorillasState.width, gorillasState.height);

    ctx.fillStyle = '#ffd86b';
    ctx.beginPath();
    ctx.arc(gorillasState.width - 72, 58, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    [[90, 54], [170, 82], [515, 70]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.arc(x + 22, y + 3, 14, 0, Math.PI * 2);
      ctx.arc(x - 22, y + 5, 12, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#7b9fb0';
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.lineTo(110, 130);
    ctx.lineTo(235, 220);
    ctx.lineTo(350, 145);
    ctx.lineTo(500, 220);
    ctx.lineTo(640, 120);
    ctx.lineTo(gorillasState.width, 220);
    ctx.lineTo(gorillasState.width, gorillasState.height);
    ctx.lineTo(0, gorillasState.height);
    ctx.closePath();
    ctx.fill();
  }

  function drawGorillasBillboard(ctx) {
    const x = gorillasState.width / 2 - 72;
    const y = gorillasState.height - 94;
    ctx.fillStyle = '#09233f';
    ctx.fillRect(x + 12, y + 42, 8, 44);
    ctx.fillRect(x + 124, y + 42, 8, 44);
    ctx.fillStyle = '#f7fbff';
    ctx.fillRect(x, y, 144, 48);
    ctx.strokeStyle = '#09233f';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, 144, 48);
    ctx.fillStyle = '#f58220';
    ctx.font = '900 14px Atkinson Hyperlegible, Arial, sans-serif';
    ctx.fillText('BANANA', x + 18, y + 21);
    ctx.fillText('TOWERS', x + 20, y + 38);
  }

  function drawGorillasRoofDetail(ctx, building, index) {
    const x = building.x + 4;
    const roofY = building.roofY;
    ctx.save();
    ctx.fillStyle = '#09233f';
    ctx.strokeStyle = '#09233f';
    ctx.lineWidth = 2;
    if (building.detail === 'antenna') {
      ctx.beginPath();
      ctx.moveTo(x + building.width * 0.5, roofY);
      ctx.lineTo(x + building.width * 0.5, roofY - 24);
      ctx.moveTo(x + building.width * 0.5, roofY - 16);
      ctx.lineTo(x + building.width * 0.5 + 12, roofY - 23);
      ctx.stroke();
    } else if (building.detail === 'vent') {
      ctx.fillRect(x + 16, roofY - 10, 28, 10);
      ctx.fillStyle = '#f58220';
      ctx.fillRect(x + 19, roofY - 16, 22, 6);
    } else if (building.detail === 'water') {
      ctx.fillRect(x + building.width - 28, roofY - 20, 20, 20);
      ctx.fillRect(x + building.width - 23, roofY - 30, 10, 10);
    } else if (building.detail === 'hotel') {
      ctx.fillStyle = '#f7fbff';
      ctx.fillRect(x + 8, roofY + 10, 30, 22);
      ctx.fillStyle = '#f58220';
      ctx.font = '900 9px Atkinson Hyperlegible, Arial, sans-serif';
      ctx.fillText('MOTEL', x + 10, roofY + 25);
    } else if (building.detail === 'neon') {
      ctx.fillStyle = index % 2 === 0 ? '#2ec7d3' : '#ffd74a';
      ctx.fillRect(x + building.width - 42, roofY + 18, 30, 14);
      ctx.fillStyle = '#09233f';
      ctx.font = '900 8px Atkinson Hyperlegible, Arial, sans-serif';
      ctx.fillText('EAT', x + building.width - 38, roofY + 28);
    }
    ctx.restore();
  }

  function drawGorillasHud(ctx) {
    const { angle, power } = normalizeGorillasInputs();
    ctx.fillStyle = 'rgba(247,251,255,0.86)';
    ctx.fillRect(10, 10, 292, 52);
    ctx.strokeStyle = 'rgba(9,35,63,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 292, 52);
    ctx.fillStyle = '#09233f';
    ctx.font = '900 14px Atkinson Hyperlegible, Arial, sans-serif';
    ctx.fillText(`${getGorillasPlayerName(gorillasTurn)} aiming · ${angle}° · ${power}`, 22, 31);
    ctx.fillText(`${getGorillasWindHudLabel()} · First to ${getGorillasTargetScore()}`, 22, 51);

    const arrowX = 276;
    const arrowY = 24;
    ctx.fillStyle = '#f58220';
    ctx.beginPath();
    if (gorillasState.wind >= 0) {
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX + 16, arrowY + 8);
      ctx.lineTo(arrowX, arrowY + 16);
    } else {
      ctx.moveTo(arrowX + 16, arrowY);
      ctx.lineTo(arrowX, arrowY + 8);
      ctx.lineTo(arrowX + 16, arrowY + 16);
    }
    ctx.closePath();
    ctx.fill();
  }

  function createGorillasSparks(x, y) {
    return Array.from({ length: 12 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 12;
      return {
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 4),
        vy: Math.sin(angle) * (2 + Math.random() * 4),
      };
    });
  }

  function getGorillasBuildingLayer(width, height) {
    if (!gorillasBuildingLayer) gorillasBuildingLayer = document.createElement('canvas');
    if (gorillasBuildingLayer.width !== width) gorillasBuildingLayer.width = width;
    if (gorillasBuildingLayer.height !== height) gorillasBuildingLayer.height = height;
    return gorillasBuildingLayer;
  }

  function drawGorillasAimPreview(ctx) {
    if (!gorillasState || gorillasState.projectile || gorillasState.winner) return;
    const { angle, power } = normalizeGorillasInputs();
    const points = simulateGorillasTrajectory(angle, power, getGorillasSide(gorillasTurn), 34).points;
    gorillasState.lastDebugTrajectory = points;
    ctx.save();
    points.forEach((point, i) => {
      if (i % 3 === 0) {
        ctx.globalAlpha = 0.58 * (1 - i / Math.max(1, points.length));
        ctx.fillStyle = '#ffd74a';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  function getGorillasShotStart(side) {
    const shooterBuilding = side === 'left'
      ? gorillasState.buildings[0]
      : gorillasState.buildings[gorillasState.buildings.length - 1];
    return {
      x: side === 'left' ? shooterBuilding.x + shooterBuilding.width + 6 : shooterBuilding.x - 6,
      y: shooterBuilding.roofY - 12,
    };
  }

  function simulateGorillasTrajectory(angle, power, side, maxSteps = 220) {
    if (!gorillasState) return { points: [], impact: null };
    const direction = side === 'left' ? 1 : -1;
    const radians = angle * Math.PI / 180;
    const speed = power * 10.2;
    const start = getGorillasShotStart(side);
    let x = start.x;
    let y = start.y;
    let vx = Math.cos(radians) * speed * direction;
    let vy = -Math.sin(radians) * speed;
    const dt = 0.016;
    const points = [{ x, y, vx, vy }];
    for (let i = 0; i < maxSteps; i++) {
      vx += gorillasState.wind * dt;
      vy += gorillasState.gravity * dt;
      x += vx * dt;
      y += vy * dt;
      points.push({ x, y, vx, vy });
      const result = evaluateGorillasPoint({ x, y, vx, vy }, side);
      if (result) {
        return { points, impact: Object.assign({ x, y, vx, vy }, result) };
      }
    }
    return { points, impact: null };
  }

  function getGorillasHitboxes(shooterSide = getGorillasSide(gorillasTurn)) {
    if (!gorillasState) return null;
    const lastBuildingIndex = gorillasState.buildings.length - 1;
    const targetIndex = shooterSide === 'left' ? lastBuildingIndex : 0;
    const shooterIndex = shooterSide === 'left' ? 0 : lastBuildingIndex;
    const target = gorillasState.buildings[targetIndex];
    const shooter = gorillasState.buildings[shooterIndex];
    const targetGorillaX = targetIndex === 0
      ? target.x + target.width * 0.62
      : target.x + target.width * 0.38;
    const targetGorillaY = target.roofY - 2;
    const shooterGorillaX = shooterIndex === 0
      ? shooter.x + shooter.width * 0.62
      : shooter.x + shooter.width * 0.38;
    const shooterGorillaY = shooter.roofY - 2;
    return {
      targetIndex,
      shooterIndex,
      target: {
        x: targetGorillaX - 18,
        y: targetGorillaY - 30,
        width: 36,
        height: 48,
      },
      self: {
        x: shooterGorillaX - 18,
        y: shooterGorillaY - 30,
        width: 36,
        height: 48,
      },
      buildings: gorillasState.buildings.map(building => ({
        x: building.x + 4,
        y: building.roofY,
        width: building.width,
        height: building.height,
      })),
    };
  }

  function pointInRect(point, rect) {
    return point.x >= rect.x
      && point.x <= rect.x + rect.width
      && point.y >= rect.y
      && point.y <= rect.y + rect.height;
  }

  function evaluateGorillasPoint(point, shooterSide = getGorillasSide(gorillasTurn)) {
    if (!gorillasState) return null;
    const hitboxes = getGorillasHitboxes(shooterSide);
    const groundY = gorillasState.height - 36;
    if (pointInRect(point, hitboxes.target)) return { type: 'target' };
    const inCrater = isPointInGorillasCrater(point.x, point.y);
    const hitBuildingIndex = inCrater ? -1 : hitboxes.buildings.findIndex(rect => pointInRect(point, rect));
    if (hitBuildingIndex !== -1) {
      return {
        type: hitBuildingIndex === hitboxes.shooterIndex ? 'self' : 'building',
        buildingIndex: hitBuildingIndex,
      };
    }
    if (point.y >= groundY) return { type: 'ground' };
    if (point.x < 0 || point.x > gorillasState.width) return { type: 'out' };
    return null;
  }

  function drawGorillasDebug(ctx) {
    if (!gorillasState) return;
    const hitboxes = getGorillasHitboxes();
    ctx.save();
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(46, 199, 211, 0.85)';
    hitboxes.buildings.forEach(rect => ctx.strokeRect(rect.x, rect.y, rect.width, rect.height));
    ctx.strokeStyle = 'rgba(0, 180, 90, 0.95)';
    ctx.strokeRect(hitboxes.target.x, hitboxes.target.y, hitboxes.target.width, hitboxes.target.height);
    ctx.strokeStyle = 'rgba(245, 130, 32, 0.95)';
    ctx.strokeRect(hitboxes.self.x, hitboxes.self.y, hitboxes.self.width, hitboxes.self.height);
    if (gorillasState.lastDebugTrajectory && gorillasState.lastDebugTrajectory.length > 1) {
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(123, 78, 230, 0.7)';
      ctx.beginPath();
      gorillasState.lastDebugTrajectory.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    if (gorillasState.lastImpact) {
      ctx.fillStyle = 'rgba(255, 20, 20, 0.85)';
      ctx.beginPath();
      ctx.arc(gorillasState.lastImpact.x, gorillasState.lastImpact.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    const projectile = gorillasState.projectile;
    const { angle, power } = normalizeGorillasInputs();
    const fullTrajectory = simulateGorillasTrajectory(angle, power, getGorillasSide(gorillasTurn), 240).points;
    const debugLines = [
      `Debug · angle ${gorillasAngle.value} · power ${gorillasPower.value} · wind ${gorillasState.wind}`,
      projectile ? `banana x/y ${Math.round(projectile.x)},${Math.round(projectile.y)} · vx/vy ${Math.round(projectile.vx)},${Math.round(projectile.vy)}` : 'banana x/y idle',
      gorillasState.lastImpact ? `last impact ${Math.round(gorillasState.lastImpact.x)},${Math.round(gorillasState.lastImpact.y)} · ${gorillasState.lastImpact.result}` : 'last impact none',
    ];
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(6,21,36,0.78)';
    ctx.fillRect(10, 68, 390, 66);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px Atkinson Hyperlegible, Arial, sans-serif';
    debugLines.forEach((line, index) => ctx.fillText(line, 20, 88 + index * 18));
    if (fullTrajectory.length > 1) {
      ctx.strokeStyle = 'rgba(255, 215, 74, 0.65)';
      ctx.beginPath();
      fullTrajectory.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGorillas() {
    if (!gorillasCanvas || !gorillasState) return;
    const ctx = gorillasCanvas.getContext('2d');
    ctx.clearRect(0, 0, gorillasState.width, gorillasState.height);
    drawGorillasBackdrop(ctx);
    ctx.fillStyle = '#26384f';
    ctx.fillRect(0, gorillasState.height - 36, gorillasState.width, 36);
    drawGorillasBillboard(ctx);
    ctx.fillStyle = '#f58220';
    for (let x = 0; x < gorillasState.width; x += 38) {
      ctx.fillRect(x, gorillasState.height - 24, 20, 4);
    }
    const layer = getGorillasBuildingLayer(gorillasState.width, gorillasState.height);
    const lctx = layer.getContext('2d');
    lctx.clearRect(0, 0, layer.width, layer.height);
    gorillasState.buildings.forEach((building, index) => {
      const x = building.x + 4;
      const y = building.roofY;
      const buildingGradient = lctx.createLinearGradient(x, y, x, gorillasState.height - 36);
      buildingGradient.addColorStop(0, index % 2 === 0 ? '#203b60' : '#2a4c76');
      buildingGradient.addColorStop(1, index % 2 === 0 ? '#10243f' : '#173453');
      lctx.fillStyle = buildingGradient;
      lctx.fillRect(x, y, building.width, building.height);
      lctx.fillStyle = 'rgba(255,255,255,0.78)';
      for (let row = 0; row < Math.max(2, Math.floor(building.height / 44)); row++) {
        for (let col = 0; col < Math.max(2, Math.floor(building.width / 28)); col++) {
          const wx = x + 10 + col * 18;
          const wy = y + 14 + row * 22;
          if (wx + 8 < x + building.width - 8 && wy + 12 < gorillasState.height - 40) {
            lctx.fillRect(wx, wy, 9, 12);
          }
        }
      }
      lctx.fillStyle = 'rgba(255,255,255,0.18)';
      lctx.fillRect(x, y, building.width, 4);
      drawGorillasRoofDetail(lctx, building, index);
    });
    if (Array.isArray(gorillasState.craters) && gorillasState.craters.length) {
      lctx.save();
      lctx.globalCompositeOperation = 'destination-out';
      gorillasState.craters.forEach(crater => {
        lctx.beginPath();
        lctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
        lctx.fill();
      });
      lctx.restore();
    }
    ctx.drawImage(layer, 0, 0);
    const leftGorilla = gorillasState.buildings[0];
    const rightGorilla = gorillasState.buildings[gorillasState.buildings.length - 1];
    drawPixelGorilla(ctx, leftGorilla.x + leftGorilla.width * 0.62, leftGorilla.roofY - 2, 1);
    drawPixelGorilla(ctx, rightGorilla.x + rightGorilla.width * 0.38, rightGorilla.roofY - 2, -1);
    ctx.fillStyle = 'rgba(9,35,63,0.45)';
    ctx.fillRect(gorillasState.width / 2 - 2, 96, 4, gorillasState.height - 132);
    drawGorillasHud(ctx);
    if (gorillasState.lastTrail && gorillasState.lastTrail.length > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.42)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      gorillasState.lastTrail.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (gorillasState.trail.length > 1) {
      ctx.strokeStyle = 'rgba(245,130,32,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      gorillasState.trail.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
    if (gorillasState.projectile) {
      drawBananaSprite(ctx, gorillasState.projectile.x, gorillasState.projectile.y, Math.atan2(gorillasState.projectile.vy, gorillasState.projectile.vx));
    } else {
      drawGorillasAimPreview(ctx);
    }
    if (gorillasState.explosion) {
      ctx.fillStyle = 'rgba(245,130,32,0.85)';
      ctx.beginPath();
      ctx.arc(gorillasState.explosion.x, gorillasState.explosion.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(gorillasState.explosion.x, gorillasState.explosion.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    if (gorillasState.sparks.length) {
      ctx.fillStyle = '#ffd74a';
      gorillasState.sparks.forEach(spark => {
        ctx.fillRect(spark.x - 2, spark.y - 2, 4, 4);
      });
    }
    if (gorillasSettings.debug) drawGorillasDebug(ctx);
  }

  function startGorillasGame() {
    stopGorillas();
    populateGorillasSettings();
    saveGorillasSettings();
    gorillasState = createGorillasState();
    gorillasTurn = 0;
    gorillasLastFrameTs = 0;
    renderGorillasScore();
    renderGorillasControls();
    updateGorillasFullscreenButton();
    showSection('gorillas');
    gorillasStatus.textContent = `${getGorillasPlayerName(gorillasTurn)} goes first. ${getGorillasWindLabel()}. First to ${getGorillasTargetScore()}.`;
    drawGorillas();
  }

  function getGorillasResultLabel(result) {
    return {
      direct: 'Direct Hit',
      self: 'Self Bonk',
      close: 'Close Call',
      tower: 'Tower Tap',
      short: 'Short Shot',
      overshot: 'Sky Banana',
      low: 'Too Low',
      out: 'Another Zip Code',
      miss: 'Almost Famous',
    }[result] || 'Banana Report';
  }

  function classifyGorillasMiss(impact, shooterSide) {
    if (!gorillasState || !impact) return 'miss';
    if (impact.type === 'building') {
      const targetIndex = shooterSide === 'left' ? gorillasState.buildings.length - 1 : 0;
      return Math.abs(impact.buildingIndex - targetIndex) <= 1 ? 'close' : 'tower';
    }
    if (impact.type === 'ground') {
      const target = shooterSide === 'left'
        ? gorillasState.buildings[gorillasState.buildings.length - 1]
        : gorillasState.buildings[0];
      if ((shooterSide === 'left' && impact.x < target.x) || (shooterSide === 'right' && impact.x > target.x + target.width)) return 'short';
      return 'low';
    }
    if (impact.type === 'out') return 'overshot';
    return 'miss';
  }

  function getGorillasFeedback(result, shooterName, scoredName) {
    const lines = {
      direct: `${getGorillasResultLabel(result)}! ${scoredName} lands banana justice. One point on the board.`,
      self: `${getGorillasResultLabel(result)}! ${shooterName} clipped home base, so the point goes the other way.`,
      close: `${getGorillasResultLabel(result)}. Hit near the target tower. Try a tiny angle or power change.`,
      tower: `${getGorillasResultLabel(result)}. Nice line, questionable real estate outcome.`,
      short: `${getGorillasResultLabel(result)}. Add power or raise the angle.`,
      overshot: `${getGorillasResultLabel(result)}. That shot entered another zip code. Reduce power or lower the angle.`,
      low: `${getGorillasResultLabel(result)}. Raise the arc or add a little power.`,
      out: `${getGorillasResultLabel(result)}. Too much ambition, not enough address.`,
      miss: `${getGorillasResultLabel(result)}. Wind may have nudged it off course.`,
    };
    return lines[result] || `${shooterName} missed, but the banana learned something.`;
  }

  function addGorillasShotHistory(entry) {
    if (!gorillasState) return;
    gorillasState.shotHistory.push(entry);
    if (gorillasState.shotHistory.length > 5) gorillasState.shotHistory.shift();
  }

  function advanceGorillasTurn(scored, options = {}) {
    if (!gorillasState) return;
    const projectile = gorillasState.projectile;
    const impact = projectile ? { x: projectile.x, y: projectile.y } : null;
    gorillasRunning = false;
    gorillasLastFrameTs = 0;
    if (gorillasAnimationFrame) {
      window.cancelAnimationFrame(gorillasAnimationFrame);
      gorillasAnimationFrame = null;
    }
    const shooterName = getGorillasPlayerName(gorillasTurn);
    const scorerSide = options.scorerSide || getGorillasSide(gorillasTurn);
    const scorerName = scorerSide === getGorillasSide(gorillasTurn)
      ? shooterName
      : getGorillasPlayerName(gorillasTurn + 1);
    const result = options.result || (scored ? 'direct' : 'miss');
    gorillasState.lastTrail = gorillasState.trail.slice();
    gorillasState.lastImpact = impact ? Object.assign({ result }, impact) : null;
    addGorillasShotHistory({
      playerName: shooterName,
      angle: projectile ? projectile.angle : Number(gorillasAngle.value) || 45,
      power: projectile ? projectile.power : Number(gorillasPower.value) || 70,
      wind: gorillasState.wind,
      result: getGorillasResultLabel(result),
    });
    if (isGorillasComputerTurn() && gorillasState.computerMemory && projectile) {
      gorillasState.computerMemory.angle = projectile.angle;
      gorillasState.computerMemory.power = projectile.power;
      gorillasState.computerMemory.lastResult = result;
    }
    if (scored) {
      const scorer = scorerSide === 'left' ? 'scoreLeft' : 'scoreRight';
      gorillasState[scorer] += 1;
      renderGorillasScore();
      if (gorillasState[scorer] >= getGorillasTargetScore()) {
        gorillasState.winner = scorer;
        gorillasState.explosion = impact;
        gorillasState.sparks = impact ? createGorillasSparks(impact.x, impact.y) : [];
        gorillasStatus.textContent = `${scorerName} wins Banana Towers! ${getGorillasFeedback(result, shooterName, scorerName)}`;
        stopGorillas();
        renderGorillasControls();
        drawGorillas();
        return;
      }
      gorillasState.explosion = impact;
      gorillasState.sparks = impact ? createGorillasSparks(impact.x, impact.y) : [];
      gorillasStatus.textContent = options.statusText || getGorillasFeedback(result, shooterName, scorerName);
    } else {
      gorillasState.explosion = impact && impact.y < gorillasState.height - 40 ? impact : null;
      gorillasState.sparks = gorillasState.explosion ? createGorillasSparks(gorillasState.explosion.x, gorillasState.explosion.y) : [];
      gorillasStatus.textContent = options.statusText || getGorillasFeedback(result, shooterName, scorerName);
    }
    gorillasTurn += 1;
    gorillasState.projectile = null;
    renderGorillasControls();
    drawGorillas();
    maybeStartGorillasComputerTurn();
  }

  function isPointInGorillasCrater(x, y) {
    const craters = gorillasState && gorillasState.craters;
    if (!Array.isArray(craters)) return false;
    return craters.some(crater => Math.hypot(x - crater.x, y - crater.y) <= crater.radius);
  }

  function fireGorillasShot() {
    if (!gorillasState || gorillasState.projectile || gorillasState.winner) return;
    const { angle, power } = normalizeGorillasInputs();
    const side = getGorillasSide(gorillasTurn);
    const shooterBuilding = side === 'left' ? gorillasState.buildings[0] : gorillasState.buildings[gorillasState.buildings.length - 1];
    const direction = side === 'left' ? 1 : -1;
    const radians = angle * Math.PI / 180;
    const speed = power * 10.2;
    gorillasState.projectile = {
      x: side === 'left' ? shooterBuilding.x + shooterBuilding.width + 6 : shooterBuilding.x - 6,
      y: shooterBuilding.roofY - 12,
      vx: Math.cos(radians) * speed * direction,
      vy: -Math.sin(radians) * speed,
      angle,
      power,
    };
    gorillasState.trail = [{ x: gorillasState.projectile.x, y: gorillasState.projectile.y }];
    gorillasState.explosion = null;
    gorillasState.sparks = [];
    const launches = [
      'launches a banana into questionable airspace',
      'consults the wind and ignores common sense',
      'sends one yellow idea into the sky',
      'trusts the preview and the laws of snack physics',
    ];
    gorillasStatus.textContent = `${getGorillasPlayerName(gorillasTurn)} ${launches[Math.floor(Math.random() * launches.length)]}.`;
    gorillasRunning = true;
    gorillasLastFrameTs = 0;
    renderGorillasControls();
    gorillasAnimationFrame = window.requestAnimationFrame(tickGorillas);
  }

  function tickGorillas(timestamp = performance.now()) {
    if (!gorillasRunning || !gorillasState || !gorillasState.projectile) return;
    const dt = gorillasLastFrameTs ? Math.min(0.032, (timestamp - gorillasLastFrameTs) / 1000) : 0.016;
    gorillasLastFrameTs = timestamp;
    const projectile = gorillasState.projectile;
    projectile.vx += gorillasState.wind * dt;
    projectile.vy += gorillasState.gravity * dt;
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    gorillasState.trail.push({ x: projectile.x, y: projectile.y });
    if (gorillasState.trail.length > 42) gorillasState.trail.shift();

    const shooterSide = getGorillasSide(gorillasTurn);
    const impactResult = evaluateGorillasPoint(projectile, shooterSide);
    const impact = impactResult ? Object.assign({
      x: projectile.x,
      y: projectile.y,
      vx: projectile.vx,
      vy: projectile.vy,
    }, impactResult) : null;

    drawGorillas();

    if (!impact) {
      gorillasAnimationFrame = window.requestAnimationFrame(tickGorillas);
      return;
    }

    if (impact.type === 'target') {
      addGorillasCrater(projectile.x, projectile.y);
      advanceGorillasTurn(true, { result: 'direct' });
      return;
    }
    if (impact.type === 'self') {
      addGorillasCrater(projectile.x, projectile.y);
      const opponentSide = shooterSide === 'left' ? 'right' : 'left';
      advanceGorillasTurn(true, {
        scorerSide: opponentSide,
        result: 'self',
      });
      return;
    }
    if (impact.type === 'building') {
      addGorillasCrater(projectile.x, projectile.y);
      advanceGorillasTurn(false, { result: classifyGorillasMiss(impact, shooterSide) });
      return;
    }

    advanceGorillasTurn(false, { result: classifyGorillasMiss(impact, shooterSide) });
  }

  function addGorillasCrater(x, y) {
    if (!gorillasState) return;
    if (!Array.isArray(gorillasState.craters)) gorillasState.craters = [];
    const radius = Math.max(18, Math.round(gorillasState.width * 0.028));
    gorillasState.craters.push({ x, y, radius });
    if (gorillasState.craters.length > 60) gorillasState.craters.shift();
  }

  function getGorillasComputerError() {
    if (gorillasSettings.difficulty === 'hard') return { angle: 2.5, power: 5 };
    if (gorillasSettings.difficulty === 'easy') return { angle: 7, power: 14 };
    return { angle: 4.5, power: 9 };
  }

  function pickGorillasComputerShot() {
    if (!gorillasState) return { angle: 45, power: 70 };
    const side = getGorillasSide(gorillasTurn);
    const hitboxes = getGorillasHitboxes(side);
    const targetCenter = {
      x: hitboxes.target.x + hitboxes.target.width / 2,
      y: hitboxes.target.y + hitboxes.target.height / 2,
    };
    let best = { angle: 45, power: 70, score: Infinity };
    for (let angle = 24; angle <= 72; angle += 3) {
      for (let power = 35; power <= 100; power += 5) {
        const sim = simulateGorillasTrajectory(angle, power, side, 240);
        const impact = sim.impact;
        const finalPoint = impact || sim.points[sim.points.length - 1] || targetCenter;
        const hitBonus = impact && impact.type === 'target' ? -900 : 0;
        const selfPenalty = impact && impact.type === 'self' ? 700 : 0;
        const score = Math.hypot(finalPoint.x - targetCenter.x, finalPoint.y - targetCenter.y) + hitBonus + selfPenalty;
        if (score < best.score) best = { angle, power, score };
      }
    }
    const error = getGorillasComputerError();
    const memory = gorillasState.computerMemory || {};
    const blend = gorillasSettings.difficulty === 'easy' ? 0.35 : gorillasSettings.difficulty === 'hard' ? 0.82 : 0.62;
    const rememberedAngle = Number.isFinite(memory.angle) ? memory.angle : best.angle;
    const rememberedPower = Number.isFinite(memory.power) ? memory.power : best.power;
    return {
      angle: Math.round(Math.max(10, Math.min(80, rememberedAngle * (1 - blend) + best.angle * blend + (Math.random() - 0.5) * error.angle))),
      power: Math.round(Math.max(20, Math.min(100, rememberedPower * (1 - blend) + best.power * blend + (Math.random() - 0.5) * error.power))),
    };
  }

  function maybeStartGorillasComputerTurn() {
    if (!gorillasState || gorillasState.winner || gorillasState.projectile || !isGorillasComputerTurn()) return;
    renderGorillasControls();
    gorillasStatus.textContent = `${getGorillasPlayerName(gorillasTurn)} is lining up a computer shot. ${getGorillasWindLabel()}.`;
    gorillasComputerTimer = window.setTimeout(() => {
      if (!gorillasState || gorillasState.winner || !isGorillasComputerTurn()) return;
      const shot = pickGorillasComputerShot();
      gorillasAngle.value = String(shot.angle);
      gorillasPower.value = String(shot.power);
      normalizeGorillasInputs();
      drawGorillas();
      fireGorillasShot();
    }, 850);
  }

  function quickGorillasShot() {
    if (!gorillasState || gorillasState.projectile || gorillasState.winner) return;
    const side = getGorillasSide(gorillasTurn);
    const shot = side === 'right'
      ? pickGorillasComputerShot()
      : {
          angle: 38 + Math.round(Math.random() * 18),
          power: 58 + Math.round(Math.random() * 26),
        };
    gorillasAngle.value = String(shot.angle);
    gorillasPower.value = String(shot.power);
    normalizeGorillasInputs();
    renderGorillasControls();
    drawGorillas();
  }

  function resetGorillasGame() {
    stopGorillas();
    saveGorillasSettings();
    gorillasState = createGorillasState();
    gorillasTurn = 0;
    gorillasLastFrameTs = 0;
    renderGorillasScore();
    renderGorillasControls();
    gorillasStatus.textContent = `New skyline loaded. ${getGorillasWindLabel()}. First to ${getGorillasTargetScore()}.`;
    drawGorillas();
    maybeStartGorillasComputerTurn();
  }

  function showGorillasSummary() {
    stopGorillas();
    showSection('summary');
    const rightName = gorillasSettings.opponent === 'computer' ? 'Computer' : (players[1] ? players[1].name : 'P2');
    const leader = gorillasState.scoreLeft === gorillasState.scoreRight
      ? null
      : (gorillasState.scoreLeft > gorillasState.scoreRight ? (players[0] || { name: 'P1' }) : { name: rightName });
    summaryText.textContent = leader
      ? `${leader.name} wins Banana Towers, ${gorillasState.scoreLeft} to ${gorillasState.scoreRight}.`
      : `Banana Towers ends in a tie, ${gorillasState.scoreLeft} to ${gorillasState.scoreRight}.`;
    summaryList.innerHTML = '';
    [
      `Match mode: ${gorillasSettings.match === 'sudden' ? 'Sudden Banana' : `first to ${getGorillasTargetScore()}`}.`,
      gorillasState.shotHistory.length ? `Best recent moment: ${gorillasState.shotHistory[gorillasState.shotHistory.length - 1].result}.` : 'No bananas were thrown yet.',
      'Prize idea: winner chooses the next mini-game, loser names the next banana.',
    ].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      summaryList.appendChild(li);
    });
  }

  function resetPongGame() {
    stopPong();
    renderPongSettings();
    pongState = createPongState();
    pongKeys = {};
    pongPointerSides = {};
    updatePongScore();
    drawPong();
  }

  function startPongGame() {
    resetGame();
    resetPongGame();
    renderPongSettings();
    pongStatus.textContent = 'Drag on the left side to move the left paddle. In local mode, drag on the right side for player two. W/S and Arrow keys also work.';
    showSection('pong');
  }

  function showPongSummary() {
    stopPong();
    showSection('summary');
    if (!pongState) pongState = createPongState();
    const leftName = players[0] ? players[0].name : 'P1';
    const rightName = pongSettings.opponentMode === 'computer'
      ? (pongSettings.difficulty === 'deathmatch' ? 'Death Match AI' : 'Computer')
      : (players[1] ? players[1].name : 'P2');
    const leaders = pongState.leftPaddle.score === pongState.rightPaddle.score
      ? []
      : [pongState.leftPaddle.score > pongState.rightPaddle.score ? leftName : rightName];
    summaryText.textContent = leaders.length
      ? `${leaders[0]} wins Road Pong, ${pongState.leftPaddle.score} to ${pongState.rightPaddle.score}.`
      : `Road Pong ends in a tie, ${pongState.leftPaddle.score} to ${pongState.rightPaddle.score}.`;
    summaryList.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = `Mode: ${pongSettings.opponentMode === 'computer' ? `${pongSettings.difficulty} AI` : 'local player'}. Prize idea: winner chooses the next mini-game or gets one song veto.`;
    summaryList.appendChild(li);
  }

  function renderAdminCounts() {
    if (!adminCounts) return;
    const triviaCount = triviaDatabase.length;
    const scavengerCount = activeScavengerItems.length;
    const learnCount = adventurePromptDatabase.filter(question => question.category === 'learn').length;
    const hideSeekMapCount = Object.keys(hideSeekMaps).length;
    const secretModeCount = Object.keys(secretModeConfigs).length;
    const hideSeekMapLabel = hideSeekMapCount === 1 ? 'hide-and-seek map' : 'hide-and-seek maps';
    const secretModeLabel = secretModeCount === 1 ? 'secret mode' : 'secret modes';
    adminCounts.textContent = `${triviaCount} trivia questions, ${scavengerCount} scavenger items, ${learnCount} learn prompts, ${hideSeekMapCount} ${hideSeekMapLabel}, ${secretModeCount} ${secretModeLabel}.`;
  }

  function useAdminTestPlayers() {
    players = [
      { id: 'p1', name: 'JT' },
      { id: 'p2', name: 'DD' },
      { id: 'p3', name: 'QA' },
      { id: 'p4', name: 'UX' },
    ];
    carJudgeId = 'p3';
    setStoredJson('rtaPlayers', players);
    setStoredJson('rtaCarJudgeId', carJudgeId);
    renderPlayerFields();
    renderAdminCounts();
  }

  function openAdminMode() {
    renderAdminCounts();
    showSection('admin');
  }

  function showLogoPrank() {
    if (!logoPrank) return;
    logoPrank.hidden = false;
  }

  function handleLogoClick() {
    logoClickCount++;
    window.clearTimeout(logoClickTimer);
    logoClickTimer = window.setTimeout(() => {
      if (logoClickCount >= 4) {
        showLogoPrank();
      } else if (logoClickCount === 3) {
        openAdminMode();
      }
      logoClickCount = 0;
    }, 420);
  }

  function launchAdminMode(mode) {
    savePlayers();
    selectedCategory = normalizeCategoryKey(mode);
    if (selectedCategory === 'secret') {
      startSecretMode();
    } else if (selectedCategory === 'pong') {
      startPongGame();
    } else if (selectedCategory === 'gorillas') {
      startGorillasGame();
    } else if (selectedCategory === 'scavenger') {
      startScavengerHunt();
    } else if (selectedCategory === 'trivia') {
      startTriviaRun();
      startTriviaCategory(activeTriviaCategory || 'mixed');
    } else if (selectedCategory === 'jokes') {
      startJokeVote();
    } else if (selectedCategory === 'emoji') {
      startEmojiGame();
    } else if (selectedCategory === 'pi') {
      startPiChallenge();
    } else if (selectedCategory === 'calculator') {
      startTripCalculator();
    } else if (selectedCategory === 'hideSeek') {
      startHideSeekGame();
    } else if (selectedCategory === 'learn') {
      selectedLearnTopic = 'all';
      setStoredJson('rtaLastLearnTopic', selectedLearnTopic);
      regionCode = '*';
      startAdventure();
    } else if (selectedCategory === 'local') {
      regionCode = 'CA';
      startAdventure();
    } else if (['look', 'random'].includes(selectedCategory)) {
      regionCode = '*';
      startAdventure();
    } else {
      showSection('category');
    }
  }

  function handleAdminAction(action) {
    if (action === 'test-players') {
      useAdminTestPlayers();
      return;
    }
    if (action === 'open-menu') {
      showSection('category');
    }
  }

  function maybeOpenDeveloperLab() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === '1' || window.location.hash === '#admin' || window.location.hash === '#dev') {
      loadingScreen.style.display = 'none';
      openAdminMode();
    }
  }

  function getSecretModeConfig() {
    return secretModeConfigs[activeSecretMode] || secretModeConfigs.default;
  }

  function startSecretMode(mode = 'default') {
    resetGame();
    activeSecretMode = mode;
    const config = getSecretModeConfig();
    secretUnlockStep = 0;
    activeSecretUnlockQuestions = shuffle(config.questions.slice()).slice(0, 5);
    secretHeading.textContent = config.title;
    secretIntro.textContent = config.intro;
    secretVideo.src = '';
    secretVideoWrap.hidden = true;
    secretAnswerField.hidden = false;
    secretSubmitButton.hidden = false;
    secretSkipButton.hidden = false;
    renderSecretUnlock();
    showSection('secret');
  }

  function renderSecretUnlock() {
    const config = getSecretModeConfig();
    const total = activeSecretUnlockQuestions.length;
    const question = activeSecretUnlockQuestions[secretUnlockStep];
    secretProgress.textContent = `${config.badge} ${secretUnlockStep + 1}/${total}`;
    const judgeNote = getCarJudgeNote();
    secretHandoff.textContent = `Hand the phone to ${getTurnPlayerName(secretUnlockStep)}.${judgeNote ? ` ${judgeNote}` : ''}`;
    secretQuestion.textContent = question;
    secretInstructions.textContent = `Type the car's answer, perform the tiny ritual, and tap Car Agrees only if the passengers verify it.${judgeNote ? ` ${judgeNote}` : ''} No searching. No driver help.`;
    secretStatus.textContent = '';
    secretAnswer.value = '';
    secretAnswer.focus();
  }

  function submitSecretAnswer() {
    const answer = secretAnswer.value.trim();
    if (answer.length < 2) {
      secretStatus.textContent = 'Give the car a real answer before moving on.';
      return;
    }

    secretUnlockStep++;
    if (secretUnlockStep >= activeSecretUnlockQuestions.length) {
      unlockSecretMode();
      return;
    }
    renderSecretUnlock();
  }

  function skipSecretQuestion() {
    activeSecretUnlockQuestions.push(activeSecretUnlockQuestions.splice(secretUnlockStep, 1)[0]);
    renderSecretUnlock();
  }

  function unlockSecretMode() {
    const config = getSecretModeConfig();
    secretProgress.textContent = 'Unlocked';
    secretHandoff.textContent = 'Phone can return to the group.';
    secretQuestion.textContent = config.unlockTitle;
    secretInstructions.textContent = config.unlockText;
    secretStatus.textContent = '';
    secretAnswerField.hidden = true;
    secretSubmitButton.hidden = true;
    secretSkipButton.hidden = true;
    if (config.videoSrc) {
      secretVideo.src = config.videoSrc;
      secretVideoWrap.hidden = false;
    } else {
      secretVideo.src = '';
      secretVideoWrap.hidden = true;
    }
  }

  function resetSecretMode() {
    secretUnlockStep = 0;
    const config = getSecretModeConfig();
    activeSecretUnlockQuestions = shuffle(config.questions.slice()).slice(0, 5);
    secretVideo.src = '';
    secretVideoWrap.hidden = true;
    secretAnswerField.hidden = false;
    secretSubmitButton.hidden = false;
    secretSkipButton.hidden = false;
    renderSecretUnlock();
  }

  function renderModeRules(category) {
    const normalizedCategory = normalizeCategoryKey(category);
    selectedCategory = normalizedCategory;
    const rules = modeRuleCards[normalizedCategory];
    if (!rules) {
      launchSelectedMode();
      return;
    }
    modeRulesType.textContent = rules.type;
    modeRulesType.classList.toggle('scored', rules.scored);
    modeRulesHeading.textContent = rules.title;
    modeRulesSummary.textContent = rules.summary;
    modeRulesList.innerHTML = '';
    if (rules.bestWhen) {
      const li = document.createElement('li');
      li.className = 'best-when-rule';
      li.textContent = rules.bestWhen;
      modeRulesList.appendChild(li);
    }
    rules.rules.forEach(rule => {
      const li = document.createElement('li');
      li.textContent = rule;
      modeRulesList.appendChild(li);
    });
    modeRulesStartButton.textContent = category === 'learn'
      ? 'Choose Topic'
      : category === 'local'
        ? 'Choose Region'
        : `Start ${rules.title}`;
    showSection('rules');
  }

  function launchSelectedMode() {
    if (selectedCategory === 'local') {
      showSection('region');
    } else if (selectedCategory === 'scavenger') {
      startScavengerHunt();
    } else if (selectedCategory === 'learn') {
      renderLearnTopics();
      showSection('learnTopics');
    } else if (selectedCategory === 'trivia') {
      startTriviaRun();
    } else if (selectedCategory === 'jokes') {
      startJokeVote();
    } else if (selectedCategory === 'emoji') {
      startEmojiGame();
    } else if (selectedCategory === 'calculator') {
      startTripCalculator();
    } else if (selectedCategory === 'pi') {
      startPiChallenge();
    } else if (selectedCategory === 'pong') {
      startPongGame();
    } else if (selectedCategory === 'gorillas') {
      startGorillasGame();
    } else if (selectedCategory === 'puns') {
      startPunGenerator();
    } else if (selectedCategory === 'mentalist') {
      startMentalist();
    } else if (selectedCategory === 'twenty') {
      resetGame();
      showSection('scavenger');
      startTwentyQuestionsChooser();
    } else if (selectedCategory === 'hideSeek') {
      startHideSeekGame();
    } else {
      regionCode = '*';
      startAdventure();
    }
  }

  function startQuickStart(intent = 'surprise') {
    const modeSets = {
      laugh: ['jokes', 'puns', 'mentalist', 'look'],
      outside: ['look', 'local', 'scavenger'],
      learn: ['learn', 'trivia', 'pi'],
      scored: ['scavenger', 'trivia', 'pi', 'pong', 'gorillas'],
      surprise: ['random', 'scavenger', 'trivia', 'jokes', 'learn', 'look', 'pi', 'pong', 'hideSeek', 'gorillas'],
    };
    let quickModes = (modeSets[intent] || modeSets.surprise).slice();
    if (tripSettings.quietCar) {
      quickModes = quickModes.filter(mode => !['jokes', 'pong', 'hideSeek', 'gorillas'].includes(mode));
    }
    if (tripSettings.noCameraGames || tripSettings.quietCar) {
      quickModes = quickModes.filter(mode => mode !== 'emoji');
    }
    if (!quickModes.length) quickModes = ['learn', 'look', 'trivia'];
    const mode = quickModes[Math.floor(Math.random() * quickModes.length)];
    selectedCategory = mode;
    if (mode === 'scavenger') {
      startScavengerHunt();
    } else if (mode === 'trivia') {
      startTriviaRun();
      startTriviaCategory('mixed');
    } else if (mode === 'jokes') {
      startJokeVote();
    } else if (mode === 'pi') {
      startPiChallenge();
    } else if (mode === 'pong') {
      startPongGame();
    } else if (mode === 'gorillas') {
      startGorillasGame();
    } else if (mode === 'hideSeek') {
      startHideSeekGame();
    } else if (mode === 'learn') {
      selectedLearnTopic = 'all';
      setStoredJson('rtaLastLearnTopic', selectedLearnTopic);
      regionCode = '*';
      startAdventure();
    } else {
      regionCode = '*';
      startAdventure();
    }
  }

  function resetGame() {
    // Clear score and timers
    score = { look: 0, laugh: 0, learn: 0, compete: 0, local: 0 };
    currentIndex = 0;
    clearInterval(timerInterval);
    timerInterval = null;
    stopHideSeekTimer();
    timerRemaining = 0;
    hideTimerControls();
    nextButton.hidden = true;
    adventureQuestions = [];
  }

  // Event handlers
  accessibilityToggle.addEventListener('click', () => {
    accessibilityPanel.classList.toggle('show');
    accessibilityPanel.setAttribute('aria-hidden', accessibilityPanel.classList.contains('show') ? 'false' : 'true');
  });
  backButton.addEventListener('click', goBack);
  homeButton.addEventListener('click', goHome);
  closeAccessibility.addEventListener('click', () => {
    accessibilityPanel.classList.remove('show');
    accessibilityPanel.setAttribute('aria-hidden', 'true');
  });
  optionLargeText.addEventListener('change', e => {
    const val = e.target.checked;
    setPreference('largeText', val);
    body.classList.toggle('large-text', val);
  });
  optionHighContrast.addEventListener('change', e => {
    const val = e.target.checked;
    setPreference('highContrast', val);
    body.classList.toggle('high-contrast', val);
  });
  optionReduceMotion.addEventListener('change', e => {
    const val = e.target.checked;
    setPreference('reduceMotion', val);
    body.classList.toggle('reduce-motion', val);
  });
  saveTeamsButton.addEventListener('click', () => {
    savePlayers();
    showSection('category');
  });
  openTripSettingsButton.addEventListener('click', () => {
    populateTripSettingsForm();
    showSection('settings');
  });
  saveTripSettingsButton.addEventListener('click', saveTripSettings);
  closeTripSettingsButton.addEventListener('click', () => {
    showSection('category');
  });
  modeRulesStartButton.addEventListener('click', launchSelectedMode);
  modeRulesBackButton.addEventListener('click', () => {
    showSection('category');
  });
  addPlayerButton.addEventListener('click', () => {
    savePlayers();
    if (players.length >= 8) return;
    players.push({ id: `p${players.length + 1}`, name: getDefaultPlayerInitials(players.length) });
    renderPlayerFields();
  });
  removePlayerButton.addEventListener('click', () => {
    savePlayers();
    if (players.length <= 2) return;
    players.pop();
    renderPlayerFields();
  });

  // Setup section event delegation
  document.addEventListener('click', event => {
    const quickTarget = event.target.closest('button[data-quick-intent]');
    if (quickTarget) {
      const section = quickTarget.closest('.setup-section');
      if (section && section.id === 'setup-category') {
        startQuickStart(quickTarget.getAttribute('data-quick-intent'));
      }
      return;
    }
    const target = event.target.closest('button[data-category], button.option-card');
    if (!target) return;
    // Determine which section this belongs to
    const section = target.closest('.setup-section');
    if (!section) return;
    if (section.id === 'setup-category') {
      selectedCategory = normalizeCategoryKey(target.getAttribute('data-category'));
      if (selectedCategory === 'quickstart') {
        startQuickStart('surprise');
      } else {
        renderModeRules(selectedCategory);
      }
    } else if (section.id === 'setup-region') {
      regionCode = target.getAttribute('data-region');
      if (regionCode === 'random') {
        regionCode = pickRandomRegionCode();
      }
      startAdventure();
    }
  });

  function startAdventure() {
    resetGame();
    buildAdventure();
    showSection('adventure');
    showChallenge();
  }

  function pickRandomRegionCode() {
    const codes = Array.from(document.querySelectorAll('#setup-region [data-region]'))
      .map(button => button.getAttribute('data-region'))
      .filter(code => code && code !== 'random' && code !== '*');
    if (!codes.length) return '*';
    return codes[Math.floor(Math.random() * codes.length)];
  }

  nextButton.addEventListener('click', () => {
    stopTimer();
    hideTimerControls();
    currentIndex++;
    showChallenge();
  });

  extendTimerButton.addEventListener('click', () => {
    timerRemaining += 10;
    renderTimer();
  });

  skipTimerButton.addEventListener('click', () => {
    stopTimer('Timer skipped');
    extendTimerButton.hidden = true;
    skipTimerButton.hidden = true;
  });

  playAgainButton.addEventListener('click', () => {
    if (selectedCategory === 'scavenger') {
      startScavengerHunt();
      return;
    }
    if (selectedCategory === 'trivia') {
      startTriviaRun();
      return;
    }
    if (selectedCategory === 'jokes') {
      startJokeVote();
      return;
    }
    if (selectedCategory === 'emoji') {
      startEmojiGame();
      return;
    }
    if (selectedCategory === 'pi') {
      startPiChallenge();
      return;
    }
    if (selectedCategory === 'pong') {
      startPongGame();
      return;
    }
    if (selectedCategory === 'gorillas') {
      startGorillasGame();
      return;
    }
    if (selectedCategory === 'hideSeek') {
      startHideSeekGame();
      return;
    }
    if (selectedCategory === 'secret') {
      startSecretMode(activeSecretMode);
      return;
    }
    // Replay with same configuration
    resetGame();
    buildAdventure();
    showSection('adventure');
    showChallenge();
  });

  startOverButton.addEventListener('click', () => {
    goHome();
  });

  drawHuntTargetsButton.addEventListener('click', drawFreshHuntTargets);
  resetHuntButton.addEventListener('click', resetHunt);
  finishHuntButton.addEventListener('click', showHuntSummary);
  huntThemeButtons.addEventListener('click', event => {
    const button = event.target.closest('button[data-hunt-theme]');
    if (!button) return;
    setHuntTheme(button.dataset.huntTheme);
  });
  huntLightningButton.addEventListener('click', startLightningRound);
  huntTwentyButton.addEventListener('click', startTwentyQuestionsChooser);
  huntAlphabetButton.addEventListener('click', startAlphabetGame);
  huntEtaButton.addEventListener('click', startEtaGuess);
  showTriviaAnswerButton.addEventListener('click', () => {
    triviaAnswer.textContent = triviaAnswer.dataset.answer ? `Answer: ${triviaAnswer.dataset.answer}` : triviaAnswer.textContent;
    triviaAnswer.hidden = false;
    renderAwardButtons(triviaAwardButtons, 'Gets Override Point', awardTrivia, triviaQuestionAwarded);
  });
  triviaDifficultyButtons.addEventListener('click', event => {
    const button = event.target.closest('button[data-difficulty]');
    if (!button) return;
    activeTriviaDifficulty = button.dataset.difficulty;
    setStoredJson('rtaLastTriviaDifficulty', activeTriviaDifficulty);
    renderTriviaDifficultyButtons();
    if (!triviaPlay.hidden && activeTriviaCategory) {
      startTriviaCategory(activeTriviaCategory);
    }
  });
  nextTriviaButton.addEventListener('click', () => {
    triviaIndex++;
    showTriviaQuestion();
  });
  finishTriviaButton.addEventListener('click', showTriviaSummary);
  dadJokeAwardButton.addEventListener('click', () => {
    jokeAwards.dad++;
    nextJokeRound();
  });
  momJokeAwardButton.addEventListener('click', () => {
    jokeAwards.mom++;
    nextJokeRound();
  });
  brotherJokeAwardButton.addEventListener('click', () => {
    jokeAwards.brother++;
    nextJokeRound();
  });
  sisterJokeAwardButton.addEventListener('click', () => {
    jokeAwards.sister++;
    nextJokeRound();
  });
  nextJokesButton.addEventListener('click', nextJokeRound);
  finishJokesButton.addEventListener('click', showJokeSummary);
  punGenerateButton.addEventListener('click', renderPuns);
  punMoreButton.addEventListener('click', renderPuns);
  punInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      renderPuns();
    }
  });
  startCameraButton.addEventListener('click', startEmojiCamera);
  captureEmojiButton.addEventListener('click', captureEmojiFace);
  nextEmojiButton.addEventListener('click', nextEmojiPrompt);
  finishEmojiButton.addEventListener('click', showEmojiSummary);
  hideSeekStartButton.addEventListener('click', startHideSeekRound);
  hideSeekFoundButton.addEventListener('click', markHideSeekFound);
  hideSeekSpecialButton.addEventListener('click', useHideSeekSpecialAction);
  hideSeekSprintButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    hideSeekSprintButton.setPointerCapture(event.pointerId);
    setHideSeekInput('sprint', true);
  });
  hideSeekSprintButton.addEventListener('pointerup', event => {
    event.preventDefault();
    setHideSeekInput('sprint', false);
  });
  hideSeekSprintButton.addEventListener('pointercancel', () => setHideSeekInput('sprint', false));
  hideSeekSprintButton.addEventListener('lostpointercapture', () => setHideSeekInput('sprint', false));
  hideSeekNextButton.addEventListener('click', nextHideSeekRound);
  hideSeekDebugButton.addEventListener('click', toggleHideSeekDebug);
  if (hideSeekSoloButton) {
    hideSeekSoloButton.addEventListener('click', toggleHideSeekSolo);
    updateHideSeekSoloButton();
  }
  if (hideSeekAutoHideButton) hideSeekAutoHideButton.addEventListener('click', hideSeekAutoHide);
  if (hideSeekRevealButton) hideSeekRevealButton.addEventListener('click', hideSeekRevealHiddenSpot);
  if (hideSeekNextSpotButton) hideSeekNextSpotButton.addEventListener('click', hideSeekCycleSpot);
  if (hideSeekTestSpotsButton) hideSeekTestSpotsButton.addEventListener('click', hideSeekTestAllSpots);
  if (hideSeekClearDebugButton) hideSeekClearDebugButton.addEventListener('click', hideSeekClearDebug);
  if (hideSeekFullscreenButton) {
    hideSeekFullscreenButton.addEventListener('click', toggleHideSeekFullscreen);
  }
  renderHideSeekDebugPanel();
  updateHideSeekOrientationOverlay();
  window.addEventListener('orientationchange', updateHideSeekOrientationOverlay);
  window.addEventListener('resize', updateHideSeekOrientationOverlay);
  hideSeekResetButton.addEventListener('click', resetHideSeek);
  hideSeekFinishButton.addEventListener('click', showHideSeekSummary);
  hideSeekMode.addEventListener('change', () => {
    hideSeekState.mode = hideSeekMode.value;
    resetHideSeek();
  });
  hideSeekCountdown.addEventListener('change', () => {
    hideSeekState.difficulty = hideSeekCountdown.value || HIDE_SEEK_DEFAULT_DIFFICULTY;
    hideSeekState.searchesRemaining = getHideSeekSearchCount(hideSeekState.difficulty);
    renderHideSeek();
  });
  hideSeekWinner.addEventListener('change', () => {
    hideSeekState.winnerGoal = hideSeekWinner.value;
    renderHideSeek();
  });
  document.addEventListener('keydown', event => handleHideSeekKey(event, true));
  document.addEventListener('keyup', event => handleHideSeekKey(event, false));
  document.querySelectorAll('[data-hide-seek-move]').forEach(button => {
    const direction = button.dataset.hideSeekMove;
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      setHideSeekInput(direction, true);
    });
    button.addEventListener('pointerup', event => {
      event.preventDefault();
      setHideSeekInput(direction, false);
    });
    button.addEventListener('pointercancel', () => setHideSeekInput(direction, false));
    button.addEventListener('lostpointercapture', () => setHideSeekInput(direction, false));
  });
  if (hideSeekCanvas) {
    hideSeekCanvas.addEventListener('pointerdown', event => {
      hideSeekActiveCanvasPointerId = event.pointerId;
      hideSeekCanvas.setPointerCapture(event.pointerId);
      handleHideSeekPointer(event, { start: true });
      handleHideSeekCanvasDoubleTap(event);
    });
    hideSeekCanvas.addEventListener('pointermove', handleHideSeekPointer);
    hideSeekCanvas.addEventListener('pointerup', releaseHideSeekPointer);
    hideSeekCanvas.addEventListener('pointercancel', releaseHideSeekPointer);
    hideSeekCanvas.addEventListener('lostpointercapture', releaseHideSeekPointer);
  }
  calculateTripButton.addEventListener('click', calculateTripTime);
  calculatorSwapButton.addEventListener('click', swapCalculatorSpeeds);
  [calcMiles, calcSpeedA, calcSpeedB].forEach(input => {
    input.addEventListener('input', calculateTripTime);
  });
  savePiScoresButton.addEventListener('click', savePiScores);
  finishPiButton.addEventListener('click', showPiSummary);
  if (pongOpponentButtons) {
    pongOpponentButtons.addEventListener('click', event => {
      const button = event.target.closest('button[data-pong-opponent]');
      if (!button) return;
      pongSettings.opponentMode = button.dataset.pongOpponent;
      renderPongSettings();
      if (pongState) resetPongGame();
    });
  }
  if (pongDifficultyButtons) {
    pongDifficultyButtons.addEventListener('click', event => {
      const button = event.target.closest('button[data-pong-difficulty]');
      if (!button) return;
      pongSettings.difficulty = button.dataset.pongDifficulty;
      renderPongSettings();
      if (pongState) resetPongGame();
    });
  }
  pongStartButton.addEventListener('click', startPongRound);
  pongFullscreenButton.addEventListener('click', togglePongFullscreen);
  if (pongImmersiveExitButton) {
    pongImmersiveExitButton.addEventListener('click', togglePongFullscreen);
  }
  if (pongDebugButton) {
    pongDebugButton.addEventListener('click', togglePongDebug);
    updatePongDebugButton();
  }
  pongResetButton.addEventListener('click', resetPongGame);
  pongFinishButton.addEventListener('click', showPongSummary);
  if (pongCanvas) {
    pongCanvas.addEventListener('pointerdown', event => {
      pongCanvas.setPointerCapture(event.pointerId);
      handlePongPointer(event);
    });
    pongCanvas.addEventListener('pointermove', handlePongPointer);
    pongCanvas.addEventListener('pointerup', releasePongPointer);
    pongCanvas.addEventListener('pointercancel', releasePongPointer);
  }
  document.addEventListener('keydown', event => {
    if (currentSectionKey !== 'pong') return;
    if (event.key === '`') {
      event.preventDefault();
      togglePongDebug();
      return;
    }
    if (event.key === 'w' || event.key === 'W') pongKeys.leftUp = true;
    if (event.key === 's' || event.key === 'S') pongKeys.leftDown = true;
    if (pongSettings.opponentMode === 'local') {
      if (event.key === 'ArrowUp') pongKeys.rightUp = true;
      if (event.key === 'ArrowDown') pongKeys.rightDown = true;
    }
  });
  document.addEventListener('keyup', event => {
    if (event.key === 'w' || event.key === 'W') pongKeys.leftUp = false;
    if (event.key === 's' || event.key === 'S') pongKeys.leftDown = false;
    if (pongSettings.opponentMode === 'local') {
      if (event.key === 'ArrowUp') pongKeys.rightUp = false;
      if (event.key === 'ArrowDown') pongKeys.rightDown = false;
    }
  });
  document.addEventListener('fullscreenchange', updatePongFullscreenButton);
  document.addEventListener('fullscreenchange', updateGorillasFullscreenButton);
  document.addEventListener('fullscreenchange', updateHideSeekFullscreenButton);
  document.addEventListener('fullscreenchange', updateHideSeekOrientationOverlay);
  document.addEventListener('webkitfullscreenchange', updatePongFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateGorillasFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateHideSeekFullscreenButton);
  if (appLogo) appLogo.addEventListener('click', handleLogoClick);
  if (closeLogoPrankButton) {
    closeLogoPrankButton.addEventListener('click', () => {
      logoPrank.hidden = true;
    });
  }
  document.addEventListener('click', event => {
    const adminButton = event.target.closest('button[data-admin-launch]');
    if (adminButton) {
      launchAdminMode(adminButton.dataset.adminLaunch);
      return;
    }
    const adminActionButton = event.target.closest('button[data-admin-action]');
    if (adminActionButton) {
      handleAdminAction(adminActionButton.dataset.adminAction);
    }
  });
  gorillasFireButton.addEventListener('click', fireGorillasShot);
  if (gorillasQuickShotButton) {
    gorillasQuickShotButton.addEventListener('click', quickGorillasShot);
  }
  gorillasFullscreenButton.addEventListener('click', toggleGorillasFullscreen);
  if (gorillasDebugButton) {
    gorillasDebugButton.addEventListener('click', () => {
      gorillasSettings.debug = !gorillasSettings.debug;
      saveGorillasSettings();
      populateGorillasSettings();
      if (gorillasState) drawGorillas();
    });
  }
  if (gorillasImmersiveExitButton) {
    gorillasImmersiveExitButton.addEventListener('click', toggleGorillasFullscreen);
  }
  gorillasResetButton.addEventListener('click', resetGorillasGame);
  gorillasFinishButton.addEventListener('click', showGorillasSummary);
  [gorillasAngle, gorillasPower].forEach(input => {
    input.addEventListener('input', () => {
      normalizeGorillasInputs();
      renderGorillasControls();
      if (gorillasState && !gorillasState.projectile && !gorillasState.winner) drawGorillas();
    });
  });
  [gorillasOpponent, gorillasMatch, gorillasDifficulty].forEach(input => {
    if (!input) return;
    input.addEventListener('change', () => {
      saveGorillasSettings();
      renderGorillasControls();
      if (gorillasState && !gorillasState.projectile) {
        drawGorillas();
        maybeStartGorillasComputerTurn();
      }
    });
  });
  document.addEventListener('click', event => {
    const angleButton = event.target.closest('button[data-banana-angle]');
    const powerButton = event.target.closest('button[data-banana-power]');
    if (!angleButton && !powerButton) return;
    if (!sections.gorillas || !sections.gorillas.contains(event.target)) return;
    if (gorillasState && (gorillasState.projectile || gorillasState.winner || isGorillasComputerTurn())) return;
    if (angleButton) {
      gorillasAngle.value = String((Number(gorillasAngle.value) || 45) + Number(angleButton.dataset.bananaAngle || 0));
    }
    if (powerButton) {
      gorillasPower.value = String((Number(gorillasPower.value) || 70) + Number(powerButton.dataset.bananaPower || 0));
    }
    normalizeGorillasInputs();
    renderGorillasControls();
    if (gorillasState) drawGorillas();
  });
  document.addEventListener('keydown', event => {
    if (currentSectionKey !== 'gorillas' || event.key !== '`') return;
    event.preventDefault();
    gorillasSettings.debug = !gorillasSettings.debug;
    saveGorillasSettings();
    populateGorillasSettings();
    if (gorillasState) drawGorillas();
  });
  secretSubmitButton.addEventListener('click', submitSecretAnswer);
  secretSkipButton.addEventListener('click', skipSecretQuestion);
  secretResetButton.addEventListener('click', resetSecretMode);
  secretAnswer.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitSecretAnswer();
    }
  });

  aboutButton.addEventListener('click', () => {
    aboutModal.hidden = false;
    // Trap focus inside the modal
    closeAbout.focus();
  });
  closeAbout.addEventListener('click', () => {
    aboutModal.hidden = true;
    aboutButton.focus();
  });
  feedbackButton.addEventListener('click', () => {
    feedbackModal.hidden = false;
    feedbackStatus.textContent = '';
    feedbackText.focus();
  });
  copyFeedbackButton.addEventListener('click', async () => {
    const text = feedbackText.value.trim();
    if (!text) {
      feedbackStatus.textContent = 'Add a little feedback first.';
      return;
    }
    const feedbackPayload = feedbackDeviceInfo && feedbackDeviceInfo.checked
      ? `${text}${getDeviceFeedbackInfo()}`
      : text;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(feedbackPayload);
      } else {
        feedbackText.value = feedbackPayload;
        feedbackText.select();
        document.execCommand('copy');
      }
      feedbackStatus.textContent = 'Copied. Paste it wherever you want to send it.';
    } catch (error) {
      feedbackStatus.textContent = 'Copy failed. Select the text and copy it manually.';
    }
  });
  closeFeedbackButton.addEventListener('click', () => {
    feedbackModal.hidden = true;
    feedbackButton.focus();
  });

  // Hide modal on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!aboutModal.hidden) {
        aboutModal.hidden = true;
        aboutButton.focus();
      }
      if (!feedbackModal.hidden) {
        feedbackModal.hidden = true;
        feedbackButton.focus();
      }
      if (logoPrank && !logoPrank.hidden) {
        logoPrank.hidden = true;
      }
      if (accessibilityPanel.classList.contains('show')) {
        accessibilityPanel.classList.remove('show');
        accessibilityPanel.setAttribute('aria-hidden', 'true');
        accessibilityToggle.focus();
      }
    }
  });

  window.addEventListener('popstate', event => {
    const state = event.state;
    if (!state || !state.rta || !state.sectionKey || !sections[state.sectionKey]) return;
    syncingBrowserHistory = true;
    sectionHistory = Array.isArray(state.sectionHistory) ? state.sectionHistory.slice() : [];
    showSection(state.sectionKey, { replace: true, skipBrowserHistory: true });
    syncingBrowserHistory = false;
  });

  // Start the app after a short delay to display the loading screen
  window.addEventListener('beforeunload', () => {
    stopEmojiCamera();
    stopPong();
    stopGorillas();
  });
  window.addEventListener('load', () => {
    initPreferences();
    initSavedUserData();
    tripSettings = normalizeTripSettings(tripSettings);
    populateTripSettingsForm();
    renderPongSettings();
    populateGorillasSettings();
    applyTripSettings();
    renderPlayerFields();
    passengerConfirmButton.addEventListener('click', confirmPassengerStatus);
    maybeOpenDeveloperLab();
    if (loadingScreen.style.display !== 'none') {
      passengerConfirmButton.focus();
    }
  });
})();

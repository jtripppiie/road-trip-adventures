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
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return stored === 'true';
  }

  /**
   * Save a boolean preference to localStorage.
   * @param {string} key
   * @param {boolean} value
   */
  function setPreference(key, value) {
    localStorage.setItem(key, value ? 'true' : 'false');
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

  // Sample data set.  Extend this array in questions.json or by modifying
  // this script.  Each entry has:
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
      text: 'Can you spot a palm tree?',
      points: 1,
    },
    {
      id: 'look-license-plate',
      category: 'look',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Find a license plate from another state.',
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
      text: 'Color hunt: spot something red, yellow, green, blue, and white outside.',
      points: 1,
    },
    {
      id: 'look-tiny-detail',
      category: 'look',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Everyone quietly looks outside for 20 seconds, then shares the smallest detail they noticed.',
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
      text: 'Name five animals as fast as you can!',
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
      text: 'First to five: name five things you might pack for a dream road trip.',
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
      id: 'local-anywhere-town-name',
      category: 'local',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Find a town, exit, or street name. Guess why it might have that name.',
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
    };
  }

  const adventurePromptDatabase = questions
    .concat(window.RTA_ADVENTURE_PROMPTS || [])
    .map(normalizeAdventurePrompt);
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
    { category: 'geography', question: 'What is the most remote place in the lower 48 states often cited by map researchers?', answer: 'A spot in Yellowstone National Park, far from any road.', choices: ['A spot in Yellowstone National Park, far from any road.', 'The bottom of the Grand Canyon.', 'The middle of Death Valley.', 'A beach on Cape Cod.'] },
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
    'weirdlaws-in-georgia-what-animal-is-famously-not-allowed-to-be-tied-to-a-telepho',
    'weirdlaws-in-georgia-what-animal-was-once-prohibited-from-being-tied-to-a-teleph',
    'weirdlaws-in-ohio-what-animal-is-commonly-cited-as-illegal-to-get-drunk',
    'weirdlaws-in-west-virginia-what-animal-is-commonly-cited-in-a-law-about-roadkill',
    'weirdlaws-in-west-virginia-what-can-legally-become-dinner-if-reported',
    'general-roulette-sum',
    'food-guinness-origin',
    'food-pina-colada',
    'food-bond-drink',
    'food-mageirocophobia',
    'food-fancy-sauce',
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
  let adventureHistory = getStoredJson('rtaAdventureHistory', {});
  const defaultTripSettings = {
    gameLength: 'long',
    tripPreset: 'any',
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
  let selectedAge = 'mixed';
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
  let jokePlayerScores = {};
  let jokeAwards = { dad: 0, mom: 0 };
  let jokeRound = 1;
  let twentyQuestionsCount = 0;
  let twentyQuestionsDeck = [];
  let twentyQuestionsAnswers = [];
  let lightningDeck = [];
  let alphabetTheme = null;
  let alphabetIndex = 0;
  let hideSeekRound = 0;
  let hideSeekTimerInterval = null;
  let hideSeekAnimationFrame = null;
  let hideSeekLastFrame = 0;
  let hideSeekAudioContext = null;
  let hideSeekDebugEnabled = getStoredJson('rtaHideSeekDebug', false);
  const HIDE_SEEK_HIDE_SECONDS = 60;
  const HIDE_SEEK_DEFAULT_SEARCH_SECONDS = 120;
  const HIDE_SEEK_SEARCH_TOLERANCE = 34;
  const HIDE_SEEK_WRONG_SEARCH_PENALTY = 10;
  const HIDE_SEEK_INSPECT_SECONDS = 1.1;
  const HIDE_SEEK_MAX_HINTS = 3;
  const HIDE_SEEK_MAX_STAMINA = 100;
  const HIDE_SEEK_SPRINT_SPEED_MULTIPLIER = 1.45;
  const HIDE_SEEK_SPAM_INSPECTION_PENALTY = 6;
  const HIDE_SEEK_SUSPICION_DISTANCE = 135;
  let hideSeekState = {
    mode: 'roadside-lodge',
    countdown: HIDE_SEEK_DEFAULT_SEARCH_SECONDS,
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
    hintsRemaining: HIDE_SEEK_MAX_HINTS,
    noiseLevel: 0,
    stamina: HIDE_SEEK_MAX_STAMINA,
    suspicionSpotId: null,
    suspicionLevel: 0,
    inspectedSpotId: null,
    inspectTime: 0,
    inspectionCount: 0,
    repeatInspectionCount: 0,
    peekCount: 0,
    activeRoomId: 'lobby',
    timerRemaining: HIDE_SEEK_DEFAULT_SEARCH_SECONDS,
    hiderTimeRemaining: HIDE_SEEK_HIDE_SECONDS,
    wrongGuesses: 0,
    roundHiderScore: 0,
    roundSeekerScore: 0,
    lastRoundText: '',
    message: '',
    hideScore: {},
    actors: {
      hider: { x: 120, y: 300, width: 24, height: 32, speed: 150, roomId: 'lobby', visible: true, color: '#2ec7d3' },
      seeker: { x: 120, y: 300, width: 24, height: 32, speed: 150, roomId: 'lobby', visible: false, color: '#f58220' },
    },
    input: { up: false, down: false, left: false, right: false, sprint: false },
    revealPulse: 0,
    searchPulse: null,
    listenPulse: null,
    listenHint: null,
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
  let gorillasAnimationFrame = null;
  let gorillasRunning = false;
  let gorillasState = null;
  let gorillasTurn = 0;
  let gorillasLastFrameTs = 0;
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
  const jokeScoreboard = document.getElementById('joke-scoreboard');
  const jokeRoundElement = document.getElementById('joke-round');
  const jokePrompt = document.getElementById('joke-prompt');
  const jokeAward = document.getElementById('joke-award');
  const jokeAwardButtons = document.getElementById('joke-award-buttons');
  const dadJokeAwardButton = document.getElementById('dad-joke-award');
  const momJokeAwardButton = document.getElementById('mom-joke-award');
  const finishJokesButton = document.getElementById('finish-jokes');
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
  const hideSeekAssets = document.getElementById('hide-seek-assets');
  const hideSeekCanvas = document.getElementById('hide-seek-canvas');
  const hideSeekCanvasContext = hideSeekCanvas ? hideSeekCanvas.getContext('2d') : null;
  const hideSeekOverlay = document.getElementById('hide-seek-overlay');
  const hideSeekStartButton = document.getElementById('hide-seek-start');
  const hideSeekFoundButton = document.getElementById('hide-seek-found');
  const hideSeekSpecialButton = document.getElementById('hide-seek-special');
  const hideSeekSprintButton = document.getElementById('hide-seek-sprint');
  const hideSeekNextButton = document.getElementById('hide-seek-next');
  const hideSeekDebugButton = document.getElementById('hide-seek-debug');
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
  const pongResetButton = document.getElementById('pong-reset');
  const pongFinishButton = document.getElementById('pong-finish');
  const gorillasCanvas = document.getElementById('gorillas-canvas');
  const gorillasScore = document.getElementById('gorillas-score');
  const gorillasStatus = document.getElementById('gorillas-status');
  const gorillasAngle = document.getElementById('gorillas-angle');
  const gorillasPower = document.getElementById('gorillas-power');
  const gorillasFireButton = document.getElementById('gorillas-fire');
  const gorillasFullscreenButton = document.getElementById('gorillas-fullscreen');
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
      summary: 'Keep a small target list active and race to spot things outside.',
      rules: [
        'The app shows 4 or 5 targets at a time.',
        'First player to clearly spot a target gets 1 point.',
        'A judge can settle close calls. First to the milestone unlocks karaoke power.',
      ],
    },
    learn: {
      title: 'Learn Something',
      type: 'Just for fun',
      scored: false,
      summary: 'Short facts and mini-lessons to pass around the car.',
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
      summary: 'Turn-based multiple choice trivia with automatic scoring.',
      rules: [
        'The app names whose turn it is.',
        'That player chooses an answer. Correct choice gives 1 point automatically.',
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
    laugh: {
      title: 'Car Laughs',
      type: 'Just for fun',
      scored: false,
      summary: 'Silly prompts for voices, stories, and quick bits.',
      rules: [
        'Read the prompt aloud.',
        'Everyone plays if they want to.',
        'Tap Stamp It when the moment is done.',
      ],
    },
    compete: {
      title: 'Quick Challenges',
      type: 'Just for fun',
      scored: false,
      summary: 'Tiny car challenges with group judgment instead of a saved scoreboard.',
      rules: [
        'Read the challenge aloud.',
        'The car decides the winner for that prompt.',
        'Use it for quick laughs, not serious scoring.',
      ],
    },
    jokes: {
      title: 'Joke Vote',
      type: 'Scored Game',
      scored: true,
      summary: 'Players tell clean jokes and vote for the round winner.',
      rules: [
        'Each round has a joke prompt.',
        'Tap the player who wins the round.',
        'Dad Joke and Mom Joke awards are separate style awards.',
      ],
    },
    emoji: {
      title: 'Emoji Face-Off',
      type: 'Scored Game',
      scored: true,
      summary: 'Players copy an emoji face and the car votes for the closest match.',
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
      rules: [
        'Choose a map, search timer, and match length.',
        'The hider moves first while the seeker looks away.',
        'The seeker inspects hiding spots. Wrong guesses cost time.',
        'Roles rotate each round and both hiding and seeking earn points.',
      ],
    },
    random: {
      title: 'Surprise Me',
      type: 'Mixed',
      scored: false,
      summary: 'A mixed prompt run for when nobody wants to pick a mode.',
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
      summary: 'Choose a local match or a computer opponent, then pick how mean the AI should be.',
      rules: [
        'Choose local player or computer before starting.',
        'Pick a difficulty from easy to death match.',
        'Drag your paddle with a finger or pointer.',
        'First side to the target score wins.',
        'Death Match AI is meant to be nearly impossible to beat.',
      ],
    },
    gorillas: {
      title: 'Banana Towers',
      type: 'Scored Game',
      scored: true,
      summary: 'A simple turn-based banana toss game with city buildings and friendly chaos.',
      rules: [
        'Each player chooses an angle and power on their turn.',
        'The banana arcs over the buildings and can hit the opponent.',
        'Direct hits score a point and start the next turn.',
        'First to 5 wins the round.',
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
    merged.noCameraGames = Boolean(merged.noCameraGames);
    merged.noPopCulture = Boolean(merged.noPopCulture);
    merged.hardTrivia = Boolean(merged.hardTrivia);
    return merged;
  }

  function populateTripSettingsForm() {
    tripSettings = normalizeTripSettings(tripSettings);
    settingGameLength.value = tripSettings.gameLength;
    settingTripPreset.value = tripSettings.tripPreset;
    settingNoCamera.checked = tripSettings.noCameraGames;
    settingNoPopCulture.checked = tripSettings.noPopCulture;
    settingHardTrivia.checked = tripSettings.hardTrivia;
  }

  function saveTripSettings() {
    tripSettings = normalizeTripSettings({
      gameLength: settingGameLength.value,
      tripPreset: settingTripPreset.value,
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
    const emojiButton = document.querySelector('[data-category="emoji"]');
    if (emojiButton) {
      emojiButton.hidden = tripSettings.noCameraGames;
      emojiButton.disabled = tripSettings.noCameraGames;
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
    return question.ageGroups.indexOf('*') !== -1 || question.ageGroups.indexOf(selectedAge) !== -1 || question.ageGroups.indexOf('mixed') !== -1;
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
      { category: 'look', count: Math.ceil(count * 0.4) },
      { category: 'laugh', count: Math.ceil(count * 0.3) },
      { category: 'learn', count: Math.max(1, Math.floor(count * 0.2)) },
      { category: 'compete', count: Math.max(1, Math.floor(count * 0.1)) },
    ];
    const selected = [];
    targets.forEach(target => {
      const pool = shuffle(adventurePromptDatabase.filter(q => matchesAge(q) && q.category === target.category && matchesRegion(q)));
      selected.push(...selectAdventurePrompts(pool, target.count, getAdventureHistoryKey('random', target.category)));
    });
    const selectedIds = selected.map(q => q.id);
    const refill = shuffle(adventurePromptDatabase.filter(q => matchesAge(q) && matchesRegion(q) && selectedIds.indexOf(q.id) === -1));
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
    challengeContainer.appendChild(badge);
    challengeContainer.appendChild(p);
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
    const note = document.createElement('li');
    note.textContent = 'Prompt games do not use scores. Scored games still keep their own winner rules.';
    summaryList.appendChild(note);
    progressFill.style.width = '100%';
  }

  function getHuntClaims() {
    return scavengerItems.filter(item => item.claimedBy);
  }

  function getActiveHuntItems() {
    return activeHuntIds
      .map(itemId => scavengerItems.find(item => item.id === itemId))
      .filter(Boolean);
  }

  function getHuntItemSearchText(item) {
    return `${item.id || ''} ${item.label || ''} ${item.hint || ''}`.toLowerCase();
  }

  function huntItemMatchesTheme(item, theme) {
    if (theme === 'mixed') return true;
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

  function buildHuntDeck() {
    const unclaimedItems = scavengerItems.filter(item => !item.claimedBy);
    const themedItems = activeHuntTheme === 'mixed'
      ? unclaimedItems.filter(huntItemMatchesTripPreset)
      : unclaimedItems.filter(item => huntItemMatchesTheme(item, activeHuntTheme) && huntItemMatchesTripPreset(item));
    const deckItems = themedItems.length ? themedItems : unclaimedItems;
    huntDeck = shuffle(deckItems.map(item => item.id));
  }

  function getHuntBatchSize() {
    return tripSettings.gameLength === 'short' ? 4 : 5;
  }

  function drawHuntTargets(count = getHuntBatchSize()) {
    if (!huntDeck.length) buildHuntDeck();
    activeHuntIds.forEach(itemId => {
      const item = scavengerItems.find(entry => entry.id === itemId);
      if (item && !item.claimedBy && !huntDeck.includes(itemId)) {
        huntDeck.unshift(itemId);
      }
    });
    activeHuntIds = [];
    while (activeHuntIds.length < count && huntDeck.length) {
      const nextId = huntDeck.pop();
      const item = scavengerItems.find(entry => entry.id === nextId);
      if (item && !item.claimedBy && !activeHuntIds.includes(nextId)) {
        activeHuntIds.push(nextId);
      }
    }
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
    const item = scavengerItems.find(entry => entry.id === itemId);
    if (!item || item.claimedBy) return;
    item.claimedBy = playerId;
    activeHuntIds = activeHuntIds.filter(id => id !== itemId);
    renderHunt();
  }

  function resetHunt() {
    scavengerItems.forEach(item => {
      delete item.claimedBy;
    });
    buildHuntDeck();
    activeHuntIds = [];
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

  function startTwentyQuestions() {
    twentyQuestionsCount = 0;
    twentyQuestionsAnswers = [];
    twentyQuestionsDeck = [
      {
        question: 'Is it alive?',
        yes: 'That points toward an animal, plant, person, or character.',
        no: 'That pushes the guessers toward objects, places, materials, ideas, or events.',
        mixed: 'That means it may depend on the example, so keep both living and non-living options open.',
      },
      {
        question: 'Is it something a person can hold?',
        yes: 'That narrows it toward smaller objects, foods, tools, toys, or materials.',
        no: 'That points toward places, large objects, natural features, vehicles, events, or ideas.',
        mixed: 'That suggests size or form changes, so ask about where it is found next.',
      },
      {
        question: 'Would you usually find it indoors?',
        yes: 'That leans toward household objects, foods, technology, furniture, or entertainment.',
        no: 'That leans toward nature, places, vehicles, buildings, weather, or roadside things.',
        mixed: 'That means location will not solve it alone, so move to use or material.',
      },
      {
        question: 'Is it bigger than a backpack?',
        yes: 'That removes many handheld items and points toward large objects, places, animals, or vehicles.',
        no: 'That keeps small objects, foods, tools, toys, and body-sized things in play.',
        mixed: 'That suggests it comes in different sizes, so ask what it is made of or used for.',
      },
      {
        question: 'Is it made by humans?',
        yes: 'That points toward inventions, buildings, vehicles, tools, foods, media, or household objects.',
        no: 'That points toward animals, plants, natural materials, weather, space, or landforms.',
        mixed: 'That suggests it can be natural or manufactured, so ask about its usual use.',
      },
      {
        question: 'Is it used for fun?',
        yes: 'That points toward games, toys, sports, music, movies, shows, or vacation things.',
        no: 'That points toward practical objects, places, natural things, jobs, or facts.',
        mixed: 'That means it may be both useful and fun, so ask about daily use.',
      },
      {
        question: 'Is it connected to food or drinks?',
        yes: 'That narrows the field to foods, ingredients, restaurants, kitchen items, or farming.',
        no: 'That removes a big category and helps the guessers focus elsewhere.',
        mixed: 'That may mean it is a place, container, ingredient, or brand connected to food.',
      },
      {
        question: 'Can it move by itself?',
        yes: 'That points toward living things, vehicles, machines, robots, or natural forces.',
        no: 'That points toward still objects, places, materials, ideas, and most foods.',
        mixed: 'That suggests it can move in some situations, so ask whether it needs power or a person.',
      },
      {
        question: 'Is it famous or well known?',
        yes: 'That points toward landmarks, celebrities, characters, major brands, movies, events, or famous places.',
        no: 'That points toward ordinary objects, local things, materials, or everyday categories.',
        mixed: 'That may depend on the person, so ask whether kids or adults would know it.',
      },
      {
        question: 'Would you see it on a road trip?',
        yes: 'That points toward vehicles, signs, places, scenery, weather, roadside stops, or travel objects.',
        no: 'That points away from the road and toward indoor, imaginary, historical, or specialized things.',
        mixed: 'That means it can appear on trips but is not mainly a road-trip thing.',
      },
      {
        question: 'Is it a place?',
        yes: 'That shifts the hunt toward cities, landmarks, parks, buildings, states, countries, or imaginary worlds.',
        no: 'That keeps objects, living things, foods, people, events, technologies, and ideas in play.',
        mixed: 'That may mean it is both a place and a thing, such as a brand, ride, or fictional setting.',
      },
      {
        question: 'Is it a person or character?',
        yes: 'That points toward real people, fictional characters, occupations, mascots, or historical figures.',
        no: 'That removes people and characters, so focus on objects, places, foods, nature, or inventions.',
        mixed: 'That suggests it may be represented as a mascot, brand character, statue, or role.',
      },
      {
        question: 'Does it use electricity?',
        yes: 'That points toward technology, appliances, vehicles, devices, lights, or entertainment.',
        no: 'That points toward natural things, simple objects, foods, places, or older inventions.',
        mixed: 'That means some versions use electricity and some do not, so ask about common examples.',
      },
      {
        question: 'Is it mostly one color?',
        yes: 'That makes color a useful clue. Ask which color family next if the group needs it.',
        no: 'That means shape, use, place, or material will be better clues than color.',
        mixed: 'That suggests it can appear in many versions, so avoid guessing by color alone.',
      },
      {
        question: 'Would most kids know what it is?',
        yes: 'That points toward common objects, animals, foods, characters, places, or school topics.',
        no: 'That points toward specialized knowledge, history, jobs, obscure places, or adult categories.',
        mixed: 'That depends on experience, so ask whether it is common at home, school, or outside.',
      },
      {
        question: 'Is it something from nature?',
        yes: 'That points toward animals, plants, rocks, weather, water, space, landforms, or materials like sand.',
        no: 'That points toward human-made objects, places, technology, media, occupations, or events.',
        mixed: 'That may mean humans use or shape a natural material, so ask if it is made by humans too.',
      },
      {
        question: 'Is it expensive?',
        yes: 'That points toward vehicles, technology, jewelry, travel, buildings, collectibles, or rare things.',
        no: 'That points toward common objects, foods, natural materials, ideas, or everyday items.',
        mixed: 'That means price varies, so cost probably will not identify it by itself.',
      },
      {
        question: 'Can it make sound?',
        yes: 'That points toward animals, people, machines, instruments, vehicles, media, or alarms.',
        no: 'That points toward silent objects, places, materials, foods, and many natural features.',
        mixed: 'That suggests it may make sound only when used, moved, or powered.',
      },
      {
        question: 'Is it used every day?',
        yes: 'That points toward common household objects, foods, clothing, tools, devices, or routines.',
        no: 'That points toward special events, landmarks, rare objects, vacation things, or unusual categories.',
        mixed: 'That depends on the person, so think about who would use or see it often.',
      },
      {
        question: 'Is it smaller than a phone?',
        yes: 'That points toward tiny objects, ingredients, parts, toys, tools, insects, or materials.',
        no: 'That points toward larger objects, places, people, animals, vehicles, or natural features.',
        mixed: 'That suggests it comes in different forms, so make the best final guess from all clues.',
      },
    ];
    showHuntSideGame(
      '20 Questions',
      'Secret Thing',
      'Think of anything you would like. Do not tell anyone what it is. The guessers get 20 total turns for questions and guesses. Example secret: sand.',
      [
        { label: 'Start Asking', primary: true, onClick: () => showTwentyQuestionsPrompt('Start broad, then narrow down from the answers.') },
        { label: 'Close', onClick: hideHuntSideGame },
      ]
    );
  }

  function showTwentyQuestionsPrompt(reasoning) {
    if (twentyQuestionsCount >= 20) {
      showTwentyQuestionsFinalGuess('You used all 20 turns. Make one final group guess from the clues.');
      return;
    }

    const item = twentyQuestionsDeck[twentyQuestionsCount] || twentyQuestionsDeck[twentyQuestionsDeck.length - 1];
    const history = formatTwentyQuestionsHistory();
    const intro = `${reasoning}\n\nTurn ${twentyQuestionsCount + 1}/20 question: ${item.question}${history}`;
    const responseActions = ['Yes', 'No', 'Usually', 'Sometimes', 'Don\'t Know'].map(answer => ({
      label: answer,
      onClick: () => {
        twentyQuestionsAnswers.push({ question: item.question, answer });
        twentyQuestionsCount++;
        showTwentyQuestionsPrompt(getTwentyQuestionsReasoning(item, answer));
      },
    }));
    showHuntSideGame('20 Questions', 'Guess What I Am', intro, responseActions.concat([
      { label: 'Make a Guess', primary: true, onClick: showTwentyQuestionsGuess },
      { label: 'Start Over', onClick: startTwentyQuestions },
      { label: 'Close', onClick: hideHuntSideGame },
    ]));
  }

  function getTwentyQuestionsReasoning(item, answer) {
    if (answer === 'Yes') return `Reasoning: ${item.yes}`;
    if (answer === 'No') return `Reasoning: ${item.no}`;
    return `Reasoning: ${item.mixed}`;
  }

  function formatTwentyQuestionsHistory() {
    if (!twentyQuestionsAnswers.length) return '';
    const start = Math.max(0, twentyQuestionsAnswers.length - 4);
    const recent = twentyQuestionsAnswers.slice(start).map((entry, index) => {
      const turn = start + index + 1;
      return `${turn}. ${entry.question} ${entry.answer}`;
    });
    return `\n\nRecent clues:\n${recent.join('\n')}`;
  }

  function showTwentyQuestionsGuess() {
    if (twentyQuestionsCount >= 20) {
      showTwentyQuestionsFinalGuess('No turns remain. Make the final guess now.');
      return;
    }

    showHuntSideGame(
      '20 Questions',
      `Guess Turn ${twentyQuestionsCount + 1}/20`,
      `Say one specific guess out loud. For example: "Is it sand?" The thinker answers only correct or wrong.${formatTwentyQuestionsHistory()}`,
      [
        { label: 'Correct Guess', primary: true, onClick: () => showTwentyQuestionsResult(true) },
        { label: 'Wrong Guess', onClick: () => {
          twentyQuestionsAnswers.push({ question: 'Guess attempt', answer: 'Wrong' });
          twentyQuestionsCount++;
          showTwentyQuestionsPrompt('Reasoning: that guess is ruled out, so use the remaining clues to narrow the next question.');
        } },
        { label: 'Ask More', onClick: () => showTwentyQuestionsPrompt('Ask another narrowing question before guessing.') },
      ]
    );
  }

  function showTwentyQuestionsFinalGuess(message) {
    showHuntSideGame(
      '20 Questions',
      'Final Guess',
      `${message}${formatTwentyQuestionsHistory()}`,
      [
        { label: 'Correct', primary: true, onClick: () => showTwentyQuestionsResult(true) },
        { label: 'Missed It', onClick: () => showTwentyQuestionsResult(false) },
        { label: 'Start Over', onClick: startTwentyQuestions },
      ]
    );
  }

  function showTwentyQuestionsResult(solved) {
    const turnsUsed = Math.min(20, Math.max(1, twentyQuestionsCount + 1));
    const summary = solved
      ? `Solved in ${turnsUsed} turn${turnsUsed === 1 ? '' : 's'}. The guessers used the clues to identify the secret thing.`
      : 'The secret survived all 20 questions. The thinker reveals it and explains which clues mattered most.';
    showHuntSideGame('20 Questions', solved ? 'Solved' : 'Stumped', `${summary}${formatTwentyQuestionsHistory()}`, [
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

  const hideSeekMaps = window.RTA_HIDE_SEEK_MAPS || {};

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
    const spots = room.spots || [];
    if (spots.length < 4) return false;
    const spotIndex = spots.findIndex(item => item.id === spot.id);
    const roundSeed = hideSeekRound + hideSeekState.hiderIndex + hideSeekState.seekerIndex + room.id.length;
    return spotIndex === roundSeed % spots.length;
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
    actor.x = Math.max(38, Math.min(738, spot.x + spot.width / 2 - actor.width / 2));
    actor.y = Math.max(62, Math.min(382, spot.y + spot.height / 2 - actor.height / 2));
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
      const radius = spot.interactionRadius || 42;
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
    const radius = nearbySpot.interactionRadius || 42;
    const closeness = Math.max(0, 1 - (nearbySpot.distance || 0) / radius);
    const score = Math.max(1, Math.min(5, Math.round((nearbySpot.difficulty || 3) * 0.72 + closeness * 2.1)));
    const label = score >= 5 ? 'Legendary cover' : score >= 4 ? 'Great cover' : score >= 3 ? 'Solid cover' : 'Risky cover';
    return {
      spot: nearbySpot,
      score,
      label,
      detail: `${label} near the ${nearbySpot.label}.`,
    };
  }

  function getHideSeekSearchFeedback(sameRoom, distance) {
    if (!sameRoom) {
      return { text: 'Wrong room. Keep moving.', tone: 'cold' };
    }
    if (distance <= HIDE_SEEK_SEARCH_TOLERANCE) {
      return { text: 'Found!', tone: 'found' };
    }
    if (distance <= HIDE_SEEK_SEARCH_TOLERANCE * 1.65) {
      return { text: 'Very close. Search the exact spot.', tone: 'hot' };
    }
    if (distance <= HIDE_SEEK_SEARCH_TOLERANCE * 2.8) {
      return { text: 'Warm. You are in the neighborhood.', tone: 'warm' };
    }
    return { text: 'Cold. Try another piece of cover.', tone: 'cold' };
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

  function setHideSeekListenPulse(actor, tone) {
    const center = getHideSeekActorCenter(actor);
    hideSeekState.listenPulse = {
      x: center.x,
      y: center.y,
      roomId: actor.roomId,
      time: 1.1,
      maxTime: 1.1,
      tone,
    };
  }

  function setHideSeekListenHint(actor, targetSpot) {
    if (!targetSpot) return;
    const actorCenter = getHideSeekActorCenter(actor);
    const targetCenter = getHideSeekSpotCenter(targetSpot);
    hideSeekState.listenHint = {
      x: actorCenter.x,
      y: actorCenter.y,
      angle: Math.atan2(targetCenter.y - actorCenter.y, targetCenter.x - actorCenter.x),
      roomId: actor.roomId,
      time: 1.8,
      maxTime: 1.8,
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
      return;
    }
    if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      listenHideSeekSeeker();
    }
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

  function listenHideSeekSeeker() {
    if (hideSeekState.hintsRemaining <= 0) {
      setHideSeekMessage('No listens left this round.');
      playHideSeekTone('wrong');
      return;
    }
    const actor = hideSeekState.actors.seeker;
    const hiddenSpot = getHideSeekSpotById(hideSeekState.hiddenSpotId);
    if (!hiddenSpot) return;
    hideSeekState.hintsRemaining -= 1;
    hideSeekState.timerRemaining = Math.max(0, hideSeekState.timerRemaining - 4);
    const sameRoom = actor.roomId === hiddenSpot.roomId;
    const clue = hideSeekState.noiseLevel >= 0.5
      ? `You hear a rustle near the ${hiddenSpot.label}.`
      : sameRoom
        ? `The sound is in this room. Check cover carefully.`
        : `The sound seems to come from ${getHideSeekRoom(hiddenSpot.roomId).name}.`;
    hideSeekState.suspicionSpotId = hideSeekState.noiseLevel >= 0.5 || sameRoom ? hiddenSpot.id : null;
    if (hideSeekState.suspicionSpotId) setHideSeekSpotState(hideSeekState.suspicionSpotId, 'suspicious');
    setHideSeekListenPulse(actor, sameRoom ? 'warm' : 'cold');
    setHideSeekListenHint(actor, sameRoom || hideSeekState.noiseLevel >= 0.5 ? hiddenSpot : null);
    spawnHideSeekParticles(actor.x + actor.width / 2, actor.y + actor.height / 2, actor.roomId, {
      color: 'rgba(189, 239, 244, 0.8)',
      count: 10,
      speed: 52,
      size: 2,
      life: 0.9,
    });
    setHideSeekMessage(`${clue} Listen costs 4 seconds.`);
    playHideSeekTone('listen');
    renderHideSeek();
  }

  function addHideSeekNoise(actor, amount) {
    hideSeekState.noiseLevel = Math.min(1, hideSeekState.noiseLevel + amount);
    const nearbySpot = getNearbyHideSeekSpot(actor);
    if (!nearbySpot) return;
    hideSeekState.suspicionSpotId = nearbySpot.id;
    if (hideSeekState.noiseLevel >= 0.55) {
      setHideSeekSpotState(nearbySpot.id, 'suspicious');
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

  function updateHideSeekSuspicion(delta) {
    if (hideSeekState.phase !== HideSeekGameState.SEEKER_TURN || !hideSeekState.hiddenPosition) return;
    const seeker = hideSeekState.actors.seeker;
    if (seeker.roomId !== hideSeekState.hiddenPosition.roomId) {
      hideSeekState.suspicionLevel = Math.max(0, hideSeekState.suspicionLevel - delta * 7);
      return;
    }
    const seekerCenter = getHideSeekActorCenter(seeker);
    const hiddenCenter = {
      x: hideSeekState.hiddenPosition.x + hideSeekState.actors.hider.width / 2,
      y: hideSeekState.hiddenPosition.y + hideSeekState.actors.hider.height / 2,
    };
    const distance = Math.hypot(seekerCenter.x - hiddenCenter.x, seekerCenter.y - hiddenCenter.y);
    const isClose = distance <= HIDE_SEEK_SUSPICION_DISTANCE;
    const pressure = Math.max(0, 1 - distance / HIDE_SEEK_SUSPICION_DISTANCE);
    hideSeekState.suspicionLevel = isClose
      ? Math.min(100, hideSeekState.suspicionLevel + delta * (10 + pressure * 22 + hideSeekState.noiseLevel * 18))
      : Math.max(0, hideSeekState.suspicionLevel - delta * 5);
    if (hideSeekState.suspicionLevel >= 70 && hideSeekState.hiddenSpotId && getHideSeekSpotState(hideSeekState.hiddenSpotId) !== 'found') {
      setHideSeekSpotState(hideSeekState.hiddenSpotId, 'suspicious');
      hideSeekState.suspicionSpotId = hideSeekState.hiddenSpotId;
      hideSeekState.shakingSpotId = hideSeekState.hiddenSpotId;
      hideSeekState.shakeTime = Math.max(hideSeekState.shakeTime || 0, 0.22);
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

  function renderHideSeekAssets() {
    if (!hideSeekAssets) return;
    const map = getHideSeekMap();
    hideSeekAssets.innerHTML = '';
    Object.values(map.rooms).forEach(room => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'hide-seek-asset';
      card.disabled = true;
      if (room.id === hideSeekState.activeRoomId) card.classList.add('active');

      const title = document.createElement('strong');
      title.textContent = room.name;
      const detail = document.createElement('span');
      const searched = room.spots.filter(spot => getHideSeekSpotState(spot.id) === 'searched').length;
      const suspicious = room.spots.filter(spot => getHideSeekSpotState(spot.id) === 'suspicious').length;
      const disabled = room.spots.filter(spot => getHideSeekSpotState(spot.id) === 'disabled').length;
      detail.textContent = suspicious
        ? `${room.spots.length} spots · ${suspicious} suspicious`
        : searched
          ? `${room.spots.length} spots · ${searched} searched`
          : disabled
            ? `${room.spots.length - disabled} open · ${disabled} closed`
            : `${room.spots.length} hiding spots`;

      card.appendChild(title);
      card.appendChild(detail);
      hideSeekAssets.appendChild(card);
    });
  }

  function resetHideSeekActors() {
    const map = getHideSeekMap();
    const startRoom = map.startRoom;
    hideSeekState.actors = {
      hider: { x: 120, y: 305, width: 24, height: 32, speed: 150, roomId: startRoom, visible: true, color: '#2ec7d3' },
      seeker: { x: 120, y: 305, width: 24, height: 32, speed: 150, roomId: startRoom, visible: false, color: '#f58220' },
    };
    hideSeekState.activeRoomId = startRoom;
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
    hideSeekState.hintsRemaining = HIDE_SEEK_MAX_HINTS;
    hideSeekState.noiseLevel = 0;
    hideSeekState.stamina = HIDE_SEEK_MAX_STAMINA;
    hideSeekState.suspicionSpotId = null;
    hideSeekState.suspicionLevel = 0;
    hideSeekState.inspectedSpotId = null;
    hideSeekState.inspectTime = 0;
    hideSeekState.inspectionCount = 0;
    hideSeekState.repeatInspectionCount = 0;
    hideSeekState.peekCount = 0;
    hideSeekState.timerRemaining = hideSeekState.countdown;
    hideSeekState.hiderTimeRemaining = HIDE_SEEK_HIDE_SECONDS;
    hideSeekState.wrongGuesses = 0;
    hideSeekState.roundHiderScore = 0;
    hideSeekState.roundSeekerScore = 0;
    hideSeekState.revealPulse = 0;
    hideSeekState.searchPulse = null;
    hideSeekState.listenPulse = null;
    hideSeekState.listenHint = null;
    hideSeekState.particles = [];
    hideSeekState.cameraShake = 0;
    hideSeekState.coverGlowPulse = 0;
    hideSeekState.lastUrgentSecond = null;
  }

  function renderHideSeek() {
    const hiderName = getHideSeekPlayerName(hideSeekState.hiderIndex);
    const seekerName = getHideSeekPlayerName(hideSeekState.seekerIndex);
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
    renderHideSeekAssets();
    hideSeekMode.value = hideSeekState.mode;
    hideSeekCountdown.value = String(hideSeekState.countdown);
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

    if (hideSeekState.phase === HideSeekGameState.TITLE || hideSeekState.phase === HideSeekGameState.GAME_OVER) {
      hideSeekStartButton.textContent = hideSeekState.phase === HideSeekGameState.GAME_OVER ? 'Play Again' : 'Start Match';
    } else {
      hideSeekStartButton.textContent = 'Start Hider Turn';
    }

    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      hideSeekFoundButton.textContent = 'Hide Here';
      hideSeekFoundButton.setAttribute('aria-label', 'Enter this hiding spot');
      hideSeekFoundButton.disabled = !nearbySpot;
      hideSeekSpecialButton.textContent = 'Peek';
      hideSeekSpecialButton.setAttribute('aria-label', 'Peek and risk making noise');
      const coverQuality = getHideSeekCoverQuality(hideSeekState.actors.hider);
      hideSeekRoundTitle.textContent = `${hiderName}, you have ${Math.ceil(hideSeekState.hiderTimeRemaining)} seconds to hide.`;
      hideSeekRoundText.textContent = coverQuality.spot
        ? `${coverQuality.detail} Tap Hide Here to enter that object. Peek gives a better look, but can make noise.`
        : `Move next to a glowing hiding spot. You must enter real cover before the timer expires.`;
      setHideSeekMessage(coverQuality.spot ? coverQuality.detail : `${hiderName} is looking for cover.`);
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_LOOK_AWAY) {
      hideSeekFoundButton.textContent = `${seekerName} Starts Searching`;
      hideSeekFoundButton.setAttribute('aria-label', `${seekerName} starts searching`);
      hideSeekRoundTitle.textContent = `${hiderName} is hidden.`;
      hideSeekRoundText.textContent = `Pass the phone to ${seekerName}. The map resets to the start room, and wrong inspections cost ${HIDE_SEEK_WRONG_SEARCH_PENALTY} seconds.`;
      setHideSeekMessage(`${seekerName}, no peeking until you tap start searching.`);
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      hideSeekFoundButton.textContent = 'Inspect Spot';
      hideSeekFoundButton.setAttribute('aria-label', 'Inspect this hiding spot');
      hideSeekFoundButton.disabled = !nearbySpot || hideSeekState.inspectTime > 0;
      hideSeekSpecialButton.textContent = `Listen (${hideSeekState.hintsRemaining})`;
      hideSeekSpecialButton.setAttribute('aria-label', 'Listen for a clue');
      hideSeekSpecialButton.disabled = hideSeekState.hintsRemaining <= 0;
      hideSeekRoundTitle.textContent = `${seekerName}, find the hider.`;
      hideSeekRoundText.textContent = nearbySpot
        ? `You are near the ${nearbySpot.label}. Inspect it, or listen for a limited clue.`
        : `Walk next to cover, inspect objects, and use Listen sparingly. Random inspections cost time.`;
      setHideSeekMessage(`${seekerName} is searching ${room.name}. Wrong guesses: ${hideSeekState.wrongGuesses}.`);
    } else if (hideSeekState.phase === HideSeekGameState.FOUND || hideSeekState.phase === HideSeekGameState.ROUND_RESULTS) {
      hideSeekRoundTitle.textContent = hideSeekState.phase === HideSeekGameState.FOUND ? 'Found!' : 'Round over.';
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

    renderHideSeekOverlay();
    drawHideSeek();
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
    hideSeekState.countdown = Number(hideSeekCountdown.value) || HIDE_SEEK_DEFAULT_SEARCH_SECONDS;
    hideSeekState.winnerGoal = hideSeekWinner.value || '5';
    resetHideSeekRoundState(HideSeekGameState.HIDER_TURN);
    startHideSeekLoop();
    playHideSeekTone('door');
    renderHideSeek();
  }

  function beginHideSeekSeekerTurn() {
    const map = getHideSeekMap();
    hideSeekState.phase = HideSeekGameState.SEEKER_TURN;
    hideSeekState.timerRemaining = hideSeekState.countdown;
    hideSeekState.lastUrgentSecond = null;
    hideSeekState.actors.seeker = { x: 120, y: 305, width: 24, height: 32, speed: 150, roomId: map.startRoom, visible: true, color: '#f58220' };
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
      lockHideSeekHiderPosition('button');
      return;
    }
    if (hideSeekState.phase !== HideSeekGameState.SEEKER_TURN) return;
    searchHideSeekPosition();
  }

  function lockHideSeekHiderPosition(source) {
    if (hideSeekState.phase !== HideSeekGameState.HIDER_TURN) return;
    const actor = hideSeekState.actors.hider;
    let coverQuality = getHideSeekCoverQuality(actor);
    let nearbySpot = coverQuality.spot;
    if (!nearbySpot && source !== 'timer') {
      setHideSeekMessage('Move next to a hiding spot first.');
      playHideSeekTone('wrong');
      renderHideSeek();
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
  }

  function searchHideSeekPosition() {
    const hider = getHideSeekPlayer(hideSeekState.hiderIndex);
    const seeker = getHideSeekPlayer(hideSeekState.seekerIndex);
    const actor = hideSeekState.actors.seeker;
    const inspectedSpot = getNearbyHideSeekSpot(actor);
    const hiddenPosition = hideSeekState.hiddenPosition;
    if (!hiddenPosition) return;
    if (!inspectedSpot) {
      setHideSeekMessage('Stand next to a hiding spot before inspecting.');
      playHideSeekTone('wrong');
      return;
    }
    const inspectedState = getHideSeekSpotState(inspectedSpot.id);
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
    const feedback = getHideSeekSearchFeedback(sameRoom, distance);
    setHideSeekSearchPulse(actor, feedback.tone);
    if (inspectedSpot.id !== hideSeekState.hiddenSpotId) {
      hideSeekState.wrongGuesses += 1;
      const repeatPenalty = inspectedState === 'searched' ? HIDE_SEEK_SPAM_INSPECTION_PENALTY : 0;
      if (repeatPenalty) hideSeekState.repeatInspectionCount += 1;
      hideSeekState.timerRemaining = Math.max(0, hideSeekState.timerRemaining - HIDE_SEEK_WRONG_SEARCH_PENALTY - repeatPenalty);
      setHideSeekSpotState(inspectedSpot.id, distance <= HIDE_SEEK_SEARCH_TOLERANCE * 2.8 ? 'suspicious' : 'searched');
      hideSeekState.shakingSpotId = inspectedSpot.id;
      hideSeekState.shakeTime = 0.55;
      spawnHideSeekParticles(inspectedCenter.x, inspectedCenter.y, actor.roomId, {
        color: distance <= HIDE_SEEK_SEARCH_TOLERANCE * 2.8 ? 'rgba(255, 209, 102, 0.85)' : 'rgba(154, 164, 178, 0.75)',
        count: 9,
        speed: 34,
        size: 3,
        life: 0.62,
      });
      hideSeekState.cameraShake = Math.max(hideSeekState.cameraShake, 0.12);
      setHideSeekMessage(`${feedback.text} ${HIDE_SEEK_WRONG_SEARCH_PENALTY + repeatPenalty} seconds lost${repeatPenalty ? ' for re-checking' : ''}.`);
      playHideSeekTone('wrong');
      renderHideSeek();
      if (hideSeekState.timerRemaining <= 0) hideSeekSeekerFailed();
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
    const timeUsed = hideSeekState.countdown - hideSeekState.timerRemaining;
    const coverScore = Number(hideSeekState.hiddenCoverQuality) || foundSpot.difficulty || 3;
    const cleanInspectBonus = Math.max(0, 160 - hideSeekState.inspectionCount * 22 - hideSeekState.repeatInspectionCount * 45);
    const stealthBonus = Math.max(0, 120 - hideSeekState.peekCount * 35 - Math.round(hideSeekState.noiseLevel * 70));
    hideSeekState.roundSeekerScore = Math.max(0, Math.round(1200 - timeUsed * 7 - hideSeekState.wrongGuesses * 90 + coverScore * 55 + cleanInspectBonus));
    hideSeekState.roundHiderScore = Math.max(0, Math.round(timeUsed * 5 + coverScore * 125 + (HIDE_SEEK_HIDE_SECONDS - hideSeekState.hiderTimeRemaining) * 3 + stealthBonus));
    hideSeekState.hideScore[seeker.id] = (hideSeekState.hideScore[seeker.id] || 0) + hideSeekState.roundSeekerScore;
    hideSeekState.hideScore[hider.id] = (hideSeekState.hideScore[hider.id] || 0) + hideSeekState.roundHiderScore;
    hideSeekState.phase = HideSeekGameState.FOUND;
    hideSeekState.revealPulse = 1.4;
    hideSeekState.cameraShake = Math.max(hideSeekState.cameraShake, 0.45);
    revealHideSeekHider(foundSpot);
    hideSeekRound += 1;
    hideSeekState.lastRoundText = `${seeker.name} found ${hider.name} ${hideSeekState.hiddenSpotLabel}. Cover: ${hideSeekState.hiddenCoverLabel}. ${seeker.name}: +${hideSeekState.roundSeekerScore}. ${hider.name}: +${hideSeekState.roundHiderScore}. Inspections: ${hideSeekState.inspectionCount}. Stealth bonus: ${stealthBonus}.`;
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
    revealHideSeekHider(spot || { x: 120, y: 305, width: 24, height: 32 });
    hideSeekRound += 1;
    hideSeekState.lastRoundText = `${hider.name} stayed hidden ${hideSeekState.hiddenSpotLabel}. Cover: ${hideSeekState.hiddenCoverLabel}. Peeks: ${hideSeekState.peekCount}. Stealth bonus: ${stealthBonus}. ${hider.name}: +${hideSeekState.roundHiderScore}.`;
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
  }

  function resetHideSeek() {
    stopHideSeekTimer();
    hideSeekRound = 0;
    hideSeekState = {
      mode: hideSeekMode.value || 'roadside-lodge',
      countdown: Number(hideSeekCountdown.value) || HIDE_SEEK_DEFAULT_SEARCH_SECONDS,
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
      hintsRemaining: HIDE_SEEK_MAX_HINTS,
      noiseLevel: 0,
      stamina: HIDE_SEEK_MAX_STAMINA,
      suspicionSpotId: null,
      suspicionLevel: 0,
      inspectedSpotId: null,
      inspectTime: 0,
      inspectionCount: 0,
      repeatInspectionCount: 0,
      peekCount: 0,
      hiddenRoomId: null,
      activeRoomId: (hideSeekMaps[hideSeekMode.value] || hideSeekMaps['roadside-lodge']).startRoom,
      timerRemaining: Number(hideSeekCountdown.value) || HIDE_SEEK_DEFAULT_SEARCH_SECONDS,
      hiderTimeRemaining: HIDE_SEEK_HIDE_SECONDS,
      wrongGuesses: 0,
      roundHiderScore: 0,
      roundSeekerScore: 0,
      lastRoundText: '',
      message: '',
      hideScore: {},
      actors: {
        hider: { x: 120, y: 305, width: 24, height: 32, speed: 150, roomId: (hideSeekMaps[hideSeekMode.value] || hideSeekMaps['roadside-lodge']).startRoom, visible: true, color: '#2ec7d3' },
        seeker: { x: 120, y: 305, width: 24, height: 32, speed: 150, roomId: (hideSeekMaps[hideSeekMode.value] || hideSeekMaps['roadside-lodge']).startRoom, visible: false, color: '#f58220' },
      },
      input: { up: false, down: false, left: false, right: false, sprint: false },
      revealPulse: 0,
      searchPulse: null,
      listenPulse: null,
      listenHint: null,
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
    if (hideSeekState.phase === HideSeekGameState.HIDER_TURN) {
      updateHideSeekActor(hideSeekState.actors.hider, delta);
      hideSeekState.hiderTimeRemaining = Math.max(0, hideSeekState.hiderTimeRemaining - delta);
      if (hideSeekState.hiderTimeRemaining <= 0) lockHideSeekHiderPosition('timer');
    } else if (hideSeekState.phase === HideSeekGameState.SEEKER_TURN) {
      if (hideSeekState.inspectTime <= 0) updateHideSeekActor(hideSeekState.actors.seeker, delta);
      hideSeekState.timerRemaining = Math.max(0, hideSeekState.timerRemaining - delta);
      if (hideSeekState.timerRemaining <= 10 && hideSeekState.timerRemaining > 0) {
        const urgentSecond = Math.ceil(hideSeekState.timerRemaining);
        if (urgentSecond !== hideSeekState.lastUrgentSecond) {
          hideSeekState.lastUrgentSecond = urgentSecond;
          playHideSeekTone('tick');
        }
      }
      if (hideSeekState.timerRemaining <= 0) hideSeekSeekerFailed();
    }
    if (hideSeekState.revealPulse > 0) hideSeekState.revealPulse = Math.max(0, hideSeekState.revealPulse - delta);
    if (hideSeekState.searchPulse) {
      hideSeekState.searchPulse.time = Math.max(0, hideSeekState.searchPulse.time - delta);
      if (hideSeekState.searchPulse.time <= 0) hideSeekState.searchPulse = null;
    }
    if (hideSeekState.listenPulse) {
      hideSeekState.listenPulse.time = Math.max(0, hideSeekState.listenPulse.time - delta);
      if (hideSeekState.listenPulse.time <= 0) hideSeekState.listenPulse = null;
    }
    if (hideSeekState.listenHint) {
      hideSeekState.listenHint.time = Math.max(0, hideSeekState.listenHint.time - delta);
      if (hideSeekState.listenHint.time <= 0) hideSeekState.listenHint = null;
    }
    if (hideSeekState.cameraShake > 0) hideSeekState.cameraShake = Math.max(0, hideSeekState.cameraShake - delta * 1.8);
    updateHideSeekParticles(delta);
    if (hideSeekState.inspectTime > 0) hideSeekState.inspectTime = Math.max(0, hideSeekState.inspectTime - delta);
    if (hideSeekState.noiseLevel > 0) hideSeekState.noiseLevel = Math.max(0, hideSeekState.noiseLevel - delta * 0.025);
    updateHideSeekSuspicion(delta);
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
    return `${roundText} · Search: ${Math.ceil(hideSeekState.timerRemaining)}s · ${room.name}`;
  }

  function updateHideSeekActor(actor, delta) {
    const input = hideSeekState.input;
    const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
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
    const nextXActor = Object.assign({}, actor, {
      x: Math.max(38, Math.min(738, actor.x + moveX)),
    });
    if (!wouldHitHideSeekBlock(nextXActor, room)) {
      actor.x = nextXActor.x;
    }
    const nextYActor = Object.assign({}, actor, {
      y: Math.max(62, Math.min(382, actor.y + moveY)),
    });
    if (!wouldHitHideSeekBlock(nextYActor, room)) {
      actor.y = nextYActor.y;
    }
    checkHideSeekExits(actor, room);
    hideSeekState.activeRoomId = actor.roomId;
  }

  function getHideSeekSpeedMultiplier(actor, room) {
    const zone = (room.obstacles || []).find(obstacle => obstacle.type === 'slow' && isHideSeekOverlapping(actor, obstacle));
    return zone ? zone.speedMultiplier || 0.65 : 1;
  }

  function wouldHitHideSeekBlock(actor, room) {
    const collider = getHideSeekActorCollider(actor);
    const hitsObstacle = (room.obstacles || []).some(obstacle => obstacle.type === 'block' && isHideSeekOverlapping(collider, obstacle));
    const hitsSpot = (room.spots || []).some(spot => spot.solid !== false && isHideSeekOverlapping(collider, getHideSeekSpotCollisionRect(spot)));
    return hitsObstacle || hitsSpot;
  }

  function checkHideSeekExits(actor, room) {
    const actorCenter = getHideSeekActorCenter(actor);
    const exit = room.exits.find(item => isHideSeekPointInsideRect(actorCenter, getHideSeekExitTriggerRect(item)));
    if (!exit) return;
    actor.roomId = exit.targetRoom;
    actor.x = exit.spawnX;
    actor.y = exit.spawnY;
    hideSeekState.activeRoomId = exit.targetRoom;
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
    const pad = 38;
    const reach = 26;
    if (exit.y <= 62) {
      return {
        x: exit.x - pad,
        y: exit.y - pad,
        width: exit.width + pad * 2,
        height: exit.height + pad * 2 + reach,
      };
    }
    if (exit.y >= 360) {
      return {
        x: exit.x - pad,
        y: exit.y - pad - reach,
        width: exit.width + pad * 2,
        height: exit.height + pad * 2 + reach,
      };
    }
    if (exit.x <= 62) {
      return {
        x: exit.x - pad,
        y: exit.y - pad,
        width: exit.width + pad * 2 + reach,
        height: exit.height + pad * 2,
      };
    }
    if (exit.x >= 700) {
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

  function getHideSeekActorCollider(actor) {
    return {
      x: actor.x + 4,
      y: actor.y + 12,
      width: Math.max(8, actor.width - 8),
      height: Math.max(8, actor.height - 8),
    };
  }

  function getHideSeekSpotCollisionRect(spot) {
    const insets = {
      bed: { x: 6, y: 16, width: -12, height: -18 },
      bench: { x: 8, y: 18, width: -16, height: -24 },
      bush: { x: 10, y: 20, width: -20, height: -26 },
      car: { x: 16, y: 20, width: -32, height: -24 },
      couch: { x: 8, y: 14, width: -16, height: -18 },
      curtain: { x: 8, y: 12, width: -16, height: -18 },
      fountain: { x: 12, y: 14, width: -24, height: -22 },
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
    drawHideSeekActionEffects(ctx, room);
    drawHideSeekParticles(ctx, room);
    drawHideSeekAtmosphere(ctx, room, map);
    drawHideSeekListenHint(ctx, room);
    ctx.restore();
    drawHideSeekHud(ctx, room, map);
    if (hideSeekDebugEnabled) drawHideSeekDebug(ctx, room, map);
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
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let x = -450; x < 900; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 64);
      ctx.lineTo(x + 450, 402);
      ctx.stroke();
    }
    ctx.restore();
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
      window.RTA_HIDE_SEEK_ART.drawRoomBackdrop(ctx, map, room, palette, getHideSeekArtTools());
      return;
    }
    ctx.fillStyle = palette.wall;
    ctx.fillRect(0, 0, 800, 450);
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
    drawHideSeekRoomBackdrop(ctx, map, room, palette);

    const floorGradient = ctx.createLinearGradient(0, 62, 0, 400);
    floorGradient.addColorStop(0, shadeHideSeekColor(palette.floor, 12));
    floorGradient.addColorStop(1, shadeHideSeekColor(palette.floor, -12));
    ctx.fillStyle = floorGradient;
    fillHideSeekRoundedRect(ctx, 38, 62, 724, 338, 18);
    drawHideSeekTexture(ctx, 'rgba(6,21,36,0.28)', 0.25, 38);

    if (window.RTA_HIDE_SEEK_ART && window.RTA_HIDE_SEEK_ART.drawFloorDetail) {
      window.RTA_HIDE_SEEK_ART.drawFloorDetail(ctx, map, room, getHideSeekArtTools());
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.24)';
    ctx.lineWidth = 1;
    for (let y = 94; y < 382; y += 36) {
      ctx.beginPath();
      ctx.moveTo(58, y);
      ctx.lineTo(742, y);
      ctx.stroke();
    }

    ctx.fillStyle = palette.trim;
    fillHideSeekRoundedRect(ctx, 34, 58, 732, 18, 8);
    fillHideSeekRoundedRect(ctx, 34, 386, 732, 18, 8);
    fillHideSeekRoundedRect(ctx, 34, 58, 18, 346, 8);
    fillHideSeekRoundedRect(ctx, 748, 58, 18, 346, 8);

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

    const vignette = ctx.createRadialGradient(400, 230, 80, 400, 230, 430);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 800, 450);
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

    const listenPulse = hideSeekState.listenPulse;
    if (listenPulse && listenPulse.roomId === room.id) {
      const progress = 1 - (listenPulse.time / listenPulse.maxTime);
      ctx.save();
      ctx.strokeStyle = `rgba(189, 239, 244, ${Math.max(0, 0.75 - progress * 0.55)})`;
      ctx.lineWidth = 3;
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.beginPath();
        ctx.arc(listenPulse.x, listenPulse.y, 26 + progress * 82 + ring * 22, 0, Math.PI * 2);
        ctx.stroke();
      }
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
        ctx.save();
        ctx.fillStyle = map.id === 'school-night' ? 'rgba(6, 21, 36, 0.34)' : 'rgba(6, 21, 36, 0.22)';
        ctx.fillRect(38, 62, 724, 338);
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
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 9; i += 1) {
        const x = (performance.now() / 28 + i * 92) % 850 - 40;
        ctx.beginPath();
        ctx.moveTo(x, 86);
        ctx.lineTo(x + 28, 63);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawHideSeekListenHint(ctx, room) {
    const hint = hideSeekState.listenHint;
    if (!hint || hint.roomId !== room.id) return;
    const progress = 1 - hint.time / hint.maxTime;
    const alpha = Math.max(0, 0.9 - progress * 0.65);
    ctx.save();
    ctx.translate(hint.x, hint.y);
    ctx.rotate(hint.angle);
    ctx.fillStyle = `rgba(255, 209, 102, ${alpha})`;
    ctx.strokeStyle = `rgba(6, 21, 36, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(52 + progress * 14, 0);
    ctx.lineTo(24, -13);
    ctx.lineTo(29, -4);
    ctx.lineTo(4, -4);
    ctx.lineTo(4, 4);
    ctx.lineTo(29, 4);
    ctx.lineTo(24, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
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
      suspicious: '#ffd166',
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
    if (visibleState === 'disabled' || visibleState === 'searched' || visibleState === 'suspicious' || visibleState === 'found') {
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
    ctx.fillStyle = '#061524';
    ctx.fillRect(actor.x + 7, actor.y + 7 + bob, 4, 4);
    ctx.fillRect(actor.x + actor.width - 11, actor.y + 7 + bob, 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(actor.x + 5, actor.y + 15 + bob, actor.width - 10, 2);

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
    const displaySeconds = hideSeekState.phase === HideSeekGameState.HIDER_TURN
      ? hideSeekState.hiderTimeRemaining
      : hideSeekState.timerRemaining;
    const isUrgent = hideSeekState.phase === HideSeekGameState.SEEKER_TURN && displaySeconds <= 10;

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
      ctx.fillText(`Miss: -${HIDE_SEEK_WRONG_SEARCH_PENALTY}s`, 472, 25);
      ctx.fillText(`Listen: ${hideSeekState.hintsRemaining}`, 472, 42);
      drawHideSeekMeter(ctx, 544, 31, 38, hideSeekState.stamina, '#2ec7d3', '');
      drawHideSeekMeter(ctx, 544, 47, 38, hideSeekState.suspicionLevel, '#ffd166', '');
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = isUrgent ? '#ff4d4d' : '#f58220';
    fillHideSeekRoundedRect(ctx, 650, 8, 132, 40, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px Arial';
    ctx.fillText(`${Math.ceil(displaySeconds)}s`, 778, 31);
    ctx.fillStyle = isUrgent ? '#fff2d8' : '#09233f';
    ctx.font = '900 10px Arial';
    ctx.fillText(hideSeekState.phase === HideSeekGameState.HIDER_TURN ? 'HIDE' : 'SEARCH', 778, 44);

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

    drawHideSeekDebugRect(ctx, { x: 38, y: 62, width: 724, height: 338 }, '#ffffff', 'playable floor');

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
      ctx.arc(centerX, centerY, spot.interactionRadius || 42, 0, Math.PI * 2);
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

    ctx.fillStyle = 'rgba(6, 21, 36, 0.9)';
    fillHideSeekRoundedRect(ctx, 14, 64, 276, 62, 8);
    ctx.fillStyle = '#f7fbff';
    ctx.font = '900 12px Arial';
    ctx.fillText('DEBUG MODE', 26, 82);
    ctx.font = '800 10px Arial';
    ctx.fillStyle = '#bdeff4';
    ctx.fillText(`map=${map.id} room=${room.id} phase=${hideSeekState.phase}`, 26, 99);
    ctx.fillText(`spots=${room.spots.length} exits=${room.exits.length} obstacles=${(room.obstacles || []).length}`, 26, 114);
    ctx.restore();
  }

  function setHideSeekInput(direction, active) {
    if (!hideSeekState.input || !direction) return;
    hideSeekState.input[direction] = active;
  }

  function toggleHideSeekDebug() {
    hideSeekDebugEnabled = !hideSeekDebugEnabled;
    setStoredJson('rtaHideSeekDebug', hideSeekDebugEnabled);
    renderHideSeek();
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
    const historyKey = getTriviaHistoryKey(categoryId);
    const used = new Set(triviaHistory[historyKey] || []);
    let available = candidates.filter(item => !used.has(item.id));

    if (!available.length) {
      triviaHistory[historyKey] = [];
      setStoredJson('rtaTriviaHistory', triviaHistory);
      available = candidates.slice();
    }
    return shuffle(available.slice()).slice(0, getTriviaQuestionLimit());
  }

  function getTriviaHistoryKey(categoryId) {
    return `${categoryId || 'mixed'}:${activeTriviaDifficulty}`;
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

  function markTriviaSeen(item) {
    if (!item || !item.id) return;
    const categoryKey = getTriviaHistoryKey(activeTriviaCategory || item.category);
    if (!triviaHistory[categoryKey]) triviaHistory[categoryKey] = [];
    if (!triviaHistory[categoryKey].includes(item.id)) {
      triviaHistory[categoryKey].push(item.id);
      setStoredJson('rtaTriviaHistory', triviaHistory);
    }
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
          awardTrivia(turnPlayerId);
        } else {
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
    triviaIntro.textContent = `Pick a lane. Each question names the player whose turn it is. A correct choice gives that player 1 point. This run has up to ${getTriviaQuestionLimit()} questions.`;
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

  function startJokeVote() {
    resetGame();
    jokePlayerScores = createScoreMap();
    jokeAwards = { dad: 0, mom: 0 };
    jokeRound = 1;
    renderJokeVote();
    showSection('jokes');
  }

  function renderJokeVote() {
    const prompts = [
      'Tell your best road-trip joke.',
      'Make up a joke about something you just passed.',
      'Tell a joke that starts with "Why did the car..."',
      'Make a clean joke using a state name.',
      'Tell a joke that would make a GPS laugh.',
    ];
    renderScoreboard(jokeScoreboard, jokePlayerScores);
    renderAwardButtons(jokeAwardButtons, 'Wins Round', awardJokeRound);
    jokeRoundElement.textContent = `${jokeRound}/${getJokeRoundLimit()}`;
    jokePrompt.textContent = prompts[(jokeRound - 1) % prompts.length];
    jokeAward.textContent = `Awards so far: Dad Joke ${jokeAwards.dad}, Mom Joke ${jokeAwards.mom}.`;
  }

  function awardJokeRound(playerId) {
    jokePlayerScores[playerId] = (jokePlayerScores[playerId] || 0) + 1;
    jokeRound++;
    if (jokeRound > getJokeRoundLimit()) {
      showJokeSummary();
      return;
    }
    renderJokeVote();
  }

  function showJokeSummary() {
    showSection('summary');
    const leaders = getWinningPlayers(jokePlayerScores);
    const winner = formatWinner(leaders, leader => `${leader.name} wins Joke Vote`, 'Joke Vote ends in a tie');
    const scoreText = players.map(player => `${player.name}: ${jokePlayerScores[player.id] || 0}`).join(', ');
    summaryText.textContent = leaders.length
      ? `${winner}. ${scoreText}.`
      : `No joke rounds were awarded yet. ${scoreText}.`;
    summaryList.innerHTML = '';
    [
      `Dad Joke Awards: ${jokeAwards.dad}`,
      `Mom Joke Awards: ${jokeAwards.mom}`,
      'Prize idea: winner picks the next car karaoke song.',
    ].forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      summaryList.appendChild(li);
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
    emojiCameraMessage.textContent = 'Start the camera when everyone is ready.';
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
    if (window.RTA_PONG_ART && window.RTA_PONG_ART.createState) {
      return window.RTA_PONG_ART.createState(pongCanvas, config);
    }
    const width = pongCanvas.width;
    const height = pongCanvas.height;
    return {
      width,
      height,
      paddleWidth: 14,
      paddleHeight: config.paddleHeight,
      leftY: height / 2 - config.paddleHeight / 2,
      rightY: height / 2 - config.paddleHeight / 2,
      ballX: width / 2,
      ballY: height / 2,
      ballVX: config.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      ballVY: (config.ballSpeed * 0.55) * (Math.random() > 0.5 ? 1 : -1),
      ballSize: 12,
      leftScore: 0,
      rightScore: 0,
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
    pongState.ballX = pongState.width / 2;
    pongState.ballY = pongState.height / 2;
    pongState.ballVX = config.ballSpeed * direction;
    pongState.ballVY = (config.ballSpeed * 0.55) * (Math.random() > 0.5 ? 1 : -1);
  }

  function drawPong() {
    if (!pongCanvas || !pongState) return;
    if (window.RTA_PONG_ART && window.RTA_PONG_ART.draw) {
      window.RTA_PONG_ART.draw(pongCanvas, pongState);
      return;
    }
    const ctx = pongCanvas.getContext('2d');
    ctx.clearRect(0, 0, pongState.width, pongState.height);
    ctx.fillStyle = '#08284a';
    ctx.fillRect(0, 0, pongState.width, pongState.height);
    ctx.fillStyle = '#f58220';
    ctx.fillRect(22, pongState.leftY, pongState.paddleWidth, pongState.paddleHeight);
    ctx.fillStyle = '#7c4dff';
    ctx.fillRect(pongState.width - 36, pongState.rightY, pongState.paddleWidth, pongState.paddleHeight);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pongState.ballX - pongState.ballSize / 2, pongState.ballY - pongState.ballSize / 2, pongState.ballSize, pongState.ballSize);
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
    pongScore.textContent = `${pongState.leftScore} : ${pongState.rightScore}`;
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
      pongState.leftY = Math.max(0, Math.min(maxY, nextY));
    } else {
      pongState.rightY = Math.max(0, Math.min(maxY, nextY));
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
    if (pongSettings.opponentMode === 'computer' && side === 'right') return;
    pongPointerSides[event.pointerId] = side;
    movePongPaddleTo(side, event.clientY);
  }

  function releasePongPointer(event) {
    delete pongPointerSides[event.pointerId];
  }

  async function togglePongFullscreen() {
    const target = sections.pong || pongCanvas;
    try {
      if (!document.fullscreenElement && target && target.requestFullscreen) {
        await target.requestFullscreen();
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      pongStatus.textContent = 'Full screen is not available in this browser.';
    }
  }

  function updatePongFullscreenButton() {
    if (!pongFullscreenButton) return;
    pongFullscreenButton.textContent = document.fullscreenElement ? 'Exit Full Screen' : 'Full Screen';
  }

  function movePongPaddles() {
    const config = getPongDifficultyConfig();
    const speed = config.humanSpeed;
    const maxY = pongState.height - pongState.paddleHeight;
    if (pongKeys.leftUp) pongState.leftY -= speed;
    if (pongKeys.leftDown) pongState.leftY += speed;
    if (pongSettings.opponentMode === 'local') {
      if (pongKeys.rightUp) pongState.rightY -= speed;
      if (pongKeys.rightDown) pongState.rightY += speed;
    } else {
      const targetY = predictPongInterceptY() - pongState.paddleHeight / 2;
      const delta = targetY - pongState.rightY;
      if (config.aiPerfect) {
        pongState.rightY = targetY;
      } else if (Math.abs(delta) > config.aiError) {
        pongState.rightY += Math.sign(delta) * Math.min(config.aiSpeed, Math.abs(delta));
      } else {
        pongState.rightY += Math.sign(delta) * Math.min(2.5, Math.abs(delta));
      }
    }

    pongState.leftY = Math.max(0, Math.min(maxY, pongState.leftY));
    pongState.rightY = Math.max(0, Math.min(maxY, pongState.rightY));
  }

  function predictPongInterceptY() {
    if (!pongState) return 0;
    if (pongState.ballVX <= 0) return pongState.height / 2;
    const boundsMin = pongState.ballSize / 2;
    const boundsMax = pongState.height - pongState.ballSize / 2;
    const targetX = pongState.width - 36 - pongState.ballSize / 2;
    const timeToTarget = (targetX - pongState.ballX) / pongState.ballVX;
    if (!Number.isFinite(timeToTarget) || timeToTarget < 0) return pongState.ballY;
    let predicted = pongState.ballY + pongState.ballVY * timeToTarget;
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
    pongState.ballX += pongState.ballVX;
    pongState.ballY += pongState.ballVY;

    if (pongState.ballY <= pongState.ballSize / 2 || pongState.ballY >= pongState.height - pongState.ballSize / 2) {
      pongState.ballVY *= -1;
    }

    const leftHit = pongState.ballX <= 36 + pongState.ballSize / 2
      && pongState.ballY >= pongState.leftY
      && pongState.ballY <= pongState.leftY + pongState.paddleHeight;
    const rightHit = pongState.ballX >= pongState.width - 36 - pongState.ballSize / 2
      && pongState.ballY >= pongState.rightY
      && pongState.ballY <= pongState.rightY + pongState.paddleHeight;
    if (leftHit || rightHit) {
      const paddleY = leftHit ? pongState.leftY : pongState.rightY;
      const offset = (pongState.ballY - (paddleY + pongState.paddleHeight / 2)) / (pongState.paddleHeight / 2);
      pongState.ballVX *= -1.06;
      pongState.ballVY = offset * 5;
    }

    if (pongState.ballX < 0) {
      pongState.rightScore++;
      resetPongBall(-1);
      updatePongScore();
    } else if (pongState.ballX > pongState.width) {
      pongState.leftScore++;
      resetPongBall(1);
      updatePongScore();
    }

    if (pongState.leftScore >= pongState.targetScore || pongState.rightScore >= pongState.targetScore) {
      stopPong();
      const winner = pongState.leftScore > pongState.rightScore
        ? (players[0] ? players[0].name : 'Left player')
        : (players[1] ? players[1].name : 'Right player');
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
    for (let i = 0; i < count; i++) {
      const buildingBase = height * (0.22 + Math.random() * 0.28);
      buildings.push({
        x: i * buildingWidth,
        width: buildingWidth - 8,
        height: buildingBase,
        roofY: height - buildingBase - 36,
      });
    }
    return {
      width,
      height,
      buildings,
      scoreLeft: 0,
      scoreRight: 0,
      projectile: null,
      winner: null,
      gravity: 860,
      wind: Math.round((Math.random() * 2 - 1) * 22),
      trail: [],
      explosion: null,
      sparks: [],
    };
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

  function getGorillasWindLabel() {
    if (!gorillasState || gorillasState.wind === 0) return 'calm wind';
    return `${Math.abs(gorillasState.wind)} mph ${gorillasState.wind > 0 ? 'tailwind right' : 'tailwind left'}`;
  }

  function renderGorillasControls() {
    if (!gorillasFireButton) return;
    gorillasFireButton.disabled = !gorillasState || Boolean(gorillasState.projectile) || Boolean(gorillasState.winner);
  }

  async function toggleGorillasFullscreen() {
    const target = sections.gorillas || gorillasCanvas;
    try {
      if (!document.fullscreenElement && target && target.requestFullscreen) {
        await target.requestFullscreen();
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      gorillasStatus.textContent = 'Full screen is not available in this browser.';
    }
  }

  function updateGorillasFullscreenButton() {
    if (!gorillasFullscreenButton) return;
    const active = document.fullscreenElement === sections.gorillas;
    gorillasFullscreenButton.textContent = active ? 'Exit Full Screen' : 'Full Screen';
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

  function drawGorillasHud(ctx) {
    ctx.fillStyle = 'rgba(247,251,255,0.82)';
    ctx.fillRect(10, 10, 238, 48);
    ctx.strokeStyle = 'rgba(9,35,63,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 238, 48);
    ctx.fillStyle = '#09233f';
    ctx.font = '900 14px Atkinson Hyperlegible, Arial, sans-serif';
    ctx.fillText(getGorillasWindLabel(), 22, 30);
    ctx.fillText(`${getGorillasPlayerName(gorillasTurn)} aiming`, 22, 49);

    const arrowX = 224;
    const arrowY = 27;
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
    gorillasState.buildings.forEach((building, index) => {
      const x = building.x + 4;
      const y = building.roofY;
      const buildingGradient = ctx.createLinearGradient(x, y, x, gorillasState.height - 36);
      buildingGradient.addColorStop(0, index % 2 === 0 ? '#203b60' : '#2a4c76');
      buildingGradient.addColorStop(1, index % 2 === 0 ? '#10243f' : '#173453');
      ctx.fillStyle = buildingGradient;
      ctx.fillRect(x, y, building.width, building.height);
      ctx.fillStyle = 'rgba(255,255,255,0.78)';
      for (let row = 0; row < Math.max(2, Math.floor(building.height / 44)); row++) {
        for (let col = 0; col < Math.max(2, Math.floor(building.width / 28)); col++) {
          const wx = x + 10 + col * 18;
          const wy = y + 14 + row * 22;
          if (wx + 8 < x + building.width - 8 && wy + 12 < gorillasState.height - 40) {
            ctx.fillRect(wx, wy, 9, 12);
          }
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(x, y, building.width, 4);
    });
    const leftGorilla = gorillasState.buildings[0];
    const rightGorilla = gorillasState.buildings[gorillasState.buildings.length - 1];
    drawPixelGorilla(ctx, leftGorilla.x + leftGorilla.width * 0.62, leftGorilla.roofY - 2, 1);
    drawPixelGorilla(ctx, rightGorilla.x + rightGorilla.width * 0.38, rightGorilla.roofY - 2, -1);
    ctx.fillStyle = 'rgba(9,35,63,0.45)';
    ctx.fillRect(gorillasState.width / 2 - 2, 96, 4, gorillasState.height - 132);
    drawGorillasHud(ctx);
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
  }

  function startGorillasGame() {
    stopGorillas();
    gorillasState = createGorillasState();
    gorillasTurn = 0;
    gorillasLastFrameTs = 0;
    renderGorillasScore();
    renderGorillasControls();
    updateGorillasFullscreenButton();
    showSection('gorillas');
    gorillasStatus.textContent = `${getGorillasPlayerName(gorillasTurn)} goes first. Wind is ${getGorillasWindLabel()}. Set angle and power, then throw.`;
    drawGorillas();
  }

  function advanceGorillasTurn(scored) {
    if (!gorillasState) return;
    const impact = gorillasState.projectile ? { x: gorillasState.projectile.x, y: gorillasState.projectile.y } : null;
    gorillasRunning = false;
    gorillasLastFrameTs = 0;
    if (gorillasAnimationFrame) {
      window.cancelAnimationFrame(gorillasAnimationFrame);
      gorillasAnimationFrame = null;
    }
    const shooterName = getGorillasPlayerName(gorillasTurn);
    if (scored) {
      const scorer = getGorillasSide(gorillasTurn) === 'left' ? 'scoreLeft' : 'scoreRight';
      gorillasState[scorer] += 1;
      renderGorillasScore();
      if (gorillasState[scorer] >= 5) {
        gorillasState.winner = scorer;
        gorillasState.explosion = impact;
        gorillasState.sparks = impact ? createGorillasSparks(impact.x, impact.y) : [];
        gorillasStatus.textContent = `${shooterName} wins Banana Towers!`;
        stopGorillas();
        renderGorillasControls();
        drawGorillas();
        return;
      }
      gorillasState.explosion = impact;
      gorillasState.sparks = impact ? createGorillasSparks(impact.x, impact.y) : [];
      gorillasStatus.textContent = `${shooterName} scored!`;
    } else {
      gorillasState.explosion = impact && impact.y < gorillasState.height - 40 ? impact : null;
      gorillasState.sparks = gorillasState.explosion ? createGorillasSparks(gorillasState.explosion.x, gorillasState.explosion.y) : [];
      gorillasStatus.textContent = `${shooterName} missed.`;
    }
    gorillasTurn += 1;
    gorillasState.projectile = null;
    renderGorillasControls();
    drawGorillas();
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
    };
    gorillasState.trail = [{ x: gorillasState.projectile.x, y: gorillasState.projectile.y }];
    gorillasState.explosion = null;
    gorillasState.sparks = [];
    gorillasStatus.textContent = `${getGorillasPlayerName(gorillasTurn)} launches the banana!`;
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

    const groundY = gorillasState.height - 36;
    const target = getGorillasSide(gorillasTurn) === 'left'
      ? gorillasState.buildings[gorillasState.buildings.length - 1]
      : gorillasState.buildings[0];
    const targetRect = {
      x: target.x + 4,
      y: target.roofY,
      width: target.width,
      height: target.height,
    };
    const hitTarget = projectile.x >= targetRect.x
      && projectile.x <= targetRect.x + targetRect.width
      && projectile.y >= targetRect.y - 10
      && projectile.y <= targetRect.y + targetRect.height;
    const hitAnyBuilding = gorillasState.buildings.some(building => {
      const rect = {
        x: building.x + 4,
        y: building.roofY,
        width: building.width,
        height: building.height,
      };
      return projectile.x >= rect.x
        && projectile.x <= rect.x + rect.width
        && projectile.y >= rect.y
        && projectile.y <= rect.y + rect.height;
    });
    const hitGround = projectile.y >= groundY;
    const outOfBounds = projectile.x < 0 || projectile.x > gorillasState.width;

    drawGorillas();

    if (hitTarget) {
      advanceGorillasTurn(true);
      return;
    }
    if (hitAnyBuilding || hitGround || outOfBounds) {
      advanceGorillasTurn(false);
      return;
    }

    gorillasAnimationFrame = window.requestAnimationFrame(tickGorillas);
  }

  function resetGorillasGame() {
    stopGorillas();
    gorillasState = createGorillasState();
    gorillasTurn = 0;
    gorillasLastFrameTs = 0;
    renderGorillasScore();
    renderGorillasControls();
    gorillasStatus.textContent = `New skyline loaded. Wind is ${getGorillasWindLabel()}. Set angle and power, then throw.`;
    drawGorillas();
  }

  function showGorillasSummary() {
    stopGorillas();
    showSection('summary');
    const leader = gorillasState.scoreLeft === gorillasState.scoreRight
      ? null
      : (gorillasState.scoreLeft > gorillasState.scoreRight ? players[0] : players[1]);
    summaryText.textContent = leader
      ? `${leader.name} wins Banana Towers, ${gorillasState.scoreLeft} to ${gorillasState.scoreRight}.`
      : `Banana Towers ends in a tie, ${gorillasState.scoreLeft} to ${gorillasState.scoreRight}.`;
    summaryList.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = 'Each turn: pick angle, pick power, throw banana, then swap turns.';
    summaryList.appendChild(li);
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
    const leaders = pongState.leftScore === pongState.rightScore
      ? []
      : [pongState.leftScore > pongState.rightScore ? leftName : rightName];
    summaryText.textContent = leaders.length
      ? `${leaders[0]} wins Road Pong, ${pongState.leftScore} to ${pongState.rightScore}.`
      : `Road Pong ends in a tie, ${pongState.leftScore} to ${pongState.rightScore}.`;
    summaryList.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = `Mode: ${pongSettings.opponentMode === 'computer' ? `${pongSettings.difficulty} AI` : 'local player'}. Prize idea: winner chooses the next mini-game or gets one song veto.`;
    summaryList.appendChild(li);
  }

  function renderAdminCounts() {
    if (!adminCounts) return;
    const triviaCount = triviaDatabase.length;
    const scavengerCount = scavengerItems.length;
    const learnCount = questions.filter(question => question.category === 'learn').length;
    const secretModeCount = Object.keys(secretModeConfigs).length;
    const secretModeLabel = secretModeCount === 1 ? 'secret mode' : 'secret modes';
    adminCounts.textContent = `${triviaCount} trivia questions, ${scavengerCount} scavenger items, ${learnCount} learn prompts, ${secretModeCount} ${secretModeLabel}.`;
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
    } else if (['look', 'laugh', 'compete', 'random'].includes(selectedCategory)) {
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
    } else if (selectedCategory === 'hideSeek') {
      startHideSeekGame();
    } else {
      regionCode = '*';
      startAdventure();
    }
  }

  function startQuickStart() {
    const quickModes = ['random', 'scavenger', 'trivia', 'jokes', 'learn', 'look', 'laugh', 'compete', 'hideSeek', 'gorillas'];
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
    const target = event.target.closest('button[data-category], button.option-card');
    if (!target) return;
    // Determine which section this belongs to
    const section = target.closest('.setup-section');
    if (!section) return;
    if (section.id === 'setup-category') {
      selectedCategory = normalizeCategoryKey(target.getAttribute('data-category'));
      if (selectedCategory === 'quickstart') {
        startQuickStart();
      } else {
        renderModeRules(selectedCategory);
      }
    } else if (section.id === 'setup-region') {
      regionCode = target.getAttribute('data-region');
      startAdventure();
    }
  });

  function startAdventure() {
    resetGame();
    buildAdventure();
    showSection('adventure');
    showChallenge();
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
  huntTwentyButton.addEventListener('click', startTwentyQuestions);
  huntAlphabetButton.addEventListener('click', startAlphabetGame);
  huntEtaButton.addEventListener('click', startEtaGuess);
  showTriviaAnswerButton.addEventListener('click', () => {
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
    renderJokeVote();
  });
  momJokeAwardButton.addEventListener('click', () => {
    jokeAwards.mom++;
    renderJokeVote();
  });
  finishJokesButton.addEventListener('click', showJokeSummary);
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
  hideSeekResetButton.addEventListener('click', resetHideSeek);
  hideSeekFinishButton.addEventListener('click', showHideSeekSummary);
  hideSeekMode.addEventListener('change', () => {
    hideSeekState.mode = hideSeekMode.value;
    resetHideSeek();
  });
  hideSeekCountdown.addEventListener('change', () => {
    hideSeekState.countdown = Number(hideSeekCountdown.value) || HIDE_SEEK_DEFAULT_SEARCH_SECONDS;
    hideSeekState.timerRemaining = hideSeekState.countdown;
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
  gorillasFullscreenButton.addEventListener('click', toggleGorillasFullscreen);
  gorillasResetButton.addEventListener('click', resetGorillasGame);
  gorillasFinishButton.addEventListener('click', showGorillasSummary);
  [gorillasAngle, gorillasPower].forEach(input => {
    input.addEventListener('input', () => {
      normalizeGorillasInputs();
    });
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
    applyTripSettings();
    renderPlayerFields();
    passengerConfirmButton.addEventListener('click', confirmPassengerStatus);
    maybeOpenDeveloperLab();
    if (loadingScreen.style.display !== 'none') {
      passengerConfirmButton.focus();
    }
  });
})();

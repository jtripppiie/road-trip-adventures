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
  let huntDeck = [];
  let activeHuntIds = [];
  let activeHuntTheme = getStoredJson('rtaHuntTheme', 'mixed');
  let emojiIndex = 0;
  let emojiScore = {};
  let emojiFaceAwarded = false;
  let emojiStream = null;
  let piScore = {};
  let pongAnimationFrame = null;
  let pongRunning = false;
  let pongKeys = {};
  let pongState = null;
  let pongPointerSides = {};
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
    settings: document.getElementById('trip-settings'),
    learnTopics: document.getElementById('learn-topics'),
    region: document.getElementById('setup-region'),
    adventure: document.getElementById('adventure'),
    scavenger: document.getElementById('scavenger'),
    trivia: document.getElementById('trivia'),
    jokes: document.getElementById('jokes'),
    emoji: document.getElementById('emoji-game'),
    calculator: document.getElementById('trip-calculator'),
    pi: document.getElementById('pi-game'),
    pong: document.getElementById('pong-game'),
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
  const pongStartButton = document.getElementById('pong-start');
  const pongFullscreenButton = document.getElementById('pong-fullscreen');
  const pongResetButton = document.getElementById('pong-reset');
  const pongFinishButton = document.getElementById('pong-finish');
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
    resetGame();
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
    // Build summary text
    const total = Object.values(score).reduce((a, b) => a + b, 0);
    summaryText.textContent = `You completed ${total} quest${total === 1 ? '' : 's'}.`;
    summaryList.innerHTML = '';
    ['look', 'laugh', 'learn', 'compete', 'local'].forEach(type => {
      const count = score[type];
      if (count > 0) {
        const li = document.createElement('li');
        const label = type === 'look' ? 'Discoveries' : type === 'laugh' ? 'Laughs' : type === 'learn' ? 'Facts' : type === 'compete' ? 'Wins' : 'Local';
        li.textContent = `${label}: ${count}`;
        summaryList.appendChild(li);
      }
    });
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
    return tripSettings.gameLength === 'short' ? 6 : 9;
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
      huntStatus.textContent = `${presetLabel} • ${themeLabel}: ${activeCount} current target${activeCount === 1 ? '' : 's'} to watch for. ${remainingFinds} more find${remainingFinds === 1 ? '' : 's'} to reach the milestone.${judgeNote ? ` ${judgeNote}` : ''}`;
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
    const settingsCandidates = baseCandidates.filter(triviaItemAllowedBySettings);
    const candidatePool = settingsCandidates.length ? settingsCandidates : baseCandidates;
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
      });
      triviaChoices.appendChild(button);
    });
  }

  function renderTriviaCategories() {
    triviaCategoryGrid.innerHTML = '';
    const visibleCategories = triviaCategories.filter(category => (
      !tripSettings.noPopCulture || !isPopCultureTriviaCategory(category.id)
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
    triviaIntro.textContent = `Pick a lane, take turns answering, and tap the player that gets it right. This run has up to ${getTriviaQuestionLimit()} questions.`;
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
    renderAwardButtons(triviaAwardButtons, 'Got It', awardTrivia);
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
    triviaHandoff.textContent = `Hand the phone to ${getTurnPlayerName(triviaIndex)}.${judgeNote ? ` ${judgeNote}` : ''}`;
    triviaQuestion.textContent = item.question;
    triviaAnswer.textContent = item.answer;
    triviaAnswer.hidden = true;
    renderTriviaChoices(item);
    triviaQuestionAwarded = false;
    renderAwardButtons(triviaAwardButtons, 'Got It', awardTrivia);
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

  function createPongState() {
    const width = pongCanvas.width;
    const height = pongCanvas.height;
    return {
      width,
      height,
      paddleWidth: 14,
      paddleHeight: 86,
      leftY: height / 2 - 43,
      rightY: height / 2 - 43,
      ballX: width / 2,
      ballY: height / 2,
      ballVX: 4.5 * (Math.random() > 0.5 ? 1 : -1),
      ballVY: 2.5 * (Math.random() > 0.5 ? 1 : -1),
      ballSize: 12,
      leftScore: 0,
      rightScore: 0,
      targetScore: 7,
    };
  }

  function resetPongBall(direction = Math.random() > 0.5 ? 1 : -1) {
    if (!pongState) return;
    pongState.ballX = pongState.width / 2;
    pongState.ballY = pongState.height / 2;
    pongState.ballVX = 4.5 * direction;
    pongState.ballVY = (Math.random() * 4) - 2;
  }

  function drawPong() {
    if (!pongCanvas || !pongState) return;
    const ctx = pongCanvas.getContext('2d');
    ctx.clearRect(0, 0, pongState.width, pongState.height);
    ctx.fillStyle = '#08284a';
    ctx.fillRect(0, 0, pongState.width, pongState.height);

    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    for (let y = 12; y < pongState.height; y += 28) {
      ctx.fillRect(pongState.width / 2 - 2, y, 4, 14);
    }

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
    const rightName = players[1] ? players[1].name : 'P2';
    pongScore.textContent = `${pongState.leftScore} : ${pongState.rightScore}`;
    pongStatus.textContent = `${leftName} controls the left half, ${rightName} controls the right half. Drag on the board. First to ${pongState.targetScore} wins.`;
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
    const speed = 7;
    const maxY = pongState.height - pongState.paddleHeight;
    if (pongKeys.leftUp) pongState.leftY -= speed;
    if (pongKeys.leftDown) pongState.leftY += speed;
    if (pongKeys.rightUp) pongState.rightY -= speed;
    if (pongKeys.rightDown) pongState.rightY += speed;

    if (!pongKeys.rightUp && !pongKeys.rightDown && players.length < 2) {
      const target = pongState.ballY - pongState.paddleHeight / 2;
      pongState.rightY += Math.sign(target - pongState.rightY) * Math.min(4, Math.abs(target - pongState.rightY));
    }

    pongState.leftY = Math.max(0, Math.min(maxY, pongState.leftY));
    pongState.rightY = Math.max(0, Math.min(maxY, pongState.rightY));
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
    pongStatus.textContent = 'Pong is live. Drag on either half of the board, or use W/S and ↑/↓.';
    tickPong();
  }

  function stopPong() {
    pongRunning = false;
    if (pongAnimationFrame) {
      window.cancelAnimationFrame(pongAnimationFrame);
      pongAnimationFrame = null;
    }
  }

  function resetPongGame() {
    stopPong();
    pongState = createPongState();
    pongKeys = {};
    pongPointerSides = {};
    updatePongScore();
    drawPong();
  }

  function startPongGame() {
    resetGame();
    resetPongGame();
    showSection('pong');
  }

  function showPongSummary() {
    stopPong();
    showSection('summary');
    if (!pongState) pongState = createPongState();
    const leftName = players[0] ? players[0].name : 'P1';
    const rightName = players[1] ? players[1].name : 'P2';
    const leaders = pongState.leftScore === pongState.rightScore
      ? []
      : [pongState.leftScore > pongState.rightScore ? leftName : rightName];
    summaryText.textContent = leaders.length
      ? `${leaders[0]} wins Road Pong, ${pongState.leftScore} to ${pongState.rightScore}.`
      : `Road Pong ends in a tie, ${pongState.leftScore} to ${pongState.rightScore}.`;
    summaryList.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = 'Prize idea: winner chooses the next mini-game or gets one song veto.';
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
    selectedCategory = mode;
    if (mode === 'secret') {
      startSecretMode();
    } else if (mode === 'pong') {
      startPongGame();
    } else if (mode === 'scavenger') {
      startScavengerHunt();
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

  function startQuickStart() {
    const quickModes = ['random', 'scavenger', 'trivia', 'jokes', 'pi', 'pong', 'learn', 'look', 'laugh', 'compete'];
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
      selectedCategory = target.getAttribute('data-category');
      if (selectedCategory === 'quickstart') {
        startQuickStart();
      } else if (selectedCategory === 'local') {
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
      } else if (selectedCategory === 'secret') {
        startSecretMode();
      } else {
        regionCode = '*';
        startAdventure();
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
    // Update score for last question
    const last = adventureQuestions[currentIndex];
    if (last) {
      score[last.category]++;
    }
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
  calculateTripButton.addEventListener('click', calculateTripTime);
  calculatorSwapButton.addEventListener('click', swapCalculatorSpeeds);
  [calcMiles, calcSpeedA, calcSpeedB].forEach(input => {
    input.addEventListener('input', calculateTripTime);
  });
  savePiScoresButton.addEventListener('click', savePiScores);
  finishPiButton.addEventListener('click', showPiSummary);
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
    if (event.key === 'ArrowUp') pongKeys.rightUp = true;
    if (event.key === 'ArrowDown') pongKeys.rightDown = true;
  });
  document.addEventListener('keyup', event => {
    if (event.key === 'w' || event.key === 'W') pongKeys.leftUp = false;
    if (event.key === 's' || event.key === 'S') pongKeys.leftDown = false;
    if (event.key === 'ArrowUp') pongKeys.rightUp = false;
    if (event.key === 'ArrowDown') pongKeys.rightDown = false;
  });
  document.addEventListener('fullscreenchange', updatePongFullscreenButton);
  if (appLogo) appLogo.addEventListener('click', handleLogoClick);
  if (closeLogoPrankButton) {
    closeLogoPrankButton.addEventListener('click', () => {
      logoPrank.hidden = true;
    });
  }
  document.addEventListener('click', event => {
    const adminButton = event.target.closest('button[data-admin-launch]');
    if (!adminButton) return;
    launchAdminMode(adminButton.dataset.adminLaunch);
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
  });
  window.addEventListener('load', () => {
    initPreferences();
    initSavedUserData();
    tripSettings = normalizeTripSettings(tripSettings);
    populateTripSettingsForm();
    applyTripSettings();
    renderPlayerFields();
    passengerConfirmButton.addEventListener('click', confirmPassengerStatus);
    passengerConfirmButton.focus();
  });
})();

/* Runtime cleanup for loaded trivia packs. */
(function () {
  const curatedRoadTripQuestions = [
    {
      id: 'roadside-mile-marker-purpose',
      category: 'cartrivia',
      difficulty: 'easy',
      question: 'What do highway mile markers usually help travelers figure out?',
      answer: 'Where they are along the road.',
      choices: [
        'Where they are along the road.',
        'The car speed limit history.',
        'The nearest radio station.',
        'How tall nearby hills are.',
      ],
    },
    {
      id: 'roadfood-waffle-house-sign',
      category: 'roadfood',
      difficulty: 'easy',
      question: 'Which breakfast food is also part of the name of a famous roadside diner chain?',
      answer: 'Waffle.',
      choices: [
        'Waffle.',
        'Bagel.',
        'Pancake.',
        'Muffin.',
      ],
    },
    {
      id: 'landmarks-four-corners',
      category: 'landmarks',
      difficulty: 'medium',
      question: 'At Four Corners Monument, how many U.S. states meet at one point?',
      answer: 'Four.',
      choices: [
        'Four.',
        'Two.',
        'Three.',
        'Five.',
      ],
    },
    {
      id: 'science-road-mirage',
      category: 'science',
      difficulty: 'medium',
      question: 'On a hot road, what usually makes a puddle-like mirage appear?',
      answer: 'Light bending through layers of warm air.',
      choices: [
        'Light bending through layers of warm air.',
        'Steam rising from hidden water.',
        'Tiny mirrors in the pavement.',
        'Dust reflecting moonlight.',
      ],
    },
    {
      id: 'geography-continental-divide',
      category: 'geography',
      difficulty: 'medium',
      question: 'A Continental Divide mostly separates what?',
      answer: 'Watersheds that drain toward different oceans.',
      choices: [
        'Watersheds that drain toward different oceans.',
        'Time zones by exactly one hour.',
        'States with mountains from states without mountains.',
        'Highways from railroad tracks.',
      ],
    },
    {
      id: 'animals-roadrunner-state-bird',
      category: 'animals',
      difficulty: 'medium',
      question: 'The greater roadrunner is the state bird of which U.S. state?',
      answer: 'New Mexico.',
      choices: [
        'New Mexico.',
        'Arizona.',
        'Texas.',
        'Nevada.',
      ],
    },
    {
      id: 'nationalparks-junior-ranger',
      category: 'nationalparks',
      difficulty: 'easy',
      question: 'In many U.S. national parks, what program lets kids complete activities and earn a badge?',
      answer: 'Junior Ranger.',
      choices: [
        'Junior Ranger.',
        'Trail Captain.',
        'Canyon Scout.',
        'Park Pilot.',
      ],
    },
    {
      id: 'technology-offline-map-tiles',
      category: 'technology',
      difficulty: 'medium',
      question: 'When a map app works without signal, what did it usually save ahead of time?',
      answer: 'Map data on the device.',
      choices: [
        'Map data on the device.',
        'A live satellite connection.',
        'The car license plate.',
        'A phone call to every tower.',
      ],
    },
  ];

  window.RTA_TRIVIA_QUESTIONS = (window.RTA_TRIVIA_QUESTIONS || []).concat(curatedRoadTripQuestions);

  const questionPolishById = {
    'parks-acadia-state': {
      question: 'A rocky Atlantic park with carriage roads, tide pools, and Cadillac Mountain points you to what state?',
      difficulty: 'medium',
    },
    'parks-everglades-state': {
      question: 'If a park protects sawgrass marsh, mangroves, alligators, and crocodiles, what state are you visiting?',
      difficulty: 'easy',
    },
    'parks-zion-state': {
      question: 'The park with Zion Canyon, Angels Landing, and the Narrows is in which red-rock state?',
      difficulty: 'easy',
    },
    'parks-big-bend-state': {
      question: 'Big Bend follows a huge curve of the Rio Grande along the border of what state?',
      difficulty: 'medium',
    },
    'parks-joshua-tree-state': {
      question: 'Joshua Tree mixes Mojave and Colorado Desert landscapes in what state?',
      difficulty: 'medium',
    },
    'parks-canyonlands-state': {
      question: 'Canyonlands is carved by the Colorado and Green Rivers near Moab in what state?',
      difficulty: 'medium',
    },
    'parks-hot-springs-state': {
      question: 'Bathhouse Row and naturally heated spring water are the giveaway clues for what state?',
      difficulty: 'medium',
    },
    'parks-kings-canyon-state': {
      question: 'Kings Canyon sits beside Sequoia in the Sierra Nevada of what state?',
      difficulty: 'medium',
    },
    'parks-white-sands-state': {
      question: 'White Sands protects bright gypsum dunes near Alamogordo in what state?',
      difficulty: 'medium',
    },
    'parks-great-sand-dunes-state': {
      question: 'The tallest sand dunes in North America rise below the Sangre de Cristo Mountains in what state?',
      difficulty: 'medium',
    },
    'parks-voyageurs-state': {
      question: 'Voyageurs is a water-and-islands park along the Canadian border in what state?',
      difficulty: 'medium',
    },
    'parks-isle-royale-state': {
      question: 'Remote Isle Royale sits in Lake Superior but belongs to what state?',
      difficulty: 'hard',
    },
    'parks-congaree-state': {
      question: 'Congaree protects old-growth bottomland hardwood forest near Columbia in what state?',
      difficulty: 'medium',
    },
    'parks-guadalupe-peak': {
      question: 'Guadalupe Peak, protected inside Guadalupe Mountains National Park, is the highest point of what state?',
      difficulty: 'medium',
    },
    'parks-north-cascades-state': {
      question: 'North Cascades protects jagged peaks and glacier-fed lakes near the Canadian border in what state?',
      difficulty: 'medium',
    },
    'parks-grand-teton-state': {
      question: 'Grand Teton rises above Jackson Hole just south of Yellowstone in what state?',
      difficulty: 'easy',
    },
    'parks-kenai-state': {
      question: 'Kenai Fjords is the place for tidewater glaciers, fjords, and coastal wildlife in what state?',
      difficulty: 'easy',
    },
    'parks-arches-state': {
      question: 'More than 2,000 natural stone arches near Moab point to what state?',
      difficulty: 'easy',
    },
    'parks-crater-lake-state': {
      question: 'A deep blue lake filling an ancient volcano caldera is the signature park of what state?',
      difficulty: 'medium',
    },
    'parks-bryce-state': {
      question: 'Bryce Canyon\'s orange hoodoo amphitheaters belong to what state?',
      difficulty: 'easy',
    },
    'parks-mammoth-cave-state': {
      question: 'The world\'s longest known cave system runs under rolling hills in what state?',
      difficulty: 'medium',
    },
    'parks-shenandoah-state': {
      question: 'Skyline Drive follows the Blue Ridge Mountains through Shenandoah in what state?',
      difficulty: 'medium',
    },
    'parks-carlsbad-state': {
      question: 'Carlsbad Caverns hides huge limestone rooms under the Chihuahuan Desert in what state?',
      difficulty: 'medium',
    },
    'parks-badlands-state': {
      question: 'Layered fossil beds and sharp prairie buttes make Badlands a landmark in what state?',
      difficulty: 'medium',
    },
    'parks-biscayne-state': {
      question: 'Biscayne is mostly water, coral reef, and islands just south of Miami in what state?',
      difficulty: 'easy',
    },
    'parks-cuyahoga-state': {
      question: 'Cuyahoga Valley follows a river corridor between Cleveland and Akron in what state?',
      difficulty: 'medium',
    },
    'parks-gateway-arch-state': {
      question: 'The smallest U.S. national park centers on St. Louis\'s Gateway Arch in what state?',
      difficulty: 'easy',
    },
    'parks-glacier-state': {
      question: 'Going-to-the-Sun Road crosses Glacier National Park in what state?',
      difficulty: 'medium',
    },
    'parks-hawaii-volcanoes-state': {
      question: 'Kilauea and Mauna Loa are protected inside Hawaiʻi Volcanoes National Park in what state?',
      difficulty: 'easy',
    },
    'parks-petrified-state': {
      question: 'Rainbow-colored badlands and fossilized logs mark Petrified Forest in what state?',
      difficulty: 'medium',
    },
    'parks-rocky-mountain-state': {
      question: 'Trail Ridge Road climbs above 12,000 feet in Rocky Mountain National Park in what state?',
      difficulty: 'easy',
    },
    'alaska-brown-bears': {
      question: 'Roughly what share of the world\'s brown bears live in Alaska?',
      difficulty: 'hard',
    },
    'alaska-bald-eagles': {
      question: 'Alaska has one of the country\'s largest populations of which white-headed raptor?',
      difficulty: 'easy',
    },
  };

  const questions = window.RTA_TRIVIA_QUESTIONS || [];
  const seenExactQuestions = new Set();
  const seenLooseQuestions = new Set();
  const dropIds = new Set([
    'nationalparks-what-is-the-largest-national-park-in-the-united-states',
    'weirdlaws-in-massachusetts-what-kind-of-candy-was-once-restricted-on-sundays-2',
    'weirdlaws-in-michigan-what-type-of-person-was-once-forbidden-from-cutting-a-woma-2',
    'desertwest-what-is-the-lowest-point-in-north-america',
    'space-what-planet-is-known-as-the-red-planet',
  ]);

  function normalizeExact(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function normalizeLoose(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function inferDifficulty(item) {
    const text = normalizeLoose(`${item.question} ${item.answer}`);
    if (/which state|what state|capital|true or false|color|planet known as/.test(text)) return 'easy';
    if (/largest|smallest|first|tallest|deepest|highest|official|invented|created|record|continental divide|mirage/.test(text)) return 'medium';
    if (/approximately|specific|century|eruption|inaccessible|westernmost|combined|year/.test(text)) return 'hard';
    return 'medium';
  }

  function polishQuestion(item) {
    if (questionPolishById[item.id]) {
      Object.assign(item, questionPolishById[item.id]);
    }

    if (item.id === 'nationalparks-how-many-u-s-national-parks-are-there-as-of-2026') {
      item.question = 'How many U.S. national parks are there in the National Park Service count used by this game?';
      item.answer = '63.';
      item.choices = ['63.', '52.', '71.', '89.'];
      item.difficulty = 'hard';
    }

    if (item.id === 'nationalparks-which-national-park-was-the-most-visited-in-recent-years') {
      item.question = 'Which U.S. national park is famous for regularly drawing the most annual visitors?';
      item.answer = 'Great Smoky Mountains.';
      item.choices = ['Great Smoky Mountains.', 'Yellowstone.', 'Yosemite.', 'Zion.'];
      item.difficulty = 'medium';
    }

    if (item.id === 'sports-2019-womens-world-cup') {
      item.question = 'Which country won the FIFA Women\'s World Cup hosted by France?';
      item.difficulty = 'medium';
    }

    if (item.id === 'decades-2020s-barbenheimer') {
      item.question = 'What nickname did people use for the same-day excitement around Barbie and Oppenheimer?';
      item.difficulty = 'medium';
    }

    if (item.id === 'decades-2010s-instagram') {
      item.question = 'Which photo-sharing app helped define early smartphone filters and square photos?';
      item.difficulty = 'easy';
    }

    if (!item.difficulty) item.difficulty = inferDifficulty(item);
  }

  window.RTA_TRIVIA_QUESTIONS = questions.filter((item) => {
    if (!item || !item.question) {
      return false;
    }

    if (dropIds.has(item.id)) return false;

    polishQuestion(item);

    const exactKey = normalizeExact(item.question);
    const looseKey = [item.category || 'general', normalizeLoose(item.question), normalizeLoose(item.answer)].join('::');

    if (seenExactQuestions.has(exactKey) || seenLooseQuestions.has(looseKey)) {
      return false;
    }

    seenExactQuestions.add(exactKey);
    seenLooseQuestions.add(looseKey);
    return true;
  });
})();

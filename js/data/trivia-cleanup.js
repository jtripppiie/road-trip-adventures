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

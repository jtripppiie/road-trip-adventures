/* Curse of Oak Island trivia pack.

   Add more questions to the array below. Each question needs:
   - id: unique, lowercase, hyphenated (keep the "oak-" prefix)
   - category: "oakisland"
   - question, answer
   - choices: array of 4 unique options, one of which exactly equals answer
*/
(function () {
  window.RTA_TRIVIA_CATEGORIES = (window.RTA_TRIVIA_CATEGORIES || []).concat([
    {
      id: 'oakisland',
      label: 'Curse of Oak Island',
      emoji: '🏝️',
    },
  ]);

  window.RTA_TRIVIA_QUESTIONS = (window.RTA_TRIVIA_QUESTIONS || []).concat([
    {
      id: 'oak-island-location',
      category: 'oakisland',
      question: 'Off the coast of which Canadian province is Oak Island located?',
      answer: 'Nova Scotia.',
      choices: [
        'Nova Scotia.',
        'New Brunswick.',
        'Newfoundland.',
        'Prince Edward Island.',
      ],
    },
    {
      id: 'oak-island-brothers',
      category: 'oakisland',
      question: 'Which two brothers lead the modern treasure hunt featured on the show?',
      answer: 'Rick and Marty Lagina.',
      choices: [
        'Rick and Marty Lagina.',
        'Dan and Dave Blankenship.',
        'Craig and Gary Drayton.',
        'Charles and Fred Nolan.',
      ],
    },
    {
      id: 'oak-island-money-pit',
      category: 'oakisland',
      question: 'What is the famous original excavation site on Oak Island commonly called?',
      answer: 'The Money Pit.',
      choices: [
        'The Money Pit.',
        'The Deep Vault.',
        'The Gold Shaft.',
        'The Treasure Well.',
      ],
    },
    {
      id: 'oak-island-swamp',
      category: 'oakisland',
      question: 'Which feature on the island is repeatedly searched and theorized to be man-made?',
      answer: 'The Money Pit swamp.',
      choices: [
        'The Money Pit swamp.',
        'The lighthouse cove.',
        'The northern cliffs.',
        'The eastern sandbar.',
      ],
    },
    {
      id: 'oak-island-network',
      category: 'oakisland',
      question: 'On which television network does The Curse of Oak Island air in the United States?',
      answer: 'History.',
      choices: [
        'History.',
        'Discovery.',
        'National Geographic.',
        'Travel Channel.',
      ],
    },
  ]);
})();

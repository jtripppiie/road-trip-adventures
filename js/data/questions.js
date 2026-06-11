/* Extra adventure prompt packs.
   Add prompts here and they will merge into the app's built-in adventure deck. */
(function () {
  window.RTA_ADVENTURE_PROMPTS = [
    {
      id: 'look-window-snapshot',
      category: 'look',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Window snapshot: everyone gets 10 seconds to memorize the view, then says one thing they noticed.',
      points: 1,
    },
    {
      id: 'laugh-billboard-remix',
      category: 'laugh',
      ageGroups: ['teens', 'adults', 'mixed'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Pick a billboard or sign and give it a funnier slogan.',
      points: 1,
    },
    {
      id: 'learn-town-origin',
      category: 'learn',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Find a town, road, or landmark name and make your best guess about where the name came from.',
      points: 1,
    },
    {
      id: 'compete-quiet-count',
      category: 'compete',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: true,
      text: 'Silent count: for 30 seconds, count how many road signs you pass. Closest count wins.',
      points: 1,
    },
    {
      id: 'local-best-tour-guide',
      category: 'local',
      ageGroups: ['*'],
      regions: ['*'],
      requiresTimer: false,
      text: 'Tour guide challenge: invent a 15-second tour-guide intro for something local you can see.',
      points: 1,
    },
  ];
})();

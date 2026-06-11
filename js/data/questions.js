/* Extra adventure prompt packs.
   Add prompts here and they will merge into the app's built-in adventure deck.

   Learning prompts can include:
   learnTopic: biology | science | cars | states | constitution | government |
     solar | cheese | animals | history | facts
*/
(function () {
  window.RTA_LEARN_TOPICS = [
    { id: 'all', label: 'All Topics', emoji: '🎲' },
    { id: 'facts', label: 'Random Facts', emoji: '💡' },
    { id: 'biology', label: 'Biology', emoji: '🧬' },
    { id: 'science', label: 'Science', emoji: '🔬' },
    { id: 'cars', label: 'Cars', emoji: '🚗' },
    { id: 'states', label: 'States', emoji: '🗺️' },
    { id: 'constitution', label: 'Constitution', emoji: '📜' },
    { id: 'government', label: 'Government', emoji: '🏛️' },
    { id: 'solar', label: 'Solar System', emoji: '☀️' },
    { id: 'cheese', label: 'Cheese', emoji: '🧀' },
    { id: 'animals', label: 'Animals', emoji: '🐾' },
    { id: 'history', label: 'History', emoji: '⏳' },
  ];

  const learningPrompts = [
    // Random Facts
    { id: 'learn-facts-honey', learnTopic: 'facts', text: 'Random fact: Honey can stay edible for a very long time because it is low in water and naturally acidic.' },
    { id: 'learn-facts-aglet', learnTopic: 'facts', text: 'Random fact: The small plastic or metal tip on a shoelace is called an aglet.' },
    { id: 'learn-facts-octagon', learnTopic: 'facts', text: 'Random fact: A stop sign is an octagon, an eight-sided shape that is easy to recognize from far away.' },
    { id: 'learn-facts-rainbow', learnTopic: 'facts', text: 'Random fact: People usually name seven rainbow colors: red, orange, yellow, green, blue, indigo, and violet.' },
    { id: 'learn-facts-url', learnTopic: 'facts', text: 'Random fact: URL stands for Uniform Resource Locator, which is the address of something on the web.' },
    { id: 'learn-facts-summer-solstice', learnTopic: 'facts', text: 'Random fact: The summer solstice is usually the longest daylight day of the year in the Northern Hemisphere.' },
    { id: 'learn-facts-saffron', learnTopic: 'facts', text: 'Random fact: Saffron is one of the most expensive spices by weight because it is harvested from tiny flower parts.' },
    { id: 'learn-facts-venus', learnTopic: 'facts', text: 'Random fact: Venus rotates in the opposite direction from most planets in our solar system.' },

    // Biology
    { id: 'learn-biology-heart', learnTopic: 'biology', text: 'Biology fact: Your heart is a muscle that pumps blood through your body.' },
    { id: 'learn-biology-skin', learnTopic: 'biology', text: 'Biology fact: Skin is the largest organ of the human body.' },
    { id: 'learn-biology-chlorophyll', learnTopic: 'biology', text: 'Biology fact: Chlorophyll is the green pigment plants use to help capture sunlight.' },
    { id: 'learn-biology-photosynthesis', learnTopic: 'biology', text: 'Biology fact: During photosynthesis, plants take in carbon dioxide and release oxygen.' },
    { id: 'learn-biology-nocturnal', learnTopic: 'biology', text: 'Biology fact: Nocturnal animals are most active at night.' },
    { id: 'learn-biology-dna', learnTopic: 'biology', text: 'Biology fact: DNA carries instructions that help living things grow and function.' },
    { id: 'learn-biology-cells', learnTopic: 'biology', text: 'Biology fact: Cells are the basic building blocks of living things.' },
    { id: 'learn-biology-pollen', learnTopic: 'biology', text: 'Biology fact: Pollinators like bees help move pollen between flowers, which helps many plants make seeds.' },
    { id: 'learn-biology-lungs', learnTopic: 'biology', text: 'Biology fact: Your lungs move oxygen into your blood and help remove carbon dioxide.' },
    { id: 'learn-biology-hallux', learnTopic: 'biology', text: 'Biology fact: The hallux is the anatomical name for the big toe.' },

    // Science
    { id: 'learn-science-gravity', learnTopic: 'science', text: 'Science fact: Gravity is the force that pulls objects toward each other.' },
    { id: 'learn-science-kinetic', learnTopic: 'science', text: 'Science fact: A moving car has kinetic energy, which is energy of motion.' },
    { id: 'learn-science-water', learnTopic: 'science', text: 'Science fact: The chemical formula for water is H2O.' },
    { id: 'learn-science-visible-light', learnTopic: 'science', text: 'Science fact: Visible light is the part of the electromagnetic spectrum our eyes can detect.' },
    { id: 'learn-science-blue-mountains', learnTopic: 'science', text: 'Science fact: Distant mountains can look blue because air scatters shorter blue wavelengths of light.' },
    { id: 'learn-science-sedimentary', learnTopic: 'science', text: 'Science fact: Most fossils are found in sedimentary rock.' },
    { id: 'learn-science-density', learnTopic: 'science', text: 'Science fact: Density compares how much mass is packed into a certain amount of space.' },
    { id: 'learn-science-friction', learnTopic: 'science', text: 'Science fact: Friction helps tires grip the road, especially when braking or turning.' },
    { id: 'learn-science-sound', learnTopic: 'science', text: 'Science fact: Sound travels as vibrations through air, water, or solid materials.' },
    { id: 'learn-science-evaporation', learnTopic: 'science', text: 'Science fact: Evaporation happens when liquid water changes into water vapor.' },

    // Cars
    { id: 'learn-cars-combustion', learnTopic: 'cars', text: 'Car fact: In a gasoline engine, tiny controlled explosions push pistons that help turn the wheels.' },
    { id: 'learn-cars-ev', learnTopic: 'cars', text: 'Car fact: Electric vehicles use battery power and electric motors instead of gasoline engines.' },
    { id: 'learn-cars-abs', learnTopic: 'cars', text: 'Car fact: Anti-lock brakes help prevent wheels from locking during hard braking.' },
    { id: 'learn-cars-tread', learnTopic: 'cars', text: 'Car fact: Tire tread helps channel water away so tires can grip wet roads better.' },
    { id: 'learn-cars-seatbelt', learnTopic: 'cars', text: 'Car fact: Seat belts spread crash forces across stronger parts of the body.' },
    { id: 'learn-cars-airbags', learnTopic: 'cars', text: 'Car fact: Airbags inflate very quickly to help cushion passengers during certain crashes.' },
    { id: 'learn-cars-hybrid', learnTopic: 'cars', text: 'Car fact: Hybrid cars use both an engine and an electric motor.' },
    { id: 'learn-cars-odometer', learnTopic: 'cars', text: 'Car fact: An odometer measures how far a vehicle has traveled.' },
    { id: 'learn-cars-aerodynamics', learnTopic: 'cars', text: 'Car fact: Aerodynamic shapes help vehicles move through air with less drag.' },
    { id: 'learn-cars-catalytic', learnTopic: 'cars', text: 'Car fact: A catalytic converter helps reduce harmful emissions from many gas-powered cars.' },

    // States
    { id: 'learn-states-alaska', learnTopic: 'states', text: 'State fact: Alaska is the largest U.S. state by land area.' },
    { id: 'learn-states-rhode-island', learnTopic: 'states', text: 'State fact: Rhode Island is the smallest U.S. state by land area.' },
    { id: 'learn-states-hawaii', learnTopic: 'states', text: 'State fact: Hawaii is the only U.S. state made entirely of islands.' },
    { id: 'learn-states-california', learnTopic: 'states', text: 'State fact: California is nicknamed the Golden State.' },
    { id: 'learn-states-maine', learnTopic: 'states', text: 'State fact: Maine is home to Acadia National Park.' },
    { id: 'learn-states-arizona', learnTopic: 'states', text: 'State fact: Arizona is home to Grand Canyon National Park.' },
    { id: 'learn-states-florida', learnTopic: 'states', text: 'State fact: Florida is known as the Sunshine State.' },
    { id: 'learn-states-new-york', learnTopic: 'states', text: 'State fact: New York is nicknamed the Empire State.' },
    { id: 'learn-states-texas', learnTopic: 'states', text: 'State fact: Texas is nicknamed the Lone Star State.' },
    { id: 'learn-states-wyoming', learnTopic: 'states', text: 'State fact: Wyoming was the first U.S. state to grant women the right to vote.' },

    // Constitution
    { id: 'learn-constitution-preamble', learnTopic: 'constitution', text: 'Constitution fact: The Preamble begins with the words "We the People."' },
    { id: 'learn-constitution-articles', learnTopic: 'constitution', text: 'Constitution fact: The original U.S. Constitution has seven articles.' },
    { id: 'learn-constitution-amendments', learnTopic: 'constitution', text: 'Constitution fact: Amendments are formal changes or additions to the Constitution.' },
    { id: 'learn-constitution-bill-rights', learnTopic: 'constitution', text: 'Constitution fact: The Bill of Rights is the first ten amendments.' },
    { id: 'learn-constitution-first', learnTopic: 'constitution', text: 'Constitution fact: The First Amendment protects freedoms including speech, religion, press, assembly, and petition.' },
    { id: 'learn-constitution-checks', learnTopic: 'constitution', text: 'Constitution fact: Checks and balances help keep one branch of government from becoming too powerful.' },
    { id: 'learn-constitution-ratified', learnTopic: 'constitution', text: 'Constitution fact: The Constitution was written in 1787 and later ratified by the states.' },
    { id: 'learn-constitution-supreme-law', learnTopic: 'constitution', text: 'Constitution fact: The Constitution is often called the supreme law of the United States.' },

    // Government
    { id: 'learn-government-branches', learnTopic: 'government', text: 'Government fact: The U.S. federal government has three branches: legislative, executive, and judicial.' },
    { id: 'learn-government-congress', learnTopic: 'government', text: 'Government fact: Congress has two chambers: the Senate and the House of Representatives.' },
    { id: 'learn-government-senate', learnTopic: 'government', text: 'Government fact: Every U.S. state has two senators.' },
    { id: 'learn-government-house', learnTopic: 'government', text: 'Government fact: Seats in the House of Representatives are based on state population.' },
    { id: 'learn-government-president', learnTopic: 'government', text: 'Government fact: The President is part of the executive branch.' },
    { id: 'learn-government-courts', learnTopic: 'government', text: 'Government fact: The Supreme Court is part of the judicial branch.' },
    { id: 'learn-government-veto', learnTopic: 'government', text: 'Government fact: A presidential veto can reject a bill, but Congress can override some vetoes with enough votes.' },
    { id: 'learn-government-federalism', learnTopic: 'government', text: 'Government fact: Federalism means power is shared between national and state governments.' },

    // Solar System
    { id: 'learn-solar-sun', learnTopic: 'solar', text: 'Solar fact: The Sun is a star at the center of our solar system.' },
    { id: 'learn-solar-mercury', learnTopic: 'solar', text: 'Solar fact: Mercury is the closest planet to the Sun.' },
    { id: 'learn-solar-venus', learnTopic: 'solar', text: 'Solar fact: Venus is the hottest planet on average because of its thick atmosphere.' },
    { id: 'learn-solar-mars', learnTopic: 'solar', text: 'Solar fact: Mars is often called the Red Planet because iron-rich dust gives it a rusty color.' },
    { id: 'learn-solar-jupiter', learnTopic: 'solar', text: 'Solar fact: Jupiter is the largest planet in our solar system.' },
    { id: 'learn-solar-saturn', learnTopic: 'solar', text: 'Solar fact: Saturn is famous for its bright ring system.' },
    { id: 'learn-solar-uranus', learnTopic: 'solar', text: 'Solar fact: Uranus rotates on its side compared with most planets.' },
    { id: 'learn-solar-neptune', learnTopic: 'solar', text: 'Solar fact: Neptune is the farthest known planet from the Sun.' },
    { id: 'learn-solar-asteroid-belt', learnTopic: 'solar', text: 'Solar fact: The asteroid belt sits mostly between Mars and Jupiter.' },
    { id: 'learn-solar-moon', learnTopic: 'solar', text: 'Solar fact: Earth has one natural moon.' },

    // Cheese
    { id: 'learn-cheese-curds', learnTopic: 'cheese', text: 'Cheese fact: Cheese curds are fresh pieces of curdled milk, often squeaky when very fresh.' },
    { id: 'learn-cheese-rennet', learnTopic: 'cheese', text: 'Cheese fact: Rennet is one ingredient cheesemakers can use to help milk form curds.' },
    { id: 'learn-cheese-cheddar', learnTopic: 'cheese', text: 'Cheese fact: Cheddar originated in the English village of Cheddar.' },
    { id: 'learn-cheese-mozzarella', learnTopic: 'cheese', text: 'Cheese fact: Mozzarella is famous for melting well, which is why it is common on pizza.' },
    { id: 'learn-cheese-blue', learnTopic: 'cheese', text: 'Cheese fact: Blue cheese gets its blue-green veins from edible molds used during aging.' },
    { id: 'learn-cheese-swiss', learnTopic: 'cheese', text: 'Cheese fact: The holes in some Swiss-style cheeses are called eyes.' },
    { id: 'learn-cheese-aged', learnTopic: 'cheese', text: 'Cheese fact: Aging can make cheese firmer and deepen its flavor.' },
    { id: 'learn-cheese-brie', learnTopic: 'cheese', text: 'Cheese fact: Brie is a soft cheese with an edible rind.' },

    // Animals
    { id: 'learn-animals-cheetah', learnTopic: 'animals', text: 'Animal fact: The cheetah is the fastest land animal.' },
    { id: 'learn-animals-giraffe', learnTopic: 'animals', text: 'Animal fact: Giraffes are the tallest land animals.' },
    { id: 'learn-animals-flamingos', learnTopic: 'animals', text: 'Animal fact: A group of flamingos can be called a flamboyance.' },
    { id: 'learn-animals-porcupine', learnTopic: 'animals', text: 'Animal fact: Porcupines are covered in sharp quills for defense.' },
    { id: 'learn-animals-lizards', learnTopic: 'animals', text: 'Animal fact: Some lizards can detach their tails to escape predators.' },
    { id: 'learn-animals-manatee', learnTopic: 'animals', text: 'Animal fact: Manatees are sometimes nicknamed sea cows.' },
    { id: 'learn-animals-komodo', learnTopic: 'animals', text: 'Animal fact: A Komodo dragon is a large lizard.' },
    { id: 'learn-animals-bees', learnTopic: 'animals', text: 'Animal fact: Bees collect nectar from flowers and can help pollinate plants.' },
    { id: 'learn-animals-bats', learnTopic: 'animals', text: 'Animal fact: Bats are mammals, and many species use echolocation to navigate.' },
    { id: 'learn-animals-otters', learnTopic: 'animals', text: 'Animal fact: Sea otters sometimes hold onto kelp while resting so they do not drift away.' },

    // History
    { id: 'learn-history-earth-day', learnTopic: 'history', text: 'History fact: Earth Day was first celebrated in 1970.' },
    { id: 'learn-history-washington-dollar', learnTopic: 'history', text: 'History fact: George Washington appears on the U.S. one-dollar bill.' },
    { id: 'learn-history-franklin-hundred', learnTopic: 'history', text: 'History fact: Benjamin Franklin appears on the U.S. hundred-dollar bill.' },
    { id: 'learn-history-jefferson-two', learnTopic: 'history', text: 'History fact: Thomas Jefferson appears on the U.S. two-dollar bill.' },
    { id: 'learn-history-amelia', learnTopic: 'history', text: 'History fact: Amelia Earhart was the first woman to fly solo across the Atlantic Ocean.' },
    { id: 'learn-history-genghis', learnTopic: 'history', text: 'History fact: Temujin became known as Genghis Khan.' },
    { id: 'learn-history-jfk', learnTopic: 'history', text: 'History fact: John F. Kennedy was assassinated in Dallas, Texas.' },
    { id: 'learn-history-yellowstone', learnTopic: 'history', text: 'History fact: Yellowstone became the first U.S. national park in 1872.' },
    { id: 'learn-history-facebook', learnTopic: 'history', text: 'History fact: Facebook launched in 2004.' },
    { id: 'learn-history-google', learnTopic: 'history', text: 'History fact: Google was originally developed under the project name BackRub.' },
  ].map(prompt => Object.assign({
    category: 'learn',
    ageGroups: ['*'],
    regions: ['*'],
    requiresTimer: false,
    points: 1,
  }, prompt));

  window.RTA_ADVENTURE_PROMPTS = learningPrompts.concat([
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
      learnTopic: 'history',
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
  ]);
})();

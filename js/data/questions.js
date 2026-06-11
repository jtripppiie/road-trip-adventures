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

    // More Random Facts
    { id: 'learn-facts-playing-cards', learnTopic: 'facts', text: 'Random fact: A standard deck has 52 playing cards, not counting jokers.' },
    { id: 'learn-facts-star-david', learnTopic: 'facts', text: 'Random fact: The Star of David has six points.' },
    { id: 'learn-facts-boxing-day', learnTopic: 'facts', text: 'Random fact: In the United Kingdom and several other places, the day after Christmas is called Boxing Day.' },
    { id: 'learn-facts-ice-cream-month', learnTopic: 'facts', text: 'Random fact: July is National Ice Cream Month in the United States.' },
    { id: 'learn-facts-mona-lisa', learnTopic: 'facts', text: 'Random fact: The Mona Lisa is displayed at the Louvre Museum in Paris.' },
    { id: 'learn-facts-pacific', learnTopic: 'facts', text: 'Random fact: The Pacific Ocean is the largest ocean on Earth.' },
    { id: 'learn-facts-russia', learnTopic: 'facts', text: 'Random fact: Russia is the largest country in the world by land area.' },
    { id: 'learn-facts-passport', learnTopic: 'facts', text: 'Random fact: A passport is the identity document most commonly needed for international travel.' },

    // More Biology
    { id: 'learn-biology-brain-neurons', learnTopic: 'biology', text: 'Biology fact: Neurons are cells that send signals through the brain and nervous system.' },
    { id: 'learn-biology-red-blood-cells', learnTopic: 'biology', text: 'Biology fact: Red blood cells carry oxygen using a protein called hemoglobin.' },
    { id: 'learn-biology-white-blood-cells', learnTopic: 'biology', text: 'Biology fact: White blood cells help the body fight infections.' },
    { id: 'learn-biology-stomach-acid', learnTopic: 'biology', text: 'Biology fact: Your stomach uses acid and enzymes to help break down food.' },
    { id: 'learn-biology-bones', learnTopic: 'biology', text: 'Biology fact: Adult humans usually have 206 bones.' },
    { id: 'learn-biology-muscles', learnTopic: 'biology', text: 'Biology fact: Skeletal muscles pull on bones to help the body move.' },
    { id: 'learn-biology-mitochondria', learnTopic: 'biology', text: 'Biology fact: Mitochondria help cells turn food energy into usable energy.' },
    { id: 'learn-biology-immune-memory', learnTopic: 'biology', text: 'Biology fact: The immune system can remember some germs it has fought before.' },
    { id: 'learn-biology-roots', learnTopic: 'biology', text: 'Biology fact: Plant roots absorb water and minerals from soil.' },
    { id: 'learn-biology-stomata', learnTopic: 'biology', text: 'Biology fact: Tiny openings called stomata help plants exchange gases with the air.' },

    // More Science
    { id: 'learn-science-atoms', learnTopic: 'science', text: 'Science fact: Atoms are tiny building blocks of matter.' },
    { id: 'learn-science-molecules', learnTopic: 'science', text: 'Science fact: Molecules form when atoms bond together.' },
    { id: 'learn-science-oxygen', learnTopic: 'science', text: 'Science fact: Oxygen is the gas humans need for cellular respiration.' },
    { id: 'learn-science-inertia', learnTopic: 'science', text: 'Science fact: Inertia is the tendency of an object to keep doing what it is already doing.' },
    { id: 'learn-science-refraction', learnTopic: 'science', text: 'Science fact: Refraction happens when light bends as it moves between materials.' },
    { id: 'learn-science-condensation', learnTopic: 'science', text: 'Science fact: Condensation happens when water vapor cools and becomes liquid water.' },
    { id: 'learn-science-pressure', learnTopic: 'science', text: 'Science fact: Air pressure changes with altitude, which is one reason ears can pop on mountain roads.' },
    { id: 'learn-science-magnetism', learnTopic: 'science', text: 'Science fact: Magnets have north and south poles.' },
    { id: 'learn-science-electricity', learnTopic: 'science', text: 'Science fact: Electric current is the flow of electric charge.' },
    { id: 'learn-science-weather-front', learnTopic: 'science', text: 'Science fact: A weather front is a boundary between two air masses.' },

    // More Cars
    { id: 'learn-cars-transmission', learnTopic: 'cars', text: 'Car fact: A transmission helps send power from the engine or motor to the wheels.' },
    { id: 'learn-cars-radiator', learnTopic: 'cars', text: 'Car fact: A radiator helps keep many engines from overheating.' },
    { id: 'learn-cars-alternator', learnTopic: 'cars', text: 'Car fact: In many gas-powered cars, the alternator helps charge the battery while the engine runs.' },
    { id: 'learn-cars-suspension', learnTopic: 'cars', text: 'Car fact: A suspension system helps absorb bumps and keep tires in contact with the road.' },
    { id: 'learn-cars-differential', learnTopic: 'cars', text: 'Car fact: A differential helps wheels turn at different speeds while a vehicle goes around a curve.' },
    { id: 'learn-cars-regenerative-braking', learnTopic: 'cars', text: 'Car fact: Regenerative braking can turn some motion energy back into electrical energy in hybrids and EVs.' },
    { id: 'learn-cars-vin', learnTopic: 'cars', text: 'Car fact: A VIN is a unique Vehicle Identification Number.' },
    { id: 'learn-cars-dashboard', learnTopic: 'cars', text: 'Car fact: Dashboard warning lights are designed to flag systems that may need attention.' },
    { id: 'learn-cars-crumple-zone', learnTopic: 'cars', text: 'Car fact: Crumple zones are designed to absorb crash energy before it reaches passengers.' },
    { id: 'learn-cars-wheelbase', learnTopic: 'cars', text: 'Car fact: Wheelbase is the distance between the front and rear axles.' },

    // More States
    { id: 'learn-states-delaware', learnTopic: 'states', text: 'State fact: Delaware is known as the First State because it was first to ratify the U.S. Constitution.' },
    { id: 'learn-states-louisiana', learnTopic: 'states', text: 'State fact: Louisiana is known as the Pelican State.' },
    { id: 'learn-states-georgia', learnTopic: 'states', text: 'State fact: Georgia is nicknamed the Peach State.' },
    { id: 'learn-states-michigan', learnTopic: 'states', text: 'State fact: Michigan touches four of the five Great Lakes.' },
    { id: 'learn-states-minnesota', learnTopic: 'states', text: 'State fact: Minnesota is nicknamed the North Star State.' },
    { id: 'learn-states-nevada', learnTopic: 'states', text: 'State fact: Nevada is nicknamed the Silver State.' },
    { id: 'learn-states-oregon', learnTopic: 'states', text: 'State fact: Oregon is nicknamed the Beaver State.' },
    { id: 'learn-states-tennessee', learnTopic: 'states', text: 'State fact: Tennessee is nicknamed the Volunteer State.' },
    { id: 'learn-states-vermont', learnTopic: 'states', text: 'State fact: Vermont is nicknamed the Green Mountain State.' },
    { id: 'learn-states-wisconsin', learnTopic: 'states', text: 'State fact: Wisconsin is nicknamed America\'s Dairyland.' },

    // More Constitution
    { id: 'learn-constitution-second', learnTopic: 'constitution', text: 'Constitution fact: The Second Amendment concerns the right to keep and bear arms.' },
    { id: 'learn-constitution-fourth', learnTopic: 'constitution', text: 'Constitution fact: The Fourth Amendment protects against unreasonable searches and seizures.' },
    { id: 'learn-constitution-fifth', learnTopic: 'constitution', text: 'Constitution fact: The Fifth Amendment includes protections related to due process and self-incrimination.' },
    { id: 'learn-constitution-sixth', learnTopic: 'constitution', text: 'Constitution fact: The Sixth Amendment includes the right to a speedy and public trial.' },
    { id: 'learn-constitution-thirteenth', learnTopic: 'constitution', text: 'Constitution fact: The Thirteenth Amendment abolished slavery in the United States, except as punishment for a crime.' },
    { id: 'learn-constitution-fourteenth', learnTopic: 'constitution', text: 'Constitution fact: The Fourteenth Amendment includes equal protection and due process protections.' },
    { id: 'learn-constitution-fifteenth', learnTopic: 'constitution', text: 'Constitution fact: The Fifteenth Amendment says voting rights cannot be denied because of race, color, or previous condition of servitude.' },
    { id: 'learn-constitution-nineteenth', learnTopic: 'constitution', text: 'Constitution fact: The Nineteenth Amendment recognized women\'s right to vote nationwide.' },
    { id: 'learn-constitution-twenty-second', learnTopic: 'constitution', text: 'Constitution fact: The Twenty-Second Amendment limits presidents to two elected terms.' },
    { id: 'learn-constitution-twenty-sixth', learnTopic: 'constitution', text: 'Constitution fact: The Twenty-Sixth Amendment lowered the voting age to 18.' },

    // More Government
    { id: 'learn-government-speaker', learnTopic: 'government', text: 'Government fact: The Speaker of the House leads the U.S. House of Representatives.' },
    { id: 'learn-government-vp-senate', learnTopic: 'government', text: 'Government fact: The Vice President can cast tie-breaking votes in the Senate.' },
    { id: 'learn-government-cabinet', learnTopic: 'government', text: 'Government fact: The President\'s Cabinet includes leaders of major executive departments.' },
    { id: 'learn-government-governor', learnTopic: 'government', text: 'Government fact: A governor is the chief executive of a state.' },
    { id: 'learn-government-mayor', learnTopic: 'government', text: 'Government fact: A mayor is often the elected leader of a city or town.' },
    { id: 'learn-government-bill', learnTopic: 'government', text: 'Government fact: A bill is a proposed law.' },
    { id: 'learn-government-law', learnTopic: 'government', text: 'Government fact: A bill must pass through the required lawmaking steps before becoming a law.' },
    { id: 'learn-government-census', learnTopic: 'government', text: 'Government fact: The U.S. census counts the population every 10 years.' },
    { id: 'learn-government-electoral-college', learnTopic: 'government', text: 'Government fact: The Electoral College is the system used to formally elect the U.S. president.' },
    { id: 'learn-government-local', learnTopic: 'government', text: 'Government fact: Local governments often handle services like roads, parks, libraries, and public safety.' },

    // More Solar System
    { id: 'learn-solar-light-year', learnTopic: 'solar', text: 'Solar fact: A light-year is a distance, not a time; it is how far light travels in one year.' },
    { id: 'learn-solar-comet', learnTopic: 'solar', text: 'Solar fact: Comets are icy objects that can grow glowing tails when they pass near the Sun.' },
    { id: 'learn-solar-meteor', learnTopic: 'solar', text: 'Solar fact: A meteor is the streak of light seen when space debris burns in Earth\'s atmosphere.' },
    { id: 'learn-solar-eclipse', learnTopic: 'solar', text: 'Solar fact: A solar eclipse happens when the Moon passes between Earth and the Sun.' },
    { id: 'learn-solar-lunar-eclipse', learnTopic: 'solar', text: 'Solar fact: A lunar eclipse happens when Earth\'s shadow falls on the Moon.' },
    { id: 'learn-solar-tilt', learnTopic: 'solar', text: 'Solar fact: Earth has seasons because its axis is tilted as it orbits the Sun.' },
    { id: 'learn-solar-day', learnTopic: 'solar', text: 'Solar fact: Earth rotates once about every 24 hours, creating day and night.' },
    { id: 'learn-solar-year', learnTopic: 'solar', text: 'Solar fact: Earth takes about 365.25 days to orbit the Sun.' },
    { id: 'learn-solar-galaxy', learnTopic: 'solar', text: 'Solar fact: Our solar system is located in the Milky Way galaxy.' },
    { id: 'learn-solar-dwarf-planet', learnTopic: 'solar', text: 'Solar fact: Pluto is classified as a dwarf planet.' },

    // More Cheese
    { id: 'learn-cheese-casein', learnTopic: 'cheese', text: 'Cheese fact: Casein is a milk protein that helps form cheese curds.' },
    { id: 'learn-cheese-whey', learnTopic: 'cheese', text: 'Cheese fact: Whey is the liquid left after milk forms curds.' },
    { id: 'learn-cheese-goat', learnTopic: 'cheese', text: 'Cheese fact: Goat cheese is often tangy because goat milk has a different fat and protein profile from cow milk.' },
    { id: 'learn-cheese-feta', learnTopic: 'cheese', text: 'Cheese fact: Feta is a brined cheese strongly associated with Greece.' },
    { id: 'learn-cheese-parmesan', learnTopic: 'cheese', text: 'Cheese fact: Parmesan-style cheeses are hard, aged cheeses often grated over food.' },
    { id: 'learn-cheese-gouda', learnTopic: 'cheese', text: 'Cheese fact: Gouda is a Dutch cheese that can be young and mild or aged and nutty.' },
    { id: 'learn-cheese-culture', learnTopic: 'cheese', text: 'Cheese fact: Starter cultures are helpful bacteria that shape cheese flavor and texture.' },
    { id: 'learn-cheese-lactose', learnTopic: 'cheese', text: 'Cheese fact: Many aged cheeses have less lactose than fresh milk.' },
    { id: 'learn-cheese-melting', learnTopic: 'cheese', text: 'Cheese fact: Moisture, fat, acidity, and protein structure all affect how cheese melts.' },
    { id: 'learn-cheese-pasteurization', learnTopic: 'cheese', text: 'Cheese fact: Pasteurization heats milk to reduce harmful microbes.' },

    // More Animals
    { id: 'learn-animals-octopus', learnTopic: 'animals', text: 'Animal fact: Octopuses have three hearts.' },
    { id: 'learn-animals-shark', learnTopic: 'animals', text: 'Animal fact: Sharks have skeletons made mostly of cartilage instead of bone.' },
    { id: 'learn-animals-elephant', learnTopic: 'animals', text: 'Animal fact: Elephants use their trunks for breathing, smelling, drinking, and grabbing objects.' },
    { id: 'learn-animals-penguin', learnTopic: 'animals', text: 'Animal fact: Penguins are birds, but they are adapted for swimming instead of flying.' },
    { id: 'learn-animals-hummingbird', learnTopic: 'animals', text: 'Animal fact: Hummingbirds can hover by rapidly beating their wings.' },
    { id: 'learn-animals-camel', learnTopic: 'animals', text: 'Animal fact: Camels store fat in their humps, which helps them survive when food is scarce.' },
    { id: 'learn-animals-frog', learnTopic: 'animals', text: 'Animal fact: Frogs can absorb water through their skin.' },
    { id: 'learn-animals-butterfly', learnTopic: 'animals', text: 'Animal fact: Butterflies begin life as caterpillars before transforming through metamorphosis.' },
    { id: 'learn-animals-wolf', learnTopic: 'animals', text: 'Animal fact: Wolves are social animals that often live and hunt in packs.' },
    { id: 'learn-animals-dolphin', learnTopic: 'animals', text: 'Animal fact: Dolphins are mammals and must come to the surface to breathe air.' },

    // More History
    { id: 'learn-history-printing-press', learnTopic: 'history', text: 'History fact: Johannes Gutenberg helped popularize movable-type printing in Europe in the 1400s.' },
    { id: 'learn-history-magna-carta', learnTopic: 'history', text: 'History fact: Magna Carta was sealed in England in 1215.' },
    { id: 'learn-history-declaration', learnTopic: 'history', text: 'History fact: The Declaration of Independence was adopted on July 4, 1776.' },
    { id: 'learn-history-constitution-convention', learnTopic: 'history', text: 'History fact: The Constitutional Convention met in Philadelphia in 1787.' },
    { id: 'learn-history-louisiana-purchase', learnTopic: 'history', text: 'History fact: The Louisiana Purchase nearly doubled the size of the United States in 1803.' },
    { id: 'learn-history-civil-war', learnTopic: 'history', text: 'History fact: The U.S. Civil War lasted from 1861 to 1865.' },
    { id: 'learn-history-transcontinental-railroad', learnTopic: 'history', text: 'History fact: The first U.S. transcontinental railroad was completed in 1869.' },
    { id: 'learn-history-wright-brothers', learnTopic: 'history', text: 'History fact: The Wright brothers made their first powered flight in 1903.' },
    { id: 'learn-history-apollo-11', learnTopic: 'history', text: 'History fact: Apollo 11 landed humans on the Moon in 1969.' },
    { id: 'learn-history-internet', learnTopic: 'history', text: 'History fact: The internet grew from earlier computer networking projects, including ARPANET.' },
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

/* Additional offline trivia data for Road Trip Adventures.
   Brightful's general trivia list was used as a fact source for several seed questions,
   then normalized here with app-specific IDs, categories, and multiple-choice options. */
(function () {
  window.RTA_TRIVIA_CATEGORIES = [
    { id: 'nationalparks', label: 'National Parks', emoji: '🏞️' },
    { id: 'alaska', label: 'Alaska', emoji: '❄️' },
    { id: 'alaskarail', label: 'Alaska Rail', emoji: '🚂' },
    { id: 'weirdlaws', label: 'Weird Law Legends', emoji: '⚖️' },
    { id: 'history', label: 'History Nerds', emoji: '📜' },
    { id: 'general', label: 'General Trivia', emoji: '💬' },
    { id: 'movies', label: 'Movies', emoji: '🎬' },
    { id: 'animals', label: 'Animals', emoji: '🐾' },
    { id: 'technology', label: 'Technology', emoji: '💻' },
    { id: 'sports', label: 'Sports Mix', emoji: '🏅' },
  ];

  window.RTA_TRIVIA_QUESTIONS = [
    { id: 'parks-acadia-state', category: 'nationalparks', question: 'Which U.S. state is home to Acadia National Park?', answer: 'Maine.', choices: ['Maine.', 'Vermont.', 'Oregon.', 'Michigan.'] },
    { id: 'parks-grand-canyon-river', category: 'nationalparks', question: 'Which river carved the Grand Canyon?', answer: 'The Colorado River.', choices: ['The Colorado River.', 'The Columbia River.', 'The Rio Grande.', 'The Snake River.'] },
    { id: 'parks-yellowstone-first', category: 'nationalparks', question: 'Which national park is often called the first national park in the world?', answer: 'Yellowstone National Park.', choices: ['Yellowstone National Park.', 'Yosemite National Park.', 'Grand Canyon National Park.', 'Zion National Park.'] },
    { id: 'parks-everglades-state', category: 'nationalparks', question: 'Everglades National Park is in which state?', answer: 'Florida.', choices: ['Florida.', 'Louisiana.', 'Georgia.', 'South Carolina.'] },
    { id: 'parks-yosemite-waterfall', category: 'nationalparks', question: 'Which California park is famous for Yosemite Falls and El Capitan?', answer: 'Yosemite National Park.', choices: ['Yosemite National Park.', 'Joshua Tree National Park.', 'Sequoia National Park.', 'Death Valley National Park.'] },
    { id: 'parks-denali-mountain', category: 'nationalparks', question: 'Denali National Park is named for what major natural feature?', answer: 'North America\'s tallest mountain.', choices: ['North America\'s tallest mountain.', 'A giant glacier lake.', 'A volcanic island.', 'A desert canyon.'] },
    { id: 'parks-zion-state', category: 'nationalparks', question: 'Zion National Park is in which state?', answer: 'Utah.', choices: ['Utah.', 'Arizona.', 'Colorado.', 'Nevada.'] },
    { id: 'parks-dry-tortugas-access', category: 'nationalparks', question: 'Dry Tortugas National Park is unusual because most visitors arrive by what?', answer: 'Boat or seaplane.', choices: ['Boat or seaplane.', 'Subway.', 'Cable car.', 'Desert shuttle.'] },

    { id: 'alaska-keyboard', category: 'alaska', question: 'Which U.S. state can be typed using one row of a standard QWERTY keyboard?', answer: 'Alaska.', choices: ['Alaska.', 'Texas.', 'Maine.', 'Ohio.'] },
    { id: 'alaska-capital', category: 'alaska', question: 'What is the capital of Alaska?', answer: 'Juneau.', choices: ['Juneau.', 'Anchorage.', 'Fairbanks.', 'Sitka.'] },
    { id: 'alaska-nickname', category: 'alaska', question: 'What is Alaska\'s state nickname?', answer: 'The Last Frontier.', choices: ['The Last Frontier.', 'The Evergreen State.', 'The Treasure State.', 'The North Star State.'] },
    { id: 'alaska-largest-state', category: 'alaska', question: 'By land area, Alaska is the largest U.S. state. True or false?', answer: 'True.', choices: ['True.', 'False.'] },
    { id: 'alaska-denali-height', category: 'alaska', question: 'Denali is best known for being what?', answer: 'The tallest mountain in North America.', choices: ['The tallest mountain in North America.', 'The deepest lake in the U.S.', 'The longest U.S. river.', 'The largest island in Hawaii.'] },
    { id: 'alaska-aurora', category: 'alaska', question: 'The colorful lights often seen in Alaska night skies are called what?', answer: 'The aurora borealis.', choices: ['The aurora borealis.', 'The trade winds.', 'The equinox shadow.', 'The solar tide.'] },
    { id: 'alaskarail-main-cities', category: 'alaskarail', question: 'The Alaska Railroad is known for connecting which major Alaska cities?', answer: 'Seward, Anchorage, and Fairbanks.', choices: ['Seward, Anchorage, and Fairbanks.', 'Juneau, Nome, and Kodiak.', 'Sitka, Ketchikan, and Barrow.', 'Homer, Valdez, and Unalaska.'] },
    { id: 'alaskarail-denali-park', category: 'alaskarail', question: 'Which famous national park can passengers reach by Alaska Railroad service?', answer: 'Denali National Park and Preserve.', choices: ['Denali National Park and Preserve.', 'Everglades National Park.', 'Acadia National Park.', 'Big Bend National Park.'] },
    { id: 'alaskarail-viewing-cars', category: 'alaskarail', question: 'Why are dome cars popular on scenic train routes?', answer: 'They offer wide views of the landscape.', choices: ['They offer wide views of the landscape.', 'They make the train fly.', 'They store extra snow.', 'They replace the locomotive.'] },
    { id: 'alaskarail-wildlife-watch', category: 'alaskarail', question: 'Which animal would be a realistic wildlife sighting on an Alaska rail trip?', answer: 'Moose.', choices: ['Moose.', 'Kangaroo.', 'Lemur.', 'Camel.'] },
    { id: 'alaskarail-railroad-crossing', category: 'alaskarail', question: 'At railroad crossings, what should passengers look for as a train-safety clue?', answer: 'Lights, gates, and crossing signs.', choices: ['Lights, gates, and crossing signs.', 'Palm trees.', 'Basketball hoops.', 'Movie posters.'] },
    { id: 'alaskarail-glacier-word', category: 'alaskarail', question: 'A glacier is best described as what?', answer: 'A large, slow-moving mass of ice.', choices: ['A large, slow-moving mass of ice.', 'A desert cactus.', 'A type of train ticket.', 'A warm ocean current.'] },
    { id: 'alaskarail-aurora-name', category: 'alaskarail', question: 'What is another name for the northern lights seen in Alaska?', answer: 'Aurora borealis.', choices: ['Aurora borealis.', 'Solar eclipse.', 'Trade winds.', 'Sea breeze.'] },
    { id: 'alaskarail-engineer-role', category: 'alaskarail', question: 'On a train, what does the engineer usually do?', answer: 'Operates the locomotive.', choices: ['Operates the locomotive.', 'Serves as the town mayor.', 'Builds the mountains.', 'Counts license plates.'] },
    { id: 'alaskarail-conductor-role', category: 'alaskarail', question: 'On many passenger trains, what is a conductor responsible for?', answer: 'Helping manage passengers and train operations.', choices: ['Helping manage passengers and train operations.', 'Flying the train.', 'Painting glaciers.', 'Choosing every passenger’s lunch.'] },
    { id: 'alaskarail-trestle', category: 'alaskarail', question: 'A railroad trestle is a type of what?', answer: 'Bridge.', choices: ['Bridge.', 'Tunnel.', 'Ticket.', 'Dining car.'] },
    { id: 'alaskarail-spike', category: 'alaskarail', question: 'What is a railroad spike used for?', answer: 'Fastening rails or track parts in place.', choices: ['Fastening rails or track parts in place.', 'Measuring snowfall.', 'Cooking soup.', 'Cleaning windows.'] },
    { id: 'alaskarail-snow-shed', category: 'alaskarail', question: 'In snowy mountain areas, a snow shed helps protect trains from what?', answer: 'Snow slides and avalanches.', choices: ['Snow slides and avalanches.', 'Mosquitoes.', 'Too much sunshine.', 'Radio commercials.'] },

    { id: 'weirdlaws-stl-firefighter', category: 'weirdlaws', question: 'A famously weird St. Louis law is often joked about as limiting firefighters from rescuing whom?', answer: 'Undressed women.', choices: ['Undressed women.', 'People wearing hats.', 'Left-handed musicians.', 'People eating ice cream.'] },
    { id: 'weirdlaws-oklahoma-christmas', category: 'weirdlaws', question: 'Which state is often cited as the last U.S. state to make Christmas a legal holiday, in 1907?', answer: 'Oklahoma.', choices: ['Oklahoma.', 'Delaware.', 'Alaska.', 'Arizona.'] },
    { id: 'weirdlaws-indonesia-hula', category: 'weirdlaws', question: 'In a famous odd-law trivia item, Indonesia reportedly banned what for being too exciting?', answer: 'Hula hoops.', choices: ['Hula hoops.', 'Yo-yos.', 'Kites.', 'Roller skates.'] },
    { id: 'weirdlaws-exit-signs', category: 'weirdlaws', question: 'By U.S. safety rules, exit signs are usually one of which two colors?', answer: 'Red or green.', choices: ['Red or green.', 'Blue or purple.', 'Yellow or black.', 'Orange or white.'] },
    { id: 'weirdlaws-age-alcohol-us', category: 'weirdlaws', question: 'In the United States, what is the legal drinking age?', answer: '21.', choices: ['21.', '18.', '19.', '25.'] },

    { id: 'history-dollar-bill', category: 'history', question: 'Which U.S. president appears on the one-dollar bill?', answer: 'George Washington.', choices: ['George Washington.', 'Abraham Lincoln.', 'Thomas Jefferson.', 'Theodore Roosevelt.'] },
    { id: 'history-hundred-bill', category: 'history', question: 'Who is pictured on the U.S. hundred-dollar bill?', answer: 'Benjamin Franklin.', choices: ['Benjamin Franklin.', 'Alexander Hamilton.', 'Ulysses S. Grant.', 'John Adams.'] },
    { id: 'history-two-dollar', category: 'history', question: 'Which president is pictured on the U.S. two-dollar bill?', answer: 'Thomas Jefferson.', choices: ['Thomas Jefferson.', 'James Madison.', 'Andrew Jackson.', 'John Quincy Adams.'] },
    { id: 'history-earth-day-first', category: 'history', question: 'Earth Day was first celebrated in what year?', answer: '1970.', choices: ['1970.', '1962.', '1984.', '1991.'] },
    { id: 'history-hiroshima', category: 'history', question: 'The first atomic bomb used in war was dropped on which Japanese city?', answer: 'Hiroshima.', choices: ['Hiroshima.', 'Nagasaki.', 'Tokyo.', 'Kyoto.'] },
    { id: 'history-amelia-atlantic', category: 'history', question: 'Who was the first woman to fly solo across the Atlantic Ocean?', answer: 'Amelia Earhart.', choices: ['Amelia Earhart.', 'Bessie Coleman.', 'Sally Ride.', 'Jacqueline Cochran.'] },
    { id: 'history-genghis-name', category: 'history', question: 'Temujin is better known by what historical name?', answer: 'Genghis Khan.', choices: ['Genghis Khan.', 'Kublai Khan.', 'Attila the Hun.', 'Tamerlane.'] },
    { id: 'history-jfk-city', category: 'history', question: 'In which city was John F. Kennedy assassinated?', answer: 'Dallas.', choices: ['Dallas.', 'Austin.', 'Washington, D.C.', 'Boston.'] },

    { id: 'general-funambulist', category: 'general', question: 'What does a funambulist walk on?', answer: 'A tightrope.', choices: ['A tightrope.', 'A balance beam.', 'A glacier.', 'A runway.'] },
    { id: 'general-area-51', category: 'general', question: 'Area 51 is located in which U.S. state?', answer: 'Nevada.', choices: ['Nevada.', 'New Mexico.', 'Arizona.', 'Utah.'] },
    { id: 'general-dartboard-opposite-one', category: 'general', question: 'On a standard dartboard, what number is opposite 1?', answer: '19.', choices: ['19.', '20.', '11.', '7.'] },
    { id: 'general-stop-sign-shape', category: 'general', question: 'What shape is a standard stop sign?', answer: 'Octagon.', choices: ['Octagon.', 'Hexagon.', 'Diamond.', 'Circle.'] },
    { id: 'general-rainbow-colors', category: 'general', question: 'How many colors are commonly named in a rainbow?', answer: 'Seven.', choices: ['Seven.', 'Five.', 'Six.', 'Eight.'] },
    { id: 'general-lego-founded', category: 'general', question: 'The LEGO Group was founded in 1932. True or false?', answer: 'True.', choices: ['True.', 'False.'] },
    { id: 'general-cynophobia', category: 'general', question: 'Cynophobia is the fear of what?', answer: 'Dogs.', choices: ['Dogs.', 'Heights.', 'Crowds.', 'Thunder.'] },
    { id: 'general-eu-stars', category: 'general', question: 'How many stars are on the flag of the European Union?', answer: '12.', choices: ['12.', '10.', '15.', '27.'] },
    { id: 'general-jurassic-park-author', category: 'general', question: 'Who wrote Jurassic Park?', answer: 'Michael Crichton.', choices: ['Michael Crichton.', 'Stephen King.', 'John Grisham.', 'Ray Bradbury.'] },
    { id: 'general-saffron', category: 'general', question: 'What is often called the world\'s most expensive spice by weight?', answer: 'Saffron.', choices: ['Saffron.', 'Cinnamon.', 'Paprika.', 'Nutmeg.'] },
    { id: 'general-roulette-sum', category: 'general', question: 'The numbers on a roulette wheel add up to 666. True or false?', answer: 'True.', choices: ['True.', 'False.'] },
    { id: 'general-seconds-day', category: 'general', question: 'There are 86,400 seconds in a day. True or false?', answer: 'True.', choices: ['True.', 'False.'] },
    { id: 'general-aglet', category: 'general', question: 'What is the small plastic or metal tube on the end of a shoelace called?', answer: 'An aglet.', choices: ['An aglet.', 'A burr.', 'A ferrule.', 'A toggle.'] },
    { id: 'general-venus-rotation', category: 'general', question: 'Which planet rotates clockwise on its axis compared with most planets?', answer: 'Venus.', choices: ['Venus.', 'Mars.', 'Jupiter.', 'Mercury.'] },
    { id: 'general-bond-code', category: 'general', question: 'What is James Bond\'s famous code number?', answer: '007.', choices: ['007.', '411.', '911.', '101.'] },
    { id: 'general-muppets-creator', category: 'general', question: 'Jim Henson created which beloved cast of characters?', answer: 'The Muppets.', choices: ['The Muppets.', 'The Smurfs.', 'The Peanuts gang.', 'The Rugrats.'] },
    { id: 'general-mona-lisa-museum', category: 'general', question: 'The Mona Lisa hangs in which museum?', answer: 'The Louvre.', choices: ['The Louvre.', 'The Prado.', 'The Met.', 'The Uffizi.'] },
    { id: 'general-appalachian-trail-states', category: 'general', question: 'The Appalachian Trail crosses how many states?', answer: '14.', choices: ['14.', '9.', '20.', '6.'] },
    { id: 'general-honey', category: 'general', question: 'What food is famous for staying edible for a very long time without spoiling?', answer: 'Honey.', choices: ['Honey.', 'Bread.', 'Milk.', 'Lettuce.'] },
    { id: 'general-cloned-animal', category: 'general', question: 'What was the first mammal cloned from an adult cell?', answer: 'A sheep.', choices: ['A sheep.', 'A cat.', 'A cow.', 'A horse.'] },
    { id: 'general-passport', category: 'general', question: 'What document is commonly required for international travel?', answer: 'A passport.', choices: ['A passport.', 'A library card.', 'A voter sticker.', 'A parking permit.'] },
{ id: 'parks-arches-state', category: 'nationalparks', question: 'Arches National Park is located in which state?', answer: 'Utah.', choices: ['Utah.', 'Colorado.', 'Nevada.', 'Arizona.'] },

{ id: 'parks-crater-lake-state', category: 'nationalparks', question: 'Crater Lake National Park is located in which state?', answer: 'Oregon.', choices: ['Oregon.', 'Washington.', 'Idaho.', 'Montana.'] },

{ id: 'parks-bryce-state', category: 'nationalparks', question: 'Bryce Canyon National Park is located in which state?', answer: 'Utah.', choices: ['Utah.', 'Arizona.', 'Nevada.', 'Colorado.'] },

{ id: 'parks-mammoth-cave-state', category: 'nationalparks', question: 'Mammoth Cave National Park is located in which state?', answer: 'Kentucky.', choices: ['Kentucky.', 'Tennessee.', 'Virginia.', 'Missouri.'] },

{ id: 'parks-shenandoah-state', category: 'nationalparks', question: 'Shenandoah National Park is located in which state?', answer: 'Virginia.', choices: ['Virginia.', 'West Virginia.', 'North Carolina.', 'Pennsylvania.'] },

{ id: 'parks-carlsbad-state', category: 'nationalparks', question: 'Carlsbad Caverns National Park is located in which state?', answer: 'New Mexico.', choices: ['New Mexico.', 'Texas.', 'Arizona.', 'Colorado.'] },

{ id: 'parks-saguaro-state', category: 'nationalparks', question: 'Saguaro National Park is famous for which type of plant?', answer: 'Giant saguaro cacti.', choices: ['Giant saguaro cacti.', 'Joshua trees.', 'Redwood trees.', 'Bluebonnets.'] },

{ id: 'parks-sequoia-trees', category: 'nationalparks', question: 'Sequoia National Park is best known for what?', answer: 'Giant sequoia trees.', choices: ['Giant sequoia trees.', 'Volcanoes.', 'Glaciers.', 'Sand dunes.'] },

{ id: 'parks-olympic-ecosystems', category: 'nationalparks', question: 'Olympic National Park is famous because it contains beaches, mountains, and what else?', answer: 'Temperate rainforests.', choices: ['Temperate rainforests.', 'Coral reefs.', 'Prairies.', 'Mangrove swamps.'] },

{ id: 'parks-great-smoky-visitors', category: 'nationalparks', question: 'Which national park is typically the most visited in the United States?', answer: 'Great Smoky Mountains National Park.', choices: ['Great Smoky Mountains National Park.', 'Yellowstone National Park.', 'Yosemite National Park.', 'Grand Canyon National Park.'] },
// National Parks

{ id: 'parks-badlands-state', category: 'nationalparks', question: 'Badlands National Park is located in which state?', answer: 'South Dakota.', choices: ['South Dakota.', 'North Dakota.', 'Nebraska.', 'Wyoming.'] },

{ id: 'parks-biscayne-state', category: 'nationalparks', question: 'Biscayne National Park is located in which state?', answer: 'Florida.', choices: ['Florida.', 'Georgia.', 'Louisiana.', 'South Carolina.'] },

{ id: 'parks-cuyahoga-state', category: 'nationalparks', question: 'Cuyahoga Valley National Park is located in which state?', answer: 'Ohio.', choices: ['Ohio.', 'Indiana.', 'Michigan.', 'Pennsylvania.'] },

{ id: 'parks-death-valley-hottest', category: 'nationalparks', question: 'Which national park is famous for being one of the hottest places on Earth?', answer: 'Death Valley National Park.', choices: ['Death Valley National Park.', 'Joshua Tree National Park.', 'Big Bend National Park.', 'Petrified Forest National Park.'] },

{ id: 'parks-gateway-arch-state', category: 'nationalparks', question: 'Gateway Arch National Park is located in which state?', answer: 'Missouri.', choices: ['Missouri.', 'Illinois.', 'Kansas.', 'Arkansas.'] },

{ id: 'parks-glacier-state', category: 'nationalparks', question: 'Glacier National Park is located in which state?', answer: 'Montana.', choices: ['Montana.', 'Wyoming.', 'Idaho.', 'Colorado.'] },

{ id: 'parks-hawaii-volcanoes-state', category: 'nationalparks', question: 'Hawaiʻi Volcanoes National Park is located in which state?', answer: 'Hawaii.', choices: ['Hawaii.', 'California.', 'Alaska.', 'Florida.'] },

{ id: 'parks-petrified-state', category: 'nationalparks', question: 'Petrified Forest National Park is located in which state?', answer: 'Arizona.', choices: ['Arizona.', 'New Mexico.', 'Nevada.', 'Utah.'] },

{ id: 'parks-rocky-mountain-state', category: 'nationalparks', question: 'Rocky Mountain National Park is located in which state?', answer: 'Colorado.', choices: ['Colorado.', 'Montana.', 'Wyoming.', 'Idaho.'] },

{ id: 'parks-wrangell-largest', category: 'nationalparks', question: 'What is the largest national park in the United States?', answer: 'Wrangell–St. Elias National Park and Preserve.', choices: ['Wrangell–St. Elias National Park and Preserve.', 'Yellowstone National Park.', 'Denali National Park.', 'Glacier National Park.'] },  
// National Parks – Fun Facts Edition

{ id: 'parks-yellowstone-geysers', category: 'nationalparks', question: 'Yellowstone National Park contains about half of the world’s active geysers. True or false?', answer: 'True.', choices: ['True.', 'False.'] },

{ id: 'parks-grand-canyon-depth', category: 'nationalparks', question: 'About how deep is the Grand Canyon at its deepest point?', answer: 'About 1 mile deep.', choices: ['About 1 mile deep.', 'About 500 feet deep.', 'About 3 miles deep.', 'About 100 feet deep.'] },

{ id: 'parks-joshua-tree-name', category: 'nationalparks', question: 'According to legend, who thought Joshua trees looked like a biblical figure raising his arms to the sky?', answer: 'Mormon settlers.', choices: ['Mormon settlers.', 'Spanish explorers.', 'Gold miners.', 'Native Hawaiian sailors.'] },

{ id: 'parks-death-valley-lowest', category: 'nationalparks', question: 'Death Valley contains the lowest point in North America. What is it called?', answer: 'Badwater Basin.', choices: ['Badwater Basin.', 'Devil’s Sink.', 'Coyote Flats.', 'Lost Creek Hollow.'] },

{ id: 'parks-denali-name', category: 'nationalparks', question: 'What does the name "Denali" mean in the Koyukon Athabaskan language?', answer: 'The High One.', choices: ['The High One.', 'Land of Ice.', 'Great Bear.', 'Endless Mountain.'] },

{ id: 'parks-everglades-crocodiles', category: 'nationalparks', question: 'Everglades National Park is the only place in the world where alligators and what other reptile naturally live together?', answer: 'Crocodiles.', choices: ['Crocodiles.', 'Komodo dragons.', 'Gila monsters.', 'Iguanas.'] },

{ id: 'parks-sequoia-age', category: 'nationalparks', question: 'Some giant sequoia trees in Sequoia National Park are approximately how old?', answer: 'More than 2,000 years old.', choices: ['More than 2,000 years old.', 'About 300 years old.', 'About 500 years old.', 'About 800 years old.'] },

{ id: 'parks-mammoth-cave-length', category: 'nationalparks', question: 'Mammoth Cave National Park contains the world’s longest known cave system. About how many miles have been explored?', answer: 'More than 400 miles.', choices: ['More than 400 miles.', 'About 50 miles.', 'About 100 miles.', 'About 200 miles.'] },

{ id: 'parks-arches-number', category: 'nationalparks', question: 'Approximately how many natural stone arches can be found in Arches National Park?', answer: 'More than 2,000.', choices: ['More than 2,000.', 'About 200.', 'About 500.', 'About 800.'] },

{ id: 'parks-great-smoky-fireflies', category: 'nationalparks', question: 'Great Smoky Mountains National Park is famous for a rare natural light show involving what?', answer: 'Synchronous fireflies.', choices: ['Synchronous fireflies.', 'Glowing mushrooms.', 'Blue lightning bugs.', 'Sparkling waterfalls.'] },

{ id: 'parks-carlsbad-bats', category: 'nationalparks', question: 'Each evening at Carlsbad Caverns, visitors gather to watch thousands of what animals emerge from the caves?', answer: 'Bats.', choices: ['Bats.', 'Owls.', 'Swallows.', 'Foxes.'] },

{ id: 'parks-crater-lake-depth', category: 'nationalparks', question: 'Crater Lake is the deepest lake in the United States. About how deep is it?', answer: 'Nearly 2,000 feet deep.', choices: ['Nearly 2,000 feet deep.', 'About 500 feet deep.', 'About 1,000 feet deep.', 'About 3,000 feet deep.'] },

{ id: 'parks-katmai-bears', category: 'nationalparks', question: 'Which national park is famous for bears catching salmon in waterfalls during Fat Bear Week?', answer: 'Katmai National Park and Preserve.', choices: ['Katmai National Park and Preserve.', 'Yellowstone National Park.', 'Glacier National Park.', 'Olympic National Park.'] },

{ id: 'parks-saguaro-growth', category: 'nationalparks', question: 'A saguaro cactus usually doesn’t grow its first arm until it is about how old?', answer: 'Around 50–75 years old.', choices: ['Around 50–75 years old.', 'About 5 years old.', 'About 15 years old.', 'About 25 years old.'] },

{ id: 'parks-olympic-rainforest', category: 'nationalparks', question: 'Olympic National Park contains mountains, beaches, and what unusual type of forest?', answer: 'Temperate rainforest.', choices: ['Temperate rainforest.', 'Mangrove forest.', 'Bamboo forest.', 'Pine savanna.'] },
// Food Trivia

{ id: 'food-gazpacho-country', category: 'food', question: 'Which country invented Gazpacho?', answer: 'Spain.', choices: ['Spain.', 'Italy.', 'Portugal.', 'Mexico.'] },

{ id: 'food-singapore-sling', category: 'food', question: 'At which hotel was the Singapore Sling originally invented?', answer: 'Raffles Hotel.', choices: ['Raffles Hotel.', 'Marina Bay Sands.', 'The Ritz.', 'The Peninsula Hotel.'] },

{ id: 'food-nasi-goreng', category: 'food', question: 'Which country does the dish "Nasi Goreng" come from?', answer: 'Indonesia.', choices: ['Indonesia.', 'Malaysia.', 'Thailand.', 'Vietnam.'] },

{ id: 'food-currywurst-city', category: 'food', question: 'In which city was Currywurst invented?', answer: 'Berlin.', choices: ['Berlin.', 'Munich.', 'Vienna.', 'Hamburg.'] },

{ id: 'food-jollibee-country', category: 'food', question: 'Which country is famous for the fast-food chain Jollibee?', answer: 'Philippines.', choices: ['Philippines.', 'Japan.', 'Singapore.', 'South Korea.'] },

{ id: 'food-timbits-chain', category: 'food', question: 'Which Canadian coffee chain sells Timbits?', answer: 'Tim Hortons.', choices: ['Tim Hortons.', 'Second Cup.', 'Starbucks.', 'Coffee Time.'] },

{ id: 'food-kimchi-origin', category: 'food', question: 'Kimchi is a popular side dish from where?', answer: 'Korea.', choices: ['Korea.', 'China.', 'Japan.', 'Vietnam.'] },

{ id: 'food-guinness-origin', category: 'food', question: 'Guinness beer originated in which country?', answer: 'Ireland.', choices: ['Ireland.', 'Scotland.', 'England.', 'Wales.'] },

{ id: 'food-kakigori', category: 'food', question: 'What popular Japanese summer dessert is made from shaved ice?', answer: 'Kakigori.', choices: ['Kakigori.', 'Mochi.', 'Dorayaki.', 'Taiyaki.'] },

{ id: 'food-satay', category: 'food', question: 'What is the name of the popular Southeast Asian meat skewer dish?', answer: 'Satay.', choices: ['Satay.', 'Rendang.', 'Laksa.', 'Adobo.'] },
// Food Trivia

{ id: 'food-peanut-butter-inventor', category: 'food', question: 'Who invented peanut butter?', answer: 'Marcellus Gilmore Edson.', choices: ['Marcellus Gilmore Edson.', 'George Washington Carver.', 'John Harvey Kellogg.', 'Milton Hershey.'] },

{ id: 'food-tim-tam-slam', category: 'food', question: 'Which country popularized the "Tim Tam Slam"?', answer: 'Australia.', choices: ['Australia.', 'New Zealand.', 'England.', 'South Africa.'] },

{ id: 'food-georgia-peaches', category: 'food', question: 'Which U.S. state is famous for its juicy peaches?', answer: 'Georgia.', choices: ['Georgia.', 'South Carolina.', 'California.', 'Florida.'] },

{ id: 'food-sushi-wrap', category: 'food', question: 'What is sushi traditionally wrapped in?', answer: 'Nori (seaweed).', choices: ['Nori (seaweed).', 'Rice paper.', 'Lettuce.', 'Cabbage leaves.'] },

{ id: 'food-kosher-meaning', category: 'food', question: 'What does the Hebrew word "Kosher" mean?', answer: 'Proper.', choices: ['Proper.', 'Blessed.', 'Traditional.', 'Sacred.'] },

{ id: 'food-mince-pie', category: 'food', question: 'What is the main ingredient in a traditional mince pie?', answer: 'Fruit.', choices: ['Fruit.', 'Beef.', 'Custard.', 'Chocolate.'] },

{ id: 'food-new-york-fruit', category: 'food', question: 'What is the official state fruit of New York?', answer: 'Apple.', choices: ['Apple.', 'Grape.', 'Cherry.', 'Peach.'] },

{ id: 'food-americano', category: 'food', question: 'What coffee drink is made by diluting espresso with hot water?', answer: 'Americano.', choices: ['Americano.', 'Latte.', 'Cappuccino.', 'Macchiato.'] },

{ id: 'food-carne-asada', category: 'food', question: 'What does "Carne Asada" mean in Spanish?', answer: 'Grilled beef.', choices: ['Grilled beef.', 'Spicy chicken.', 'Roasted pork.', 'Seasoned rice.'] },

{ id: 'food-smores', category: 'food', question: 'What campfire treat is made with marshmallows, graham crackers, and chocolate?', answer: 'S’mores.', choices: ['S’mores.', 'Moon Pies.', 'Whoopie Pies.', 'Rice Krispie Treats.'] },

{ id: 'food-gumbo-origin', category: 'food', question: 'Which U.S. state is most associated with the stew Gumbo?', answer: 'Louisiana.', choices: ['Louisiana.', 'Texas.', 'Mississippi.', 'Alabama.'] },

{ id: 'food-pina-colada', category: 'food', question: 'What cocktail is made with rum, coconut, and pineapple?', answer: 'Piña Colada.', choices: ['Piña Colada.', 'Mai Tai.', 'Mojito.', 'Daiquiri.'] },

{ id: 'food-bond-drink', category: 'food', question: 'What is James Bond’s preferred drink of choice?', answer: 'Martini.', choices: ['Martini.', 'Old Fashioned.', 'Manhattan.', 'Whiskey Sour.'] },

{ id: 'food-innout-founded', category: 'food', question: 'In what year was the burger chain In-N-Out founded?', answer: '1948.', choices: ['1948.', '1955.', '1962.', '1971.'] },

{ id: 'food-hawaii-coffee', category: 'food', question: 'Which U.S. state is the only state that commercially grows coffee beans?', answer: 'Hawaii.', choices: ['Hawaii.', 'California.', 'Florida.', 'Texas.'] },

{ id: 'food-fanta-origin', category: 'food', question: 'Which soft drink was invented during World War II?', answer: 'Fanta.', choices: ['Fanta.', 'Sprite.', 'Dr Pepper.', 'Mountain Dew.'] },

{ id: 'food-tiramisu', category: 'food', question: 'What Italian dessert is made with coffee, mascarpone cheese, and ladyfingers?', answer: 'Tiramisu.', choices: ['Tiramisu.', 'Cannoli.', 'Gelato.', 'Panna Cotta.'] },

{ id: 'food-mageirocophobia', category: 'food', question: 'Mageirocophobia is the fear of what?', answer: 'Cooking.', choices: ['Cooking.', 'Eating.', 'Vegetables.', 'Restaurants.'] },

{ id: 'food-avocado-varieties', category: 'food', question: 'About how many varieties of avocados exist worldwide?', answer: 'About 500.', choices: ['About 500.', 'About 50.', 'About 100.', 'About 1,000.'] },

{ id: 'food-macadamia', category: 'food', question: 'What type of nut is a famous Hawaiian staple?', answer: 'Macadamia nuts.', choices: ['Macadamia nuts.', 'Pecans.', 'Walnuts.', 'Almonds.'] },
// Food Trivia

{ id: 'food-sauerkraut', category: 'food', question: 'What is sauerkraut made from?', answer: 'Cabbage.', choices: ['Cabbage.', 'Potatoes.', 'Turnips.', 'Onions.'] },

{ id: 'food-scurvy', category: 'food', question: 'A lack of Vitamin C can cause which disease?', answer: 'Scurvy.', choices: ['Scurvy.', 'Rickets.', 'Beriberi.', 'Anemia.'] },

{ id: 'food-kfc-mascot', category: 'food', question: 'Who is the mascot of the fast-food chain KFC?', answer: 'Colonel Sanders.', choices: ['Colonel Sanders.', 'Wendy.', 'Ronald McDonald.', 'The Burger King.'] },

{ id: 'food-dos-equis', category: 'food', question: 'Which beverage brand featured "The Most Interesting Man in the World" in its ads?', answer: 'Dos Equis.', choices: ['Dos Equis.', 'Corona.', 'Heineken.', 'Budweiser.'] },

{ id: 'food-elote', category: 'food', question: 'What is the name of the popular Mexican street food made from corn?', answer: 'Elote.', choices: ['Elote.', 'Tamale.', 'Empanada.', 'Quesadilla.'] },

{ id: 'food-caesar-salad', category: 'food', question: 'Which famous salad was invented at Hotel Caesar’s in Tijuana?', answer: 'Caesar Salad.', choices: ['Caesar Salad.', 'Cobb Salad.', 'Greek Salad.', 'Chef Salad.'] },

{ id: 'food-tzatziki', category: 'food', question: 'Tzatziki sauce is commonly served as a topping for what?', answer: 'Gyros.', choices: ['Gyros.', 'Tacos.', 'Hot dogs.', 'Pizza.'] },

{ id: 'food-halal', category: 'food', question: 'Under Muslim dietary rules, what term describes foods that are permitted to eat?', answer: 'Halal.', choices: ['Halal.', 'Kosher.', 'Haram.', 'Fasting.'] },

{ id: 'food-heinz-57', category: 'food', question: 'How many varieties are advertised in Heinz Tomato Ketchup’s famous slogan?', answer: '57.', choices: ['57.', '47.', '67.', '77.'] },

{ id: 'food-fancy-sauce', category: 'food', question: 'According to the movie "Step Brothers," what is "fancy sauce" made of?', answer: 'Ketchup and mayonnaise.', choices: ['Ketchup and mayonnaise.', 'Mustard and ketchup.', 'Barbecue sauce and ranch.', 'Mayo and hot sauce.'] },

{ id: 'math-prime-under-10', category: 'math', question: 'Which of these numbers is prime?', answer: '7.', choices: ['7.', '9.', '12.', '15.'] },
{ id: 'math-percent-25-of-80', category: 'math', question: 'What is 25% of 80?', answer: '20.', choices: ['20.', '25.', '15.', '40.'] },
{ id: 'math-area-rectangle-8-5', category: 'math', question: 'What is the area of a rectangle that is 8 units long and 5 units wide?', answer: '40 square units.', choices: ['40 square units.', '13 square units.', '26 square units.', '80 square units.'] },
{ id: 'math-dozen-half', category: 'math', question: 'How many items are in half a dozen?', answer: '6.', choices: ['6.', '12.', '3.', '24.'] },
{ id: 'math-pi-first-three', category: 'math', question: 'What are the first three digits of pi?', answer: '3.14.', choices: ['3.14.', '2.71.', '1.62.', '4.13.'] },
{ id: 'math-triangle-angles', category: 'math', question: 'The angles inside a triangle add up to how many degrees?', answer: '180 degrees.', choices: ['180 degrees.', '90 degrees.', '270 degrees.', '360 degrees.'] },
{ id: 'math-square-root-144', category: 'math', question: 'What is the square root of 144?', answer: '12.', choices: ['12.', '14.', '10.', '16.'] },
{ id: 'math-roman-x', category: 'math', question: 'In Roman numerals, what number does X represent?', answer: '10.', choices: ['10.', '5.', '50.', '100.'] },

{ id: 'science-light-speed-fastest', category: 'science', question: 'What travels faster in a vacuum: light or sound?', answer: 'Light.', choices: ['Light.', 'Sound.', 'They travel the same speed.', 'Neither can travel.'] },
{ id: 'science-ice-less-dense', category: 'science', question: 'Why does ice float on water?', answer: 'Ice is less dense than liquid water.', choices: ['Ice is less dense than liquid water.', 'Ice is heavier than water.', 'Ice has no mass.', 'Water pushes everything upward equally.'] },
{ id: 'science-earth-layer-crust', category: 'science', question: 'What is the outermost solid layer of Earth called?', answer: 'The crust.', choices: ['The crust.', 'The core.', 'The mantle.', 'The atmosphere.'] },
{ id: 'science-battery-energy', category: 'science', question: 'A battery stores energy mostly in what form?', answer: 'Chemical energy.', choices: ['Chemical energy.', 'Sound energy.', 'Gravitational energy.', 'Thermal insulation.'] },
{ id: 'science-evaporation', category: 'science', question: 'What is the process called when liquid water changes into water vapor?', answer: 'Evaporation.', choices: ['Evaporation.', 'Condensation.', 'Freezing.', 'Erosion.'] },
{ id: 'science-stars-made-mostly', category: 'science', question: 'Stars are made mostly of which two elements?', answer: 'Hydrogen and helium.', choices: ['Hydrogen and helium.', 'Oxygen and carbon.', 'Iron and nickel.', 'Nitrogen and argon.'] },
{ id: 'science-magnet-poles', category: 'science', question: 'Magnets have north and what other pole?', answer: 'South.', choices: ['South.', 'East.', 'Positive.', 'Center.'] },
{ id: 'science-cloud-rain-type', category: 'science', question: 'What type of cloud is commonly associated with thunderstorms?', answer: 'Cumulonimbus.', choices: ['Cumulonimbus.', 'Cirrus.', 'Stratus.', 'Altocumulus.'] },

{ id: 'music-tempo-speed', category: 'music', question: 'In music, tempo describes what?', answer: 'The speed of the music.', choices: ['The speed of the music.', 'The volume of the music.', 'The lyrics of a song.', 'The number of instruments.'] },
{ id: 'music-bass-clef-range', category: 'music', question: 'The bass clef is usually used for notes in what range?', answer: 'Lower notes.', choices: ['Lower notes.', 'Higher notes.', 'Only drum notes.', 'Only vocal notes.'] },
{ id: 'music-orchestra-leader', category: 'music', question: 'Who usually leads an orchestra during a performance?', answer: 'A conductor.', choices: ['A conductor.', 'A producer.', 'A choreographer.', 'A critic.'] },
{ id: 'music-jazz-city-new-orleans', category: 'music', question: 'Which U.S. city is strongly associated with the birth of jazz?', answer: 'New Orleans.', choices: ['New Orleans.', 'Seattle.', 'Nashville.', 'Detroit.'] },
{ id: 'music-country-capital', category: 'music', question: 'Which city is often called Music City and is famous for country music?', answer: 'Nashville.', choices: ['Nashville.', 'Memphis.', 'Austin.', 'Atlanta.'] },
{ id: 'music-bts-country', category: 'music', question: 'The group BTS is from which country?', answer: 'South Korea.', choices: ['South Korea.', 'Japan.', 'Thailand.', 'China.'] },
{ id: 'music-madonna-material-girl', category: 'music', question: 'Which singer is known as the "Material Girl"?', answer: 'Madonna.', choices: ['Madonna.', 'Cyndi Lauper.', 'Cher.', 'Janet Jackson.'] },
{ id: 'music-eagles-hotel-california', category: 'music', question: 'Which band recorded the song "Hotel California"?', answer: 'Eagles.', choices: ['Eagles.', 'Fleetwood Mac.', 'Journey.', 'Chicago.'] },
{ id: 'music-taylor-1989-single', category: 'taylorswift', question: 'Which Taylor Swift album shares its name with a year?', answer: '1989.', choices: ['1989.', 'Red.', 'Lover.', 'Midnights.'] },
{ id: 'music-kpop-blackpink-members', category: 'kpop', question: 'BLACKPINK is best known as what kind of K-pop group?', answer: 'A girl group.', choices: ['A girl group.', 'A boy band.', 'A rock band.', 'A classical quartet.'] },

{ id: 'tv-lucy-vitameatavegamin', category: 'tv', question: 'Which classic sitcom featured Lucy Ricardo?', answer: 'I Love Lucy.', choices: ['I Love Lucy.', 'The Mary Tyler Moore Show.', 'Bewitched.', 'The Golden Girls.'] },
{ id: 'tv-golden-girls-city', category: 'tv', question: 'The Golden Girls is mainly set in which city?', answer: 'Miami.', choices: ['Miami.', 'Phoenix.', 'San Diego.', 'Atlanta.'] },
{ id: 'tv-fresh-prince-city', category: 'tv', question: 'The Fresh Prince of Bel-Air begins with Will moving from Philadelphia to which city?', answer: 'Los Angeles.', choices: ['Los Angeles.', 'New York.', 'Chicago.', 'Miami.'] },
{ id: 'tv-seinfeld-cafe', category: 'seinfeld', question: 'On Seinfeld, what is the name of the diner the group often visits?', answer: 'Monk\'s Cafe.', choices: ['Monk\'s Cafe.', 'Central Perk.', 'Luke\'s Diner.', 'MacLaren\'s Pub.'] },
{ id: 'tv-friends-coffee-shop', category: 'friends', question: 'On Friends, what is the name of the coffee shop?', answer: 'Central Perk.', choices: ['Central Perk.', 'Monk\'s Cafe.', 'The Max.', 'Cafe Nervosa.'] },
{ id: 'tv-rick-morty-portal', category: 'rickmorty', question: 'Rick and Morty often travel using what kind of device?', answer: 'A portal gun.', choices: ['A portal gun.', 'A magic wand.', 'A sonic screwdriver.', 'A time necklace.'] },
{ id: 'tv-southpark-state', category: 'southpark', question: 'South Park is set in which U.S. state?', answer: 'Colorado.', choices: ['Colorado.', 'Utah.', 'Wyoming.', 'Montana.'] },
{ id: 'tv-frasier-city', category: 'tv', question: 'Frasier is primarily set in which U.S. city?', answer: 'Seattle.', choices: ['Seattle.', 'Boston.', 'Chicago.', 'Denver.'] },

{ id: 'nba-court-players', category: 'nba', question: 'How many players from one NBA team are on the court during normal play?', answer: 'Five.', choices: ['Five.', 'Six.', 'Seven.', 'Four.'] },
{ id: 'nba-shot-clock', category: 'nba', question: 'How many seconds are on the NBA shot clock?', answer: '24 seconds.', choices: ['24 seconds.', '30 seconds.', '20 seconds.', '35 seconds.'] },
{ id: 'nba-three-pointer-line', category: 'nba', question: 'A basket made from beyond the arc is worth how many points?', answer: 'Three points.', choices: ['Three points.', 'Two points.', 'One point.', 'Four points.'] },
{ id: 'nba-finals-trophy', category: 'nba', question: 'What trophy is awarded to the NBA champion?', answer: 'The Larry O\'Brien Trophy.', choices: ['The Larry O\'Brien Trophy.', 'The Stanley Cup.', 'The Lombardi Trophy.', 'The Commissioner\'s Trophy.'] },

{ id: 'nfl-field-yards', category: 'nfl', question: 'How long is an NFL field from goal line to goal line?', answer: '100 yards.', choices: ['100 yards.', '90 yards.', '110 yards.', '120 yards.'] },
{ id: 'nfl-super-bowl-trophy', category: 'nfl', question: 'What trophy is awarded to the Super Bowl winner?', answer: 'The Vince Lombardi Trophy.', choices: ['The Vince Lombardi Trophy.', 'The Stanley Cup.', 'The Heisman Trophy.', 'The Larry O\'Brien Trophy.'] },
{ id: 'nfl-extra-point-kick', category: 'nfl', question: 'After a touchdown, a successful extra-point kick is worth how many points?', answer: 'One point.', choices: ['One point.', 'Two points.', 'Three points.', 'Six points.'] },
{ id: 'nfl-quarterback-role', category: 'nfl', question: 'Which football position usually throws passes and calls plays?', answer: 'Quarterback.', choices: ['Quarterback.', 'Kicker.', 'Linebacker.', 'Center.'] },

{ id: 'soccer-penalty-spot', category: 'soccer', question: 'A penalty kick in soccer is taken from how many yards away?', answer: '12 yards.', choices: ['12 yards.', '10 yards.', '18 yards.', '20 yards.'] },
{ id: 'soccer-goalkeeper-hands', category: 'soccer', question: 'Which soccer player can usually use their hands inside the penalty area?', answer: 'The goalkeeper.', choices: ['The goalkeeper.', 'The striker.', 'The captain.', 'The referee.'] },
{ id: 'soccer-match-halves', category: 'soccer', question: 'A standard soccer match is divided into how many halves?', answer: 'Two.', choices: ['Two.', 'Three.', 'Four.', 'One.'] },
{ id: 'soccer-yellow-card', category: 'soccer', question: 'In soccer, what does a yellow card usually mean?', answer: 'A caution.', choices: ['A caution.', 'A goal.', 'A substitution.', 'A corner kick.'] },

{ id: 'baseball-innings', category: 'baseball', question: 'How many innings are in a standard Major League Baseball game?', answer: 'Nine.', choices: ['Nine.', 'Seven.', 'Eight.', 'Ten.'] },
{ id: 'baseball-home-run', category: 'baseball', question: 'What is it called when a batter hits the ball out of play in fair territory and rounds all bases?', answer: 'A home run.', choices: ['A home run.', 'A bunt.', 'A double play.', 'A walk.'] },
{ id: 'baseball-world-series-trophy', category: 'baseball', question: 'What is the championship series of Major League Baseball called?', answer: 'The World Series.', choices: ['The World Series.', 'The Super Bowl.', 'The Stanley Cup Final.', 'The Finals.'] },
{ id: 'baseball-pitcher-mound', category: 'baseball', question: 'Which player throws the ball from the mound?', answer: 'The pitcher.', choices: ['The pitcher.', 'The catcher.', 'The shortstop.', 'The umpire.'] },

{ id: 'decades-80s-vhs', category: 'eighties', question: 'In the 1980s, what home video format became widely popular?', answer: 'VHS.', choices: ['VHS.', 'Blu-ray.', 'DVD.', 'LaserDisc only.'] },
{ id: 'decades-90s-beanie-babies', category: 'nineties', question: 'Which small stuffed collectibles became a major craze in the 1990s?', answer: 'Beanie Babies.', choices: ['Beanie Babies.', 'Furbies only.', 'Troll dolls only.', 'Pogs only.'] },
{ id: 'decades-2000s-wii', category: 'twothousands', question: 'Which Nintendo console made motion-control bowling famous in the 2000s?', answer: 'Wii.', choices: ['Wii.', 'GameCube.', 'Nintendo 64.', 'Switch.'] },
{ id: 'decades-2010s-instagram', category: 'twentytens', question: 'Which photo-sharing app launched in 2010 and became a major social platform?', answer: 'Instagram.', choices: ['Instagram.', 'Myspace.', 'AOL.', 'Vineyard.'] },
{ id: 'decades-2020s-barbenheimer', category: 'twentytwenties', question: 'Which nickname described the same-day 2023 release buzz around Barbie and Oppenheimer?', answer: 'Barbenheimer.', choices: ['Barbenheimer.', 'Marvelmania.', 'Pink Friday.', 'Double Feature Day.'] },

{ id: 'movies-frozen-kingdom-arendelle', category: 'movies', question: 'What is the name of the kingdom in Frozen?', answer: 'Arendelle.', choices: ['Arendelle.', 'Corona.', 'Andalasia.', 'DunBroch.'] },
{ id: 'movies-toy-story-woody-voice', category: 'movies', question: 'Who voiced Woody in Toy Story?', answer: 'Tom Hanks.', choices: ['Tom Hanks.', 'Tim Allen.', 'Billy Crystal.', 'Robin Williams.'] },
{ id: 'movies-jurassic-park-main-dinosaur', category: 'movies', question: 'Which dinosaur species is the main attraction in Jurassic Park?', answer: 'Tyrannosaurus rex.', choices: ['Tyrannosaurus rex.', 'Velociraptor.', 'Brachiosaurus.', 'Triceratops.'] },
{ id: 'movies-harry-potter-owl', category: 'movies', question: 'What is the name of Harry Potter\'s owl?', answer: 'Hedwig.', choices: ['Hedwig.', 'Errol.', 'Crookshanks.', 'Pigwidgeon.'] },
{ id: 'movies-finding-nemo-clownfish', category: 'movies', question: 'What is the name of the clownfish in Finding Nemo?', answer: 'Marlin.', choices: ['Marlin.', 'Bruce.', 'Gill.', 'Nigel.'] },

{ id: 'geography-largest-ocean-pacific', category: 'geography', question: 'What is the largest ocean on Earth?', answer: 'Pacific.', choices: ['Pacific.', 'Atlantic.', 'Indian.', 'Arctic.'] },
{ id: 'geography-most-active-volcanoes-state', category: 'geography', question: 'Which U.S. state has the most active volcanoes?', answer: 'Alaska.', choices: ['Alaska.', 'California.', 'Hawaii.', 'Washington.'] },
{ id: 'geography-canada-capital-ottawa', category: 'geography', question: 'What is the capital of Canada?', answer: 'Ottawa.', choices: ['Ottawa.', 'Toronto.', 'Montreal.', 'Vancouver.'] },
{ id: 'geography-sahara-northern-africa', category: 'geography', question: 'Which desert covers much of northern Africa?', answer: 'Sahara.', choices: ['Sahara.', 'Gobi.', 'Kalahari.', 'Mojave.'] },
{ id: 'geography-south-america-longest-river', category: 'geography', question: 'What is the longest river in South America?', answer: 'Amazon.', choices: ['Amazon.', 'Paraná.', 'Orinoco.', 'Madeira.'] },

{ id: 'food-pasta-shaped-like-rice', category: 'food', question: 'What kind of pasta is shaped like little rice grains?', answer: 'Orzo.', choices: ['Orzo.', 'Penne.', 'Fusilli.', 'Rigatoni.'] },
{ id: 'food-marzipan-nut', category: 'food', question: 'Which nut is used to make marzipan?', answer: 'Almond.', choices: ['Almond.', 'Peanut.', 'Walnut.', 'Cashew.'] },
{ id: 'food-pizza-invention-country', category: 'food', question: 'Which country is credited with inventing pizza?', answer: 'Italy.', choices: ['Italy.', 'France.', 'Greece.', 'Spain.'] },
{ id: 'food-tofu-made-from', category: 'food', question: 'What is tofu primarily made from?', answer: 'Soybeans.', choices: ['Soybeans.', 'Rice.', 'Chickpeas.', 'Lentils.'] },
{ id: 'food-honeycrisp-granny-smith', category: 'food', question: 'Which fruit has varieties called Honeycrisp and Granny Smith?', answer: 'Apple.', choices: ['Apple.', 'Pear.', 'Peach.', 'Plum.'] },

{ id: 'animals-largest-shark', category: 'animals', question: 'What is the largest species of shark?', answer: 'Whale Shark.', choices: ['Whale Shark.', 'Great White.', 'Hammerhead.', 'Tiger Shark.'] },
{ id: 'animals-ship-of-the-desert', category: 'animals', question: 'Which animal is known as the "ship of the desert"?', answer: 'Camel.', choices: ['Camel.', 'Horse.', 'Donkey.', 'Llama.'] },
{ id: 'animals-octopus-hearts', category: 'animals', question: 'How many hearts does an octopus have?', answer: 'Three.', choices: ['Three.', 'One.', 'Two.', 'Four.'] },
{ id: 'animals-baby-kangaroo', category: 'animals', question: 'What is a baby kangaroo called?', answer: 'Joey.', choices: ['Joey.', 'Cub.', 'Pup.', 'Kit.'] },
{ id: 'animals-black-white-stripes', category: 'animals', question: 'Which animal has black-and-white stripes?', answer: 'Zebra.', choices: ['Zebra.', 'Okapi.', 'Tapir.', 'Gazelle.'] },

{ id: 'history-first-state-delaware', category: 'history', question: 'Which state was the first to join the United States?', answer: 'Delaware.', choices: ['Delaware.', 'Virginia.', 'Pennsylvania.', 'Massachusetts.'] },
{ id: 'history-first-moon-walker', category: 'history', question: 'Who was the first person to walk on the Moon?', answer: 'Neil Armstrong.', choices: ['Neil Armstrong.', 'Buzz Aldrin.', 'Michael Collins.', 'Alan Shepard.'] },
{ id: 'history-machu-picchu-civilization', category: 'history', question: 'Which ancient civilization built Machu Picchu?', answer: 'Inca.', choices: ['Inca.', 'Maya.', 'Aztec.', 'Olmec.'] },
{ id: 'history-statue-liberty-france-bonus', category: 'history', question: 'The Statue of Liberty was a gift from which country?', answer: 'France.', choices: ['France.', 'England.', 'Germany.', 'Italy.'] },
{ id: 'history-maid-of-orleans', category: 'history', question: 'Who was known as the Maid of Orléans?', answer: 'Joan of Arc.', choices: ['Joan of Arc.', 'Marie Antoinette.', 'Catherine de Medici.', 'Eleanor of Aquitaine.'] },

{ id: 'science-red-planet-bonus', category: 'science', question: 'What planet is known as the Red Planet?', answer: 'Mars.', choices: ['Mars.', 'Venus.', 'Jupiter.', 'Mercury.'] },
{ id: 'science-adult-human-bones-bonus', category: 'science', question: 'How many bones are in the adult human body?', answer: '206.', choices: ['206.', '198.', '214.', '220.'] },
{ id: 'science-water-boiling-celsius-bonus', category: 'science', question: 'What is the boiling point of water at sea level?', answer: '100°C.', choices: ['100°C.', '90°C.', '95°C.', '110°C.'] },
{ id: 'science-universal-donor', category: 'science', question: 'Which blood type is known as the universal donor?', answer: 'O-.', choices: ['O-.', 'A+.', 'B-.', 'AB+.'] },
{ id: 'science-most-known-moons', category: 'science', question: 'Which planet has the most moons currently known?', answer: 'Saturn.', choices: ['Saturn.', 'Jupiter.', 'Uranus.', 'Neptune.'] },

{ id: 'sports-touchdown-points', category: 'sports', question: 'How many points is a touchdown worth in American football?', answer: '6.', choices: ['6.', '5.', '7.', '8.'] },
{ id: 'sports-2019-womens-world-cup', category: 'sports', question: 'Which country won the 2019 FIFA Women\'s World Cup?', answer: 'United States.', choices: ['United States.', 'England.', 'Germany.', 'Netherlands.'] },
{ id: 'sports-baseball-strikes-out', category: 'sports', question: 'In baseball, how many strikes make an out?', answer: 'Three.', choices: ['Three.', 'Two.', 'Four.', 'Five.'] },
{ id: 'sports-auto-racing-winner-flag', category: 'sports', question: 'What color flag signals the winner in auto racing?', answer: 'Checkered.', choices: ['Checkered.', 'Green.', 'Red.', 'Yellow.'] },
{ id: 'sports-slalom-giant-slalom', category: 'sports', question: 'What sport features events called slalom and giant slalom?', answer: 'Skiing.', choices: ['Skiing.', 'Snowboarding.', 'Bobsled.', 'Curling.'] },

{ id: 'technology-url-stands-for', category: 'technology', question: 'What does URL stand for?', answer: 'Uniform Resource Locator.', choices: ['Uniform Resource Locator.', 'Universal Resource Locator.', 'Uniform Retrieval Link.', 'Universal Retrieval Locator.'] },
{ id: 'technology-android-developer', category: 'technology', question: 'Which company developed the Android operating system?', answer: 'Google.', choices: ['Google.', 'Apple.', 'Microsoft.', 'Samsung.'] },
{ id: 'technology-pdf-stands-for', category: 'technology', question: 'What does PDF stand for?', answer: 'Portable Document Format.', choices: ['Portable Document Format.', 'Personal Data File.', 'Printed Document File.', 'Programmed Data Format.'] },
{ id: 'technology-apple-voice-assistant', category: 'technology', question: 'What is the name of Apple\'s voice assistant?', answer: 'Siri.', choices: ['Siri.', 'Alexa.', 'Cortana.', 'Bixby.'] },
{ id: 'technology-minecraft-creator', category: 'technology', question: 'Which company created Minecraft?', answer: 'Mojang.', choices: ['Mojang.', 'Valve.', 'Epic Games.', 'Blizzard.'] },

{ id: 'general-hexagon-sides-bonus', category: 'general', question: 'How many sides does a hexagon have?', answer: '6.', choices: ['6.', '5.', '7.', '8.'] },
{ id: 'general-leap-year-extra-day', category: 'general', question: 'Which month has an extra day during a leap year?', answer: 'February.', choices: ['February.', 'January.', 'March.', 'April.'] },
{ id: 'general-emerald-color', category: 'general', question: 'What color are emeralds?', answer: 'Green.', choices: ['Green.', 'Blue.', 'Red.', 'Purple.'] },
{ id: 'general-continents-count', category: 'general', question: 'How many continents are there?', answer: '7.', choices: ['7.', '5.', '6.', '8.'] },
{ id: 'general-tallest-animal-bonus', category: 'general', question: 'What is the tallest animal in the world?', answer: 'Giraffe.', choices: ['Giraffe.', 'Elephant.', 'Camel.', 'Moose.'] },

];
})();

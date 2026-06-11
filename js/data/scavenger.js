/* Additional scavenger hunt items and side-game prompts.

   Add new scavenger items to the matching sub-section below.
   Keep each id unique, lowercase, and hyphenated.
*/
(function () {
  // Vehicles, Plates, And Road Gear
  const vehicleAndPlateItems = [
    // Vehicle Colors And Types
    {
      id: 'yellow-car',
      emoji: '🚕',
      label: 'Yellow car',
      hint: 'Taxi counts, but only if someone calls it first.',
    },
    {
      id: 'green-vehicle',
      emoji: '🟢',
      label: 'Green vehicle',
      hint: 'Any shade of green. The car may vote on close calls.',
    },
    {
      id: 'car-color-purple',
      emoji: '🟣',
      label: 'Purple vehicle',
      hint: 'Rare color jackpot. Purple-ish counts if the car agrees.',
    },
    {
      id: 'convertible',
      emoji: '🏎️',
      label: 'Convertible',
      hint: 'Top up or down both count.',
    },
    {
      id: 'classic-car',
      emoji: '🚗',
      label: 'Classic car',
      hint: 'Older, shiny, unusual, or clearly beloved.',
    },
    {
      id: 'electric-car',
      emoji: '🔌',
      label: 'Electric car',
      hint: 'EV badge, charging station, or unmistakable electric model.',
    },
    {
      id: 'matching-cars',
      emoji: '👯',
      label: 'Two matching cars',
      hint: 'Same color and model near each other.',
    },
    {
      id: 'motorcycle-group',
      emoji: '🏍️',
      label: 'Motorcycle group',
      hint: 'Two or more motorcycles riding together.',
    },

    {
      id: 'batmobile-lookalike',
      emoji: '🦇',
      label: 'Batmobile lookalike',
      hint: 'A car that looks like a superhero drives it.',
    },
    {
      id: 'car-with-eyelashes',
      emoji: '👁️',
      label: 'Car with eyelashes',
      hint: 'Headlight eyelashes totally count.',
    },
    {
      id: 'mismatched-doors',
      emoji: '🚗',
      label: 'Mismatched car parts',
      hint: 'Different colored doors, hood, or panels.',
    },
    {
      id: 'giant-truck-tires',
      emoji: '🛞',
      label: 'Monster-sized tires',
      hint: 'The bigger the better.',
    },
    {
      id: 'car-named-after-animal',
      emoji: '🐎',
      label: 'Animal car model',
      hint: 'Mustang, Beetle, Bronco, Ram, etc.',
    },
    {
      id: 'car-with-flames',
      emoji: '🔥',
      label: 'Flame design',
      hint: 'Paint job, decal, or sticker.',
    },
    {
      id: 'vehicle-covered-in-stickers',
      emoji: '🏷️',
      label: 'Sticker-covered vehicle',
      hint: 'Bonus if it tells a story.',
    },
    {
      id: 'wood-paneled-car',
      emoji: '🪵',
      label: 'Wood-paneled vehicle',
      hint: 'Vintage wagon vibes.',
    },
    {
      id: 'tiny-car',
      emoji: '🚙',
      label: 'Tiny car',
      hint: 'Looks too small to fit groceries.',
    },
    {
      id: 'car-you-would-never-buy',
      emoji: '🤨',
      label: 'Car you would never own',
      hint: 'Everyone explains why.',
    },

    // License Plate Finds
    {
      id: 'vanity-plate',
      emoji: '🔠',
      label: 'Vanity plate',
      hint: 'A custom word, name, joke, or abbreviation.',
    },
    {
      id: 'funny-license-frame',
      emoji: '🔤',
      label: 'Funny license plate frame',
      hint: 'Must be family-friendly enough to read aloud.',
    },
    {
      id: 'plate-from-coast',
      emoji: '🌊',
      label: 'Coastal state plate',
      hint: 'Any state with an ocean coastline.',
    },
    {
      id: 'plate-from-landlocked',
      emoji: '🧭',
      label: 'Landlocked state plate',
      hint: 'Any state with no ocean coastline.',
    },
    {
      id: 'license-plate-letter-q',
      emoji: '🅀',
      label: 'License plate with Q',
      hint: 'Any plate containing the letter Q.',
    },
    {
      id: 'license-plate-letter-z',
      emoji: '🔡',
      label: 'License plate with Z',
      hint: 'Any plate containing the letter Z.',
    },
    {
      id: 'license-plate-three-same',
      emoji: '3️⃣',
      label: 'Three matching plate characters',
      hint: 'Examples: 777, AAA, 222, or BBB.',
    },
    {
      id: 'license-plate-adds-to-ten',
      emoji: '🔢',
      label: 'Plate digits add to 10',
      hint: 'Use the numbers on one license plate.',
    },

    {
      id: 'license-plate-repeating-number',
      emoji: '🔢',
      label: 'Repeating numbers',
      hint: 'Like 222 or 888.',
    },
    {
      id: 'license-plate-all-different',
      emoji: '🎲',
      label: 'All different digits',
      hint: 'No repeats allowed.',
    },
    {
      id: 'license-plate-initials',
      emoji: '🔠',
      label: 'Someone’s initials',
      hint: 'Guess their name.',
    },
    {
      id: 'license-plate-animal-word',
      emoji: '🐾',
      label: 'Animal vanity plate',
      hint: 'WOOF, CATDAD, etc.',
    },
    {
      id: 'license-plate-food-word',
      emoji: '🍔',
      label: 'Food vanity plate',
      hint: 'Unexpected cravings.',
    },

    // Carried Gear And Campers
    {
      id: 'roof-cargo',
      emoji: '🧳',
      label: 'Cargo on a roof',
      hint: 'Roof box, bikes, kayaks, luggage, or mystery bundle.',
    },
    {
      id: 'car-with-trailer',
      emoji: '🚙',
      label: 'Car pulling a trailer',
      hint: 'Boat, utility trailer, camper, or cargo trailer.',
    },
    {
      id: 'car-with-ladder',
      emoji: '🪜',
      label: 'Vehicle carrying a ladder',
      hint: 'Roof rack, truck bed, or work van ladder.',
    },
    {
      id: 'vehicle-with-bike-rack',
      emoji: '🚲',
      label: 'Bike rack',
      hint: 'Any vehicle carrying one or more bikes.',
    },
    {
      id: 'kayak-or-canoe',
      emoji: '🛶',
      label: 'Kayak or canoe',
      hint: 'On a roof, trailer, sign, store, or near water.',
    },
    {
      id: 'car-with-spare-tire',
      emoji: '🛞',
      label: 'Visible spare tire',
      hint: 'Mounted on the back, roof, trailer, or camper.',
    },
    {
      id: 'camper-with-name',
      emoji: '🏕️',
      label: 'Named camper or RV',
      hint: 'Look for a model name, custom name, or decal.',
    },

    // Work, Service, And Road Vehicles
    {
      id: 'vehicle-from-company-logo',
      emoji: '🏢',
      label: 'Company logo vehicle',
      hint: 'Any work vehicle with a readable business logo.',
    },
    {
      id: 'construction-vehicle',
      emoji: '🚧',
      label: 'Construction vehicle',
      hint: 'Crane, excavator, dump truck, roller, or bulldozer.',
    },
    {
      id: 'emergency-vehicle',
      emoji: '🚒',
      label: 'Emergency vehicle',
      hint: 'Fire truck, ambulance, police car, rescue truck.',
    },
    {
      id: 'farm-equipment',
      emoji: '🚜',
      label: 'Farm equipment',
      hint: 'Tractor, harvester, irrigation rig, or farm trailer.',
    },
    {
      id: 'mail-or-delivery-truck',
      emoji: '📬',
      label: 'Mail or delivery truck',
      hint: 'Postal, package, grocery, or courier vehicle.',
    },
    {
      id: 'moving-truck',
      emoji: '📦',
      label: 'Moving truck',
      hint: 'Rental truck, box truck, or moving-company vehicle.',
    },

    // Road Work Gear
    {
      id: 'road-work-cone-line',
      emoji: '🔶',
      label: 'Line of traffic cones',
      hint: 'Five or more cones in a row.',
    },
    {
      id: 'orange-traffic-barrel',
      emoji: '🟠',
      label: 'Orange traffic barrel',
      hint: 'Construction barrel, lane divider, or work-zone marker.',
    },
  ];

  // Signs, Routes, And Word Finds
  const signAndRouteItems = [
    // Highway And Route Signs
    {
      id: 'route-shield',
      emoji: '🛣️',
      label: 'Route shield sign',
      hint: 'Interstate, U.S. highway, state route, or county route marker.',
    },
    {
      id: 'green-highway-sign',
      emoji: '🟩',
      label: 'Green highway sign',
      hint: 'Exit, distance, city, route, or direction sign.',
    },
    {
      id: 'blue-road-sign',
      emoji: '🔵',
      label: 'Blue road sign',
      hint: 'Services, lodging, food, hospital, rest area, or information sign.',
    },
    {
      id: 'brown-attraction-sign',
      emoji: '🟤',
      label: 'Brown attraction sign',
      hint: 'Park, historic site, scenic area, museum, or recreation sign.',
    },
    {
      id: 'temporary-road-sign',
      emoji: '🚧',
      label: 'Temporary road sign',
      hint: 'Portable, digital, construction, detour, or lane sign.',
    },
    {
      id: 'speed-limit-ends-in-five',
      emoji: '5️⃣',
      label: 'Speed limit ending in 5',
      hint: 'Examples: 25, 35, 45, 55, 65, 75.',
    },
    {
      id: 'mile-marker-ending-zero',
      emoji: '0️⃣',
      label: 'Mile marker ending in 0',
      hint: 'Examples: 40, 120, 250.',
    },
    {
      id: 'exit-number-palindrome',
      emoji: '🔁',
      label: 'Palindrome exit number',
      hint: 'Same forward and backward, like 101 or 77.',
    },
    {
      id: 'toll-booth',
      emoji: '🧾',
      label: 'Toll booth or toll sign',
      hint: 'Old-school booth, transponder lane, or toll warning.',
    },
    {
      id: 'train-crossing',
      emoji: '🚦',
      label: 'Railroad crossing',
      hint: 'Tracks, crossing gates, warning sign, or station.',
    },

    {
      id: 'roundabout',
      emoji: '🔄',
      label: 'Roundabout',
      hint: 'The circle of confusion.',
    },
    {
      id: 'dead-end-sign',
      emoji: '⛔',
      label: 'Dead end sign',
      hint: 'Hopefully not your route.',
    },
    {
      id: 'yield-sign',
      emoji: '🔺',
      label: 'Yield sign',
      hint: 'One of the classics.',
    },
    {
      id: 'one-way-sign',
      emoji: '➡️',
      label: 'One-way sign',
      hint: 'Direction matters.',
    },
    {
      id: 'speed-limit-55',
      emoji: '5️⃣',
      label: '55 mph sign',
      hint: 'The old standard.',
    },
    {
      id: 'speed-limit-70plus',
      emoji: '🏎️',
      label: '70+ mph sign',
      hint: 'Wide-open spaces.',
    },
    {
      id: 'detour-sign',
      emoji: '↪️',
      label: 'Detour sign',
      hint: 'Adventure awaits.',
    },
    {
      id: 'road-closed-sign',
      emoji: '🚫',
      label: 'Road closed',
      hint: 'Not today.',
    },

    // Road Names And Places On Signs
    {
      id: 'airport-sign',
      emoji: '🛫',
      label: 'Airport sign',
      hint: 'Commercial, regional, municipal, or tiny airfield.',
    },
    {
      id: 'city-slogan',
      emoji: '📣',
      label: 'City slogan',
      hint: 'Welcome sign with a motto, nickname, or claim to fame.',
    },
    {
      id: 'county-line',
      emoji: '🗺️',
      label: 'County line sign',
      hint: 'Cross into a new county.',
    },
    {
      id: 'historical-person-sign',
      emoji: '🧑',
      label: 'Historical person on a sign',
      hint: 'A road, town, building, or marker named after someone.',
    },
    {
      id: 'road-named-after-number',
      emoji: '#️⃣',
      label: 'Numbered street name',
      hint: 'First Street, 2nd Avenue, Route 66, or similar.',
    },
    {
      id: 'road-named-after-tree',
      emoji: '🌳',
      label: 'Road named after a tree',
      hint: 'Oak, Pine, Maple, Cedar, Palm, or another tree name.',
    },

    {
      id: 'business-with-exclamation',
      emoji: '❗',
      label: 'Business with !',
      hint: 'Extra excitement.',
    },
    {
      id: 'world-famous-claim',
      emoji: '🌎',
      label: '"World Famous"',
      hint: 'Whether true or not.',
    },

    // Sign Graphics And Wordplay
    {
      id: 'animal-crossing-sign',
      emoji: '⚠️',
      label: 'Animal crossing sign',
      hint: 'Deer, elk, cows, turtles, ducks, or anything crossing.',
    },
    {
      id: 'billboard-with-question',
      emoji: '❓',
      label: 'Billboard with a question',
      hint: 'Any ad or sign that asks something.',
    },
    {
      id: 'same-word-twice',
      emoji: '✌️',
      label: 'Same word twice',
      hint: 'A sign or billboard repeating one word.',
    },
    {
      id: 'sign-with-arrow',
      emoji: '➡️',
      label: 'Sign with an arrow',
      hint: 'Any road, business, detour, parking, or attraction arrow.',
    },
    {
      id: 'sign-with-mountain',
      emoji: '🏔️',
      label: 'Mountain on a sign',
      hint: 'Icon, logo, warning sign, park sign, or business sign.',
    },
    {
      id: 'sign-with-rhyming-words',
      emoji: '🎵',
      label: 'Rhyming sign',
      hint: 'Two words that rhyme on the same sign.',
    },
    {
      id: 'sign-with-star',
      emoji: '⭐',
      label: 'Star on a sign',
      hint: 'Any star shape on a sign, logo, flag, or billboard.',
    },
    {
      id: 'sign-with-sun',
      emoji: '☀️',
      label: 'Sun on a sign',
      hint: 'A drawn sun, logo sun, weather sign, or solar ad.',
    },
    {
      id: 'thermometer-sign',
      emoji: '🌡️',
      label: 'Temperature display',
      hint: 'Bank, pharmacy, school, car wash, or digital sign showing temperature.',
    },
  ];

  // Places, Services, And Stops
  const placeAndServiceItems = [
    // Food And Drink Stops
    {
      id: 'drive-thru',
      emoji: '🥤',
      label: 'Drive-thru lane',
      hint: 'Food, coffee, bank, pharmacy, or car wash drive-thru.',
    },
    {
      id: 'ice-cream-sign',
      emoji: '🍦',
      label: 'Ice cream sign',
      hint: 'Shop, billboard, gas station poster, or giant cone.',
    },
    {
      id: 'local-diner',
      emoji: '🥞',
      label: 'Local diner',
      hint: 'A non-chain breakfast, burger, or coffee spot.',
    },
    {
      id: 'restaurant-pun',
      emoji: '🍔',
      label: 'Restaurant pun',
      hint: 'A food place name trying very hard to be funny.',
    },
    {
      id: 'roadside-produce',
      emoji: '🍓',
      label: 'Roadside produce stand',
      hint: 'Fruit, vegetables, honey, nuts, or farm goods.',
    },
    {
      id: 'farmers-market-sign',
      emoji: '🥕',
      label: 'Farmers market sign',
      hint: 'Market sign, banner, billboard, or roadside notice.',
    },

    // Business Names And Claims
    {
      id: 'business-with-animal-pun',
      emoji: '😄',
      label: 'Animal pun business',
      hint: 'Like "Paws & Relax."',
    },
    {
      id: 'business-with-food-pun',
      emoji: '🍕',
      label: 'Food pun business',
      hint: 'The cheesier the better.',
    },
    {
      id: 'business-with-rhyme',
      emoji: '🎶',
      label: 'Rhyming business name',
      hint: 'Bonus for alliteration too.',
    },
    {
      id: 'business-named-after-owner',
      emoji: '👤',
      label: 'Owner-named business',
      hint: 'Bob\'s, Sally\'s, etc.',
    },
    {
      id: 'business-with-mascot',
      emoji: '🎭',
      label: 'Business mascot',
      hint: 'Characters sell products.',
    },
    {
      id: 'closed-business',
      emoji: '🚪',
      label: 'Closed business',
      hint: 'The mystery of what happened.',
    },
    {
      id: 'open-24-hours',
      emoji: '🕛',
      label: '24-hour business',
      hint: 'The road never sleeps.',
    },
    {
      id: 'business-with-neon',
      emoji: '💡',
      label: 'Neon sign',
      hint: 'Old-school cool.',
    },

    // Travel Services
    {
      id: 'gas-station-canopy',
      emoji: '⛽',
      label: 'Gas station canopy',
      hint: 'The big roof over pumps. Bonus if it has unusual colors.',
    },
    {
      id: 'charging-station',
      emoji: '🔋',
      label: 'EV charging station',
      hint: 'Any electric vehicle charger or charging sign.',
    },
    {
      id: 'car-wash',
      emoji: '🫧',
      label: 'Car wash',
      hint: 'Automatic, self-serve, fundraiser, or car-wash sign.',
    },
    {
      id: 'rest-area-sign',
      emoji: '🅿️',
      label: 'Rest area sign',
      hint: 'Rest stop, service plaza, picnic area, or scenic turnout sign.',
    },
    {
      id: 'picnic-table',
      emoji: '🧺',
      label: 'Picnic table',
      hint: 'At a rest stop, park, campsite, business, or roadside area.',
    },
    {
      id: 'recycling-bin',
      emoji: '♻️',
      label: 'Recycling bin',
      hint: 'Public bin, rest-stop bin, business bin, or recycling sign.',
    },

    // Community Places
    {
      id: 'cemetery',
      emoji: '🪦',
      label: 'Cemetery',
      hint: 'Gravestones, cemetery sign, memorial garden, or historic burial ground.',
    },
    {
      id: 'dog-park-sign',
      emoji: '🐾',
      label: 'Dog park sign',
      hint: 'Dog park, pet area, or pet relief sign.',
    },
    {
      id: 'library-sign',
      emoji: '📚',
      label: 'Library sign',
      hint: 'Public library, little free library, bookmobile, or library direction sign.',
    },
    {
      id: 'museum-sign',
      emoji: '🏛️',
      label: 'Museum sign',
      hint: 'History, art, science, roadside, railroad, car, or local museum.',
    },
    {
      id: 'playground',
      emoji: '🛝',
      label: 'Playground',
      hint: 'Slides, swings, climbing structure, or play-area sign.',
    },
    {
      id: 'school-mascot',
      emoji: '🏫',
      label: 'School mascot',
      hint: 'On a sign, bus, field, building, or banner.',
    },
    {
      id: 'sports-stadium',
      emoji: '🏟️',
      label: 'Sports stadium or field',
      hint: 'Professional, school, community, or roadside field.',
    },

    // Local Landmarks And Buildings
    {
      id: 'bridge-with-name',
      emoji: '🌉',
      label: 'Named bridge',
      hint: 'Any bridge sign with a name, dedication, river, or route.',
    },
    {
      id: 'clock-outside',
      emoji: '🕒',
      label: 'Outdoor clock',
      hint: 'Bank clock, tower clock, sign clock, or building clock.',
    },
    {
      id: 'drive-in-theater',
      emoji: '🎬',
      label: 'Drive-in theater',
      hint: 'A sign, screen, entrance, or billboard.',
    },
    {
      id: 'motel-retro-sign',
      emoji: '🏨',
      label: 'Retro motel sign',
      hint: 'Bonus style points for neon or old lettering.',
    },
    {
      id: 'odd-shaped-building',
      emoji: '🏠',
      label: 'Odd-shaped building',
      hint: 'Round, triangular, themed, tiny, huge, or just strange.',
    },
    {
      id: 'water-tank-art',
      emoji: '🎨',
      label: 'Decorated water tower',
      hint: 'Painted logo, town name, mascot, mural, or unusual color.',
    },

    // Homes And Yards
    {
      id: 'house-with-turret',
      emoji: '🏠',
      label: 'House with a turret',
      hint: 'Mini castle energy.',
    },
    {
      id: 'house-with-porch-swing',
      emoji: '🪑',
      label: 'Porch swing',
      hint: 'Looks relaxing.',
    },
    {
      id: 'house-with-gnomes',
      emoji: '🧙‍♂️',
      label: 'Garden gnomes',
      hint: 'The more the merrier.',
    },
    {
      id: 'house-with-windmill',
      emoji: '🌬️',
      label: 'Decorative windmill',
      hint: 'Farmhouse aesthetic.',
    },
    {
      id: 'treehouse',
      emoji: '🌲',
      label: 'Treehouse',
      hint: 'Childhood dreams.',
    },
    {
      id: 'house-with-flagpole',
      emoji: '🚩',
      label: 'Residential flagpole',
      hint: 'Any flag counts.',
    },
    {
      id: 'yard-statue',
      emoji: '🗿',
      label: 'Yard statue',
      hint: 'Taste is subjective.',
    },
    {
      id: 'yard-full-of-flamingos',
      emoji: '🦩',
      label: 'Pink flamingos',
      hint: 'Peak lawn décor.',
    },
    {
      id: 'giant-holiday-decoration',
      emoji: '🎄',
      label: 'Out-of-season decoration',
      hint: 'Christmas in July?',
    },
    {
      id: 'house-under-construction',
      emoji: '🏗️',
      label: 'House being built',
      hint: 'Future home.',
    },

    {
      id: 'bridge-over-water',
      emoji: '🌉',
      label: 'Bridge over water',
      hint: 'Tiny creeks count.',
    },
    {
      id: 'bridge-over-road',
      emoji: '🚧',
      label: 'Bridge over another road',
      hint: 'Double transportation.',
    },

    // Communication And Utility Sites
    {
      id: 'local-radio-tower',
      emoji: '📻',
      label: 'Radio tower',
      hint: 'Tall broadcast tower, antenna, or radio station sign.',
    },
    {
      id: 'satellite-dish',
      emoji: '📡',
      label: 'Satellite dish',
      hint: 'On a roof, building, yard, truck, or communications site.',
    },
  ];

  // Nature, Animals, And Weather
  const natureAndWeatherItems = [
    {
      id: 'duck-family',
      emoji: '🦆',
      label: 'Duck family',
      hint: 'Baby ducks earn bragging rights.',
    },
    {
      id: 'rabbit',
      emoji: '🐇',
      label: 'Rabbit',
      hint: 'Real, logo, or statue.',
    },
    {
      id: 'fox',
      emoji: '🦊',
      label: 'Fox',
      hint: 'Rare enough to celebrate.',
    },
    {
      id: 'moose-reference',
      emoji: '🫎',
      label: 'Moose reference',
      hint: 'Especially common up north.',
    },
    {
      id: 'bear-reference',
      emoji: '🐻',
      label: 'Bear reference',
      hint: 'Real bear, sign, or mascot.',
    },
    {
      id: 'fish',
      emoji: '🐟',
      label: 'Fish',
      hint: 'Aquarium, logo, sculpture, or actual fish.',
    },
    {
      id: 'bee',
      emoji: '🐝',
      label: 'Bee',
      hint: 'Look closely at signs and murals.',
    },
    {
      id: 'butterfly',
      emoji: '🦋',
      label: 'Butterfly',
      hint: 'Nature points.',
    },
    {
      id: 'turtle',
      emoji: '🐢',
      label: 'Turtle',
      hint: 'Crossing signs often help.',
    },
    {
      id: 'frog',
      emoji: '🐸',
      label: 'Frog',
      hint: 'Unexpected amphibian appearance.',
    },

    // Animals And Animal Clues
    {
      id: 'animal-statue',
      emoji: '🦌',
      label: 'Animal statue',
      hint: 'Any animal sculpture, mascot, lawn figure, or roadside display.',
    },
    {
      id: 'bird-on-wire',
      emoji: '🐦',
      label: 'Bird on a wire',
      hint: 'One or more birds sitting on a power line.',
    },
    {
      id: 'horse-or-cow',
      emoji: '🐄',
      label: 'Horse or cow',
      hint: 'Real animal, statue, billboard, or logo.',
    },
    {
      id: 'nest-or-birdhouse',
      emoji: '🪺',
      label: 'Nest or birdhouse',
      hint: 'Real nest, birdhouse, nesting platform, or bird sign.',
    },

    // Trees, Plants, And Rocks
    {
      id: 'big-tree',
      emoji: '🌲',
      label: 'Huge tree',
      hint: 'A tree noticeably taller, wider, or stranger than the rest.',
    },
    {
      id: 'flower-display',
      emoji: '🌸',
      label: 'Flower display',
      hint: 'Median flowers, hanging basket, garden bed, or roadside blooms.',
    },
    {
      id: 'rock-wall',
      emoji: '🪨',
      label: 'Rock wall or cliff cut',
      hint: 'Road cut, stone wall, canyon wall, or exposed layers.',
    },
    {
      id: 'tree-row',
      emoji: '🌳',
      label: 'Perfect row of trees',
      hint: 'A planted line along a road, farm, driveway, or park.',
    },

    {
      id: 'sunflower-field',
      emoji: '🌻',
      label: 'Sunflower field',
      hint: 'Instant mood booster.',
    },
    {
      id: 'pumpkin-patch',
      emoji: '🎃',
      label: 'Pumpkin patch',
      hint: 'Seasonal bonus.',
    },
    {
      id: 'vineyard',
      emoji: '🍇',
      label: 'Vineyard',
      hint: 'Rows and rows of grapes.',
    },
    {
      id: 'orchard',
      emoji: '🍎',
      label: 'Fruit orchard',
      hint: 'Apple, peach, cherry, etc.',
    },
    {
      id: 'cornfield',
      emoji: '🌽',
      label: 'Cornfield',
      hint: 'A Midwest classic.',
    },
    {
      id: 'hay-bales',
      emoji: '🟡',
      label: 'Hay bales',
      hint: 'Round or square.',
    },
    {
      id: 'cactus',
      emoji: '🌵',
      label: 'Cactus',
      hint: 'Potted plants count too.',
    },
    {
      id: 'wildflowers',
      emoji: '🌼',
      label: 'Wildflowers',
      hint: 'Nature showing off.',
    },
    {
      id: 'tree-tunnel',
      emoji: '🌳',
      label: 'Tree tunnel',
      hint: 'Road enclosed by trees.',
    },
    {
      id: 'rock-formation',
      emoji: '🪨',
      label: 'Interesting rock formation',
      hint: 'Nature gets weird.',
    },

    // Water And Sky
    {
      id: 'cloud-line',
      emoji: '☁️',
      label: 'Straight cloud line',
      hint: 'A cloud edge, contrail, or row that looks unusually straight.',
    },
    {
      id: 'rainbow-or-prism',
      emoji: '🌈',
      label: 'Rainbow colors',
      hint: 'Real rainbow, prism, sticker, mural, flag, sign, or reflection.',
    },
    {
      id: 'shadow-shape',
      emoji: '🌘',
      label: 'Funny shadow',
      hint: 'A shadow that looks like an animal, object, face, or letter.',
    },
    {
      id: 'water-crossing',
      emoji: '💦',
      label: 'River, lake, or canal',
      hint: 'Any real water you pass or cross.',
    },
    {
      id: 'water-reflection',
      emoji: '🪞',
      label: 'Reflection in water',
      hint: 'Sky, trees, bridge, building, or lights reflected in water.',
    },
    {
      id: 'weather-changing',
      emoji: '🌦️',
      label: 'Weather change',
      hint: 'Clear to cloudy, rain starting, fog, wind, snow, or sunshine breaking through.',
    },

    // Natural Features And Energy
    {
      id: 'mountain-or-hill-name',
      emoji: '⛰️',
      label: 'Named mountain or hill',
      hint: 'Any sign naming a peak, pass, hill, or range.',
    },
    {
      id: 'solar-roof',
      emoji: '🏠',
      label: 'Solar panels on a roof',
      hint: 'Home, store, school, station, barn, or warehouse roof.',
    },
    {
      id: 'weather-vane',
      emoji: '🪁',
      label: 'Weather vane',
      hint: 'Roof rooster, arrow, or decorative wind marker.',
    },
    {
      id: 'wind-turbine',
      emoji: '💨',
      label: 'Wind turbine',
      hint: 'One turbine counts; a whole field is bragging rights.',
    },
  ];

  // Landmarks, Art, And Oddities
  const landmarkAndOddityItems = [
    // Art And Displays
    {
      id: 'public-art',
      emoji: '🎨',
      label: 'Public art',
      hint: 'Mural, sculpture, decorated utility box, or painted wall.',
    },
    {
      id: 'statue-person',
      emoji: '🗿',
      label: 'Statue of a person',
      hint: 'Historic figure, local hero, mascot, or roadside oddity.',
    },
    {
      id: 'train-car-graffiti',
      emoji: '🎨',
      label: 'Train car art',
      hint: 'Colorful freight car, mural, logo, or family-friendly graffiti.',
    },

    // Flags And Towers
    {
      id: 'flag-half-staff',
      emoji: '🏳️',
      label: 'Flag at half-staff',
      hint: 'Any flag lowered below the top of the pole.',
    },
    {
      id: 'flag-not-us-state',
      emoji: '🏳️',
      label: 'Flag that is not a U.S. state flag',
      hint: 'Country, city, sports, pride, pirate, or business flag.',
    },
    {
      id: 'giant-flag',
      emoji: '🚩',
      label: 'Giant flag',
      hint: 'Big enough that everyone notices it.',
    },
    {
      id: 'cell-tower-disguised',
      emoji: '📡',
      label: 'Disguised cell tower',
      hint: 'Tree tower, flagpole tower, or something trying to blend in.',
    },

    // Fantasy And Character Finds
    {
      id: 'pirate-reference',
      emoji: '🏴‍☠️',
      label: 'Pirate reference',
      hint: 'Businesses love pirates.',
    },
    {
      id: 'dragon',
      emoji: '🐉',
      label: 'Dragon',
      hint: 'Statue, mural, logo, or toy.',
    },
    {
      id: 'dinosaur',
      emoji: '🦕',
      label: 'Dinosaur',
      hint: 'Roadside dinosaurs are elite.',
    },
    {
      id: 'wizard',
      emoji: '🧙',
      label: 'Wizard',
      hint: 'Fantasy finds count.',
    },
    {
      id: 'mermaid',
      emoji: '🧜',
      label: 'Mermaid',
      hint: 'Unexpected aquatic royalty.',
    },
    {
      id: 'robot',
      emoji: '🤖',
      label: 'Robot',
      hint: 'Decoration, ad, or actual machine.',
    },
    {
      id: 'cowboy',
      emoji: '🤠',
      label: 'Cowboy',
      hint: 'Hat required.',
    },
    {
      id: 'knight',
      emoji: '⚔️',
      label: 'Knight',
      hint: 'Armor not mandatory.',
    },
    {
      id: 'superhero',
      emoji: '🦸',
      label: 'Superhero',
      hint: 'Any recognizable hero.',
    },
    {
      id: 'princess',
      emoji: '👑',
      label: 'Princess reference',
      hint: 'Royalty appears everywhere.',
    },

    // Conversation Starters
    {
      id: 'something-older-than-grandma',
      emoji: '👵',
      label: 'Something older than Grandma',
      hint: 'Historic-looking counts.',
    },
    {
      id: 'something-futuristic',
      emoji: '🚀',
      label: 'Something futuristic',
      hint: 'Looks ahead 100 years.',
    },
    {
      id: 'something-you-want',
      emoji: '😍',
      label: 'Something you want',
      hint: 'Everyone explains why.',
    },
    {
      id: 'something-you-dont-understand',
      emoji: '🤷',
      label: 'Something confusing',
      hint: 'Mystery accepted.',
    },
    {
      id: 'something-that-makes-you-laugh',
      emoji: '🤣',
      label: 'Something that makes you laugh',
      hint: 'The best discoveries.',
    },

    // Unexpected Finds
    {
      id: 'someone-waving',
      emoji: '👋',
      label: 'Someone waving',
      hint: 'Passenger, pedestrian, mascot, statue, or sign character.',
    },
    {
      id: 'tunnel',
      emoji: '🚇',
      label: 'Tunnel',
      hint: 'Road tunnel, pedestrian tunnel, or train tunnel.',
    },
  ];

  window.RTA_SCAVENGER_ITEMS = vehicleAndPlateItems
    .concat(signAndRouteItems)
    .concat(placeAndServiceItems)
    .concat(natureAndWeatherItems)
    .concat(landmarkAndOddityItems);

  // Lightning Round Prompts
  window.RTA_LIGHTNING_ROUNDS = [
    'First player to point out something shaped like a letter wins. The group must agree it really looks like that letter.',
    'One passenger runs a 60-second timer. First player to point out three different numbers outside the car wins.',
    'First player to point out something red, something round, and something taller than the car wins. The group verifies each find.',
    'First player to read a word on a sign that nobody in the car has said today wins. If anyone remembers saying it, keep playing.',
    'Everyone picks a color. First player to point out that color twice wins. The same object cannot count twice.',
    'Before the next exit, each player nominates one funny business name. At the exit, the car votes for the winner.',
    'First player to point out a vehicle with something attached to the roof wins. Roof racks count only if something is on them.',
    'First player to point out a sign with an animal, food, or place name on it wins.',
    'First player to point out something that looks like it belongs in a movie scene wins if the group accepts the pitch.',
    'First player to spot an out-of-state license plate wins. If multiple people call one at once, the farthest-away state breaks the tie.',
    'First player to read a bumper sticker or decal out loud wins, as long as it is family-friendly.',
    'First player to point out a vehicle carrying something unusual wins. The group decides if it is unusual enough.',
    'First player to point out three different road-sign colors wins. Each color must come from a different sign.',
    'First player to point out something outside that starts with the same letter as their initials wins.',
    'First player to point out five circles wins. Wheels count once per vehicle, not once per tire.',
    'First player to point out one thing that looks older than the car and one thing that looks newer wins.',
    'When the next business sign appears, everyone gets one guess before it is readable. Anyone who guessed correctly wins the round.',
    'Everyone guesses the color of the next truck before it appears. The first truck everyone can see decides the winner.',
    'First player to point out something that would make a good album cover wins after giving the album a title.',
    'First player to spot a word with double letters on a sign wins. Example: coffee, mall, speedway.',
  ];

  // ETA Guess Challenges
  window.RTA_ETA_CHALLENGES = [
    'Everyone guesses the arrival time down to the minute. When you arrive, the clock decides whose guess was closest.',
    'If a navigation ETA is visible to a passenger, predict whether the next ETA update goes earlier, later, or stays the same.',
    'Before the next song starts, everyone guesses how many miles remain when it ends. A passenger checks the display or nearest mile marker.',
    'Pick a visible upcoming landmark, exit, or town sign. Everyone guesses the minute you pass it; the clock decides the winner.',
    'Everyone predicts the minute you reach the next rest stop, gas stop, or planned break. The clock decides the winner.',
    'Guess the minute when the next person says, "Are we there yet?" If nobody says it in 20 minutes, the round ends with no point.',
    'Everyone guesses the next gas price you pass. The first readable gas-price sign decides; closest without going over wins.',
    'Guess how many minutes until the next bridge, tunnel, or overpass. The clock decides when you pass under or onto it.',
    'If navigation is visible to a passenger, guess how many exits or turns until the ETA changes. The display decides.',
    'Guess the minute when the next speed limit sign appears. The clock decides when the sign is first readable.',
    'Everyone predicts the next town or city name you will see on a sign. The first readable town or city sign decides.',
    'Guess how many full songs will play before the next stop. Count only songs that start after the guess is made.',
    'If a navigation ETA is visible to a passenger, predict whether the next update changes by 1 minute, 2 minutes, or 3+ minutes.',
  ];

  // Alphabet Game Themes
  window.RTA_ALPHABET_THEMES = [
    {
      id: 'animals',
      label: 'Animals',
      prompt: 'Name an animal that starts with',
    },
    {
      id: 'cities',
      label: 'Cities',
      prompt: 'Name a city, town, or place that starts with',
    },
    {
      id: 'foods',
      label: 'Foods',
      prompt: 'Name a food or drink that starts with',
    },
    {
      id: 'music',
      label: 'Music',
      prompt: 'Name a song, artist, or band that starts with',
    },
    {
      id: 'roadside',
      label: 'Roadside Finds',
      prompt: 'Spot or name something road-trip related that starts with',
    },
    {
      id: 'states',
      label: 'States',
      prompt: 'Name a U.S. state that starts with',
    },
    {
      id: 'movies-tv',
      label: 'Movies & TV',
      prompt: 'Name a movie or TV show that starts with',
    },
    {
      id: 'sports',
      label: 'Sports',
      prompt: 'Name a team, athlete, sport, or sports term that starts with',
    },
    {
      id: 'anything',
      label: 'Anything',
      prompt: 'Name anything family-friendly that starts with',
    },
  ];

  // Chaos Challenges
  window.RTA_CHAOS_CHALLENGES = [
    'On three, everyone points left or right. Players who point with the majority stay in; repeat until one winner remains.',
    'One passenger watches a clock. Everyone else silently raises a hand when they think 10 seconds passed; closest wins.',
    'First player to point out something beginning with the first letter of their initials wins.',
    'Everyone predicts the next billboard category: lawyer, food, tourism, car, or other. The next readable billboard decides.',
    'No one may say "car" for the next 5 minutes. One passenger watches the clock; anyone who says it is out.',
    'First player to point out something that looks expensive and something that looks homemade wins. The group verifies both.',
    'Everyone invents a backstory for the next unusual vehicle. After all stories are told, the car votes for the best one.',
    'Everyone guesses the state of the next out-of-state plate before it is readable. The first readable out-of-state plate decides.',
    'The next real or pictured animal spotted becomes the team mascot. First player to spot it gets naming rights.',
    'First player to spot something that would confuse someone from 100 years ago wins after explaining why.',
    'When the next town name appears, each player describes it using only three words. The car votes for the best description.',
    'Everyone makes up a slogan for the next business you pass. After everyone shares, the car votes for the winner.',
  ];

  // Mini Bets
  window.RTA_MINI_BETS = [
    'Before the next billboard is readable, predict its category: food, lawyer, tourism, car, or other. The sign decides.',
    'Before the next animal is spotted, predict whether it has feathers, fur, scales, or none of those. Real or pictured animals count.',
    'Before the next out-of-state plate is readable, predict whether the state is east or west of your current state. The plate decides.',
    'Before the next business sign is readable, predict whether it has a person\'s name in it. The sign decides.',
    'Before the next pickup truck passes, predict whether it is carrying something in the bed. The truck decides.',
    'Before the next gas station sign is readable, predict whether it is a national chain or local brand. The sign decides.',
    'Before the next fast-food sign is readable, predict burgers, pizza, tacos, chicken, or other. The sign decides.',
    'Before the next unusual vehicle appears, predict whether the group will call it practical or ridiculous. Majority vote decides.',
    'Before the next town slogan is readable, predict whether it will sound serious, funny, or confusing. The car votes after reading it.',
    'Before the next mascot, logo, or statue appears, predict animal, person, object, or other. The first clear mascot-like thing decides.',
  ];
})();

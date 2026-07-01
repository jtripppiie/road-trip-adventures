/*
 * Hide & Seek Adventure map data.
 *
 * This file is intentionally data-only so rooms, exits, obstacles, and hide
 * spots can grow without making the main application script harder to work in.
 *
 * Hide spot art can optionally be tuned without changing the renderer:
 * {
 *   art: {
 *     scale: 1.08,
 *     scaleX: 1.12,
 *     scaleY: 0.94,
 *     width: 210,
 *     height: 96,
 *     offsetX: -6,
 *     offsetY: 8,
 *     anchorX: 'center', // left | center | right
 *     anchorY: 'center', // top | center | bottom
 *   }
 * }
 */
(function () {
  window.RTA_HIDE_SEEK_MAPS = {
    'roadside-lodge': {
      id: 'roadside-lodge',
      name: 'Roadside Lodge',
      startRoom: 'lobby',
      palette: { wall: '#28405c', floor: '#d8a85d', trim: '#09233f', accent: '#f58220' },
      rooms: {
        lobby: {
          id: 'lobby',
          name: 'Lobby',
          exits: [
            { label: 'Bedroom', targetRoom: 'bedroom', x: 748, y: 180, width: 28, height: 92, spawnX: 60, spawnY: 232 },
            { label: 'Garage', targetRoom: 'garage', x: 365, y: 392, width: 110, height: 28, spawnX: 400, spawnY: 112 },
            { label: 'Courtyard', targetRoom: 'courtyard', x: 24, y: 180, width: 28, height: 92, spawnX: 708, spawnY: 232 },
          ],
          spots: [
            { id: 'lobby-front-desk', label: 'front desk', kind: 'desk', x: 300, y: 245, width: 185, height: 72, difficulty: 2, art: { scaleY: 1.05 } },
            { id: 'lobby-sofa', label: 'blue lobby sofa', kind: 'couch', x: 492, y: 100, width: 198, height: 84, difficulty: 3, searchText: { empty: 'The sofa cushions are squished, but nobody is tucked in.', found: 'A sneaker sticks out from under the blue lobby sofa.' }, art: { scaleX: 1.04, scaleY: 1.06 } },
            { id: 'lobby-curtains', label: 'sunset curtains', kind: 'curtain', x: 92, y: 90, width: 90, height: 190, difficulty: 3, searchText: { empty: 'The curtains sway, then settle. Empty.', found: 'The sunset curtains twitch at exactly the wrong time.' } },
            { id: 'lobby-luggage-cart', label: 'luggage cart', kind: 'luggage', x: 570, y: 270, width: 110, height: 75, difficulty: 4 },
          ],
          obstacles: [{ id: 'lobby-rug', type: 'slow', x: 250, y: 328, width: 300, height: 52, speedMultiplier: 0.65 }],
        },
        bedroom: {
          id: 'bedroom',
          name: 'Guest Room',
          exits: [{ label: 'Lobby', targetRoom: 'lobby', x: 24, y: 180, width: 28, height: 92, spawnX: 706, spawnY: 232 }],
          spots: [
            { id: 'bedroom-bed', label: 'under the bed', kind: 'bed', x: 270, y: 285, width: 220, height: 70, difficulty: 3 },
            { id: 'bedroom-window-drapes', label: 'window drapes', kind: 'curtain', x: 145, y: 92, width: 85, height: 170, difficulty: 4 },
            { id: 'bedroom-closet', label: 'closet', kind: 'closet', x: 610, y: 95, width: 100, height: 175, difficulty: 4 },
            { id: 'bedroom-laundry', label: 'laundry pile', kind: 'box', x: 92, y: 288, width: 112, height: 76, difficulty: 2 },
          ],
          obstacles: [{ id: 'bedroom-table', type: 'block', x: 500, y: 305, width: 70, height: 50 }],
        },
        garage: {
          id: 'garage',
          name: 'Garage',
          exits: [{ label: 'Lobby', targetRoom: 'lobby', x: 345, y: 24, width: 150, height: 28, spawnX: 400, spawnY: 350 }],
          spots: [
            { id: 'garage-toolbox', label: 'tool wall', kind: 'shelf', x: 92, y: 95, width: 145, height: 92, difficulty: 2 },
            { id: 'garage-spare-tires', label: 'spare tires', kind: 'box', x: 570, y: 105, width: 76, height: 70, difficulty: 3 },
            { id: 'garage-cardboard', label: 'cardboard stack', kind: 'box', x: 218, y: 268, width: 120, height: 84, difficulty: 3 },
            { id: 'garage-van', label: 'behind the pickup truck', kind: 'car', x: 505, y: 190, width: 198, height: 114, difficulty: 5, interactionRadius: 68, art: { scaleX: 1.03, scaleY: 1.02 } },
          ],
          obstacles: [{ id: 'garage-oil', type: 'slow', x: 260, y: 355, width: 170, height: 34, speedMultiplier: 0.55 }],
        },
        courtyard: {
          id: 'courtyard',
          name: 'Courtyard',
          exits: [{ label: 'Lobby', targetRoom: 'lobby', x: 748, y: 180, width: 28, height: 92, spawnX: 72, spawnY: 232 }],
          spots: [
            { id: 'courtyard-bushes', label: 'desert bushes', kind: 'bush', x: 120, y: 250, width: 160, height: 95, difficulty: 3 },
            { id: 'courtyard-patio-bench', label: 'patio bench', kind: 'bench', x: 292, y: 108, width: 155, height: 62, difficulty: 2 },
            { id: 'courtyard-fountain', label: 'dry fountain', kind: 'fountain', x: 350, y: 185, width: 130, height: 100, difficulty: 4 },
            { id: 'courtyard-tree', label: 'shade tree', kind: 'tree', x: 610, y: 130, width: 95, height: 200, difficulty: 5, art: { scaleX: 1.08, scaleY: 1.04 } },
          ],
          obstacles: [{ id: 'courtyard-planter', type: 'block', x: 315, y: 320, width: 185, height: 42 }],
        },
      },
    },
    'alaska-train': {
      id: window.RTA_THEMES['alaska-train'].id,
      name: window.RTA_THEMES['alaska-train'].label,
      startRoom: 'observation',
      palette: { wall: '#21394f', floor: '#b8d8ea', trim: '#061524', accent: '#2ec7d3' },
      rooms: {
        observation: {
          id: 'observation',
          name: 'Observation Car',
          exits: [{ label: 'Sleeper', targetRoom: 'sleeper', x: 748, y: 180, width: 28, height: 92, spawnX: 60, spawnY: 232 }],
          spots: [
            { id: 'observation-window-seat', label: 'window seat', kind: 'bench', x: 92, y: 265, width: 150, height: 70, difficulty: 2 },
            { id: 'observation-coat-hooks', label: 'coat hooks', kind: 'curtain', x: 320, y: 90, width: 110, height: 170, difficulty: 3 },
            { id: 'observation-overhead-bags', label: 'overhead bags', kind: 'shelf', x: 455, y: 105, width: 100, height: 82, difficulty: 3 },
            { id: 'observation-snack-cart', label: 'snack cart', kind: 'luggage', x: 575, y: 275, width: 120, height: 74, difficulty: 4, searchText: { empty: 'Snack wrappers crinkle, but the cart is clear.', found: 'The snack cart rattles and gives the hiding spot away.' } },
          ],
          obstacles: [{ id: 'observation-aisle', type: 'slow', x: 250, y: 335, width: 320, height: 40, speedMultiplier: 0.75 }],
        },
        sleeper: {
          id: 'sleeper',
          name: 'Sleeper Car',
          exits: [
            { label: 'Observation', targetRoom: 'observation', x: 24, y: 180, width: 28, height: 92, spawnX: 706, spawnY: 232 },
            { label: 'Baggage', targetRoom: 'baggage', x: 748, y: 180, width: 28, height: 92, spawnX: 60, spawnY: 232 },
          ],
          spots: [
            { id: 'sleeper-bunk', label: 'upper bunk', kind: 'bed', x: 210, y: 110, width: 210, height: 68, difficulty: 4 },
            { id: 'sleeper-folding-table', label: 'folding table', kind: 'desk', x: 330, y: 270, width: 120, height: 64, difficulty: 2 },
            { id: 'sleeper-curtain', label: 'privacy curtain', kind: 'curtain', x: 535, y: 90, width: 95, height: 190, difficulty: 3 },
            { id: 'sleeper-duffel', label: 'duffel pile', kind: 'box', x: 85, y: 292, width: 130, height: 70, difficulty: 2 },
          ],
          obstacles: [],
        },
        baggage: {
          id: 'baggage',
          name: 'Baggage Car',
          exits: [{ label: 'Sleeper', targetRoom: 'sleeper', x: 24, y: 180, width: 28, height: 92, spawnX: 706, spawnY: 232 }],
          spots: [
            { id: 'baggage-crates', label: 'supply crates', kind: 'box', x: 105, y: 250, width: 170, height: 95, difficulty: 3 },
            { id: 'baggage-coat-rack', label: 'coat rack', kind: 'curtain', x: 280, y: 95, width: 82, height: 160, difficulty: 3 },
            { id: 'baggage-ski-bag', label: 'ski bags', kind: 'luggage', x: 365, y: 105, width: 150, height: 88, difficulty: 4 },
            { id: 'baggage-door-shadow', label: 'door shadow', kind: 'closet', x: 600, y: 96, width: 98, height: 185, difficulty: 5 },
          ],
          obstacles: [{ id: 'baggage-stack', type: 'block', x: 305, y: 275, width: 105, height: 80 }],
        },
      },
    },
    campground: {
      id: 'campground',
      name: 'Campground',
      startRoom: 'picnic',
      palette: { wall: '#1d4939', floor: '#75b36a', trim: '#09233f', accent: '#f58220' },
      rooms: {
        picnic: {
          id: 'picnic',
          name: 'Picnic Loop',
          exits: [
            { label: 'Cabin', targetRoom: 'cabin', x: 748, y: 180, width: 28, height: 92, spawnX: 60, spawnY: 232 },
            { label: 'Trail', targetRoom: 'trail', x: 365, y: 24, width: 110, height: 28, spawnX: 400, spawnY: 358 },
          ],
          spots: [
            { id: 'picnic-table', label: 'picnic table', kind: 'bench', x: 280, y: 255, width: 180, height: 76, difficulty: 2 },
            { id: 'picnic-trail-sign', label: 'trail sign', kind: 'desk', x: 210, y: 105, width: 95, height: 78, difficulty: 3 },
            { id: 'picnic-cooler', label: 'cooler stack', kind: 'box', x: 88, y: 295, width: 112, height: 70, difficulty: 2 },
            { id: 'picnic-tall-grass', label: 'tall grass', kind: 'bush', x: 565, y: 260, width: 150, height: 90, difficulty: 4, searchText: { empty: 'The tall grass parts in the breeze. No hider.', found: 'The tall grass shakes, and the hider pops into view.' } },
          ],
          obstacles: [],
        },
        cabin: {
          id: 'cabin',
          name: 'Cabin',
          exits: [{ label: 'Picnic Loop', targetRoom: 'picnic', x: 24, y: 180, width: 28, height: 92, spawnX: 706, spawnY: 232 }],
          spots: [
            { id: 'cabin-blankets', label: 'blanket pile', kind: 'bed', x: 260, y: 288, width: 205, height: 68, difficulty: 3 },
            { id: 'cabin-window-curtain', label: 'cabin curtain', kind: 'curtain', x: 445, y: 95, width: 82, height: 158, difficulty: 3 },
            { id: 'cabin-woodbox', label: 'wood box', kind: 'box', x: 572, y: 292, width: 130, height: 72, difficulty: 3 },
            { id: 'cabin-pantry', label: 'pantry', kind: 'closet', x: 100, y: 92, width: 110, height: 188, difficulty: 5 },
          ],
          obstacles: [],
        },
        trail: {
          id: 'trail',
          name: 'Forest Trail',
          exits: [{ label: 'Picnic Loop', targetRoom: 'picnic', x: 365, y: 392, width: 110, height: 28, spawnX: 400, spawnY: 78 }],
          spots: [
            { id: 'trail-log', label: 'fallen log', kind: 'tree', x: 135, y: 250, width: 160, height: 80, difficulty: 3 },
            { id: 'trail-signpost', label: 'trail signpost', kind: 'desk', x: 235, y: 102, width: 85, height: 92, difficulty: 2 },
            { id: 'trail-rocks', label: 'rock cluster', kind: 'fountain', x: 360, y: 250, width: 130, height: 95, difficulty: 4 },
            { id: 'trail-pines', label: 'pine trees', kind: 'tree', x: 590, y: 110, width: 110, height: 220, difficulty: 5 },
          ],
          obstacles: [{ id: 'trail-mud', type: 'slow', x: 315, y: 335, width: 190, height: 34, speedMultiplier: 0.55 }],
        },
      },
    },
    'rest-stop': {
      id: 'rest-stop',
      name: 'Rest Stop',
      startRoom: 'plaza',
      palette: { wall: '#4b5563', floor: '#d7dce4', trim: '#09233f', accent: '#7b4ee6' },
      rooms: {
        plaza: {
          id: 'plaza',
          name: 'Main Plaza',
          exits: [
            { label: 'Arcade', targetRoom: 'arcade', x: 748, y: 180, width: 28, height: 92, spawnX: 60, spawnY: 232 },
            { label: 'Picnic Area', targetRoom: 'picnic_area', x: 24, y: 180, width: 28, height: 92, spawnX: 706, spawnY: 232 },
          ],
          spots: [
            { id: 'plaza-bench', label: 'bench', kind: 'bench', x: 285, y: 285, width: 180, height: 65, difficulty: 2 },
            { id: 'plaza-planter', label: 'indoor planter', kind: 'bush', x: 250, y: 108, width: 115, height: 72, difficulty: 3 },
            { id: 'plaza-vending', label: 'vending machines', kind: 'shelf', x: 580, y: 96, width: 125, height: 178, difficulty: 3, searchText: { empty: 'The vending machines hum. Nothing else moves.', found: 'A soft bump behind the vending machines gives it away.' } },
            { id: 'plaza-map-kiosk', label: 'map kiosk', kind: 'desk', x: 100, y: 100, width: 125, height: 105, difficulty: 4 },
          ],
          obstacles: [],
        },
        arcade: {
          id: 'arcade',
          name: 'Tiny Arcade',
          exits: [{ label: 'Main Plaza', targetRoom: 'plaza', x: 24, y: 180, width: 28, height: 92, spawnX: 706, spawnY: 232 }],
          spots: [
            { id: 'arcade-cabinet', label: 'game cabinet', kind: 'closet', x: 120, y: 95, width: 105, height: 190, difficulty: 4 },
            { id: 'arcade-token-counter', label: 'token counter', kind: 'desk', x: 365, y: 105, width: 120, height: 80, difficulty: 2 },
            { id: 'arcade-prize-bin', label: 'prize bin', kind: 'box', x: 320, y: 285, width: 160, height: 72, difficulty: 3 },
            { id: 'arcade-photo-booth', label: 'photo booth', kind: 'curtain', x: 580, y: 92, width: 110, height: 190, difficulty: 5 },
          ],
          obstacles: [],
        },
        picnic_area: {
          id: 'picnic_area',
          name: 'Picnic Area',
          exits: [{ label: 'Main Plaza', targetRoom: 'plaza', x: 748, y: 180, width: 28, height: 92, spawnX: 72, spawnY: 232 }],
          spots: [
            { id: 'picnic-trash-wall', label: 'recycling wall', kind: 'shelf', x: 95, y: 90, width: 145, height: 120, difficulty: 2 },
            { id: 'picnic-pavilion-bench', label: 'pavilion bench', kind: 'bench', x: 455, y: 285, width: 95, height: 62, difficulty: 2 },
            { id: 'picnic-shade-tree', label: 'shade tree', kind: 'tree', x: 345, y: 105, width: 105, height: 220, difficulty: 5 },
            { id: 'picnic-sign', label: 'information sign', kind: 'desk', x: 570, y: 245, width: 130, height: 95, difficulty: 3 },
          ],
          obstacles: [{ id: 'picnic-puddle', type: 'slow', x: 290, y: 350, width: 230, height: 30, speedMultiplier: 0.65 }],
        },
      },
    },
    'school-night': {
      id: 'school-night',
      name: 'School at Night',
      startRoom: 'hallway',
      palette: { wall: '#27324a', floor: '#7f8fa6', trim: '#061524', accent: '#ffd166' },
      rooms: {
        hallway: {
          id: 'hallway',
          name: 'Main Hall',
          exits: [
            { label: 'Library', targetRoom: 'library', x: 748, y: 180, width: 28, height: 92, spawnX: 60, spawnY: 232 },
            { label: 'Gym', targetRoom: 'gym', x: 365, y: 392, width: 110, height: 28, spawnX: 400, spawnY: 74 },
            { label: 'Cafeteria', targetRoom: 'cafeteria', x: 24, y: 180, width: 28, height: 92, spawnX: 708, spawnY: 232 },
          ],
          spots: [
            { id: 'hallway-lockers', label: 'locker bank', kind: 'locker', x: 108, y: 92, width: 145, height: 178, difficulty: 4, noisy: true, searchText: { empty: 'The locker doors click softly, but the bank is empty.', found: 'A locker door clanks. Found at the locker bank.' } },
            { id: 'hallway-trophy-case', label: 'trophy case', kind: 'shelf', x: 315, y: 98, width: 125, height: 130, difficulty: 3 },
            { id: 'hallway-cleaning-cart', label: 'cleaning cart', kind: 'luggage', x: 580, y: 278, width: 116, height: 76, difficulty: 2, noisy: true },
            { id: 'hallway-stage-curtain', label: 'stage curtain', kind: 'curtain', x: 518, y: 82, width: 86, height: 180, difficulty: 5 },
          ],
          obstacles: [{ id: 'hallway-wet-floor', type: 'slow', x: 280, y: 326, width: 230, height: 36, speedMultiplier: 0.55 }],
        },
        library: {
          id: 'library',
          name: 'Library',
          exits: [{ label: 'Main Hall', targetRoom: 'hallway', x: 24, y: 180, width: 28, height: 92, spawnX: 706, spawnY: 232 }],
          spots: [
            { id: 'library-bookcase-gap', label: 'bookcase gap', kind: 'shelf', x: 100, y: 92, width: 128, height: 185, difficulty: 5 },
            { id: 'library-reading-chair', label: 'reading chair', kind: 'bench', x: 300, y: 282, width: 138, height: 68, difficulty: 2 },
            { id: 'library-desk', label: 'checkout desk', kind: 'desk', x: 490, y: 238, width: 175, height: 78, difficulty: 3 },
            { id: 'library-curtain', label: 'quiet corner curtain', kind: 'curtain', x: 630, y: 92, width: 75, height: 160, difficulty: 4 },
          ],
          obstacles: [{ id: 'library-table', type: 'block', x: 265, y: 175, width: 210, height: 52 }],
        },
        gym: {
          id: 'gym',
          name: 'Gym',
          exits: [{ label: 'Main Hall', targetRoom: 'hallway', x: 365, y: 24, width: 110, height: 28, spawnX: 400, spawnY: 350 }],
          spots: [
            { id: 'gym-equipment-bin', label: 'equipment bin', kind: 'box', x: 105, y: 272, width: 145, height: 82, difficulty: 3, noisy: true },
            { id: 'gym-bleachers', label: 'folded bleachers', kind: 'bench', x: 300, y: 118, width: 210, height: 72, difficulty: 4 },
            { id: 'gym-score-table', label: 'score table', kind: 'desk', x: 332, y: 278, width: 150, height: 66, difficulty: 2 },
            { id: 'gym-mat-stack', label: 'mat stack', kind: 'box', x: 592, y: 260, width: 118, height: 92, difficulty: 4 },
          ],
          obstacles: [{ id: 'gym-center-court', type: 'slow', x: 265, y: 210, width: 275, height: 42, speedMultiplier: 0.72 }],
        },
        cafeteria: {
          id: 'cafeteria',
          name: 'Cafeteria',
          exits: [{ label: 'Main Hall', targetRoom: 'hallway', x: 748, y: 180, width: 28, height: 92, spawnX: 72, spawnY: 232 }],
          spots: [
            { id: 'cafeteria-serving-line', label: 'serving line', kind: 'shelf', x: 108, y: 92, width: 150, height: 145, difficulty: 3 },
            { id: 'cafeteria-table-row', label: 'table row', kind: 'bench', x: 322, y: 282, width: 182, height: 66, difficulty: 2 },
            { id: 'cafeteria-trash-cans', label: 'trash cans', kind: 'box', x: 600, y: 278, width: 112, height: 76, difficulty: 3, noisy: true },
            { id: 'cafeteria-freezer-door', label: 'freezer door', kind: 'closet', x: 610, y: 90, width: 98, height: 174, difficulty: 5 },
          ],
          obstacles: [{ id: 'cafeteria-spill', type: 'slow', x: 260, y: 350, width: 230, height: 30, speedMultiplier: 0.6 }],
        },
      },
    },
  };
})();

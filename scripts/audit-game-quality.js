const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'script.js');
const script = fs.readFileSync(scriptPath, 'utf8');
const errors = [];
const warnings = [];

global.window = {};
require(path.join(root, 'js/data/questions.js'));
require(path.join(root, 'js/data/scavenger.js'));
require(path.join(root, 'js/data/trivia.js'));
require(path.join(root, 'js/data/community-trivia.js'));
require(path.join(root, 'js/games/hide-seek-data.js'));

const baseTriviaMatch = script.match(/const triviaBaseQuestions = \[([\s\S]*?)\n  \];/);
const basePromptsMatch = script.match(/const questions = \[([\s\S]*?)\n  \];/);

let baseTrivia = [];
let basePrompts = [];
if (baseTriviaMatch) eval(`baseTrivia = [${baseTriviaMatch[1]}\n];`);
if (basePromptsMatch) eval(`basePrompts = [${basePromptsMatch[1]}\n];`);

const allTrivia = baseTrivia.concat(window.RTA_TRIVIA_QUESTIONS || []);
const allPrompts = basePrompts.concat(window.RTA_ADVENTURE_PROMPTS || []);
const allScavenger = window.RTA_SCAVENGER_ITEMS || [];
const hideSeekMaps = window.RTA_HIDE_SEEK_MAPS || {};
const triviaCategories = new Set([
  'mixed',
  'states',
  'capitals',
  'nicknames',
  'plates',
  'geography',
  'math',
  'science',
  'biology',
  'facts',
  'food',
  'music',
  'nba',
  'nfl',
  'soccer',
  'baseball',
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
  ...(window.RTA_TRIVIA_CATEGORIES || []).map(category => category.id),
]);
const learnTopics = new Set((window.RTA_LEARN_TOPICS || []).map(topic => topic.id));

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y;
}

function spotCollisionRect(spot) {
  const insets = {
    bed: { x: 6, y: 16, width: -12, height: -18 },
    bench: { x: 8, y: 18, width: -16, height: -24 },
    bush: { x: 10, y: 20, width: -20, height: -26 },
    car: { x: 16, y: 20, width: -32, height: -24 },
    couch: { x: 8, y: 14, width: -16, height: -18 },
    curtain: { x: 8, y: 12, width: -16, height: -18 },
    fountain: { x: 12, y: 14, width: -24, height: -22 },
    tree: { x: 12, y: 24, width: -24, height: -28 },
  }[spot.kind] || { x: 6, y: 8, width: -12, height: -12 };
  return {
    x: spot.x + insets.x,
    y: spot.y + insets.y,
    width: Math.max(18, spot.width + insets.width),
    height: Math.max(18, spot.height + insets.height),
  };
}

function checkTrivia() {
  const seenIds = new Set();
  allTrivia.forEach((item, index) => {
    const label = item.id || `${item.category || 'unknown'}-${index}`;
    if (item.id) {
      if (seenIds.has(item.id)) errors.push(`trivia ${item.id}: duplicate id`);
      seenIds.add(item.id);
    }
    if (!item.category) errors.push(`trivia ${label}: missing category`);
    if (item.category && !triviaCategories.has(item.category)) {
      warnings.push(`trivia ${label}: category "${item.category}" is not listed in trivia categories`);
    }
    if (!item.question) errors.push(`trivia ${label}: missing question`);
    if (!item.answer) errors.push(`trivia ${label}: missing answer`);
    if (!Array.isArray(item.choices) || item.choices.length < 2) {
      warnings.push(`trivia ${label}: no fixed choices, runtime will generate distractors`);
      return;
    }
    if (!item.choices.includes(item.answer)) errors.push(`trivia ${label}: answer is not in choices`);
    if (new Set(item.choices.map(normalizeText)).size !== item.choices.length) {
      errors.push(`trivia ${label}: duplicate or nearly duplicate choices`);
    }
    item.choices.forEach(choice => {
      if (String(choice || '').length > 84) warnings.push(`trivia ${label}: long choice "${choice}" may be hard to scan`);
    });
  });
}

function checkPrompts() {
  const promptIds = new Set();
  allPrompts.forEach((prompt, index) => {
    const label = prompt.id || `prompt-${index}`;
    if (prompt.id) {
      if (promptIds.has(prompt.id)) errors.push(`prompt ${prompt.id}: duplicate id`);
      promptIds.add(prompt.id);
    }
    if (!prompt.text) errors.push(`prompt ${label}: missing text`);
    if (prompt.category === 'learn' && !prompt.learnTopic) warnings.push(`prompt ${label}: learn prompt missing learnTopic`);
    if (prompt.learnTopic && learnTopics.size && !learnTopics.has(prompt.learnTopic)) {
      warnings.push(`prompt ${label}: learnTopic "${prompt.learnTopic}" is not listed in learn topics`);
    }
    if (/silent count|memorize the view|window snapshot|quietly looks? outside|closest count/i.test(prompt.text || '')) {
      warnings.push(`prompt ${label}: prompt may not be verifiable or fun in a moving car`);
    }
    if ((prompt.text || '').length > 190) warnings.push(`prompt ${label}: prompt is long for mobile`);
  });
}

function checkScavenger() {
  const ids = new Set();
  allScavenger.forEach(item => {
    if (!item.id) errors.push('scavenger: missing id');
    if (ids.has(item.id)) errors.push(`scavenger ${item.id}: duplicate id`);
    ids.add(item.id);
    if (!item.label || !item.hint) errors.push(`scavenger ${item.id}: missing label or hint`);
    if ((item.label || '').length > 44) warnings.push(`scavenger ${item.id}: label is long for cards`);
    if ((item.hint || '').length > 120) warnings.push(`scavenger ${item.id}: hint is long for cards`);
    if (/closest count|silent count/i.test(`${item.label} ${item.hint}`)) {
      errors.push(`scavenger ${item.id}: unverifiable counting game`);
    }
  });
}

function checkHideSeekMaps() {
  Object.values(hideSeekMaps).forEach(map => {
    if (!map.startRoom || !map.rooms || !map.rooms[map.startRoom]) {
      errors.push(`hideSeek ${map.id}: missing valid startRoom`);
      return;
    }
    Object.values(map.rooms).forEach(room => {
      if (!Array.isArray(room.exits) || !room.exits.length) warnings.push(`hideSeek ${map.id}/${room.id}: room has no exits`);
      if (!Array.isArray(room.spots) || room.spots.length < 3) warnings.push(`hideSeek ${map.id}/${room.id}: fewer than 3 hiding spots`);

      room.exits.forEach(exit => {
        if (!map.rooms[exit.targetRoom]) errors.push(`hideSeek ${map.id}/${room.id}: exit targets missing room ${exit.targetRoom}`);
        const spawn = { x: exit.spawnX + 4, y: exit.spawnY + 12, width: 16, height: 20 };
        const blockedBy = room.spots
          .filter(spot => spot.solid !== false)
          .find(spot => rectsOverlap(spawn, spotCollisionRect(spot)));
        if (blockedBy) warnings.push(`hideSeek ${map.id}/${room.id}: exit spawn overlaps ${blockedBy.id}`);
      });

      room.spots.forEach(spot => {
        if (spot.x < 38 || spot.y < 62 || spot.x + spot.width > 762 || spot.y + spot.height > 400) {
          warnings.push(`hideSeek ${map.id}/${room.id}/${spot.id}: spot touches or leaves playable floor`);
        }
        if (spot.width < 64 || spot.height < 48) {
          warnings.push(`hideSeek ${map.id}/${room.id}/${spot.id}: hiding spot may render too small`);
        }
        if (spot.width > 230 || spot.height > 230) {
          warnings.push(`hideSeek ${map.id}/${room.id}/${spot.id}: hiding spot may dominate the room`);
        }
      });
    });
  });
}

checkTrivia();
checkPrompts();
checkScavenger();
checkHideSeekMaps();

const loudWarnings = warnings.slice(0, 30);
if (loudWarnings.length) console.warn(loudWarnings.join('\n'));
if (warnings.length > loudWarnings.length) console.warn(`...${warnings.length - loudWarnings.length} more warnings`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  triviaQuestions: allTrivia.length,
  adventurePrompts: allPrompts.length,
  scavengerItems: allScavenger.length,
  hideSeekMaps: Object.keys(hideSeekMaps).length,
  warnings: warnings.length,
  errors: 0,
}, null, 2));

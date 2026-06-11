const path = require('path');

const root = path.resolve(__dirname, '..');
global.window = {};

require(path.join(root, 'js/data/questions.js'));
require(path.join(root, 'js/data/scavenger.js'));

const errors = [];
const warnings = [];

function findDuplicates(items, getKey) {
  const counts = new Map();
  items.forEach(item => {
    const key = getKey(item);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
}

function checkLength(label, value, maxLength) {
  if (String(value || '').length > maxLength) {
    warnings.push(`${label} is longer than ${maxLength} characters.`);
  }
}

const scavengerItems = window.RTA_SCAVENGER_ITEMS || [];
const scavengerDuplicateIds = findDuplicates(scavengerItems, item => item.id);
scavengerDuplicateIds.forEach(id => errors.push(`scavenger: duplicate id "${id}"`));

scavengerItems.forEach(item => {
  if (!item.id) errors.push('scavenger: missing id');
  if (!item.emoji) errors.push(`scavenger ${item.id}: missing emoji`);
  if (!item.label) errors.push(`scavenger ${item.id}: missing label`);
  if (!item.hint) errors.push(`scavenger ${item.id}: missing hint`);
  checkLength(`scavenger ${item.id} label`, item.label, 42);
  checkLength(`scavenger ${item.id} hint`, item.hint, 110);
});

const adventurePrompts = window.RTA_ADVENTURE_PROMPTS || [];
const adventureDuplicateIds = findDuplicates(adventurePrompts, prompt => prompt.id);
adventureDuplicateIds.forEach(id => errors.push(`adventure: duplicate id "${id}"`));

const learningPrompts = adventurePrompts.filter(prompt => prompt.category === 'learn');
learningPrompts.forEach(prompt => {
  if (!prompt.id) errors.push('learn: missing id');
  if (!prompt.learnTopic) errors.push(`learn ${prompt.id}: missing learnTopic`);
  if (!prompt.text) errors.push(`learn ${prompt.id}: missing text`);
  checkLength(`learn ${prompt.id} text`, prompt.text, 180);
});

if (warnings.length) {
  console.warn(warnings.join('\n'));
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  scavengerItems: scavengerItems.length,
  learningPrompts: learningPrompts.length,
  duplicateIds: 0,
  missingRequiredFields: 0,
  warnings: warnings.length,
}, null, 2));

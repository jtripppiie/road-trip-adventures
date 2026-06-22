#!/usr/bin/env node
/*
 * Audits trivia content for duplicates, stale wording, missing difficulty,
 * and common quality issues. Run with:
 *
 *   node scripts/audit-trivia-content.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const dataFiles = [
  'js/data/trivia.js',
  'js/data/community-trivia.js',
  'js/data/oak-island.js',
];

const sandbox = {
  window: {
    RTA_TRIVIA_CATEGORIES: [],
    RTA_TRIVIA_QUESTIONS: [],
  },
  console,
};

for (const file of dataFiles) {
  const fullPath = path.join(root, file);
  vm.runInNewContext(fs.readFileSync(fullPath, 'utf8'), sandbox, { filename: file });
}

const categories = sandbox.window.RTA_TRIVIA_CATEGORIES || [];
const questions = sandbox.window.RTA_TRIVIA_QUESTIONS || [];

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function guessDifficulty(question) {
  const text = normalize(`${question.question} ${question.answer}`);
  if (/which state|what state|located in which|home to/.test(text)) return 'easy';
  if (/largest|smallest|first|tallest|deepest|highest|record|official|created|invented/.test(text)) return 'medium';
  if (/approximately|year|century|eruption|inaccessible|westernmost|combined|specific/.test(text)) return 'hard';
  return 'medium';
}

const exactSeen = new Map();
const looseSeen = new Map();
const duplicates = [];
const nearDuplicates = [];
const stale = [];
const weak = [];
const missingDifficulty = [];
const invalidChoices = [];
const countsByCategory = new Map();
const countsByDifficulty = new Map();

for (const item of questions) {
  const category = item.category || 'uncategorized';
  countsByCategory.set(category, (countsByCategory.get(category) || 0) + 1);

  const difficulty = item.difficulty || guessDifficulty(item);
  countsByDifficulty.set(difficulty, (countsByDifficulty.get(difficulty) || 0) + 1);

  if (!item.difficulty) {
    missingDifficulty.push({ id: item.id, category, guessed: difficulty, question: item.question });
  }

  const exactKey = normalize(item.question);
  const looseKey = [category, normalize(item.question), normalize(item.answer)].join('::');

  if (exactSeen.has(exactKey)) {
    duplicates.push({ current: item.id, previous: exactSeen.get(exactKey), question: item.question });
  } else {
    exactSeen.set(exactKey, item.id);
  }

  if (looseSeen.has(looseKey)) {
    nearDuplicates.push({ current: item.id, previous: looseSeen.get(looseKey), question: item.question, answer: item.answer });
  } else {
    looseSeen.set(looseKey, item.id);
  }

  if (/\b(20\d{2}|recent years|currently|as of)\b/i.test(item.question || '')) {
    stale.push({ id: item.id, category, question: item.question, answer: item.answer });
  }

  if (/which state|located in which state|home to/i.test(item.question || '')) {
    weak.push({ id: item.id, category, question: item.question });
  }

  if (Array.isArray(item.choices)) {
    const answer = normalize(item.answer);
    const choices = item.choices.map(normalize);
    if (!choices.includes(answer)) {
      invalidChoices.push({ id: item.id, category, question: item.question, answer: item.answer, choices: item.choices });
    }
  }
}

const report = {
  summary: {
    categories: categories.length,
    questions: questions.length,
    duplicateQuestionCount: duplicates.length,
    nearDuplicateCount: nearDuplicates.length,
    staleQuestionCount: stale.length,
    weakQuestionCount: weak.length,
    missingDifficultyCount: missingDifficulty.length,
    invalidChoiceCount: invalidChoices.length,
  },
  countsByCategory: Object.fromEntries([...countsByCategory.entries()].sort()),
  countsByDifficulty: Object.fromEntries([...countsByDifficulty.entries()].sort()),
  duplicates,
  nearDuplicates,
  stale,
  weak,
  missingDifficulty,
  invalidChoices,
};

const outDir = path.join(root, 'reports');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'trivia-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log('Trivia audit complete.');
console.log(JSON.stringify(report.summary, null, 2));
console.log('Wrote reports/trivia-audit.json');

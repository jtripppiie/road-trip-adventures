const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'script.js');
const script = fs.readFileSync(scriptPath, 'utf8');
const baseMatch = script.match(/const triviaBaseQuestions = \[([\s\S]*?)\n  \];/);

if (!baseMatch) {
  console.error('Could not find triviaBaseQuestions in script.js.');
  process.exit(1);
}

let triviaBaseQuestions = [];
eval(`triviaBaseQuestions = [${baseMatch[1]}\n];`);

global.window = {};
require(path.join(root, 'js/data/trivia.js'));
require(path.join(root, 'js/data/community-trivia.js'));

const externalQuestions = window.RTA_TRIVIA_QUESTIONS || [];
const errors = [];

function checkQuestion(question, source) {
  if (!question.id && source !== 'base') errors.push(`${source}: missing id for "${question.question}"`);
  if (!question.category) errors.push(`${source}: missing category for "${question.question}"`);
  if (!question.question) errors.push(`${source}: missing question text`);
  if (!question.answer) errors.push(`${source}: missing answer for "${question.question}"`);
  if (!Array.isArray(question.choices) || question.choices.length < 2) {
    errors.push(`${source}: missing choices for "${question.question}"`);
    return;
  }
  if (!question.choices.includes(question.answer)) {
    errors.push(`${source}: answer not in choices for "${question.question}"`);
  }
  if (new Set(question.choices).size !== question.choices.length) {
    errors.push(`${source}: duplicate choices for "${question.question}"`);
  }
}

triviaBaseQuestions.forEach(question => checkQuestion(question, 'base'));
externalQuestions.forEach(question => checkQuestion(question, 'external'));

const externalIds = externalQuestions.map(question => question.id).filter(Boolean);
const duplicateExternalIds = [...new Set(externalIds.filter((id, index) => externalIds.indexOf(id) !== index))];
duplicateExternalIds.forEach(id => errors.push(`external: duplicate id "${id}"`));

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  baseQuestions: triviaBaseQuestions.length,
  externalQuestions: externalQuestions.length,
  duplicateExternalIds: duplicateExternalIds.length,
  errors: 0,
}, null, 2));

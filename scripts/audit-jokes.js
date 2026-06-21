const path = require('path');

const root = path.resolve(__dirname, '..');
global.window = {};

require(path.join(root, 'js/data/jokes.js'));

const errors = [];
const expected = ['RTA_DAD_JOKES', 'RTA_MOM_JOKES', 'RTA_BROTHER_JOKES', 'RTA_SISTER_JOKES'];
const counts = {};

expected.forEach(name => {
  const list = global.window[name];
  if (!Array.isArray(list)) {
    errors.push(`${name} is missing or not an array.`);
    return;
  }
  if (!list.length) {
    errors.push(`${name} is empty.`);
  }
  list.forEach((joke, index) => {
    if (typeof joke !== 'string' || !joke.trim()) {
      errors.push(`${name}[${index}] is not a non-empty string.`);
    }
  });
  counts[name] = list.length;
});

console.log(JSON.stringify({ ...counts, errors: errors.length }, null, 2));

if (errors.length) {
  errors.slice(0, 20).forEach(message => console.error(`ERROR: ${message}`));
  process.exit(1);
}

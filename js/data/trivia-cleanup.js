/* Runtime cleanup for loaded trivia packs. */
(function () {
  const questions = window.RTA_TRIVIA_QUESTIONS || [];
  const seenExactQuestions = new Set();
  const seenLooseQuestions = new Set();

  function normalizeExact(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function normalizeLoose(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  window.RTA_TRIVIA_QUESTIONS = questions.filter((item) => {
    if (!item || !item.question) {
      return false;
    }

    if (normalizeExact(item.question) === 'how many u.s. national parks are there as of 2026?') {
      item.question = 'How many U.S. national parks are there currently?';
    }

    const exactKey = normalizeExact(item.question);
    const looseKey = [item.category || 'general', normalizeLoose(item.question), normalizeLoose(item.answer)].join('::');

    if (seenExactQuestions.has(exactKey) || seenLooseQuestions.has(looseKey)) {
      return false;
    }

    seenExactQuestions.add(exactKey);
    seenLooseQuestions.add(looseKey);
    return true;
  });
})();

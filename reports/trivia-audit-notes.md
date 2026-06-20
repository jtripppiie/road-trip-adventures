# Trivia audit notes

This PR adds a safe trivia cleanup layer and an audit script.

## What changed

- Added `js/data/trivia-cleanup.js`.
- Added `scripts/audit-trivia-content.js`.

## What the cleanup file does

The cleanup file:

- removes exact duplicate trivia questions
- removes repeated question/answer pairs inside the same category
- updates stale wording for the National Parks count question

## Required include before merging

Add the cleanup file after the two trivia data packs and before the main app script:

```html
<script src="js/data/trivia.js"></script>
<script src="js/data/community-trivia.js"></script>
<script src="js/data/trivia-cleanup.js"></script>
<script src="js/data/scavenger.js"></script>
```

## How to run the audit locally

```bash
node scripts/audit-trivia-content.js
```

The script writes:

```text
reports/trivia-audit.json
```

## What the audit checks

- duplicate questions
- near duplicate question/answer pairs
- stale wording like dates, “recent years,” and “as of” language
- repetitive weak questions such as many “which state” prompts
- missing difficulty values
- answer/choice mismatches
- category counts
- guessed difficulty distribution

## Recommended next cleanup pass

After running the audit, clean up the report in this order:

1. Fix answer/choice mismatches first.
2. Remove exact duplicates.
3. Rewrite stale date-based questions.
4. Rewrite weak/repetitive questions.
5. Add explicit `difficulty` values to questions.
6. Re-run the audit until the major issue counts are low.

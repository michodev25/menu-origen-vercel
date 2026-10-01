<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Menu content and languages

- Keep Spanish menu copy correctly spelled, accented, and grammatically clear.
- Whenever adding or changing a category, subcategory, dish name, description, ingredient text, or public UI label, update the matching translations in `app/menu-translations.ts` for English (`EN`), Russian (`RU`), and Simplified Chinese (`ZH`). Spanish (`ES`) uses the original text.
- Translation keys must exactly match the current Spanish text. Check that every public menu text has a translation in all three dictionaries.
- Preserve intentional dish names and brand names; clarify ambiguous names rather than guessing a replacement.
- Keep existing IDs stable when correcting display text, and preserve prices and visibility unless the user requests changes.

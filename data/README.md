# Data source

All replaceable/demo content lives in JSON files in this directory:

- `library.json`: works, classifications, and PDF metadata.
- `listening.json`: listening series and sessions.
- `dissertations.json`: dissertations and academic metadata.
- `fatwas.json`: fatwa categories, answers, references, and submission stages.
- `site-content.json`: announcements, content cards, filters, and navigation.

TypeScript files under `lib/` only define types, derived values, and lookup helpers.
New replaceable content should be added to JSON rather than embedded in React
components. This keeps the component contract stable when JSON is replaced by an
API or CMS response later.

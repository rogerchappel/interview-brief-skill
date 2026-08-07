# API

Import the package from Node ESM:

```js
import { createBrief } from 'interview-brief-skill';
```

Primary functions:

- `createBrief(path), renderMarkdown(brief)`

`createBrief(path)` accepts a readable regular Markdown or JSON file. A JSON
file must contain a top-level object with any of `role` (or `job`), `company`,
`candidate` (or `notes`), and `meeting`; missing fields normalize to empty
strings. Direct API calls throw an `InputError` for a missing or unreadable
file, a non-file path, malformed JSON, or a JSON top level that is `null`, an
array, or a primitive. The CLI converts these expected errors into concise
stderr diagnostics with usage guidance and a nonzero exit code, without a Node
stack trace.

`createBrief` uses exact, case-insensitive keyword overlap between the
role/company text and candidate notes. Generic evidence words such as
`experience`, `skills`, and `background` are excluded: they cannot create a
role-connected talking point or suppress the no-overlap risk. This heuristic
does not infer synonyms or semantic similarity.

The API is deterministic and reads local files only. Callers own review and any external sharing of generated output.

# API

Import the package from Node ESM:

```js
import { createBrief } from 'interview-brief-skill';
```

Primary functions:

- `createBrief(path), renderMarkdown(brief)`

`createBrief` uses exact, case-insensitive keyword overlap between the
role/company text and candidate notes. Generic evidence words such as
`experience`, `skills`, and `background` are excluded: they cannot create a
role-connected talking point or suppress the no-overlap risk. This heuristic
does not infer synonyms or semantic similarity.

The API is deterministic and reads local files only. Callers own review and any external sharing of generated output.

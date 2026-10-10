# Queen's Corn Wiki — Schema & Rules for AI Agents

This folder is an **LLM-maintained knowledge base** (Andrej Karpathy's "LLM Wiki" pattern) for
The Queen's Corn business and its website. Humans add sources and ask questions; the AI agent
writes and maintains the pages. Three people share this wiki through Git, each with their own agent.

Read this whole file before doing any wiki operation.

## Layout

```
wiki/
├── CLAUDE.md        ← this file: the schema (rules for the agent)
├── AGENTS.md        ← pointer for non-Claude agents (Codex, Cursor…)
├── README.md        ← how humans use the wiki
├── index.md         ← catalog of every page, one line each — read this FIRST when answering
├── log.md           ← append-only history of every wiki operation
├── open-questions.md← unresolved issues, contradictions, things to verify with the owners
├── raw/             ← SOURCES. Immutable. Humans drop files here; agents never edit them
│   ├── notes/       ← quick notes, ideas, phone notes
│   ├── meetings/    ← meeting notes / call summaries
│   └── documents/   ← PDFs, price lists, supplier docs, screenshots, exports
├── business/        ← the company, people, programs, operations
├── products/        ← flavors, sizes, pricing, ingredients
├── website/         ← how the website is built and works
├── decisions/       ← why we chose X (one page per decision)
└── templates/       ← page templates to copy when creating pages
```

## Sources of truth

1. **Website facts** → the code in this repo is the source of truth. Cite as
   `` `src/path/file.ts` @ <short-commit-hash> `` (get the hash with `git rev-parse --short HEAD`).
2. **Business facts** (prices actually charged, suppliers, recipes, people, events) → files in `raw/`.
   Cite as `[[raw/notes/2026-10-10-example.md]]` or the plain relative path.
3. If code and a raw source disagree (e.g. website shows a price the owners say is wrong),
   **do not silently pick one**: record both with sources and add an entry to `open-questions.md`.

## Page conventions

- One topic per page. Filenames are `kebab-case.md` and **unique across the whole wiki**
  (Obsidian resolves `[[links]]` by filename).
- Every page starts with frontmatter:

  ```yaml
  ---
  title: Product Catalog
  type: business | product | website | decision | overview
  owner: <person responsible for reviewing this area, or "unassigned">
  updated: 2026-10-10
  sources:
    - src/data/products.ts @ fbdbf0b
    - raw/notes/2026-10-10-price-change.md
  ---
  ```

- Link related pages with `[[page-name]]` wikilinks. Link liberally; every page should link to at
  least one other page and be listed in `index.md`.
- Put the source next to any important fact, inline: `$6.00 small bag (src/data/products.ts @ fbdbf0b)`.
- Mark anything uncertain with a callout:
  `> [!warning] Unverified — <what needs checking>` and add it to `open-questions.md`.
- Write plainly and briefly. Bullet points and tables over long prose.
- Use the templates in `templates/` when creating a new page.

## Hard rules

- **Never modify files in `raw/`.** They are the evidence. (Renaming a new, badly named drop to the
  `YYYY-MM-DD-short-slug.ext` convention during ingest is the only exception.)
- **Never write secrets** (passwords, API tokens, session secrets, customer personal data) into the
  wiki. Say "hardcoded default credentials exist in `src/lib/auth.ts`" — never the value itself.
- Never delete a page without moving its useful content elsewhere and noting it in `log.md`.
- Wiki operations only touch files under `wiki/` (plus the pointer lines in the root `CLAUDE.md`/`AGENTS.md`).
  Do not change website code as part of a wiki operation.

## Operations

### 1. Ingest — "ingest raw/…" or "add this to the wiki"
1. `git pull` first (team rule).
2. Read the source fully. If it was pasted in chat, first save it to `raw/` as
   `raw/<notes|meetings|documents>/YYYY-MM-DD-short-slug.md`.
3. Read `index.md`, then every page the source affects.
4. Update those pages (a single source often touches 3–10 pages). Create new pages only when a topic
   has no home. Add/adjust `sources:` and `updated:` in frontmatter.
5. Check for contradictions with existing content → resolve with sources or add to `open-questions.md`.
6. Update `index.md` for any new/renamed page.
7. Append to `log.md` (format below).
8. Show the human a short summary of what changed, then they commit & push.

### 2. Sync — "sync the wiki with the code"
Keeps `website/` pages in step with the codebase.
1. Find the last synced commit in `log.md` (entries of type `sync` record `@ <hash>`).
2. `git log --oneline <last-hash>..HEAD` and `git diff --stat <last-hash>..HEAD`; read changed files that matter.
3. Update affected `website/`, `products/`, `business/` pages; resolve items in `open-questions.md` that the code now answers.
4. Append a `sync` entry to `log.md` with the new HEAD hash.

### 3. Query — any question about the business or website
1. Read `index.md`, then the relevant pages. Read raw sources or code only if the pages are not enough.
2. Answer with links to the pages/sources used.
3. If the answer was valuable and not already written down, **file it back** as a new or updated page
   (ask the human first if unsure) and log it.

### 4. Lint — "lint the wiki" (run monthly)
Report, then fix with the human's OK:
- contradictions between pages; claims that newer sources or code have superseded
- pages not in `index.md`; orphan pages with no inbound links; broken `[[links]]`
- pages missing frontmatter or sources; stale `updated:` dates on fast-moving topics
- `open-questions.md` items that can now be answered
- topics mentioned on several pages that deserve their own page
Log a `lint` entry.

## log.md format

Append to the **top** of the entries list (newest first). One entry per operation:

```
## 2026-10-10 | ingest | Manula
- Source: raw/meetings/2026-10-10-pricing-call.md
- Updated: [[product-catalog]], [[fundraising-program]]
- Created: [[supplier-list]]
- Open questions added: 1
```

Types: `init`, `ingest`, `sync`, `query`, `lint`, `restructure`. For `sync`, include `@ <hash>`.
Use the human's name (from `git config user.name` if not told).

## Team workflow (three people, one wiki)

- **Pull before every session, push right after.** Keep sessions short to avoid conflicts.
- Merge conflicts in `index.md` / `log.md`: keep **both** sides' lines, re-sort `log.md` newest first.
- Area owners (set in each page's `owner:`) review changes to their pages. Large restructures go
  through a pull request.
- Wiki-only changes can be committed with a `docs(wiki): …` message.

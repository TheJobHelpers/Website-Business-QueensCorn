# The Queen's Corn Wiki — How to use it

Our shared knowledge base for the business and the website. An AI agent (Claude Code, Codex, Cursor…)
writes and maintains the pages; **we add sources and ask questions.** Based on Andrej Karpathy's
"LLM Wiki" idea.

Start reading at **[index.md](index.md)**.

## Daily workflow

1. **Pull** the latest changes (GitHub Desktop → *Fetch / Pull*, or `git pull`).
2. **Add knowledge**: drop a file into `raw/`, or just paste/tell it to the agent:
   - `raw/notes/` — quick notes and ideas
   - `raw/meetings/` — meeting or call notes
   - `raw/documents/` — PDFs, price lists, supplier docs, screenshots
   Name files `YYYY-MM-DD-short-description.md` (the agent will rename if you forget).
3. **Ask the agent** (opened in the repo folder). Useful prompts:
   - `Ingest raw/meetings/2026-10-12-supplier-call.md into the wiki`
   - `Add this to the wiki: we raised the large bag price to $16 starting Nov 1`
   - `Sync the wiki with the latest code`
   - `Using the wiki, what do we promise fundraising groups?`
   - `Lint the wiki` (once a month)
4. **Check** what the agent changed (GitHub Desktop shows the diff). Fix anything wrong.
5. **Commit & push** right away so the other two get it.

## Rules

- Never edit files in `raw/` after adding them; they're our evidence.
- **No passwords, API keys, or customer personal info** in the wiki. It lives in the GitHub repo.
- Live numbers (stock, daily sales, orders) belong in Shopify or spreadsheets, not here. The wiki
  explains and links to them.
- Unsure about something? It goes in [open-questions.md](open-questions.md).

## Reading it nicely

Open the `wiki/` folder as a vault in **[Obsidian](https://obsidian.md)** (free) to get clickable
`[[links]]`, backlinks, and a graph view. GitHub's website also renders the pages fine.

# Blog Page for CV Site - Design

Date: 2026-09-02
Status: Approved

## Purpose

Add a Blog section to Ahmad's personal CV/portfolio site (`cv` repo), sourced from technical/professional content already curated in his `llm-wiki` knowledge base. Also add a Claude Code skill (`cv-blog-post`) that drafts new posts from wiki pages on request.

## Context

- `cv` is a React 19 + TypeScript + Vite + Tailwind v4 SPA. It has no router today - `App.tsx` renders four sections (About, Resume, Projects, Contact) as `.tab-item` divs, toggled by manually adding/removing the `hidden` class via a `handleTabClick` DOM query (see `src/App.tsx`).
- Deployed as a static site to GitHub Pages under a project path (`/personal-website`), no server-side rendering, no existing CI/deploy workflow file in-repo, no SPA-fallback `404.html`.
- `llm-wiki` is a separate Bahasa Indonesia knowledge wiki (`/Users/ahmadalfasakan/Documents/llm-wiki`), organized into `wiki/{goals,reflections,concepts,health,sources}`, cataloged in `index.md`. It already has two sibling content-generation skills (`tumbuh-blog-post`, `ujiaku-blog-post`) that live in `llm-wiki/.claude/skills/` but write into a *different* working directory (`dream-fe`). This design follows the same pattern: a skill in `llm-wiki` writing into `cv`.

## Decisions (from brainstorming)

1. **Routing:** blog gets real per-post URLs via `react-router-dom`, using `HashRouter` (not `BrowserRouter`) - avoids needing a `404.html` SPA-fallback trick on GitHub Pages, since the project has no deploy workflow to modify. Post links are shareable as `.../#/blog/<slug>`.
2. **Content storage:** Markdown files with frontmatter, one file per post, at `src/content/blog/<slug>.md`. Loaded client-side via `import.meta.glob`, no build-time content pipeline.
3. **Language:** posts are written in **English**, consistent with the rest of the CV (About/Resume/Projects are all English, wiki is Bahasa Indonesia - posts are a translated + rewritten adaptation, not a literal translation).
4. **Content scope:** only technical/professional wiki content (the `Concepts` category in `llm-wiki/index.md` - e.g. AI engineering, Rust/game dev, ML systems, negotiation/freelancing frameworks). Personal `Goals`/`Reflections` pages are out of scope for blog posts.
5. **Skill workflow:** the skill can *propose* topics (scan `llm-wiki/index.md` Concepts) when Ahmad doesn't name one, in addition to drafting from an explicit page/topic he gives it. Draft is shown in chat for review before the file is written.

## Components

### 1. Routing shell

- `src/main.tsx`: wrap `<App />` in `<HashRouter>`.
- New `src/router.tsx` (or inline in `main.tsx` if small) defining two routes:
  - `/` → existing `App` (tabs), unchanged behavior except a 5th tab "Blog" added to the `toolbars` array in `App.tsx`, rendering a new `<Blog />` tab-item component alongside `<About />`, `<Resume />`, etc.
  - `/blog/:slug` → new `<BlogPost />` page, rendered outside the tab shell (its own top-level layout, not nested inside the sidebar+tabs container) so long-form reading has full width, but reusing the same color tokens (`bg-black`, `bg-eerie-black-2`, `border-jet`, `text-orange-yellow-crayola`) and `cn` utility for visual consistency with the rest of the site.

### 2. Content loading

- New `src/content/blog/` directory holding `<slug>.md` files.
- New `src/utils/blog.ts`:
  - Uses `import.meta.glob('/src/content/blog/*.md', { query: '?raw', import: 'default', eager: true })` to load raw markdown strings at build time (no runtime fetch).
  - Parses each with `gray-matter` into `{ data: frontmatter, content: markdownBody }`.
  - Exports `getAllPosts(): BlogPostMeta[]` (sorted by `date` descending) and `getPostBySlug(slug): BlogPost | undefined`.
- Frontmatter shape:
  ```ts
  type BlogPostMeta = {
    slug: string;
    title: string;
    date: string; // ISO 'YYYY-MM-DD', quoted in the markdown source
    excerpt: string;
    tags: string[];
    sourceWikiPage: string; // internal provenance, not rendered in UI
  };
  ```

### 3. UI components

- `src/Blog.tsx` (tab-item, mirrors `Projects.tsx` structure): grid/list of post cards (title, date, excerpt, tags), each linking via `<Link to={`/blog/${slug}`}>` from `react-router-dom`.
- `src/BlogPost.tsx`: full-width article page - title, date, tags, then markdown body rendered via `react-markdown`, plus a back-to-CV link (`/` - lands back on the tab shell; tab state resets to "About" since there's no cross-route tab-memory, which is acceptable for this scope).
- Both reuse `cn()` from `src/utils/cn.ts` and existing Tailwind tokens; no new design system introduced.

### 4. New dependencies

- `react-router-dom` - routing.
- `gray-matter` - frontmatter parsing (pure JS, browser-safe).
- `react-markdown` - markdown-to-React rendering.

No MDX, no SSR, no content build step - everything resolves client-side from the glob import, matching the project's current "just Vite + React, no framework" posture.

## Error handling

- `getPostBySlug` returning `undefined` (bad/stale slug in a shared link) → `BlogPost` renders a simple "Post not found" state with a link back to `/blog`, rather than crashing.
- Empty `src/content/blog/` (before any post exists) → `Blog` tab renders an empty-state message instead of a blank grid.

## Testing

- No existing test suite in this repo (no test runner in `package.json`); this feature follows the same convention - manual verification only:
  - `npm run dev`, click through: About→Blog tab renders (empty state initially), add one seed post, confirm it lists and the detail route renders markdown correctly, confirm back-navigation works, confirm `npm run build && npm run preview` works under the `/personal-website` base path with `HashRouter` (hash URLs shouldn't be affected by `base`).
  - `npm run lint` must pass.

## Skill: `cv-blog-post`

New file: `llm-wiki/.claude/skills/cv-blog-post/SKILL.md`.

- **Trigger:** Ahmad asks to write/draft a blog post for his CV/portfolio site, or mentions a technical topic to turn into a CV blog post.
- **Where things live:** documents that it writes into the `cv` working directory (`src/content/blog/<slug>.md`), same cross-repo pattern as `tumbuh-blog-post`.
- **Workflow:**
  1. If Ahmad names a topic/wiki page, use it directly. Otherwise, read `llm-wiki/index.md`, scan the `## Concepts` section, and propose 3-5 candidates suited to a professional audience (skip anything personal/goals/reflections in tone even if filed under Concepts).
  2. Read the chosen wiki page in full.
  3. Draft an English-language post: translate and rewrite for a recruiter/client audience (not a literal translation of the Indonesian wiki prose), professional but not dry tone.
  4. Show the full draft (frontmatter + body) in chat for Ahmad's review before writing anything to disk.
  5. On approval, write `cv/src/content/blog/<slug>.md` with the frontmatter shape defined above (`sourceWikiPage` set to the originating wiki page's `[[link]]` name).
  6. Never use an em dash (-) anywhere in the output, per existing global writing preference.
- **Out of scope:** editing existing posts, deleting posts, choosing from Goals/Reflections categories, SEO/keyword research (topic is either given or picked from existing wiki catalog, no external research).

## Open questions / explicitly deferred

- No RSS feed, no tag-filtering UI, no pagination - single flat list is enough at current post-count scale (0 posts today). Add later if the list grows unwieldy.
- No comments, no analytics wiring - out of scope.

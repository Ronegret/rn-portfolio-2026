# Graph Report - RN_porfolio_2026  (2026-10-23)

## Corpus Check
- 76 files · ~2,257,930 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 95 file(s) not represented in the graph (top: .css 45, .avif 37, .woff2 11)

## Summary
- 535 nodes · 817 edges · 33 communities (30 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c0d76141`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- touch.js
- main.js
- package.json
- Layout.astro
- deep-detection-discovery.js
- index.astro
- deepDetectionDiscovery.js
- README.md
- case-fold.js
- cursor2.js
- vercel.json
- CLAUDE.md
- sx-contacto.js
- agent-graph.js
- sx-system-card.mjs
- webgl-hero.js
- sections.js
- hyperframes.json
- mobile-ux.js
- scripts
- HyperFrames Composition Project
- HyperFrames Composition Project
- case-mobile.js
- deepDetectionAccess.js
- cursor-fluid.js
- cv-pdf.mjs
- cursor-target.js
- dependencies
- scripts
- build-cv.mjs
- CardImg.astro

## God Nodes (most connected - your core abstractions)
1. `initFolds()` - 13 edges
2. `reduced()` - 12 edges
3. `morph()` - 12 edges
4. `buzz()` - 10 edges
5. `cardsOf()` - 9 edges
6. `init()` - 8 edges
7. `setDeck()` - 8 edges
8. `initDeck()` - 8 edges
9. `buildSheet()` - 8 edges
10. `init()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `draw()` --indirect_call--> `ch()`  [INFERRED]
  src/cursor-fluid.js → src/components/Chrome.astro
- `init()` --indirect_call--> `res()`  [INFERRED]
  src/webgl-hero.js → src/cursor-fluid.js
- `draw()` --indirect_call--> `t()`  [INFERRED]
  src/main.js → src/sx-contacto.js
- `LangSwitch()` --calls--> `useLang()`  [EXTRACTED]
  src/islands/LangSwitch.jsx → src/islands/store.js
- `ProjectFilter()` --calls--> `useLang()`  [EXTRACTED]
  src/islands/ProjectFilter.jsx → src/islands/store.js

## Import Cycles
- None detected.

## Communities (33 total, 3 thin omitted)

### Community 0 - "touch.js"
Cohesion: 0.07
Nodes (59): animateTo(), belowAll(), buildDeckUI(), buildSheet(), buzz(), calc(), cardsOf(), clamp() (+51 more)

### Community 1 - "main.js"
Cohesion: 0.06
Nodes (30): applyLang(), cbox, _counted, draw(), drawCyber(), drawSaas(), finish(), ham (+22 more)

### Community 2 - "package.json"
Cohesion: 0.18
Nodes (9): staticPages, name, private, type, version, @astrojs/react, @astrojs/sitemap, ogl (+1 more)

### Community 3 - "Layout.astro"
Cohesion: 0.06
Nodes (29): ../../public/src/case-transitions.js?raw, react, ch(), ../critical.css?raw, ../fonts.css?raw, ../intro.css?raw, LangSwitch(), OPTS (+21 more)

### Community 4 - "deep-detection-discovery.js"
Cohesion: 0.38
Nodes (8): buildClientEmail(), buildOwnerEmail(), escapeHtml(), findAnswer(), formatBytes(), plainValue(), renderAttachmentNote(), renderSections()

### Community 5 - "index.astro"
Cohesion: 0.06
Nodes (19): go(), groups, INTENTS, items, label, TYPES, branch(), G (+11 more)

### Community 6 - "deepDetectionDiscovery.js"
Cohesion: 0.11
Nodes (27): buildAttachmentPayload(), clearFieldError(), createCheckboxField(), createField(), createFileField(), createTextField(), esc(), fieldValue() (+19 more)

### Community 7 - "README.md"
Cohesion: 0.40
Nodes (4): 🛠️ Built with, ✨ Features, 🧭 Overview, 🚀 Run locally

### Community 8 - "case-fold.js"
Cohesion: 0.16
Nodes (27): allOpen(), ancestors(), build(), buildBar(), buildIndex(), containerOf(), el(), folds (+19 more)

### Community 9 - "cursor2.js"
Cohesion: 0.11
Nodes (22): apply(), c2, clamp(), FORCED, ICON, io, lab(), lbl (+14 more)

### Community 10 - "vercel.json"
Cohesion: 0.33
Nodes (5): framework, headers, outputDirectory, redirects, rewrites

### Community 13 - "sx-contacto.js"
Cohesion: 0.12
Nodes (13): RFC-6068, built, commit, iso, es, Props, rows, T (+5 more)

### Community 14 - "agent-graph.js"
Cohesion: 0.11
Nodes (23): ANG, build(), el(), hero, I, init(), lang(), later() (+15 more)

### Community 15 - "sx-system-card.mjs"
Cohesion: 0.22
Nodes (4): aliases, serverDir, workerPath, countHtml()

### Community 16 - "webgl-hero.js"
Cohesion: 0.19
Nodes (17): canvas, cur, frame(), hero, init(), lum(), mouse, parse() (+9 more)

### Community 17 - "sections.js"
Cohesion: 0.22
Nodes (8): I, IDS, mail, motion, names(), onLang, tag, tr()

### Community 18 - "hyperframes.json"
Cohesion: 0.22
Nodes (8): media, autoProxy, paths, assets, blocks, components, registry, $schema

### Community 19 - "mobile-ux.js"
Cohesion: 0.39
Nodes (8): collapsible(), init(), initCardDescriptions(), initFooter(), initMotion(), L(), LABELS, toggles

### Community 20 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, check, dev, publish, render, type

### Community 21 - "HyperFrames Composition Project"
Cohesion: 0.25
Nodes (7): Commands, Documentation, HyperFrames Composition Project, Key Rules, Linting — ALWAYS RUN AFTER CHANGES, Project Structure, Skills — read these first

### Community 22 - "HyperFrames Composition Project"
Cohesion: 0.25
Nodes (7): Commands, Documentation, HyperFrames Composition Project, Key Rules, Linting — ALWAYS RUN AFTER CHANGES, Project Structure, Skills — read these first

### Community 23 - "case-mobile.js"
Cohesion: 0.40
Nodes (5): init(), L(), LABELS, mq, style

### Community 24 - "deepDetectionAccess.js"
Cohesion: 0.50
Nodes (3): button, form, message

### Community 26 - "cursor-fluid.js"
Cohesion: 0.20
Nodes (20): build(), C, cv, dbl(), draw(), F, fbo(), frame() (+12 more)

### Community 27 - "cv-pdf.mjs"
Cohesion: 0.25
Nodes (4): base, cv, { chromium }, dir

### Community 28 - "cursor-target.js"
Cohesion: 0.09
Nodes (15): Props, cs, ct, dot, frame, lock(), spin, SX (+7 more)

### Community 29 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, astro, @astrojs/react, @astrojs/sitemap, ogl, react, react-dom

### Community 30 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, start

### Community 31 - "build-cv.mjs"
Cohesion: 0.60
Nodes (4): ats(), esc(), outDir, visual()

### Community 32 - "CardImg.astro"
Cohesion: 0.29
Nodes (3): astro, Props, widths

## Knowledge Gaps
- **5 isolated node(s):** `react-dom`, `../../public/src/case-transitions.js?raw`, `../critical.css?raw`, `../fonts.css?raw`, `RFC-6068`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 264 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ogl` connect `package.json` to `webgl-hero.js`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `react-dom`, `../../public/src/case-transitions.js?raw`, `../critical.css?raw` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `touch.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0742447516641065 - nodes in this community are weakly interconnected._
- **Why does `T` connect `sx-contacto.js` to `main.js`, `Layout.astro`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06025369978858351 - nodes in this community are weakly interconnected._
- **Why does `astro` connect `CardImg.astro` to `package.json`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `Layout.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.06290471785383904 - nodes in this community are weakly interconnected._
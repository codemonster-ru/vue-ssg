---
title: Overview
navTitle: Overview
description: Introduction to the docs workspace built on top of VueForge.
order: 0
---

# Codemonster Docs

The docs package is the documentation workspace for the Codemonster UI stack.
It uses the same VueForge foundation and layouts as the rest of the system, so
guides and product surfaces stay aligned from the start.

## Getting Started

This starter is designed to become a static documentation site generator driven
by markdown files. Content, navigation and table of contents metadata should all
come from the docs source tree instead of being hardcoded in the app shell.

## Installation

Install the docs package next to the shared VueForge libraries:

```bash
npm install @codemonster-ru/vue-ssg-core
npm install @codemonster-ru/vueforge-core @codemonster-ru/vueforge-layouts
```

## Why this stack

The docs package should explain the design system while using the design
system. That keeps implementation examples closer to reality and reduces visual
drift between docs and product code.

## Content model

Each markdown file should stay focused on one topic, but the overall docs tree
should still feel connected. A good rule of thumb is that every page explains
one concept, shows one or two realistic examples, and links clearly to the next
step in the reading flow.

That structure matters because developer documentation is usually scanned before
it is read. Readers jump through headings, code samples and side navigation to
build a quick mental map. When the content model is predictable, the interface
starts helping instead of getting in the way.

For this starter, that means the markdown source is not just content storage. It
is effectively the source of truth for navigation, hierarchy, table of contents
and page rhythm. The UI layer should stay thin while the documents carry the
semantic structure.

## Writing guidelines

Write the page introduction as if the reader has just landed from search. The
first paragraph should explain what the feature is, why it exists and where it
fits in the broader system. That gives the rest of the document a clear frame.

After the introduction, move into small sections with direct headings. Use
headings that describe intent instead of sounding abstract. "Register the
plugin" is usually easier to scan than "Plugin integration strategy", even if
both technically describe the same topic.

Examples should stay close to the explanation they support. A reader should not
have to scroll far between a conceptual paragraph and the first working snippet.
If an example requires too much setup to understand, it often belongs on a
dedicated page rather than inside a short guide.

## Navigation behavior

Longer pages make navigation quality much more noticeable. If the sidebar,
header and table of contents all stay stable while the content scrolls, the page
feels calm. If one of those pieces jitters or loses context, the whole
experience starts to feel heavier than it should.

The same is true for visual markers like active states and section indicators.
They work best when they confirm orientation without demanding attention. A good
navigation marker should feel obvious when needed and almost invisible the rest
of the time.

This is one of the reasons to test the layout with tall content instead of only
short demo pages. Short pages can hide spacing issues, sticky edge cases and
table-of-contents behavior that only appears once a document becomes long enough
to scroll through naturally.

## Real-world usage

In a production docs site, this overview page would likely be followed by more
specific guides for installation, theming, layout composition and authoring
workflow. Those pages would share the same shell but vary a lot in density. Some
would mostly contain prose, while others would be dominated by code blocks and
configuration examples.

That variation is useful during design work. It helps validate whether the
layout still feels balanced when the content becomes much taller, much denser or
more repetitive. A shell that only looks good with a perfectly short document is
usually not robust enough for real documentation.

Even simple filler content can help uncover those issues during a demo phase.
Once scrolling exists, it becomes much easier to evaluate spacing, sticky
behavior, active markers, footer transitions and how naturally the eye moves
between the left navigation, the main article and the table of contents on the
right.

## Nested list example

- Rendering checklist
  - unordered nested point
  - ordered nested sequence
    1. first ordered step
    2. second ordered step
- Mixed item with text and nested list
  - sub-item that stays inside the same list item context

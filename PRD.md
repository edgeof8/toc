**✅ Updated PRD: toc**  
**Table of Contents Generator Bookmarklet** (v0.2)

**Version**: 0.2 (Updated)  
**Date**: May 4, 2026  
**Author**: edgeof8  
**Status**: Draft – Ready for implementation

---

### 1. Executive Summary

**toc** is a powerful bookmarklet that instantly generates a **beautiful, standalone Table of Contents page** from any webpage’s headings and opens it in a new tab.

It also offers a quick “Copy as Markdown” option for power users.

This tool transforms long-form content navigation and pairs perfectly with the rest of the **Edge Toolkit**:

- `md-memo` → save the article  
- `stats` → analyze structure  
- **toc** → create a clean, clickable, shareable Table of Contents in seconds

**One click. Beautiful standalone page. Long-form content heaven.**

---

### 2. Problem Statement

Long articles, documentation, research papers, and blog posts are difficult to navigate without a proper Table of Contents. Most sites either lack one or provide a poor version.

Manually creating a clean, hierarchical, clickable TOC is time-consuming. Writers, researchers, and readers need a fast way to generate one that is both useful and beautiful.

**toc** solves this by generating a polished, standalone HTML page with one click.

---

### 3. Goals

**Primary Goal**  
Generate a clean, beautiful, and fully functional standalone Table of Contents page and open it in a new tab with one click.

**Secondary Goals**
- Offer “Copy as Markdown” as a fast alternative
- Produce high-quality, hierarchical, clickable output
- Feel premium and delightful

**Success Metrics (MVP)**
- Works on 95%+ of pages with headings
- Generates a beautiful, usable standalone page
- < 4 KB minified bookmarklet size

---

### 4. Target Users

- Writers, bloggers, and technical writers
- Researchers and students
- Documentation readers
- Anyone working with long-form content
- Users of `md-memo` and `stats`

---

### 5. Key Features (MVP)

| Feature                        | Description                                                                 | Priority |
|-------------------------------|-----------------------------------------------------------------------------|----------|
| **Standalone Page Generation**| Creates a clean, modern HTML page with the full Table of Contents           | P0      |
| **Clickable Navigation**      | All headings are clickable and scroll to the correct section on the original page | P0 |
| **Beautiful Design**          | Clean, minimal, modern styling (dark/light aware)                           | P0      |
| **Copy as Markdown**          | Secondary option to copy raw Markdown TOC to clipboard                      | P0      |
| **Smart Hierarchy**           | Properly nested headings (H1–H6) with correct indentation                   | P0      |
| **Page Title & Source**       | Includes original page title and link in the generated page                 | P0      |
| **Toast + Title Feedback**    | Clear confirmation + tab title flash                                        | P0      |

**Nice-to-have (Post-MVP)**
- Numbered vs bulleted style toggle
- Custom heading depth selection
- Export as PDF or Obsidian note
- Persistent settings (default action)

---

### 6. User Flow

1. User is on any long-form webpage
2. Clicks **toc** bookmark
3. Bookmarklet:
   - Scans all headings
   - Generates a beautiful standalone HTML page
   - Opens it in a **new tab**
4. User sees a clean, modern Table of Contents with clickable links back to the original page
5. Optional: User can also choose “Copy as Markdown” from a small menu

**Edge case handling**:
- No headings found → shows helpful message
- Very deep nesting → graceful formatting
- Single-page apps → works on current DOM

---

### 7. Technical Requirements

- **Pure client-side JavaScript**
- **Heading extraction** with proper hierarchy building
- **Self-contained HTML generation** (inline CSS + minimal JS for click handling)
- **Anchor link generation** that works with the original page
- **Clipboard support** for the Markdown fallback
- **Minified size** target: < 4 KB

**Key Technical Challenges & Solutions**
- Creating clickable links back to original page → use `window.opener` + smooth scroll or direct anchor injection
- Beautiful self-contained styling → modern CSS variables + clean design system
- Performance on very long pages → efficient DOM traversal

---

### 8. Non-Functional Requirements

- **Privacy**: 100% local processing
- **Performance**: New tab opens in < 500ms
- **Design**: Clean, modern, professional (inspired by Notion / Linear)
- **Accessibility**: Fully keyboard accessible + ARIA labels
- **Maintainability**: Clean and well-commented code

---

### 9. Scope

**In Scope (MVP)**
- Generate beautiful standalone TOC page
- Clickable navigation back to original page
- Copy as Markdown fallback
- Works on most documentation and article pages

**Out of Scope (MVP)**
- Persistent settings UI
- Advanced theming
- PDF export

---

### 10. Success Criteria

**Launch Criteria**
- Successfully generates beautiful standalone pages on 20 diverse long-form pages
- Clickable links work reliably
- Output looks professional and ready to use or share
- Matches the quality bar of the rest of the Edge Toolkit

**Post-Launch**
- Users report it becomes a daily workflow tool

---

### 11. Risks & Mitigations

| Risk                        | Likelihood | Impact | Mitigation |
|-----------------------------|------------|--------|----------|
| Clickable links breaking    | Medium     | Medium | Use both anchor injection + fallback |
| Large pages with many headings | Low      | Low    | Efficient processing + clean output |
| Styling conflicts           | Low        | Low    | Fully self-contained HTML |

---

### 12. Future Roadmap (Post-MVP)

- **v0.3**: Numbered TOC + custom depth selector
- **v0.4**: “TOC + Save” combo with `md-memo`
- **v0.5**: Theming options and export to PDF/Markdown file
- **v0.6**: Persistent user preferences

---

### 13. Open Questions

1. Should the default action be “Open standalone page” (recommended) or show a small menu every time? // yes
2. Should we include a “Back to original page” button on the generated TOC page? // Page title links back to page, contents to place on page
3. Do we want to support custom CSS themes later? // yes
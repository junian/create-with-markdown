import type { SlideTheme } from '~/types'

export const DEFAULT_SLIDE_NAME = 'Untitled Slides'

export const SLIDE_THEMES: ReadonlyArray<{ value: SlideTheme, label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'gaia', label: 'Gaia' },
  { value: 'uncover', label: 'Uncover' },
]

export const DEFAULT_SLIDE_MARKDOWN = `---
marp: true
paginate: true
---

# Untitled Presentation

Write your slides in Markdown.

---

## Slides are just Markdown

- Separate slides with \`---\`
- Headings, lists, tables, code, and images all work
- Use Marp directives like \`<!-- _class: lead -->\`

---

## Ready to present?

Export to **PDF** or **HTML**, or press **Present** to go full screen.
`

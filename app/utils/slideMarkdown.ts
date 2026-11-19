/**
 * Lightweight helpers for working with Marp slide Markdown outside of the
 * renderer, e.g. showing a slide count on a deck card before it is rendered.
 */

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const FENCE = /^\s*(```|~~~)/
const SLIDE_SEPARATOR = /^\s*---\s*$/

export const stripFrontMatter = (markdown: string) => {
  const match = FRONT_MATTER.exec(markdown)
  return match ? markdown.slice(match[0].length) : markdown
}

/**
 * Count slides the way Marp does: pages are separated by a line containing
 * only `---`. Lines inside fenced code blocks are ignored.
 */
export const countSlides = (markdown: string) => {
  let fences = 0
  let count = 1

  for (const line of stripFrontMatter(markdown).split(/\r?\n/)) {
    if (FENCE.test(line)) {
      fences += 1
      continue
    }

    if (fences % 2 === 0 && SLIDE_SEPARATOR.test(line)) count += 1
  }

  return count
}

/** First heading in the deck, used as a fallback title on cards. */
export const firstSlideHeading = (markdown: string) => {
  const body = stripFrontMatter(markdown)
  const match = /^\s*#{1,6}\s+(.+)$/m.exec(body)
  return match?.[1]?.trim() ?? ''
}

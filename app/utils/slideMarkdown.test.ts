import { describe, expect, it } from 'vitest'
import { countSlides, firstSlideHeading, stripFrontMatter } from './slideMarkdown'

describe('stripFrontMatter', () => {
  it('removes leading YAML front matter', () => {
    const markdown = '---\ntheme: gaia\n---\n\n# Slide'
    expect(stripFrontMatter(markdown)).toBe('\n# Slide')
  })

  it('keeps markdown without front matter', () => {
    expect(stripFrontMatter('# Slide')).toBe('# Slide')
  })

  it('does not treat a horizontal rule as front matter', () => {
    expect(stripFrontMatter('# Slide\n\n---\n\n## Next')).toContain('## Next')
  })
})

describe('countSlides', () => {
  it('counts a single slide', () => {
    expect(countSlides('# Hello')).toBe(1)
  })

  it('counts separators', () => {
    expect(countSlides('# One\n\n---\n\n## Two\n\n---\n\n## Three')).toBe(3)
  })

  it('ignores separators inside front matter', () => {
    expect(countSlides('---\nmarp: true\npaginate: true\n---\n\n# One')).toBe(1)
  })

  it('ignores separators inside fenced code blocks', () => {
    const markdown = '# One\n\n```md\n---\n```\n\n---\n\n## Two'
    expect(countSlides(markdown)).toBe(2)
  })

  it('treats empty markdown as one slide', () => {
    expect(countSlides('')).toBe(1)
    expect(countSlides('   \n  ')).toBe(1)
  })

  it('allows surrounding whitespace around separators', () => {
    expect(countSlides('# One\n  ---  \n## Two')).toBe(2)
  })
})

describe('firstSlideHeading', () => {
  it('returns the first heading, ignoring front matter', () => {
    expect(firstSlideHeading('---\nmarp: true\n---\n\n# Deck title\n\n## Sub')).toBe('Deck title')
  })

  it('returns an empty string when there is no heading', () => {
    expect(firstSlideHeading('Just text')).toBe('')
  })
})

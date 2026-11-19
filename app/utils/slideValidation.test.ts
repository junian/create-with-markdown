import { describe, expect, it } from 'vitest'
import { isSlideTheme, isValidSlide } from './slideValidation'
import type { SlideStorageItem } from '~/types'
import { DEFAULT_SLIDE_MARKDOWN, DEFAULT_SLIDE_NAME } from '~/utils/constants/slides'

const validSlide: SlideStorageItem = {
  name: DEFAULT_SLIDE_NAME,
  markdown: DEFAULT_SLIDE_MARKDOWN,
  theme: 'default',
  update: '1700000000000',
}

describe('isSlideTheme', () => {
  it('accepts the bundled Marp themes', () => {
    expect(isSlideTheme('default')).toBe(true)
    expect(isSlideTheme('gaia')).toBe(true)
    expect(isSlideTheme('uncover')).toBe(true)
  })

  it('rejects unknown or non-string themes', () => {
    expect(isSlideTheme('custom')).toBe(false)
    expect(isSlideTheme('')).toBe(false)
    expect(isSlideTheme(null)).toBe(false)
    expect(isSlideTheme(undefined)).toBe(false)
    expect(isSlideTheme(1)).toBe(false)
  })
})

describe('isValidSlide', () => {
  it('accepts a complete slide deck', () => {
    expect(isValidSlide(validSlide)).toBe(true)
  })

  it('accepts an empty markdown deck', () => {
    expect(isValidSlide({ ...validSlide, markdown: '' })).toBe(true)
  })

  it('rejects missing or mistyped fields', () => {
    const { name: _name, ...withoutName } = validSlide
    expect(isValidSlide(withoutName)).toBe(false)
    expect(isValidSlide({ ...validSlide, markdown: 1 })).toBe(false)
    expect(isValidSlide({ ...validSlide, update: undefined })).toBe(false)
    expect(isValidSlide(null)).toBe(false)
    expect(isValidSlide('deck')).toBe(false)
    expect(isValidSlide([])).toBe(false)
  })

  it('rejects unsupported themes', () => {
    expect(isValidSlide({ ...validSlide, theme: 'solarized' })).toBe(false)
  })
})

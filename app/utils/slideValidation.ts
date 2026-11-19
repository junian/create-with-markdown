import type { SlideStorageItem, SlideTheme } from '~/types'
import { SLIDE_THEMES } from '~/utils/constants/slides'

const SLIDE_THEME_VALUES = new Set<string>(SLIDE_THEMES.map(theme => theme.value))

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const isSlideTheme = (value: unknown): value is SlideTheme =>
  typeof value === 'string' && SLIDE_THEME_VALUES.has(value)

export const isValidSlide = (value: unknown): value is SlideStorageItem =>
  isRecord(value)
  && typeof value.name === 'string'
  && typeof value.markdown === 'string'
  && isSlideTheme(value.theme)
  && typeof value.update === 'string'

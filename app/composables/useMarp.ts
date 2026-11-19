import type { SlideTheme } from '~/types'

type MarpInstance = import('@marp-team/marp-core').Marp
type BrowserHelper = import('@marp-team/marp-core/browser').MarpCoreBrowser

const MARP_STYLE_ID = 'marp-core-styles'

let marp: MarpInstance | undefined
let helper: BrowserHelper | undefined
let loading: Promise<void> | undefined
let styleElement: HTMLStyleElement | undefined

const canUseDom = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const ensureMarp = async () => {
  if (!canUseDom()) throw new Error('Marp can only render in the browser.')

  if (!loading) {
    loading = (async () => {
      const [{ Marp }, { browser }] = await Promise.all([
        import('@marp-team/marp-core'),
        import('@marp-team/marp-core/browser'),
      ])

      marp = new Marp({ html: true })
      helper = browser(document)
    })()
  }

  await loading
  return marp!
}

const countSlidesInHtml = (html: string) =>
  (html.match(/<svg data-marpit-svg/g) ?? []).length

export const renderMarpDeck = async (markdown: string, theme: SlideTheme) => {
  const instance = await ensureMarp()
  const selected = instance.themeSet.get(theme)

  if (selected) instance.themeSet.default = selected

  const { html, css } = instance.render(markdown || '')

  return {
    html,
    css,
    slideCount: countSlidesInHtml(html),
  }
}

/** Replace the single Marp stylesheet used by the slide preview. */
export const applyMarpStyles = (css: string) => {
  if (!canUseDom()) return

  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = MARP_STYLE_ID
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = css
}

/** Apply Marp's browser polyfills to freshly rendered DOM. */
export const refreshMarpDom = () => {
  helper?.update()
}

/**
 * Remove the injected Marp stylesheet. Its `@page` rule would otherwise keep
 * forcing 16:9 paper after leaving the slide editor.
 */
export const removeMarpStyles = () => {
  styleElement?.remove()
  styleElement = undefined
}

export const useMarp = () => ({
  renderMarpDeck,
  applyMarpStyles,
  refreshMarpDom,
  removeMarpStyles,
})

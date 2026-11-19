import { downloadFile } from '~/libs/utils'
import { replaceIconifyIconsInHtml } from '~/utils/iconifySvg'
import type { SlideTheme } from '~/types'

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, char => (
    {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
    }[char] ?? char
  ))

const safeFileName = (name: string) => name.trim().replace(/\s+/g, '_') || 'slides'

const DECK_RUNTIME = `
html, body { margin: 0; height: 100%; background: #000; overflow: hidden; }
body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
svg[data-marpit-svg] { display: none; width: 100vw; height: 100vh; }
svg[data-marpit-svg].is-active { display: block; }
.deck-hud {
  position: fixed; right: 20px; bottom: 16px; z-index: 10;
  color: #fff; font-size: 13px; font-variant-numeric: tabular-nums;
  opacity: 0.55; pointer-events: none;
  text-shadow: 0 1px 4px rgb(0 0 0 / 60%);
}
.deck-hint {
  position: fixed; left: 20px; bottom: 16px; z-index: 10;
  color: #fff; font-size: 12px; opacity: 0.3; pointer-events: none;
  text-shadow: 0 1px 4px rgb(0 0 0 / 60%);
}
`

const DECK_SCRIPT = `
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('svg[data-marpit-svg]'));
  if (!slides.length) return;
  var hud = document.querySelector('.deck-hud');
  var current = 0;

  function show(index) {
    current = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    if (hud) hud.textContent = (current + 1) + ' / ' + slides.length;
    if (history.replaceState) history.replaceState(null, '', '#' + (current + 1));
  }

  function fromHash() {
    var match = /^#(\\d+)$/.exec(location.hash);
    return match ? parseInt(match[1], 10) - 1 : 0;
  }

  document.addEventListener('keydown', function (event) {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].indexOf(event.key) !== -1) {
      event.preventDefault(); show(current + 1);
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].indexOf(event.key) !== -1) {
      event.preventDefault(); show(current - 1);
    } else if (event.key === 'Home') {
      event.preventDefault(); show(0);
    } else if (event.key === 'End') {
      event.preventDefault(); show(slides.length - 1);
    }
  });

  document.addEventListener('click', function (event) {
    if (event.clientX < window.innerWidth / 3) show(current - 1);
    else show(current + 1);
  });

  window.addEventListener('hashchange', function () { show(fromHash()); });

  show(fromHash());
})();
`

export const useSlideExport = (
  name: () => string,
  markdown: () => string,
  theme: () => SlideTheme,
) => {
  const fileName = () => safeFileName(name())

  const buildDeckDocument = async () => {
    const { renderMarpDeck } = useMarp()
    const { html, css } = await renderMarpDeck(markdown(), theme())

    let deckHtml = await inlineImagesInHtml(html)
    deckHtml = await replaceIconifyIconsInHtml(deckHtml)

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(name())}</title>
  <style>${css}${DECK_RUNTIME}</style>
</head>
<body>
  ${deckHtml}
  <div class="deck-hud"></div>
  <div class="deck-hint">← → to navigate</div>
  <script>${DECK_SCRIPT}</script>
</body>
</html>`
  }

  const exportHtml = async () => {
    downloadFile(`${fileName()}.html`, await buildDeckDocument())
  }

  const exportMd = () => {
    downloadFile(`${fileName()}.md`, markdown())
  }

  const exportPdf = () => {
    const previousTitle = document.title
    const pageStyle = document.createElement('style')
    pageStyle.id = 'marp-print-page'
    pageStyle.textContent = '@page { size: 1280px 720px; margin: 0; }'

    document.head.appendChild(pageStyle)
    document.title = name()

    const restore = () => {
      document.title = previousTitle
      pageStyle.remove()
      window.removeEventListener('afterprint', restore)
    }

    window.addEventListener('afterprint', restore)
    window.print()
  }

  return {
    exportPdf,
    exportHtml,
    exportMd,
    buildDeckDocument,
  }
}

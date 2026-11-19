const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://withmarkdown.com'
const baseURL = process.env.NUXT_APP_BASE_URL || '/'

export const siteConfig = {
  name: 'With Markdown',
  shortName: 'WithMarkdown',
  cacheId: 'with-markdown',
  title: 'With Markdown — Write Documents in Markdown',
  description:
    'A local-first editor for writing any document in Markdown — books, papers, resumes — with live page preview and clean PDF, HTML, and DOCX exports.',
  image: `${siteUrl}${baseURL}og-image.png`,
  url: siteUrl,
  baseURL,
  iconifyScriptURL: 'https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js',
}

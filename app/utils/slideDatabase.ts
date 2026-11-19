import * as localForage from 'localforage'
import { copy, downloadFile, isClient, storageToList, uploadFile } from '~/libs/utils'
import { DEFAULT_SLIDE_MARKDOWN, DEFAULT_SLIDE_NAME } from '~/utils/constants/slides'
import { isValidSlide } from '~/utils/slideValidation'
import type { SlideListItem, SlideStorage, SlideStorageItem } from '~/types'

const WITH_MARKDOWN_SLIDES_KEY = 'WITH_MARKDOWN_slides'

export const clearSlideStorage = () => localForage.removeItem(WITH_MARKDOWN_SLIDES_KEY)

export const getSlideStorage = async () =>
  isClient ? localForage.getItem<SlideStorage>(WITH_MARKDOWN_SLIDES_KEY) : null

export const getSlideList = async (): Promise<SlideListItem[]> => {
  const storage = (await getSlideStorage()) || {}
  return storageToList(storage)
    .sort((a, b) => (b.update || b.id).localeCompare(a.update || a.id))
}

/**
 * Save a slide deck, optionally showing the "saved" toast.
 */
export const saveSlide = async (
  id: string,
  slide: SlideStorageItem,
  showToast = true,
) => {
  const storage = (await getSlideStorage()) || {}
  storage[id] = slide

  await localForage.setItem(WITH_MARKDOWN_SLIDES_KEY, storage)

  if (showToast) {
    const toast = useAppToast()
    toast.save()
  }
}

export const createSlide = async () => {
  const toast = useAppToast()
  const id = new Date().getTime().toString()

  await saveSlide(
    id,
    {
      name: DEFAULT_SLIDE_NAME,
      markdown: DEFAULT_SLIDE_MARKDOWN,
      theme: 'default',
      update: id,
    },
    false,
  )

  toast.newSlides()
  return id
}

export const deleteSlide = async (id: string) => {
  const toast = useAppToast()
  const storage = await getSlideStorage()
  const item = storage?.[id]

  if (storage && item) {
    const { name } = item
    const { [id]: _removed, ...remaining } = storage

    await localForage.setItem(WITH_MARKDOWN_SLIDES_KEY, remaining)
    toast.deleteSlides(name)
  }
}

const nextCopyName = (storage: SlideStorage, baseName: string) => {
  const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const copyRegex = new RegExp(`^${escapedBaseName} copy (\\d+)$`, 'i')
  let maxCopyNumber = 0

  for (const item of Object.values(storage)) {
    const match = copyRegex.exec(item.name)
    if (match) maxCopyNumber = Math.max(maxCopyNumber, Number.parseInt(match[1]!, 10))
  }

  return `${baseName} copy ${maxCopyNumber + 1}`
}

export const duplicateSlide = async (id: string) => {
  const toast = useAppToast()
  const storage = await getSlideStorage()
  const existing = storage?.[id]

  if (storage && existing) {
    const slide: SlideStorageItem = copy(existing)
    const newId = new Date().getTime().toString()
    const originalName = slide.name
    const baseName = originalName.replace(/ copy \d+$/i, '')

    slide.name = nextCopyName(storage, baseName)
    slide.update = newId
    storage[newId] = slide

    await localForage.setItem(WITH_MARKDOWN_SLIDES_KEY, storage)
    toast.duplicateSlides(originalName, slide.name)
  }
}

export const renameSlide = async (id: string, name: string) => {
  const storage = (await getSlideStorage()) || {}
  const item = storage[id]

  if (item) {
    item.name = name
    await localForage.setItem(WITH_MARKDOWN_SLIDES_KEY, storage)

    const toast = useAppToast()
    toast.save()
  }
}

/**
 * Download every slide deck as a JSON file.
 */
export const saveSlidesToLocal = async () => {
  const storage = (await getSlideStorage()) || {}
  downloadFile('with-markdown-slides.json', JSON.stringify(storage))
}

/**
 * Import slide decks from a JSON file. Existing decks are kept and merged.
 */
export const importSlidesFromLocal = async (callback?: () => void) => {
  const toast = useAppToast()
  const storage = (await getSlideStorage()) || {}

  const merge = async (content: string) => {
    let data: unknown
    try {
      data = JSON.parse(content)
    }
    catch {
      toast.import(false)
      return
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      toast.import(false)
      return
    }

    const decks = Object.values(data)
    if (decks.length === 0 || !decks.every(isValidSlide)) {
      toast.import(false)
      return
    }

    const newStorage = {
      ...storage,
      ...(data as SlideStorage),
    }

    await localForage.setItem(WITH_MARKDOWN_SLIDES_KEY, newStorage)
    toast.import(true)

    if (callback) callback()
  }

  uploadFile(merge, '.json')
}

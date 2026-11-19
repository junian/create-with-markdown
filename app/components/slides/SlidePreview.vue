<template>
  <div
    ref="viewerRef"
    class="slide-viewer"
    :class="{ 'is-presenting': isPresenting }"
  >
    <div
      ref="viewportRef"
      class="slide-viewport"
    >
      <div
        v-if="error"
        class="slide-status"
      >
        <UIcon
          name="i-mdi:alert-circle-outline"
          class="text-3xl text-red-400"
        />
        <p>{{ error }}</p>
      </div>

      <div
        v-else-if="!html"
        class="slide-status"
      >
        <UIcon
          name="i-mdi:loading"
          class="animate-spin text-2xl"
        />
        <p>{{ $t("slides.rendering") }}</p>
      </div>

      <div
        v-else
        class="slide-frame"
        :style="{
          width: `${SLIDE_WIDTH * scale}px`,
          height: `${SLIDE_HEIGHT * scale}px`,
        }"
      >
        <!-- eslint-disable vue/no-v-html -- deck HTML is produced by Marp from the user's own markdown -->
        <div
          ref="deckRef"
          class="slide-deck"
          :style="{ transform: `scale(${scale})` }"
          v-html="html"
        />
        <!-- eslint-enable vue/no-v-html -->
      </div>
    </div>

    <div class="slide-controls">
      <UButton
        variant="ghost"
        class="slide-control-button"
        icon="i-mdi:chevron-left"
        :aria-label="$t('slides.previous')"
        :title="$t('slides.previous')"
        :disabled="count <= 1"
        @click="prev"
      />
      <span class="slide-counter">{{ current + 1 }} / {{ count }}</span>
      <UButton
        variant="ghost"
        class="slide-control-button"
        icon="i-mdi:chevron-right"
        :aria-label="$t('slides.next')"
        :title="$t('slides.next')"
        :disabled="count <= 1"
        @click="next"
      />
      <span class="slide-controls-divider" />
      <UButton
        variant="ghost"
        class="slide-control-button"
        :icon="isPresenting ? 'i-mdi:fullscreen-exit' : 'i-mdi:presentation-play'"
        :aria-label="isPresenting ? $t('slides.exit_present') : $t('slides.present')"
        :title="isPresenting ? $t('slides.exit_present') : $t('slides.present')"
        @click="togglePresent"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from 'ts-debounce'
import type { SlideTheme } from '~/types'

const props = defineProps<{
  markdown: string
  theme: SlideTheme
}>()

const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720

const { renderMarpDeck, applyMarpStyles, refreshMarpDom, removeMarpStyles } = useMarp()

const viewerRef = ref<HTMLElement>()
const viewportRef = ref<HTMLElement>()
const deckRef = ref<HTMLElement>()

const html = ref('')
const count = ref(1)
const current = ref(0)
const error = ref('')
const isPresenting = ref(false)

const { width, height } = useElementSize(viewportRef)

const scale = computed(() => {
  if (!width.value || !height.value) return 0.2
  const padding = 56
  return Math.max(
    0.05,
    Math.min(
      (width.value - padding) / SLIDE_WIDTH,
      (height.value - padding) / SLIDE_HEIGHT,
    ),
  )
})

let renderToken = 0

const updateActiveSlide = () => {
  const slides = deckRef.value?.querySelectorAll<SVGElement>('svg[data-marpit-svg]')
  if (!slides) return
  slides.forEach((slide, index) => {
    slide.classList.toggle('is-active', index === current.value)
  })
}

const render = async () => {
  const token = ++renderToken

  try {
    const result = await renderMarpDeck(props.markdown, props.theme)
    if (token !== renderToken) return

    applyMarpStyles(result.css)
    html.value = result.html
    count.value = Math.max(1, result.slideCount)
    current.value = Math.min(current.value, count.value - 1)
    error.value = ''

    await nextTick()
    updateActiveSlide()
    refreshMarpDom()
  }
  catch (err) {
    if (token !== renderToken) return
    error.value = err instanceof Error ? err.message : String(err)
  }
}

const renderDebounced = debounce(render, 250)

watch(
  () => [props.markdown, props.theme],
  () => {
    if (import.meta.client) void renderDebounced()
  },
)

const go = (index: number) => {
  const total = Math.max(1, count.value)
  current.value = ((index % total) + total) % total
}

const next = () => go(current.value + 1)
const prev = () => go(current.value - 1)

watch(current, async () => {
  await nextTick()
  updateActiveSlide()
})

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest('.monaco-editor, input, textarea, select, [contenteditable="true"]'),
  )
}

const onKeyDown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || isEditableTarget(event.target)) return

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      event.preventDefault()
      next()
      break
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      event.preventDefault()
      prev()
      break
    case 'Home':
      event.preventDefault()
      go(0)
      break
    case 'End':
      event.preventDefault()
      go(count.value - 1)
      break
  }
}

const onFullscreenChange = () => {
  isPresenting.value = document.fullscreenElement === viewerRef.value
}

const togglePresent = async () => {
  if (!viewerRef.value) return

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await viewerRef.value.requestFullscreen?.()
  }
  catch {
    // Fullscreen may be blocked by the browser; the deck still works inline.
  }
}

onMounted(() => {
  void render()
  window.addEventListener('keydown', onKeyDown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  renderToken += 1
  window.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  removeMarpStyles()
})
</script>

<style scoped>
.slide-viewer {
  position: relative;
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  background: #1f2430;
}

.slide-viewer.is-presenting {
  background: #000;
}

.slide-viewport {
  position: relative;
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 16px;
}

.slide-frame {
  position: relative;
  flex: none;
  overflow: hidden;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 18px 50px rgb(0 0 0 / 45%);
}

.slide-deck {
  width: 1280px;
  height: 720px;
  transform-origin: top left;
}

.slide-deck :deep(svg[data-marpit-svg]) {
  display: none;
  width: 1280px;
  height: 720px;
  max-width: none;
}

.slide-deck :deep(svg[data-marpit-svg].is-active) {
  display: block;
}

.slide-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #cbd5e1;
  font-size: 0.875rem;
  text-align: center;
}

.slide-controls {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  color: #e2e8f0;
}

.slide-viewer.is-presenting .slide-controls {
  position: absolute;
  bottom: 16px;
  left: 50%;
  border-radius: 999px;
  background: rgb(15 23 42 / 70%);
  opacity: 0.25;
  transform: translateX(-50%);
  transition: opacity 150ms ease;
}

.slide-viewer.is-presenting .slide-controls:hover {
  opacity: 1;
}

.slide-control-button {
  color: #e2e8f0 !important;
}

.slide-control-button:hover {
  background: rgb(148 163 184 / 20%) !important;
}

.slide-counter {
  min-width: 4.5rem;
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
  font-size: 0.8125rem;
  text-align: center;
}

.slide-controls-divider {
  width: 1px;
  height: 1.25rem;
  margin: 0 4px;
  background: rgb(148 163 184 / 35%);
}
</style>

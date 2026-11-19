<template>
  <div class="edit-page slides-edit-page sidebar-layout flex flex-col">
    <MainSidebar default-collapsed />

    <div class="workspace size-full overflow-hidden flex flex-1 flex-col pb-2">
      <header class="slides-toolbar">
        <div class="slides-toolbar-brand">
          <span class="circle size-8 shrink-0 bg-[#2563eb] text-white">
            <UIcon
              name="i-material-symbols:slideshow"
              class="text-lg"
            />
          </span>
          <Editable
            v-if="deck"
            id="slides-rename"
            class="min-w-28 max-w-full flex-1 overflow-hidden text-sm md:text-base"
            :default="deck.name"
            :on-value-commit="rename"
            text-align="left"
            icon-position="left"
          />
          <span
            v-if="deck"
            class="slides-count-badge max-sm:hidden"
          >
            {{ $t("slides.slide_count", { count: slideCount }) }}
          </span>
        </div>

        <div class="slides-toolbar-actions">
          <USelectMenu
            v-model="theme"
            class="w-32"
            :items="themeItems"
            value-key="value"
            label-key="label"
            :aria-label="$t('slides.theme')"
          />
          <div class="hstack gap-1">
            <UButton
              variant="ghost"
              class="round-btn"
              icon="i-mdi:file-pdf-box"
              :aria-label="$t('slides.export_pdf')"
              :title="$t('slides.export_pdf')"
              @click="exportPdf"
            />
            <UButton
              variant="ghost"
              class="round-btn"
              icon="i-mdi:language-html5"
              :aria-label="$t('slides.export_html')"
              :title="$t('slides.export_html')"
              @click="exportHtml"
            />
            <UButton
              variant="ghost"
              class="round-btn"
              icon="i-ri:markdown-fill"
              :aria-label="$t('slides.export_md')"
              :title="$t('slides.export_md')"
              @click="exportMd"
            />
          </div>
          <UButton
            variant="ghost"
            class="round-btn"
            icon="i-ic:baseline-save"
            :aria-label="$t('resumes.save')"
            :title="$t('resumes.save')"
            @click="save"
          />
        </div>
      </header>

      <div
        v-if="!isSplitterReady"
        class="min-h-0 flex-1"
      />
      <SplitterGroup
        v-else
        id="slides-editor-preview"
        class="min-h-0 flex-1 px-3"
        :direction="isStackedLayout ? 'vertical' : 'horizontal'"
      >
        <SplitterPanel
          id="slides-editor"
          class="editor-pane"
        >
          <SlideEditor v-model="markdown" />
        </SplitterPanel>

        <SplitterResizeHandle id="slides-editor-preview-resize" />

        <SplitterPanel
          id="slides-preview"
          class="preview-pane"
        >
          <SlidePreview
            :markdown="markdown"
            :theme="theme"
          />
        </SplitterPanel>
      </SplitterGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { debounce } from 'ts-debounce'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { useShortcuts } from '~/libs/vue-shortcuts'
import { siteConfig } from '~~/configs/siteConfig'
import { SLIDE_THEMES } from '~/utils/constants/slides'
import { countSlides } from '~/utils/slideMarkdown'
import type { SlideStorageItem, SlideTheme } from '~/types'

const route = useRoute()
const localePath = useLocalePath()

const deck = ref<SlideStorageItem | null>(null)
const markdown = ref('')
const theme = ref<SlideTheme>('default')
const isSplitterReady = ref(false)
const isStackedLayout = ref(false)

const slideId = computed(() => String(route.params.id))
const slideCount = computed(() => countSlides(markdown.value))

const themeItems = SLIDE_THEMES.map(item => ({ ...item }))

const { exportPdf, exportHtml, exportMd } = useSlideExport(
  () => deck.value?.name ?? '',
  () => markdown.value,
  () => theme.value,
)

const persist = async (showToast = false) => {
  if (!deck.value) return

  await saveSlide(
    slideId.value,
    {
      name: deck.value.name,
      markdown: markdown.value,
      theme: theme.value,
      update: new Date().getTime().toString(),
    },
    showToast,
  )
}

const save = () => persist(true)

const persistSoon = debounce(() => persist(false), 700)

watch(markdown, () => {
  if (deck.value) void persistSoon()
})

watch(theme, () => {
  if (deck.value) void persist(false)
})

const rename = (name: string) => {
  if (!deck.value) return
  deck.value.name = name
  void persist(true)
}

useShortcuts('ctrl+s', save)

onMounted(async () => {
  const storage = await getSlideStorage()
  const item = storage?.[slideId.value]

  if (!item) {
    await navigateTo(localePath('/slides'))
    return
  }

  deck.value = item
  markdown.value = item.markdown
  theme.value = item.theme

  const mediaQuery = window.matchMedia('(max-width: 768px)')
  isStackedLayout.value = mediaQuery.matches
  mediaQuery.addEventListener('change', (event) => {
    isStackedLayout.value = event.matches
  })

  await nextTick()
  isSplitterReady.value = true
})

onBeforeUnmount(() => {
  persistSoon.cancel()
  if (deck.value) void persist(false)
})

useHead(() => ({
  title: deck.value ? `${deck.value.name} — ${siteConfig.name}` : undefined,
}))
</script>

<style scoped>
.slides-toolbar {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg);
}

.slides-toolbar-brand {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
}

.slides-toolbar-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.slides-count-badge {
  flex: none;
  border-radius: 999px;
  background: var(--ui-bg-muted);
  padding: 2px 8px;
  color: var(--ui-text-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .slides-toolbar-actions {
    flex-basis: 100%;
    justify-content: flex-end;
  }
}
</style>

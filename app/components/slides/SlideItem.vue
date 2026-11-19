<template>
  <div class="w-72">
    <div class="group relative">
      <ULink
        raw
        class="slide-card"
        :class="`slide-card--${slide.theme}`"
        :to="`/slides/${slide.id}`"
      >
        <span class="slide-card-badge">MARP</span>
        <span class="slide-card-title">{{ slide.name }}</span>
        <span class="slide-card-footer">
          <UIcon
            name="i-material-symbols:slideshow"
            class="text-base"
          />
          {{ $t("slides.slide_count", { count }) }}
          <span class="slide-card-theme">{{ themeLabel }}</span>
        </span>
      </ULink>

      <SlideOptions
        class="z-20 hidden group-hover:block"
        :slide="slide"
        @update="emit('update')"
      />
    </div>

    <div class="mt-2 w-64 space-y-0.5">
      <Editable
        :id="`slides-rename-${slide.id}`"
        class="w-full text-sm text-dark-c"
        :default="slide.name"
        :on-value-commit="rename"
        text-align="left"
        icon-position="left"
      />
      <div class="hstack gap-1.5 text-xs text-lighter-c">
        <UIcon name="i-ic:round-update" />
        {{ updated }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SLIDE_THEMES } from '~/utils/constants/slides'
import { countSlides } from '~/utils/slideMarkdown'
import type { SlideListItem } from '~/types'

const props = defineProps<{
  slide: SlideListItem
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const count = computed(() => countSlides(props.slide.markdown))
const themeLabel = computed(
  () => SLIDE_THEMES.find(theme => theme.value === props.slide.theme)?.label
    ?? props.slide.theme,
)

const rename = async (text: string) => {
  await renameSlide(props.slide.id, text)
  emit('update')
}

const updated = computed(() => {
  const date = new Date(Number.parseInt(props.slide.update))
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})
</script>

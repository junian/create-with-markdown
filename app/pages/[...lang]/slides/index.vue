<template>
  <div class="slides-page sidebar-layout">
    <MainSidebar />

    <main class="max-w-306 mx-auto px-5 py-12 md:px-10 md:py-16 text-dark-c">
      <div
        class="flex flex-col gap-4 mb-10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="hstack gap-3">
          <span class="circle size-10 shrink-0 bg-brand text-white">
            <UIcon
              name="i-material-symbols:slideshow"
              class="text-xl"
            />
          </span>
          <div>
            <h1 class="text-3xl font-bold">
              {{ $t("slides.my_slides") }}
            </h1>
            <p class="mt-1 text-sm text-light-c">
              {{ $t("slides.description") }}
            </p>
          </div>
        </div>
        <SlideFileOptions @update="loadSlides" />
      </div>

      <div class="grid justify-between gap-x-3 gap-y-8 grid-cols-[repeat(auto-fill,18rem)]">
        <NewSlide />
        <SlideItem
          v-for="slide in list"
          :key="slide.id"
          :slide="slide"
          @update="loadSlides"
        />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import type { SlideListItem } from '~/types'

const list = ref<SlideListItem[]>()

const loadSlides = async () => {
  list.value = await getSlideList()
}

onMounted(loadSlides)
</script>

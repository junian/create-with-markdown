<template>
  <div class="home-page sidebar-layout">
    <MainSidebar />

    <main class="max-w-306 mx-auto px-5 py-12 md:px-10 md:py-16 text-dark-c">
      <!-- Hero Section -->
      <section class="mb-14 text-center">
        <div class="flex-center mb-6">
          <span class="flex-center size-16 rounded-2xl bg-[#2563eb] text-white shadow-lg shadow-blue-500/25">
            <Logo class="text-4xl" />
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          With <span class="text-brand">Markdown</span>
        </h1>
        <p class="text-lg text-light-c max-w-3xl mx-auto">
          {{ $t("landing.desc") }}
        </p>
      </section>

      <!-- Recent Documents Section -->
      <section class="mb-14">
        <div class="flex items-center justify-between mb-6">
          <div class="hstack gap-3">
            <span class="circle size-9 shrink-0 bg-brand text-white">
              <UIcon
                name="i-ep:document"
                class="text-lg"
              />
            </span>
            <div>
              <h2 class="text-2xl font-bold">
                {{ $t("resumes.my_resumes") }}
              </h2>
              <p class="mt-0.5 text-sm text-light-c">
                {{ $t("resumes.description") }}
              </p>
            </div>
          </div>
          <ULink
            raw
            class="hstack gap-1.5 px-4 py-2 rounded-lg border border-c text-sm font-medium hover:bg-darker-c transition-colors"
            to="/resumes"
          >
            <span>{{ $t("nav.see_more") }}</span>
            <UIcon
              name="i-tabler:arrow-right"
              class="text-base"
            />
          </ULink>
        </div>

        <div class="resumes-row-wrap">
          <div class="resumes-row">
            <NewResume />
            <ResumeItem
              v-for="resume in recentResumes"
              :key="resume.id"
              class="resume-item shrink-0"
              :resume="resume"
              @update="loadResumes"
            />
          </div>
        </div>
      </section>

      <!-- Recent Slides Section -->
      <section class="mb-14">
        <div class="flex items-center justify-between mb-6">
          <div class="hstack gap-3">
            <span class="circle size-9 shrink-0 bg-brand text-white">
              <UIcon
                name="i-material-symbols:slideshow"
                class="text-lg"
              />
            </span>
            <div>
              <h2 class="text-2xl font-bold">
                {{ $t("slides.my_slides") }}
              </h2>
              <p class="mt-0.5 text-sm text-light-c">
                {{ $t("slides.description") }}
              </p>
            </div>
          </div>
          <ULink
            raw
            class="hstack gap-1.5 px-4 py-2 rounded-lg border border-c text-sm font-medium hover:bg-darker-c transition-colors"
            to="/slides"
          >
            <span>{{ $t("nav.see_more") }}</span>
            <UIcon
              name="i-tabler:arrow-right"
              class="text-base"
            />
          </ULink>
        </div>

        <div class="slides-row-wrap">
          <div class="slides-row">
            <NewSlide />
            <SlideItem
              v-for="slide in recentSlides"
              :key="slide.id"
              class="shrink-0"
              :slide="slide"
              @update="loadSlides"
            />
          </div>
        </div>
      </section>

      <!-- Recent Images Section -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <div class="hstack gap-3">
            <span class="circle size-9 shrink-0 bg-brand text-white">
              <UIcon
                name="i-ic:outline-photo-library"
                class="text-lg"
              />
            </span>
            <div>
              <h2 class="text-2xl font-bold">
                {{ $t("images.my_images") }}
              </h2>
              <p class="mt-0.5 text-sm text-light-c">
                {{ $t("images.description") }}
              </p>
            </div>
          </div>
          <ULink
            raw
            class="hstack gap-1.5 px-4 py-2 rounded-lg border border-c text-sm font-medium hover:bg-darker-c transition-colors"
            to="/images"
          >
            <span>{{ $t("nav.see_more") }}</span>
            <UIcon
              name="i-tabler:arrow-right"
              class="text-base"
            />
          </ULink>
        </div>

        <div class="images-row-wrap">
          <div class="images-row">
            <ImageUpload
              class="shrink-0"
              @uploaded="loadImages"
            />
            <ImageItem
              v-for="image in recentImages ?? []"
              :key="image.id"
              class="shrink-0"
              :image="image"
              @update="loadImages"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import type { ResumeListItem, ImageListItem, SlideListItem } from '~/types'

const RECENT_COUNT = 5

const resumeList = ref<ResumeListItem[]>()
const imageList = ref<ImageListItem[]>()
const slideList = ref<SlideListItem[]>()

const recentResumes = computed(() => resumeList.value?.slice(0, RECENT_COUNT))
const recentImages = computed(() => imageList.value?.slice(0, RECENT_COUNT))
const recentSlides = computed(() => slideList.value?.slice(0, RECENT_COUNT))

const loadResumes = async () => {
  resumeList.value = await getResumeList()
}

const loadImages = async () => {
  imageList.value = await getImageList(false)
}

const loadSlides = async () => {
  slideList.value = await getSlideList()
}

onMounted(async () => {
  await Promise.all([loadResumes(), loadImages(), loadSlides()])
})
</script>

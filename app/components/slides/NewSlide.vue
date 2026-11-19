<template>
  <div class="aspect-video w-72">
    <UButton
      type="button"
      variant="ghost"
      class="slide-card slide-card--new group aspect-video size-full"
      :aria-label="$t('slides.new')"
      @click="newAndSwitch"
    >
      <span class="flex flex-col items-center gap-2">
        <UIcon
          name="i-ic:round-plus"
          class="text-4xl text-light-c group-hover:text-brand"
        />
        <span class="text-sm font-medium text-light-c group-hover:text-brand">
          {{ $t("slides.new") }}
        </span>
      </span>
    </UButton>
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()
const localePath = useLocalePath()

const newAndSwitch = async () => {
  const id = await createSlide()
  router.push(localePath(`/slides/${id}`))
}
</script>

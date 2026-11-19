<template>
  <div class="file-options hstack space-x-2">
    <UButton
      variant="outline"
      color="neutral"
      icon="i-ic:baseline-save-as"
      :aria-label="$t('slides.saveas')"
      @click="saveSlidesToLocal"
    >
      {{ $t("slides.saveas") }}
    </UButton>
    <UButton
      variant="outline"
      color="neutral"
      icon="i-ic:round-upload-file"
      :aria-label="$t('slides.restore')"
      @click="() => importSlidesFromLocal(() => $emit('update'))"
    >
      {{ $t("slides.restore") }}
    </UButton>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  (e: 'update'): void
}>()
</script>

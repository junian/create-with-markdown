<template>
  <div
    ref="container"
    class="size-full"
  />
</template>

<script lang="ts" setup>
import { debounce } from 'ts-debounce'
import type * as Monaco from 'monaco-editor'
import { setupMonaco } from '~/libs/monaco'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const container = ref<HTMLDivElement>()
const colorMode = useColorMode()

let editor: Monaco.editor.IStandaloneCodeEditor | undefined
let disposables: Monaco.IDisposable[] = []

const emitChange = debounce(() => {
  emit('update:modelValue', editor?.getValue() ?? '')
}, 150)

onMounted(async () => {
  if (!container.value) return

  const { monaco } = await setupMonaco()

  monaco.editor.defineTheme('vs-dark-dimmed', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.lineHighlightBorder': '#2a2d2e',
      'dropdown.background': '#252526',
      'menu.separatorBackground': '#454545',
    },
  })

  monaco.editor.setTheme(colorMode.value === 'dark' ? 'vs-dark-dimmed' : 'vs')

  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: 'markdown',
    wordWrap: 'on',
    fontSize: 13,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    lineHeight: 1.5,
    automaticLayout: true,
    lineNumbers: getEditorLineNumbersEnabled() ? 'on' : 'off',
    minimap: { enabled: getEditorMinimapEnabled() },
  })

  disposables.push(editor)
  disposables.push(editor.onDidChangeModelContent(() => emitChange()))

  const updateMinimap = (event: Event) => {
    editor?.updateOptions({
      minimap: { enabled: (event as CustomEvent<boolean>).detail },
    })
  }
  const updateLineNumbers = (event: Event) => {
    editor?.updateOptions({
      lineNumbers: (event as CustomEvent<boolean>).detail ? 'on' : 'off',
    })
  }

  window.addEventListener(EDITOR_MINIMAP_CHANGE_EVENT, updateMinimap)
  window.addEventListener(EDITOR_LINE_NUMBERS_CHANGE_EVENT, updateLineNumbers)

  disposables.push({
    dispose: () => {
      window.removeEventListener(EDITOR_MINIMAP_CHANGE_EVENT, updateMinimap)
      window.removeEventListener(EDITOR_LINE_NUMBERS_CHANGE_EVENT, updateLineNumbers)
    },
  })
})

watch(
  () => colorMode.value,
  (value) => {
    const monaco = window.monaco
    if (monaco) monaco.editor.setTheme(value === 'dark' ? 'vs-dark-dimmed' : 'vs')
  },
)

onBeforeUnmount(() => {
  emitChange.cancel?.()
  disposables.forEach(disposable => disposable.dispose())
  disposables = []
  editor = undefined
})
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getDocsPageByPath } from '@/content/docs'
import DocsMarkdownRenderer from '@/components/DocsMarkdownRenderer.vue'

const route = useRoute()
const currentPage = computed(() => getDocsPageByPath(route.path))
</script>

<template>
  <main class="docs-page">
    <DocsMarkdownRenderer :aria-label="currentPage.title" :blocks="currentPage.blocks" />
  </main>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { CodeBlock } from '@codemonster-ru/vue-codeblock'
import type { DocsContentBlock } from '@/content/docs'

defineProps<{
  blocks: DocsContentBlock[]
}>()

const attrs = useAttrs()
</script>

<template>
  <article class="docs-content vf-prose" v-bind="attrs">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <component :is="`h${block.depth}`" v-if="block.type === 'heading'" :id="block.id">
        <!-- eslint-disable vue/no-v-html -->
        <span v-html="block.html" />
        <!-- eslint-enable vue/no-v-html -->
      </component>

      <p v-else-if="block.type === 'paragraph'">
        <!-- eslint-disable vue/no-v-html -->
        <span v-html="block.html" />
        <!-- eslint-enable vue/no-v-html -->
      </p>

      <CodeBlock
        v-else-if="block.type === 'code'"
        :code="block.code"
        :language="block.language"
        theme="inherit"
      />

      <ol v-else-if="block.type === 'list' && block.ordered">
        <!-- eslint-disable vue/no-v-html -->
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex" v-html="item" />
        <!-- eslint-enable vue/no-v-html -->
      </ol>

      <ul v-else-if="block.type === 'list'">
        <!-- eslint-disable vue/no-v-html -->
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex" v-html="item" />
        <!-- eslint-enable vue/no-v-html -->
      </ul>

      <blockquote v-else-if="block.type === 'blockquote'">
        <!-- eslint-disable vue/no-v-html -->
        <div v-html="block.html" />
        <!-- eslint-enable vue/no-v-html -->
      </blockquote>

      <!-- eslint-disable vue/no-v-html -->
      <div v-else v-html="block.html" />
      <!-- eslint-enable vue/no-v-html -->
    </template>
  </article>
</template>

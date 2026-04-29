<script setup lang="ts">
import { useAttrs } from 'vue'
import { CodeBlock } from '@codemonster-ru/vue-codeblock'
import { VfTable } from '@codemonster-ru/vueforge-core'
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

      <VfTable v-else-if="block.type === 'table'" striped>
        <template #header>
          <tr>
            <!-- eslint-disable vue/no-v-html -->
            <th
              v-for="(cell, cellIndex) in block.header"
              :key="cellIndex"
              :style="{ textAlign: block.align[cellIndex] ?? undefined }"
              v-html="cell"
            />
            <!-- eslint-enable vue/no-v-html -->
          </tr>
        </template>

        <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
          <!-- eslint-disable vue/no-v-html -->
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :style="{ textAlign: block.align[cellIndex] ?? undefined }"
            v-html="cell"
          />
          <!-- eslint-enable vue/no-v-html -->
        </tr>
      </VfTable>

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

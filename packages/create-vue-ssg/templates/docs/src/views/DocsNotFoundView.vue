<script setup lang="ts">
import { useRouter } from 'vue-router'
import { VfButton } from '@codemonster-ru/vueforge-core'
import { VfErrorLayout } from '@codemonster-ru/vueforge-layouts'
import { docsSite } from '@/content/docs'

const router = useRouter()

function openHome(): void {
  void router.push(docsSite.homeTo ?? '/')
}
</script>

<template>
  <main class="docs-not-found">
    <VfErrorLayout
      class="docs-not-found__error"
      code="404"
      title="Page not found"
      description="The page you requested does not exist or has moved."
      :fill-viewport="false"
      centered
      surface
    >
      <template #actions>
        <VfButton @click="openHome">
          Go to home
        </VfButton>
      </template>
    </VfErrorLayout>
  </main>
</template>

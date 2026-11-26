<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CmButton } from '@codemonster-ru/ui-vue'
import { CmErrorLayout } from '@codemonster-ru/ui-layouts'
import { docsSite } from '@/content/docs'

const router = useRouter()

function openHome(): void {
  void router.push(docsSite.homeTo ?? '/')
}
</script>

<template>
  <main class="docs-not-found">
    <CmErrorLayout
      class="docs-not-found__error"
      code="404"
      title="Page not found"
      description="The page you requested does not exist or has moved."
      :fill-viewport="false"
      centered
      surface
    >
      <template #actions>
        <CmButton @click="openHome">
          Go to home
        </CmButton>
      </template>
    </CmErrorLayout>
  </main>
</template>

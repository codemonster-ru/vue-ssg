<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { VfButton } from '@codemonster-ru/vueforge-core'
import { useBreakpoint } from '@codemonster-ru/vueforge-layouts'
import { docsComponents, docsHome, docsSite } from '@/content/docs'

const router = useRouter()
const isLgUp = useBreakpoint('lg')
const isCompactHomeHero = computed(() => !isLgUp.value)

function hasActionLink(action: { to?: string; href?: string }): boolean {
  return Boolean(action.to || action.href)
}

function openAction(action: { to?: string; href?: string }) {
  if (action.to) {
    void router.push(action.to)
    return
  }

  if (action.href) {
    window.open(action.href, '_blank', 'noreferrer')
  }
}
</script>

<template>
  <component
    :is="docsComponents.Home"
    v-if="docsComponents.Home"
    :site="docsSite"
  />

  <main v-else class="docs-home">
    <section
      class="docs-home__hero"
      :class="{
        'docs-home__hero--gridless': !docsHome.showGrid,
        'docs-home__hero--compact': isCompactHomeHero
      }"
    >
      <div class="docs-home__hero-copy">
        <h1>{{ docsHome.title }}</h1>
        <p>{{ docsHome.description }}</p>
      </div>

      <div class="docs-home__actions" :class="{ 'docs-home__actions--compact': isCompactHomeHero }">
        <VfButton
          v-if="docsHome.primaryAction.label && hasActionLink(docsHome.primaryAction)"
          @click="openAction(docsHome.primaryAction)"
        >
          {{ docsHome.primaryAction.label }}
        </VfButton>
        <VfButton
          v-if="docsHome.secondaryAction.label && hasActionLink(docsHome.secondaryAction)"
          variant="secondary"
          @click="openAction(docsHome.secondaryAction)"
        >
          {{ docsHome.secondaryAction.label }}
        </VfButton>
      </div>
    </section>
  </main>
</template>

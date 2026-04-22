<template>
  <RouterView />
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const siteTitle = '__PROJECT_NAME__'

const pageTitle = computed(() => {
  if (route.path === '/') {
    return siteTitle
  }

  const routeTitle = typeof route.meta.title === 'string' && route.meta.title.trim()
    ? route.meta.title
    : 'Page'

  return `${routeTitle} | ${siteTitle}`
})

watchEffect(() => {
  if (typeof document === 'undefined') {
    return
  }

  document.title = pageTitle.value
})
</script>

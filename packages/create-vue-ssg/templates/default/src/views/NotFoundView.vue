<template>
  <main class="not-found">
    <h1>404</h1>
    <p>Page not found.</p>
    <a href="/">Go home</a>
  </main>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  text-align: center;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

h1,
p {
  margin: 0;
}
</style>

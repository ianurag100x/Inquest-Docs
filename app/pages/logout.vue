<script setup lang="ts">
definePageMeta({
  layout: false,
});

onMounted(async () => {
  await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  await navigateTo("/login");
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-default">
    <p class="text-sm text-muted">Signing out…</p>
  </div>
</template>

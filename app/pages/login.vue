<script setup lang="ts">
definePageMeta({
  layout: false,
});

useSeoMeta({
  title: "Sign in",
  description: "Faction-gated documentation access",
});

const route = useRoute();
const apiKey = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function handleSubmit() {
  if (!apiKey.value.trim()) {
    errorMessage.value = "Please enter your Torn API key.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: { apiKey: apiKey.value.trim() },
    });

    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await navigateTo(redirect);
  } catch (err: any) {
    errorMessage.value =
      err?.data?.statusMessage ||
      err?.statusMessage ||
      "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-default px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex flex-col items-center gap-2 text-center">
          <UIcon name="i-lucide-shield-check" class="size-8 text-primary" />
          <h1 class="text-lg font-semibold">Faction Access Required</h1>
          <p class="text-sm text-muted">
            Sign in with your Torn API key to view this documentation.
          </p>
        </div>
      </template>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <UFormField
          label="Torn API Key"
          help="A Limited or Minimal access key is enough — we only read your faction membership and never store the key."
        >
          <UInput
            v-model="apiKey"
            type="password"
            placeholder="Paste your Torn API key"
            icon="i-lucide-key-round"
            autocomplete="off"
            class="w-full"
            :disabled="loading"
          />
        </UFormField>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="errorMessage"
        />

        <UButton type="submit" block size="lg" :loading="loading">
          Verify & Continue
        </UButton>
      </form>

      <template #footer>
        <p class="text-xs text-muted text-center">
          Don't have a key? Get one from
          <NuxtLink
            to="https://www.torn.com/preferences.php#tab=api"
            target="_blank"
            class="text-primary underline"
          >
            Torn &rarr; Settings &rarr; API
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

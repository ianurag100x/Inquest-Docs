<script setup lang="ts">
const { data, pending, refresh } = await useFetch("/api/content/hof");

const cards = computed(() => {
  if (!data.value) return [];

  return [
    {
      title: "Faction Rank",
      value: `#${data.value.rankPosition}`,
      subtitle: `HOF Ranking`,
      icon: "i-lucide-circle-star",
    },
    {
      title: "Total Respect",
      value: data.value.totalRespect.toLocaleString(),
      subtitle: `#${data.value.respectRank} Respect Rank`,
      icon: "i-lucide-gem",
    },
    {
      title: "Best Chain",
      value: data.value.rankTier,
      subtitle: `Current Rank`,
      icon: "i-lucide-trophy",
    },
  ];
});
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <UCard
      v-for="card in cards"
      :key="card.title"
      class="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-muted">
            {{ card.title }}
          </span>

          <UIcon
            :name="card.icon"
            class="size-5 text-primary transition-transform group-hover:scale-110"
          />
        </div>
      </template>

      <div class="space-y-2">
        <div class="text-3xl font-bold tracking-tight">
          {{ card.value }}
        </div>

        <div class="text-sm text-muted">
          {{ card.subtitle }}
        </div>
      </div>
    </UCard>
  </div>
</template>

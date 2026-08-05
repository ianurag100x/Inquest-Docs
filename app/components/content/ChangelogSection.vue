const appConfig = useAppConfig(); console.log(appConfig);

<script setup lang="ts">
import { changelog } from "~/data/changelog";

const badge = {
  major: {
    label: "Major",
    color: "primary",
  },

  minor: {
    label: "Minor",
    color: "success",
  },

  patch: {
    label: "Patch",
    color: "neutral",
  },
};

const sections = [
  {
    key: "features",
    title: "Features",
    icon: "i-lucide-sparkles",
  },
  {
    key: "improvements",
    title: "Improvements",
    icon: "i-lucide-rocket",
  },
  {
    key: "fixes",
    title: "Bug Fixes",
    icon: "i-lucide-bug",
  },
  {
    key: "security",
    title: "Security",
    icon: "i-lucide-shield-check",
  },
  {
    key: "breaking",
    title: "Breaking Changes",
    icon: "i-lucide-triangle-alert",
  },
];
</script>

<template>
  <div class="space-y-10">
    <UCollapsible
      v-for="release in changelog"
      :key="release.version"
      class="rounded-xl border border-default mb-6"
    >
      <template #default="{ open }">
        <button class="flex w-full items-center justify-between p-6 text-left">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-bold">
                {{ release.version }}
              </h2>

              <UBadge
                :label="badge[release.type].label"
                :color="badge[release.type].color"
                variant="soft"
              />
            </div>

            <p class="mt-1 text-sm text-muted">
              Released {{ release.released }}
            </p>
          </div>

          <UIcon
            name="i-lucide-chevron-down"
            class="transition-transform duration-200"
            :class="{ 'rotate-180': open }"
          />
        </button>
      </template>

      <template #content>
        <div class="border-t border-default p-6">
          <p class="mb-8 leading-7 text-muted">
            {{ release.summary }}
          </p>

          <div class="space-y-8">
            <template v-for="section in sections" :key="section.key">
              <div v-if="release[section.key]?.length">
                <div class="mb-3 flex items-center gap-2">
                  <UIcon :name="section.icon" class="size-5" />

                  <h3 class="font-semibold">
                    {{ section.title }}
                  </h3>
                </div>

                <ul class="space-y-2">
                  <li
                    v-for="item in release[section.key]"
                    :key="item"
                    class="flex gap-3"
                  >
                    <UIcon
                      name="i-lucide-check"
                      class="mt-1 size-4 text-primary"
                    />

                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </template>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

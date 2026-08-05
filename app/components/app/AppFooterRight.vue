<script setup lang="ts">
const { forced: forcedColorMode } = useDocusColorMode();

const appConfig = useAppConfig();

interface FooterLink {
  icon: string;
  to: string;
  target: "_blank";
  "aria-label": string;
}

const links = computed<FooterLink[]>(() => {
  return Object.entries(appConfig.socials || {}).flatMap(([key, url]) => {
    if (typeof url !== "string" || !url) {
      return [];
    }

    return [
      {
        icon: `i-simple-icons-${key}`,
        to: url,
        target: "_blank" as const,
        "aria-label": `${key} social link`,
      },
    ];
  });
});
</script>

<template>
  <template v-if="links.length">
    <UButton
      v-for="(link, index) in links"
      :key="index"
      size="sm"
      v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
    />
  </template>

  <UColorModeButton v-if="!forcedColorMode" />
</template>

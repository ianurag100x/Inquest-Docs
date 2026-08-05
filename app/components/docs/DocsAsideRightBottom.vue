<script setup lang="ts">
function handleContactAlert() {
  alert("Contact XYZ in Torn or discord to update.")
}
</script>

<template>
  <div class="space-y-3 pt-4 border-t border-dashed border-neutral-800">
    <div class="flex flex-col gap-1 text-xs">
      <UButton
        variant="link"
        color="neutral"
        icon="i-lucide-lightbulb"
        class="justify-start p-0 h-auto text-muted hover:text-white"
        :ui="{ leadingIcon: 'size-3.5' }"
        @click="handleContactAlert"
      >
        Add a suggestion
      </UButton>

      <UButton
        variant="link"
        color="neutral"
        icon="i-lucide-alert-triangle"
        class="justify-start p-0 h-auto text-muted hover:text-white"
        :ui="{ leadingIcon: 'size-3.5' }"
        @click="handleContactAlert"
      >
        Report an issue
      </UButton>
    </div>
  </div>
</template>

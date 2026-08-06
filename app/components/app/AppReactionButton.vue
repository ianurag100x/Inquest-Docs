<script setup lang="ts">
const { data: sessionData } = await useFetch("/api/auth/session");
const { data: reactionData, refresh: refreshReactions } = await useFetch("/api/reactions");

const isExpanded = ref(false);
const nameInput = ref("");
const loading = ref(false);
const submitted = ref(false);
const errorMessage = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

// Pre-fill name if authenticated
watch(
  () => sessionData.value?.user?.n,
  (userName) => {
    if (userName && !nameInput.value) {
      nameInput.value = userName;
    }
  },
  { immediate: true },
);

const count = computed(() => reactionData.value?.count ?? 0);
const hasReacted = computed(() => Boolean(reactionData.value?.hasReacted) || submitted.value);

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    errorMessage.value = "";
    if (!hasReacted.value) {
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
}

async function submitReaction() {
  if (hasReacted.value) {
    isExpanded.value = false;
    return;
  }

  const trimmed = nameInput.value.trim();
  if (!trimmed) {
    errorMessage.value = "Name required";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await $fetch<{
      success: boolean;
      count: number;
      alreadyReacted?: boolean;
      hasReacted?: boolean;
    }>("/api/reactions", {
      method: "POST",
      body: {
        name: trimmed,
      },
    });

    if (res?.success) {
      submitted.value = true;
      await refreshReactions();
      setTimeout(() => {
        isExpanded.value = false;
      }, 1500);
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || "Error saving reaction";
  } finally {
    loading.value = false;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    submitReaction();
  } else if (e.key === "Escape") {
    isExpanded.value = false;
  }
}
</script>

<template>
  <div class="relative flex items-center">
    <!-- Collapsed View: Compact Purple Pill Button -->
    <button
      v-if="!isExpanded"
      type="button"
      :class="[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer select-none border',
        hasReacted
          ? 'bg-violet-500/25 text-violet-600 dark:text-violet-300 border-violet-500/60 ring-1 ring-violet-500/40 font-bold shadow-sm'
          : 'bg-violet-500/10 hover:bg-violet-500/20 dark:bg-violet-500/20 dark:hover:bg-violet-500/30 text-violet-600 dark:text-violet-300 border-violet-500/30 dark:border-violet-500/40'
      ]"
      :title="hasReacted ? 'You have reacted 💜' : 'Click to react & leave your name'"
      @click="toggleExpand"
    >
      <span class="text-sm">💜</span>
      <span>{{ count }}</span>
      <span v-if="hasReacted" class="text-[10px] opacity-80 font-normal ml-0.5">(Reacted)</span>
    </button>

    <!-- Expanded View: Inline Bar (Themed for Light & Dark Mode) -->
    <div
      v-else
      class="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-violet-500/50 shadow-md dark:shadow-violet-950/40 rounded-full px-2.5 py-1 animate-in fade-in zoom-in-95 duration-150"
    >
      <span class="text-sm select-none">💜</span>

      <!-- State 1: User Has Already Reacted -->
      <div v-if="hasReacted" class="flex items-center gap-1.5 text-xs text-neutral-800 dark:text-neutral-200">
        <span class="font-medium text-violet-600 dark:text-violet-400">
          {{ nameInput || 'You' }}
        </span>
        <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-emerald-500" />
          Reacted
        </span>
      </div>

      <!-- State 2: User Has Not Reacted Yet -->
      <template v-else>
        <div class="relative flex items-center">
          <input
            ref="inputRef"
            v-model="nameInput"
            type="text"
            placeholder="Your name..."
            class="w-28 sm:w-36 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none px-1 py-0.5"
            :disabled="loading || submitted"
            @keydown="handleKeydown"
          />

          <span v-if="errorMessage" class="text-[10px] text-rose-500 dark:text-rose-400 font-medium absolute -bottom-4 left-1 whitespace-nowrap">
            {{ errorMessage }}
          </span>
        </div>

        <button
          v-if="!submitted"
          type="button"
          class="inline-flex items-center justify-center p-1 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
          :disabled="loading"
          title="Submit Reaction"
          @click="submitReaction"
        >
          <UIcon v-if="loading" name="i-lucide-loader-2" class="size-3.5 animate-spin" />
          <UIcon v-else name="i-lucide-check" class="size-3.5" />
        </button>

        <span v-else class="text-[10px] text-violet-600 dark:text-violet-400 font-semibold px-1">
          Thanks!
        </span>
      </template>

      <!-- Close Button -->
      <button
        type="button"
        class="inline-flex items-center justify-center p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer ml-0.5"
        title="Close"
        @click="isExpanded = false"
      >
        <UIcon name="i-lucide-x" class="size-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, refresh } = await useFetch("/api/auth/session");

const loading = ref(false);

const session = computed(() => data.value?.user);

const initials = computed(() => {
  if (!session.value?.n) return "?";

  return session.value.n
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
});

async function logout() {
  loading.value = true;

  try {
    await $fetch("/api/auth/logout", {
      method: "POST",
    });

    await refresh();

    await navigateTo("/login");
  } finally {
    loading.value = false;
  }
}

const items = computed(() => [
  [
    {
      label: session.value?.n ?? "",
      icon: "i-lucide-user",
      disabled: true,
    },
    {
      label: session.value?.fn ?? "",
      icon: "i-lucide-shield",
      disabled: true,
    },
    {
      label: session.value?.p ?? "",
      icon: "i-lucide-badge-check",
      disabled: true,
    },
  ],

  [
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      onSelect: logout,
    },
  ],
]);
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton color="neutral" variant="ghost" class="gap-2">
      <UAvatar :text="initials" size="sm" />

      <div class="hidden lg:flex flex-col items-start leading-tight">
        <span class="text-xs font-semibold">
          {{ session?.n }}
        </span>

        <span class="text-[10px] text-muted">
          {{ session?.p }}
        </span>
      </div>
    </UButton>
  </UDropdownMenu>
</template>


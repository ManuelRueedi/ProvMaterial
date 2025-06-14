<template>
  <div class="language-switcher">
    <UButton
      v-for="lang in languages"
      :key="lang.code"
      :variant="currentLanguage === lang.code ? 'solid' : 'ghost'"
      :color="currentLanguage === lang.code ? 'primary' : 'neutral'"
      size="sm"
      @click="switchLanguage(lang.code)"
    >
      <UIcon :name="lang.flag" class="mr-2" />
      {{ lang.name }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
interface Language {
  code: string;
  name: string;
  flag: string;
  file: string;
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    flag: "emojione:flag-for-united-kingdom",
    file: "README.md",
  },
  {
    code: "de",
    name: "Deutsch",
    flag: "emojione:flag-for-germany",
    file: "README.de.md",
  },
];

const currentLanguage = ref("en");

// Detect current language from current file path or URL
onMounted(() => {
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (currentPath.includes("README.de.md") || currentPath.includes(".de.")) {
      currentLanguage.value = "de";
    }
  }
});

const switchLanguage = (langCode: string) => {
  const targetLanguage = languages.find((lang) => lang.code === langCode);
  if (targetLanguage && typeof window !== "undefined") {
    const baseUrl =
      window.location.origin +
      window.location.pathname.replace(/\/[^/]*$/, "/");
    window.location.href = baseUrl + targetLanguage.file;
  }
};
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}
</style>

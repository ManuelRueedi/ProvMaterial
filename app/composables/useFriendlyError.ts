import type { H3Error } from "h3";
import type { Toast } from "@nuxt/ui/runtime/composables/useToast.js";

export const errorMap = (err: unknown): Partial<Toast> => {
  const h3 = err as Partial<H3Error>;

  switch (h3.statusCode) {
    case 400:
      return {
        title: "Ungültige Anfrage",
        description:
          h3.statusMessage || "Die Anfrage konnte nicht verarbeitet werden.",
        color: "warning",
        icon: "ph:warning-circle",
      };
    case 401:
      return {
        title: "Nichts gefunden",
        description: "Keinen Account gefunden.",
        color: "error",
        icon: "ph:magnifying-glass",
      };
    case 404:
      return {
        title: "Nichts gefunden",
        description:
          h3.statusMessage || "Keine Artikel zu deinen Filtern gefunden.",
        color: "warning",
        icon: "ph:magnifying-glass",
      };
    case 409:
      return {
        title: "Konflikt",
        description:
          h3.statusMessage ||
          "Die Aktion konnte aufgrund eines Konflikts nicht ausgeführt werden.",
        color: "warning",
        icon: "ph:warning-octagon",
      };
    case 500:
      return {
        title: "Server-Problem",
        description: "Nicht erreichbar. Bitte versuch es später erneut.",
        color: "error",
        icon: "ph:warning-circle",
      };
    case 502:
      return {
        title: "Kein Benutzer",
        description: "Der Benutzer wude nicht gefnden",
        color: "error",
        icon: "ph:warning-circle",
      };
  }

  if (err instanceof TypeError) {
    return {
      title: "Verbindung unterbrochen",
      description: "Prüf deine Internetverbindung und versuche es erneut.",
      color: "error",
      icon: "ph:wifi-slash",
    };
  }

  return {
    title: "Unbekannter Fehler",
    description: "Etwas ist schiefgelaufen. Bitte noch einmal versuchen.",
    color: "error",
    icon: "ph:warning-circle",
  };
};

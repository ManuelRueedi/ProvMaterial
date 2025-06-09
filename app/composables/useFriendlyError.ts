import type { H3Error } from "h3";
import type { Toast } from "@nuxt/ui/runtime/composables/useToast.js";

export const errorMap = (err: unknown): Partial<Toast> => {
  const h3 = err as Partial<H3Error>;

  // Handle fetch/network errors
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return {
      title: "Verbindungsproblem",
      description: "Keine Internetverbindung oder Server nicht erreichbar.",
      color: "error",
      icon: "ph:wifi-slash",
    };
  } // Handle auth-specific errors
  if (h3.statusCode === 401) {
    // Check for specific auth error messages
    if (h3.statusMessage?.includes("Credential not found")) {
      return {
        title: "Passkey nicht gefunden",
        description:
          "Der verwendete Passkey wurde nicht gefunden. Bitte versuchen Sie es mit einem anderen Passkey oder melden Sie sich mit Microsoft an.",
        color: "error",
        icon: "ph:key",
      };
    }

    if (h3.statusMessage?.includes("Invalid test password")) {
      return {
        title: "Falsches Test-Passwort",
        description: "Das eingegebene Test-Passwort ist nicht korrekt.",
        color: "error",
        icon: "ph:key",
      };
    }

    if (
      h3.statusMessage?.includes("Session expired") ||
      h3.statusMessage?.includes("session expired")
    ) {
      return {
        title: "Sitzung abgelaufen",
        description:
          "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
        color: "warning",
        icon: "ph:clock",
      };
    }

    return {
      title: "Authentifizierung fehlgeschlagen",
      description:
        "Ihre Anmeldedaten sind ungültig oder abgelaufen. Bitte melden Sie sich erneut an.",
      color: "error",
      icon: "ph:sign-in",
    };
  }

  // Handle specific status codes
  switch (h3.statusCode) {
    case 400:
      if (h3.statusMessage?.includes("Incomplete user data from Microsoft")) {
        return {
          title: "Unvollständige Microsoft-Daten",
          description:
            "Microsoft hat nicht alle erforderlichen Benutzerdaten bereitgestellt. Bitte versuchen Sie es erneut.",
          color: "error",
          icon: "ph:user-x",
        };
      }

      return {
        title: "Ungültige Anfrage",
        description:
          h3.statusMessage || "Die Anfrage konnte nicht verarbeitet werden.",
        color: "warning",
        icon: "ph:warning-circle",
      };
    case 403:
      if (h3.statusMessage?.includes("Test login is not enabled")) {
        return {
          title: "Test-Anmeldung deaktiviert",
          description:
            "Die Test-Anmeldung ist in der aktuellen Umgebung nicht verfügbar.",
          color: "warning",
          icon: "ph:prohibit",
        };
      }

      if (
        h3.statusMessage?.includes("Authenticated user email does not match")
      ) {
        return {
          title: "E-Mail-Adresse stimmt nicht überein",
          description:
            "Die E-Mail-Adresse stimmt nicht mit dem angemeldeten Benutzer überein.",
          color: "error",
          icon: "ph:envelope-x",
        };
      }

      return {
        title: "Zugriff verweigert",
        description:
          h3.statusMessage || "Sie haben keine Berechtigung für diese Aktion.",
        color: "error",
        icon: "ph:prohibit",
      };
    case 404:
      return {
        title: "Nicht gefunden",
        description:
          h3.statusMessage || "Der gesuchte Inhalt wurde nicht gefunden.",
        color: "warning",
        icon: "ph:magnifying-glass",
      };
    case 405:
      if (h3.statusMessage?.includes("WebAuthn challenge")) {
        return {
          title: "WebAuthn-Challenge abgelaufen",
          description:
            "Die WebAuthn-Challenge ist abgelaufen. Bitte versuchen Sie es erneut.",
          color: "warning",
          icon: "ph:clock",
        };
      }
      return {
        title: "Methode nicht erlaubt",
        description: h3.statusMessage || "Diese Aktion ist nicht erlaubt.",
        color: "warning",
        icon: "ph:prohibit",
      };
    case 408:
      return {
        title: "Zeitüberschreitung",
        description:
          "Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.",
        color: "warning",
        icon: "ph:clock",
      };
    case 409:
      if (h3.statusMessage?.includes("WebAuthn credential")) {
        return {
          title: "Passkey bereits registriert",
          description: "Für dieses Konto ist bereits ein Passkey registriert.",
          color: "warning",
          icon: "ph:key",
        };
      }
      return {
        title: "Konflikt",
        description:
          h3.statusMessage ||
          "Die Aktion konnte aufgrund eines Konflikts nicht ausgeführt werden.",
        color: "warning",
        icon: "ph:warning-octagon",
      };
    case 429:
      return {
        title: "Zu viele Anfragen",
        description:
          "Sie haben zu viele Anmeldeversuche unternommen. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
        color: "warning",
        icon: "ph:clock",
      };
    case 500:
      if (h3.statusMessage?.includes("Failed to create or retrieve user")) {
        return {
          title: "Benutzererstellung fehlgeschlagen",
          description:
            "Der Benutzer konnte nicht erstellt oder abgerufen werden. Bitte versuchen Sie es erneut.",
          color: "error",
          icon: "ph:user-x",
        };
      }

      if (h3.statusMessage?.includes("Internal authentication error")) {
        return {
          title: "Authentifizierungsfehler",
          description:
            "Ein interner Fehler ist bei der Anmeldung aufgetreten. Bitte versuchen Sie es später erneut.",
          color: "error",
          icon: "ph:warning-circle",
        };
      }

      return {
        title: "Server-Problem",
        description:
          "Ein interner Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        color: "error",
        icon: "ph:warning-circle",
      };
    case 502:
      return {
        title: "Benutzer nicht gefunden",
        description: "Der Benutzer wurde nicht in der Datenbank gefunden.",
        color: "error",
        icon: "ph:user-x",
      };
    case 503:
      return {
        title: "Service nicht verfügbar",
        description:
          "Der Service ist temporär nicht verfügbar. Bitte versuchen Sie es später erneut.",
        color: "error",
        icon: "ph:warning-circle",
      };
    case 504:
      return {
        title: "Zeitüberschreitung",
        description:
          "Der Server hat nicht rechtzeitig geantwortet. Bitte versuchen Sie es erneut.",
        color: "error",
        icon: "ph:clock",
      };
  }

  // Handle WebAuthn specific errors
  if (err && typeof err === "object" && "name" in err) {
    const errorName = (err as { name: string }).name;

    if (errorName === "NotAllowedError") {
      return {
        title: "WebAuthn nicht erlaubt",
        description:
          "Die WebAuthn-Authentifizierung wurde vom Benutzer abgebrochen oder vom Browser blockiert.",
        color: "warning",
        icon: "ph:hand-palm",
      };
    }

    if (errorName === "InvalidStateError") {
      return {
        title: "WebAuthn-Fehler",
        description:
          "Ein WebAuthn-Authenticator ist bereits für diese Website registriert.",
        color: "warning",
        icon: "ph:key",
      };
    }

    if (errorName === "NotSupportedError") {
      return {
        title: "WebAuthn nicht unterstützt",
        description: "Ihr Browser oder Gerät unterstützt WebAuthn nicht.",
        color: "error",
        icon: "ph:browser",
      };
    }
  }

  // Handle general network/connection errors
  if (err instanceof TypeError) {
    return {
      title: "Verbindung unterbrochen",
      description:
        "Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
      color: "error",
      icon: "ph:wifi-slash",
    };
  }

  // Default fallback error
  return {
    title: "Unbekannter Fehler",
    description: "Etwas ist schiefgelaufen. Bitte noch einmal versuchen.",
    color: "error",
    icon: "ph:warning-circle",
  };
};

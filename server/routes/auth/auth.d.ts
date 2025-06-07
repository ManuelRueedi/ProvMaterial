import type { Rights } from "@/composables/articles/types";

declare module "#auth-utils" {
  interface User {
    userId: number;
    firstName: string;
    lastName: string;
    mail: string;
    jobtitle: string;
    hasWebauthn: boolean;
    loggedInAt: number;
  }

  interface UserSession {
    rights: Rights;
  }

  interface SecureSessionData {
    microsoftId: string;
    webauthnId: string;
  }
}

export {};

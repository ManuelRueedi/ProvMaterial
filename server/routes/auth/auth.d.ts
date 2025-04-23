declare module "#auth-utils" {
  interface User {
    userId: string;
    firstName: string;
    lastName: string;
    mail: string;
    jobtitle: string;
    hasWebauthn: boolean;
  }

  interface UserRights {
    rights: string[];
  }

  interface SecureSessionData {
    microsoftID: string;
    webauthnID: string;
  }
}

export {};

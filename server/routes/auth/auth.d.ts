declare module "#auth-utils" {
  interface User {
    userId: string;
    firstName: string;
    lastName: string;
    mail: string;
    jobtitle: string;
    hasWebauthn: boolean;
    loggedInAt: number;
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

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
    rights: {
      useArticles: boolean;
      editArticles: boolean;
      addArticles: boolean;
      removeArticles: boolean;
    };
  }

  interface SecureSessionData {
    microsoftId: string;
    webauthnId: string;
  }
}

export {};

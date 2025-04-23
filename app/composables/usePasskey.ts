/**
 * Centralises all passkey‑related actions and user‑session helpers.
 */
export const usePasskey = () => {
  /* User‑session utilities */
  const {
    loggedIn,
    user,
    clear: logout,
    openInPopup,
    fetch: fetchUserSession,
  } = useUserSession();

  /* WebAuthn helpers */
  const { register, authenticate } = useWebAuthn({
    registerEndpoint: "/auth/register",
    authenticateEndpoint: "/auth/authenticate",
  });

  /** Register a new WebAuthn credential (aka passkey) */
  const signUp = async () => {
    try {
      if (user.value) {
        await register({ userName: user.value.mail });
        await fetchUserSession();
      }
    } catch (err: any) {
      console.error("❌ Registration failed:", err.message);
    }
  };

  /** Sign in with an existing WebAuthn credential */
  const signIn = async () => {
    try {
      await authenticate();
      await fetchUserSession();
    } catch (err: any) {
      console.error("❌ Authenticate failed:", err.message);
    }
  };

  /** Remove the current user’s WebAuthn key */
  const deleteKey = async () => {
    try {
      await $fetch<{ message: string }>("/auth/removeKey", {
        method: "DELETE",
      });
      await fetchUserSession();
    } catch (err: any) {
      console.error("❌ Delete key failed:", err.message);
    }
  };

  return {
    /* state */ loggedIn,
    user,
    /* auth helpers */ signUp,
    signIn,
    deleteKey,
    /* misc */ logout,
    openInPopup,
  };
};

/**
 * Centralises passkey actions and device‑aware Microsoft login.
 */
export const usePasskey = () => {
  /* User‑session helpers */
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

  const { isDesktop } = useDevice();

  /** Microsoft login – popup on desktop, redirect on mobile */
  const loginWithMicrosoft = () => {
    const url = "/auth/microsoft";
    if (isDesktop) {
      openInPopup(url);
    } else {
      window.location.href = url;
    }
  };

  /** Register a new passkey */
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

  /** Sign in with an existing passkey */
  const signIn = async () => {
    try {
      await authenticate();
      await fetchUserSession();
    } catch (err: any) {
      console.error("❌ Authenticate failed:", err.message);
    }
  };

  /** Remove the user’s passkey */
  const deleteKey = async () => {
    try {
      const { message } = await $fetch<{ message: string }>("/auth/removeKey", {
        method: "DELETE",
      });
      await fetchUserSession();
      console.log(message);
    } catch (err: any) {
      console.error("❌ Delete key failed:", err.message);
    }
  };

  return {
    /* state */ loggedIn,
    user,
    isDesktop,
    /* auth helpers */ signUp,
    signIn,
    deleteKey,
    loginWithMicrosoft,
    /* misc */ logout,
  };
};

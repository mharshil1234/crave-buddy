import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

export const signInWithGoogle = async () => {
    await authClient.signIn.social({
        provider: "google",
    });
};
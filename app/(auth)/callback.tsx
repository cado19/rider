import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../../util/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Listen for deep link events
    const subscription = Linking.addEventListener("url", async ({ url }) => {
      const { queryParams } = Linking.parse(url);

      if (queryParams?.access_token && queryParams?.refresh_token) {
        try {
          // ✅ Restore Supabase session
          const { error } = await supabase.auth.setSession({
            access_token: queryParams.access_token as string,
            refresh_token: queryParams.refresh_token as string,
          });

          if (error) {
            console.error("Error setting session:", error.message);
          } else {
            // Redirect to home after successful confirmation
            router.replace("/(tabs)/home");
          }
        } catch (err) {
          console.error("Callback error:", err);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  return null; // nothing visible, just handles redirect
}
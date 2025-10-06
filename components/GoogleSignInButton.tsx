// this component is the signin with google button

import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import React from "react";
import { supabase } from "../util/supabase";
import { router } from "expo-router";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
WebBrowser.maybeCompleteAuthSession();

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, // from Google Console
  offlineAccess: true,
});

const GoogleSignInButton = () => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
    scopes: [
      /* what APIs you want to access on behalf of the user, default is email and profile
    this is just an example, most likely you don't need this option at all! */
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  const redirectUri = AuthSession.makeRedirectUri({
    native: "com.cado19.rider://auth/callback",
  });

  const handleGoogleLogin = async () => {
    // const { data, error } = await supabase.auth.signInWithOAuth({
    //   provider: "google",
    //   options: {
    //     redirectTo: redirectUri,
    //   },
    // });

    // if (error) {
    //   console.error("Google signin error: ", error.message);
    //   Alert.alert("Google signin error: ", error.message);
    // } else {
    //   console.log("Redirecting to Google Oauth...");
    //   router.replace("(tabs)/home");
    // }
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      router.replace("(tabs)/home");
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error) {
        const typedError = error as { code: string; message?: string };

        if (typedError.code === statusCodes.SIGN_IN_CANCELLED) {
          Alert.alert(
            "Sign-In Error",
            typedError.message ?? "Sign-in cancelled."
          );
        } else if (typedError.code === statusCodes.IN_PROGRESS) {
          Alert.alert("Sign-In Error", "Sign-in already in progress.");
        } else if (
          typedError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
        ) {
          Alert.alert("Sign-In Error", "Google Play Services not available.");
        } else {
          Alert.alert("Sign-In Error", typedError.message ?? "Unknown error.");
        }
      } else {
        Alert.alert("Sign-In Error", "Unexpected error occurred.");
      }
    }
  };
  return (
    <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
      <Text style={styles.text}>Sign in with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    backgroundColor: "#428f54",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default GoogleSignInButton;

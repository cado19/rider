import { View, Text } from "react-native";
import React from "react";
import { supabase } from "../util/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loginandCacheProfile(email: string, password: string) {
  const {
    data: { session },
    error: loginError,
  } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError || !session?.user?.id) throw loginError;

  // fetch profile information from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("riders")
    .select("*")
    .eq("id", session.user.id);
  if (profileError) throw profileError;

  await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
  return { session, profile };
}

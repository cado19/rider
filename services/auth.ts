import { View, Text } from "react-native";
import React from "react";
import { supabase } from "../util/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Rider } from "../types/Rider";

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

export const fetchRiderProfile = async (): Promise<Rider | null> => {
  try {
    const profileJson = await AsyncStorage.getItem("userProfile");
    if(!profileJson) return null;
    const profile = JSON.parse(profileJson)
    return Array.isArray(profile) ? profile[0] : profile;
  } catch (error) {
    console.error("Failed to fetch rider profile: ", error);
    return null;
  }
};

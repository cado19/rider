import { View, Text, StyleSheet, Button, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../util/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "../../components/Loader";
import PrimaryButton from "../../components/PrimaryButton";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState();
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // 1. Load cached profile
      const cached = await AsyncStorage.getItem("userProfile");
      if (cached) {
        setProfile(JSON.parse(cached));
      }

      // 2. Fetch email from auth.users table
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      // 3. Fetch fresh profile from supabase
      const { data: riderRow, error: riderError } = await supabase
        .from("riders")
        .select("id, first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();
      if (riderError) throw riderError;

      const mergedProfile = {
        first_name: riderRow?.first_name ?? "",
        last_name: riderRow?.last_name ?? "",
        email: user?.email ?? "",
      };

      setProfile(mergedProfile);
      await AsyncStorage.setItem("userProfile", JSON.stringify(mergedProfile));
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error: ", error.message);
      return;
    }

    router.replace("/(auth)/signin");
  };

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>No profile found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Text style={styles.label}>First Name</Text>
      <Text style={styles.value}>{profile?.first_name}</Text>

      <Text style={styles.label}>Last Name</Text>
      <Text style={styles.value}>{profile?.last_name}</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{profile?.email}</Text>

      <PrimaryButton
        title="Logout"
        onPress={handleLogout}
        style={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "JakartaSemiBold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "JakartaMedium",
    marginTop: 12,
    color: "#374151",
  },
  value: {
    fontSize: 18,
    marginTop: 4,
    color: "#111827",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

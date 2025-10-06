import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../util/supabase";
import { Trip } from "../../types/Trip";

export default function Home() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfileAndTrips = async () => {
    try {
      const profileJson = await AsyncStorage.getItem("userProfile");
      const profile = profileJson ? JSON.parse(profileJson) : null;

      if (profile) {
        const rider = Array.isArray(profile) ? profile[0] : profile;
        setFirstName(rider?.first_name || "");
        const riderId = rider?.id;

        // fetch the trips
        if (riderId) {
          const { data, error } = await supabase
            .from("trips")
            .select("*")
            .eq("rider_id", riderId)
            .order("created_at", { ascending: false })
            .limit(5);
          if (!error) setTrips(data);
        }
      }
    } catch (error) {
      console.error("Error loading profile or trips: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileAndTrips();
  }, []);

  // render item function
  const renderTrip = ({ item }: { item: Trip }) => (
    <View style={styles.tripCard}>
      <Text style={styles.tripTitle}>{item.destination}</Text>
      <Text style={styles.tripDate}>
        {item.started_at
          ? new Date(item.started_at).toLocaleDateString()
          : "Not started"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi {firstName}</Text>

      {/* Search Box  */}
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => router.replace("(root)/trip_request")}
      >
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <Text style={styles.searchPlaceholder}>Where to</Text>
      </TouchableOpacity>

      {/* Recent Rides  */}
      <Text style={styles.sectionTitle}>Recent Rides</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#888"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTrip}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No recent rides</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // paddingTop: 50,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: "#888",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tripCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  tripDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#aaa",
  },
});

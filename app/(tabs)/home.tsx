import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../util/supabase";
import { Trip } from "../../types/Trip";
import TripCard from "../../components/TripCard";
import Loader from "../../components/Loader";

export default function Home() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  async function reverseGeoCode(lat: number, lon: number) {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_WEB;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
    const response = await fetch(url);
    const json = await response.json();
    if (json.status == "OK" && json.results.length > 0) {
      return json.results[0].formatted_address;
    }
    return "Unkown location";
  }

  const loadProfileAndTrips = async () => {
    try {
      const profileJson = await AsyncStorage.getItem("userProfile");
      const profile = profileJson ? JSON.parse(profileJson) : null;

      if (profile) {
        const rider = Array.isArray(profile) ? profile[0] : profile;
        setFirstName(rider?.first_name || "");
        const riderId = rider?.id;
        // console.log("rider id: ", riderId);
        // fetch the trips
        if (riderId) {
          const { data, error } = await supabase
            .from("trips_with_geojson")
            .select("*")
            .eq("rider_id", riderId)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(5);
          if (!error) {
            // setTrips(data);
            console.log(data);

            // Map trips into human readable addresses
            const tripsWithNames = await Promise.all(
              data.map(async (trip) => {
                const [originLon, originLat] = trip.origin.coordinates;
                const [destLon, destLat] = trip.destination.coordinates;

                const originName = await reverseGeoCode(originLat, originLon);
                const destinationName = await reverseGeoCode(destLat, destLon);

                return {
                  ...trip,
                  originName,
                  destinationName,
                };
              })
            );

            setTrips(tripsWithNames);
          }
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

  // Just for checking trips
  useEffect(() => {
    console.log("Trips state updated:", trips);
  }, [trips]);

  // render item function
  const renderTrip = ({ item }: { item: Trip }) => (
    <TripCard
      originName={item.originName}
      destinationName={item.destinationName}
      date={item.started_at}
      fare={item.fare}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
        <Loader message="Loading recent trips"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    // paddingTop: 50,
  },
  greeting: {
    fontFamily: "JakartaBold",
    fontSize: 26,
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
    color: "#111827",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontFamily: "JakartaMedium",
    color: "#6B7280",
    fontSize: 16,
  },
  sectionTitle: {
    fontFamily: "JakartaSemiBold",
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
    color: "#374151"
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#9CA3AF",
  },
});

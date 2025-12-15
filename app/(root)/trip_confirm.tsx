import {
  View,
  Text,
  Alert,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../util/supabase";
import Loader from "../../components/Loader";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const screen = Dimensions.get("window");

export default function trip_confirm() {
  const { tripRequestId } = useLocalSearchParams<{ tripRequestId: string }>();
  const [tripRequest, setTripRequest] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(true); // Loading state for when component data is being fetched before mounting
  const [submitting, setSubmitting] = useState(false); // Loading state for confirm button is clicked.
  const [searching, setSearching] = useState(false); // Loading state for searching for driver.
  const [searchMessage, setSearchMessage] = useState(
    "Searching for a driver..."
  );

  const fetchTripData = async () => {
    try {
      const { data: trip, error: tripError } = await supabase.rpc(
        "get_trip_request_with_coords",
        { request_id: tripRequestId }
      );

      if (tripError) throw tripError;

      // If RPC returns an array, pick the first element
      const tripRow = Array.isArray(trip) ? trip[0] : trip;
      // console.log(tripRow);

      setTripRequest({
        ...tripRow,
        origin: tripRow.origin,
        destination: tripRow.destination,
        origin_lat: parseFloat(tripRow.origin_lat),
        origin_lon: parseFloat(tripRow.origin_lon),
        dest_lat: parseFloat(tripRow.dest_lat),
        dest_lon: parseFloat(tripRow.dest_lon),
        distance_km: parseFloat(tripRow.distance_km),
        estimated_time_min: parseFloat(tripRow.estimated_time_min),
      });
      // console.log(tripRequest);

      const { data: vehicleCategories, error: catError } = await supabase
        .from("vehicle_categories")
        .select("id, name, base_rate");

      if (catError) throw catError;
      setCategories(vehicleCategories);
    } catch (err) {
      console.error("Error loading trip confirm data:", err);
      Alert.alert("Error", "Could not load trip details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripRequestId) {
      fetchTripData();
    }
  }, [tripRequestId]);

  const calculateFare = (baseRate: number) => {
    const distance = tripRequest?.distance_km ?? 0;
    const time = tripRequest?.estimated_time_min ?? 0;
    const extraDistance = Math.max(0, distance - 3);
    return baseRate + extraDistance * 10 + time * 10;
  };

  const handleConfirm = async () => {
    // If there's no selected category exit the function
    if (!selectedCategoryId) {
      Alert.alert("Please select a category");
      return;
    }

    setSubmitting(true);
    setSearching(true);
    setSearchMessage("Searching for a driver...");

    try {
      // console.log(tripRequest);

      //1. update category in trip requests table for this trip
      await supabase
        .from("trip_requests")
        .update({ category_id: selectedCategoryId, status: "pending" })
        .eq("id", tripRequest.id);

      const { data: tripRow, error: tripErr } = await supabase
        .from("trip_requests")
        .select("id, origin, category_id, status")
        .eq("id", tripRequest.id)
        .single();

      // console.log("Trip row before RPC:", tripRow, tripErr);

      // 2. Call RPC to find nearby driver
      const { data: driverMatch, error: driverError } = await supabase.rpc(
        "find_nearby_driver",
        { request_id: tripRequestId }
      );

      if (driverError) {
        console.log("Driver error: ", driverError);
        throw driverError;
      }
      const matchRow = Array.isArray(driverMatch)
        ? driverMatch[0]
        : driverMatch;

      if (!matchRow) {
        Alert.alert("No drivers available nearby");
        return;
      }

      // 3. Create trip row linked to request + driver

      const selectedCategory = categories.find(
        (c) => c.id === selectedCategoryId
      );
      const fare = calculateFare(selectedCategory?.base_rate ?? 0);
      const { error } = await supabase.from("trips").insert({
        rider_id: tripRequest.rider_id,
        driver_id: matchRow.driver_id,
        vehicle_id: matchRow.vehicle_id,
        origin: tripRequest.origin, // keep geography
        destination: tripRequest.destination,
        fare,
        status: "pending",
        trip_request_id: tripRequest.id,
      });

      if (error) throw error;
      // if (trip_update_error) throw trip_update_error;

      setSearchMessage("Trip confirmed, Waiting for driver acceptance...");
      // 4. Subscribe to trip updates
      const tripSubscription = supabase
        .channel("trip-status")
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `trip_request_id=eq.${tripRequest.id}`
        }, (payload) => {
          const updated = payload.new;
          // console.log(updated);

          if(updated.status === "accepted"){
            setSearchMessage("Driver accepted your trip!");

            setTimeout(() => {
              tripSubscription.unsubscribe();
              router.push({
                pathname: "(root)/driver_details",
                params: {tripId: updated.id}
              })
            }, 1500)
          }
        }).subscribe();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not confirm trip");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !tripRequest) {
    return <Loader message="loading" />;
  }

  if (searching) {
    return <Loader message={searchMessage} />;
  }

  // if (tripRequest) {
  //   console.log(tripRequest);
  // }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Map  */}
      {/* Show the map only if latitude and longitude coordinates of trip origin exist. This was for debugging purposes */}
      {tripRequest.origin_lat && tripRequest.origin_lon && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: tripRequest.origin_lat,
            longitude: tripRequest.origin_lon,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          // provider="google"
        >
          <Marker
            coordinate={{
              latitude: tripRequest.origin_lat,
              longitude: tripRequest.origin_lon,
            }}
          />
          <Marker
            coordinate={{
              latitude: tripRequest.dest_lat,
              longitude: tripRequest.dest_lon,
            }}
          />
          <Polyline
            coordinates={[
              {
                latitude: tripRequest.origin_lat,
                longitude: tripRequest.origin_lon,
              },
              {
                latitude: tripRequest.dest_lat,
                longitude: tripRequest.dest_lon,
              },
            ]}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        </MapView>
      )}

      {/* Fare Options  */}
      <Text style={styles.header}>Choose a Ride</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const fare = calculateFare(item.base_rate);
          const isSelected = selectedCategoryId === item.id;

          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => setSelectedCategoryId(item.id)}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.fare}>KES {fare.toFixed(2)}</Text>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />

      {/* Confirm Button */}
      <View style={{ marginBottom: 20 }}>
        <Button
          title={submitting ? "Confirming..." : "Confirm"}
          onPress={handleConfirm}
          disabled={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  map: { width: screen.width, height: screen.height * 0.4 },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "600", marginBottom: 20, marginTop: 20 },
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#e6f0ff",
  },
  name: { fontSize: 18, fontWeight: "500" },
  fare: { fontSize: 18, fontWeight: "600", color: "#007AFF" },
  checkmark: { fontSize: 18, color: "#007AFF", marginLeft: 8 },
});

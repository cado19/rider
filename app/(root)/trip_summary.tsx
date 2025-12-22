import { View, Text, StyleSheet, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Trip } from "../../types/Trip";
import { Driver } from "../../types/Driver";
import { Vehicle } from "../../types/Vehicle";
import { supabase } from "../../util/supabase";
import Loader from "../../components/Loader";
import PrimaryButton from "../../components/PrimaryButton";

export default function trip_summary() {
  const { tripId } = useLocalSearchParams();

  const [trip, setTrip] = useState<Trip>();
  const [driver, setDriver] = useState<Driver>();
  const [vehicle, setVehicle] = useState<Vehicle>();
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchTripSummary = async () => {
    try {
      // 1. Fetch Trip
      const { data: tripRow, error: tripError } = await supabase
        .from("trips_with_geojson")
        .select("*")
        .eq("id", tripId)
        .maybeSingle();

      if (tripError) throw tripError;

      if (!tripRow) {
        console.log("Trip not found yet, retrying...");
        setTimeout(fetchTripSummary, 500);
        return;
      }

      // 2. Reverse geocode origin/destination
      const originName = await reverseGeoCode(
        tripRow.origin.coordinates[1],
        tripRow.origin.coordinates[0]
      );
      const destinationName = await reverseGeoCode(
        tripRow.destination.coordinates[1],
        tripRow.destination.coordinates[0]
      );

      setTrip({ ...tripRow, originName, destinationName });

      //   3. Fetch Driver
      const { data: driverRow, error: driverError } = await supabase
        .from("drivers")
        .select("id, first_name, first_name")
        .eq("id", tripRow.driver_id)
        .maybeSingle();

      if (driverError) throw driverError;
      setDriver(driverRow);

      // 4. Fetch Vehicle
      const { data: vehicleRow, error: vehicleError } = await supabase
        .from("vehicles")
        .select("id, make, model, number_plate")
        .eq("id", tripRow.vehicle_id)
        .maybeSingle();
      if (vehicleError) throw vehicleError;
      setVehicle(vehicleRow);
    } catch (error) {
      console.error("Error fetching trip summary:", error);
      Alert.alert("Error", "Could not load trip summary");
    } finally {
      setLoading(false);
    }
  };

  const goHome = async () => {
    router.push("(tabs)/home")
  }

  useEffect(() => {
    if (tripId) fetchTripSummary();
  }, [tripId]);

  if (loading || !trip) {
    return <Loader message="Loading summary..." />;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Summary</Text>

      <Text style={styles.label}>Origin</Text>
      <Text style={styles.value}>{trip?.originName ?? "Unknown"}</Text>

      <Text style={styles.label}>Destination</Text>
      <Text style={styles.value}>{trip?.destinationName ?? "Unknown"}</Text>

      <Text style={styles.label}>Fare</Text>
      <Text style={styles.value}>KES {trip?.fare}/-</Text>

      <Text style={styles.label}>Started At</Text>
      <Text style={styles.value}>
        {trip?.started_at ? new Date(trip.started_at).toLocaleString() : "—"}
      </Text>

      <Text style={styles.label}>Ended At</Text>
      <Text style={styles.value}>
        {trip?.ended_at ? new Date(trip.ended_at).toLocaleString() : "—"}
      </Text>

      <Text style={styles.label}>Driver</Text>
      <Text style={styles.value}>
        {driver ? `${driver.first_name} ${driver.last_name}` : "Unknown"}
      </Text>

      <Text style={styles.label}>Vehicle</Text>
      <Text style={styles.value}>
        {vehicle
          ? `${vehicle.make} ${vehicle.model} (${vehicle.number_plate})`
          : "Unknown"}
      </Text>
      <PrimaryButton title="Go Home" onPress={goHome} style={{ padding: 16 }} variant="secondary" />
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
});

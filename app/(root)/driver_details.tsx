import { View, Text, Alert, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../util/supabase";
import Loader from "../../components/Loader";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function driver_details() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const [trip, setTrip] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [vehicle, setVehile] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mapRef = useRef<MapView>(null);

  const fetchData = async () => {
    try {
      // 1. Load trip with geojson via view
      const { data: tripRow, error: tripErr } = await supabase
        .from("trips_with_geojson")
        .select("*")
        .eq("id", tripId)
        .maybeSingle();
      if (tripErr) throw tripErr;
      if (!tripRow) return;
      console.log("TripRow: ", tripRow);

      setTrip(tripRow);

      // 2. Load driver
      const { data: driverRow, error: driverErr } = await supabase
        .from("drivers")
        .select("id, first_name, last_name")
        .eq("id", tripRow.driver_id)
        .maybeSingle();

      if (driverErr) throw driverErr;
      console.log("driverRow: ", driverRow);
      setDriver(driverRow);

      // 3. Load vehicle
      const { data: vehicleRow, error: vehicleErr } = await supabase
        .from("vehicles")
        .select("make, model, number_plate, colour")
        .eq("id", tripRow.vehicle_id)
        .maybeSingle();

      if (vehicleErr) throw vehicleErr;
      console.log("vehicleRow: ", vehicleRow);
      setVehile(vehicleRow);
    } catch (error) {
      console.error("Error loading details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) fetchData();
  }, [tripId]);

  //subscribe to driver live location
  useEffect(() => {
    if (!trip?.driver_id) return;

    const channel = supabase
      .channel(`driver-location-${trip.driver_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_locations",
          filter: `driver_id=eq.${trip.driver_id}`,
        },
        (payload) => {
          const loc = payload.new; // loc is location
          const [lon, lat] = loc.location.coordinates;

          const newCoords = { latitude: lat, longitude: lon };
          setDriverLocation(newCoords);

          //auto-animate map to follow driver
          mapRef.current?.animateCamera({
            center: newCoords,
            pitch: 45,
            zoom: 15,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [trip?.driver_id]);

  //subscribe to trip status updates
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip-status-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        (payload) => {
          const updated = payload.new;

          setTrip((prev) => ({ ...prev, status: updated.status }));

          if (updated.status === "arrived") {
            Alert.alert("Driver arrived at pickup");
          }

          if (updated.status === "in_progress") {
            Alert.alert("Trip Started, Enjoy your ride.");
          }

          if (updated.status === "completed") {
            Alert.alert("Trip Completed", "Hope you enjoyed your ride.");
            router.push({
              pathname: "/(root)/trip_summary",
              params: { tripId: tripId },
            });
          }
        }
      )
      .subscribe();
  }, [tripId]);

  if (loading || !trip) {
    return <Loader message="Loading driver details" />;
  }
  const origin = {
    latitude: trip.origin.coordinates[1],
    longitude: trip.origin.coordinates[0],
  };

  const destination = {
    latitude: trip.destination.coordinates[1],
    longitude: trip.destination.coordinates[0],
  };

  const getTitle = () => {
    switch (trip?.status) {
      case "accepted":
        return "Driver is on the way";
      case "arrived":
        return "Driver has arrived";
      case "in_progress":
        return "Trip underway";
      case "completed":
        return "Trip completed";
      default:
        return "Loading trip...";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: origin.latitude,
          longitude: origin.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Pickup  */}
        <Marker coordinate={origin} title="Pickup" pinColor="green" />

        {/* Destination  */}
        <Marker coordinate={destination} title="Dropoff" pinColor="red" />

        {/* Driver  */}
        {driverLocation && (
          <Marker coordinate={driverLocation} title="Driver" pinColor="blue" />
        )}
      </MapView>
      {/* Bottom sheet  */}
      <View style={styles.infoBox}>
        <Text style={styles.title}>{getTitle()}</Text>

        <Text style={styles.label}>Driver</Text>
        <Text style={styles.value}>
          {driver?.first_name} {driver?.last_name}
        </Text>

        <Text style={styles.label}>Vehicle</Text>
        <Text style={styles.value}>
          {vehicle
            ? `${vehicle.colour} ${vehicle.make} ${vehicle.model} • ${vehicle.number_plate}`
            : "Loading..."}
        </Text>

        <Text style={styles.label}>Fare</Text>
        <Text style={styles.value}>KES {trip?.fare}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{trip?.status}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "55%" },
  infoBox: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 10, color: "#555" },
  value: { fontSize: 16, marginTop: 2 },
  primaryButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

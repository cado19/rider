import {
  View,
  Text,
  Dimensions,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import * as Location from "expo-location";
import { supabase } from "../../util/supabase";
import { fetchRiderProfile } from "../../services/auth";
import { Coordinates } from "../../types/Coordinate";
import MapView, { Marker, Polyline } from "react-native-maps";
import GooglePlacesTextInput from "react-native-google-places-textinput";
import polyline from "@mapbox/polyline";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/PrimaryButton";
import Loader from "../../components/Loader";

// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const screen = Dimensions.get("window");

export default function trip_request() {
  const [origin, setOrigin] = useState<Coordinates | null>(null); // WHERE THE RIDER IS GETTING PICKED
  const [destination, setDestination] = useState<Coordinates | null>(null); // WHERE THE RIDER IS GOING
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false); // for when a user submitting
  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const mapRef = useRef(null);

  // get the current location of the rider
  const detectLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const profile = await fetchRiderProfile();
    const userId = profile?.id;

    if (status != "granted") {
      Alert.alert("Permission Denied", "Location access is reqquired");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setOrigin(coords);
    console.log("Detected origin:", coords);

    // save to rider profile
    await supabase
      .from("riders")
      .update({
        location: `POINT(${coords.longitude} ${coords.latitude})`,
      })
      .eq("id", userId);
  };

  // function for when a user searches a destination
  const handlePlaceSelect = async (place) => {
    try {
      const placeId = place.placeId;
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_WEB;
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        const location = data.result.geometry.location;
        // console.log("Location:", location);
        const coords = {
          latitude: location.lat,
          longitude: location.lng,
        };
        setDestination(coords);
      } else {
        console.warn("Place details error:", data.status);
        Alert.alert("Error", "Could not fetch destination coordinates.");
      }
    } catch (error) {
      console.error("Place details fetch failed:", error);
      Alert.alert("Error", "Something went wrong while selecting destination.");
    }
  };

  // zoom the map in and out
  const zoomMap = () => {
    if (origin && destination && mapRef.current) {
      mapRef.current.fitToCoordinates([origin, destination], {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
    }
  };

  // decode polyline helper function. This helps to draw the linefrom origin to destination
  const decodePolyline = (encoded: string): Coordinates[] => {
    return polyline.decode(encoded).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));
  };

  // function to build route from steps if there is no polyline returned from google directions api
  const buildRouteFromSteps = (steps: any[]): Coordinates[] => {
    const allCoords: Coordinates[] = [];

    steps.forEach((step) => {
      const segment = polyline.decode(step.polyline.points);
      const coords = segment.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));
      allCoords.push(...coords);
    });

    return allCoords;
  };

  // fetch route from directions API
  const fetchRoute = async () => {
    // exit function if neither destination nor origin is set
    if (!origin || !destination) {
      return;
    }

    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_WEB;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${apiKey}`;
    // console.log("Url: ", url);

    try {
      const res = await fetch(url);
      const data = await res.json();
      // console.log("Directions API response:", JSON.stringify(data, null, 2));
      // console.log("Data: ", data);

      if (data.routes.length) {
        const route = data.routes[0];
        const leg = route.legs[0];

        //use overview_polyline if available
        const polylineStr = route.overview_polyline?.points;
        const routePoints = polylineStr
          ? decodePolyline(polylineStr)
          : buildRouteFromSteps(leg.steps);

        setRouteCoords(routePoints);

        setDistance(leg.distance.text);
        setDuration(leg.duration.text);
      } else {
        console.warn("No route found: ", data);
        Alert.alert(
          "Route Error",
          "No route could be found between origin and destination."
        );
      }
    } catch (error) {
      console.error("Route fetch failed: ", error);
    }
  };

  // function to request the trip
  const requestTrip = async () => {
    if (!origin || !destination || !distance || !duration) {
      Alert.alert(
        "Missing Info",
        "Please select a destination and wait for route to load."
      );
      return;
    }

    setRequesting(true);

    try {
      const profile = await fetchRiderProfile();
      const riderId = profile?.id;

      const distanceKm = parseFloat(distance.replace(" km", ""));
      const durationMin = parseFloat(
        duration.replace(" mins", "").replace(" min", "")
      );

      const { data, error } = await supabase
        .from("trip_requests")
        .insert([
          {
            rider_id: riderId,
            origin: `POINT(${origin.longitude} ${origin.latitude})`,
            destination: `POINT(${destination.longitude} ${destination.latitude})`,
            status: "pending",
            distance_km: distanceKm,
            estimated_time_min: durationMin,
          },
        ])
        .select("id")
        .single();

      if (error) throw error;

      router.push({
        pathname: "(root)/trip_confirm",
        params: { tripRequestId: data.id },
      });
    } catch (err) {
      console.error("Trip request failed:", err);
      Alert.alert("Error", "Could not request trip. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    detectLocation().finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    zoomMap();
  }, [origin, destination]);

  useEffect(() => {
    if (origin && destination) {
      fetchRoute();
    }
  }, [origin, destination]);

  if (loading) {
    return <Loader message="Loading..." />;
  }
  return (
    <View style={styles.container}>
      <Text>trip_request</Text>
      {/* Map  */}
      {origin && (
        <MapView
          ref={mapRef}
          provider="google"
          style={styles.map}
          initialRegion={{
            ...origin,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={origin} title="Your location" />
          {destination && (
            <Marker
              coordinate={destination}
              title="Destination"
              pinColor="blue"
            />
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#007AFF"
              strokeWidth={4}
            />
          )}
        </MapView>
      )}

      {/* Trip Info Card  */}
      {distance && duration && (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons
              name="car-outline"
              size={20}
              color="#007AFF"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>Distance: {distance ?? "—"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={20}
              color="#007AFF"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>Duration: {duration ?? "—"}</Text>
          </View>

          <PrimaryButton
            title={"Request trip"}
            onPress={requestTrip}
            variant="secondary"
            style={{ padding: 16 }}
          />
        </View>
      )}

      {/* Search Box  */}
      <View style={styles.searchBox}>
        <GooglePlacesTextInput
          apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_WEB}
          placeHolderText="Where to"
          onPlaceSelect={handlePlaceSelect}
          locationRestriction={{
            rectangle: {
              low: { latitude: -4.6785, longitude: 33.9098 }, // ✅ SW corner
              high: { latitude: 4.62, longitude: 41.8996 }, // ✅ NE corner
            },
          }}
          style={{
            container: {
              borderWidth: 0,
              backgroundColor: "transparent",
            },
            input: {
              borderWidth: 0,
              backgroundColor: "transparent",
              fontSize: 16,
              paddingHorizontal: 12,
            },
            placeholder: {
              color: "#9CA3AF",
            },
          }}
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_WEB,
            language: "en",
            components: "country:ke",
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  map: {
    width: screen.width,
    height: screen.height * 0.6,
  },
  searchBox: {
    position: "absolute",
    top: 40,
    width: screen.width - 40,
    marginHorizontal: 20,
    zIndex: 10,
    backgroundColor: "#FFF",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    backgroundColor: "#fff",
    // borderColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 16,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  infoContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontFamily: "JakartaMedium",
    fontSize: 16,
    color: "#111827",
  },

  buttonWrapper: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 4,
  },

  requestButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

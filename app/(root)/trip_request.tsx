import {
  View,
  Text,
  Dimensions,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import * as Location from "expo-location";
import { supabase } from "../../util/supabase";
import { fetchRiderProfile } from "../../services/auth";
import { Coordinates } from "../../types/Coordinate";
import MapView, { Marker } from "react-native-maps";
import GooglePlacesTextInput from "react-native-google-places-textinput";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const screen = Dimensions.get("window");

export default function trip_request() {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

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

  useEffect(() => {
    detectLocation().finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    zoomMap();
  }, [origin, destination]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
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
        </MapView>
      )}

      {/* Search Box  */}
      <View style={styles.searchBox}>
        <GooglePlacesTextInput
          apiKey="AIzaSyByN6NuY1hIsiop6LmuEuBrsI463q4TnJw"
          placeHolderText="Where to"
          onPlaceSelect={handlePlaceSelect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  textInput: {
    backgroundColor: "#fff",
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
});

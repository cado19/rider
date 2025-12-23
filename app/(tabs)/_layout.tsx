import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabIcon = ({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) => (
  <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
    <View style={[styles.iconCircle, focused && styles.iconCircleFocused]}>
      <Ionicons name={name} size={24} color="white" />
    </View>
  </View>
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          { marginBottom: insets.bottom + 5 }
        ],
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="list" focused={focused} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#333333",
    borderRadius: 50,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    height: 68,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
  },
  iconWrapper: {
    flex: 1,
    // flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  iconWrapperFocused: {
    backgroundColor: "#4B5563",
  },
  iconCircle: {
    borderRadius: 50,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleFocused: {
    backgroundColor: "#6B7280",
  },
});

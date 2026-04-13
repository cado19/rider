
export default () => ({
  expo: {
    name: "rider",
    slug: "rider",
    owner: "cado19",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "com.cado19.rider",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/8g.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cado19.rider",
    },
    android: {
      config: {
        googleMaps: {
          // fallback to env if you don’t want to hardcode
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID || "AIzaSyByN6NuY1hIsiop6LmuEuBrsI463q4TnJw",
        },
      },
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.cado19.rider",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "719c0269-780f-4484-ab7e-d80aa7c11396",
      },
      googleMapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID || "AIzaSyByN6NuY1hIsiop6LmuEuBrsI463q4TnJw",
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnon: process.env.EXPO_PUBLIC_ANON,
      mapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID,
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      "@react-native-google-signin/google-signin",
    ],
  },
});
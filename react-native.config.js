module.exports = {
  dependencies: {
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: true, // ⛔ disables native linking for Android
      },
    },
    '@react-native-google-signin/google-signin': {
      platforms: {
        android: true, // ⛔ disables native linking for Android
      },
    },
  },
};
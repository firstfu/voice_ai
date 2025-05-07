import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#F8F9FA",
        },
        headerTintColor: "#3A7BFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
        title: "AI問答",
      }}
    />
  );
}

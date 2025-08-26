import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "@/components/safe-area-view";

export default function Authenticating() {
  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center">
      <View className="items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-lg font-semibold">Authenticating...</Text>
      </View>
    </SafeAreaView>
  );
}

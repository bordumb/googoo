import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";

import { Button, Input } from "@/components/ui";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    // Mock delay
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="mb-8 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Text className="text-2xl font-bold text-white">G</Text>
          </View>
          <Text className="text-2xl font-bold text-text">GooGoo</Text>
          <Text className="mt-1 text-center text-sm text-neutral-400">
            The neighborhood marketplace for parents
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={16} color="#8F8A84" />}
          />

          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={16} color="#8F8A84" />}
            rightIcon={
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={16} color="#8F8A84" />
                ) : (
                  <Eye size={16} color="#8F8A84" />
                )}
              </Pressable>
            }
          />

          {error ? (
            <Text className="text-sm text-error">{error}</Text>
          ) : null}

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handleSignIn}
          >
            Sign In
          </Button>
        </View>

        {/* Divider */}
        <View className="my-6 flex-row items-center">
          <View className="flex-1 border-b border-neutral-200" />
          <Text className="mx-3 text-sm text-neutral-400">or</Text>
          <View className="flex-1 border-b border-neutral-200" />
        </View>

        {/* Social buttons */}
        <View className="gap-3">
          <Button variant="secondary" fullWidth onPress={() => {}}>
            Continue with Apple
          </Button>
          <Button variant="secondary" fullWidth onPress={() => {}}>
            Continue with Google
          </Button>
        </View>

        {/* Sign up link */}
        <Pressable
          onPress={() => router.push("/auth/sign-up")}
          className="mt-6 items-center"
        >
          <Text className="text-sm text-neutral-400">
            Don't have an account?{" "}
            <Text className="font-semibold text-primary">Sign Up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

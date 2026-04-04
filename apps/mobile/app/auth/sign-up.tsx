import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react-native";

import { Button, Input } from "@/components/ui";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 0.25;
    if (password.length >= 10) strength += 0.25;
    if (/[A-Z]/.test(password)) strength += 0.25;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 0.25;
    return strength;
  })();

  const strengthColor =
    passwordStrength <= 0.25
      ? "bg-error"
      : passwordStrength <= 0.5
        ? "bg-warning"
        : "bg-success";

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.replace("/onboarding");
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
        <View className="mb-6 items-center">
          <Text className="text-2xl font-bold text-text">Create Account</Text>
          <Text className="mt-1 text-sm text-neutral-400">
            Join the GooGoo community
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Display Name"
            placeholder="How other parents will see you"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={16} color="#8F8A84" />}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={16} color="#8F8A84" />}
          />

          <View>
            <Input
              label="Password"
              placeholder="Create a password"
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
            {password.length > 0 && (
              <View className="mt-2 h-1.5 w-full rounded-full bg-neutral-200">
                <View
                  className={`h-full rounded-full ${strengthColor}`}
                  style={{ width: `${passwordStrength * 100}%` }}
                />
              </View>
            )}
          </View>

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={16} color="#8F8A84" />}
            error={
              confirmPassword.length > 0 && password !== confirmPassword
                ? "Passwords don't match"
                : undefined
            }
          />

          {error ? (
            <Text className="text-sm text-error">{error}</Text>
          ) : null}

          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handleSignUp}
          >
            Create Account
          </Button>
        </View>

        <Pressable
          onPress={() => router.push("/auth/sign-in")}
          className="mt-6 items-center"
        >
          <Text className="text-sm text-neutral-400">
            Already have an account?{" "}
            <Text className="font-semibold text-primary">Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifyCode, setVerifyCode] = React.useState("");

  const handleSignIn = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            router.replace("/(tabs)" as any);
          } else {
            router.replace("/(tabs)" as any);
          }
        },
      });
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code: verifyCode });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => {
          router.replace("/(tabs)" as any);
        },
      });
    }
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>Enter the code sent to your email</Text>
          <TextInput
            style={styles.input}
            value={verifyCode}
            onChangeText={setVerifyCode}
            placeholder="Verification code"
            placeholderTextColor="#8A9BAB"
            keyboardType="numeric"
          />
          {errors.fields.code && (
            <Text style={styles.error}>{errors.fields.code.message}</Text>
          )}
          <Pressable
            style={[styles.button, fetchStatus === "fetching" && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={fetchStatus === "fetching"}
          >
            <Text style={styles.buttonText}>Verify</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => signIn.mfa.sendEmailCode()}>
            <Text style={styles.secondaryButtonText}>Resend code</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => signIn.reset()}>
            <Text style={styles.secondaryButtonText}>Start over</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>L'Itinéraire</Text>
          <Text style={styles.title}>Bon retour</Text>
          <Text style={styles.subtitle}>Sign in to your Paris planner</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#8A9BAB"
          />
          {errors.fields.identifier && (
            <Text style={styles.error}>{errors.fields.identifier.message}</Text>
          )}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor="#8A9BAB"
          />
          {errors.fields.password && (
            <Text style={styles.error}>{errors.fields.password.message}</Text>
          )}

          <Pressable
            style={[
              styles.button,
              (!email || !password || fetchStatus === "fetching") && styles.buttonDisabled,
            ]}
            onPress={handleSignIn}
            disabled={!email || !password || fetchStatus === "fetching"}
          >
            <Text style={styles.buttonText}>
              {fetchStatus === "fetching" ? "Signing in…" : "Continue"}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.push("/(auth)/forgot-password" as any)}>
            <Text style={styles.secondaryButtonText}>Forgot password?</Text>
          </Pressable>

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>No account? </Text>
            <Link href="/(auth)/sign-up">
              <Text style={styles.link}>Create one</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1C1510" },
  inner: { padding: 28, flexGrow: 1, justifyContent: "center" },
  logo: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 3,
    color: "#AC9139",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 32,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#F0E8D8",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#8A9BAB",
    textAlign: "center",
    marginBottom: 32,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#C8BFB0",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#2C2118",
    borderWidth: 1,
    borderColor: "#3D3020",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: "#F0E8D8",
    fontFamily: "Inter_400Regular",
  },
  button: {
    backgroundColor: "#AC9139",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#1C1510",
  },
  secondaryButton: { alignItems: "center", marginTop: 16 },
  secondaryButtonText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#8A9BAB",
  },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  linkText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#8A9BAB" },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#AC9139" },
  error: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 4,
  },
});

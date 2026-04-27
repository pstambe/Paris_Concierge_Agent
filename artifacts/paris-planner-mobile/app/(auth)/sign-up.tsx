import { useSignUp } from "@clerk/expo";
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

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifyCode, setVerifyCode] = React.useState("");

  const handleSignUp = async () => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code: verifyCode });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: () => {
          router.replace("/(tabs)" as any);
        },
      });
    }
  };

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>Vérifiez votre email</Text>
          <Text style={styles.subtitle}>
            We sent a code to {email}
          </Text>
          <TextInput
            style={styles.input}
            value={verifyCode}
            onChangeText={setVerifyCode}
            placeholder="6-digit code"
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
            <Text style={styles.buttonText}>
              {fetchStatus === "fetching" ? "Verifying…" : "Verify email"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => signUp.verifications.sendEmailCode()}
          >
            <Text style={styles.secondaryButtonText}>Resend code</Text>
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
          <Text style={styles.title}>Bonjour !</Text>
          <Text style={styles.subtitle}>Create your Paris planner account</Text>

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
          {errors.fields.emailAddress && (
            <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
          )}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Choose a password"
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
            onPress={handleSignUp}
            disabled={!email || !password || fetchStatus === "fetching"}
          >
            <Text style={styles.buttonText}>
              {fetchStatus === "fetching" ? "Creating account…" : "Create account"}
            </Text>
          </Pressable>

          <View nativeID="clerk-captcha" />

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text style={styles.link}>Sign in</Text>
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

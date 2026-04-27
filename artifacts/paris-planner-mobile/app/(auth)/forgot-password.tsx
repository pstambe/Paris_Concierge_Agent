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

type Step = "email" | "code" | "password" | "done";

export default function ForgotPasswordScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleRequestReset = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setLoading(true);
    try {
      await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });
      setStep("password");
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.message ?? "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setLoading(true);
    try {
      const result = await signIn.resetPassword({ password: newPassword });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)" as any);
      } else {
        setStep("done");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage ?? err.message ?? "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>L'Itinéraire</Text>

          {step === "email" && (
            <>
              <Text style={styles.title}>Réinitialisation</Text>
              <Text style={styles.subtitle}>Enter your email and we'll send you a reset code</Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#8A9BAB"
                autoFocus
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.button, (!email || loading) && styles.buttonDisabled]}
                onPress={handleRequestReset}
                disabled={!email || loading}
              >
                <Text style={styles.buttonText}>{loading ? "Sending…" : "Send reset code"}</Text>
              </Pressable>
            </>
          )}

          {step === "code" && (
            <>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>We sent a 6-digit code to {email}</Text>

              <Text style={styles.label}>Reset code</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="6-digit code"
                placeholderTextColor="#8A9BAB"
                keyboardType="numeric"
                autoFocus
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.button, (!code || loading) && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={!code || loading}
              >
                <Text style={styles.buttonText}>{loading ? "Verifying…" : "Verify code"}</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={() => setStep("email")}>
                <Text style={styles.secondaryButtonText}>Try a different email</Text>
              </Pressable>
            </>
          )}

          {step === "password" && (
            <>
              <Text style={styles.title}>New password</Text>
              <Text style={styles.subtitle}>Choose a new password for your account</Text>

              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 8 characters"
                placeholderTextColor="#8A9BAB"
                autoFocus
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.button, (!newPassword || loading) && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={!newPassword || loading}
              >
                <Text style={styles.buttonText}>{loading ? "Saving…" : "Set new password"}</Text>
              </Pressable>
            </>
          )}

          {step === "done" && (
            <>
              <Text style={styles.title}>Password updated</Text>
              <Text style={styles.subtitle}>Your password has been reset. You can now sign in.</Text>
              <Link href="/(auth)/sign-in" replace>
                <Text style={[styles.button, { textAlign: "center" }]}>
                  <Text style={styles.buttonText}>Go to sign in</Text>
                </Text>
              </Link>
            </>
          )}

          <View style={styles.linkRow}>
            <Link href="/(auth)/sign-in">
              <Text style={styles.link}>← Back to sign in</Text>
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
  linkRow: { alignItems: "center", marginTop: 32 },
  link: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#AC9139",
  },
  error: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#e74c3c",
    marginTop: 4,
  },
});

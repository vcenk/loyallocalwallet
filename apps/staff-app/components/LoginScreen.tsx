import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";

export function LoginScreen() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    const addr = email.trim().toLowerCase();
    if (!addr) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: false },
    });
    if (error) {
      setError(error.message);
    } else {
      setStep("code");
      setInfo(`We sent a 6-digit code to ${addr}.`);
    }
    setBusy(false);
  }

  async function verify() {
    const token = code.trim();
    if (!token) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });
    if (error) setError(error.message);
    // On success, App.tsx's onAuthStateChange switches to the scanner.
    setBusy(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.logo}>
          <Text style={styles.logoMark}>L</Text>
        </View>
        <Text style={styles.brand}>LoyalLocal</Text>
        <Text style={styles.subtitle}>Staff scanner</Text>

        <View style={styles.card}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          {step === "email" ? (
            <>
              <Text style={styles.label}>Work email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@shop.com"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity
                style={[styles.button, busy && styles.buttonDisabled]}
                onPress={sendCode}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <Text style={styles.buttonText}>Send code</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.hint}>
                We&apos;ll email you a 6-digit sign-in code.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>6-digit code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="••••••"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
              <TouchableOpacity
                style={[styles.button, busy && styles.buttonDisabled]}
                onPress={verify}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <Text style={styles.buttonText}>Verify and sign in</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                  setInfo(null);
                }}
              >
                <Text style={styles.link}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logo: {
    alignSelf: "center",
    height: 64,
    width: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoMark: { color: colors.primaryText, fontSize: 34, fontWeight: "900" },
  brand: { fontSize: 28, fontWeight: "800", color: colors.ink, textAlign: "center" },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  label: { fontSize: 13, fontWeight: "700", color: colors.muted },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
  },
  codeInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "700",
  },
  button: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  link: {
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  hint: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 4 },
  error: {
    backgroundColor: "#fdecea",
    color: colors.danger,
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
  },
  info: {
    backgroundColor: "#e6f4ec",
    color: "#137a4b",
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
  },
});

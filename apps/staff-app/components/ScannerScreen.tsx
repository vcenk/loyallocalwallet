import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { api, type ScanResult } from "../lib/api";
import { colors } from "../lib/theme";
import { CameraScanner } from "./CameraScanner";
import { ErrorBoundary } from "./ErrorBoundary";

export function ScannerScreen({
  onScanned,
}: {
  onScanned: (result: ScanResult) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  async function lookup(barcodeValue: string) {
    if (busy || !barcodeValue) return;
    setBusy(true);
    try {
      const result = await api.scan(barcodeValue.trim());
      onScanned(result);
    } catch (e) {
      Alert.alert("Scan failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Scan a card</Text>
            <Text style={styles.subtitle}>
              Point the camera at the customer&apos;s wallet QR
            </Text>
          </View>
          <TouchableOpacity onPress={() => supabase.auth.signOut()}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {showCamera ? (
          <View style={styles.cameraWrap}>
            <ErrorBoundary
              fallback={() => (
                <Text style={styles.cameraError}>
                  Camera unavailable on this device. Enter the card code below.
                </Text>
              )}
            >
              <CameraScanner onScan={lookup} disabled={busy} />
              <View pointerEvents="none" style={styles.reticle} />
            </ErrorBoundary>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.cameraToggle}
            onPress={() => setShowCamera(true)}
          >
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>⃞</Text>
            </View>
            <Text style={styles.cameraToggleText}>Scan with camera</Text>
            <Text style={styles.cameraToggleHint}>Tap to open the camera</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or enter code manually</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.manualRow}>
          <TextInput
            style={styles.input}
            placeholder="llw_…"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            value={manual}
            onChangeText={setManual}
          />
          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={() => lookup(manual)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.buttonText}>Look up</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 4,
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2, maxWidth: 240 },
  signOut: { color: colors.primary, fontWeight: "700" },
  cameraWrap: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    position: "absolute",
    height: 200,
    width: 200,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
  },
  cameraError: { color: "#fff", textAlign: "center", padding: 24, fontSize: 14 },
  cameraToggle: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraIcon: {
    height: 64,
    width: 64,
    borderRadius: 20,
    backgroundColor: "#f6e0d9",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIconText: { fontSize: 30, color: colors.primary },
  cameraToggleText: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  cameraToggleHint: { color: colors.muted, fontSize: 13 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 12 },
  manualRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    height: 54,
    paddingHorizontal: 22,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
});

import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan a card</Text>
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
          </ErrorBoundary>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.cameraToggle}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.cameraToggleText}>Scan with camera</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>Or enter the card code manually</Text>
      <View style={styles.manualRow}>
        <TextInput
          style={styles.input}
          placeholder="llw_..."
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink },
  signOut: { color: colors.primary, fontWeight: "700" },
  cameraWrap: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraError: { color: "#fff", textAlign: "center", padding: 24, fontSize: 14 },
  cameraToggle: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 22,
    alignItems: "center",
  },
  cameraToggleText: { color: colors.primary, fontSize: 16, fontWeight: "700" },
  hint: { color: colors.muted, fontSize: 13, textAlign: "center" },
  manualRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
});

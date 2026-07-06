import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "../lib/supabase";
import { api, type ScanResult } from "../lib/api";
import { colors } from "../lib/theme";

export function ScannerScreen({
  onScanned,
}: {
  onScanned: (result: ScanResult) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");

  // Ask for camera access once, as soon as the scanner opens.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

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

      <View style={styles.cameraWrap}>
        {!permission ? (
          <ActivityIndicator color={colors.primary} />
        ) : !permission.granted ? (
          <View style={styles.permission}>
            <Text style={styles.permissionText}>
              Camera access is needed to scan customer cards.
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Grant camera access</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={
              busy ? undefined : ({ data }) => lookup(data)
            }
          />
        )}
      </View>

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
  camera: { flex: 1, width: "100%" },
  permission: { padding: 24, gap: 16, alignItems: "center" },
  permissionText: { color: colors.card, textAlign: "center", fontSize: 15 },
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

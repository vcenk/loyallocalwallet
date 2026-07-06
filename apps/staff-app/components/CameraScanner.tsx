import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "../lib/theme";

// Isolated camera view. Kept separate + mounted on demand so any expo-camera
// issue can't crash the whole scanner screen (see ScannerScreen's boundary).
export function CameraScanner({
  onScan,
  disabled,
}: {
  onScan: (value: string) => void;
  disabled: boolean;
}) {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <ActivityIndicator color={colors.primary} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan customer cards.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <CameraView
      style={styles.camera}
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={disabled ? undefined : ({ data }) => onScan(data)}
    />
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1, width: "100%" },
  permission: { padding: 24, gap: 16, alignItems: "center" },
  permissionText: { color: colors.card, textAlign: "center", fontSize: 15 },
  button: {
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
});

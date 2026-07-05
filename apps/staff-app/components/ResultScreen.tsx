import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, type ScanResult } from "../lib/api";
import { colors } from "../lib/theme";

const BONUS_REASONS = ["Referral", "Birthday", "Manager bonus"];

export function ResultScreen({
  scan,
  onBack,
}: {
  scan: ScanResult;
  onBack: () => void;
}) {
  const [progress, setProgress] = useState({
    currentStamps: scan.currentStamps,
    total: scan.total,
    rewardsAvailable: scan.rewardsAvailable,
  });
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<{ currentStamps: number; total: number; rewardsAvailable: number }>) {
    if (busy) return;
    setBusy(true);
    try {
      const result = await fn();
      setProgress(result);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  const rewardReady = progress.rewardsAvailable > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>‹ Scan another</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.name}>{scan.customerName}</Text>
        <Text style={styles.program}>{scan.programName}</Text>

        <Text style={styles.progress}>
          {rewardReady
            ? `${progress.rewardsAvailable} reward${progress.rewardsAvailable > 1 ? "s" : ""} ready`
            : `${progress.currentStamps} / ${scan.stampsRequired} stamps`}
        </Text>
        {rewardReady ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Reward ready: {scan.rewardTitle}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, busy && styles.disabled]}
        onPress={() => run(() => api.addStamp(scan.walletPassId))}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.primaryText}>Add stamp</Text>
        )}
      </TouchableOpacity>

      {rewardReady ? (
        <TouchableOpacity
          style={[styles.successButton, busy && styles.disabled]}
          onPress={() => run(() => api.redeem(scan.walletPassId))}
          disabled={busy}
        >
          <Text style={styles.primaryText}>Redeem reward</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.bonusLabel}>Bonus stamp</Text>
      <View style={styles.bonusRow}>
        {BONUS_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            style={[styles.bonusChip, busy && styles.disabled]}
            onPress={() =>
              run(() => api.addStamp(scan.walletPassId, { eventType: "bonus", reason }))
            }
            disabled={busy}
          >
            <Text style={styles.bonusChipText}>{reason}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14 },
  back: { color: colors.primary, fontWeight: "700", fontSize: 16, marginTop: 8 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 24,
    gap: 6,
  },
  name: { fontSize: 26, fontWeight: "800", color: colors.ink },
  program: { fontSize: 15, color: colors.muted },
  progress: { fontSize: 34, fontWeight: "800", color: colors.primary, marginTop: 8 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e6f4ec",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  badgeText: { color: colors.success, fontWeight: "700", fontSize: 13 },
  primaryButton: {
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  successButton: {
    height: 60,
    backgroundColor: colors.success,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: colors.primaryText, fontSize: 18, fontWeight: "800" },
  disabled: { opacity: 0.6 },
  bonusLabel: { color: colors.muted, fontWeight: "700", marginTop: 6 },
  bonusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bonusChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bonusChipText: { color: colors.ink, fontWeight: "600" },
});

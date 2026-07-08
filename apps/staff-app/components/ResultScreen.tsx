import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, type ScanResult, type ProgressResult } from "../lib/api";
import { colors } from "../lib/theme";

const BONUS_REASONS = ["Referral", "Birthday", "Manager bonus"];

// Compact stamp progress: dots up to a reasonable count, otherwise a number.
function StampDots({ filled, total }: { filled: number; total: number }) {
  if (total > 12) {
    return (
      <Text style={styles.progressNum}>
        {filled} / {total}
      </Text>
    );
  }
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < filled ? styles.dotFilled : styles.dotEmpty]}
        />
      ))}
    </View>
  );
}

export function ResultScreen({
  scan,
  onBack,
}: {
  scan: ScanResult;
  onBack: () => void;
}) {
  const [progress, setProgress] = useState<ProgressResult>({
    currentStamps: scan.currentStamps,
    total: scan.total,
    rewardsAvailable: scan.rewardsAvailable,
  });
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<ProgressResult>) {
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
  const filled = Math.min(progress.currentStamps, scan.stampsRequired);
  const remaining = Math.max(0, scan.stampsRequired - filled);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backRow}>
          <Text style={styles.back}>‹ Scan another</Text>
        </TouchableOpacity>

        <View style={[styles.card, rewardReady && styles.cardReady]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(scan.customerName?.[0] ?? "G").toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{scan.customerName}</Text>
          <Text style={styles.program}>{scan.programName}</Text>

          <View style={styles.dotsWrap}>
            <StampDots filled={filled} total={scan.stampsRequired} />
          </View>

          {rewardReady ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                🎉 Reward ready: {scan.rewardTitle}
              </Text>
            </View>
          ) : (
            <Text style={styles.remaining}>
              {remaining === 0
                ? "Ready for a reward"
                : `${remaining} more to “${scan.rewardTitle}”`}
            </Text>
          )}
        </View>

        {rewardReady ? (
          <TouchableOpacity
            style={[styles.successButton, busy && styles.disabled]}
            onPress={() => run(() => api.redeem(scan.walletPassId))}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.primaryText}>Redeem reward</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, busy && styles.disabled]}
          onPress={() => run(() => api.addStamp(scan.walletPassId))}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.primaryText}>+ Add stamp</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.bonusLabel}>Bonus stamp</Text>
        <View style={styles.bonusRow}>
          {BONUS_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.bonusChip, busy && styles.disabled]}
              onPress={() =>
                run(() =>
                  api.addStamp(scan.walletPassId, { eventType: "bonus", reason }),
                )
              }
              disabled={busy}
            >
              <Text style={styles.bonusChipText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 14 },
  backRow: { marginTop: 4 },
  back: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  cardReady: { borderColor: colors.success },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { color: colors.primaryText, fontSize: 24, fontWeight: "800" },
  name: { fontSize: 24, fontWeight: "800", color: colors.ink, textAlign: "center" },
  program: { fontSize: 14, color: colors.muted },
  dotsWrap: { marginVertical: 10 },
  dots: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    maxWidth: 240,
  },
  dot: { height: 20, width: 20, borderRadius: 10, borderWidth: 2 },
  dotFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotEmpty: { backgroundColor: "transparent", borderColor: colors.border },
  progressNum: { fontSize: 34, fontWeight: "800", color: colors.primary },
  remaining: { fontSize: 14, color: colors.muted, textAlign: "center" },
  badge: {
    backgroundColor: "#e6f4ec",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: { color: colors.success, fontWeight: "700", fontSize: 14 },
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

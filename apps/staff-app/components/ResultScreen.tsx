import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  api,
  type ScanResult,
  type ProgressResult,
  type ProgramType,
} from "../lib/api";
import { colors } from "../lib/theme";

const BONUS_REASONS = ["Referral", "Birthday", "Manager bonus"];

// Programs that record a variable amount per visit (vs a single stamp/visit).
const AMOUNT_MODES: ProgramType[] = ["points", "spend"];

const ADD_LABEL: Record<ProgramType, string> = {
  stamps: "Add stamp",
  visits: "Add visit",
  points: "Add points",
  spend: "Add amount",
};

const AMOUNT_PLACEHOLDER: Record<string, string> = {
  points: "Points earned",
  spend: "Amount spent",
};

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
  locationId,
  onBack,
}: {
  scan: ScanResult;
  locationId: string | null;
  onBack: () => void;
}) {
  const [progress, setProgress] = useState<ProgressResult>({
    currentStamps: scan.currentStamps,
    total: scan.total,
    rewardsAvailable: scan.rewardsAvailable,
  });
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("1");

  const amountMode = AMOUNT_MODES.includes(scan.programType);

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

  function addEarn() {
    const quantity = amountMode
      ? Math.max(1, Math.floor(Number(amount) || 1))
      : 1;
    run(() => api.addStamp(scan.walletPassId, { quantity, locationId }));
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
            onPress={() => run(() => api.redeem(scan.walletPassId, locationId))}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.primaryText}>Redeem reward</Text>
            )}
          </TouchableOpacity>
        ) : null}

        {amountMode ? (
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
              placeholder={AMOUNT_PLACEHOLDER[scan.programType] ?? "Amount"}
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity
              style={[styles.primaryButtonFlex, busy && styles.disabled]}
              onPress={addEarn}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <Text style={styles.primaryText}>
                  {ADD_LABEL[scan.programType]}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={addEarn}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.primaryText}>+ {ADD_LABEL[scan.programType]}</Text>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.bonusLabel}>Bonus stamp</Text>
        <View style={styles.bonusRow}>
          {BONUS_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.bonusChip, busy && styles.disabled]}
              onPress={() =>
                run(() =>
                  api.addStamp(scan.walletPassId, {
                    eventType: "bonus",
                    reason,
                    locationId,
                  }),
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
  primaryButtonFlex: {
    flex: 1,
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
  amountRow: { flexDirection: "row", gap: 10 },
  amountInput: {
    width: 110,
    height: 60,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
  },
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

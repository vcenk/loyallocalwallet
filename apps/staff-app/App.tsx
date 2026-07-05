import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import type { ScanResult } from "./lib/api";
import { colors } from "./lib/theme";
import { LoginScreen } from "./components/LoginScreen";
import { ScannerScreen } from "./components/ScannerScreen";
import { ResultScreen } from "./components/ResultScreen";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [scan, setScan] = useState<ScanResult | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setScan(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {!ready ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !session ? (
        <LoginScreen />
      ) : scan ? (
        <ResultScreen scan={scan} onBack={() => setScan(null)} />
      ) : (
        <ScannerScreen onScanned={setScan} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});

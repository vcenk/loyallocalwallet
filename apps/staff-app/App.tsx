import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./lib/supabase";
import type { ScanResult } from "./lib/api";
import { colors } from "./lib/theme";
import { LoginScreen } from "./components/LoginScreen";
import { ScannerScreen } from "./components/ScannerScreen";
import { ResultScreen } from "./components/ResultScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";

const LOCATION_KEY = "llw.selectedLocationId";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(LOCATION_KEY).then((v) => setLocationId(v || null));
    if (!supabaseConfigured) {
      setReady(true);
      return;
    }
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

  function chooseLocation(id: string | null) {
    setLocationId(id);
    if (id) AsyncStorage.setItem(LOCATION_KEY, id);
    else AsyncStorage.removeItem(LOCATION_KEY);
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ErrorBoundary>
        {!supabaseConfigured ? (
          <View style={styles.center}>
            <Text style={styles.errTitle}>App not configured</Text>
            <Text style={styles.errBody}>
              This build is missing its Supabase keys. Rebuild with
              EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY set.
            </Text>
          </View>
        ) : !ready ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : !session ? (
          <LoginScreen />
        ) : scan ? (
          <ResultScreen
            scan={scan}
            locationId={locationId}
            onBack={() => setScan(null)}
          />
        ) : (
          <ScannerScreen
            onScanned={setScan}
            locationId={locationId}
            onLocationChange={chooseLocation}
          />
        )}
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  errTitle: { fontSize: 20, fontWeight: "800", color: colors.ink, textAlign: "center" },
  errBody: { fontSize: 14, color: colors.muted, textAlign: "center", lineHeight: 20 },
});

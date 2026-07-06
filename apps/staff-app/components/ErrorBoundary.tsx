import { Component, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";

type Props = { children: ReactNode };
type State = { error: Error | null };

// Catches JS render/lifecycle errors so the app shows a readable message and an
// escape hatch instead of white-screening. (Native crashes bypass this.)
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("App error boundary:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <ScrollView style={styles.box}>
            <Text style={styles.msg}>{this.state.error.message}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              supabase.auth.signOut();
              this.setState({ error: null });
            }}
          >
            <Text style={styles.buttonText}>Sign out and try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 16 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
  },
  box: {
    maxHeight: 220,
    backgroundColor: "#fdecea",
    borderRadius: 12,
    padding: 14,
  },
  msg: { color: colors.danger, fontSize: 13 },
  button: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
});

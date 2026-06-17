import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Error</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>{this.state.error.message}</Text>
            <Text style={styles.stack}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', justifyContent: 'center', padding: 20 },
  title: { color: '#ef4444', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  scroll: { flex: 1 },
  message: { color: '#f4f4f5', fontSize: 14, marginBottom: 8 },
  stack: { color: '#71717a', fontSize: 11 },
});

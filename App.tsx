import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { version } from './package.json';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={styles.title}>Pass The Lighter</Text>
      <Text style={styles.subtitle}>Σύντομα κοντά σας</Text>
      <Text style={styles.version}>v{version}</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14110F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flame: {
    fontSize: 72,
  },
  title: {
    marginTop: 16,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFB347',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#C9BFB5',
  },
  version: {
    position: 'absolute',
    bottom: 32,
    fontSize: 12,
    color: '#6E655D',
  },
});

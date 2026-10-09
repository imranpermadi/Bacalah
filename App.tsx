import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { colors, fonts } from './src/core/theme';
import { useAppStore } from './src/presentation/stores/useAppStore';
import { BottomTabs } from './src/presentation/navigation/BottomTabs';
import { LoginScreen } from './src/presentation/screens/auth/LoginScreen';
import { ProfileSelectScreen } from './src/presentation/screens/auth/ProfileSelectScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const ready = useAppStore((s) => s.ready);
  const error = useAppStore((s) => s.error);
  const isLoggedIn = useAppStore((s) => s.isLoggedIn);
  const isProfileSelected = useAppStore((s) => s.isProfileSelected);
  const init = useAppStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.ciciLogo}>🐱</Text>
        <Text style={styles.splashTitle}>BACALAH</Text>
        <Text style={styles.splashSubtitle}>
          Belajar Cepat Membaca & Menulis bersama Cici
        </Text>
        <ActivityIndicator size="large" color={colors.sunnyDark} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.splash}>
        <Text style={{ fontSize: 60 }}>🙀</Text>
        <Text style={styles.splashTitle}>Ups!</Text>
        <Text style={styles.splashSubtitle}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.bg} />
      {!isLoggedIn ? (
        <LoginScreen />
      ) : !isProfileSelected ? (
        <ProfileSelectScreen />
      ) : (
        <NavigationContainer>
          <BottomTabs />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  ciciLogo: {
    fontSize: 90,
    marginBottom: 8,
  },
  splashTitle: {
    fontFamily: 'Nunito_900Black',
    fontSize: 44,
    color: colors.ink,
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 6,
  },
});

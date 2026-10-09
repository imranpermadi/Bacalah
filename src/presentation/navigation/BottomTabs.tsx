import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fonts } from '../../core/theme';
import { BelajarScreen } from '../screens/belajar/BelajarScreen';
import { DikteKuisScreen } from '../screens/dikte-kuis/DikteKuisScreen';
import { GamesScreen } from '../screens/games/GamesScreen';
import { ProfilScreen } from '../screens/profil/ProfilScreen';

const Tab = createBottomTabNavigator();

export function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Belajar"
        component={BelajarScreen}
        options={{
          tabBarLabel: 'Belajar',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.iconEmoji}>📖</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="DikteKuis"
        component={DikteKuisScreen}
        options={{
          tabBarLabel: 'Dikte & Kuis',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.iconEmoji}>📝</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarLabel: 'Games',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.iconEmoji}>🎮</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profil"
        component={ProfilScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Text style={styles.iconEmoji}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: colors.line,
    height: 70,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tabLabel: {
    fontFamily: fonts.black,
    fontSize: 12,
  },
  iconWrap: {
    width: 40,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.sunny,
    borderBottomWidth: 3,
    borderBottomColor: colors.sunnyDark,
  },
  iconEmoji: {
    fontSize: 20,
  },
});


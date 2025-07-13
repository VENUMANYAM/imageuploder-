import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StatusBar, Text, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from './src/screens/HomeScreen';
import S3Screen from './src/screens/S3Screen';

const Tab = createMaterialTopTabNavigator();

export default function App() {
  return (
      <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#6a11cb" />
      <View style={{ flex: 1 }}>
        <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.header}>
          <View style={styles.spacer} />
          <Text style={styles.headerTitle}>AWS Uploader</Text>
          <View style={styles.spacer} />
        </LinearGradient>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#555',
            tabBarLabelStyle: { fontSize: 15, fontWeight: '600' },
            tabBarIndicatorStyle: { backgroundColor: '#007AFF', height: 3, borderRadius: 2 },
            tabBarStyle: { backgroundColor: '#f9f9f9', elevation: 2 },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'HOME' }} />
          <Tab.Screen name="S3Screen" component={S3Screen} options={{ tabBarLabel: 'AWS S3' }} />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  spacer: { width: 26 },
});

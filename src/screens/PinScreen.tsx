import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const PinScreen = ({ navigation }: any) => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [mode, setMode] = useState<'SETUP' | 'VERIFY'>('VERIFY');

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    const storedPin = await AsyncStorage.getItem('@user_pin');
    if (!storedPin) {
      setMode('SETUP'); // First time login
    } else {
      setSavedPin(storedPin);
      setMode('VERIFY'); // Returning user
    }
  };

  const handlePress = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (mode === 'SETUP') {
          // Save the new PIN securely
          await AsyncStorage.setItem('@user_pin', newPin);
          Alert.alert("Success", "PIN Set Successfully!");
          navigation.replace('Dashboard');
        } else {
          // Verify against saved PIN
          if (newPin === savedPin) {
            navigation.replace('Dashboard');
          } else {
            Alert.alert("Error", "Incorrect PIN!");
            setPin(''); // Reset on fail
          }
        }
      }
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="shield" size={40} color={COLORS.primary} />
        <Text style={styles.title}>{mode === 'SETUP' ? 'Create a 4-Digit PIN' : 'Enter Your Secure PIN'}</Text>
        <Text style={styles.subtitle}>{mode === 'SETUP' ? 'This keeps your offline wallet safe.' : 'Unlock your wallet'}</Text>
      </View>

      <View style={styles.dotsContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.dot, pin.length >= i && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <TouchableOpacity key={num} style={styles.key} onPress={() => handlePress(num)}>
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.key} />
        <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={handleDelete}>
          <Feather name="delete" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 15 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  dotsContainer: { flexDirection: 'row', marginBottom: 60 },
  dot: { width: 15, height: 15, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, marginHorizontal: 10 },
  dotActive: { backgroundColor: COLORS.primary },
  keypad: { width: '80%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: { width: '30%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', margin: '1.5%', borderRadius: 50, backgroundColor: '#f5f5f5' },
  keyText: { fontSize: 24, fontWeight: 'bold', color: '#333' }
});
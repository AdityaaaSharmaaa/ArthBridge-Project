import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';

export const ReceiveScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  // A permanent payload representing this user's receiving address
  const receivePayload = JSON.stringify({
    type: "ARTHBRIDGE_RECEIVE_QR",
    userId: user?.uid,
    email: user?.email
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Receive Money</Text>
        <View style={{width: 24}}/>
      </View>

      <View style={styles.content}>
        <View style={styles.qrCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{user?.email?.split('@')[0]}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            
            <View style={styles.qrWrapper}>
                <QRCode value={receivePayload} size={220} color="#1E293B" backgroundColor="#fff" />
            </View>
            
            <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.badgeText}>Verified ArthBridge Account</Text>
            </View>
        </View>

        <Text style={styles.helperText}>Any ArthBridge user can scan this QR code to instantly transfer funds to your wallet.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 20, alignItems: 'center' },
  
  qrCard: { backgroundColor: '#fff', width: '100%', padding: 30, borderRadius: 32, alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 20, shadowOffset: {width: 0, height: 10} },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  email: { fontSize: 14, color: '#64748B', marginBottom: 30 },
  
  qrWrapper: { padding: 15, backgroundColor: '#fff', borderRadius: 24, borderWidth: 2, borderColor: '#F1F5F9', marginBottom: 30 },
  
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: '#10B981', fontWeight: '700', fontSize: 13, marginLeft: 6 },
  
  helperText: { textAlign: 'center', color: '#64748B', fontSize: 14, marginTop: 30, paddingHorizontal: 20, lineHeight: 22 }
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileModal } from '../components/ProfileModal';
import { useAuth } from '../context/AuthContext';
import { RealmContextObj } from '../models/RealmContext';
import { useTheme } from '../context/ThemeContext';

const { useQuery } = RealmContextObj;

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme(); 
  const transactions = useQuery('Transaction');
  const [profileVisible, setProfileVisible] = useState(false);

  let balance = 0; let txCount = transactions.length;
  transactions.forEach((tx: any) => {
    if (tx.type === 'debit') balance += tx.amount; 
    if (tx.type === 'credit') balance -= tx.amount; 
  });
  const displayBalance = `₹${Math.max(0, balance).toFixed(2)}`;
  
  const trustScore = Math.min(850, 650 + (txCount * 5)); 
  const scoreColor = trustScore > 750 ? theme.success : (trustScore > 650 ? theme.warning : theme.danger);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View>
            <Text style={[styles.greeting, { color: theme.subText }]}>Good Morning,</Text>
            <Text style={[styles.userName, { color: theme.text }]}>{user?.email?.split('@')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileVisible(true)} style={[styles.avatarBtn, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <Text style={[styles.avatarText, { color: theme.text }]}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          <View style={[styles.banner, { backgroundColor: theme.primary }]}>
            <View style={styles.bannerTopRow}>
                <Text style={styles.bannerTitle}>ArthBridge Balance</Text>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.bannerAmount, { color: theme.primaryText }]}>{displayBalance}</Text>
            <View style={styles.bannerActionRow}>
                <TouchableOpacity style={[styles.bannerBtnPrimary, { backgroundColor: theme.primaryText }]} onPress={() => navigation.navigate('Wallet')}>
                    <Text style={[styles.bannerBtnTextPrimary, { color: theme.primary }]}>Add Money</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bannerBtnSecondary} onPress={() => navigation.navigate('Pay')}>
                    <Text style={styles.bannerBtnTextSecondary}>Pay Offline</Text>
                </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.trustScoreCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.trustScoreHeader}>
                  <MaterialCommunityIcons name="shield-star" size={24} color={scoreColor} />
                  <Text style={[styles.trustScoreTitle, { color: theme.text }]}>ArthBridge Trust Score</Text>
              </View>
              <View style={styles.trustScoreRow}>
                  <Text style={[styles.trustScoreValue, { color: scoreColor }]}>{trustScore}</Text>
                  <View style={[styles.trustScoreBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <Text style={[styles.trustScoreBadgeText, { color: theme.text }]}>
                          {trustScore > 750 ? 'Excellent' : (trustScore > 650 ? 'Good' : 'Needs Work')}
                      </Text>
                  </View>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.cardAlt }]}>
                  <View style={[styles.progressBarFill, { width: `${(trustScore / 850) * 100}%`, backgroundColor: scoreColor }]} />
              </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Access</Text>
          <View style={styles.grid}>
            <ActionBox theme={theme} icon="scan" title="Scan QR" color={theme.success} onPress={() => navigation.navigate('Scanner')} />
            <ActionBox theme={theme} icon="qr-code" title="My QR" color={theme.accent} onPress={() => navigation.navigate('Receive')} />
            <ActionBox theme={theme} icon="book" title="Passbook" color={theme.warning} onPress={() => navigation.navigate('Ledger')} />
            <ActionBox theme={theme} icon="send" title="Send" color="#8B5CF6" onPress={() => Alert.alert("Coming Soon")} />
          </View>

          {/* MISSING SECTION RESTORED HERE */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Village Ecosystem</Text>
          <View style={styles.servicesContainer}>
            <ServiceCard theme={theme} icon="shopping-bag" title="Village Marketplace" subtitle="Buy and sell surplus crops locally" color="#EC4899" onPress={() => navigation.navigate('FlashSale')} />
            <ServiceCard theme={theme} icon="users" title="Community Co-op" subtitle="Lend or request micro-loans securely" color="#06B6D4" onPress={() => navigation.navigate('Sahayata')} />
          </View>

        </ScrollView>
        <ProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

const ActionBox = ({ icon, title, color, onPress, theme }: any) => (
  <TouchableOpacity style={styles.actionBox} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <Text style={[styles.actionText, { color: theme.subText }]}>{title}</Text>
  </TouchableOpacity>
);

const ServiceCard = ({ icon, title, subtitle, color, onPress, theme }: any) => (
  <TouchableOpacity style={[styles.serviceCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onPress}>
    <View style={[styles.serviceIcon, { backgroundColor: color + '15' }]}>
      <Feather name={icon} size={24} color={color} />
    </View>
    <View style={styles.serviceTextContainer}>
      <Text style={[styles.serviceTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.serviceSub, { color: theme.subText }]}>{subtitle}</Text>
    </View>
    <Feather name="chevron-right" size={20} color={theme.subText} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1 }, container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 20 },
  greeting: { fontSize: 14, fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  avatarBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  avatarText: { fontSize: 20, fontWeight: 'bold' },
  banner: { padding: 24, borderRadius: 24, elevation: 8 },
  bannerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  bannerAmount: { fontSize: 42, fontWeight: '800', marginVertical: 12, letterSpacing: -1 },
  bannerActionRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  bannerBtnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  bannerBtnTextPrimary: { fontWeight: '700', fontSize: 15 },
  bannerBtnSecondary: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  bannerBtnTextSecondary: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  trustScoreCard: { marginTop: 20, padding: 20, borderRadius: 24, borderWidth: 1, elevation: 2 },
  trustScoreHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  trustScoreTitle: { flex: 1, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  trustScoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  trustScoreValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  trustScoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  trustScoreBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 32, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionBox: { width: '22%', alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { fontSize: 13, textAlign: 'center', fontWeight: '600' },
  servicesContainer: { gap: 12 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, elevation: 1 },
  serviceIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  serviceTextContainer: { flex: 1, marginLeft: 16 },
  serviceTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  serviceSub: { fontSize: 13 }
});
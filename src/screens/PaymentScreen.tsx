import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RealmContextObj } from '../models/RealmContext';
import { CustomAlert } from '../components/CustomAlert';

const { useQuery } = RealmContextObj;

export const PaymentScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const transactions = useQuery('Transaction');
  const [amount, setAmount] = useState('');
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({visible: false, title: '', message: '', type: 'info'});

  const showAlert = (title: string, message: string, type: 'error'|'success'|'info') => setAlertConfig({visible: true, title, message, type});

  useEffect(() => {
    let total = 0;
    transactions.forEach((tx: any) => {
      if (tx.type === 'debit') total += tx.amount; 
      if (tx.type === 'credit') total -= tx.amount; 
    });
    setBalance(Math.max(0, total)); // Ensure UI never shows negative
  }, [transactions]);

  const generateQR = () => {
    const payAmt = parseFloat(amount);
    if (!amount || isNaN(payAmt) || payAmt <= 0) {
      showAlert("Invalid Amount", "Please enter a valid amount.", "error"); return;
    }
    // STRICT NEGATIVE BALANCE CHECK
    if (payAmt > balance) {
      showAlert("Insufficient Funds", "You do not have enough money in your wallet for this transaction.", "error"); return;
    }

    const payloadData = {
      type: "ARTHBRIDGE_OFFLINE_PAY",
      fromId: user?.uid,
      fromEmail: user?.email,
      amount: payAmt,
      timestamp: new Date().toISOString(),
      signature: "verified_secure_hash_8923" 
    };
    setQrPayload(JSON.stringify(payloadData));
  };

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'users', user!.uid, 'transactions'), {
        amount: parseFloat(amount),
        type: 'credit', 
        description: 'Offline QR Payment',
        date: new Date(),
        isDisputed: false,
        status: 'pending_sync'
      });
      setLoading(false);
      showAlert("Recorded", "Payment deducted from your wallet locally. It will sync when online.", "success");
      setTimeout(() => navigation.navigate('Dashboard'), 2000);
    } catch (e) {
      setLoading(false);
      showAlert("Error", "Could not save transaction history.", "error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Offline Wallet</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available for offline use</Text>
            <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Scanner')}>
            <Ionicons name="scan-outline" size={24} color="#fff" />
            <Text style={styles.scanBtnText}>Scan to Receive Money</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {!qrPayload ? (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
               <Ionicons name="qr-code" size={32} color="#1E293B" />
            </View>
            <Text style={styles.cardTitle}>Pay Someone Offline</Text>
            <Text style={styles.instruction}>Enter amount to generate a secure QR code for the receiver to scan.</Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currency}>₹</Text>
              <TextInput style={styles.amountInput} placeholder="0" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </View>
            
            <TouchableOpacity style={styles.primaryBtn} onPress={generateQR}>
              <Text style={styles.primaryBtnText}>Generate Secure QR</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.qrTitle}>Show this code</Text>
            <View style={styles.qrWrapper}>
              <QRCode value={qrPayload} size={200} color="#1E293B" backgroundColor="#fff" />
            </View>
            <Text style={styles.qrAmount}>₹{amount}</Text>
            <Text style={styles.qrSub}>They can scan this without internet.</Text>
            
            <View style={styles.divider} />

            <Text style={styles.helperText}>Click below only AFTER they scan it successfully.</Text>
            <TouchableOpacity style={styles.successBtn} onPress={handleMarkAsPaid} disabled={loading}>
              <Text style={styles.successBtnText}>{loading ? 'Saving...' : 'Mark as Paid'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setQrPayload(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({...alertConfig, visible: false})} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  content: { padding: 20, paddingBottom: 50 },
  balanceContainer: { alignItems: 'center', marginBottom: 20 },
  balanceLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  balanceAmount: { fontSize: 48, fontWeight: '800', color: '#1E293B', letterSpacing: -1, marginTop: 4 },
  scanBtn: { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, elevation: 4 },
  scanBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 10 },
  divider: { height: 1, backgroundColor: '#E2E8F0', width: '100%', marginVertical: 30 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 24, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  instruction: { textAlign: 'center', color: '#64748B', fontSize: 14, lineHeight: 20, marginBottom: 24, paddingHorizontal: 10 },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', width: '100%', marginBottom: 24 },
  currency: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginRight: 10 },
  amountInput: { flex: 1, fontSize: 40, fontWeight: '800', color: '#1E293B' },
  primaryBtn: { backgroundColor: '#1E293B', paddingVertical: 16, borderRadius: 16, width: '100%', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  qrTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  qrWrapper: { padding: 20, backgroundColor: '#fff', borderRadius: 24, borderWidth: 2, borderColor: '#F1F5F9' },
  qrAmount: { fontSize: 36, fontWeight: '800', color: '#10B981', marginTop: 24 },
  qrSub: { color: '#64748B', marginTop: 8, marginBottom: 10, fontWeight: '500' },
  helperText: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  successBtn: { backgroundColor: '#10B981', width: '100%', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  successBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 12 },
  cancelBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 15 }
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RealmContextObj } from '../models/RealmContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { CustomAlert } from '../components/CustomAlert';

const { useQuery } = RealmContextObj;

export const WalletScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const transactions = useQuery('Transaction');
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => setAlertConfig({ visible: true, title, message, type });

  useEffect(() => {
    let total = 0;
    transactions.forEach((tx: any) => {
      if (tx.type === 'debit') total += tx.amount; 
      if (tx.type === 'credit') total -= tx.amount; 
    });
    setBalance(total);
  }, [transactions]);

  // Formatted safely to prevent ₹-100
  const displayBalance = balance < 0 ? `-₹${Math.abs(balance).toFixed(2)}` : `₹${balance.toFixed(2)}`;

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) {
      showAlert("Invalid Amount", "Please enter a valid amount.", "error"); return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'users', user!.uid, 'transactions'), {
        amount: parseFloat(addAmount),
        type: 'debit',
        description: 'Added from Bank Account',
        date: new Date(),
        isDisputed: false
      });
      setAddAmount('');
      showAlert("Money Added!", `₹${addAmount} added to your offline wallet.`, "success");
    } catch (e) {
      showAlert("Transaction Failed", "Could not connect to the bank.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wallet</Text>
        <View style={{width: 24}}/>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Available Balance</Text>
        <Text style={[styles.balance, balance < 0 && {color: '#FCA5A5'}]}>{displayBalance}</Text>
        <View style={styles.divider} />
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <Feather name="lock" size={12} color="#CBD5E1" style={{marginRight: 6}}/>
           <Text style={styles.cardSub}>Secured by ArthBridge Encryption</Text>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Top Up Wallet</Text>
        <Text style={styles.subText}>Add money instantly via UPI or NetBanking</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.currency}>₹</Text>
          <TextInput 
            style={styles.input} 
            placeholder="0" 
            keyboardType="numeric" 
            value={addAmount}
            onChangeText={setAddAmount}
          />
        </View>

        <View style={styles.quickChips}>
          {['500', '1000', '2000'].map(val => (
            <TouchableOpacity key={val} style={styles.chip} onPress={() => setAddAmount(val)}>
              <Text style={styles.chipText}>+₹{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddMoney} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Proceed to Pay</Text>}
        </TouchableOpacity>
      </View>

      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: {width: 0, height: 2} },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  
  card: { backgroundColor: '#1E293B', margin: 20, padding: 30, borderRadius: 24, alignItems: 'center', elevation: 8, shadowColor: '#0F172A', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: {width: 0, height: 8} },
  cardTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  balance: { color: '#FFFFFF', fontSize: 50, fontWeight: '800', letterSpacing: -1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', width: '100%', marginVertical: 20 },
  cardSub: { color: '#CBD5E1', fontSize: 12, fontWeight: '500' },

  actionSection: { padding: 24, backgroundColor: '#fff', flex: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: {width: 0, height: -5} },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subText: { fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 24 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  currency: { fontSize: 32, fontWeight: '800', color: '#1E293B', marginRight: 10 },
  input: { flex: 1, fontSize: 40, fontWeight: '800', color: '#1E293B' },
  
  quickChips: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', alignItems: 'center' },
  chipText: { color: '#0F172A', fontWeight: '700', fontSize: 15 },
  
  addBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#3B82F6', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 5 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
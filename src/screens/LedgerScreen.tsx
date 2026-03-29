import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, KeyboardAvoidingView, Modal, ActivityIndicator } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RealmContextObj } from '../models/RealmContext';
import { useAuth } from '../context/AuthContext';
import { CustomAlert } from '../components/CustomAlert';

const { useQuery } = RealmContextObj;

export const LedgerScreen = ({ navigation }: any) => {
  const transactions = useQuery('Transaction');
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [balance, setBalance] = useState(0);
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({ visible: false, title: '', message: '', type: 'info' });

  // AI MODAL STATE
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => setAlertConfig({ visible: true, title, message, type });

  useEffect(() => {
    let total = 0;
    transactions.forEach((tx: any) => {
      if (tx.type === 'debit') total += tx.amount; 
      if (tx.type === 'credit') total -= tx.amount; 
    });
    setBalance(Math.max(0, total));
  }, [transactions]);

  const addTransaction = async (type: 'credit' | 'debit') => {
    const payAmt = parseFloat(amount);
    if (!amount || isNaN(payAmt) || payAmt <= 0) {
        showAlert("Wait", "Please enter a valid amount.", "error"); return;
    }
    if (type === 'credit' && payAmt > balance) {
        showAlert("Insufficient Funds", "You do not have enough money to send this.", "error"); return;
    }
    try {
      await addDoc(collection(db, 'users', user!.uid, 'transactions'), {
        amount: payAmt,
        type: type,
        description: desc || (type === 'credit' ? 'Paid Out' : 'Received In'),
        date: new Date(),
        isDisputed: false,
        status: 'completed' 
      });
      setAmount(''); setDesc('');
    } catch (error) {
      showAlert("Error", "Could not save to Cloud", "error");
    }
  };

  // THE AI ANALYSIS ENGINE (Simulated Local LLM)
  const runAiAnalysis = () => {
      setAiModalVisible(true);
      setIsAiLoading(true);

      // Simulate network delay for AI thinking
      setTimeout(() => {
          let spent = 0;
          let received = 0;
          transactions.forEach((tx: any) => {
              if(tx.type === 'credit') spent += tx.amount;
              if(tx.type === 'debit') received += tx.amount;
          });

          let health = "Neutral";
          let healthColor = "#F59E0B";
          let advice = "Keep tracking your expenses to build a strong financial history.";

          if (received > spent * 1.5) {
              health = "Excellent"; healthColor = "#10B981";
              advice = "Your cash inflow is great! Consider investing surplus funds in the Community Co-op to earn interest.";
          } else if (spent > received) {
              health = "Warning"; healthColor = "#EF4444";
              advice = "You are spending more than you receive. Try to limit non-essential offline payments this week.";
          }

          setAiInsights({
              totalSpent: spent,
              totalReceived: received,
              healthStatus: health,
              healthColor: healthColor,
              aiAdvice: advice
          });
          setIsAiLoading(false);
      }, 1500); // 1.5s Fake AI Loading Delay
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title}>Passbook</Text>
          <View style={{width: 24}}/>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Record Manual Entry</Text>
          <View style={styles.row}>
            <View style={styles.amountInputContainer}>
                <Text style={styles.currency}>₹</Text>
                <TextInput style={styles.amountInput} placeholder="0" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </View>
            <TextInput style={styles.descInput} placeholder="What was this for?" value={desc} onChangeText={setDesc} />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#EF4444'}]} onPress={() => addTransaction('credit')}>
              <Feather name="arrow-up-right" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>I Gave</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#10B981'}]} onPress={() => addTransaction('debit')}>
              <Feather name="arrow-down-left" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>I Got</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.historyContainer}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                <Text style={styles.historyTitle}>Recent Activity</Text>
                
                {/* AI INSIGHTS TRIGGER BUTTON */}
                <TouchableOpacity style={styles.aiBtn} onPress={runAiAnalysis}>
                    <Ionicons name="sparkles" size={14} color="#fff" />
                    <Text style={styles.aiBtnText}>Ask AI</Text>
                </TouchableOpacity>
            </View>

            <FlatList 
              data={transactions}
              keyExtractor={(item, index) => item._id || index.toString()}
              contentContainerStyle={{ paddingBottom: 50 }}
              renderItem={({ item }) => (
                <View style={styles.transactionCard}>
                  <View style={[styles.txIcon, {backgroundColor: item.type === 'credit' ? '#FEF2F2' : '#D1FAE5'}]}>
                      <Feather name={item.type === 'credit' ? 'arrow-up-right' : 'arrow-down-left'} size={20} color={item.type === 'credit' ? '#EF4444' : '#10B981'} />
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
                    <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={{alignItems: 'flex-end'}}>
                      <Text style={[styles.txAmount, { color: item.type === 'credit' ? '#EF4444' : '#10B981' }]}>
                        {item.type === 'credit' ? '-' : '+'}₹{item.amount.toFixed(2)}
                      </Text>
                      {item.status === 'pending_sync' ? (
                          <View style={styles.statusBadgePending}>
                              <Feather name="clock" size={10} color="#F59E0B" />
                              <Text style={styles.statusTextPending}>Offline</Text>
                          </View>
                      ) : (
                          <View style={styles.statusBadgeCompleted}>
                              <Feather name="check" size={10} color="#10B981" />
                              <Text style={styles.statusTextCompleted}>Sync</Text>
                          </View>
                      )}
                  </View>
                </View>
              )}
            />
        </View>

      </KeyboardAvoidingView>

      {/* THE AI FINANCIAL ADVISOR MODAL */}
      <Modal visible={aiModalVisible} animationType="slide" transparent>
          <View style={styles.aiModalOverlay}>
              <View style={styles.aiModalContent}>
                  
                  <View style={styles.aiModalHeader}>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                          <View style={styles.aiIconBg}>
                              <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                          </View>
                          <Text style={styles.aiModalTitle}>ArthBridge AI</Text>
                      </View>
                      <TouchableOpacity onPress={() => setAiModalVisible(false)}>
                          <Feather name="x" size={24} color="#64748B" />
                      </TouchableOpacity>
                  </View>

                  {isAiLoading ? (
                      <View style={styles.aiLoadingContainer}>
                          <ActivityIndicator size="large" color="#8B5CF6" />
                          <Text style={styles.aiLoadingText}>Analyzing your local ledger...</Text>
                      </View>
                  ) : aiInsights ? (
                      <View style={styles.aiResultsContainer}>
                          
                          <View style={styles.aiStatRow}>
                              <View style={styles.aiStatBox}>
                                  <Text style={styles.aiStatLabel}>Total Received</Text>
                                  <Text style={[styles.aiStatValue, {color: '#10B981'}]}>+₹{aiInsights.totalReceived.toFixed(0)}</Text>
                              </View>
                              <View style={styles.aiStatBox}>
                                  <Text style={styles.aiStatLabel}>Total Spent</Text>
                                  <Text style={[styles.aiStatValue, {color: '#EF4444'}]}>-₹{aiInsights.totalSpent.toFixed(0)}</Text>
                              </View>
                          </View>

                          <View style={[styles.aiHealthBox, {borderColor: aiInsights.healthColor}]}>
                              <Text style={styles.aiHealthLabel}>Cashflow Status</Text>
                              <Text style={[styles.aiHealthValue, {color: aiInsights.healthColor}]}>{aiInsights.healthStatus}</Text>
                          </View>

                          <View style={styles.aiAdviceBox}>
                              <MaterialCommunityIcons name="robot-outline" size={24} color="#8B5CF6" style={{marginBottom: 8}} />
                              <Text style={styles.aiAdviceText}>{aiInsights.aiAdvice}</Text>
                          </View>

                      </View>
                  ) : null}

              </View>
          </View>
      </Modal>

      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  
  inputSection: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 24, elevation: 4, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  amountInputContainer: { flex: 0.4, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  currency: { fontSize: 18, fontWeight: '800', color: '#64748B', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '800', color: '#1E293B', paddingVertical: 12 },
  descInput: { flex: 0.6, backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 14, color: '#1E293B' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, marginLeft: 8 },

  historyContainer: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, elevation: 10 },
  historyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  
  // New AI Button Styling
  aiBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, shadowColor: '#8B5CF6', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width: 0, height: 4}, elevation: 4 },
  aiBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, marginLeft: 6 },
  
  transactionCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  txIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  txDetails: { flex: 1 },
  txDesc: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#64748B' },
  txAmount: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  statusBadgePending: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusTextPending: { color: '#F59E0B', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  statusBadgeCompleted: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusTextCompleted: { color: '#10B981', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },

  // AI Modal Styles
  aiModalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.7)', justifyContent: 'flex-end' },
  aiModalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, minHeight: 400 },
  aiModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  aiIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiModalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  aiLoadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  aiLoadingText: { marginTop: 16, color: '#8B5CF6', fontWeight: '600', fontSize: 16 },
  aiResultsContainer: { flex: 1 },
  aiStatRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  aiStatBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  aiStatLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  aiStatValue: { fontSize: 22, fontWeight: '800' },
  aiHealthBox: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiHealthLabel: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  aiHealthValue: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  aiAdviceBox: { backgroundColor: '#F3E8FF', padding: 20, borderRadius: 20 },
  aiAdviceText: { color: '#5B21B6', fontSize: 15, lineHeight: 22, fontWeight: '500' }
});
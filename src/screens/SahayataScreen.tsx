import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { CustomAlert } from '../components/CustomAlert';
import { useTheme } from '../context/ThemeContext'; // <-- Theme hook

export const SahayataScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme(); 
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => setAlertConfig({ visible: true, title, message, type });

  useEffect(() => {
    const q = query(collection(db, 'sahayata_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRequest = async () => {
      if (!amount || !reason) {
          showAlert("Error", "Please fill all details.", "error"); return;
      }
      try {
          await addDoc(collection(db, 'sahayata_requests'), {
              requesterId: user?.uid, requesterEmail: user?.email, amount: parseFloat(amount), reason: reason, status: 'OPEN', createdAt: new Date()
          });
          setModalVisible(false);
          setAmount(''); setReason('');
          showAlert("Success", "Your request is live!", "success");
      } catch (error) {
          showAlert("Error", "Could not post request.", "error");
      }
  };

  const handleHelp = async (item: any) => {
      try {
        const reqRef = doc(db, 'sahayata_requests', item.id);
        await updateDoc(reqRef, { status: 'FUNDED', lenderId: user?.uid, lenderEmail: user?.email });
        showAlert("Success!", "You have funded this request.", "success");
      } catch (error) {
        showAlert("Error", "Could not process request.", "error");
      }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Community Co-op</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
          <ActivityIndicator size="large" color="#06B6D4" style={{marginTop: 50}} />
      ) : (
          <FlatList 
            data={requests}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            renderItem={({item}) => {
                const isFunded = item.status === 'FUNDED';
                return (
                  <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, isFunded && { opacity: 0.6 }]}>
                      <View style={styles.row}>
                          <View style={styles.avatar}>
                              <Text style={{color:'#fff', fontWeight:'bold', fontSize: 18}}>{item.requesterEmail?.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View style={{flex: 1}}>
                              <Text style={[styles.userName, { color: theme.text }]}>{item.requesterEmail?.split('@')[0]}</Text>
                              <Text style={[styles.reason, { color: theme.subText }]}>{item.reason}</Text>
                          </View>
                          <Text style={[styles.amount, { color: theme.danger }]}>₹{item.amount}</Text>
                      </View>
                      
                      <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
                        <TouchableOpacity 
                            disabled={isFunded || item.requesterId === user?.uid}
                            style={[styles.helpBtn, (isFunded || item.requesterId === user?.uid) ? {backgroundColor: theme.border} : {backgroundColor: '#06B6D4'}]} 
                            onPress={() => handleHelp(item)}
                        >
                            <Text style={[styles.helpText, (isFunded || item.requesterId === user?.uid) ? {color: theme.subText} : {color: '#fff'}]}>
                                {isFunded ? (item.lenderId === user?.uid ? 'Funded by You' : 'Funded') : (item.requesterId === user?.uid ? 'Your Request' : 'Lend Money')}
                            </Text>
                        </TouchableOpacity>
                      </View>
                  </View>
                );
            }}
          />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Request Help</Text>
                  <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.subText} placeholder="Amount (₹)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                  <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.subText} placeholder="Reason (e.g., Seeds)" value={reason} onChangeText={setReason} />
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handleRequest}>
                      <Text style={{color: theme.primaryText, fontWeight: '800', fontSize: 16}}>Post Request</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{marginTop: 15, alignSelf: 'center', padding: 10}} onPress={() => setModalVisible(false)}>
                      <Text style={{color: theme.danger, fontWeight: '700', fontSize: 16}}>Cancel</Text>
                  </TouchableOpacity>
              </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({...alertConfig, visible: false})} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20 },
  backBtn: { padding: 8, borderRadius: 12, elevation: 2 },
  title: { fontSize: 20, fontWeight: '800' },
  addBtn: { padding: 10, backgroundColor: '#06B6D4', borderRadius: 12, elevation: 2 },
  card: { padding: 20, borderRadius: 24, marginBottom: 16, elevation: 3, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  userName: { fontWeight: '800', fontSize: 18 },
  reason: { fontSize: 13, marginTop: 2 },
  amount: { fontSize: 24, fontWeight: '800' },
  footerRow: { borderTopWidth: 1, paddingTop: 16 },
  helpBtn: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', width: '100%' },
  helpText: { fontWeight: '800', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { padding: 30, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  input: { borderWidth: 1, padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 16, fontWeight: '600' },
  modalBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 }
});
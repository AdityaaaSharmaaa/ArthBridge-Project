import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { CustomAlert } from '../components/CustomAlert';
import { useTheme } from '../context/ThemeContext'; // <-- Theme hook

export const FlashSaleScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme(); 
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info') => setAlertConfig({ visible: true, title, message, type });

  useEffect(() => {
    const q = query(collection(db, 'flash_sales'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePostSale = async () => {
    if (!itemName || !price || !quantity) {
      showAlert("Missing Info", "Please fill out all fields.", "error"); return;
    }
    try {
      await addDoc(collection(db, 'flash_sales'), {
        sellerId: user?.uid, sellerEmail: user?.email, itemName, price: parseFloat(price), quantity, status: 'ACTIVE', createdAt: new Date()
      });
      setItemName(''); setPrice(''); setQuantity('');
      setModalVisible(false);
      showAlert("Live!", "Your item is now on the market.", "success");
    } catch (error) {
      showAlert("Error", "Could not post sale.", "error");
    }
  };

  const handleBuy = async (item: any) => {
    try {
        const saleRef = doc(db, 'flash_sales', item.id);
        await updateDoc(saleRef, { status: 'SOLD', buyerId: user?.uid, buyerEmail: user?.email });
        showAlert("Success!", "You have purchased this item securely.", "success");
    } catch (error) {
        showAlert("Error", "Could not process the purchase.", "error");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Marketplace</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isSold = item.status === 'SOLD';
            return (
              <View style={[styles.saleCard, { backgroundColor: theme.surface, borderColor: theme.border }, isSold && { opacity: 0.6 }]}>
                <View style={styles.saleHeader}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="basket" size={20} color="#EC4899" />
                    </View>
                    <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={[styles.itemName, { color: theme.text }, isSold && { textDecorationLine: 'line-through' }]}>{item.itemName}</Text>
                        <Text style={[styles.sellerName, { color: theme.subText }]}>by {item.sellerEmail?.split('@')[0]}</Text>
                    </View>
                    <Text style={[styles.price, { color: theme.success }]}>₹{item.price}</Text>
                </View>
                
                <View style={[styles.saleFooter, { borderTopColor: theme.border }]}>
                    <Text style={[styles.quantityBadge, { backgroundColor: theme.background, color: theme.text }]}>{item.quantity}</Text>
                    <TouchableOpacity 
                        disabled={isSold || item.sellerId === user?.uid}
                        style={[styles.buyBtn, (isSold || item.sellerId === user?.uid) ? { backgroundColor: theme.border } : { backgroundColor: theme.primary }]} 
                        onPress={() => handleBuy(item)}
                    >
                        <Text style={[styles.buyBtnText, (isSold || item.sellerId === user?.uid) ? { color: theme.subText } : { color: theme.primaryText }]}>
                        {isSold ? (item.buyerId === user?.uid ? 'Purchased' : 'Sold Out') : (item.sellerId === user?.uid ? 'Your Item' : 'Buy Now')}
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
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Sell Goods</Text>
                  <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.subText} placeholder="Item Name (e.g., Wheat)" value={itemName} onChangeText={setItemName} />
                  <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.subText} placeholder="Price (₹)" keyboardType="numeric" value={price} onChangeText={setPrice} />
                  <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} placeholderTextColor={theme.subText} placeholder="Quantity (e.g., 50kg)" value={quantity} onChangeText={setQuantity} />
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary }]} onPress={handlePostSale}>
                      <Text style={{color: theme.primaryText, fontWeight: '800', fontSize: 16}}>Post to Market</Text>
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
  addBtn: { padding: 10, backgroundColor: '#EC4899', borderRadius: 12, elevation: 2 },
  saleCard: { padding: 20, borderRadius: 24, marginBottom: 16, elevation: 3, borderWidth: 1 },
  saleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FDF2F8', justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 18, fontWeight: '800' },
  sellerName: { fontSize: 13, marginTop: 2 },
  price: { fontSize: 22, fontWeight: '800' },
  saleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1 },
  quantityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, fontWeight: '700', fontSize: 12 },
  buyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  buyBtnText: { fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { padding: 30, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24 },
  input: { borderWidth: 1, padding: 16, borderRadius: 16, marginBottom: 16, fontSize: 16, fontWeight: '600' },
  modalBtn: { padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 }
});
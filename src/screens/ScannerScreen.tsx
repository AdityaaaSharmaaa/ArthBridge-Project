import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const ScannerScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera to scan Offline QR codes.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    
    try {
      // 1. Parse the Secret JSON Payload
      const payload = JSON.parse(data);

      // 2. Verify it's an ArthBridge Offline QR
      if (payload.type !== "ARTHBRIDGE_OFFLINE_PAY" || !payload.amount) {
        Alert.alert("Invalid QR", "This is not a valid ArthBridge payment code.", [
            { text: "Scan Again", onPress: () => setScanned(false) }
        ]);
        return;
      }

      if (payload.fromId === user?.uid) {
        Alert.alert("Error", "You cannot scan your own payment code.", [
            { text: "Okay", onPress: () => navigation.goBack() }
        ]);
        return;
      }

      setProcessing(true);

      // 3. THE DEFERRED SETTLEMENT MAGIC
      // We save this "Received" transaction to our Private Ledger.
      // If we are offline, Firebase caches it safely. 
      // When internet returns, it syncs to the cloud!
      await addDoc(collection(db, 'users', user!.uid, 'transactions'), {
        amount: payload.amount,
        type: 'debit', // 'debit' in our ledger means "I got money"
        description: `QR Payment from ${payload.fromEmail.split('@')[0]}`,
        date: new Date(),
        isDisputed: false,
        offlineSignature: payload.signature // Proof of transaction
      });

      setProcessing(false);
      
      Alert.alert(
        "Payment Received! 🎉", 
        `Successfully received ₹${payload.amount} from ${payload.fromEmail.split('@')[0]}.\n\n(It is saved securely in your Ledger!)`,
        [{ text: "Awesome", onPress: () => navigation.navigate('Ledger') }]
      );

    } catch (error) {
      // If JSON.parse fails, it was a regular text/link QR code
      Alert.alert("Unknown Format", "Please scan a valid ArthBridge payment QR.", [
          { text: "Scan Again", onPress: () => setScanned(false) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Offline QR</Text>
      </View>

      <View style={styles.cameraContainer}>
        {processing ? (
            <View style={styles.processingView}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.processingText}>Processing Secure Payload...</Text>
            </View>
        ) : (
            <CameraView 
                style={styles.camera} 
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                {/* Visual Scanner Overlay UI */}
                <View style={styles.overlay}>
                    <View style={styles.scanBox} />
                    <Text style={styles.scanText}>Position ArthBridge QR inside the box</Text>
                </View>
            </CameraView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.8)', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  backBtn: { marginRight: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#333' },
  permissionBtn: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8 },
  permissionBtnText: { color: '#fff', fontWeight: 'bold' },

  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: COLORS.secondary, backgroundColor: 'transparent', borderRadius: 20 },
  scanText: { color: '#fff', marginTop: 20, fontSize: 16, fontWeight: 'bold' },

  processingView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  processingText: { marginTop: 20, fontSize: 18, color: COLORS.primary, fontWeight: 'bold' }
});
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  actionText?: string;
  onAction?: () => void;
}

export const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  onClose,
  actionText = "Okay",
  onAction
}: CustomAlertProps) => {
  
  // Determine colors and icons based on the type of alert
  const getAlertConfig = () => {
    switch (type) {
      case 'success': return { color: '#4CAF50', icon: 'check-circle' };
      case 'error': return { color: COLORS.danger || '#F44336', icon: 'x-circle' };
      default: return { color: COLORS.primary, icon: 'info' };
    }
  };

  const config = getAlertConfig();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Feather name={config.icon as any} size={40} color={config.color} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: config.color }]} 
            onPress={() => {
              onClose();
              if (onAction) onAction();
            }}
          >
            <Text style={styles.buttonText}>{actionText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertBox: { width: '90%', backgroundColor: '#fff', borderRadius: 24, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  button: { width: '100%', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
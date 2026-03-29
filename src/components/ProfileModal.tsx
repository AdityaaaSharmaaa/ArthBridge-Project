import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ScrollView, Switch } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomAlert } from './CustomAlert';
import { useTheme } from '../context/ThemeContext'; // <-- IMPORT THEME

export const ProfileModal = ({ visible, onClose, navigation }: any) => {
  const { user, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme(); // <-- GET THEME
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'info'|'success'}>({visible: false, title: '', message: '', type: 'info'});

  const showAlert = (title: string, message: string, type: 'info'|'success' = 'info') => setAlertConfig({visible: true, title, message, type});

  const handleLogout = async () => { onClose(); await logout(); };

  const handleResetPin = async () => {
      await AsyncStorage.removeItem('@user_pin');
      onClose(); navigation.replace('Pin');
  };

  // Dynamic Theme Styles for the Modal
  const modalStyles = {
    bg: { backgroundColor: theme.background },
    card: { backgroundColor: theme.surface, borderColor: theme.border },
    text: { color: theme.text },
    subText: { color: theme.subText },
    iconBg: { backgroundColor: theme.cardAlt }
  };

  const OptionRow = ({ icon, title, subtitle, color = theme.text, isDestructive = false, onPress, rightElement }: any) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} disabled={!onPress}>
        <View style={[styles.optionIcon, { backgroundColor: isDestructive ? '#FEF2F2' : modalStyles.iconBg }]}>
            <Feather name={icon} size={20} color={isDestructive ? theme.danger : color} />
        </View>
        <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, modalStyles.text, isDestructive && {color: theme.danger}]}>{title}</Text>
            {subtitle && <Text style={[styles.optionSubtitle, modalStyles.subText]}>{subtitle}</Text>}
        </View>
        {rightElement ? rightElement : <Feather name="chevron-right" size={20} color={theme.subText} />}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.safeArea, modalStyles.bg]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, modalStyles.card]}>
                <Feather name="x" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, modalStyles.text]}>Settings</Text>
            <View style={{width: 40}} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.profileCard, modalStyles.card, { borderWidth: 1 }]}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>{user?.email?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.profileName, modalStyles.text]}>{user?.email?.split('@')[0]}</Text>
                <Text style={[styles.profileEmail, modalStyles.subText]}>{user?.email}</Text>
                <View style={styles.badge}>
                    <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                    <Text style={styles.badgeText}>Verified Account</Text>
                </View>
            </View>

            <Text style={[styles.sectionHeader, modalStyles.subText]}>Preferences</Text>
            <View style={[styles.optionsGroup, modalStyles.card]}>
                <OptionRow 
                    icon={isDarkMode ? "moon" : "sun"} 
                    title="Appearance" 
                    subtitle={isDarkMode ? "Dark Mode" : "Light Mode"} 
                    rightElement={<Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ true: theme.accent, false: '#CBD5E1' }} />}
                />
                <OptionRow icon="globe" title="Language" subtitle="English (Default)" onPress={() => showAlert("Language", "Regional languages coming soon.")} />
            </View>

            <Text style={[styles.sectionHeader, modalStyles.subText]}>Security</Text>
            <View style={[styles.optionsGroup, modalStyles.card]}>
                <OptionRow icon="lock" title="Change PIN" subtitle="Update your 4-digit code" onPress={handleResetPin} />
            </View>

            <View style={[styles.optionsGroup, modalStyles.card, {marginTop: 20}]}>
                <OptionRow icon="log-out" title="Secure Logout" isDestructive={true} onPress={handleLogout} />
            </View>
        </ScrollView>
      </SafeAreaView>
      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({...alertConfig, visible: false})} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  closeBtn: { padding: 8, borderRadius: 12, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 50 },
  profileCard: { padding: 30, borderRadius: 32, alignItems: 'center', marginBottom: 30, elevation: 4 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarLargeText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  profileName: { fontSize: 24, fontWeight: '800' },
  profileEmail: { fontSize: 14, marginTop: 4, marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#10B981', fontWeight: '700', fontSize: 12, marginLeft: 4 },
  sectionHeader: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginLeft: 12 },
  optionsGroup: { borderRadius: 24, padding: 8, marginBottom: 24, elevation: 2 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  optionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  optionTextContainer: { flex: 1, marginLeft: 16 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionSubtitle: { fontSize: 12, marginTop: 2 }
});
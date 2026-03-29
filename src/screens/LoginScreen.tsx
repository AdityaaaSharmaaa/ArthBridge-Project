import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // <-- NEW STATE FOR EYE BUTTON
  
  const { login, register, loading } = useAuth();
  
  const [alertConfig, setAlertConfig] = useState<{visible: boolean, title: string, message: string, type: 'error'|'success'|'info'}>({visible: false, title: '', message: '', type: 'info'});
  const showAlert = (title: string, message: string, type: 'error'|'success'|'info') => setAlertConfig({visible: true, title, message, type});

  const handleAuth = async () => {
    if (!email || !password) {
      showAlert("Missing Info", "Please enter both email and password.", "error"); return;
    }
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (error: any) {
      // Clean up Firebase error messages for the user
      let errorMsg = "Invalid credentials. Please try again.";
      if (error.code === 'auth/user-not-found') errorMsg = "No account found with this email.";
      if (error.code === 'auth/wrong-password') errorMsg = "Incorrect password.";
      if (error.code === 'auth/email-already-in-use') errorMsg = "This email is already registered.";
      
      showAlert("Authentication Failed", errorMsg, "error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        
        {/* Premium Brand Header */}
        <View style={styles.brandContainer}>
            <View style={styles.iconGlow}>
                <Ionicons name="finger-print" size={50} color="#38BDF8" />
            </View>
            <Text style={styles.brandName}>ArthBridge</Text>
            <Text style={styles.brandTagline}>Intelligent Rural Finance</Text>
        </View>

        {/* Input Card */}
        <View style={styles.formCard}>
            <Text style={styles.formTitle}>{isLogin ? 'Secure Login' : 'Create Account'}</Text>
            <Text style={styles.formSubtitle}>
                {isLogin ? 'Welcome back to your offline vault.' : 'Join the financial revolution today.'}
            </Text>

            <View style={styles.inputWrapper}>
                <Feather name="mail" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#64748B"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            {/* PASSWORD INPUT WITH EYE BUTTON */}
            <View style={styles.inputWrapper}>
                <Feather name="lock" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Master Password"
                    placeholderTextColor="#64748B"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword} // Toggles based on state
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 5 }}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth} disabled={loading}>
                {loading ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.primaryBtnText}>{isLogin ? 'Authenticate' : 'Initialize Vault'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleBtnText}>
                    {isLogin ? "New to ArthBridge? " : "Already have a vault? "}
                    <Text style={styles.toggleBtnHighlight}>{isLogin ? "Create Account" : "Log In"}</Text>
                </Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.footerText}>End-to-End Encrypted</Text>
        </View>

      </KeyboardAvoidingView>
      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({...alertConfig, visible: false})} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' }, 
  keyboardView: { flex: 1, justifyContent: 'center', padding: 24 },
  
  brandContainer: { alignItems: 'center', marginBottom: 50 },
  iconGlow: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(56, 189, 248, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', marginBottom: 20 },
  brandName: { fontSize: 36, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },
  brandTagline: { fontSize: 14, color: '#94A3B8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 },
  
  formCard: { backgroundColor: '#1E293B', padding: 30, borderRadius: 32, borderWidth: 1, borderColor: '#334155', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: {width: 0, height: 10} },
  formTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  formSubtitle: { fontSize: 14, color: '#94A3B8', marginBottom: 30 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 16, paddingVertical: 18, fontWeight: '500' },
  
  primaryBtn: { backgroundColor: '#38BDF8', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: '#38BDF8', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: {width: 0, height: 5} },
  primaryBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  
  toggleBtn: { marginTop: 24, alignItems: 'center' },
  toggleBtnText: { color: '#94A3B8', fontSize: 14 },
  toggleBtnHighlight: { color: '#38BDF8', fontWeight: 'bold' },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#10B981', fontSize: 12, fontWeight: '700', marginLeft: 6, textTransform: 'uppercase', letterSpacing: 1 }
});
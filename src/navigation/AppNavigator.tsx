import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PinScreen } from '../screens/PinScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LedgerScreen } from '../screens/LedgerScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { ReceiveScreen } from '../screens/ReceiveScreen';
import { MFIScreen } from '../screens/MFIScreen';
import { FlashSaleScreen } from '../screens/FlashSaleScreen';
import { SahayataScreen } from '../screens/SahayataScreen';
import { BankTransferScreen } from '../screens/BankTransferScreen';
import { ContactsScreen } from '../screens/ContactsScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Pin" component={PinScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} /> 
          <Stack.Screen name="Ledger" component={LedgerScreen} />
          <Stack.Screen name="Pay" component={PaymentScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} /> 
          <Stack.Screen name="Receive" component={ReceiveScreen} />
          <Stack.Screen name="MFI" component={MFIScreen} />
          <Stack.Screen name="FlashSale" component={FlashSaleScreen} />
          <Stack.Screen name="Sahayata" component={SahayataScreen} />
          <Stack.Screen name="BankTransfer" component={BankTransferScreen} />
          <Stack.Screen name="Contacts" component={ContactsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
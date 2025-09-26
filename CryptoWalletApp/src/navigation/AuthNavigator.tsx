import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { VerifyPhoneScreen } from '../screens/auth/VerifyPhoneScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { ResetPasswordConfirmScreen } from '../screens/auth/ResetPasswordConfirmScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />
      <Stack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
      />
      <Stack.Screen
        name="ResetPasswordConfirm"
        component={ResetPasswordConfirmScreen}
      />
    </Stack.Navigator>
  );
};
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const MainNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Register">
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);
export default MainNavigator;

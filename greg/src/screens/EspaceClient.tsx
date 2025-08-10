import React, { useState } from 'react';
import {View,  Text,  TextInput,  TouchableOpacity,  Image,  StyleSheet,  Alert,  ScrollView,  KeyboardAvoidingView,Platform,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RootStackParamList } from '../../App';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Offres'>;

const EspaceClient: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,"X-Client-Type": "mobile"},
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok) throw new Error(data.detail || 'Erreur de connexion');

      await AsyncStorage.setItem('access', data.access);
      await AsyncStorage.setItem('refresh', data.refresh);

      navigation.navigate('Application');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../assets/code.jpeg')} style={styles.image} />

        {/* Email input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>E-mail</Text>
          <View style={styles.inputGroup}>
            <Icon name="envelope" size={20} color="#555" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Password input */}
        <View style={[styles.inputWrapper, styles.marginTop]}>
          <Text style={styles.floatingLabel}>Mot de passe</Text>
          <View style={styles.inputGroup}>
            <Icon name="lock" size={24} color="#555" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.eyeIconContainer}
            >
              <Icon
                name={showPassword ? 'eye-slash' : 'eye'}
                size={18}
                color="#333"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        {/* Forgot password link */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0EDE5',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 40,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  marginTop: {
    marginTop: 30,
  },
  floatingLabel: {
    position: 'absolute',
    top: -35,
    left: 15,
    backgroundColor: '#F0EDE5',
    paddingHorizontal: 6,
    color: '#A45C40',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: 45,
  },
  eyeIconContainer: {
    padding: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#A45C40',
    padding: 10,
    borderRadius: 8,
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  forgotText: {
    color: '#3A3A3A',
    marginTop: 15,
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default EspaceClient;

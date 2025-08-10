import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

// Définition des props avec TypeScript
interface InputFieldProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ placeholder, value, onChangeText, secureTextEntry = false }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
  />
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default InputField;

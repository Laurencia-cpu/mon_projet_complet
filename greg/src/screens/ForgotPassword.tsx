// import React, { useState } from "react";
// import { StackNavigationProp } from '@react-navigation/stack';
// import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";


// type Props = {
//   navigation: StackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;
// };


// type RootStackParamList = {
//   ForgotPasswordScreen: undefined;
//   ResetPasswordScreen: undefined;
// };
// // const ForgotPasswordScreen = ({ navigation }) =>
// const ForgotPasswordScreen = ({ navigation }: Props) => {
//   const [email, setEmail] = useState("");

//   const handleForgotPassword = async () => {
//     try {
//       const response = await fetch("http://10.0.2.2:8000/api/passwordReset/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       if (!response.ok) {
//         throw new Error("Email manquant ou incorrect");
//       }

//       Alert.alert("Success", "Consultez votre email pour obtenir un lien de reinitialisation.");
//       navigation.navigate("ResetPasswordScreen"); 
//     } catch (error: any) {
//       Alert.alert("Error", error.message);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Entrez votre email</Text>
//       <TextInput
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Email"
//         keyboardType="email-address"
//         style={styles.input}
//       />
//       {/* <Button style={styles.button} title="Réinitialiser le mot de passe" onPress={handleForgotPassword} /> */}
//       <TouchableOpacity style={styles.submitButton} onPress={handleForgotPassword}>
//           <Text style={styles.submitButtonText}>Réinitialiser le mot de passe</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: 'rgba(162, 140, 111, 0.904)',
//   },
//   title: {
//     fontSize: 28,
//     marginBottom: 10,
//   },
//   input: {
//     width: '100%',
//     height: 40,
//     borderColor: '#000',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//   },
//   submitButton: {
//     backgroundColor: '#4F4F4F',
//     padding: 8,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 16,
//   },
// });

// export default ForgotPasswordScreen;

import React, { useState } from "react";
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;
};

type RootStackParamList = {
  ForgotPasswordScreen: undefined;
  ResetPasswordScreen: undefined;
};

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      const response = await fetch("http://10.0.2.2:8000/api/passwordReset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "mobile", // Ajout du champ source ici
        }),
      });

      if (!response.ok) {
        throw new Error("Email manquant ou incorrect");
      }

      Alert.alert("Success", "Consultez votre email pour obtenir un lien de réinitialisation.");
      navigation.navigate("ResetPasswordScreen"); 
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrez votre email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        style={styles.input}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleForgotPassword}>
        <Text style={styles.submitButtonText}>Réinitialiser le mot de passe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9E3D0', 
  },
  title: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: '#000000',  
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  input: {
    width: '100%',
    height: 45,
    borderColor: '#ffffff',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#ffffff', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 5, 
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;

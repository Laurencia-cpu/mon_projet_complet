import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
  Image, ImageBackground, ScrollView, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type NavigationProp = StackNavigationProp<RootStackParamList, 'EspaceClient'>;

const Ac = () => {
  const navigation = useNavigation<NavigationProp>();

  const [formData, setFormData] = useState({
    societe: '',
    siret: '',
    tva: '',
    adresse: '',
    telephone: '',
    email: '',
    password: '',
    retapePassword: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        Alert.alert('Champ requis', `Le champ "${key}" est requis.`);
        return;
      }
    }

    if (formData.password !== formData.retapePassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      retape_password: formData.retapePassword,
      entreprise: {
        societe: formData.societe,
        siret: formData.siret,
        tva: formData.tva,
        adresse: formData.adresse,
        telephone: formData.telephone
      }
    };

    setLoading(true);

    try {
      const response = await fetch('http://10.0.2.2:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' , "X-Client-Type": "mobile"},
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Réponse invalide du serveur');
      }

      if (response.ok) {
        Alert.alert('Succès', 'Inscription réussie !');
        setFormData({
          societe: '', siret: '', tva: '', adresse: '',
          telephone: '', email: '', password: '', retapePassword: ''
        });
        navigation.navigate('EspaceClient');
      } else {
        const firstError = Object.values(data)[0];
        const message = Array.isArray(firstError) ? firstError[0] : firstError;
        console.log('Erreur reçue du backend:', data);
        Alert.alert('Erreur', message);
      }
    } catch (error: any) {
      console.log('Erreur de requête:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const fieldsOrder = [
    'societe', 'siret', 'tva', 'adresse', 'telephone',
    'email', 'password', 'retapePassword'
  ];

  return (
    <View style={styles.bodycontaint}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ImageBackground source={require('../assets/feu.jpg')} style={styles.background} resizeMode="cover">
          <View style={styles.headflex}>
            <Image source={require('../assets/start.png')} style={styles.image} />
            <View style={styles.Fonts}>
              <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('lis')}>
                <Icon name="home" size={35} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Offres')}>
                <Icon name="eur" size={35} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Contact')}>
                <Icon name="phone" size={35} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.bodyclient}>
          <Text style={styles.redclient}>Je deviens Client</Text>
          <Text style={styles.header}>Comment ça marche ?</Text>
          {[
            "Osez passer le cap : créez votre compte en quelques clics et laissez-vous guider à travers les ijnterfaces intuitives. Le paramètrage de votre compte se fait facilement dès votre connexion",
            "Bénéficiez d'une session d'aide au paramètrage en direct avec  notre spécialiste et posez-lui vos questions. Il sera en mésure de vous apporter des réponses simple et pratiques.",
            "Assistance client illimitée et disponible par chat directement depuis notre base pour vous apporter une aide instantannée."
          ].map((text, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.redSquare} />
              <Text style={styles.text}>
                <Text style={styles.gras}>{text.split(':')[0]}</Text>{text.includes(':') ? text.split(':')[1] : ''}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.container}>
          <Text style={styles.titles}>Je m'inscris</Text>

          {fieldsOrder.map((field) => (
            <View key={field} style={styles.inputContainer}>
              <Text style={styles.label}>{field}</Text>
              <TextInput
                value={formData[field as keyof typeof formData]}
                onChangeText={(value) => handleChange(field, value)}
                style={styles.input}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                secureTextEntry={field.toLowerCase().includes('password')}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Valider</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bodycontaint: { flex: 1 },
  scrollContainer: { paddingBottom: 20 },
  background: { width: '100%', height: 200 },
  image: { width: 100, height: 60, resizeMode: 'contain', marginTop: 50 },
  headflex: {
    flexDirection: 'row',
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  Fonts: { flexDirection: 'row', position: 'absolute', right: 10, bottom: 20 },
  rond: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    marginVertical: -15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bodyclient: { padding: 20, marginBottom: 30 },
  redclient: { color: 'red', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  header: { fontSize: 22, marginBottom: 20, textTransform: 'uppercase', textAlign: 'center', color: '#333' },
  item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  redSquare: { width: 12, height: 12, backgroundColor: 'red', marginRight: 10, marginTop: 8 },
  text: { fontSize: 16, lineHeight: 24, color: '#333', flex: 1 },
  gras: { fontWeight: 'bold' },
  container: {
    padding: 20,
    backgroundColor: '#F9E3D0',
    borderRadius: 10,
    elevation: 3,
    marginHorizontal: 10,
    marginBottom: 30
  },
  titles: { fontSize: 22, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: {
    height: 45,
    borderColor: '#A45C40',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333'
  },
  submitButton: {
    backgroundColor: '#A45C40',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  }
});

export default Ac;


// // export default Ac;

// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ImageBackground } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { ScrollView } from 'react-native-gesture-handler';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../../App';

// // Définir le type de navigation
// type NavigationProp = StackNavigationProp<RootStackParamList, 'EspaceClient'>;

// const Ac = () => {
//   const navigation = useNavigation<NavigationProp>();

//   const [formData, setFormData] = useState({
//     societe: '',
//     siret: '',
//     tva: '',
//     adresse: '',
//     telephone: '',
//     email: '',
//     password: '',
//     retapePassword: '',
//   });

//   const handleChange = (name: string, value: string) => {
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async () => {
//     if (formData.password !== formData.retapePassword) {
//       Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
//       return;
//     }

//     const filter = {
//       email: formData.email,
//       password: formData.password,
//       retape_password: formData.retapePassword,
//       entreprise: {
//         societe: formData.societe,
//         siret: formData.siret,
//         tva: formData.tva,
//         adresse: formData.adresse,
//         telephone: formData.telephone
//       }
//     };

//     try {
//       console.log("Données envoyées :", filter);
//       const response = await fetch('http://10.0.2.2:8000/api/register/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(filter),
//       });

//       console.log("Réponse brute :", await response.text());
//       if (response.ok) {
//         Alert.alert('Succès', 'Données envoyées avec succès!');
//         setFormData({
//           societe: '', siret: '', tva: '', adresse: '',
//           telephone: '', email: '', password: '', retapePassword: '',
//         });
//         navigation.navigate('EspaceClient');
//       } else {
//         Alert.alert('Erreur', 'Erreur lors de l\'envoi des données.');
//       }
//     } catch (error) {
//       console.log('Erreur lors de l\'envoi :', error);
//       Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
//     }
//   };

//   return (
//     <View style={styles.bodycontaint}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <ImageBackground source={require('../assets/feu.jpg')} style={styles.background} resizeMode="cover">
//           <View style={styles.headflex}>
//             <View style={{ flex: 1 }}>
//               <Image source={require('../assets/start.png')} style={styles.image} />
//             </View>
//             <View style={styles.Fonts}>
//               <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('lis')}>
//                 <Icon name="home" size={35} color="white" />
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Offres')}>
//                 <Icon name="eur" size={35} color="white" />
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.rond} onPress={() => navigation.navigate('Contact')}>
//                 <Icon name="phone" size={35} color="white" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ImageBackground>

//         <View style={styles.bodyclient}>
//           <Text style={styles.redclient}>Je deviens Client</Text>
//           <Text style={styles.header}>Comment ça marche ?</Text>

//           <View style={styles.item}>
//             <View style={styles.redSquare} />
//             <Text style={styles.text}><Text style={styles.gras}>Osez passer le cap</Text> : créez votre compte en quelques clics...</Text>
//           </View>

//           <View style={styles.item}>
//             <View style={styles.redSquare} />
//             <Text style={styles.text}><Text style={styles.gras}>Bénéficiez d'une session d'aide...</Text></Text>
//           </View>

//           <View style={styles.item}>
//             <View style={styles.redSquare} />
//             <Text style={styles.text}><Text style={styles.gras}>Assistance client illimitée...</Text></Text>
//           </View>
//         </View>

//         <View style={styles.container}>
//           <Text style={styles.titles}>Je m'inscris</Text>

//           {Object.keys(formData).map((field) => (
//             <View key={field} style={styles.inputContainer}>
//               <Text style={styles.label}>{field}</Text>
//               <TextInput
//                 value={formData[field as keyof typeof formData]}
//                 onChangeText={(value) => handleChange(field, value)}
//                 style={styles.input}
//                 placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//                 secureTextEntry={field.toLowerCase().includes('password')}
//               />
//             </View>
//           ))}

//           <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//             <Text style={styles.submitButtonText}>Valider</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   bodycontaint: { flex: 1, height: '100%' },
//   scrollContainer: { paddingBottom: 20 },
//   background: { width: '100%', height: 200 },
//   image: { width: 100, height: 60, resizeMode: 'contain', marginTop: 50 },
//   headflex: {
//     flexDirection: 'row', height: 120, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20,
//   },
//   Fonts: { flexDirection: 'row', position: 'absolute', right: 10, bottom: 20 },
//   rond: { width: 60, height: 60, marginHorizontal: 5, marginVertical: -15, justifyContent: 'center', alignItems: 'center' },
//   bodyclient: { padding: 20, marginBottom: 30 },
//   redclient: { color: 'red', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
//   header: { fontSize: 22, marginBottom: 20, textTransform: 'uppercase', textAlign: 'center', color: '#333' },
//   item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
//   redSquare: { width: 12, height: 12, backgroundColor: 'red', marginRight: 10, marginTop: 8 },
//   text: { fontSize: 16, lineHeight: 24, color: '#333', flex: 1 },
//   gras: { fontWeight: 'bold' },
//   container: { padding: 20, backgroundColor: '#F9E3D0', borderRadius: 10, elevation: 3 },
//   titles: { fontSize: 22, marginBottom: 20, textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold' },
//   inputContainer: { marginBottom: 15 },
//   label: { fontSize: 16, marginBottom: 5, color: '#333' },
//   input: { height: 45, borderColor: '#A45C40', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 16, color: '#333' },
//   submitButton: { backgroundColor: '#A45C40', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
//   submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
// });

// export default Ac;

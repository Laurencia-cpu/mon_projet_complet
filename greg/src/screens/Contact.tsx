import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
  Linking, Button, Alert, Image, SafeAreaView, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../app';

// Karazana ho an'ny Navigation
type NavigationProp = StackNavigationProp<RootStackParamList, 'Contact'>;

// Loko ampiasaina mba ho mirindra
const theme = {
  primary: '#8B4513',      // Marron
  background: '#FFF5E1',   // Loko mazava ho an'ny fototra
  surface: '#FFFFFF',      // Fotsy ho an'ny faritra misongadina
  text: '#333333',         // Mainty antitra ho an'ny lahatsoratra
  lightText: 'gray',
  borderColor: '#DDD',
};

// Komponenta ho an'ny Header
const ContactHeader: React.FC<{ navigation: NavigationProp }> = ({ navigation }) => (
  <View style={styles.header}>
    <Image source={require('../assets/gestion.png')} style={styles.logo} />
    <View style={styles.navIcons}>
      <TouchableOpacity onPress={() => navigation.navigate('lis')}>
        <Icon name="home" size={28} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Offres')}>
        <Icon name="eur" size={28} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('EspaceClient')} style={styles.clientButton}>
        <Text style={styles.clientButtonText}>Espace Client</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Komponenta ho an'ny boaty fampahafantarana
const ContactInfoBox: React.FC = () => (
  <View style={styles.infoBox}>
    <Text style={styles.title}>Contactez-nous</Text>
    <Text style={styles.infoText}>Par e-mail pour toutes questions sur nos collaborations.</Text>
    <Text style={styles.infoText}>Par téléphone pour un RDV ou des réponses immédiates.</Text>
    <Text style={styles.infoText}>Suivez-nous sur nos réseaux sociaux pour nos actualités.</Text>
  </View>
);

// Komponenta ho an'ny Formulaire
const ContactForm: React.FC<{
  loading: boolean;
  onSubmit: () => void;
  formState: {
    nom: string; email: string; sujet: string; message: string;
  };
  setFormState: (field: string, value: string) => void;
}> = ({ loading, onSubmit, formState, setFormState }) => (
  <View style={styles.formContainer}>
    <TextInput
      style={styles.input}
      placeholder="Nom"
      value={formState.nom}
      onChangeText={(text) => setFormState('nom', text)}
    />
    <TextInput
      style={styles.input}
      placeholder="Email"
      value={formState.email}
      onChangeText={(text) => setFormState('email', text)}
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <TextInput
      style={styles.input}
      placeholder="Sujet"
      value={formState.sujet}
      onChangeText={(text) => setFormState('sujet', text)}
    />
    <TextInput
      style={[styles.input, styles.textArea]}
      placeholder="Message"
      value={formState.message}
      onChangeText={(text) => setFormState('message', text)}
      multiline
      numberOfLines={5}
    />
    <TouchableOpacity
      style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      onPress={onSubmit}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={theme.surface} />
      ) : (
        <Text style={styles.submitButtonText}>Envoyer</Text>
      )}
    </TouchableOpacity>
  </View>
);

// Komponenta ho an'ny antsipirian'ny fifandraisana
const ContactDetails: React.FC<{ openUrl: (url: string) => void }> = ({ openUrl }) => (
  <View style={styles.detailsContainer}>
    <View style={styles.detailRow}>
      <Icon name="mobile" size={24} color={theme.lightText} />
      <Text style={styles.detailText}>06 18 97 34 39</Text>
    </View>
    <View style={styles.detailRow}>
      <Icon name="map-marker" size={24} color={theme.lightText} />
      <Text style={styles.detailText}>86 rue Saint Denis, 93120 La Courneuve</Text>
    </View>
    <View style={styles.socials}>
      <TouchableOpacity onPress={() => openUrl('https://www.facebook.com/gestion.recuperation')}>
        <Icon name="facebook-square" size={35} color={theme.lightText} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openUrl('https://twitter.com/gestion.recuperation')}>
        <Icon name="twitter-square" size={35} color={theme.lightText} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => openUrl('https://www.linkedin.com/company/gestion-recuperation')}>
        <Icon name="linkedin-square" size={35} color={theme.lightText} />
      </TouchableOpacity>
    </View>
  </View>
);

// Komponenta fototra
const Contact: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });

  const handleInputChange = (field: string, value: string) => {
    setForm(prevState => ({ ...prevState, [field]: value }));
  };

  const envoyerContact = async () => {
    if (!form.nom || !form.email || !form.sujet || !form.message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const reponse = await fetch('http://10.0.2.2:8000/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "X-Client-Type": "mobile" },
        body: JSON.stringify(form),
      });

      if (reponse.ok) {
        Alert.alert('Succès', 'Message envoyé avec succès.');
        setForm({ nom: '', email: '', sujet: '', message: '' });
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de l’envoi.');
      }
    } catch (error) {
      console.error('Erreur API:', error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Erreur lors de l\'ouverture du lien', err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ContactHeader navigation={navigation} />
        <ContactInfoBox />
        <ContactForm
          loading={loading}
          onSubmit={envoyerContact}
          formState={form}
          setFormState={handleInputChange}
        />
        <ContactDetails openUrl={openUrl} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    padding: 20,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20, // Manome elanelana
  },
  clientButton: {
    backgroundColor: theme.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2, // Manome aloka kely ho an'ny Android
  },
  clientButtonText: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  // Info Box Styles
  infoBox: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  // Form Styles
  formContainer: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  input: {
    height: 50,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: theme.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0522D', // Loko maizina kokoa rehefa tsy azo tsindrina
  },
  submitButtonText: {
    color: theme.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Details Styles
  detailsContainer: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 10,
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 16,
    color: theme.text,
  },
  socials: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30, // Elanelana eo anelanelan'ny kisary
    marginTop: 10,
  },
});

export default Contact;


// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Linking, Button, Alert, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../../app';

// // Type de navigation
// type NavigationProp = StackNavigationProp<RootStackParamList, 'Contact'>;

// const Contact: React.FC = () => {
//   const navigation = useNavigation<NavigationProp>();
//   const [nom, setNom] = useState('');
//   const [email, setEmail] = useState('');
//   const [sujet, setSujet] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const envoyerContact = async () => {
//     if (!nom || !email || !sujet || !message) {
//       Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const reponse = await fetch('http://10.0.2.2:8000/api/contact/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',"X-Client-Type": "mobile"
//         },
//         body: JSON.stringify({ nom, email, sujet, message }),
//       });

//       if (reponse.ok) {
//         Alert.alert('Succès', 'Message envoyé avec succès.');
//         setNom('');
//         setEmail('');
//         setSujet('');
//         setMessage('');
//       } else {
//         Alert.alert('Erreur', 'Une erreur est survenue lors de l’envoi.');
//       }
//     } catch (error) {
//       console.error('Erreur API:', error);
//       Alert.alert('Erreur', 'Impossible de contacter le serveur.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openUrl = (url: string) => {
//     Linking.openURL(url).catch((err) => console.error('Erreur lors de l\'ouverture du lien', err));
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View style={styles.header}>
//         <Image source={require('../assets/gestion.png')} style={styles.logo} />
//         <View style={styles.navIcons}>
//           <Icon name="home" size={25} color="black" style={{ marginRight: 15 }} onPress={() => navigation.navigate('lis')} />
//           <Icon name="eur" size={25} color="black" style={{ marginRight: 15 }} onPress={() => navigation.navigate('Offres')} />
//           <TouchableOpacity onPress={() => navigation.navigate('EspaceClient')}>
//             <Text style={styles.clientButton}>Espace Client</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       <View style={styles.contactInfo}>
//         <Text style={styles.contactTitle}>Contactez-nous</Text>
//         <Text style={styles.contactText}>Par e-mail pour toutes questions sur nos collaborations</Text>
//         <Text style={styles.contactText}>Par téléphone pour un RDV ou réponses immédiates</Text>
//         <Text style={styles.contactText}>Suivez-nous sur nos réseaux sociaux pour nos actualités</Text>
//       </View>

//       <View style={styles.formContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Nom"
//           value={nom}
//           onChangeText={setNom}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Sujet"
//           value={sujet}
//           onChangeText={setSujet}
//         />
//         <TextInput
//           style={[styles.input, styles.textArea]}
//           placeholder="Message"
//           value={message}
//           onChangeText={setMessage}
//           multiline
//           numberOfLines={5}
//         />

//         <Button
//           title={loading ? 'Envoi en cours...' : 'Envoyer'}
//           onPress={envoyerContact}
//           disabled={loading}
//           color="#8B4513" // Marron
//         />
//       </View>

//       <View style={styles.contactDetails}>
//         <View style={styles.contactRow}>
//           <Text style={styles.infoText}>
//             <Icon name="mobile" size={20} color="gray" />
//             {'\n'}06 18 97 34 39
//           </Text>
//           <Text style={styles.infoText}>
//             <Icon name="map-marker" size={20} color="gray" />
//             {'\n'}86 rue Saint Denis, 93120 La Courneuve
//           </Text>
//         </View>
//         <View style={styles.socials}>
//           <TouchableOpacity onPress={() => openUrl('https://www.facebook.com/gestion.recuperation')}>
//             <Text style={styles.socialText}>
//               <Icon name="facebook-square" size={25} color="gray" />
//               {'\n'}gestion.récuperation
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => openUrl('https://twitter.com/gestion.recuperation')}>
//             <Text style={styles.socialText}>
//               <Icon name="twitter-square" size={25} color="gray" />
//               {'\n'}gestion.récuperation
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => openUrl('https://www.linkedin.com/company/gestion-recuperation')}>
//             <Text style={styles.socialText}>
//               <Icon name="linkedin-square" size={25} color="gray" />
//               {'\n'}gestion.récuperation
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     backgroundColor: '#FFF5E1', // Couleur claire pour l'arrière-plan
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 30,
//     marginVertical: 30,
//   },
//   logo: {
//     width: 120,
//     height: 30,
//     resizeMode: 'contain',
//   },
//   navIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   clientButton: {
//     backgroundColor: '#FFF',
//     color: '#8B4513', // Marron
//     fontWeight: 'bold',
//     padding: 5,
//     borderRadius: 5,
//     marginLeft: 10,
//   },
//   contactInfo: {
//     backgroundColor: '#FFF',
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   contactTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#8B4513', // Marron
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   contactText: {
//     fontSize: 16,
//     color: '#333', // Texte en couleur plus sombre pour améliorer la lisibilité
//     marginBottom: 5,
//     textAlign: 'center',
//   },
//   formContainer: {
//     backgroundColor: '#FFF',
//     padding: 20,
//     borderRadius: 10,
//   },
//   input: {
//     height: 40,
//     borderColor: '#DDD',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//     backgroundColor: '#F9F9F9',
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   contactDetails: {
//     marginTop: 30,
//     backgroundColor: '#FFF',
//     padding: 20,
//     borderRadius: 10,
//   },
//   contactRow: {
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#333', // Texte en couleur plus sombre pour une meilleure lisibilité
//     textAlign: 'center',
//   },
//   socials: {
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   socialText: {
//     fontSize: 18, // Taille augmentée pour plus de lisibilité
//     color: '#8B4513', // Marron plus foncé
//     marginBottom: 10,
//     textAlign: 'center',
//     fontWeight: 'bold', // Pour rendre le texte plus visible
//   },
// });

// export default Contact;
